/* ==========================================
   FINANPANORAMA - CONTACTO
   JavaScript de la página de contacto
   ========================================== */

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function () {
    var btn = document.getElementById('scrollTop');
    btn.classList.toggle('visible', window.scrollY > 300);
});
