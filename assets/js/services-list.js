document.addEventListener('DOMContentLoaded', function () {
    console.log('services-list.js loaded');

    const db = firebase.firestore();

    const loadingMessage = document.getElementById('loading-services-public-message');
    const noServicesMessage = document.getElementById('no-services-public-message');
    const servicesGridContainer = document.getElementById('services-grid-container');

    if (!loadingMessage || !noServicesMessage || !servicesGridContainer) {
        console.error('Required elements for public service listing are missing.');
        return;
    }

    function renderServiceCard(serviceData, serviceId) {
        const defaultAvatar = './assets/images/avatar/avatar-default.png'; // A default candidate avatar
        const defaultServiceImage = './assets/images/services/service-default.png'; // A default service image

        // Determine candidate avatar - assuming candidateName and candidateAvatarUrl might be denormalized in service doc in future
        // For now, we might need a separate fetch or rely on pre-filled candidateName.
        const candidateName = serviceData.candidateName || 'N/A';
        // const candidateAvatar = serviceData.candidateAvatarUrl || defaultAvatar; // Assuming this field might exist

        const cardHtml = `
            <div class="item service-card bg-white shadow-md rounded-lg overflow-hidden duration-300 hover:shadow-xl">
                <a href="services-detail1.html?serviceId=${serviceId}" class="service-link">
                    <div class="service-image-container w-full h-48 bg-gray-200">
                        <img src="${serviceData.previewImageUrl || defaultServiceImage}" alt="${serviceData.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="service-info p-4">
                        <h5 class="service-title text-lg font-semibold text-gray-900 truncate mb-1">${serviceData.title}</h5>
                        <p class="service-candidate text-sm text-gray-600 mb-2">By: ${candidateName}</p>
                        <div class="service-meta flex items-center justify-between text-sm text-gray-500 mb-2">
                            <span>${serviceData.categories && serviceData.categories.length > 0 ? serviceData.categories[0] : 'General'}</span>
                            <!-- Add rating/reviews placeholder if needed -->
                        </div>
                        <div class="service-price text-lg font-bold text-primary mt-2">$${serviceData.price.toFixed(2)}</div>
                    </div>
                </a>
                <div class="service-actions p-4 border-t border-gray-200">
                    <a href="services-detail1.html?serviceId=${serviceId}" class="button-main -outline w-full text-center">View Details</a>
                </div>
            </div>
        `;
        return cardHtml;
    }

    loadingMessage.classList.remove('hidden');
    noServicesMessage.classList.add('hidden');
    servicesGridContainer.classList.add('hidden');
    servicesGridContainer.innerHTML = '';

    db.collection('services')
        .where('status', '==', 'active') // Only show active services
        .orderBy('createdAt', 'desc')
        .limit(20) // Example: limit to 20 services for now
        .get()
        .then((querySnapshot) => {
            loadingMessage.classList.add('hidden');
            if (querySnapshot.empty) {
                noServicesMessage.classList.remove('hidden');
                servicesGridContainer.classList.add('hidden');
            } else {
                noServicesMessage.classList.add('hidden');
                servicesGridContainer.classList.remove('hidden');
                let cardsHtml = '';
                querySnapshot.forEach((doc) => {
                    cardsHtml += renderServiceCard(doc.data(), doc.id);
                });
                servicesGridContainer.innerHTML = cardsHtml;
            }
        })
        .catch((error) => {
            console.error("Error loading public services: ", error);
            loadingMessage.classList.add('hidden');
            noServicesMessage.textContent = 'Error loading services. Please try again.';
            noServicesMessage.classList.remove('hidden');
            servicesGridContainer.classList.add('hidden');
        });
});
