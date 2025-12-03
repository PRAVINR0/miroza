/* MIROZA Main JS - TOI Style Edition */
(function(){
  'use strict';
  
  /* Utilities */
  window.MIROZA = window.MIROZA || {};
  window.MIROZA.utils = {
    qs: (sel, ctx=document) => ctx.querySelector(sel),
    qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
    safeHTML(str) {
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML;
    },
    getLink(post) {
        if(post.link || post.url) return post.link || post.url;
        if(post.slug) {
            const cat = (post.category || '').toLowerCase();
            if(cat === 'blog') return `/blogs/${post.slug}.html`;
            if(cat === 'news' || cat === 'india') return `/news/${post.slug}.html`;
            return `/articles/${post.slug}.html`;
        }
        return '#';
    },
    getImage(post) {
        const raw = post.image;
        return raw 
            ? (typeof raw === 'string' ? raw : (raw.src || '/assets/images/hero-insight-800.svg'))
            : '/assets/images/hero-insight-800.svg';
    }
  };

  /* Data Store */
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
        getArticles: () => fetchFeed('articles-feed')
    };
  })();

  /* UI Builder - TOI Specific Components */
  window.MIROZA.builder = (function(){
    const U = window.MIROZA.utils;

    function buildCompact(post) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${U.getLink(post)}">${U.safeHTML(post.title)}</a>`;
        return li;
    }

    function buildLead(post) {
        const div = document.createElement('div');
        div.className = 'lead-story-content';
        div.innerHTML = `
            <a href="${U.getLink(post)}">
                <img src="${U.getImage(post)}" alt="${U.safeHTML(post.title)}" loading="lazy">
                <h1>${U.safeHTML(post.title)}</h1>
                <p>${U.safeHTML(post.excerpt || '')}</p>
            </a>
        `;
        return div;
    }

    function buildCardSm(post) {
        const div = document.createElement('div');
        div.className = 'card-sm';
        div.innerHTML = `
            <a href="${U.getLink(post)}" style="display:contents">
                <img src="${U.getImage(post)}" alt="${U.safeHTML(post.title)}" loading="lazy">
                <h3>${U.safeHTML(post.title)}</h3>
            </a>
        `;
        return div;
    }

    function buildVisual(post) {
        const div = document.createElement('div');
        div.className = 'vs-card';
        div.innerHTML = `
            <a href="${U.getLink(post)}">
                <img src="${U.getImage(post)}" alt="${U.safeHTML(post.title)}" loading="lazy">
                <h4>${U.safeHTML(post.title)}</h4>
            </a>
        `;
        return div;
    }

    return { buildCompact, buildLead, buildCardSm, buildVisual };
  })();

  /* Navigation & Mobile Drawer */
  window.MIROZA.nav = (function(){
    let isOpen = false;
    let overlay;
    
    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        // Basic overlay styles if not in CSS
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1900;display:none;';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMenu);
    }

    function closeMenu() {
        isOpen = false;
        const nav = U.qs('.main-nav-bar');
        if(nav) nav.classList.remove('open');
        if(overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function openMenu() {
        isOpen = true;
        const nav = U.qs('.main-nav-bar');
        if(nav) nav.classList.add('open');
        if(overlay) overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    const U = window.MIROZA.utils;

    function init(){
      createOverlay();
      const toggleBtn = U.qs('.menu-toggle');
      if(toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              isOpen ? closeMenu() : openMenu();
          });
      }
      
      // Mobile Search Toggle
      const searchToggle = U.qs('.mobile-search-toggle');
      const searchContainer = U.qs('.header-search');
      if(searchToggle && searchContainer) {
          searchToggle.addEventListener('click', () => {
              const isVisible = searchContainer.style.display === 'block';
              searchContainer.style.display = isVisible ? '' : 'block';
              // If opening search, ensure it's positioned absolutely on mobile if needed
              if(!isVisible && window.innerWidth < 992) {
                  searchContainer.style.position = 'absolute';
                  searchContainer.style.top = '60px';
                  searchContainer.style.left = '0';
                  searchContainer.style.right = '0';
                  searchContainer.style.background = '#fff';
                  searchContainer.style.padding = '10px';
                  searchContainer.style.zIndex = '1001';
                  searchContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
              }
          });
      }
    }
    return { init };
  })();

  /* Home Page Logic */
  window.MIROZA.home = (function(){
    const B = window.MIROZA.builder;
    const U = window.MIROZA.utils;

    async function init(){
      const [latest, news, blogs, articles] = await Promise.all([
          window.MIROZA.store.getLatest(),
          window.MIROZA.store.getNews(),
          window.MIROZA.store.getBlogs(),
          window.MIROZA.store.getArticles()
      ]);

      // 1. Top News List (Left) - Mix of latest
      const topList = U.qs('#top-news-list');
      if(topList && latest.length) {
          topList.innerHTML = '';
          latest.slice(0, 10).forEach(p => topList.appendChild(B.buildCompact(p)));
      }

      // 2. Lead Story (Center) - First item from News or Latest
      const leadContainer = U.qs('#lead-story-container');
      const leadPost = news[0] || latest[0];
      if(leadContainer && leadPost) {
          leadContainer.innerHTML = '';
          leadContainer.appendChild(B.buildLead(leadPost));
      }

      // 3. Sub Stories (Center Grid) - Next 4 items
      const subContainer = U.qs('#sub-stories-container');
      const subPosts = (news.length > 1 ? news.slice(1, 5) : latest.slice(1, 5));
      if(subContainer && subPosts.length) {
          subContainer.innerHTML = '';
          subPosts.forEach(p => subContainer.appendChild(B.buildCardSm(p)));
      }

      // 4. Trending/Sidebar (Right) - Blogs/Articles
      const trendingList = U.qs('#trending-list');
      const trendingPosts = [...blogs, ...articles].sort(() => 0.5 - Math.random()).slice(0, 8);
      if(trendingList && trendingPosts.length) {
          trendingList.innerHTML = '';
          trendingPosts.forEach(p => trendingList.appendChild(B.buildCompact(p)));
      }

      // 5. Visual Stories (Bottom) - Image heavy items
      const vsScroll = U.qs('#visual-stories-scroll');
      const vsPosts = [...articles, ...latest].slice(0, 10);
      if(vsScroll && vsPosts.length) {
          vsScroll.innerHTML = '';
          vsPosts.forEach(p => vsScroll.appendChild(B.buildVisual(p)));
      }
    }
    return { init };
  })();

  /* Search Logic */
  window.MIROZA.search = (function(){
      function init() {
          const form = document.querySelector('.header-search form');
          const input = document.querySelector('.header-search input');
          if(form && input) {
              form.addEventListener('submit', (e) => {
                  e.preventDefault();
                  const q = input.value.trim();
                  if(q) window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
              });
          }
      }
      return { init };
  })();

  /* Initialization */
  document.addEventListener('DOMContentLoaded', () => {
    window.MIROZA.nav.init();
    window.MIROZA.search.init();
    
    // Simple page detection
    if(document.querySelector('.main-layout')) {
        window.MIROZA.home.init();
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });

})();
