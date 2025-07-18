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
                if (userData.role === 'candidate') {
                    // Mettre à jour le tableau de bord du candidat
                    updateCandidateDashboard(user.uid);
                } else {
                    // Rediriger si l'utilisateur n'est pas un candidat
                    window.location.href = 'index.html';
                }
            }
        } else {
            // L'utilisateur n'est pas connecté, le rediriger
            window.location.href = 'login.html';
        }
    });
});

// Mettre à jour le tableau de bord du candidat avec les données de Firestore
async function updateCandidateDashboard(userId) {
    // Mettre à jour les compteurs
    const appliedJobsCount = await getAppliedJobsCount(userId);
    const servicesOfferedCount = await getServicesOfferedCount(userId);
    // Les vues de profil et les avis ne sont pas implémentés pour le moment
    // const profileViewsCount = await getProfileViewsCount(userId);
    // const totalReviewsCount = await getTotalReviewsCount(userId);

    document.querySelector('.applied_job .number').textContent = appliedJobsCount;
    document.querySelector('.services_offered .number').textContent = servicesOfferedCount;
    // document.querySelector('.views_profile .number').textContent = profileViewsCount;
    // document.querySelector('.total_reviews .number').textContent = totalReviewsCount;

    // Mettre à jour le graphique des vues de page (données factices pour le moment)
    updatePageViewsChart();

    // Mettre à jour la liste des notifications (données factices pour le moment)
    updateNotifications();

    // Mettre à jour le tableau des travaux actifs
    updateActiveWorkTable(userId);

    // Mettre à jour le tableau des commandes de services récentes
    updateRecentServiceOrdersTable(userId);
}

