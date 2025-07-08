document.addEventListener('DOMContentLoaded', function () {
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase auth ou db n\'est pas initialisé.');
        // Potentiellement rediriger ou afficher un message d'erreur global
        return;
    }

    const dashboardTitle = document.querySelector('.content_dashboard .heading4'); // Cible le h4 "Dashboard"

    // IDs pour les compteurs (à vérifier/ajouter dans le HTML si nécessaire)
    const appliedJobsCountElement = document.getElementById('applied-jobs-count'); // Exemple d'ID
    const servicesOfferedCountElement = document.getElementById('services-offered-count'); // Exemple d'ID
    const viewsProfileCountElement = document.getElementById('views-profile-count'); // Exemple d'ID
    const totalReviewsCountElement = document.getElementById('total-reviews-count'); // Exemple d'ID


    auth.onAuthStateChanged(user => {
        if (user) {
            const userDocRef = db.collection('users').doc(user.uid);
            userDocRef.get().then(doc => {
                if (doc.exists && doc.data().role === 'candidate') {
                    const candidateData = doc.data();

                    // Mettre à jour le titre du dashboard
                    if (dashboardTitle) {
                        dashboardTitle.textContent = `Bienvenue, ${candidateData.displayName || user.email}!`;
                    }

                    // Mettre à jour les compteurs
                    if (appliedJobsCountElement) appliedJobsCountElement.textContent = String(candidateData.appliedJobsCount || 0);
                    if (servicesOfferedCountElement) servicesOfferedCountElement.textContent = String(candidateData.servicesOfferedCount || 0);
                    if (viewsProfileCountElement) viewsProfileCountElement.textContent = String(candidateData.profileViews || 0);
                    if (totalReviewsCountElement) totalReviewsCountElement.textContent = String(candidateData.totalReviews || 0);

                    // Vider les tables "Active Work" et "Recent service orders" et afficher un message
                    const activeWorkTableBody = document.querySelector('.active_work table tbody');
                    if (activeWorkTableBody) {
                        activeWorkTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-secondary">Aucun travail actif pour le moment.</td></tr>';
                    }

                    const recentServiceOrdersTableBody = document.querySelector('.recent_service_orders table tbody');
                    if (recentServiceOrdersTableBody) {
                        recentServiceOrdersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10 text-secondary">Aucune commande de service récente.</td></tr>';
                    }

                    // La logique pour les graphiques et les listes d'activités (Notifications)
                    // restera gérée par main.js avec des données statiques pour le moment.
                } else {
                    // Rôle incorrect ou document non trouvé
                    console.log('Utilisateur non candidat ou profil non trouvé, redirection...');
                    window.location.href = 'login.html';
                }
            }).catch(error => {
                console.error("Erreur lors de la récupération du profil candidat pour le dashboard:", error);
                window.location.href = 'login.html';
            });
        } else {
            // Utilisateur non connecté
            console.log("Aucun utilisateur connecté, redirection vers login.html depuis candidate-dashboard.js");
            window.location.href = 'login.html';
        }
    });

    // Note: Le graphique ApexCharts est initialisé dans main.js avec des données statiques.
    // Pour le rendre dynamique, il faudrait récupérer les données ici et mettre à jour le graphique.
    // Exemple (pseudo-code pour la mise à jour du graphique si ApexCharts est accessible globalement):
    /*
    if (typeof ApexCharts !== 'undefined' && ApexCharts.exec) {
        // Supposons que chart-timeline est l'ID du graphique
        // et que vous avez une fonction pour formater vos données pour ApexCharts
        const newSeriesData = formatDataForApex(candidateActivityData);
        ApexCharts.exec('chart-timeline', 'updateSeries', [{
            data: newSeriesData
        }]);
    }
    */
});
