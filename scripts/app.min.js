/* MIROZA Main JS - Optimized for Performance */
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

  /* Data Store Module - Optimized to use segmented feeds */
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
        getAll: () => fetchFeed('posts') // Only load full dataset if absolutely needed (e.g. global search)
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
            <span class="read-more" aria-hidden="true">Read Article</span>
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
    }
    function toggle(){
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem(THEME_STORAGE_KEY, next);
      updateIcon();
    }
    function updateIcon(){
      const btn = window.MIROZA.utils.qs('.theme-toggle img');
      if(btn){
        const isDark = document.documentElement.dataset.theme === 'dark';
        btn.src = isDark ? '/assets/icons/sun.svg' : '/assets/icons/moon.svg';
        btn.alt = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      }
    }
    return { init, toggle };
  })();

  /* Navigation */
  window.MIROZA.nav = (function(){
    let isOpen = false;
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
      highlightActive();
      const toggleBtn = window.MIROZA.utils.qs('.menu-toggle');
      const nav = window.MIROZA.utils.qs('.main-nav');
      if(!toggleBtn || !nav) return;
      toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        nav.classList.toggle('open', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.innerHTML = isOpen
          ? '<img src="/assets/icons/close.svg" alt="Close" width="24" height="24" />'
          : '<img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />';
      });
    }
    return { init };
  })();

  /* Home Page Logic */
  window.MIROZA.home = (function(){
    async function init(){
      // Load feeds in parallel
      const [latest, news, blogs, articles] = await Promise.all([
          window.MIROZA.store.getLatest(),
          window.MIROZA.store.getNews(),
          window.MIROZA.store.getBlogs(),
          window.MIROZA.store.getArticles()
      ]);

      renderList('latest-cards', latest.slice(0, 12)); // Show top 12 latest
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

  /* Listing Pages (Articles/Blogs) */
  window.MIROZA.listing = (function(){
    async function init(type){
        const containerId = type === 'blog' ? 'posts-grid' : 'articles-list';
        const container = document.getElementById(containerId);
        if(!container) return;

        let items = [];
        if(type === 'blog') items = await window.MIROZA.store.getBlogs();
        else items = await window.MIROZA.store.getArticles();

        // Simple pagination
        const pageSize = 12;
        let currentPage = 1;
        
        function render(){
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const slice = items.slice(start, end);
            
            if(currentPage === 1) container.innerHTML = '';
            slice.forEach(item => container.appendChild(window.MIROZA.builder.build(item)));

            // Handle "Load More"
            const paginationId = type === 'blog' ? 'blogs-pagination' : 'articles-pagination';
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
        initBlogs: () => init('blog')
    };
  })();

  /* Search - Lazy Load Full Data */
  window.MIROZA.search = (function(){
    function init(){
      const input = document.getElementById('search');
      const suggestions = document.getElementById('search-suggestions');
      if(!input || !suggestions) return;

      let allPosts = null;

      input.addEventListener('input', window.MIROZA.utils.debounce(async (e) => {
        const q = e.target.value.toLowerCase();
        if(q.length < 2) { suggestions.hidden = true; return; }

        if(!allPosts) {
            // Lazy load the full index only when searching
            suggestions.innerHTML = '<div class="search-loading">Loading index...</div>';
            suggestions.hidden = false;
            allPosts = await window.MIROZA.store.getAll();
        }

        const matches = allPosts.filter(p => (p.title || '').toLowerCase().includes(q)).slice(0, 5);
        suggestions.innerHTML = '';
        
        if(matches.length){
          suggestions.hidden = false;
          matches.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'search-suggestion';
            btn.innerHTML = `<strong>${window.MIROZA.utils.safeHTML(p.title)}</strong><br><span>${window.MIROZA.utils.safeHTML(p.category || '')}</span>`;
            btn.onclick = () => window.location.href = p.link || p.url || '#';
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
    
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });

})();
