document.addEventListener('DOMContentLoaded', () => {
    const servicesList = document.getElementById('services-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const errorMessage = document.getElementById('error-message');
    const pageInfo = document.getElementById('page-info');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    let services = [];
    let filteredServices = [];
    let currentPage = 1;
    const servicesPerPage = 8;

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
        servicesList.innerHTML = `
            <li class="col-span-2 flex flex-col items-center justify-center py-10">
                <span class="ph ph-spinner loading-spinner text-4xl mb-4"></span>
                <p>Chargement des services...</p>
            </li>
        `;
    }

    function renderServices(servicesToRender) {
        if (servicesToRender.length === 0) {
            servicesList.innerHTML = `
                <li class="col-span-2 text-center py-10">
                    <span class="ph ph-magnifying-glass text-4xl mb-4"></span>
                    <p>Aucun service ne correspond à votre recherche</p>
                </li>
            `;
            return;
        }

        servicesList.innerHTML = '';

        servicesToRender.forEach(service => {
            const serviceElement = `
                <li class="item h-full">
                    <div class="service_item -style-list overflow-hidden sm:flex relative h-full rounded-lg bg-white shadow-lg duration-300 hover:shadow-2xl">
                        <div class="service_thumb flex-shrink-0 relative sm:w-[44%] w-full">
                            <a href="services-detail1.html?id=${service.id}" class="block">
                                <img src="${service.coverImage || './assets/images/service/1.webp'}" alt="${service.title}" class="w-full h-full object-cover" />
                            </a>
                            <button class="add_wishlist_btn">
                                <span class="ph ph-heart text-xl"></span>
                                <span class="ph-fill ph-heart text-xl"></span>
                            </button>
                        </div>
                        <div class="service_info flex flex-col justify-between w-full py-5 px-6">
                            <div class="service_detail_info">
                                <div class="flex items-center justify-between">
                                    <a href="services-default.html" class="tag caption2 bg-surface hover:bg-primary hover:text-white">${service.category}</a>
                                    <div class="rate flex items-center gap-1">
                                        <span class="ph-fill ph-star text-yellow text-xs"></span>
                                        <strong class="service_rate text-button-sm">${service.rating?.toFixed(1) || 'N/A'}</strong>
                                        <span class="service_rate_quantity caption1 text-secondary">(${service.reviews || '0'} avis)</span>
                                    </div>
                                </div>
                                <a href="services-detail1.html?id=${service.id}" class="service_title text-title pt-2 duration-300 hover:text-primary">${service.title}</a>
                            </div>
                            <div class="service_more_info flex items-center justify-between gap-1 mt-4 pt-4 border-t border-line">
                                <a href="candidates-detail1.html?id=${service.candidateId}" class="service_author flex items-center gap-2">
                                    <img src="${service.candidatePhoto || './assets/images/avatar/IMG-1.webp'}" alt="${service.candidateName}" class="service_author_avatar w-8 h-8 rounded-full" />
                                    <span class="service_author_name -style-1">${service.candidateName}</span>
                                </a>
                                <div class="service_price whitespace-nowrap">
                                    <span class="text-secondary">From </span>
                                    <span class="price text-title">$${service.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
            servicesList.insertAdjacentHTML('beforeend', serviceElement);
        });
    }

    function filterAndSortServices() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const sortBy = sortSelect.value;

        filteredServices = services.filter(service => {
            const title = service.title.toLowerCase();
            const description = service.description.toLowerCase();
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = !category || service.category === category;
            return matchesSearch && matchesCategory;
        });

        switch (sortBy) {
            case 'price-asc':
                filteredServices.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredServices.sort((a, b) => b.price - a.price);
                break;
            case 'rating-desc':
                filteredServices.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                // Default sort by creation date
                filteredServices.sort((a, b) => {
                    const dateA = a.createdAt?.toDate() || new Date(0);
                    const dateB = b.createdAt?.toDate() || new Date(0);
                    return dateB - dateA;
                });
        }

        currentPage = 1;
        updatePagination();
        renderCurrentPage();
    }

    function renderCurrentPage() {
        const startIndex = (currentPage - 1) * servicesPerPage;
        const endIndex = startIndex + servicesPerPage;
        const servicesToRender = filteredServices.slice(startIndex, endIndex);
        renderServices(servicesToRender);
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages || 1}`;

        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
    }

    searchInput.addEventListener('input', filterAndSortServices);
    categoryFilter.addEventListener('change', filterAndSortServices);
    sortSelect.addEventListener('change', filterAndSortServices);

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
            updatePagination();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
            updatePagination();
        }
    });

    async function fetchServices() {
        renderLoading();
        try {
            const querySnapshot = await db.collection('services').get();
            services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            filteredServices = [...services];
            filterAndSortServices();
        } catch (error) {
            showError('Erreur lors du chargement des services.');
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
    fetchServices();
});
