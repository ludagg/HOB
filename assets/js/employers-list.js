document.addEventListener('DOMContentLoaded', function () {
    if (typeof db === 'undefined') {
        console.error('Firebase db n\'est pas initialisé.');
        return;
    }

    const employersContainer = document.getElementById('employers-container');
    const noEmployersMessage = document.getElementById('no-employers-message');
    const defaultLogo = './assets/images/company/1.png'; // Un logo par défaut

    function renderEmployerCard(employerData) {
        const employerUID = employerData.uid; // L'UID du document est l'UID de l'utilisateur

        const logoUrl = employerData.photoURL || defaultLogo; // photoURL peut stocker l'URL du logo
        const companyName = employerData.companyName || employerData.displayName || 'Entreprise Anonyme';
        const location = employerData.location || 'N/A';
        // Supposons un champ pour le nombre d'offres d'emploi, par exemple 'openJobsCount'
        const openJobsCount = employerData.openJobsCount || 0;

        const cardHTML = `
            <li class="employers_item flex flex-wrap items-center justify-between gap-3 p-6 rounded-lg bg-white shadow-md duration-300">
                <div class="left flex items-center gap-4">
                    <a href="employers-detail1.html?uid=${employerUID}" class="overflow-hidden block flex-shrink-0 w-15 h-15">
                        <img src="${logoUrl}" alt="${companyName} logo" class="employers_logo w-full h-full object-contain" />
                    </a>
                    <div>
                        <!-- Les étoiles de notation peuvent être ajoutées plus tard si cette fonctionnalité est implémentée pour les employeurs -->
                        <!-- <ul class="rate flex items-center mt-4"> ... </ul> -->
                        <a href="employers-detail1.html?uid=${employerUID}" class="employers_name text-title -style-1 mt-1 duration-300 hover:text-primary">${companyName}</a>
                        <div class="employers_address -style-1 text-secondary mt-1">
                            <span class="ph ph-map-pin text-lg"></span>
                            <span class="address caption1 align-top">${location}</span>
                        </div>
                    </div>
                </div>
                <div class="right flex items-center gap-4">
                    <button class="add_wishlist_btn -relative -border flex-shrink-0" data-uid="${employerUID}">
                        <span class="ph ph-heart text-xl"></span>
                        <span class="ph-fill ph-heart text-xl"></span>
                    </button>
                    <a href="employers-detail1.html?uid=${employerUID}#jobs" class="button-main -border flex-shrink-0">${openJobsCount} job openings</a>
                </div>
            </li>
        `;
        return cardHTML;
    }

    db.collection('users').where('role', '==', 'employer').get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                if (noEmployersMessage) noEmployersMessage.style.display = 'block';
                if (employersContainer) employersContainer.innerHTML = '';
                return;
            }

            if (noEmployersMessage) noEmployersMessage.style.display = 'none';
            if (employersContainer) employersContainer.innerHTML = '';

            querySnapshot.forEach(doc => {
                const employer = doc.data();
                const employerDataWithUid = { ...employer, uid: doc.id };
                const card = renderEmployerCard(employerDataWithUid);
                if (employersContainer) employersContainer.innerHTML += card;
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des employeurs: ", error);
            if (noEmployersMessage) {
                noEmployersMessage.textContent = "Erreur lors du chargement des employeurs.";
                noEmployersMessage.style.display = 'block';
            }
        });
});
