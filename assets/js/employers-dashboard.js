// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fonction pour récupérer la configuration Firebase
async function getFirebaseConfig() {
    const response = await fetch('/firebase-config');
    return await response.json();
}

// Initialiser Firebase
let app, auth, db;
getFirebaseConfig().then(firebaseConfig => {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Écouter les changements d'état d'authentification
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // L'utilisateur est connecté
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === 'employer') {
                    // Mettre à jour le tableau de bord de l'employeur
                    updateEmployerDashboard(user.uid);
                } else {
                    // Rediriger si l'utilisateur n'est pas un employeur
                    window.location.href = 'index.html';
                }
            }
        } else {
            // L'utilisateur n'est pas connecté, le rediriger
            window.location.href = 'login.html';
        }
    });
});

// Mettre à jour le tableau de bord de l'employeur avec les données de Firestore
async function updateEmployerDashboard(userId) {
    // Mettre à jour les compteurs
    const postedJobsCount = await getPostedJobsCount(userId);
    const postedProjectsCount = await getPostedProjectsCount(userId);
    const applicationsCount = await getApplicationsCount(userId);
    // const totalReviewsCount = await getTotalReviewsCount(userId);

    document.querySelector('.applied_job .number').textContent = postedJobsCount;
    document.querySelector('.services_offered .number').textContent = postedProjectsCount;
    document.querySelector('.views_profile .number').textContent = applicationsCount;
    // document.querySelector('.total_reviews .number').textContent = totalReviewsCount;

    // Mettre à jour le graphique des vues de page (données factices pour le moment)
    updatePageViewsChart();

    // Mettre à jour la liste des notifications (données factices pour le moment)
    updateNotifications();

    // Mettre à jour le tableau des candidats récents
    updateRecentApplicantsTable(userId);

    // Mettre à jour le tableau des propositions récentes
    updateRecentProposalsTable(userId);
}

