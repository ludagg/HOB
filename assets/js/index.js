// Gestion des formulaires
handleFormSubmit('registerFormCandidate', 'candidate');
handleFormSubmit('registerFormEmployer', 'employer');

// Gestion du menu mobile
const humburgerBtn = document.querySelector('.humburger_btn');
const menuMobile = document.querySelector('.menu_mobile');
const menuMobileClose = document.querySelector('.menu_mobile_close');

if (humburgerBtn) humburgerBtn.addEventListener('click', () => menuMobile.classList.remove('hidden'));
if (menuMobileClose) menuMobileClose.addEventListener('click', () => menuMobile.classList.add('hidden'));

// Gestion des sous-menus mobiles
document.querySelectorAll('.toggle-submenu').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle('hidden');
    });
});

document.querySelectorAll('.back_btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.parentElement.classList.add('hidden');
    });
});
