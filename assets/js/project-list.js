document.addEventListener('DOMContentLoaded', () => {
    const projectsList = document.getElementById('project-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const errorMessage = document.getElementById('error-message');
    const pageInfo = document.getElementById('page-info');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    let projects = [];
    let filteredProjects = [];
    let currentPage = 1;
    const projectsPerPage = 8;

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
        projectsList.innerHTML = `
            <li class="col-span-2 flex flex-col items-center justify-center py-10">
                <span class="ph ph-spinner loading-spinner text-4xl mb-4"></span>
                <p>Chargement des projets...</p>
            </li>
        `;
    }

    function renderProjects(projectsToRender) {
        if (projectsToRender.length === 0) {
            projectsList.innerHTML = `
                <li class="col-span-2 text-center py-10">
                    <span class="ph ph-magnifying-glass text-4xl mb-4"></span>
                    <p>Aucun projet ne correspond à votre recherche</p>
                </li>
            `;
            return;
        }

        projectsList.innerHTML = '';

        projectsToRender.forEach(project => {
            const projectElement = `
                <li class="project_item py-5 px-6 rounded-lg bg-white duration-300 shadow-md">
                    <div class="project_innner flex max-sm:flex-col items-center justify-between xl:gap-9 gap-6 h-full">
                        <div class="project_info">
                            <a href="project-detail1.html?id=${project.id}" class="project_name heading6 duration-300 hover:underline">${project.title}</a>
                            <div class="project_related_info flex flex-wrap items-center gap-3 mt-3">
                                <div class="project_date flex items-center gap-1">
                                    <span class="ph ph-calendar-blank text-xl text-secondary"></span>
                                    <span class="caption1 text-secondary">${new Date(project.createdAt.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="ph ph-map-pin text-xl text-secondary"></span>
                                    <span class="project_address -style-1 caption1 text-secondary">${project.location}</span>
                                </div>
                            </div>
                            <p class="project_desc mt-3 text-secondary">${project.description}</p>
                            <div class="list_tag flex items-center gap-2.5 flex-wrap mt-3">
                                ${project.tags.map(tag => `<a href="project-default.html" class="project_tag tag bg-surface caption1 hover:text-white hover:bg-primary">${tag}</a>`).join('')}
                            </div>
                        </div>
                        <div class="line flex-shrink-0 w-px h-full bg-line max-sm:hidden"></div>
                        <div class="project_more_info flex flex-shrink-0 max-sm:flex-wrap sm:flex-col sm:items-end items-start sm:gap-7 gap-4 max-sm:w-full sm:h-full">
                            <button class="add_wishlist_btn -relative -border max-sm:order-1">
                                <span class="ph ph-heart text-xl"></span>
                                <span class="ph-fill ph-heart text-xl"></span>
                            </button>
                            <div class="max-sm:w-full max-sm:order-[-1]">
                                <div class="project_proposals sm:text-end">
                                    <span class="text-secondary">Proposals: </span>
                                    <span class="proposals">${project.proposalsCount || 0}</span>
                                </div>
                                <div class="project_price sm:text-end mt-1">
                                    <span class="price text-title">$${project.budget}</span>
                                    <span class="text-secondary">/fixed-price</span>
                                </div>
                            </div>
                            <a href="project-detail1.html?id=${project.id}" class="button-main -border h-fit">See more</a>
                        </div>
                    </div>
                </li>
            `;
            projectsList.insertAdjacentHTML('beforeend', projectElement);
        });
    }

    function filterAndSortProjects() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortSelect.value;

        filteredProjects = projects.filter(project => {
            const title = project.title.toLowerCase();
            const description = project.description.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = !category || project.category === category;
            return matchesSearch && matchesCategory;
        });

        switch (sortBy) {
            case 'budget-asc':
                filteredProjects.sort((a, b) => a.budget - b.budget);
                break;
            case 'budget-desc':
                filteredProjects.sort((a, b) => b.budget - a.budget);
                break;
            case 'newest':
                filteredProjects.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                break;
            case 'oldest':
                filteredProjects.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
                break;
        }

        currentPage = 1;
        updatePagination();
        renderCurrentPage();
    }

    function renderCurrentPage() {
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const projectsToRender = filteredProjects.slice(startIndex, endIndex);
        renderProjects(projectsToRender);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages || 1}`;

        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    searchInput.addEventListener('input', filterAndSortProjects);
    categoryFilter.addEventListener('change', filterAndSortProjects);
    sortSelect.addEventListener('change', filterAndSortProjects);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            updatePagination();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            updatePagination();
        }
    });

    async function fetchProjects() {
        renderLoading();
        try {
            const querySnapshot = await db.collection('projects').get();
            projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filteredProjects = [...projects];
            filterAndSortProjects();
        } catch (error) {
            showError('Erreur lors du chargement des projets.');
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
    fetchProjects();
});
