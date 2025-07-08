document.addEventListener('DOMContentLoaded', function () {
    if (typeof db === 'undefined') {
        console.error('Firebase db n\'est pas initialisé.');
        document.body.innerHTML = '<p style="text-align: center; padding-top: 50px;">Erreur de configuration. Impossible de charger les détails du candidat.</p>';
        return;
    }

    const defaultAvatar = './assets/images/avatar/avatar1.png';

    // Fonction pour récupérer l'UID de l'URL
    function getCandidateUid() {
        const params = new URLSearchParams(window.location.search);
        return params.get('uid');
    }

    const candidateUid = getCandidateUid();

    if (!candidateUid) {
        console.error('Aucun UID de candidat fourni dans l\'URL.');
        document.getElementById('candidates-detail-container').innerHTML = '<p class="text-center text-red py-10">Profil candidat non trouvé.</p>'; // Assurez-vous d'avoir un conteneur global
        return;
    }

    const candidateDocRef = db.collection('users').doc(candidateUid);

    candidateDocRef.get().then(doc => {
        if (doc.exists && doc.data().role === 'candidate') {
            const candidate = doc.data();
            displayCandidateDetails(candidate);
        } else {
            console.error('Candidat non trouvé ou rôle incorrect.');
            const mainContentArea = document.querySelector('.candidates_detail .container') || document.body;
            mainContentArea.innerHTML = '<p class="text-center text-red py-10">Profil candidat non trouvé ou invalide.</p>';
        }
    }).catch(error => {
        console.error("Erreur lors de la récupération du profil candidat:", error);
        const mainContentArea = document.querySelector('.candidates_detail .container') || document.body;
        mainContentArea.innerHTML = '<p class="text-center text-red py-10">Erreur lors du chargement du profil.</p>';
    });

    function setTextContent(elementId, text, fallback = 'N/A') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text || fallback;
        }
    }

    function setHtmlContent(elementId, html, fallback = '<p class="text-secondary">Non fourni.</p>') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html || fallback;
        }
    }

    function displayCandidateDetails(candidate) {
        // Breadcrumb section
        if(document.getElementById('candidate-avatar-breadcrumb')) document.getElementById('candidate-avatar-breadcrumb').src = candidate.photoURL || defaultAvatar;
        setTextContent('candidate-name-breadcrumb', candidate.displayName);
        setTextContent('candidate-location-breadcrumb', candidate.location);
        // setTextContent('candidate-rating-breadcrumb', candidate.averageRating || 'N/A'); // Supposant ces champs
        // setTextContent('candidate-reviews-breadcrumb', `(${candidate.reviewCount || 0} reviews)`);

        // About me
        setHtmlContent('candidate-about-me', candidate.bio ? candidate.bio.replace(/\n/g, '<br>') : 'Aucune biographie fournie.');

        // Education
        const educationList = document.getElementById('candidate-education-list');
        if (educationList) {
            educationList.innerHTML = ''; // Clear static content
            if (candidate.education && candidate.education.length > 0) {
                candidate.education.forEach(edu => {
                    // Supposons que edu est un objet avec des champs comme degree, school, year
                    // Adaptez ceci à la structure réelle de vos données d'éducation
                    const listItem = document.createElement('li');
                    listItem.className = 'flex flex-col gap-1';
                    listItem.innerHTML = `
                        <span class="text-xs font-semibold uppercase text-primary">${edu.startDate || ''} - ${edu.endDate || 'Present'}</span>
                        <strong class="text-title">${edu.degree || 'N/A'}</strong>
                        <span class="text-secondary">${edu.school || 'N/A'}</span>
                        <p class="text-sm text-secondary mt-1">${edu.description || ''}</p>
                    `;
                    educationList.appendChild(listItem);
                });
            } else {
                educationList.innerHTML = '<li class="text-secondary">Aucune information sur l\'éducation.</li>';
            }
        }

        // Experience
        const experienceList = document.getElementById('candidate-experience-list');
        if (experienceList) {
            experienceList.innerHTML = ''; // Clear static content
            if (candidate.experience && candidate.experience.length > 0) {
                candidate.experience.forEach(exp => {
                    // Supposons que exp est un objet avec des champs comme title, company, years, description
                    const listItem = document.createElement('li');
                    listItem.className = 'flex flex-col gap-1';
                    listItem.innerHTML = `
                        <span class="text-xs font-semibold uppercase text-primary">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>
                        <strong class="text-title">${exp.jobTitle || 'N/A'}</strong>
                        <span class="text-secondary">${exp.companyName || 'N/A'}</span>
                        <p class="text-sm text-secondary mt-1">${exp.description || ''}</p>
                    `;
                    experienceList.appendChild(listItem);
                });
            } else {
                experienceList.innerHTML = '<li class="text-secondary">Aucune expérience professionnelle listée.</li>';
            }
        }

        // Skills - affichage sous forme de tags
        const skillsContainer = document.getElementById('candidate-skills-container'); // Changé de candidate-skills-list
        if (skillsContainer) {
            skillsContainer.innerHTML = ''; // Clear static content
            if (candidate.skills && candidate.skills.length > 0) {
                candidate.skills.forEach(skill => {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'candidates_tag caption1 tag bg-surface'; // Utilisez les classes du template
                    skillTag.textContent = skill;
                    skillsContainer.appendChild(skillTag);
                });
            } else {
                skillsContainer.innerHTML = '<span class="tag caption1 bg-surface text-secondary">Aucune compétence listée.</span>';
            }
        }


        // Portfolio
        const portfolioContainer = document.getElementById('candidate-portfolio-link-container');
        if (portfolioContainer) {
            if (candidate.portfolioUrl) {
                portfolioContainer.innerHTML = `<a href="${candidate.portfolioUrl}" target="_blank" class="text-primary hover:underline break-all">${candidate.portfolioUrl}</a>`;
            } else {
                portfolioContainer.innerHTML = '<p class="text-secondary">Aucun lien de portfolio fourni.</p>';
            }
        }
        // La section candidate-portfolio-list pour les images est masquée pour l'instant

        // Sidebar Info Overview
        setTextContent('sidebar-career', candidate.careerFinding || 'N/A'); // Supposons un champ careerFinding
        setTextContent('sidebar-location', candidate.location);
        setTextContent('sidebar-salary', candidate.offeredSalary ? `$${candidate.offeredSalary}/${candidate.salaryType || 'Month'}` : 'N/A');
        setTextContent('sidebar-experience', candidate.experienceYears || 'N/A'); // Supposons un champ experienceYears
        setTextContent('sidebar-language', Array.isArray(candidate.languages) ? candidate.languages.join(', ') : (candidate.languages || 'N/A'));
        setTextContent('sidebar-age', candidate.age || (candidate.birthdate ? calculateAge(candidate.birthdate) + ' Years Old' : 'N/A'));

        // Social Links
        const socialLinksContainer = document.getElementById('sidebar-social-links');
        if (socialLinksContainer && candidate.socialLinks) {
            socialLinksContainer.innerHTML = ''; // Clear static content
            let hasSocialLinks = false;
            if (candidate.socialLinks.linkedin) {
                socialLinksContainer.innerHTML += `<li><a href="${candidate.socialLinks.linkedin}" target="_blank" class="w-10 h-10 flex items-center justify-center border border-line rounded-full text-black duration-300 hover:bg-primary"><span class="icon-linkedin text-lg"></span></a></li>`;
                hasSocialLinks = true;
            }
            if (candidate.socialLinks.github) {
                socialLinksContainer.innerHTML += `<li><a href="${candidate.socialLinks.github}" target="_blank" class="w-10 h-10 flex items-center justify-center border border-line rounded-full text-black duration-300 hover:bg-primary"><span class="icon-github text-lg"></span></a></li>`; // Assurez-vous d'avoir une classe icon-github
                hasSocialLinks = true;
            }
            // Ajoutez d'autres réseaux sociaux ici
            if (!hasSocialLinks) {
                socialLinksContainer.innerHTML = '<li class="text-secondary italic">Aucun lien social fourni.</li>';
            }
        } else if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '<li class="text-secondary italic">Aucun lien social fourni.</li>';
        }

        // CV Download (simplifié, juste un lien si disponible)
        const cvLinksContainer = document.getElementById('sidebar-cv-links');
        const downloadCvProButton = document.getElementById('sidebar-download-cv-pro');

        if (cvLinksContainer) cvLinksContainer.innerHTML = ''; // Clear
        if (candidate.cvFileUrl) { // Supposant un champ cvFileUrl pour le lien direct
            if (cvLinksContainer) {
                 const cvLinkHTML = `
                    <li>
                        <a href="${candidate.cvFileUrl}" target="_blank" class="flex items-center justify-between gap-3 w-full h-[76px] p-3 rounded-lg bg-surface duration-300 hover:bg-background">
                            <div>
                                <span class="text-sm font-bold text-secondary uppercase">CV_Document</span>
                                <strong class="block mt-1 text-title cursor-pointer">PDF/DOC</strong>
                            </div>
                            <span class="ph ph-file-arrow-down flex-shrink-0 text-4xl text-primary"></span>
                        </a>
                    </li>`;
                cvLinksContainer.innerHTML = cvLinkHTML;
            }
            if(downloadCvProButton) {
                downloadCvProButton.href = candidate.cvFileUrl;
                downloadCvProButton.style.display = 'block'; // Ou 'inline-block'
                 downloadCvProButton.textContent = 'Download CV';
            }
        } else {
            if (cvLinksContainer) cvLinksContainer.innerHTML = '<li class="text-secondary italic">Aucun CV attaché.</li>';
            if(downloadCvProButton) downloadCvProButton.style.display = 'none';
        }


    }

    function calculateAge(birthdateString) {
        if (!birthdateString) return null;
        const birthDate = new Date(birthdateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

});
