document.addEventListener('DOMContentLoaded', function () {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase auth ou db n\'est pas initialisé.');
        return;
    }

    const dashboardTitle = document.querySelector('.content_dashboard .heading4');

    // IDs pour les compteurs
    const postedJobsCountElement = document.getElementById('posted-jobs-count');
    const postedProjectsCountElement = document.getElementById('posted-projects-count');
    const applicationsCountElement = document.getElementById('applications-count');
    const totalReviewsCountElement = document.getElementById('employer-total-reviews-count');

    auth.onAuthStateChanged(user => {
        if (user) {
            const userDocRef = db.collection('users').doc(user.uid);
            userDocRef.get().then(doc => {
                if (doc.exists && doc.data().role === 'employer') {
                    const employerData = doc.data();

                    if (dashboardTitle) {
                        dashboardTitle.textContent = `Bienvenue, ${employerData.companyName || employerData.displayName || user.email}!`;
                    }

                    // Mettre à jour les compteurs (avec des placeholders/valeurs initiales pour l'instant)
                    // Ces valeurs devront être récupérées/calculées réellement plus tard
                    if (postedJobsCountElement) postedJobsCountElement.textContent = String(employerData.postedJobsCount || 0);
                    if (postedProjectsCountElement) postedProjectsCountElement.textContent = String(employerData.postedProjectsCount || 0);
                    if (applicationsCountElement) applicationsCountElement.textContent = String(employerData.applicationsReceivedCount || 0);
                    if (totalReviewsCountElement) totalReviewsCountElement.textContent = String(employerData.totalReviews || 0);

                    // Vider les tables "Recent Applicants" et "Recent Proposals" et afficher un message
                    const recentApplicantsTableBody = document.querySelector('.recent_applicants table tbody');
                    if (recentApplicantsTableBody) {
                        recentApplicantsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-secondary">Aucun candidat récent.</td></tr>';
                    }

                    const recentProposalsTableBody = document.querySelector('.recent_proposals table tbody');
                    if (recentProposalsTableBody) {
                        recentProposalsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-secondary">Aucune proposition récente.</td></tr>';
                    }

                } else {
                    console.log('Utilisateur non employeur ou profil non trouvé, redirection...');
                    window.location.href = 'login.html';
                }
            }).catch(error => {
                console.error("Erreur lors de la récupération du profil employeur pour le dashboard:", error);
                window.location.href = 'login.html';
            });
        } else {
            console.log("Aucun utilisateur connecté, redirection vers login.html depuis employer-dashboard.js");
            window.location.href = 'login.html';
        }
    });
});
