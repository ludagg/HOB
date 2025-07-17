
// Variables globales
let currentUser = null;
let currentUserData = null;
let candidates = [];
let filteredCandidates = [];
let currentPage = 1;
const candidatesPerPage = 8;

// Fonctions utilitaires
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = `
        <div class="alert alert-error">
            <span class="ph ph-warning-circle"></span>
            ${message}
        </div>
    `;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = `
        <div class="alert alert-success">
            <span class="ph ph-check-circle"></span>
            ${message}
        </div>
    `;
    errorDiv.classList.remove('hidden');
    setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function renderLoading() {
    const list = document.getElementById('candidates-list');
    list.innerHTML = `
        <li class="col-span-2 flex flex-col items-center justify-center py-10">
            <span class="ph ph-spinner loading-spinner text-4xl mb-4"></span>
            <p>Chargement des candidats...</p>
        </li>
    `;
}

function renderCandidates(candidatesToRender) {
    const list = document.getElementById('candidates-list');

    if (candidatesToRender.length === 0) {
        list.innerHTML = `
            <li class="col-span-2 text-center py-10">
                <span class="ph ph-magnifying-glass text-4xl mb-4"></span>
                <p>Aucun candidat ne correspond à votre recherche</p>
            </li>
        `;
        return;
    }

    list.innerHTML = '';

    candidatesToRender.forEach(candidate => {
        const isFavorite = currentUserData?.favorites?.includes(candidate.id) || false;

        const candidateElement = `
            <li class="candidates_item px-6 py-5 rounded-lg bg-white shadow-md duration-300 hover:shadow-xl">
                <div class="candidates_info flex gap-4 relative w-full pb-4 border-b border-line">
                    <a href="candidates-detail.html?id=${candidate.id}" class="overflow-hidden flex-shrink-0 w-15 h-15 rounded-full">
                        <img src="${candidate.photoURL || './assets/images/avatar/IMG-1.webp'}"
                             alt="${candidate.firstName} ${candidate.lastName}"
                             class="candidates_avatar w-full h-full object-cover" />
                    </a>
                    <div class="candidates_content w-full">
                        <a href="candidates-detail.html?id=${candidate.id}" class="candidates_detail flex flex-col gap-1 mr-14 duration-300 hover:text-primary">
                            <strong class="candidates_name -style-1 w-fit text-title">${candidate.firstName} ${candidate.lastName}</strong>
                            <span class="flex items-center text-secondary">
                                <span class="ph ph-map-pin text-lg"></span>
                                <span class="candidates_address -style-1 caption1 pl-1">
                                    ${candidate.city}, ${candidate.country}
                                </span>
                            </span>
                        </a>
                        <div class="flex flex-wrap items-center justify-between gap-4 mt-1">
                            <div class="flex flex-wrap items-center gap-3">
                                <strong class="candidates_status tag caption2 bg-background text-primary">
                                    ${candidate.available ? 'Disponible' : 'Indisponible'}
                                </strong>
                                <div class="flex items-center gap-1">
                                    <span class="ph-fill ph-star text-yellow text-sm"></span>
                                    <strong class="candidates_rate text-sm font-semibold">${candidate.rating?.toFixed(1) || 'N/A'}</strong>
                                    <span class="candidates_rate_quantity caption1 text-secondary">
                                        (${candidate.reviews || '0'} avis)
                                    </span>
                                </div>
                            </div>
                            <a href="candidates-detail.html?id=${candidate.id}" class="button-main -border">
                                Voir le profil
                            </a>
                        </div>
                    </div>
                    ${currentUserData?.userType === 'employer' ? `
                    <button class="add_wishlist_btn absolute top-0 right-0 -border ${isFavorite ? 'active' : ''}"
                            data-candidate-id="${candidate.id}">
                        <span class="ph ph-heart text-xl ${isFavorite ? 'hidden' : ''}"></span>
                        <span class="ph-fill ph-heart text-xl ${isFavorite ? '' : 'hidden'}"></span>
                    </button>
                    ` : ''}
                </div>
                <div class="candidates_more_info flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div class="flex flex-wrap items-center gap-2.5">
                        ${candidate.skills?.slice(0, 3).map(skill => `
                            <span class="candidates_tag caption1 tag bg-surface">${skill}</span>
                        `).join('')}
                        ${candidate.skills?.length > 3 ? `
                            <span class="candidates_tag caption1 tag bg-surface">+${candidate.skills.length - 3}</span>
                        ` : ''}
                    </div>
                    <div class="candidates_price">
                        <span class="price text-title">${candidate.hourlyRate || 'N/A'}</span>
                        <span class="text-secondary">/heure</span>
                    </div>
                </div>
            </li>
        `;
        list.insertAdjacentHTML('beforeend', candidateElement);
    });

    // Gestion des favoris
    document.querySelectorAll('.add_wishlist_btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!currentUser) {
                showError('Connectez-vous pour ajouter aux favoris');
                return;
            }

            const candidateId = this.getAttribute('data-candidate-id');
            const userRef = db.collection('users').doc(currentUser.uid);

            try {
                // Récupérer les favoris actuels
                const userDoc = await userRef.get();
                let favorites = userDoc.data().favorites || [];

                if (this.classList.contains('active')) {
                    // Retirer des favoris
                    favorites = favorites.filter(id => id !== candidateId);
                    await userRef.update({
                        favorites: favorites,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    this.classList.remove('active');
                    this.querySelector('.ph').classList.remove('hidden');
                    this.querySelector('.ph-fill').classList.add('hidden');
                    showSuccess('Candidat retiré des favoris');
                } else {
                    // Ajouter aux favoris
                    favorites.push(candidateId);
                    await userRef.update({
                        favorites: favorites,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    this.classList.add('active');
                    this.querySelector('.ph').classList.add('hidden');
                    this.querySelector('.ph-fill').classList.remove('hidden');
                    showSuccess('Candidat ajouté aux favoris');
                }
            } catch (error) {
                console.error("Erreur favoris:", error);
                showError('Erreur lors de la mise à jour des favoris');
            }
        });
    });
}

