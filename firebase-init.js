// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmr9Nar3YdKuphgu-HW-qYeShhTk07C2c",
    authDomain: "hob-app-3530d.firebaseapp.com",
    projectId: "hob-app-3530d",
    storageBucket: "hob-app-3530d.firebasestorage.app", // Corrigé selon votre dernière information
    messagingSenderId: "207981400350",
    appId: "1:207981400350:web:15badcca0bb9808f96790f"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Vous pouvez ajouter ici d'autres services Firebase si nécessaire, par exemple :
// const storage = firebase.storage();

console.log("Firebase Core Initialized with correct storageBucket.");

// --- Gestion de l'état d'authentification ---
auth.onAuthStateChanged(user => {
    const authLinksLoggedOut = document.getElementById('auth-links-logged-out');
    const authLinksLoggedIn = document.getElementById('auth-links-logged-in');
    const userDisplayName = document.getElementById('user-display-name');
    const userAvatarImg = document.getElementById('user-avatar-img'); // Si vous avez une balise img pour l'avatar

    if (user) {
        // L'utilisateur est connecté
        console.log("Utilisateur connecté:", user.email);
        if (authLinksLoggedOut) authLinksLoggedOut.style.display = 'none';
        if (authLinksLoggedIn) authLinksLoggedIn.style.display = 'flex'; // ou 'block' selon le style
        if (userDisplayName) userDisplayName.textContent = user.email; // Ou user.displayName si défini
        if (userAvatarImg && user.photoURL) {
            userAvatarImg.src = user.photoURL;
        } else if (userAvatarImg) {
            userAvatarImg.src = './assets/images/avatar/avatar1.png'; // Avatar par défaut
        }

        // Attacher l'événement de déconnexion ici pour s'assurer qu'il n'est attaché qu'une fois que le bouton existe
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton && !logoutButton.hasAttribute('data-listener-attached')) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    console.log('Utilisateur déconnecté');
                    window.location.href = 'login.html'; // Rediriger vers la page de connexion
                }).catch(error => {
                    console.error('Erreur de déconnexion:', error);
                });
            });
            logoutButton.setAttribute('data-listener-attached', 'true');
        }

    } else {
        // L'utilisateur est déconnecté
        console.log("Utilisateur déconnecté");
        if (authLinksLoggedOut) authLinksLoggedOut.style.display = 'flex'; // ou 'block'
        if (authLinksLoggedIn) authLinksLoggedIn.style.display = 'none';
        if (userDisplayName) userDisplayName.textContent = '';

        // Redirection si sur une page protégée et non connecté
        // Exemple simple : si la page actuelle n'est ni login.html ni register.html
        const currentPage = window.location.pathname.split('/').pop();
        // Pages qui ne nécessitent PAS d'être connecté pour être vues
        const publicPages = ['login.html', 'register.html', 'index.html', '', 'freelancer2.html', 'jobs9.html']; // '' pour la racine/index.html
        // Toutes les autres pages sont considérées comme protégées par défaut si elles ne sont pas dans publicPages

        if (!publicPages.includes(currentPage) && !currentPage.startsWith('jobs') && !currentPage.startsWith('project') && !currentPage.startsWith('services') && !currentPage.startsWith('candidates-detail') && !currentPage.startsWith('employers-detail') && !currentPage.startsWith('blog')) {
            // Si la page n'est pas publique et que l'utilisateur n'est pas connecté, rediriger
             console.log(`Accès à la page potentiellement protégée ${currentPage} sans être connecté. Redirection vers login.html.`);
             window.location.href = 'login.html';
        }
    }
});

// Optionnel : Activer la persistance Firestore pour une expérience hors ligne
db.enablePersistence().catch((err) => {
    if (err.code == 'failed-precondition') {
        // Peut-être plusieurs onglets ouverts, la persistance ne peut être activée qu'une seule fois.
        console.warn('Firestore persistence failed: Multiple tabs open?');
    } else if (err.code == 'unimplemented') {
        // Le navigateur actuel ne prend pas en charge la persistance.
        console.warn('Firestore persistence failed: Browser does not support it.');
    }
});
