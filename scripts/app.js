document.addEventListener('DOMContentLoaded', () => {
    console.log('Miroza App Loaded');

    // Mobile Menu Toggle (if implemented in HTML)
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Sticky Header Logic (Optional enhancement)
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
