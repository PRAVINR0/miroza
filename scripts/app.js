/* MIROZA Main JS - Optimized */
(function(){
  'use strict';
  const THEME_STORAGE_KEY = 'miroza_theme';
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
      // Close on link click
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

  /* Data Loader & Store */
  window.MIROZA.store = (function(){
    let posts = [];
    let readyPromise = null;

    async function fetchAll(){
      try {
        const [p, n, b] = await Promise.all([
          fetch('/data/posts.json').then(r=>r.json()).catch(()=>[]),
          fetch('/data/news.json').then(r=>r.json()).catch(()=>[]),
          fetch('/data/blogs.json').then(r=>r.json()).catch(()=>[])
        ]);

        // Normalize and merge
        const normPosts = p.map(x => ({...x, type: 'article'}));
        const normNews = n.map(x => ({...x, type: 'news', category: 'News'})); // Ensure category
        const normBlogs = b.map(x => ({...x, type: 'blog', category: 'Blog'}));

        posts = [...normPosts, ...normNews, ...normBlogs];
        return posts;
      } catch(e) {
        console.error('Data load failed', e);
        return [];
      }
    }

    function init(){
      readyPromise = fetchAll();
      return readyPromise;
    }

    function get(type){
      if(!type) return posts;
      return posts.filter(p => p.type === type || (type === 'article' && !p.type)); // Fallback for old structure
    }

    function getAll() { return posts; }

    return { init, get, getAll, ready: () => readyPromise };
  })();

  /* Card Builder */
  window.MIROZA.builder = (function(){
    function build(post){
      const article = document.createElement('article');
      article.className = 'card fade-in';
      article.dataset.id = post.id || post.slug;
      article.dataset.label = post.category || 'Story';

      const imgWrap = document.createElement('div');
      imgWrap.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.loading = 'lazy';
      // Use fallback image if missing
      const imgSrc = (post.image && (post.image.src || post.image)) || '/assets/images/hero-insight-800.svg';
      img.src = imgSrc;
      img.alt = post.title;
      img.width = 400; img.height = 225;
      imgWrap.appendChild(img);
      article.appendChild(imgWrap);

      const content = document.createElement('div');
      content.className = 'card-content';

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.innerHTML = window.MIROZA.utils.safeHTML(post.title);

      const meta = document.createElement('p');
      meta.className = 'card-meta';
      const dateStr = post.date ? new Date(post.date).toLocaleDateString() : '';
      meta.textContent = `${post.category || 'Update'} • ${dateStr}`;

      const excerpt = document.createElement('p');
      excerpt.className = 'card-excerpt';
      excerpt.innerHTML = window.MIROZA.utils.safeHTML(post.excerpt || '');

      const link = document.createElement('a');
      link.className = 'read-more';
      // Fix link logic: favor provided link, else construct
      let href = post.link;
      if (!href) {
         if (post.contentFile) href = post.contentFile;
         else if (post.slug) href = `/${post.type === 'blog' ? 'blogs' : post.type === 'news' ? 'news' : 'articles'}/${post.slug}.html`;
         else href = '#';
      }
      link.href = href;
      link.textContent = 'Read Article';

      content.appendChild(title);
      content.appendChild(meta);
      content.appendChild(excerpt);
      content.appendChild(link);

      article.appendChild(content);
      return article;
    }
    return { build };
  })();

  /* Home Feed Manager */
  window.MIROZA.home = (function(){
    async function init(){
      if(!document.body.dataset.page === 'home' && !window.MIROZA.utils.qs('[data-page="home"]')) return;

      await window.MIROZA.store.ready();

      const allPosts = window.MIROZA.store.getAll();

      // 1. Populate Latest News (Sorted by Date)
      const news = allPosts.filter(p => p.type === 'news').sort((a,b) => new Date(b.date) - new Date(a.date));
      fillSection('#news-cards', news, 4);

      // 2. Populate Latest Articles (Sorted by Date)
      const articles = allPosts.filter(p => p.type === 'article').sort((a,b) => new Date(b.date) - new Date(a.date));
      fillSection('#articles-cards', articles, 4);

      // 3. Populate Latest Blogs (Sorted by Date)
      const blogs = allPosts.filter(p => p.type === 'blog').sort((a,b) => new Date(b.date) - new Date(a.date));
      fillSection('#blog-cards', blogs, 4);

      // 4. Populate Mixed Stream (Shuffled)
      const mixed = window.MIROZA.utils.shuffle([...allPosts]); // Copy before shuffle
      fillSection('#latest-cards', mixed, 8, true); // Allow pagination logic later if needed

      // 5. Hero Section (Top 5 latest articles)
      if(articles.length > 0) setupHero(articles.slice(0, 5));

      // 6. Trending (Top views)
      const trending = [...allPosts].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      fillTrending(trending);
    }

    function fillSection(selector, items, limit, append=false){
      const container = window.MIROZA.utils.qs(selector);
      if(!container) return;
      if(!append) container.innerHTML = '';

      items.slice(0, limit).forEach(post => {
        const card = window.MIROZA.builder.build(post);
        container.appendChild(card);
      });

      // Remove skeletons if any remain (handled by innerHTML='' above for replace)
    }

    function fillTrending(items){
      const list = window.MIROZA.utils.qs('#trending-list');
      if(!list) return;
      list.innerHTML = '';
      items.forEach(p => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = p.link || `/articles/${p.slug}.html`;
        a.textContent = p.title;
        const meta = document.createElement('span');
        meta.className = 'card-meta';
        meta.textContent = `${window.MIROZA.utils.formatNumber(p.views)} views`;
        li.appendChild(a);
        li.appendChild(meta);
        list.appendChild(li);
      });
    }

    function setupHero(stories){
      const hero = window.MIROZA.utils.qs('.hero');
      if(!hero || !stories.length) return;

      // For now, just set the first one. Rotator logic can be added if requested,
      // but simpler is often more robust.
      // Let's implement a simple rotator.
      let idx = 0;
      const els = {
        tag: hero.querySelector('#hero-tag'),
        title: hero.querySelector('#hero-heading'),
        excerpt: hero.querySelector('#hero-excerpt'),
        img: hero.querySelector('#hero-image'),
        link: hero.querySelector('#hero-link')
      };

      function setHero(story){
        if(!story) return;
        if(els.tag) els.tag.textContent = story.category || 'Featured';
        if(els.title) els.title.innerHTML = window.MIROZA.utils.safeHTML(story.title);
        if(els.excerpt) els.excerpt.innerHTML = window.MIROZA.utils.safeHTML(story.excerpt);
        if(els.img) {
             els.img.src = (story.image && (story.image.src || story.image)) || '/assets/images/hero-insight-800.svg';
             els.img.alt = story.title;
        }
        if(els.link) els.link.href = story.link || `/articles/${story.slug}.html`;
      }

      setHero(stories[0]);

      // Rotate every 8s
      setInterval(() => {
        idx = (idx + 1) % stories.length;
        setHero(stories[idx]);
      }, 8000);

      const advanceBtn = hero.querySelector('.hero-advance');
      if(advanceBtn) {
          advanceBtn.addEventListener('click', () => {
              idx = (idx + 1) % stories.length;
              setHero(stories[idx]);
          });
      }
    }

    return { init };
  })();

  /* Search */
  window.MIROZA.search = (function(){
    function init(){
      const input = window.MIROZA.utils.qs('#search');
      const suggestions = window.MIROZA.utils.qs('#search-suggestions');
      if(!input || !suggestions) return;

      input.addEventListener('input', window.MIROZA.utils.debounce((e) => {
        const q = e.target.value.toLowerCase();
        if(q.length < 2) { suggestions.hidden = true; return; }

        const all = window.MIROZA.store.getAll();
        const matches = all.filter(p => p.title.toLowerCase().includes(q)).slice(0, 5);

        suggestions.innerHTML = '';
        if(matches.length){
          suggestions.hidden = false;
          matches.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'search-suggestion';
            btn.innerHTML = `<strong>${window.MIROZA.utils.safeHTML(p.title)}</strong><br><span>${p.category}</span>`;
            btn.addEventListener('click', () => {
              window.location.href = p.link || `/articles/${p.slug}.html`;
            });
            suggestions.appendChild(btn);
          });
        } else {
            suggestions.hidden = true;
        }
      }, 300));

      // Hide on click outside
      document.addEventListener('click', (e) => {
        if(!input.contains(e.target) && !suggestions.contains(e.target)){
          suggestions.hidden = true;
        }
      });
    }
    return { init };
  })();

  /* Initialization */
  document.addEventListener('DOMContentLoaded', () => {
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.store.init().then(() => {
        window.MIROZA.home.init();
        window.MIROZA.search.init();

        // Handle specific page feeds if not home
        const page = document.body.dataset.page;
        if(page === 'news'){
             // Load news page logic
        }
        // Remove 'no-js' or add 'js-ready'
        document.body.classList.add('js-ready');
    });

    // Event listeners for static UI
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle');
    if(themeBtn) themeBtn.addEventListener('click', window.MIROZA.theme.toggle);
  });

})();
