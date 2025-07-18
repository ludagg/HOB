document.addEventListener('DOMContentLoaded', () => {
    const employerName = document.getElementById('employer-name');
    const employerInfo = document.getElementById('employer-info');
    const jobsList = document.getElementById('jobs-list');
    const jobForm = document.getElementById('job-form');
    const jobCategory = document.getElementById('job-category');
    const projectsList = document.getElementById('projects-list');
    const projectForm = document.getElementById('project-form');
    const projectCategory = document.getElementById('project-category');

    let currentUser = null;

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadProfile();
            loadJobs();
            loadProjects();
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
            employerName.textContent = `${userData.firstName} ${userData.lastName}`;
            employerInfo.innerHTML = `
                <p><strong>Email:</strong> ${userData.email}</p>
                <p><strong>Téléphone:</strong> ${userData.phone}</p>
                <p><strong>Localisation:</strong> ${userData.city}, ${userData.country}</p>
                <p><strong>Profession:</strong> ${userData.profession}</p>
            `;
        }
    }

    async function loadJobs() {
        const jobsSnapshot = await db.collection('jobs').where('employerId', '==', currentUser.uid).get();
        jobsList.innerHTML = '';
        jobsSnapshot.forEach(doc => {
            const job = doc.data();
            const jobElement = `
                <li class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-bold">${job.title}</h3>
                    <p class="text-gray-600">${job.description}</p>
                    <p class="mt-2"><strong>Salaire:</strong> $${job.salary}</p>
                    <p><strong>Catégorie:</strong> ${job.category}</p>
                </li>
            `;
            jobsList.insertAdjacentHTML('beforeend', jobElement);
        });
    }

    async function loadProjects() {
        const projectsSnapshot = await db.collection('projects').where('employerId', '==', currentUser.uid).get();
        projectsList.innerHTML = '';
        projectsSnapshot.forEach(doc => {
            const project = doc.data();
            const projectElement = `
                <li class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-bold">${project.title}</h3>
                    <p class="text-gray-600">${project.description}</p>
                    <p class="mt-2"><strong>Budget:</strong> $${project.budget}</p>
                    <p><strong>Catégorie:</strong> ${project.category}</p>
                </li>
            `;
            projectsList.insertAdjacentHTML('beforeend', projectElement);
        });
    }

    async function populateCategories() {
        try {
            const categoriesSnapshot = await db.collection('categories').get();
            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                const jobOption = document.createElement('option');
                jobOption.value = category.name;
                jobOption.textContent = category.name;
                jobCategory.appendChild(jobOption);

                const projectOption = document.createElement('option');
                projectOption.value = category.name;
                projectOption.textContent = category.name;
                projectCategory.appendChild(projectOption);
            });
        } catch (error) {
            console.error("Error populating categories:", error);
        }
    }

    jobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = jobForm.title.value;
        const description = jobForm.description.value;
        const salary = parseFloat(jobForm.salary.value);
        const category = jobForm.category.value;

        if (title && description && salary && category) {
            try {
                await db.collection('jobs').add({
                    title,
                    description,
                    salary,
                    category,
                    employerId: currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                jobForm.reset();
                loadJobs();
            } catch (error) {
                console.error("Error adding job: ", error);
            }
        }
    });

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = projectForm.title.value;
        const description = projectForm.description.value;
        const budget = parseFloat(projectForm.budget.value);
        const category = projectForm.category.value;

        if (title && description && budget && category) {
            try {
                await db.collection('projects').add({
                    title,
                    description,
                    budget,
                    category,
                    employerId: currentUser.uid,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                projectForm.reset();
                loadProjects();
            } catch (error) {
                console.error("Error adding project: ", error);
            }
        }
    });
});
