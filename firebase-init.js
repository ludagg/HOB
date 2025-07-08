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
    const authLinksLoggedOut = document.getElementById('auth-links-logged-out');
    const authLinksLoggedIn = document.getElementById('auth-links-logged-in');
    const userDisplayNameDesktop = document.getElementById('user-display-name');
    const userAvatarImgDesktop = document.getElementById('user-avatar-img');
    const dashboardLinkDesktop = document.getElementById('dashboard-link');
    const profileLinkDesktop = document.getElementById('profile-link'); // Assuming it's always profile.html
    const logoutButtonDesktop = document.getElementById('logout-button');
    const becomeSellerOrBuyerBtn = document.getElementById('become-seller-or-buyer-btn'); // Button in header when logged in

    // Mobile auth elements
    const mobileAuthLinksLoggedOut = document.querySelectorAll('#mobile-auth-links-logged-out, #mobile-auth-links-logged-out-register');
    const mobileDashboardLinkContainer = document.getElementById('mobile-auth-links-logged-in'); // li container
    const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
    const mobileProfileLinkContainer = document.getElementById('mobile-auth-links-logged-in-profile'); // li container
    const mobileProfileLink = document.getElementById('mobile-profile-link'); // Assuming it's always profile.html
    const mobileLogoutButtonContainer = document.getElementById('mobile-auth-links-logged-in-logout'); // li container
    const mobileLogoutButton = document.getElementById('mobile-logout-button');

    if (user) {
        console.log("User connected:", user.uid);
        if (authLinksLoggedOut) authLinksLoggedOut.style.display = 'none';
        if (authLinksLoggedIn) authLinksLoggedIn.style.display = 'flex'; // Desktop

        mobileAuthLinksLoggedOut.forEach(el => el.classList.add('hidden'));
        if (mobileDashboardLinkContainer) mobileDashboardLinkContainer.classList.remove('hidden');
        if (mobileProfileLinkContainer) mobileProfileLinkContainer.classList.remove('hidden');
        if (mobileLogoutButtonContainer) mobileLogoutButtonContainer.classList.remove('hidden');


        db.collection('users').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const displayName = userData.displayName || userData.companyName || user.email;
                const photoURL = userData.photoURL || './assets/images/avatar/avatar-default.png';
                const role = userData.role;

                if (userDisplayNameDesktop) userDisplayNameDesktop.textContent = displayName;
                if (userAvatarImgDesktop) userAvatarImgDesktop.src = photoURL;

                if (dashboardLinkDesktop) {
                    dashboardLinkDesktop.href = role === 'candidate' ? 'candidates-dashboard.html' : 'employers-dashboard.html';
                }
                if (mobileDashboardLink) {
                    mobileDashboardLink.href = role === 'candidate' ? 'candidates-dashboard.html' : 'employers-dashboard.html';
                }

                // Handle "Become Seller/Buyer" or "Complete Profile" button text and link
                if (becomeSellerOrBuyerBtn) {
                    // Simple logic for now, can be expanded
                    becomeSellerOrBuyerBtn.textContent = "My Account";
                    becomeSellerOrBuyerBtn.href = "profile.html";
                }

            } else {
                // Fallback if user doc not found, though this shouldn't happen in normal flow
                if (userDisplayNameDesktop) userDisplayNameDesktop.textContent = user.email;
                if (userAvatarImgDesktop) userAvatarImgDesktop.src = './assets/images/avatar/avatar-default.png';
                if (dashboardLinkDesktop) dashboardLinkDesktop.href = 'index.html'; // Fallback
                if (mobileDashboardLink) mobileDashboardLink.href = 'index.html';
            }
        }).catch(error => {
            console.error("Error fetching user data for header:", error);
            if (userDisplayNameDesktop) userDisplayNameDesktop.textContent = user.email;
            if (userAvatarImgDesktop) userAvatarImgDesktop.src = './assets/images/avatar/avatar-default.png';
        });


        const setupLogoutHandler = (buttonElement) => {
            if (buttonElement && !buttonElement.hasAttribute('data-listener-attached')) {
                buttonElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => {
                        console.log('User signed out');
                        window.location.href = 'login.html';
                    }).catch(error => {
                        console.error('Sign out error:', error);
                    });
                });
                buttonElement.setAttribute('data-listener-attached', 'true');
            }
        };
        setupLogoutHandler(logoutButtonDesktop);
        setupLogoutHandler(mobileLogoutButton);


    } else {
        console.log("User signed out or not logged in");
        if (authLinksLoggedOut) authLinksLoggedOut.style.display = 'flex';
        if (authLinksLoggedIn) authLinksLoggedIn.style.display = 'none';

        mobileAuthLinksLoggedOut.forEach(el => el.classList.remove('hidden'));
        if (mobileDashboardLinkContainer) mobileDashboardLinkContainer.classList.add('hidden');
        if (mobileProfileLinkContainer) mobileProfileLinkContainer.classList.add('hidden');
        if (mobileLogoutButtonContainer) mobileLogoutButtonContainer.classList.add('hidden');

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const publicPages = [
            'login.html', 'register.html', 'index.html', '',
            'services-list.html', 'services-detail1.html',
            'jobs-list.html', 'jobs-detail1.html', // Assuming these will be public
            'candidates-list.html', 'candidates-detail1.html',
            'employers-list.html', 'employers-detail1.html',
            'about1.html', 'contact1.html', 'faqs.html', 'term-of-use.html', // Example static/info pages
            'freelancer2.html', 'jobs9.html' // Original template pages if still accessible for direct navigation (should be removed ideally)
        ];

        // A more robust check for protected pages
        const isProtectedPage = !publicPages.includes(currentPage) &&
                                !currentPage.startsWith('assets/') && // Ignore assets
                                !currentPage.startsWith('dist/') && // Ignore dist
                                currentPage !== 'firebase-init.js'; // Ignore self

        if (isProtectedPage) {
             console.log(`Accessing protected page "${currentPage}" while logged out. Redirecting to login.html.`);
             window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        }
    }
});

// Firestore Persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Peut-être plusieurs onglets ouverts, la persistance ne peut être activée qu'une seule fois.
        console.warn('Firestore persistence failed: Multiple tabs open?');
    } else if (err.code == 'unimplemented') {
        // Le navigateur actuel ne prend pas en charge la persistance.
        console.warn('Firestore persistence failed: Browser does not support it.');
    }
});