function filterAndSortCandidates() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const sortSelect = document.getElementById('sort-select').value;

    // Filtrage
    filteredCandidates = candidates.filter(candidate => {
        const matchesSearch =
            `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchInput) ||
            (candidate.skills && candidate.skills.some(skill => skill.toLowerCase().includes(searchInput))) ||
            `${candidate.city}, ${candidate.country}`.toLowerCase().includes(searchInput);

        return matchesSearch;
    });

    // Tri
    switch(sortSelect) {
        case 'rating-desc':
            filteredCandidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'rating-asc':
            filteredCandidates.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            break;
        case 'rate-desc':
            filteredCandidates.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
            break;
        case 'rate-asc':
            filteredCandidates.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
            break;
        default:
            // Tri par défaut (date de création)
            filteredCandidates.sort((a, b) => {
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
    const startIndex = (currentPage - 1) * candidatesPerPage;
    const endIndex = startIndex + candidatesPerPage;
    const candidatesToRender = filteredCandidates.slice(startIndex, endIndex);
    renderCandidates(candidatesToRender);
}

function updatePagination() {
    const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} sur ${totalPages || 1}`;

    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages || totalPages === 0;
}

// Événements
document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    filterAndSortCandidates();
});

document.getElementById('search-input').addEventListener('input', () => {
    filterAndSortCandidates();
});

document.getElementById('sort-select').addEventListener('change', () => {
    filterAndSortCandidates();
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
        updatePagination();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderCurrentPage();
        updatePagination();
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    renderLoading();

    // Vérifier l'authentification
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;

        if (user) {
            // Charger les données de l'utilisateur
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    currentUserData = userDoc.data();

                    // Mettre à jour l'UI
                    const userBlock = document.querySelector('.user_block');
                    if (userBlock) {
                        userBlock.style.display = 'block';
                        const userNameElement = document.querySelector('.user_name');
                        if (userNameElement) {
                            userNameElement.textContent = currentUserData.firstName || 'Utilisateur';
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur chargement utilisateur:", error);
            }
        } else {
            // Cacher le bloc utilisateur si non connecté
            const userBlock = document.querySelector('.user_block');
            if (userBlock) {
                userBlock.style.display = 'none';
            }
        }

        // Charger les candidats
        try {
            const querySnapshot = await db.collection('users')
                .where('userType', '==', 'candidate')
                .get();

            candidates = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            filteredCandidates = [...candidates];
            filterAndSortCandidates();
        } catch (error) {
            console.error("Erreur chargement candidats:", error);
            showError('Erreur lors du chargement des candidats');
            renderLoading();
        }
    });
});

// Gestion du menu mobile
const humburgerBtn = document.querySelector('.humburger_btn');
const menuMobile = document.querySelector('.menu_mobile');
const menuMobileClose = document.querySelector('.menu_mobile_close');

if (humburgerBtn) humburgerBtn.addEventListener('click', function() {
    menuMobile.classList.remove('hidden');
});

if (menuMobileClose) menuMobileClose.addEventListener('click', function() {
    menuMobile.classList.add('hidden');
});

// Gestion des sous-menus mobiles
document.querySelectorAll('.toggle-submenu').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle('hidden');
    });
});

document.querySelectorAll('.back_btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.parentElement.classList.add('hidden');
    });
});
