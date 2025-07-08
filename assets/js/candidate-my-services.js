// Placeholder for candidate-my-services.js
document.addEventListener('DOMContentLoaded', function () {
    console.log('candidate-my-services.js loaded');

    const auth = firebase.auth();
    const db = firebase.firestore();

    let currentUser = null;
    let userRole = null;

    // Auth Guard and Role Check
    auth.onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    userRole = doc.data().role;
                    const userName = doc.data().displayName || user.email;
                    if (userRole === 'candidate') {
                        // Update dashboard title if on this page
                        const dashboardTitle = document.getElementById('dashboard-title');
                        if (dashboardTitle) {
                            dashboardTitle.textContent = `${userName}'s Services`;
                        }
                        loadServices();
                        // Dynamically load dashboard menu
                        loadDashboardMenu(userRole, 'candidates-my-services.html');
                    } else {
                        console.warn('User is not a candidate. Redirecting...');
                        window.location.href = 'login.html';
                    }
                } else {
                    console.error('User data not found in Firestore. Redirecting to login.');
                    window.location.href = 'login.html';
                }
            }).catch((error) => {
                console.error('Error fetching user role:', error);
                window.location.href = 'login.html';
            });
        } else {
            console.log('User is not logged in. Redirecting to login.');
            window.location.href = 'login.html';
        }
    });

    function loadServices() {
        console.log('Loading services for candidate:', currentUser.uid);
        const loadingMessage = document.getElementById('loading-services-message');
        const noServicesMessage = document.getElementById('no-services-message');
        const servicesTable = document.getElementById('services-table');
        const servicesTableBody = document.getElementById('services-table-body');

        if (!loadingMessage || !noServicesMessage || !servicesTable || !servicesTableBody) {
            console.error('One or more expected elements for service listing are missing.');
            return;
        }

        loadingMessage.classList.remove('hidden');
        noServicesMessage.classList.add('hidden');
        servicesTable.classList.add('hidden');
        servicesTableBody.innerHTML = ''; // Clear previous entries

        db.collection('services')
            .where('candidateId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot) => {
                loadingMessage.classList.add('hidden');
                if (querySnapshot.empty) {
                    noServicesMessage.classList.remove('hidden');
                    servicesTable.classList.add('hidden');
                } else {
                    noServicesMessage.classList.add('hidden');
                    servicesTable.classList.remove('hidden');
                    querySnapshot.forEach((doc) => {
                        const service = doc.data();
                        const serviceId = doc.id;
                        const row = servicesTableBody.insertRow();

                        const titleCell = row.insertCell();
                        titleCell.textContent = service.title;
                        titleCell.className = 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900';

                        const priceCell = row.insertCell();
                        priceCell.textContent = `$${service.price}`;
                        priceCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';

                        const statusCell = row.insertCell();
                        const statusBadge = document.createElement('span');
                        statusBadge.textContent = service.status;
                        statusBadge.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            service.status === 'active' ? 'bg-green-100 text-green-800' :
                            service.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }`;
                        statusCell.appendChild(statusBadge);
                        statusCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';

                        const createdCell = row.insertCell();
                        createdCell.textContent = service.createdAt && service.createdAt.toDate ? service.createdAt.toDate().toLocaleDateString() : 'N/A';
                        createdCell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';

                        const actionsCell = row.insertCell();
                        actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                        // Placeholder for actions - Edit/Delete/Pause etc.
                        const editLink = document.createElement('a');
                        editLink.href = `candidates-edit-service.html?serviceId=${serviceId}`; // TODO: Create this page
                        editLink.textContent = 'Edit';
                        editLink.className = 'text-indigo-600 hover:text-indigo-900 mr-3';

                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.className = 'text-red-600 hover:text-red-900';
                        deleteButton.onclick = () => handleDeleteService(serviceId, service.title);

                        actionsCell.appendChild(editLink);
                        actionsCell.appendChild(deleteButton);
                    });
                }
            })
            .catch((error) => {
                console.error("Error loading services: ", error);
                loadingMessage.classList.add('hidden');
                noServicesMessage.textContent = 'Error loading services. Please try again.';
                noServicesMessage.classList.remove('hidden');
                servicesTable.classList.add('hidden');
            });
    }

    async function handleDeleteService(serviceId, serviceTitle) {
        if (!confirm(`Are you sure you want to delete the service "${serviceTitle}"? This will also delete associated images.`)) {
            return;
        }

        console.log(`Attempting to delete service: ${serviceId}`);
        try {
            // TODO: Delete images from Firebase Storage first
            // This requires listing files in the service's storage folder:
            // services/{currentUser.uid}/{serviceId}/previewImage.*
            // services/{currentUser.uid}/{serviceId}/portfolioImages/*
            // This is a more complex operation, often best handled by a Cloud Function for atomicity and permissions.
            // For client-side, it's tricky as you need to know all file names or list them.
            // For now, we'll just delete the Firestore document and decrement count.
            // A full solution would involve:
            // 1. Get service doc to get image URLs/paths.
            // 2. Delete each image from Storage.
            // 3. Delete Firestore doc.
            // 4. Decrement user's service count.

            await db.collection('services').doc(serviceId).delete();
            console.log(`Service ${serviceId} deleted from Firestore.`);

            const userDocRef = db.collection('users').doc(currentUser.uid);
            await userDocRef.update({
                servicesOfferedCount: firebase.firestore.FieldValue.increment(-1)
            });
            console.log(`Decremented servicesOfferedCount for user ${currentUser.uid}.`);

            alert(`Service "${serviceTitle}" deleted successfully.`);
            loadServices(); // Refresh the list
        } catch (error) {
            console.error("Error deleting service: ", error);
            alert(`Failed to delete service: ${error.message}`);
        }
    }

});
