document.addEventListener('DOMContentLoaded', () => {
    const employersList = document.getElementById('employers-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const errorMessage = document.getElementById('error-message');
    const pageInfo = document.getElementById('page-info');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    let employers = [];
    let filteredEmployers = [];
    let currentPage = 1;
    const employersPerPage = 8;

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
        employersList.innerHTML = `
            <li class="col-span-2 flex flex-col items-center justify-center py-10">
                <span class="ph ph-spinner loading-spinner text-4xl mb-4"></span>
                <p>Chargement des employeurs...</p>
            </li>
        `;
    }

    function renderEmployers(employersToRender) {
        if (employersToRender.length === 0) {
            employersList.innerHTML = `
                <li class="col-span-2 text-center py-10">
                    <span class="ph ph-magnifying-glass text-4xl mb-4"></span>
                    <p>Aucun employeur ne correspond à votre recherche</p>
                </li>
            `;
            return;
        }

        employersList.innerHTML = '';

        employersToRender.forEach(employer => {
            const employerElement = `
                <li class="employers_item flex flex-wrap items-center justify-between gap-3 p-6 rounded-lg bg-white shadow-md duration-300">
                    <div class="left flex items-center gap-4">
                        <a href="employers-detail1.html?id=${employer.id}" class="overflow-hidden block flex-shrink-0 w-15 h-15">
                            <img src="${employer.photoURL || './assets/images/company/1.png'}" alt="${employer.firstName}" class="employers_logo w-full h-full object-cover" />
                        </a>
                        <div>
                            <ul class="rate flex items-center mt-4">
                                <li class="ph-fill ph-star text-yellow"></li>
                                <li class="ph-fill ph-star text-yellow"></li>
                                <li class="ph-fill ph-star text-yellow"></li>
                                <li class="ph-fill ph-star text-yellow"></li>
                                <li class="ph-fill ph-star text-yellow"></li>
                            </ul>
                            <a href="employers-detail1.html?id=${employer.id}" class="employers_name text-title -style-1 mt-1 duration-300 hover:text-primary">${employer.firstName} ${employer.lastName}</a>
                            <div class="employers_address -style-1 text-secondary mt-1">
                                <span class="ph ph-map-pin text-lg"></span>
                                <span class="address caption1 align-top">${employer.city}, ${employer.country}</span>
                            </div>
                        </div>
                    </div>
                    <div class="right flex items-center gap-4">
                        <button class="add_wishlist_btn -relative -border flex-shrink-0">
                            <span class="ph ph-heart text-xl"></span>
                            <span class="ph-fill ph-heart text-xl"></span>
                        </button>
                        <a href="employers-detail1.html?id=${employer.id}" class="button-main -border flex-shrink-0">2 job openings</a>
                    </div>
                </li>
            `;
            employersList.insertAdjacentHTML('beforeend', employerElement);
        });
    }

    function filterAndSortEmployers() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        filteredEmployers = employers.filter(employer => {
            const name = `${employer.firstName} ${employer.lastName}`.toLowerCase();
            const location = `${employer.city}, ${employer.country}`.toLowerCase();
            return name.includes(searchTerm) || location.includes(searchTerm);
        });

        switch (sortBy) {
            case 'name-asc':
                filteredEmployers.sort((a, b) => a.firstName.localeCompare(b.firstName));
                break;
            case 'name-desc':
                filteredEmployers.sort((a, b) => b.firstName.localeCompare(a.firstName));
                break;
            // Add more sorting options here if needed
        }

        currentPage = 1;
        updatePagination();
        renderCurrentPage();
    }

    function renderCurrentPage() {
        const startIndex = (currentPage - 1) * employersPerPage;
        const endIndex = startIndex + employersPerPage;
        const employersToRender = filteredEmployers.slice(startIndex, endIndex);
        renderEmployers(employersToRender);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages || 1}`;

        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    searchInput.addEventListener('input', filterAndSortEmployers);
    sortSelect.addEventListener('change', filterAndSortEmployers);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            updatePagination();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            updatePagination();
        }
    });

    async function fetchEmployers() {
        renderLoading();
        try {
            const querySnapshot = await db.collection('users').where('userType', '==', 'employer').get();
            employers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filteredEmployers = [...employers];
            filterAndSortEmployers();
        } catch (error) {
            showError('Erreur lors du chargement des employeurs.');
            console.error(error);
        }
    }

    fetchEmployers();
});
