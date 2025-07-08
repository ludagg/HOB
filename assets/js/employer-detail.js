document.addEventListener('DOMContentLoaded', function () {
    if (typeof db === 'undefined') {
        console.error('Firebase db n\'est pas initialisé.');
        document.body.innerHTML = '<p style="text-align: center; padding-top: 50px;">Erreur de configuration. Impossible de charger les détails de l\'employeur.</p>';
        return;
    }

    const defaultLogo = './assets/images/company/1.png'; // Un logo par défaut pour entreprise

    function getEmployerUid() {
        const params = new URLSearchParams(window.location.search);
        return params.get('uid');
    }

    const employerUid = getEmployerUid();

    if (!employerUid) {
        console.error('Aucun UID d\'employeur fourni dans l\'URL.');
        const mainContentArea = document.querySelector('.employers_detail .container') || document.body;
        mainContentArea.innerHTML = '<p class="text-center text-red py-10">Profil employeur non trouvé.</p>';
        return;
    }

    const employerDocRef = db.collection('users').doc(employerUid);

    employerDocRef.get().then(doc => {
        if (doc.exists && doc.data().role === 'employer') {
            const employer = doc.data();
            displayEmployerDetails(employer);
        } else {
            console.error('Employeur non trouvé ou rôle incorrect.');
            const mainContentArea = document.querySelector('.employers_detail .container') || document.body;
            mainContentArea.innerHTML = '<p class="text-center text-red py-10">Profil employeur non trouvé ou invalide.</p>';
        }
    }).catch(error => {
        console.error("Erreur lors de la récupération du profil employeur:", error);
        const mainContentArea = document.querySelector('.employers_detail .container') || document.body;
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

    function displayEmployerDetails(employer) {
        // Breadcrumb section
        if(document.getElementById('employer-logo-breadcrumb')) {
            document.getElementById('employer-logo-breadcrumb').src = employer.photoURL || defaultLogo;
            document.getElementById('employer-logo-breadcrumb').alt = (employer.companyName || employer.displayName || 'Company') + " logo";
        }
        setTextContent('employer-name-breadcrumb', employer.companyName || employer.displayName);
        setTextContent('employer-location-breadcrumb', employer.location);

        const memberSince = employer.createdAt ? new Date(employer.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
        setTextContent('employer-member-since', `Membre depuis ${memberSince}`);

        // Placeholder pour le nombre d'offres, cela nécessiterait une requête agrégée ou un champ dénormalisé
        setTextContent('employer-jobs-openings-breadcrumb', `${employer.openJobsCount || 0} job openings`);

        // Section "About Company"
        setHtmlContent('employer-description', employer.description ? employer.description.replace(/\n/g, '<br>') : 'Aucune description de l\'entreprise.');

        // Sidebar Info Overview
        if(document.getElementById('sidebar-employer-logo')) {
            document.getElementById('sidebar-employer-logo').src = employer.photoURL || defaultLogo;
            document.getElementById('sidebar-employer-logo').alt = (employer.companyName || employer.displayName || 'Company') + " logo";
        }
        setTextContent('sidebar-employer-companyname', employer.companyName || employer.displayName);
        setTextContent('sidebar-employer-established', employer.establishedDate ? `Depuis ${new Date(employer.establishedDate.seconds * 1000).toLocaleDateString()}` : 'N/A'); // Supposant un champ establishedDate
        setTextContent('sidebar-employer-industry', employer.industry);
        setTextContent('sidebar-employer-companysize', employer.companySize); // Supposant un champ companySize
        setTextContent('sidebar-employer-address', employer.location); // Ou un champ d'adresse plus spécifique

        // Website Link
        const websiteLinkElement = document.getElementById('employer-website-link');
        if (websiteLinkElement && employer.website) {
            websiteLinkElement.href = employer.website;
            websiteLinkElement.style.display = 'block'; // ou 'inline-block'
        } else if (websiteLinkElement) {
            websiteLinkElement.style.display = 'none';
        }

        // Contact button (peut-être un mailto: ou un lien vers une page de contact/messagerie)
        const contactButton = document.getElementById('employer-contact-button');
        if(contactButton && employer.email) {
            contactButton.href = `mailto:${employer.email}`;
        }


        // Social Links in Sidebar
        const socialLinksContainer = document.getElementById('sidebar-employer-socials');
        if (socialLinksContainer && employer.socialLinks) {
            socialLinksContainer.innerHTML = ''; // Clear static content
            let hasSocialLinks = false;
            // Adaptez les icônes et les liens selon les données que vous stockez
            if (employer.socialLinks.linkedin) {
                socialLinksContainer.innerHTML += `<li><a href="${employer.socialLinks.linkedin}" target="_blank" class="w-10 h-10 flex items-center justify-center border border-line rounded-full text-black duration-300 hover:bg-primary"><span class="icon-linkedin text-lg"></span></a></li>`;
                hasSocialLinks = true;
            }
            if (employer.socialLinks.website) { // Si le site web est aussi dans socialLinks
                 socialLinksContainer.innerHTML += `<li><a href="${employer.socialLinks.website}" target="_blank" class="w-10 h-10 flex items-center justify-center border border-line rounded-full text-black duration-300 hover:bg-primary"><span class="ph ph-globe text-lg"></span></a></li>`;
                 hasSocialLinks = true;
            }
            // Ajoutez d'autres réseaux sociaux ici
            if (!hasSocialLinks) {
                socialLinksContainer.innerHTML = '<li class="text-secondary italic">Aucun lien social fourni.</li>';
            }
        } else if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '<li class="text-secondary italic">Aucun lien social fourni.</li>';
        }

        // La section "Related Jobs" nécessitera une requête séparée pour lister les offres de cet employeur.
        // Pour l'instant, elle restera statique ou sera vidée.
        const relatedJobsContainer = document.querySelector('.related .list_related');
        if(relatedJobsContainer) {
            // relatedJobsContainer.innerHTML = '<p class="text-secondary p-5">Chargement des offres...</p>';
            // Logique pour charger les offres d'emploi de cet employeur ici
        }
    }
});