// Fonctions pour récupérer les données de Firestore
async function getPostedJobsCount(userId) {
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("employerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

async function getPostedProjectsCount(userId) {
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("employerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

async function getApplicationsCount(userId) {
    // Récupérer tous les emplois de l'employeur
    const jobsRef = collection(db, "jobs");
    const jobsQuery = query(jobsRef, where("employerId", "==", userId));
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);

    if (jobIds.length === 0) {
        return 0;
    }

    // Récupérer toutes les candidatures pour ces emplois
    const applicationsRef = collection(db, "applications");
    const applicationsQuery = query(applicationsRef, where("jobId", "in", jobIds));
    const applicationsSnapshot = await getDocs(applicationsQuery);
    return applicationsSnapshot.size;
}


// ... (fonctions pour les avis à implémenter)

// Mettre à jour le graphique (avec des données factices)
function updatePageViewsChart() {
    var options = {
        series: [{
            name: 'Page Views',
            data: [31, 40, 28, 51, 42, 109, 100]
        }],
        chart: {
            height: 350,
            type: 'area'
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
            categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        },
    };

    var chart = new ApexCharts(document.querySelector("#chart-timeline"), options);
    chart.render();
}

// Mettre à jour les notifications (avec des données factices)
function updateNotifications() {
    const notificationList = document.querySelector('.list_notification');
    // Vider la liste existante
    notificationList.innerHTML = '';
    // Ajouter de nouvelles notifications
    const notifications = [
        { candidate: 'John Smith', job: 'UX/UI Design', time: 'Il y a 25 minutes' },
        { candidate: 'John Hawkins', job: 'Project Manager', time: 'Il y a 1 heure' },
        { candidate: 'Dianne Russell', job: 'Web Developement', time: 'Il y a 5 heures' }
    ];

    notifications.forEach(notif => {
        const item = document.createElement('li');
        item.className = 'item flex gap-2';
        item.innerHTML = `
            <span class="icon flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full bg-surface text-secondary">
                <span class="ph-fill ph-bell text-lg"></span>
            </span>
            <div class="content flex flex-col gap-2">
                <p class="title text-secondary"><a href="#" class="text-black hover:underline">${notif.candidate}</a> a postulé pour un emploi <a href="#" class="text-black hover:underline">${notif.job}</a></p>
                <span class="date caption1 text-secondary">${notif.time}</span>
            </div>
        `;
        notificationList.appendChild(item);
    });
}

// Mettre à jour le tableau des candidats récents
async function updateRecentApplicantsTable(userId) {
    const recentApplicantsTable = document.querySelector('.recent_applicants table tbody');
    recentApplicantsTable.innerHTML = ''; // Vider le tableau

    // Récupérer les emplois de l'employeur
    const jobsRef = collection(db, "jobs");
    const jobsQuery = query(jobsRef, where("employerId", "==", userId));
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);

    if (jobIds.length === 0) {
        return;
    }

    // Récupérer les candidatures pour ces emplois
    const applicationsRef = collection(db, "applications");
    const applicationsQuery = query(applicationsRef, where("jobId", "in", jobIds));
    const applicationsSnapshot = await getDocs(applicationsQuery);

    applicationsSnapshot.forEach(async (applicationDoc) => {
        const applicationData = applicationDoc.data();
        const candidateDocRef = doc(db, "users", applicationData.candidateId);
        const candidateDoc = await getDoc(candidateDocRef);
        const jobDocRef = doc(db, "jobs", applicationData.jobId);
        const jobDoc = await getDoc(jobDocRef);

        if (candidateDoc.exists() && jobDoc.exists()) {
            const candidateData = candidateDoc.data();
            const jobData = jobDoc.data();

            const row = document.createElement('tr');
            row.className = 'item duration-300 hover:bg-background';
            row.innerHTML = `
                <th scope="row" class="p-5 text-left">
                    <div class="info flex items-center gap-3">
                        <a href="candidates-detail1.html?id=${candidateDoc.id}" class="avatar flex-shrink-0 w-15 h-15 rounded-full overflow-hidden">
                            <img src="${candidateData.profilePicture || './assets/images/avatar/IMG-1.webp'}" alt="avatar" class="w-full h-full object-cover" />
                        </a>
                        <a href="candidates-detail1.html?id=${candidateDoc.id}" class="block">
                            <strong class="candidates_name -style-1 heading6 duration-300 hover:text-primary">${candidateData.fullName}</strong>
                            <div class="address flex items-center gap-2 mt-1 text-secondary">
                                <span class="ph ph-map-pin text-xl"></span>
                                <span class="employers_address font-normal">${candidateData.location}</span>
                            </div>
                        </a>
                    </div>
                </th>
                <td class="p-5 heading6">${jobData.title}</td>
                <td class="p-5 whitespace-nowrap">${new Date(applicationData.applicationDate.seconds * 1000).toLocaleDateString()}</td>
                <td class="p-5">
                    <span class="tag bg-opacity-10 bg-yellow text-yellow text-button">${applicationData.status}</span>
                </td>
                <td class="p-5">
                    <div class="flex justify-end gap-2">
                        <button class="btn_action btn_open_popup btn_create_metting flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_create_meeting">
                            <span class="ph ph-video-camera text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_approved_application flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_approved_application">
                            <span class="ph ph-check text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_undo_approved flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_undo_approved">
                            <span class="ph ph-box-arrow-down text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_reject flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_reject">
                            <span class="ph ph-x text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_delete flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_delete">
                            <span class="ph ph-trash text-xl"></span>
                        </button>
                    </div>
                </td>
            `;
            recentApplicantsTable.appendChild(row);
        }
    });
}

// Mettre à jour le tableau des propositions récentes
async function updateRecentProposalsTable(userId) {
    const recentProposalsTable = document.querySelector('.recent_proposals table tbody');
    recentProposalsTable.innerHTML = ''; // Vider le tableau

    // Récupérer les projets de l'employeur
    const projectsRef = collection(db, "projects");
    const projectsQuery = query(projectsRef, where("employerId", "==", userId));
    const projectsSnapshot = await getDocs(projectsQuery);
    const projectIds = projectsSnapshot.docs.map(doc => doc.id);

    if (projectIds.length === 0) {
        return;
    }

    // Récupérer les propositions pour ces projets
    const proposalsRef = collection(db, "proposals");
    const proposalsQuery = query(proposalsRef, where("projectId", "in", projectIds));
    const proposalsSnapshot = await getDocs(proposalsQuery);

    proposalsSnapshot.forEach(async (proposalDoc) => {
        const proposalData = proposalDoc.data();
        const candidateDocRef = doc(db, "users", proposalData.candidateId);
        const candidateDoc = await getDoc(candidateDocRef);
        const projectDocRef = doc(db, "projects", proposalData.projectId);
        const projectDoc = await getDoc(projectDocRef);

        if (candidateDoc.exists() && projectDoc.exists()) {
            const candidateData = candidateDoc.data();
            const projectData = projectDoc.data();

            const row = document.createElement('tr');
            row.className = 'item duration-300 hover:bg-background';
            row.innerHTML = `
                <th scope="row" class="p-5 text-left">
                    <div class="info flex items-center gap-3">
                        <a href="candidates-detail1.html?id=${candidateDoc.id}" class="avatar flex-shrink-0 w-15 h-15 rounded-full overflow-hidden">
                            <img src="${candidateData.profilePicture || './assets/images/avatar/IMG-5.webp'}" alt="avatar" class="w-full h-full object-cover" />
                        </a>
                        <a href="candidates-detail1.html?id=${candidateDoc.id}" class="block">
                            <strong class="candidates_name -style-1 heading6 duration-300 hover:text-primary">${candidateData.fullName}</strong>
                            <div class="address flex items-center gap-2 mt-1 text-secondary">
                                <span class="ph ph-map-pin text-xl"></span>
                                <span class="employers_address font-normal">${candidateData.location}</span>
                            </div>
                        </a>
                    </div>
                </th>
                <td class="p-5 heading6 max-w-60">
                    <p class="project_name -style-1">${projectData.title}</p>
                </td>
                <td class="p-5 whitespace-nowrap">${new Date(proposalData.proposalDate.seconds * 1000).toLocaleDateString()}</td>
                <td class="p-5">
                    <span class="tag bg-opacity-10 bg-yellow text-yellow text-button">${proposalData.status}</span>
                </td>
                <td class="p-5">
                    <div class="flex justify-end gap-2">
                         <button class="btn_action btn_open_popup btn_create_metting flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_create_meeting">
                            <span class="ph ph-video-camera text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_approved_application flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_approved_application">
                            <span class="ph ph-check text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_undo_approved flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_undo_approved">
                            <span class="ph ph-box-arrow-down text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_reject flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_reject">
                            <span class="ph ph-x text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_delete flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_delete">
                            <span class="ph ph-trash text-xl"></span>
                        </button>
                    </div>
                </td>
            `;
            recentProposalsTable.appendChild(row);
        }
    });
}
