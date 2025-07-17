

// Fonctions utilitaires
function showAlert(message, type = 'info') {
    const alertDiv = document.getElementById('alert-message');
    alertDiv.innerHTML = `
        <div class="alert alert-${type}">
            <span class="ph ph-${type === 'error' ? 'warning' : type === 'success' ? 'check-circle' : 'info'}"></span>
            ${message}
        </div>
    `;

    if (type !== 'success') {
        setTimeout(() => alertDiv.innerHTML = '', 5000);
    }
}

function getFirebaseErrorMessage(errorCode) {
    const messages = {
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
        'auth/invalid-email': 'Adresse email invalide',
        'auth/operation-not-allowed': 'Opération non autorisée',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
        'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion internet.'
    };
    return messages[errorCode] || "Une erreur est survenue. Veuillez réessayer.";
}

function switchTab(tabId) {
    document.querySelectorAll('.tab_list').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab_btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.getElementById(`tab_${tabId}`).classList.add('active');
}

function validatePassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        showAlert('Les mots de passe ne correspondent pas', 'error');
        return false;
    }
    if (password.length < 6) {
        showAlert('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return false;
    }
    return true;
}
function handleFormSubmit(formId, userType) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupération des valeurs du formulaire
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        // Validation
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.confirmPassword || !userData.country || !userData.city || !userData.phone || !userData.profession) {
            showAlert('Veuillez remplir tous les champs requis.', 'error');
            return;
        }
        if (!validatePassword(userData.password, userData.confirmPassword)) return;
        if (!formData.get('terms')) {
            showAlert('Vous devez accepter les conditions d\'utilisation', 'error');
            return;
        }

        // Traitement des compétences (si candidat)
        const skills = userData.skills ?
            userData.skills.split(',').map(skill => skill.trim()).filter(skill => skill) :
            [];

        // Préparation des données utilisateur avec bio intégrée
        const userProfile = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            neighborhood: userData.neighborhood || '',
            profession: userData.profession,
            skills: skills,
            // Nouvel attribut bio intégré
            bio: userType === 'candidate'
                ? "Je suis un nouveau candidat sur HoB"
                : "Je suis un nouvel employeur sur HoB",
            // Champs spécifiques aux candidats
            ...(userType === 'candidate' && {
                hourlyRate: userData.hourlyRate ? parseFloat(userData.hourlyRate) : 0,
                available: userData.available === 'on',
                rating: 0,
                reviews: 0
            }),
            photoURL: '',
            userType: userType,
            favorites: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Affichage du chargement
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="ph ph-spinner"></span> Inscription en cours...';

        try {
            // 1. Création du compte Firebase
            const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
            const userId = userCredential.user.uid;

            // 2. Enregistrement des données utilisateur avec bio intégrée
            await db.collection('users').doc(userId).set(userProfile);

            // Message de succès et redirection
            showAlert('Inscription réussie ! Redirection vers votre tableau de bord...', 'success');

            setTimeout(() => {
                window.location.href = userType === 'candidate'
                    ? 'candidates-dashboard.html'
                    : 'employers-dashboard.html';
            }, 2000);

        } catch (error) {
            // Gestion des erreurs
            showAlert(getFirebaseErrorMessage(error.code), 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Script de migration pour les utilisateurs existants
function migrateUsers() {
    db.collection('users').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const userData = doc.data();

            // Définir les valeurs par défaut pour les nouveaux champs
            const updates = {
                skills: userData.skills || [],
                hourlyRate: userData.hourlyRate || (userData.userType === 'candidate' ? 0 : null),
                available: userData.available || (userData.userType === 'candidate' ? true : null),
                rating: userData.rating || 0,
                reviews: userData.reviews || 0,
                photoURL: userData.photoURL || '',
                favorites: userData.favorites || [],
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Mettre à jour le document
            doc.ref.update(updates)
                .then(() => console.log(`User ${doc.id} updated successfully`))
                .catch((error) => console.error(`Error updating user ${doc.id}:`, error));
        });
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userType = doc.data().userType;
                        showAlert(`Vous êtes déjà connecté. Redirection vers votre tableau de bord...`, 'success');
                        setTimeout(() => {
                            window.location.href = userType === 'candidate'
                                ? 'candidates-dashboard.html'
                                : 'employers-dashboard.html';
                        }, 2000);
                    }
                });
        }
    });

    // Gestion des formulaires
    handleFormSubmit('registerFormCandidate', 'candidate');
    handleFormSubmit('registerFormEmployer', 'employer');

    // Gestion du menu mobile
    const humburgerBtn = document.querySelector('.humburger_btn');
    const menuMobile = document.querySelector('.menu_mobile');
    const menuMobileClose = document.querySelector('.menu_mobile_close');

    if (humburgerBtn) humburgerBtn.addEventListener('click', () => menuMobile.classList.remove('hidden'));
    if (menuMobileClose) menuMobileClose.addEventListener('click', () => menuMobile.classList.add('hidden'));

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

    // Exécuter la migration une fois (à décommenter si nécessaire)
    //migrateUsers();
});
