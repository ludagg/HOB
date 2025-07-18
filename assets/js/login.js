
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fonction pour récupérer la configuration Firebase
async function getFirebaseConfig() {
    const response = await fetch('/firebase-config');
    return await response.json();
}

let app, auth, db;

// Initialiser Firebase
getFirebaseConfig().then(firebaseConfig => {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Définir la persistance de session
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log("Persistance d'authentification configurée");
            // Vérifier l'état d'authentification après avoir configuré la persistance
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    redirectUser(user);
                }
            });
        })
        .catch((error) => {
            console.error("Erreur de persistance:", error);
        });
});


// Fonction pour afficher les messages
function showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alert-message');
    alertDiv.innerHTML = `
        <div class="alert alert-${type}">
            <span class="ph ph-${type === 'error' ? 'warning' : type === 'success' ? 'check-circle' : 'info'}"></span>
            ${message}
        </div>
    `;

    // Supprimer le message après 5 secondes (sauf pour le message de redirection)
    if (type !== 'success') {
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

// Fonction pour traduire les codes d'erreur Firebase
function getFirebaseErrorMessage(errorCode) {
    const messages = {
        'auth/invalid-email': 'Adresse email invalide',
        'auth/user-disabled': 'Ce compte a été désactivé',
        'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion internet.'
    };
    return messages[errorCode] || "Erreur lors de la connexion. Veuillez réessayer.";
}

// Fonction pour rediriger vers le bon tableau de bord
async function redirectUser(user) {
    const userDocRef = doc(db, "users", user.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const dashboardUrl = userData.role === 'candidate'
                ? 'candidates-dashboard.html'
                : 'employers-dashboard.html';

            showAlert(`Connexion réussie. Redirection vers votre tableau de bord...`, 'success');
            setTimeout(() => {
                window.location.href = dashboardUrl;
            }, 2000);
        } else {
            showAlert('Profil utilisateur introuvable', 'error');
            auth.signOut();
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        showAlert('Erreur lors de la récupération de votre profil', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // La vérification de l'état d'authentification est maintenant dans le .then() de setPersistence

    // Gestion du menu mobile
    const humburgerBtn = document.querySelector('.humburger_btn');
    const menuMobile = document.querySelector('.menu_mobile');
    const menuMobileClose = document.querySelector('.menu_mobile_close');

    if (humburgerBtn) {
        humburgerBtn.addEventListener('click', function () {
            menuMobile.classList.remove('hidden');
        });
    }

    if (menuMobileClose) {
        menuMobileClose.addEventListener('click', function () {
            menuMobile.classList.add('hidden');
        });
    }


    // Gestion des sous-menus mobiles
    const toggleSubmenus = document.querySelectorAll('.toggle-submenu');

    toggleSubmenus.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const submenu = this.nextElementSibling;
            submenu.classList.toggle('hidden');
        });
    });

    const backBtns = document.querySelectorAll('.back_btn');

    backBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            this.parentElement.classList.add('hidden');
        });
    });

    // Gestion du formulaire de connexion
    const loginForm = document.querySelector('.form');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                showAlert('Veuillez remplir tous les champs requis.', 'error');
                return;
            }

            // Afficher un indicateur de chargement
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="ph ph-spinner"></span> Connexion en cours...';

            // Effacer les messages précédents
            document.getElementById('alert-message').innerHTML = '';

            // Connexion avec Firebase
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    redirectUser(userCredential.user);
                })
                .catch((error) => {
                    // Gestion des erreurs
                    const errorMessage = getFirebaseErrorMessage(error.code);
                    showAlert(errorMessage, 'error');

                    // Réactiver le bouton
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    }
});
