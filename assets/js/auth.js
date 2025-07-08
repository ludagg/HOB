document.addEventListener('DOMContentLoaded', function () {
    // Assurez-vous que Firebase est initialisé (auth est défini dans firebase-init.js)
    if (typeof auth === 'undefined') {
        console.error('Firebase auth n\'est pas initialisé. Assurez-vous que firebase-init.js est chargé avant auth.js.');
        return;
    }

    // --- Gestion de la Connexion ---
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            if (loginMessage) loginMessage.textContent = ''; // Effacer les messages précédents

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Connexion réussie
                    console.log('Utilisateur connecté:', userCredential.user);
                    if (loginMessage) {
                        loginMessage.textContent = 'Connexion réussie ! Redirection...';
                        loginMessage.style.color = 'green';
                    }
                    // Rediriger vers la page d'accueil ou le tableau de bord
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error('Erreur de connexion:', error);
                    if (loginMessage) {
                        loginMessage.textContent = 'Erreur de connexion : ' + error.message;
                        loginMessage.style.color = 'red';
                    }
                });
        });
    }

    // --- Gestion de l'Inscription (Candidat) ---
    const registerCandidateForm = document.getElementById('register-candidate-form');
    const registerCandidateMessage = document.getElementById('register-candidate-message');

    if (registerCandidateForm) {
        registerCandidateForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = registerCandidateForm.email.value;
            const password = registerCandidateForm.password.value;
            const confirmPassword = registerCandidateForm.confirmPassword.value;
            const termsAccepted = registerCandidateForm.terms.checked;

            if (registerCandidateMessage) registerCandidateMessage.textContent = ''; // Effacer les messages précédents

            if (password !== confirmPassword) {
                if (registerCandidateMessage) {
                    registerCandidateMessage.textContent = 'Les mots de passe ne correspondent pas.';
                    registerCandidateMessage.style.color = 'red';
                }
                return;
            }

            if (!termsAccepted) {
                if (registerCandidateMessage) {
                    registerCandidateMessage.textContent = 'Veuillez accepter les conditions d\'utilisation.';
                    registerCandidateMessage.style.color = 'red';
                }
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Inscription réussie
                    console.log('Utilisateur (candidat) inscrit:', userCredential.user);
                    if (registerCandidateMessage) {
                        registerCandidateMessage.textContent = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
                        registerCandidateMessage.style.color = 'green';
                    }
                    // Optionnel: rediriger vers la page de connexion ou vider le formulaire
                    // Créer un document utilisateur dans Firestore
                    // Récupérer les valeurs des nouveaux champs
                    const fullName = registerCandidateForm.fullname.value;
                    const birthdate = registerCandidateForm.birthdate.value;
                    const gender = registerCandidateForm.gender.value;
                    const location = registerCandidateForm.location.value;
                    const bio = registerCandidateForm.bio.value;
                    // const avatarFile = registerCandidateForm.avatar.files[0]; // Pour l'upload de fichier plus tard
                    const portfolioUrl = registerCandidateForm.portfolioUrl.value;
                    const skills = registerCandidateForm.skills.value; // Sera une chaîne, ex: "JS, HTML, CSS"
                    const linkedinUrl = registerCandidateForm.linkedinUrl.value;
                    const githubUrl = registerCandidateForm.githubUrl.value;

                    db.collection('users').doc(userCredential.user.uid).set({
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        role: 'candidate',
                        displayName: fullName || userCredential.user.email, // Utiliser le nom complet s'il est fourni
                        birthdate: birthdate || null,
                        gender: gender || null,
                        location: location || null,
                        bio: bio || null,
                        photoURL: null, // Sera mis à jour après l'upload de l'avatar
                        portfolioUrl: portfolioUrl || null,
                        skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill), // Convertir en tableau de tags
                        socialLinks: {
                            linkedin: linkedinUrl || null,
                            github: githubUrl || null,
                            // autres réseaux sociaux ici
                        },
                        // Les sections "expérience" et "éducation" seront gérées via la page de profil
                        experience: [],
                        education: [],
                        appliedJobsCount: 0,
                        servicesOfferedCount: 0,
                        profileViews: 0,
                        totalReviews: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log("Document utilisateur (candidat) créé dans Firestore avec détails et compteurs initiaux");
                        registerCandidateForm.reset();
                        // window.location.href = 'login.html'; // Ou vers une page de bienvenue/profil
                    }).catch((dbError) => {
                        console.error("Erreur de création du document utilisateur (candidat) dans Firestore:", dbError);
                        // Gérer l'erreur de base de données, peut-être informer l'utilisateur
                        // L'utilisateur est inscrit mais son profil n'a pas pu être sauvegardé
                        if (registerCandidateMessage) {
                            registerCandidateMessage.textContent += ' Erreur sauvegarde profil: ' + dbError.message;
                            registerCandidateMessage.style.color = 'red';
                        }
                    });
                })
                .catch((error) => {
                    console.error('Erreur d\'inscription (candidat):', error);
                    if (registerCandidateMessage) {
                        registerCandidateMessage.textContent = 'Erreur d\'inscription : ' + error.message;
                        registerCandidateMessage.style.color = 'red';
                    }
                });
        });
    }

    // --- Gestion de l'Inscription (Employeur) ---
    // À FAIRE : Similaire à l'inscription candidat, mais avec l'ID 'register-employer-form'
    // et potentiellement une logique différente pour la création du profil utilisateur (type de rôle).
    const registerEmployerForm = document.getElementById('register-employer-form');
    const registerEmployerMessage = document.getElementById('register-employer-message');

    if (registerEmployerForm) {
        registerEmployerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = registerEmployerForm.email.value;
            const password = registerEmployerForm.password.value;
            const confirmPassword = registerEmployerForm.confirmPassword.value;
            const termsAccepted = registerEmployerForm.terms.checked;

            if (registerEmployerMessage) registerEmployerMessage.textContent = ''; // Effacer les messages précédents

            if (password !== confirmPassword) {
                if (registerEmployerMessage) {
                    registerEmployerMessage.textContent = 'Les mots de passe ne correspondent pas.';
                    registerEmployerMessage.style.color = 'red';
                }
                return;
            }

            if (!termsAccepted) {
                if (registerEmployerMessage) {
                    registerEmployerMessage.textContent = 'Veuillez accepter les conditions d\'utilisation.';
                    registerEmployerMessage.style.color = 'red';
                }
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Inscription réussie
                    console.log('Utilisateur (employeur) inscrit:', userCredential.user);
                     if (registerEmployerMessage) {
                        registerEmployerMessage.textContent = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
                        registerEmployerMessage.style.color = 'green';
                    }
                    // Optionnel: rediriger vers la page de connexion ou vider le formulaire
                    // Créer un document utilisateur dans Firestore
                    // Récupérer les valeurs des nouveaux champs
                    const companyName = registerEmployerForm.companyname.value;
                    const industry = registerEmployerForm.industry.value;
                    const description = registerEmployerForm.description.value;
                    // const logoFile = registerEmployerForm.logo.files[0]; // Pour l'upload de fichier plus tard
                    const website = registerEmployerForm.website.value;
                    const location = registerEmployerForm.location.value;

                    db.collection('users').doc(userCredential.user.uid).set({
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        role: 'employer',
                        companyName: companyName || null,
                        displayName: companyName || userCredential.user.email, // Utiliser le nom de l'entreprise comme displayName
                        industry: industry || null,
                        description: description || null,
                        photoURL: null, // Sera mis à jour après l'upload du logo
                        website: website || null,
                        location: location || null,
                        postedJobsCount: 0,
                        postedProjectsCount: 0,
                        applicationsReceivedCount: 0,
                        totalReviews: 0,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        console.log("Document utilisateur (employeur) créé dans Firestore avec détails et compteurs initiaux");
                        registerEmployerForm.reset();
                        // window.location.href = 'login.html'; // Ou vers une page de bienvenue/profil
                    }).catch((dbError) => {
                        console.error("Erreur de création du document utilisateur (employeur) dans Firestore:", dbError);
                        if (registerEmployerMessage) {
                            registerEmployerMessage.textContent += ' Erreur sauvegarde profil: ' + dbError.message;
                            registerEmployerMessage.style.color = 'red';
                        }
                    });
                })
                .catch((error) => {
                    console.error('Erreur d\'inscription (employeur):', error);
                    if (registerEmployerMessage) {
                        registerEmployerMessage.textContent = 'Erreur d\'inscription : ' + error.message;
                        registerEmployerMessage.style.color = 'red';
                    }
                });
        });
    }
});
