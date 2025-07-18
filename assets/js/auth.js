document.addEventListener('DOMContentLoaded', () => {
    const dynamicMenu = document.getElementById('dynamic-menu');

    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    renderMenu(userData.userType);
                } else {
                    renderMenu(null); // No user data found
                }
            }).catch(error => {
                console.error("Error getting user data:", error);
                renderMenu(null);
            });
        } else {
            renderMenu(null); // No user logged in
        }
    });

    function renderMenu(userType) {
        let menuHtml = `
            <ul class="list flex items-center gap-5 h-full">
                <li class="h-full">
                    <a href="index.html" class="flex items-center gap-1 h-full text-white duration-300">
                        <span class="text-title relative">Accueil</span>
                    </a>
                </li>
        `;

        if (userType === 'candidate') {
            menuHtml += `
                <li class="h-full relative group">
                    <a href="#!" class="flex items-center gap-1 h-full text-white duration-300">
                        <span class="text-title relative">Pour les Candidats</span>
                        <span class="ph-bold ph-caret-down"></span>
                    </a>
                    <div class="sub_menu absolute hidden group-hover:block p-3 -left-10 w-max bg-white rounded-lg">
                        <ul>
                            <li><a href="jobs-list.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Offres d'emploi</a></li>
                            <li><a href="project-list.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Projets disponibles</a></li>
                            <li><a href="employers-list.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Employeurs</a></li>
                            <li><a href="candidates-profile.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Mon Profil</a></li>
                        </ul>
                    </div>
                </li>
            `;
        } else if (userType === 'employer') {
            menuHtml += `
                <li class="h-full relative group">
                    <a href="#!" class="flex items-center gap-1 h-full text-white duration-300">
                        <span class="text-title relative">Pour les Employeurs</span>
                        <span class="ph-bold ph-caret-down"></span>
                    </a>
                    <div class="sub_menu absolute hidden group-hover:block p-3 -left-10 w-max bg-white rounded-lg">
                        <ul>
                            <li><a href="services-list.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Services</a></li>
                            <li><a href="candidates-list.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Candidats</a></li>
                            <li><a href="employers-profile.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Mon Profil</a></li>
                        </ul>
                    </div>
                </li>
            `;
        } else {
            // Menu for logged out users
            menuHtml += `
                <li class="h-full"><a href="jobs-list.html" class="flex items-center gap-1 h-full text-white duration-300"><span class="text-title relative">Offres d'emploi</span></a></li>
                <li class="h-full"><a href="services-list.html" class="flex items-center gap-1 h-full text-white duration-300"><span class="text-title relative">Services</span></a></li>
            `;
        }

        menuHtml += `
                <li class="h-full relative group">
                    <a href="#!" class="flex items-center gap-1 h-full text-white duration-300">
                        <span class="text-title relative">Autres pages</span>
                        <span class="ph-bold ph-caret-down"></span>
                    </a>
                    <div class="sub_menu absolute hidden group-hover:block p-3 -left-10 w-max bg-white rounded-lg">
                        <ul>
                            <li><a href="about.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">À propos</a></li>
                            <li><a href="contact.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Contact</a></li>
                            <li><a href="faqs.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">FAQ</a></li>
                            <li><a href="term-of-use.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Conditions</a></li>
                            ${!user ? `
                            <li><a href="login.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Connexion</a></li>
                            <li><a href="register.html" class="link block text-button py-[11px] px-6 rounded duration-300 hover:bg-gray-100">Inscription</a></li>
                            ` : ''}
                        </ul>
                    </div>
                </li>
            </ul>
        `;
        dynamicMenu.innerHTML = menuHtml;
    }
});