// Fonctions pour récupérer les données de Firestore
async function getAppliedJobsCount(userId) {
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("candidateId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

async function getServicesOfferedCount(userId) {
    const servicesRef = collection(db, "services");
    const q = query(servicesRef, where("sellerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

// ... (fonctions pour les vues de profil et les avis à implémenter)

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
        { message: 'Votre candidature pour le poste de UI Designer a été rejetée.', time: 'Il y a 25 minutes' },
        { message: 'Votre candidature pour le poste de Spécialiste en sécurité Internet a été rejetée.', time: 'Il y a 1 heure' },
        { message: 'Votre candidature pour le poste de Marketing des médias sociaux a été rejetée.', time: 'Il y a 5 heures' }
    ];

    notifications.forEach(notif => {
        const item = document.createElement('li');
        item.className = 'item flex gap-2';
        item.innerHTML = `
            <span class="icon flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full bg-surface text-secondary">
                <span class="ph-fill ph-bell text-lg"></span>
            </span>
            <div class="content flex flex-col gap-2">
                <p class="title text-secondary">${notif.message}</p>
                <span class="date caption1 text-secondary">${notif.time}</span>
            </div>
        `;
        notificationList.appendChild(item);
    });
}

// Mettre à jour le tableau des travaux actifs
async function updateActiveWorkTable(userId) {
    const activeWorkTable = document.querySelector('.active_work table tbody');
    activeWorkTable.innerHTML = ''; // Vider le tableau

    // Récupérer les travaux actifs (candidatures acceptées)
    const applicationsRef = collection(db, "applications");
    const q = query(applicationsRef, where("candidateId", "==", userId), where("status", "==", "Approved"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (applicationDoc) => {
        const applicationData = applicationDoc.data();
        const jobDocRef = doc(db, "jobs", applicationData.jobId);
        const jobDoc = await getDoc(jobDocRef);

        if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            const employerDocRef = doc(db, "users", jobData.employerId);
            const employerDoc = await getDoc(employerDocRef);
            const employerData = employerDoc.exists() ? employerDoc.data() : { companyName: "Inconnu", location: "Inconnu" };

            const row = document.createElement('tr');
            row.className = 'item duration-300 hover:bg-background';
            row.innerHTML = `
                <th scope="row" class="p-5 text-left">
                    <div class="info">
                        <a href="jobs-detail1.html?id=${jobDoc.id}" class="title heading6 duration-300 hover:underline">${jobData.title}</a>
                        <div class="flex flex-wrap items-center gap-4 mt-2">
                            <a href="employers-detail1.html?id=${jobData.employerId}" class="employers flex items-center gap-2 text-secondary duration-300 hover:text-primary">
                                <span class="employers_name font-normal">${employerData.companyName}</span>
                            </a>
                            <div class="line flex-shrink-0 w-px h-4 bg-line"></div>
                            <div class="address flex items-center gap-2 text-secondary">
                                <span class="ph ph-map-pin text-xl"></span>
                                <span class="employers_address font-normal">${employerData.location}</span>
                            </div>
                        </div>
                    </div>
                </th>
                <td class="p-5">Job</td>
                <td class="p-5">${jobData.salary}</td>
                <td class="p-5 whitespace-nowrap">${new Date(jobData.deadline.seconds * 1000).toLocaleDateString()}</td>
                <td class="p-5">
                    <span class="tag bg-opacity-10 bg-features text-features text-button">Doing</span>
                </td>
                <td class="p-5">
                    <div class="flex justify-end gap-2">
                        <button class="btn_action btn_open_popup btn_view flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_view_job">
                            <span class="ph ph-eye text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_chat flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_chat">
                            <span class="ph ph-chats text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_submit flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_apply">
                            <span class="ph ph-file-arrow-up text-xl"></span>
                        </button>
                    </div>
                </td>
            `;
            activeWorkTable.appendChild(row);
        }
    });
}

// Mettre à jour le tableau des commandes de services récentes
async function updateRecentServiceOrdersTable(userId) {
    const serviceOrdersTable = document.querySelector('.recent_service_orders table tbody');
    serviceOrdersTable.innerHTML = ''; // Vider le tableau

    // Récupérer les commandes de services (où le candidat est le vendeur)
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("sellerId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (orderDoc) => {
        const orderData = orderDoc.data();
        const serviceDocRef = doc(db, "services", orderData.serviceId);
        const serviceDoc = await getDoc(serviceDocRef);

        if (serviceDoc.exists()) {
            const serviceData = serviceDoc.data();
            const buyerDocRef = doc(db, "users", orderData.buyerId);
            const buyerDoc = await getDoc(buyerDocRef);
            const buyerData = buyerDoc.exists() ? buyerDoc.data() : { companyName: "Inconnu", location: "Inconnu" };

            const row = document.createElement('tr');
            row.className = 'item duration-300 hover:bg-background';
            row.innerHTML = `
                <th scope="row" class="p-5 text-left">
                    <div class="info">
                        <a href="services-detail1.html?id=${serviceDoc.id}" class="title heading6 duration-300 hover:underline">${serviceData.title}</a>
                        <div class="flex flex-wrap items-center gap-4 mt-2">
                            <a href="employers-detail1.html?id=${orderData.buyerId}" class="employers flex items-center gap-2 text-secondary duration-300 hover:text-primary">
                                <span class="employers_name font-normal">${buyerData.companyName}</span>
                            </a>
                            <div class="line flex-shrink-0 w-px h-4 bg-line"></div>
                            <div class="address flex items-center gap-2 text-secondary">
                                <span class="ph ph-map-pin text-xl"></span>
                                <span class="employers_address font-normal">${buyerData.location}</span>
                            </div>
                        </div>
                    </div>
                </th>
                <td class="p-5 whitespace-nowrap">${new Date(orderData.orderDate.seconds * 1000).toLocaleDateString()}</td>
                <td class="p-5">${serviceData.price}</td>
                <td class="p-5">
                    <span class="tag bg-opacity-10 bg-features text-features text-button">${orderData.status}</span>
                </td>
                <td class="p-5">
                    <div class="flex justify-end gap-2">
                        <button class="btn_action btn_open_popup btn_view flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_view_buyer">
                            <span class="ph ph-eye text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_confirm flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_confirm">
                            <span class="ph ph-check text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_cancel flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_cancel">
                            <span class="ph ph-x text-xl"></span>
                        </button>
                        <button class="btn_action btn_open_popup btn_delete flex items-center justify-center relative w-10 h-10 rounded border border-line duration-300 hover:bg-primary hover:text-white" data-type="modal_delete">
                            <span class="ph ph-trash text-xl"></span>
                        </button>
                    </div>
                </td>
            `;
            serviceOrdersTable.appendChild(row);
        }
    });
}
