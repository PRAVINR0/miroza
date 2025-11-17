// Smooth fade-in animation for sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});

document.querySelectorAll('section, .post-card').forEach((el) => observer.observe(el));

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 30) {
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'rgba(255, 255, 255, 0.85)';
        nav.style.boxShadow = 'none';
    }
});

// Smooth scroll for navbar links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        window.scrollTo({
            top: target.offsetTop - 70,
            behavior: 'smooth'
        });
    });
});

// Button hover ripple effect
const ctaButton = document.querySelector('.cta');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        ctaButton.classList.add('clicked');
        setTimeout(() => ctaButton.classList.remove('clicked'), 300);
    });
}

// Future: Dynamic post loading placeholder
console.log("Miroza Script Loaded Successfully 🚀");
