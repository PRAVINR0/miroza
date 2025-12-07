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

        // Simple Search Functionality (Local)
        if (searchSubmit && searchInput) {
            const performSearch = () => {
                const query = searchInput.value;
                if (query) {
                    // Check if we are in a subdirectory
                    const path = window.location.pathname;
                    const depth = (path.match(/\//g) || []).length;
                    let prefix = '';
                    if (depth >= 2 && !path.endsWith('index.html') && !path.endsWith('/')) {
                         prefix = '../';
                    }
                    
                    // Handle specific case for root files vs subdir files
                    // If we are in /news/something.html, we need ../search.html
                    // If we are in /index.html, we need search.html
                    
                    // A safer way is to use absolute path if hosted at root, but relative is safer for local file opening
                    // Let's try to determine relative path based on current location
                    
                    if (window.location.href.includes('/news/') || window.location.href.includes('/articles/') || window.location.href.includes('/blogs/')) {
                        window.location.href = `../search.html?q=${encodeURIComponent(query)}`;
                    } else {
                        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            };

            searchSubmit.addEventListener('click', performSearch);

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
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
