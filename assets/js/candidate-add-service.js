document.addEventListener('DOMContentLoaded', function () {
    console.log('candidate-add-service.js loaded');

    const auth = firebase.auth();
    const db = firebase.firestore();
    // const storage = firebase.storage(); // Will be used later

    let currentUser = null;
    let userRole = null;

    auth.onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    userRole = doc.data().role;
                    if (userRole !== 'candidate') {
                        console.warn('User is not a candidate. Redirecting to login.');
                        window.location.href = 'login.html';
                    } else {
                        // User is a candidate, proceed with page initialization
                        console.log('Candidate user authenticated:', currentUser.uid);
                        initializePage();
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

    function initializePage() {
        console.log('Page initialization for candidate...');

        // Initialize Quill editor
        if (document.getElementById('service-description-editor')) {
            var quill = new Quill('#service-description-editor', {
                theme: 'snow', // or 'bubble'
                placeholder: 'Provide a detailed description of your service...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['link'], // Removed image and video for simplicity in services
                        ['clean']
                    ]
                }
            });
            console.log('Quill editor initialized.');
        } else {
            console.warn('Quill editor container #service-description-editor not found.');
        }

        // Image Preview Logic
        const previewImageInput = document.getElementById('service-preview-image-input');
        const previewImage = document.getElementById('service-preview-image');

        if (previewImageInput && previewImage) {
            previewImageInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImage.src = e.target.result;
                        previewImage.classList.remove('hidden');
                    }
                    reader.readAsDataURL(file);
                } else {
                    previewImage.src = '#';
                    previewImage.classList.add('hidden');
                }
            });
        } else {
            console.warn('Preview image input or display element not found.');
        }

        const portfolioImagesInput = document.getElementById('service-portfolio-images-input');
        const portfolioPreviewsContainer = document.getElementById('service-portfolio-previews');

        if (portfolioImagesInput && portfolioPreviewsContainer) {
            portfolioImagesInput.addEventListener('change', function(event) {
                // Clear existing previews except the label
                const existingPreviews = portfolioPreviewsContainer.querySelectorAll('img.portfolio-preview-item, div.portfolio-preview-item-container');
                existingPreviews.forEach(p => p.remove());

                const files = event.target.files;
                if (files.length > 0) {
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'portfolio-preview-item-container relative w-[100px] h-[75px] rounded overflow-hidden border border-line';

                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.alt = 'Portfolio preview';
                            img.className = 'portfolio-preview-item w-full h-full object-cover';

                            // Optional: Add a remove button for each preview
                            // const removeBtn = document.createElement('button');
                            // removeBtn.innerHTML = '&times;';
                            // removeBtn.className = 'absolute top-0 right-0 bg-red-500 text-white p-1 text-xs';
                            // removeBtn.onclick = () => { /* logic to remove file from selection and preview */ };
                            // imgContainer.appendChild(removeBtn);

                            imgContainer.appendChild(img);
                            // Prepend to keep the upload button at the end, or append and then move the label
                            portfolioPreviewsContainer.insertBefore(imgContainer, portfolioPreviewsContainer.querySelector('label'));
                        }
                        reader.readAsDataURL(file);
                    });
                }
            });
        } else {
            console.warn('Portfolio images input or previews container not found.');
        }

        // Form Submission Logic
        const addServiceForm = document.getElementById('add-service-form');
        const savePublishButton = document.getElementById('save-publish-button');
        const serviceMessageDiv = document.getElementById('service-message');

        if (addServiceForm && savePublishButton && serviceMessageDiv) {
            addServiceForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                savePublishButton.disabled = true;
                savePublishButton.textContent = 'Saving...';
                serviceMessageDiv.textContent = '';
                serviceMessageDiv.className = 'mt-4'; // Reset classes

                try {
                    const serviceTitle = document.getElementById('service-title').value;
                    const servicePrice = parseFloat(document.getElementById('service-price').value);

                    // Get selected values from custom dropdowns (main.js might handle this, direct access shown here)
                    const responseTimeSelected = document.getElementById('service-response-time-selected').dataset.title;
                    const deliveryTimeSelected = document.getElementById('service-delivery-time-selected').dataset.title;
                    const countrySelected = document.getElementById('service-country-selected').dataset.title;
                    const provinceSelected = document.getElementById('service-province-selected').dataset.title;

                    // Categories, Tools, Languages - these are complex custom components.
                    // Assuming main.js populates these or we need a robust way to get their values.
                    // For now, let's assume they are simple comma-separated values if typed, or we need to inspect main.js behavior.
                    // Placeholder:
                    const categories = Array.from(document.querySelectorAll('#service-selected-categories .item-category span.text-button')).map(el => el.textContent.trim());
                    const tools = Array.from(document.querySelectorAll('#service-selected-tools .item-category span.text-button')).map(el => el.textContent.trim());
                    const languages = Array.from(document.querySelectorAll('#service-selected-languages .item-category span.text-button')).map(el => el.textContent.trim());

                    const serviceDescription = quill.root.innerHTML; // Get HTML content from Quill

                    if (!serviceTitle || isNaN(servicePrice) || servicePrice <= 0 || !serviceDescription.trim() || serviceDescription === '<p><br></p>') {
                        throw new Error('Please fill in all required fields: Title, Price, and Description.');
                    }

                    const previewImageFile = previewImageInput.files[0];
                    if (!previewImageFile) {
                        throw new Error('Please upload a preview image for the service.');
                    }

                    const storage = firebase.storage(); // Initialize storage
                    const db = firebase.firestore(); // db is already initialized globally in this script
                    const serviceId = db.collection('services').doc().id; // Generate a new service ID

                    // 1. Upload Preview Image
                    const previewImageRef = storage.ref(`services/${currentUser.uid}/${serviceId}/previewImage.${previewImageFile.name.split('.').pop()}`);
                    await previewImageRef.put(previewImageFile);
                    const previewImageUrl = await previewImageRef.getDownloadURL();

                    // 2. Upload Portfolio Images (if any)
                    const portfolioImageFiles = portfolioImagesInput.files;
                    const portfolioImageUrls = [];
                    if (portfolioImageFiles.length > 0) {
                        for (const file of portfolioImageFiles) {
                            const portfolioImageRef = storage.ref(`services/${currentUser.uid}/${serviceId}/portfolioImages/${file.name}`);
                            await portfolioImageRef.put(file);
                            const url = await portfolioImageRef.getDownloadURL();
                            portfolioImageUrls.push(url);
                        }
                    }

                    // 3. Prepare Service Data for Firestore
                    const serviceData = {
                        title: serviceTitle,
                        price: servicePrice,
                        responseTime: responseTimeSelected,
                        deliveryTime: deliveryTimeSelected,
                        categories: categories,
                        tools: tools,
                        languages: languages,
                        country: countrySelected,
                        province: provinceSelected,
                        description: serviceDescription,
                        previewImageUrl: previewImageUrl,
                        portfolioImageUrls: portfolioImageUrls,
                        candidateId: currentUser.uid,
                        candidateName: auth.currentUser.displayName || auth.currentUser.email, // Or fetch from user doc
                        status: 'active', // Or 'pending_review'
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        // Addons will be handled later
                    };

                    // 4. Save Service to Firestore
                    await db.collection('services').doc(serviceId).set(serviceData);

                    // 5. Update servicesOfferedCount for the candidate
                    const userDocRef = db.collection('users').doc(currentUser.uid);
                    await userDocRef.update({
                        servicesOfferedCount: firebase.firestore.FieldValue.increment(1)
                    });

                    serviceMessageDiv.textContent = 'Service published successfully!';
                    serviceMessageDiv.classList.add('text-green-500');
                    addServiceForm.reset(); // Reset form fields
                    quill.setText(''); // Clear Quill editor
                    previewImage.src = '#'; // Clear preview image
                    previewImage.classList.add('hidden');
                    const existingPortfolioPreviews = portfolioPreviewsContainer.querySelectorAll('img.portfolio-preview-item, div.portfolio-preview-item-container');
                    existingPortfolioPreviews.forEach(p => p.remove()); // Clear portfolio previews

                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = 'candidates-my-services.html'; // Or the actual page for listing candidate's services
                    }, 2000);

                } catch (error) {
                    console.error('Error publishing service:', error);
                    serviceMessageDiv.textContent = `Error: ${error.message}`;
                    serviceMessageDiv.classList.add('text-red-500');
                } finally {
                    savePublishButton.disabled = false;
                    savePublishButton.textContent = 'Save & Publish';
                }
            });
        } else {
            console.warn('Add service form, save button, or message div not found.');
        }
    }
});
