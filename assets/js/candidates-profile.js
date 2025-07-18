document.addEventListener('DOMContentLoaded', () => {
    const candidateName = document.getElementById('candidate-name');
    const candidateInfo = document.getElementById('candidate-info');
    const servicesList = document.getElementById('services-list');
    const serviceForm = document.getElementById('service-form');
    const serviceCategory = document.getElementById('service-category');

    let currentUser = null;

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadProfile();
            loadServices();
            populateCategories();
        } else {
            // Redirect to login page if not authenticated
            window.location.href = 'login.html';
        }
    });

    async function loadProfile() {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            candidateName.textContent = `${userData.firstName} ${userData.lastName}`;
            candidateInfo.innerHTML = `
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Téléphone:</strong> ${userData.phone}</p>
                <p><strong>Localisation:</strong> ${userData.city}, ${userData.country}</p>
                <p><strong>Profession:</strong> ${userData.profession}</p>
            `;
        }
    }

    async function loadServices() {
        const servicesSnapshot = await db.collection('services').where('candidateId', '==', currentUser.uid).get();
        servicesList.innerHTML = '';
        servicesSnapshot.forEach(doc => {
            const service = doc.data();
            const serviceElement = `
                <li class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-bold">${service.title}</h3>
                    <p class="text-gray-600">${service.description}</p>
                    <p class="mt-2"><strong>Prix:</strong> $${service.price}</p>
                    <p><strong>Catégorie:</strong> ${service.category}</p>
                </li>
            `;
            servicesList.insertAdjacentHTML('beforeend', serviceElement);
        });
    }

    async function populateCategories() {
        try {
            const categoriesSnapshot = await db.collection('categories').get();
            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                serviceCategory.appendChild(option);
            });
        } catch (error) {
            console.error("Error populating categories:", error);
        }
    }

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = serviceForm.title.value;
        const description = serviceForm.description.value;
        const price = parseFloat(serviceForm.price.value);
        const category = serviceForm.category.value;

        if (title && description && price && category) {
            try {
                await db.collection('services').add({
                    title,
                    description,
                    price,
                    category,
                    candidateId: currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                serviceForm.reset();
                loadServices();
            } catch (error) {
                console.error("Error adding service: ", error);
            }
        }
    });
});
