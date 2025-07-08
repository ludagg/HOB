document.addEventListener('DOMContentLoaded', function () {
    if (typeof db === 'undefined') {
        console.error('Firebase db n\'est pas initialisé.');
        return;
    }

    const candidatesContainer = document.getElementById('candidates-container');
    const noCandidatesMessage = document.getElementById('no-candidates-message');
    const defaultAvatar = './assets/images/avatar/avatar1.png'; // Chemin vers un avatar par défaut

    function renderCandidateCard(candidateData) {
        const candidateUID = candidateData.uid; // L'UID du document est l'UID de l'utilisateur

        // Utiliser photoURL s'il existe, sinon l'avatar par défaut
        const avatarUrl = candidateData.photoURL || defaultAvatar;

        // Prendre les premières compétences ou un titre/description courte
        let skillsDisplay = '';
        if (candidateData.skills && candidateData.skills.length > 0) {
            skillsDisplay = candidateData.skills.slice(0, 2).join(', '); // Affiche les 2 premières compétences
        } else if (candidateData.bio) {
            skillsDisplay = candidateData.bio.substring(0, 50) + '...'; // Extrait de la bio
        } else {
            skillsDisplay = 'N/A';
        }

        // Placeholder pour le tarif horaire, à récupérer si disponible
        const hourlyRate = candidateData.hourlyRate || 'N/A'; // Supposons un champ hourlyRate

        const cardHTML = `
            <li class="candidates_item px-6 py-5 rounded-lg bg-white shadow-md duration-300 hover:shadow-xl">
                <div class="candidates_info flex gap-4 relative w-full pb-4 border-b border-line">
                    <a href="candidates-detail1.html?uid=${candidateUID}" class="overflow-hidden flex-shrink-0 w-15 h-15 rounded-full">
                        <img src="${avatarUrl}" alt="${candidateData.displayName || 'Candidate'}" class="candidates_avatar w-full h-full object-cover" />
                    </a>
                    <div class="candidates_content w-full">
                        <a href="candidates-detail1.html?uid=${candidateUID}" class="candidates_detail flex flex-col gap-1 mr-14 duration-300 hover:text-primary">
                            <strong class="candidates_name -style-1 w-fit text-title">${candidateData.displayName || 'N/A'}</strong>
                            <span class="flex items-center text-secondary">
                                <span class="ph ph-map-pin text-lg"></span>
                                <span class="candidates_address -style-1 caption1 pl-1">${candidateData.location || 'N/A'}</span>
                            </span>
                        </a>
                        <div class="flex flex-wrap items-center justify-between gap-4 mt-1">
                            <div class="flex flex-wrap items-center gap-3">
                                <!-- Statut de disponibilité à ajouter si géré -->
                                <!-- <strong class="candidates_status tag caption2 bg-background text-primary">Available now</strong> -->
                                <div class="flex items-center gap-1">
                                    <span class="ph-fill ph-star text-yellow text-sm"></span>
                                    <strong class="candidates_rate text-sm font-semibold">${candidateData.averageRating || 'N/A'}</strong>
                                    <span class="candidates_rate_quantity caption1 text-secondary">(${candidateData.reviewCount || 0} review)</span>
                                </div>
                            </div>
                            <a href="candidates-detail1.html?uid=${candidateUID}" class="button-main -border">View Profile</a>
                        </div>
                    </div>
                    <button class="add_wishlist_btn absolute top-0 right-0 -border" data-uid="${candidateUID}">
                        <span class="ph ph-heart text-xl"></span>
                        <span class="ph-fill ph-heart text-xl"></span>
                    </button>
                </div>
                <div class="candidates_more_info flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div class="flex flex-wrap items-center gap-2.5">
                        ${(candidateData.skills && candidateData.skills.length > 0) ?
                            candidateData.skills.slice(0, 3).map(skill => `<span class="candidates_tag caption1 tag bg-surface">${skill}</span>`).join('') :
                            '<span class="candidates_tag caption1 tag bg-surface">No skills listed</span>'}
                    </div>
                    <div class="candidates_price">
                        <span class="price text-title">${hourlyRate !== 'N/A' ? '$' + hourlyRate : 'N/A'}</span>
                        ${hourlyRate !== 'N/A' ? '<span class="text-secondary">/Hours</span>' : ''}
                    </div>
                </div>
            </li>
        `;
        return cardHTML;
    }

    db.collection('users').where('role', '==', 'candidate').get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                if (noCandidatesMessage) noCandidatesMessage.style.display = 'block';
                if (candidatesContainer) candidatesContainer.innerHTML = ''; // Vider au cas où
                return;
            }

            if (noCandidatesMessage) noCandidatesMessage.style.display = 'none';
            if (candidatesContainer) candidatesContainer.innerHTML = ''; // Vider avant d'ajouter

            querySnapshot.forEach(doc => {
                const candidate = doc.data();
                // L'UID du document est doc.id, qui est l'UID de l'utilisateur
                // Assurez-vous que l'objet candidateData passé à renderCandidateCard contient cet UID
                const candidateDataWithUid = { ...candidate, uid: doc.id };
                const card = renderCandidateCard(candidateDataWithUid);
                if (candidatesContainer) candidatesContainer.innerHTML += card;
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des candidats: ", error);
            if (noCandidatesMessage) {
                noCandidatesMessage.textContent = "Erreur lors du chargement des candidats.";
                noCandidatesMessage.style.display = 'block';
            }
        });
});
