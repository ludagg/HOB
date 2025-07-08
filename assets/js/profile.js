document.addEventListener('DOMContentLoaded', function () {
    // Assurez-vous que Firebase est initialisé (auth et db sont définis dans firebase-init.js)
    if (typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase auth ou db n\'est pas initialisé.');
        // Rediriger vers la page de connexion si Firebase n'est pas prêt, par sécurité
        // window.location.href = 'login.html';
        return;
    }

    const profileForm = document.querySelector('.dashboard_applied form'); // Le formulaire principal de la page
    const profileSaveButton = document.getElementById('profile-save-button');
    const profileMessage = document.getElementById('profile-message');

    // Champs du formulaire
    const avatarUploadInput = document.getElementById('profile-avatar-upload');
    const avatarPreview = document.getElementById('profile-avatar-preview');
    const fullNameInput = document.getElementById('profile-full-name');
    const emailInput = document.getElementById('profile-email');
    const phoneNumberInput = document.getElementById('profile-phone-number');
    const birthInput = document.getElementById('profile-birth');
    // L'éditeur Quill sera initialisé par main.js sur #profile-description-editor
    // Nous récupérerons son contenu via l'API Quill.
    let quillEditor;

    // Initialiser Quill (ou s'assurer qu'il est initialisé par main.js)
    // Si main.js initialise Quill sur #profile-description-editor, nous devons obtenir cette instance.
    // Pour l'instant, on suppose que main.js le fait. Si ce n'est pas le cas, il faudra l'initialiser ici.
    // Tentative de récupérer l'instance de Quill si main.js l'a déjà initialisée
    if (typeof Quill !== 'undefined' && document.getElementById('profile-description-editor')) {
         // Si main.js ne crée pas globalement l'instance, il faudra une meilleure méthode pour la partager.
         // Pour l'instant, on pourrait essayer de le créer s'il n'existe pas.
        if (Quill.find(document.getElementById('profile-description-editor'))) {
            quillEditor = Quill.find(document.getElementById('profile-description-editor'));
        } else {
            // Fallback: initialiser si non trouvé, mais cela pourrait entrer en conflit avec main.js
            // Idéalement, main.js devrait exposer l'instance ou ce code devrait être intégré à main.js
            // pour la gestion de Quill sur cette page spécifique.
            // Pour l'instant, on va juste logguer un avertissement si on ne le trouve pas.
            console.warn("L'instance de Quill pour #profile-description-editor n'a pas été trouvée. La description ne sera pas gérée.");
        }
    }


    let currentUser = null;
    let userDocRef = null;
    let userData = null; // Pour stocker les données utilisateur chargées

    // Champs spécifiques aux rôles
    const candidateSpecificInfo = document.getElementById('candidate-specific-info');
    const employerSpecificInfo = document.getElementById('employer-specific-info');

    // Champs pour candidats (déjà déclarés ou à déclarer si besoin d'y accéder spécifiquement)
    const skillsInput = document.getElementById('profile-candidate-skills'); // Assumant que vous avez cet ID dans le HTML pour les compétences
    const portfolioUrlInput = document.getElementById('profile-candidate-portfolio-url'); // Assumant cet ID

    // Champs pour employeurs
    const companyNameInput = document.getElementById('profile-company-name');
    const industryInput = document.getElementById('profile-industry');
    const companyWebsiteInput = document.getElementById('profile-company-website');
    const companyLocationInput = document.getElementById('profile-company-location');
    // La description de l'entreprise utilisera le même éditeur Quill que la bio du candidat, géré par son ID.

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            userDocRef = db.collection('users').doc(currentUser.uid);
            loadUserProfile();
        } else {
            console.log("Aucun utilisateur connecté. Redirection vers login.html depuis profile.js");
            window.location.href = 'login.html';
        }
    });

    function displayRoleSpecificSections(role) {
        if (role === 'candidate') {
            if (candidateSpecificInfo) candidateSpecificInfo.style.display = 'block'; // Ou 'grid' si c'est un conteneur grid
            if (employerSpecificInfo) employerSpecificInfo.style.display = 'none';
            // Ajuster les labels si nécessaire
            if (document.querySelector('label[for="profile-full-name"]')) document.querySelector('label[for="profile-full-name"]').textContent = 'Full Name*:';
            if (document.querySelector('label[for="profile-description-editor"]')) document.querySelector('label[for="profile-description-editor"]').textContent = 'Biography / Description:';
             // Afficher les sections CV, Education, Experience, etc. qui sont spécifiques aux candidats
            const candidateOnlySections = ['cv_file', 'education', 'work_experience', 'language', 'categories', 'tools']; // classes ou IDs des sections
            candidateOnlySections.forEach(id_or_class => {
                const section = document.querySelector('.' + id_or_class) || document.getElementById(id_or_class);
                if (section) section.style.display = 'block'; // ou autre valeur de display appropriée
            });


        } else if (role === 'employer') {
            if (candidateSpecificInfo) candidateSpecificInfo.style.display = 'none';
            if (employerSpecificInfo) employerSpecificInfo.style.display = 'block'; // Ou 'grid'
            if (document.querySelector('label[for="profile-full-name"]')) document.querySelector('label[for="profile-full-name"]').textContent = 'Contact Person*:';
            if (document.querySelector('label[for="profile-description-editor"]')) document.querySelector('label[for="profile-description-editor"]').textContent = 'Company Description:';
            // Masquer les sections spécifiques aux candidats
            const candidateOnlySections = ['cv_file', 'education', 'work_experience', 'language', 'categories', 'tools'];
             candidateOnlySections.forEach(id_or_class => {
                const section = document.querySelector('.' + id_or_class) || document.getElementById(id_or_class);
                if (section) section.style.display = 'none';
            });
        }
    }

    function loadUserProfile() {
        if (!userDocRef) return;

        userDocRef.get().then(doc => {
            if (doc.exists) {
                userData = doc.data();
                displayRoleSpecificSections(userData.role);

                if (fullNameInput) fullNameInput.value = userData.displayName || '';
                if (emailInput) emailInput.value = userData.email || (currentUser ? currentUser.email : '');
                if (phoneNumberInput) phoneNumberInput.value = userData.phoneNumber || '';
                if (document.getElementById('profile-general-location')) document.getElementById('profile-general-location').value = userData.location || '';


                if (avatarPreview) {
                    avatarPreview.src = userData.photoURL || './assets/images/avatar/avatar1.png';
                }

                if (quillEditor) {
                    if (userData.role === 'candidate' && userData.bio) {
                        quillEditor.root.innerHTML = userData.bio;
                    } else if (userData.role === 'employer' && userData.description) {
                        quillEditor.root.innerHTML = userData.description;
                    } else {
                        quillEditor.setText('');
                    }
                }

                // Champs Candidat
                if (userData.role === 'candidate') {
                    if (birthInput) birthInput.value = userData.birthdate || '';
                    if (document.getElementById('profile-gender')) document.getElementById('profile-gender').value = userData.gender || '';
                    if (document.getElementById('age')) document.getElementById('age').value = userData.age || ''; // Supposant un champ 'age'
                    if (document.getElementById('profile-salary')) document.getElementById('profile-salary').value = userData.offeredSalary || '';
                    // salary_type select - plus complexe, nécessite de trouver l'option correspondante
                    if (skillsInput && Array.isArray(userData.skills)) skillsInput.value = userData.skills.join(', ');
                    if (portfolioUrlInput) portfolioUrlInput.value = userData.portfolioUrl || '';
                    // Gérer les liens sociaux, éducation, expérience (plus complexe car répétable)
                }

                // Champs Employeur
                if (userData.role === 'employer') {
                    if (companyNameInput) companyNameInput.value = userData.companyName || '';
                    if (industryInput) industryInput.value = userData.industry || '';
                    if (companyWebsiteInput) companyWebsiteInput.value = userData.website || '';
                    if (companyLocationInput) companyLocationInput.value = userData.companyLocation || userData.location || ''; // Fallback sur location générale
                }

            } else {
                console.log("Aucun document de profil trouvé pour cet utilisateur. Initialisation possible.");
                if (emailInput && currentUser) emailInput.value = currentUser.email;
                // Il faudrait peut-être créer un document de base ici si l'utilisateur s'est inscrit mais que la création a échoué.
                // Ou, mieux, s'assurer que la création dans auth.js est robuste.
            }
        }).catch(error => {
            console.error("Erreur lors du chargement du profil utilisateur:", error);
            if (profileMessage) {
                profileMessage.textContent = "Erreur de chargement du profil: " + error.message;
                profileMessage.style.color = 'red';
            }
        });
    }

    // Aperçu de l'avatar
    if (avatarUploadInput && avatarPreview) {
        avatarUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Sauvegarde du profil
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!currentUser || !userDocRef || !userData) {
                if (profileMessage) {
                    profileMessage.textContent = "Données utilisateur non chargées ou utilisateur non identifié.";
                    profileMessage.style.color = 'red';
                }
                return;
            }

            if (profileMessage) profileMessage.textContent = '';

            const dataToUpdate = {
                displayName: fullNameInput ? fullNameInput.value : null,
                phoneNumber: phoneNumberInput ? phoneNumberInput.value : null,
                location: document.getElementById('profile-general-location') ? document.getElementById('profile-general-location').value : null,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (quillEditor) {
                if (userData.role === 'candidate') {
                    dataToUpdate.bio = quillEditor.root.innerHTML;
                } else if (userData.role === 'employer') {
                    dataToUpdate.description = quillEditor.root.innerHTML;
                }
            }

            // Champs spécifiques au rôle
            if (userData.role === 'candidate') {
                dataToUpdate.birthdate = birthInput ? birthInput.value : null;
                dataToUpdate.gender = document.getElementById('profile-gender') ? document.getElementById('profile-gender').value : null;
                dataToUpdate.age = document.getElementById('age') ? document.getElementById('age').value : null;
                dataToUpdate.offeredSalary = document.getElementById('profile-salary') ? document.getElementById('profile-salary').value : null;
                // dataToUpdate.salaryType = ... ; // Gérer le select
                if (skillsInput) {
                    dataToUpdate.skills = skillsInput.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                }
                dataToUpdate.portfolioUrl = portfolioUrlInput ? portfolioUrlInput.value : null;
                // Mettre à jour les liens sociaux, éducation, expérience
            } else if (userData.role === 'employer') {
                dataToUpdate.companyName = companyNameInput ? companyNameInput.value : null;
                dataToUpdate.displayName = companyNameInput ? companyNameInput.value : fullNameInput.value; // Mettre à jour displayName aussi pour employeur
                dataToUpdate.industry = industryInput ? industryInput.value : null;
                dataToUpdate.website = companyWebsiteInput ? companyWebsiteInput.value : null;
                dataToUpdate.companyLocation = companyLocationInput ? companyLocationInput.value : null; // Peut être différent de la localisation générale
            }

            // Filtrer les valeurs undefined pour ne pas les écrire dans Firestore si elles ne sont pas fournies
            for (const key in dataToUpdate) {
                if (dataToUpdate[key] === undefined) {
                    delete dataToUpdate[key];
                }
            }

            userDocRef.update(dataToUpdate)
                .then(() => {
                    console.log("Profil mis à jour avec succès !");
            if (profileMessage) {
                profileMessage.textContent = "Erreur de chargement du profil.";
                profileMessage.style.color = 'red';
            }
        });
    }

    // Aperçu de l'avatar lors de la sélection d'un fichier
    if (avatarUploadInput && avatarPreview) {
        avatarUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Sauvegarde du profil
    if (profileForm) { // Utiliser profileForm au lieu de profileSaveButton pour l'événement submit
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!currentUser || !userDocRef) {
                if (profileMessage) {
                    profileMessage.textContent = "Utilisateur non identifié. Impossible de sauvegarder.";
                    profileMessage.style.color = 'red';
                }
                return;
            }

            if (profileMessage) profileMessage.textContent = '';

            const newDisplayName = fullNameInput ? fullNameInput.value : '';
            const newPhoneNumber = phoneNumberInput ? phoneNumberInput.value : '';
            const newBirthDate = birthInput ? birthInput.value : '';
            let newDescription = '';
            if (quillEditor) {
                newDescription = quillEditor.root.innerHTML; // Ou quillEditor.getText() pour du texte brut
            }

            const dataToUpdate = {
                displayName: newDisplayName,
                email: emailInput ? emailInput.value : currentUser.email, // L'email ne devrait pas vraiment changer ici
                phoneNumber: newPhoneNumber,
                birthDate: newBirthDate,
                description: newDescription,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                // Ajouter d'autres champs ici
            };

            // Note: L'upload de l'avatar (photoURL) vers Firebase Storage n'est pas géré ici.
            // Cela nécessiterait Firebase Storage et une logique d'upload de fichier.
            // Pour l'instant, photoURL ne sera mis à jour que si vous le gérez manuellement ou via une autre fonction.

            userDocRef.update(dataToUpdate)
                .then(() => {
                    console.log("Profil mis à jour avec succès !");
                    if (profileMessage) {
                        profileMessage.textContent = "Profil mis à jour avec succès !";
                        profileMessage.style.color = 'green';
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la mise à jour du profil:", error);
                    if (profileMessage) {
                        profileMessage.textContent = "Erreur lors de la mise à jour du profil: " + error.message;
                        profileMessage.style.color = 'red';
                    }
                });
        });
    }
});
