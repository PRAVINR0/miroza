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

      const imgUrl = (post.image && post.image.src) ? post.image.src : '/assets/images/hero-insight-800.svg';
      const imgAlt = (post.image && post.image.alt) ? post.image.alt : post.title;

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



    function enhanceInlineMedia(){
      const inlineImages = window.MIROZA.utils.qsa('.single-article img, main img[data-enhance-responsive]');
      if(!inlineImages.length) return;
      inlineImages.forEach(img => {
        if(!img) return;
        if(!img.getAttribute('loading')) img.loading = 'lazy';
        img.decoding = 'async';
        if(!img.hasAttribute('srcset')){
          const responsive = buildResponsiveSet(img.getAttribute('src'));
          if(responsive){
            img.setAttribute('srcset', responsive);
            if(!img.hasAttribute('sizes')){
              img.setAttribute('sizes', '(max-width: 900px) 100vw, 800px');
            }
          }
        }
      });
    }

    function buildResponsiveSet(src){
      if(!src) return null;
      if(!/images\.(unsplash|pexels)\.com/i.test(src)) return null;
      const widths = [480, 768, 1200];
      const entries = widths.map(width => `${swapWidthParam(src, width)} ${width}w`);
      return entries.join(', ');
    }

    function swapWidthParam(url, width){
      const widthParam = `w=${width}`;
      if(/w=\d+/i.test(url)){
        return url.replace(/w=\d+/gi, widthParam);
      }
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${widthParam}`;
    }


    }

    function lockForm(form){
      form.classList.add('is-success');
      window.MIROZA.utils.qsa('input, button', form).forEach(el => { el.disabled = true; });
    }

    function simulateRequest(payload){
      return new Promise((resolve)=>{
        window.setTimeout(()=> resolve({ ok:true, ...payload }), SUBMIT_LATENCY);
      });


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
             const imgUrl = (story.image && story.image.src) ? story.image.src : '/assets/images/hero-insight-800.svg';
             els.img.src = imgUrl;
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

  /* Initialization */
  document.addEventListener('DOMContentLoaded', () => {
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.subscription.init();

    window.MIROZA.store.init().then(() => {
        window.MIROZA.home.init();
        window.MIROZA.search.init();
        document.body.classList.add('js-ready');
    });

    // Event listeners for static UI
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle');
    if(themeBtn) themeBtn.addEventListener('click', window.MIROZA.theme.toggle);
  });

  /* Public API Aliases (for category pages) */
  window.MIROZA.loadPosts = async () => {
      await window.MIROZA.store.init();
      return window.MIROZA.store.getAll();
  };
  window.MIROZA.buildCard = window.MIROZA.builder.build;

})();
