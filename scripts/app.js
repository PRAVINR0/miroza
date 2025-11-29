/* MIROZA Main JS - Optimized */
(function(){
  'use strict';
  const THEME_STORAGE_KEY = 'miroza_theme';
  const SUBSCRIBERS_KEY = 'miroza_subscribers';
  const SUBSCRIBERS_FILE_NAME = 'subscribers.txt';
  const SITE_BASE = 'https://miroza.online';

  /* Utilities */
  window.MIROZA = window.MIROZA || {};
  window.MIROZA.utils = {
    qs: (sel, ctx=document) => ctx.querySelector(sel),
    qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
    shuffle(arr) {
      let m = arr.length, t, i;
      while(m) { i = Math.floor(Math.random() * m--); t = arr[m]; arr[m] = arr[i]; arr[i] = t; }
      return arr;
    },
    safeHTML(str) {
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML;
    },
    formatNumber(num){ try { return Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(num||0); } catch(e){ return num || 0; } },
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
    let _posts = [];
    let _ready = null;

    function init() {
        if (_ready) return _ready;
        _ready = Promise.all([
            fetch('/data/posts.json').then(r => r.ok ? r.json() : [])
        ]).then(([posts]) => {
            _posts = posts;
            return true;
        }).catch(err => {
            console.error('Failed to load data:', err);
            return false;
        });
        return _ready;
    }

    return {
        init,
        ready: () => _ready,
        getAll: () => _posts,
        getByCategory: (cat) => _posts.filter(p => p.category === cat)
    };
  })();

  /* UI Builder Module */
  window.MIROZA.builder = (function(){
    function build(post) {
      const article = document.createElement('article');
      article.className = 'card';

      const rawImage = post.image;
      const imgUrl = rawImage
        ? (typeof rawImage === 'string' ? rawImage : (rawImage.src || '/assets/images/hero-insight-800.svg'))
        : '/assets/images/hero-insight-800.svg';
      const imgAlt = (rawImage && typeof rawImage === 'object' && rawImage.alt) ? rawImage.alt : post.title;

      const html = `
        <a href="${post.link}" class="card-link" aria-label="Read ${window.MIROZA.utils.safeHTML(post.title)}">
          <img src="${imgUrl}" alt="${window.MIROZA.utils.safeHTML(imgAlt)}" loading="lazy" width="400" height="225" />
        </a>
        <div class="card-content">
          <div class="card-meta">
            <span class="category">${window.MIROZA.utils.safeHTML(post.category || 'Story')}</span> •
            <span class="date">${new Date(post.date).toLocaleDateString()}</span>
          </div>
          <h3 class="card-title">
            <a href="${post.link}">${window.MIROZA.utils.safeHTML(post.title)}</a>
          </h3>
          <p class="card-excerpt">${window.MIROZA.utils.safeHTML(post.excerpt || '')}</p>
          <a href="${post.link}" class="read-more" aria-hidden="true">Read Article</a>
        </div>
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
    function init(){
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

      nav.addEventListener('click', (e) => {
        if(e.target.tagName === 'A') {
          isOpen = false;
          nav.classList.remove('open');
          toggleBtn.setAttribute('aria-expanded', 'false');
          toggleBtn.innerHTML = '<img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />';
        }
      });
    }

    return { init };
  })();

  /* Simple UI helpers: back-to-top, responsive images */
  window.MIROZA.ui = (function(){
    let header, backToTopBtn, ticking=false;

    function handleScroll(){
      const offset = window.scrollY || document.documentElement.scrollTop || 0;
      if(header){ header.classList.toggle('is-stuck', offset > 24); }
      if(backToTopBtn){ backToTopBtn.classList.toggle('visible', offset > 480); }
    }

    function bindBackToTop(){
      if(!backToTopBtn) return;
      backToTopBtn.addEventListener('click', ()=>{
        window.scrollTo({ top:0, behavior:'smooth' });
      });
    }

    function enhanceInlineMedia(){
      const inlineImages = window.MIROZA.utils.qsa('.single-article img, main img[data-enhance-responsive]');
      if(!inlineImages.length) return;
      inlineImages.forEach(img => {
        if(!img) return;
        if(!img.getAttribute('loading')) img.loading = 'lazy';
        img.decoding = 'async';
      });
    }

    function init(){
      header = window.MIROZA.utils.qs('.site-header');
      backToTopBtn = window.MIROZA.utils.qs('.back-to-top');
      bindBackToTop();
      window.addEventListener('scroll', ()=>{
        if(ticking) return;
        ticking = true;
        window.requestAnimationFrame(()=>{ handleScroll(); ticking=false; });
      }, { passive:true });
      handleScroll();
      enhanceInlineMedia();
    }

    return { init };
  })();

  /* Search (guarded: requires store) */
  window.MIROZA.search = (function(){
    function init(){
      const input = window.MIROZA.utils.qs('#search');
      const suggestions = window.MIROZA.utils.qs('#search-suggestions');
      if(!input || !suggestions || !window.MIROZA.store) return;

      input.addEventListener('input', window.MIROZA.utils.debounce((e) => {
        const q = e.target.value.toLowerCase();
        if(q.length < 2) { suggestions.hidden = true; return; }

        const all = window.MIROZA.store.getAll();
        const matches = all.filter(p => (p.title || '').toLowerCase().includes(q)).slice(0, 5);

        suggestions.innerHTML = '';
        if(matches.length){
          suggestions.hidden = false;
          matches.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'search-suggestion';
            btn.innerHTML = `<strong>${window.MIROZA.utils.safeHTML(p.title)}</strong><br><span>${window.MIROZA.utils.safeHTML(p.category || '')}</span>`;
            btn.addEventListener('click', () => {
              window.location.href = p.link || `/articles/${p.slug}.html`;
            });
            suggestions.appendChild(btn);
          });
        } else {
            suggestions.hidden = true;
        }
      }, 300));

      document.addEventListener('click', (e) => {
        if(!input.contains(e.target) && !suggestions.contains(e.target)){
          suggestions.hidden = true;
        }
      });
    }
    return { init };
  })();

  /* Subscription Manager */
  window.MIROZA.subscription = (function(){
    function init(){
      const form = window.MIROZA.utils.qs('#newsletter-form');
      if(!form) return;

      // Ensure input exists
      if(!form.querySelector('input[type="email"]')){
        const input = document.createElement('input');
        input.type = 'email';
        input.placeholder = 'Your email address';
        input.required = true;
        input.setAttribute('aria-label', 'Email address');
        form.insertBefore(input, form.querySelector('button'));
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input.value.trim();
        if(!email) return;

        // Save to LocalStorage
        saveSubscriber(email);

        // UI Feedback
        const originalBtnText = form.querySelector('button').textContent;
        form.querySelector('button').textContent = 'Subscribed!';
        form.querySelector('button').disabled = true;
        input.value = '';
        setTimeout(() => {
             form.querySelector('button').textContent = originalBtnText;
             form.querySelector('button').disabled = false;
        }, 3000);
      });

      // Admin Trigger (Double click on "Stay Updated" title to download list - Hidden Feature)
      const title = window.MIROZA.utils.qs('.newsletter h3');
      if(title){
          title.addEventListener('dblclick', downloadList);
          title.title = "Admin: Double click to download subscriber list";
      }
    }

    function saveSubscriber(email){
      let subscribers = [];
      try {
        const stored = localStorage.getItem(SUBSCRIBERS_KEY);
        if(stored) subscribers = JSON.parse(stored);
      } catch(e){}

      const entry = {
        email: email,
        date: new Date().toISOString(),
        source: 'newsletter-form'
      };

      subscribers.push(entry);
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
      console.log('Subscriber saved locally:', entry);
    }

    function downloadList(){
      let subscribers = [];
      try {
        const stored = localStorage.getItem(SUBSCRIBERS_KEY);
        if(stored) subscribers = JSON.parse(stored);
      } catch(e){}

      if(!subscribers.length) {
          alert('No subscribers yet.');
          return;
      }

      // Convert to CSV
      const headers = 'Email,Date,Source\n';
      const rows = subscribers.map(s => `${s.email},${s.date},${s.source}`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return { init };
  })();

  /* Simple home + India news rendering */
  window.MIROZA.home = (function(){
    function renderList(targetId, posts){
      const container = window.MIROZA.utils.qs(`#${targetId}`);
      if(!container) return;
      container.innerHTML = '';
      posts.forEach(p => {
        container.appendChild(window.MIROZA.builder.build(p));
      });
    }

    function init(){
      if(!window.MIROZA.store) return;
      const all = window.MIROZA.store.getAll();
      if(!all || !all.length) return;

      const news = all.filter(p => p.category === 'News').slice(0,4);
      const blogs = all.filter(p => p.category === 'Blog').slice(0,4);
      const articles = all.filter(p => p.category !== 'News' && p.category !== 'Blog').slice(0,4);

      renderList('news-cards', news);
      renderList('blog-cards', blogs);
      renderList('articles-cards', articles);

      const mixed = window.MIROZA.utils.shuffle(all.slice(0)).slice(0,8);
      renderList('latest-cards', mixed);
    }

    return { init };
  })();

  window.MIROZA.indiaNews = (function(){
    function buildIndiaCard(item){
      return {
        title: item.title,
        slug: item.slug,
        date: item.date,
        category: 'India',
        excerpt: item.excerpt,
        link: item.contentFile || `/news/${item.slug}.html`,
        image: item.image ? { src: item.image, alt: item.title } : null
      };
    }

    function init(){
      const listEl = window.MIROZA.utils.qs('#india-news-list');
      if(!listEl) return;

      fetch('/data/news.json')
        .then(r => r.ok ? r.json() : [])
        .then(items => {
          listEl.innerHTML = '';
          items
            .slice()
            .sort((a,b) => (b.date || '').localeCompare(a.date || ''))
            .forEach(item => {
              listEl.appendChild(window.MIROZA.builder.build(buildIndiaCard(item)));
            });
        })
        .catch(() => {
          listEl.innerHTML = '<p>Unable to load latest India news right now.</p>';
        });
    }

    return { init };
  })();

  /* Category / Listing pages for articles & blogs */
  window.MIROZA.listing = (function(){
    function renderList(containerId, items){
      const container = window.MIROZA.utils.qs(containerId);
      if(!container) return;
      container.innerHTML = '';
      items.forEach(item => {
        container.appendChild(window.MIROZA.builder.build(item));
      });
    }

    function initArticles(){
      const container = '#category-list';
      if(!window.MIROZA.store || !window.MIROZA.utils.qs(container)) return;
      const all = window.MIROZA.store.getAll();
      if(!all || !all.length) return;
      // Treat anything not explicitly Blog as an article/long-form
      const articles = all
        .filter(p => p.category !== 'Blog')
        .slice()
        .sort((a,b) => (b.date || '').localeCompare(a.date || ''));
      renderList(container, articles);
    }

    async function initBlogs(){
      const container = '#category-list';
      if(!window.MIROZA.utils.qs(container)) return;
      try {
        const res = await fetch('/data/blogs.json');
        const items = res.ok ? await res.json() : [];
        const mapped = items
          .slice()
          .sort((a,b) => (b.date || '').localeCompare(a.date || ''))
          .map(item => ({
            title: item.title,
            slug: item.slug,
            date: item.date,
            category: 'Blog',
            excerpt: item.excerpt,
            link: item.url || item.contentFile || `/blogs/${item.slug}.html`,
            image: item.image ? { src: item.image, alt: item.title } : null
          }));
        renderList(container, mapped);
      } catch(e) {
        console.error('Failed to load blogs.json', e);
      }
    }

    return { initArticles, initBlogs };
  })();

  /* Initialization */
  document.addEventListener('DOMContentLoaded', () => {
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.ui.init();
    window.MIROZA.subscription.init();

    const themeBtn = window.MIROZA.utils.qs('.theme-toggle');
    if(themeBtn) themeBtn.addEventListener('click', window.MIROZA.theme.toggle);

    const page = document.body.dataset.page || 'home';
    const isHome = page === 'home';
    const isIndiaNews = page === 'india-news';
    const isArticles = page === 'articles';
    const isBlog = page === 'blog';

    if(window.MIROZA.store && typeof window.MIROZA.store.init === 'function'){
      window.MIROZA.store.init().then(() => {
        if(isHome && window.MIROZA.home) window.MIROZA.home.init();
        if(isArticles && window.MIROZA.listing) window.MIROZA.listing.initArticles();
        if(window.MIROZA.search) window.MIROZA.search.init();
        if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
        document.body.classList.add('js-ready');
      }).catch(() => {
        if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
        document.body.classList.add('js-ready');
      });
    } else {
      if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
      if(isBlog && window.MIROZA.listing) window.MIROZA.listing.initBlogs();
      document.body.classList.add('js-ready');
    }
  });

  /* Public API Aliases (for category pages) */
  window.MIROZA.loadPosts = async () => {
      await window.MIROZA.store.init();
      return window.MIROZA.store.getAll();
  };
  window.MIROZA.buildCard = window.MIROZA.builder.build;

})();
