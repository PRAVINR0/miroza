document.addEventListener('DOMContentLoaded', () => {
    console.log('Miroza App Loaded');

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // Dark Mode Toggle
    const darkModeBtn = document.getElementById('darkModeBtn');
    const body = document.body;
    
    // Check local storage
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // Search Toggle
    const searchBtn = document.getElementById('searchBtn');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit');

    if (searchBtn && searchContainer) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && e.target !== searchBtn) {
                searchContainer.classList.remove('active');
            }
        });

        // Simple Search Functionality (Google Site Search)
        if (searchSubmit && searchInput) {
            searchSubmit.addEventListener('click', () => {
                const query = searchInput.value;
                if (query) {
                    window.open(`https://www.google.com/search?q=site:miroza.online+${encodeURIComponent(query)}`, '_blank');
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value;
                    if (query) {
                        window.open(`https://www.google.com/search?q=site:miroza.online+${encodeURIComponent(query)}`, '_blank');
                    }
                }
            });
        }
    }

    // Sticky Header Logic
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
