document.addEventListener('DOMContentLoaded', () => {
    const jobsList = document.getElementById('jobs-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const errorMessage = document.getElementById('error-message');
    const pageInfo = document.getElementById('page-info');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    let jobs = [];
    let filteredJobs = [];
    let currentPage = 1;
    const jobsPerPage = 10;

    function showError(message) {
        errorMessage.innerHTML = `
            <div class="alert alert-error">
                <span class="ph ph-warning-circle"></span>
                ${message}
            </div>
        `;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 5000);
    }

    function renderLoading() {
        jobsList.innerHTML = `
            <li class="col-span-full flex flex-col items-center justify-center py-10">
                <span class="ph ph-spinner loading-spinner text-4xl mb-4"></span>
                <p>Chargement des offres d'emploi...</p>
            </li>
        `;
    }

    function renderJobs(jobsToRender) {
        if (jobsToRender.length === 0) {
            jobsList.innerHTML = `
                <li class="col-span-full text-center py-10">
                    <span class="ph ph-magnifying-glass text-4xl mb-4"></span>
                    <p>Aucune offre d'emploi ne correspond à votre recherche</p>
                </li>
            `;
            return;
        }

        jobsList.innerHTML = '';

        jobsToRender.forEach(job => {
            const jobElement = `
                <li class="item">
                    <div class="jobs_item -style-list flex flex-wrap items-center justify-between gap-4 sm:px-6 px-5 py-4 border-b border-line bg-white duration-300 hover:bg-background hover:border-transparent">
                        <a href="jobs-detail1.html?id=${job.id}" class="jobs_info flex flex-wrap items-center gap-3">
                            <img src="${job.companyLogo || './assets/images/company/1.png'}" alt="${job.companyName}" class="jobs_logo w-15 h-15 flex-shrink-0" />
                            <div>
                                <span class="jobs_company text-sm font-semibold text-primary">${job.companyName}</span>
                                <strong class="jobs_name max-sm:mt-0.5 text-title duration-300 hover:text-primary">${job.title}</strong>
                            </div>
                        </a>
                        <div class="flex flex-wrap items-center gap-5 gap-y-1">
                            <div class="jobs_address -style-1 text-secondary">
                                <span class="ph ph-map-pin text-lg align-middle"></span>
                                <span class="address caption1 align-middle">${job.location}</span>
                            </div>
                            <div class="jobs_date text-secondary">
                                <span class="ph ph-calendar-blank text-lg align-middle"></span>
                                <span class="date caption1 align-middle">${new Date(job.createdAt.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="jobs_tag flex flex-wrap items-center gap-2">
                            <span class="caption1 tag bg-surface">${job.type}</span>
                            <span class="caption1 tag bg-surface">${job.category}</span>
                        </div>
                        <div class="flex flex-wrap items-center sm:gap-6 gap-4">
                            <div class="jobs_price">
                                <span class="price text-title">$${job.salaryMin} - $${job.salaryMax}</span>
                                <span class="text-secondary">/hour</span>
                            </div>
                            <button class="add_wishlist_btn -relative -border">
                                <span class="ph ph-heart text-xl"></span>
                                <span class="ph-fill ph-heart text-xl"></span>
                            </button>
                            <a href="jobs-detail1.html?id=${job.id}" class="button-main -border -small">Bid Job</a>
                        </div>
                    </div>
                </li>
            `;
            jobsList.insertAdjacentHTML('beforeend', jobElement);
        });
    }

    function filterAndSortJobs() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortSelect.value;

        filteredJobs = jobs.filter(job => {
            const title = job.title.toLowerCase();
            const company = job.companyName.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || company.includes(searchTerm);
            const matchesCategory = !category || job.category === category;
            return matchesSearch && matchesCategory;
        });

        switch (sortBy) {
            case 'newest':
                filteredJobs.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                break;
            case 'oldest':
                filteredJobs.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
                break;
            // Add more sorting options here if needed
        }

        currentPage = 1;
        updatePagination();
        renderCurrentPage();
    }

    function renderCurrentPage() {
        const startIndex = (currentPage - 1) * jobsPerPage;
        const endIndex = startIndex + jobsPerPage;
        const jobsToRender = filteredJobs.slice(startIndex, endIndex);
        renderJobs(jobsToRender);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages || 1}`;

        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    searchInput.addEventListener('input', filterAndSortJobs);
    categoryFilter.addEventListener('change', filterAndSortJobs);
    sortSelect.addEventListener('change', filterAndSortJobs);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            updatePagination();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            updatePagination();
        }
    });

    async function fetchJobs() {
        renderLoading();
        try {
            const querySnapshot = await db.collection('jobs').get();
            jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filteredJobs = [...jobs];
            filterAndSortJobs();
        } catch (error) {
            showError("Erreur lors du chargement des offres d'emploi.");
            console.error(error);
        }
    }

    async function populateCategories() {
        try {
            const categoriesSnapshot = await db.collection('categories').get();
            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error("Error populating categories:", error);
        }
    }

    populateCategories();
    fetchJobs();
});
