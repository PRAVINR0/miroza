/* MIROZA Main JS - Optimized */
(function(){
  'use strict';
  const THEME_STORAGE_KEY = 'theme';
  const SUBSCRIBERS_KEY = 'miroza_subscribers';
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
      article.className = 'card post-card'; // Unified class name

      const rawImage = post.image;
      const imgUrl = rawImage
        ? (typeof rawImage === 'string' ? rawImage : (rawImage.src || '/assets/images/hero-insight-800.svg'))
        : '/assets/images/hero-insight-800.svg';
      const imgAlt = (rawImage && typeof rawImage === 'object' && rawImage.alt) ? rawImage.alt : post.title || '';

      // compute link fallback
      let link = post.link || post.url || '';
      if(!link) {
        if(post.slug) {
          const cat = (post.category || '').toLowerCase();
          if(cat === 'blog') link = `/blogs/${post.slug}.html`;
          else if(cat === 'news' || cat === 'india') link = `/news/${post.slug}.html`;
          else link = `/articles/${post.slug}.html`;
        } else {
          link = '/';
        }
      }

      // build img attributes: srcset / sizes when provided
      let srcsetAttr = '';
      let sizesAttr = '';
      if(rawImage && typeof rawImage === 'object'){
        if(rawImage.srcset) srcsetAttr = `srcset="${rawImage.srcset}"`;
        if(rawImage.sizes) sizesAttr = `sizes="${rawImage.sizes}"`;
      }

      const html = `
        <a href="${link}" class="card-link" aria-label="Read ${window.MIROZA.utils.safeHTML(post.title || '')}">
          <div class="card-image-wrap">
             <img src="${imgUrl}" ${srcsetAttr} ${sizesAttr} alt="${window.MIROZA.utils.safeHTML(imgAlt)}" loading="lazy" decoding="async" width="400" height="225" onerror="this.onerror=null;this.src='/assets/images/hero-insight-800.svg'" />
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

        // Prefer explicit news feed if available (data/news.json), otherwise fall back to posts.json
        let news = [];
        try {
          // attempt to synchronously fetch cached news (non-blocking)
          // fetch and map to builder-friendly shape
          fetch('/data/news.json').then(r => r.ok ? r.json() : []).then(items => {
            if(items && items.length){
              const mapped = items.slice().sort((a,b) => (b.date||'').localeCompare(a.date||'')).slice(0,4).map(item => ({
                title: item.title,
                slug: item.slug,
                date: item.date,
                category: item.category || 'News',
                excerpt: item.excerpt,
                link: item.contentFile || `/news/${item.slug}.html`,
                image: item.image ? { src: item.image, alt: item.title } : null
              }));
              renderList('news-cards', mapped);
              return;
            }
            // fallback to posts.json below
            const fallback = all.filter(p => p.category === 'News').slice(0,4);
            renderList('news-cards', fallback);
          }).catch(() => {
            const fallback = all.filter(p => p.category === 'News').slice(0,4);
            renderList('news-cards', fallback);
          });
        } catch(e){
          const fallback = all.filter(p => p.category === 'News').slice(0,4);
          renderList('news-cards', fallback);
        }
      const blogs = all.filter(p => p.category === 'Blog').slice(0,4);
      const articles = all.filter(p => p.category !== 'News' && p.category !== 'Blog').slice(0,4);

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

    function getTopicFromQuery(){
      try{
        const q = new URLSearchParams(window.location.search);
        return q.get('topic');
      }catch(e){ return null; }
    }

    function init(){
      const listEl = window.MIROZA.utils.qs('#india-news-list');
      if(!listEl) return;

      fetch('/data/news.json')
        .then(r => r.ok ? r.json() : [])
        .then(items => {
          listEl.innerHTML = '';
          let filtered = items.slice().sort((a,b) => (b.date || '').localeCompare(a.date || ''));
          
          const topic = getTopicFromQuery();
          if(topic){
             filtered = filtered.filter(item => (item.category || '').toLowerCase() === topic.toLowerCase() || (item.title || '').toLowerCase().includes(topic.toLowerCase()));
          }

          if(filtered.length === 0){
             listEl.innerHTML = '<p>No news found for this topic.</p>';
             return;
          }

          filtered.forEach(item => {
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
    // pagination aware renderer
    function getPageFromQuery(){
      try{
        const q = new URLSearchParams(window.location.search);
        const p = parseInt(q.get('page'), 10);
        return isNaN(p) || p < 1 ? 1 : p;
      }catch(e){ return 1; }
    }

    function getTopicFromQuery(){
      try{
        const q = new URLSearchParams(window.location.search);
        return q.get('topic');
      }catch(e){ return null; }
    }

    function updateQueryPage(page){
      try{
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        window.history.replaceState({}, '', url.toString());
      }catch(e){}
    }

    function renderPage(containerId, items, pageSize = 12, initialPage = null){
      const container = window.MIROZA.utils.qs(containerId);
      if(!container) return null;
      container.innerHTML = '';
      const page = initialPage || getPageFromQuery() || 1;
      const state = { items, pageSize, index: (page - 1) * pageSize };
      // render items up to current page (so deep link to page=2 shows first 2 pages)
      if(state.index > 0){
        const initialSlice = state.items.slice(0, state.index);
        initialSlice.forEach(item => container.appendChild(window.MIROZA.builder.build(item)));
      }
      function renderNext(){
        const slice = state.items.slice(state.index, state.index + state.pageSize);
        slice.forEach(item => container.appendChild(window.MIROZA.builder.build(item)));
        state.index += slice.length;
        return state.index < state.items.length;
      }
      // ensure at least one page is shown
      if(state.index === 0) renderNext();
      // reflect page in URL
      const currentPage = Math.ceil(state.index / state.pageSize) || 1;
      updateQueryPage(currentPage);
      return { renderNext, state };
    }

    function attachLoadMore(paginationSelector, pager){
      const pagination = window.MIROZA.utils.qs(paginationSelector);
      if(!pagination || !pager) return;
      pagination.innerHTML = '';
      if(pager.state.index >= pager.state.items.length) return;
      const btn = document.createElement('button');
      btn.className = 'load-more';
      btn.textContent = 'Load more';
      btn.addEventListener('click', () => {
        const more = pager.renderNext();
        // update page query param to reflect number of pages currently shown
        const pageNow = Math.ceil(pager.state.index / pager.state.pageSize) || 1;
        updateQueryPage(pageNow);
        if(!more) btn.remove();
      });
      pagination.appendChild(btn);
    }

    function initArticles(){
      // Updated to match articles.html IDs
      const container = '#articles-list'; 
      const pagination = '#articles-pagination';
      
      if(!window.MIROZA.store || !window.MIROZA.utils.qs(container)) return;
      const all = window.MIROZA.store.getAll();
      if(!all || !all.length) {
          window.MIROZA.utils.qs(container).innerHTML = '<p>No articles found.</p>';
          return;
      }
      
      const topic = getTopicFromQuery();
      // Treat anything not explicitly Blog as an article/long-form
      let articles = all
        .filter(p => p.category !== 'Blog')
        .slice()
        .sort((a,b) => (b.date || '').localeCompare(a.date || ''));
      
      if(topic) {
        articles = articles.filter(p => (p.category || '').toLowerCase() === topic.toLowerCase() || (p.title || '').toLowerCase().includes(topic.toLowerCase()));
      }

      const pager = renderPage(container, articles, 12);
      attachLoadMore(pagination, pager);
    }

    async function initBlogs(){
      // Updated to match blogs.html IDs
      const container = '#posts-grid';
      // blogs.html doesn't have a pagination container by default, let's create one if missing or append to grid
      let pagination = '#blogs-pagination';
      
      if(!window.MIROZA.utils.qs(container)) return;
      
      // Ensure pagination container exists
      if(!window.MIROZA.utils.qs(pagination)){
          const pDiv = document.createElement('nav');
          pDiv.id = 'blogs-pagination';
          pDiv.className = 'pagination';
          window.MIROZA.utils.qs(container).parentNode.appendChild(pDiv);
      }

      try {
        const res = await fetch('/data/blogs.json'); // Or posts.json if blogs are there
        // Fallback to posts.json if blogs.json fails or is empty, but here we assume blogs.json or filtered posts
        let items = [];
        if(res.ok) {
            items = await res.json();
        } else {
            // Fallback to store if blogs.json missing
             await window.MIROZA.store.init();
             items = window.MIROZA.store.getAll().filter(p => p.category === 'Blog');
        }

        let mapped = items
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
        
        const topic = getTopicFromQuery();
        if(topic) {
            mapped = mapped.filter(p => (p.title || '').toLowerCase().includes(topic.toLowerCase()));
        }

        const pager = renderPage(container, mapped, 12);
        attachLoadMore(pagination, pager);
        
        // Hide skeleton if present
        const skeleton = document.getElementById('posts-skeleton');
        if(skeleton) skeleton.style.display = 'none';

      } catch(e) {
        console.error('Failed to load blogs', e);
      }
    }

    return { initArticles, initBlogs };
  })();

  /* Post metadata injector (JSON-LD) */
  window.MIROZA.postMeta = (function(){
    function init(){
      const page = document.body.dataset.page || '';
      if(!/article|news-article|blog-article/.test(page)) return;
      // Do not overwrite existing JSON-LD
      if(document.querySelector('script[type="application/ld+json"]')) return;

      const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || document.querySelector('img')?.src || '';
      const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
      const timeEl = document.querySelector('.single-article time') || document.querySelector('.meta time');
      const datePublished = timeEl ? timeEl.getAttribute('datetime') || timeEl.textContent : document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
      const authorEl = document.querySelector('.author') || document.querySelector('meta[name="author"]');
      const author = authorEl ? (authorEl.textContent || authorEl.getAttribute('content')) : '';

      const type = page === 'blog-article' || page === 'blog' ? 'BlogPosting' : 'NewsArticle';

      const ld = {
        '@context': 'https://schema.org',
        '@type': type,
        'headline': title,
        'description': description,
        'image': image,
        'datePublished': datePublished || undefined,
        'author': author ? { '@type': 'Person', 'name': author } : undefined,
        'publisher': { '@type': 'Organization', 'name': 'MIROZA', 'logo': { '@type': 'ImageObject', 'url': (location.origin + '/assets/icons/logo.svg') } },
        'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical }
      };

      // remove undefined entries
      Object.keys(ld).forEach(k => ld[k] === undefined && delete ld[k]);

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(ld, null, 2);
      document.head.appendChild(script);
    }
    return { init };
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
        if(isBlog && window.MIROZA.listing) window.MIROZA.listing.initBlogs();
        if(window.MIROZA.search) window.MIROZA.search.init();
        if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
        if(window.MIROZA.postMeta) window.MIROZA.postMeta.init();
        document.body.classList.add('js-ready');
      }).catch(() => {
        if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
        if(window.MIROZA.postMeta) window.MIROZA.postMeta.init();
        document.body.classList.add('js-ready');
      });
    } else {
      if(isIndiaNews && window.MIROZA.indiaNews) window.MIROZA.indiaNews.init();
      if(isBlog && window.MIROZA.listing) window.MIROZA.listing.initBlogs();
      if(window.MIROZA.postMeta) window.MIROZA.postMeta.init();
      document.body.classList.add('js-ready');
    }

    // Load per-article enhancements when on a single article page
    try{
      const path = (location.pathname || '').toLowerCase();
      const isArticleDetail = path.indexOf('/articles/') === 0 && !/articles(\/|index\.html|articles\.html)$/.test(path);
      const isBlogDetail = path.indexOf('/blogs/') === 0 && !/blogs(\/|index\.html|blogs\.html)$/.test(path);
      if(isArticleDetail || isBlogDetail){
        const s = document.createElement('script');
        s.src = '/scripts/article-nav.js';
        s.defer = true;
        document.body.appendChild(s);
      }
    }catch(e){/* ignore */}
  });

  /* Public API Aliases (for category pages) */
  window.MIROZA.loadPosts = async () => {
      await window.MIROZA.store.init();
      return window.MIROZA.store.getAll();
  };
  window.MIROZA.buildCard = window.MIROZA.builder.build;

})();
