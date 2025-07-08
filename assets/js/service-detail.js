document.addEventListener('DOMContentLoaded', function () {
    console.log('service-detail.js loaded');

    const db = firebase.firestore();
    const auth = firebase.auth(); // Needed for potential future interactions like messaging

    const loadingDiv = document.getElementById('service-detail-loading');
    const contentDiv = document.getElementById('service-detail-content');
    const notFoundDiv = document.getElementById('service-detail-not-found');

    // Element selectors for service data
    const serviceTitleBreadcrumb = document.getElementById('service-detail-title-breadcrumb');
    const serviceTitleNav = document.getElementById('service-detail-title-nav');
    const servicePreviewImage = document.getElementById('service-detail-preview-image');
    const serviceTitleMain = document.getElementById('service-detail-title-main');
    const serviceDescriptionDiv = document.getElementById('service-detail-description');
    const servicePortfolioSection = document.getElementById('service-detail-portfolio-section');
    const servicePortfolioGrid = document.getElementById('service-detail-portfolio-grid');
    const servicePriceSpan = document.getElementById('service-detail-price');

    // Element selectors for candidate data
    const candidateAvatarImg = document.getElementById('candidate-avatar');
    const candidateProfileLink = document.getElementById('candidate-profile-link');
    const candidateNameStrong = document.getElementById('candidate-name');
    const candidateTaglineP = document.getElementById('candidate-tagline'); // Placeholder

    // Element selectors for service meta
    const serviceCategorySpan = document.getElementById('service-detail-category');
    const serviceDeliveryTimeSpan = document.getElementById('service-detail-delivery-time');
    const serviceResponseTimeSpan = document.getElementById('service-detail-response-time');
    const serviceLanguagesSpan = document.getElementById('service-detail-languages');
    const serviceToolsSpan = document.getElementById('service-detail-tools');

    const contactSellerButton = document.getElementById('contact-seller-button');


    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('serviceId');

    const defaultServiceImage = './assets/images/services/service-default.png';
    const defaultAvatar = './assets/images/avatar/avatar-default.png';

    if (!serviceId) {
        showNotFound();
        return;
    }

    async function loadServiceDetails() {
        try {
            const serviceDoc = await db.collection('services').doc(serviceId).get();

            if (!serviceDoc.exists) {
                showNotFound();
                return;
            }

            const serviceData = serviceDoc.data();

            // --- Populate Service Info ---
            document.title = `HoB - ${serviceData.title || 'Service Details'}`;
            if (serviceTitleBreadcrumb) serviceTitleBreadcrumb.textContent = serviceData.title;
            if (serviceTitleNav) serviceTitleNav.textContent = serviceData.title;
            if (serviceTitleMain) serviceTitleMain.textContent = serviceData.title;
            if (servicePreviewImage) servicePreviewImage.src = serviceData.previewImageUrl || defaultServiceImage;

            // Render Quill content safely
            if (serviceDescriptionDiv && serviceData.description) {
                // serviceDescriptionDiv.innerHTML = serviceData.description; // This is direct HTML injection
                // For Quill, it's better if it was stored as Delta or if you ensure the HTML is sanitized.
                // For now, direct injection, assuming HTML from Quill is relatively safe for display.
                // A proper Quill instance for read-only view would be:
                // const quillDisplay = new Quill(serviceDescriptionDiv, { theme: 'snow', readOnly: true, modules: { toolbar: false } });
                // quillDisplay.root.innerHTML = serviceData.description;
                serviceDescriptionDiv.innerHTML = serviceData.description; // Using direct HTML for simplicity
            }

            if (servicePriceSpan) servicePriceSpan.textContent = serviceData.price ? serviceData.price.toFixed(2) : '0.00';

            // Portfolio Images
            if (serviceData.portfolioImageUrls && serviceData.portfolioImageUrls.length > 0) {
                if (servicePortfolioGrid) servicePortfolioGrid.innerHTML = ''; // Clear
                serviceData.portfolioImageUrls.forEach(url => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = `${serviceData.title} portfolio image`;
                    img.className = 'w-full h-32 object-cover rounded-md shadow-sm cursor-pointer'; // Added cursor-pointer for potential lightbox
                    // TODO: Add lightbox functionality on click
                    if (servicePortfolioGrid) servicePortfolioGrid.appendChild(img);
                });
                if (servicePortfolioSection) servicePortfolioSection.classList.remove('hidden');
            } else {
                 if (servicePortfolioSection) servicePortfolioSection.classList.add('hidden');
            }

            // --- Populate Service Meta ---
            if(serviceCategorySpan) serviceCategorySpan.textContent = serviceData.categories && serviceData.categories.length > 0 ? serviceData.categories.join(', ') : 'N/A';
            if(serviceDeliveryTimeSpan) serviceDeliveryTimeSpan.textContent = serviceData.deliveryTime || 'N/A';
            if(serviceResponseTimeSpan) serviceResponseTimeSpan.textContent = serviceData.responseTime || 'N/A';
            if(serviceLanguagesSpan) serviceLanguagesSpan.textContent = serviceData.languages && serviceData.languages.length > 0 ? serviceData.languages.join(', ') : 'N/A';
            if(serviceToolsSpan) serviceToolsSpan.textContent = serviceData.tools && serviceData.tools.length > 0 ? serviceData.tools.join(', ') : 'N/A';


            // --- Populate Candidate/Seller Info ---
            if (serviceData.candidateId) {
                const candidateDoc = await db.collection('users').doc(serviceData.candidateId).get();
                if (candidateDoc.exists) {
                    const candidateData = candidateDoc.data();
                    if (candidateAvatarImg) candidateAvatarImg.src = candidateData.photoURL || defaultAvatar;
                    if (candidateNameStrong) candidateNameStrong.textContent = candidateData.displayName || candidateData.companyName || 'Seller';
                    if (candidateProfileLink) candidateProfileLink.href = `candidates-detail1.html?uid=${serviceData.candidateId}`; // Or employer detail if role is employer
                    if (candidateTaglineP) candidateTaglineP.textContent = candidateData.tagline || (candidateData.role === 'candidate' ? 'Freelancer' : 'Employer'); // Example

                    if (contactSellerButton) {
                        contactSellerButton.onclick = () => {
                            // Redirect to a chat page or open a modal. For now, placeholder.
                            // Requires knowing the current user to initiate chat.
                            const currentUser = auth.currentUser;
                            if (currentUser) {
                                if (currentUser.uid === serviceData.candidateId) {
                                    alert("This is your own service.");
                                } else {
                                    // Example: Redirect to a conceptual chat page
                                    window.location.href = `messages.html?recipientId=${serviceData.candidateId}&serviceId=${serviceId}`;
                                    // Actual implementation of messaging is a large feature.
                                }
                            } else {
                                alert("Please log in to contact the seller.");
                                window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
                            }
                        };
                    }

                } else {
                    console.warn('Candidate data not found for ID:', serviceData.candidateId);
                    setDefaultCandidateInfo();
                }
            } else {
                setDefaultCandidateInfo();
            }

            showContent();

        } catch (error) {
            console.error("Error loading service details:", error);
            showNotFound(); // Or a generic error message
        }
    }

    function setDefaultCandidateInfo() {
        if (candidateAvatarImg) candidateAvatarImg.src = defaultAvatar;
        if (candidateNameStrong) candidateNameStrong.textContent = 'Seller Information Unavailable';
        if (candidateProfileLink) candidateProfileLink.href = '#';
        if (candidateTaglineP) candidateTaglineP.textContent = '';
        if (contactSellerButton) contactSellerButton.disabled = true;

    }

    function showContent() {
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (notFoundDiv) notFoundDiv.classList.add('hidden');
        if (contentDiv) contentDiv.classList.remove('hidden');
    }

    function showNotFound() {
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (contentDiv) contentDiv.classList.add('hidden');
        if (notFoundDiv) notFoundDiv.classList.remove('hidden');
        document.title = "HoB - Service Not Found";
    }

    loadServiceDetails();
});
