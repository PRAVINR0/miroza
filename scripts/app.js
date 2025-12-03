/* MIROZA Main JS - Optimized for Performance & TOI Style */
(function(){
  'use strict';
  const THEME_STORAGE_KEY = 'theme';
  
  /* Utilities */
  window.MIROZA = window.MIROZA || {};
  window.MIROZA.utils = {
    qs: (sel, ctx=document) => ctx.querySelector(sel),
    qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
    safeHTML(str) {
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML;
    },
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  };

  /* Data Store Module */
  window.MIROZA.store = (function(){
    let _cache = {};

    async function fetchFeed(name) {
        if (_cache[name]) return _cache[name];
        try {
            const res = await fetch(`/data/${name}.json`);
            if (!res.ok) throw new Error(`Failed to load ${name}`);
            const data = await res.json();
            _cache[name] = data;
            return data;
        } catch (err) {
            console.warn(`Error loading feed ${name}:`, err);
            return [];
        }
    }

    return {
        getLatest: () => fetchFeed('latest'),
        getNews: () => fetchFeed('news-feed'),
        getBlogs: () => fetchFeed('blogs-feed'),
        getArticles: () => fetchFeed('articles-feed'),
        getAll: () => fetchFeed('posts')
    };
  })();

  /* UI Builder Module */
  window.MIROZA.builder = (function(){
    function build(post) {
      const article = document.createElement('article');
      article.className = 'card post-card';

      const rawImage = post.image;
      const imgUrl = rawImage
        ? (typeof rawImage === 'string' ? rawImage : (rawImage.src || '/assets/images/hero-insight-800.svg'))
        : '/assets/images/hero-insight-800.svg';
      const imgAlt = (rawImage && typeof rawImage === 'object' && rawImage.alt) ? rawImage.alt : post.title || '';

      let link = post.link || post.url || '';
      if(!link && post.slug) {
          const cat = (post.category || '').toLowerCase();
          if(cat === 'blog') link = `/blogs/${post.slug}.html`;
          else if(cat === 'news' || cat === 'india') link = `/news/${post.slug}.html`;
          else link = `/articles/${post.slug}.html`;
      }
      if (!link) link = '#';

      const html = `
        <a href="${link}" class="card-link" aria-label="Read ${window.MIROZA.utils.safeHTML(post.title || '')}">
          <div class="card-image-wrap">
             <img src="${imgUrl}" alt="${window.MIROZA.utils.safeHTML(imgAlt)}" loading="lazy" decoding="async" width="400" height="225" onerror="this.onerror=null;this.src='/assets/images/hero-insight-800.svg'" />
          </div>
          <div class="card-content card-body">
            <div class="card-meta">
              <span class="category">${window.MIROZA.utils.safeHTML(post.category || 'Story')}</span> •
              <span class="date">${post.date ? new Date(post.date).toLocaleDateString() : ''}</span>
            </div>
            <h3 class="card-title">
              ${window.MIROZA.utils.safeHTML(post.title || '')}
            </h3>
            <p class="card-excerpt">${window.MIROZA.utils.safeHTML(post.excerpt || '')}</p>
          </div>
        </a>
      `;
      article.innerHTML = html;
      return article;
    }
    return { build };
  })();

  /* Theme Manager */
  window.MIROZA.theme = (function(){
    function init(){
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if(stored){ document.documentElement.dataset.theme = stored; }
      else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
        document.documentElement.dataset.theme = 'dark';
      }
      updateIcon();
      
      const btn = window.MIROZA.utils.qs('.theme-toggle');
      if(btn) btn.addEventListener('click', toggle);
    }
    function toggle(){
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem(THEME_STORAGE_KEY, next);
      updateIcon();
    }
    function updateIcon(){
      const btnImg = window.MIROZA.utils.qs('.theme-toggle img');
      if(btnImg){
        const isDark = document.documentElement.dataset.theme === 'dark';
        btnImg.src = isDark ? '/assets/icons/sun.svg' : '/assets/icons/moon.svg';
        btnImg.alt = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      }
    }
    return { init, toggle };
  })();

  /* Navigation (Mobile Drawer Logic) */
  window.MIROZA.nav = (function(){
    let isOpen = false;
    let overlay;
    
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMenu);
    }

    function closeMenu() {
        isOpen = false;
        const nav = window.MIROZA.utils.qs('.main-nav');
        const toggleBtn = window.MIROZA.utils.qs('.menu-toggle');
        if(nav) nav.classList.remove('open');
        if(overlay) overlay.classList.remove('active');
        if(toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.innerHTML = '<img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />';
        }
        document.body.style.overflow = '';
    }

    function openMenu() {
        isOpen = true;
        const nav = window.MIROZA.utils.qs('.main-nav');
        const toggleBtn = window.MIROZA.utils.qs('.menu-toggle');
        if(nav) nav.classList.add('open');
        if(overlay) overlay.classList.add('active');
        if(toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'true');
            toggleBtn.innerHTML = '<img src="/assets/icons/close.svg" alt="Close" width="24" height="24" />';
        }
        document.body.style.overflow = 'hidden';
    }

    function handleResize() {
        const width = window.innerWidth;
        const nav = window.MIROZA.utils.qs('.main-nav');
        const searchForm = window.MIROZA.utils.qs('.search-form');
        const headerInner = window.MIROZA.utils.qs('.header-inner');
        
        if (!nav || !searchForm || !headerInner) return;
        
        // Mobile Logic (< 992px)
        if (width < 992) {
            // Ensure search is in the drawer
            let mobileSearch = nav.querySelector('.mobile-search-container');
            if (!mobileSearch) {
                mobileSearch = document.createElement('div');
                mobileSearch.className = 'mobile-search-container';
                nav.insertBefore(mobileSearch, nav.firstChild);
            }
            if (!mobileSearch.contains(searchForm)) {
                mobileSearch.appendChild(searchForm);
            }
        } else {
            // Desktop Logic: Move search back to header
            if (isOpen) closeMenu();
            if (!headerInner.contains(searchForm)) {
                // Insert before theme toggle if possible, or append
                const themeToggle = window.MIROZA.utils.qs('.theme-toggle');
                if(themeToggle) headerInner.insertBefore(searchForm, themeToggle.parentNode); // theme toggle is usually in header-tools
                else headerInner.appendChild(searchForm);
                
                // Actually, in my HTML structure, search-form is a direct child of header-inner usually
                // Let's just append to header-inner and let CSS Grid handle placement.
                headerInner.appendChild(searchForm);
            }
            // Remove mobile search container if empty
            const mobileSearch = nav.querySelector('.mobile-search-container');
            if (mobileSearch) mobileSearch.remove();
        }
    }

    function highlightActive(){
      const path = window.location.pathname;
      const links = window.MIROZA.utils.qsa('.main-nav a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (path === href || (path === '/' && href === '/index.html') || (path === '/index.html' && href === '/')) {
          link.setAttribute('aria-current', 'page');
        } else if (href !== '/' && href !== '/index.html' && path.includes(href)) {
           link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function init(){
      createOverlay();
      highlightActive();
      
      const toggleBtn = window.MIROZA.utils.qs('.menu-toggle');
      if(toggleBtn) {
          toggleBtn.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
      }

      window.addEventListener('resize', window.MIROZA.utils.debounce(handleResize, 200));
      handleResize(); // Initial check
    }
    return { init };
  })();

  /* Home Page Logic */
  window.MIROZA.home = (function(){
    async function init(){
      const [latest, news, blogs, articles] = await Promise.all([
          window.MIROZA.store.getLatest(),
          window.MIROZA.store.getNews(),
          window.MIROZA.store.getBlogs(),
          window.MIROZA.store.getArticles()
      ]);

      renderList('latest-cards', latest.slice(0, 12));
      renderList('news-cards', news.slice(0, 4));
      renderList('blog-cards', blogs.slice(0, 4));
      renderList('articles-cards', articles.slice(0, 4));
    }

    function renderList(id, items){
        const container = document.getElementById(id);
        if(!container) return;
        container.innerHTML = '';
        if(!items.length) { container.innerHTML = '<p>No content available.</p>'; return; }
        items.forEach(item => container.appendChild(window.MIROZA.builder.build(item)));
    }
    return { init };
  })();

  /* Listing Pages */
  window.MIROZA.listing = (function(){
    async function init(type){
        let containerId, items, paginationId;
        
        if (type === 'blog') {
            containerId = 'posts-grid';
            items = await window.MIROZA.store.getBlogs();
            paginationId = 'blogs-pagination';
        } else if (type === 'article') {
            containerId = 'articles-list';
            items = await window.MIROZA.store.getArticles();
            paginationId = 'articles-pagination';
        } else if (type === 'news') {
            containerId = 'india-news-list';
            items = await window.MIROZA.store.getNews();
            paginationId = 'india-news-pagination';
        }

        const container = document.getElementById(containerId);
        if(!container) return;

        const pageSize = 12;
        let currentPage = 1;
        
        function render(){
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const slice = items.slice(start, end);
            
            if(currentPage === 1) container.innerHTML = '';
            slice.forEach(item => container.appendChild(window.MIROZA.builder.build(item)));

            let pagination = document.getElementById(paginationId);
            if(!pagination) {
                pagination = document.createElement('div');
                pagination.id = paginationId;
                pagination.className = 'pagination';
                container.parentNode.appendChild(pagination);
            }
            pagination.innerHTML = '';
            
            if(end < items.length){
                const btn = document.createElement('button');
                btn.className = 'load-more';
                btn.textContent = 'Load More';
                btn.onclick = () => { currentPage++; render(); };
                pagination.appendChild(btn);
            }
        }
        render();
    }
    return { 
        initArticles: () => init('article'),
        initBlogs: () => init('blog'),
        initNews: () => init('news')
    };
  })();

  /* Search */
  window.MIROZA.search = (function(){
    function init(){
      const input = document.getElementById('search');
      const suggestions = document.getElementById('search-suggestions');
      const form = input ? input.closest('form') : null;
      
      if(!input || !suggestions) return;

      if(form) {
          form.removeAttribute('onsubmit');
          form.addEventListener('submit', (e) => {
              e.preventDefault();
              const q = input.value.trim();
              if(q) window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
          });
      }

      let searchIndex = null;

      input.addEventListener('input', window.MIROZA.utils.debounce(async (e) => {
        const q = e.target.value.toLowerCase();
        if(q.length < 2) { suggestions.hidden = true; return; }

        if(!searchIndex) {
            suggestions.innerHTML = '<div class="search-loading">Loading...</div>';
            suggestions.hidden = false;
            try {
                const res = await fetch('/data/search.json');
                if(!res.ok) throw new Error('Failed to load search index');
                searchIndex = await res.json();
            } catch(err) {
                console.error(err);
                suggestions.innerHTML = '<div class="search-error">Error</div>';
                return;
            }
        }

        const matches = searchIndex.filter(p => (p.t || '').toLowerCase().includes(q)).slice(0, 5);
        suggestions.innerHTML = '';
        
        if(matches.length){
          suggestions.hidden = false;
          matches.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'search-suggestion';
            btn.innerHTML = `<strong>${window.MIROZA.utils.safeHTML(p.t)}</strong><br><span>${window.MIROZA.utils.safeHTML(p.c || '')}</span>`;
            btn.onclick = () => window.location.href = p.u || '#';
            suggestions.appendChild(btn);
          });
        } else {
            suggestions.innerHTML = '<div class="search-no-results">No matches found</div>';
        }
      }, 300));

      document.addEventListener('click', (e) => {
        if(!input.contains(e.target) && !suggestions.contains(e.target)) suggestions.hidden = true;
      });
    }
    return { init };
  })();

  /* Init */
  document.addEventListener('DOMContentLoaded', () => {
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.search.init();

    const page = document.body.dataset.page;
    if(page === 'home') window.MIROZA.home.init();
    else if(page === 'articles') window.MIROZA.listing.initArticles();
    else if(page === 'blog') window.MIROZA.listing.initBlogs();
    else if(page === 'india-news') window.MIROZA.listing.initNews();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });

})();
