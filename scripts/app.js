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

  /* UI Interactions */
  window.MIROZA.ui = (function(){
    let header, backToTopBtn, lazyObserver, ticking=false, lazyFallbackTimer;
    const FALLBACK_REVEAL_DELAY = 2500;

    function handleScroll(){
      const offset = window.scrollY || document.documentElement.scrollTop || 0;
      if(header){ header.classList.toggle('is-stuck', offset > 24); }
      if(backToTopBtn){ backToTopBtn.classList.toggle('visible', offset > 480); }
    }

    function bindBackToTop(){
      if(!backToTopBtn) return;
      backToTopBtn.addEventListener('click', ()=>{
        const behavior = window.MIROZA.utils.prefersReducedMotion()? 'auto':'smooth';
        window.scrollTo({ top:0, behavior });
      });
    }

    function hydrateLazySections(){
      const lazyEls = window.MIROZA.utils.qsa('[data-lazy]');
      if(!lazyEls.length) return;
      if(!('IntersectionObserver' in window)){
        lazyEls.forEach(el=> el.classList.add('lazy-ready'));
        return;
      }
      lazyObserver?.disconnect();
      lazyObserver = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('lazy-ready');
            lazyObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin:'0px 0px -10% 0px' });
      lazyEls.forEach(el=> lazyObserver.observe(el));
      window.clearTimeout(lazyFallbackTimer);
      lazyFallbackTimer = window.setTimeout(forceRevealLazySections, FALLBACK_REVEAL_DELAY); // Safety net for browsers that fail IO callbacks
    }

    function forceRevealLazySections(){
      window.MIROZA.utils.qsa('[data-lazy]:not(.lazy-ready)').forEach(el=> el.classList.add('lazy-ready'));
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
      hydrateLazySections();
      enhanceInlineMedia();
    }

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

    return { init, hydrateLazySections };
  })();

  /* Forms & Newsletter Handling */
  window.MIROZA.forms = (function(){
    const NEWSLETTER_KEY = 'miroza_newsletter_optin';
    const SUBMIT_LATENCY = 900;

    function sanitizeInput(value){
      if(typeof value !== 'string') return '';
      if(window.DOMPurify){ return DOMPurify.sanitize(value, { ALLOWED_TAGS:[], ALLOWED_ATTR:[] }); }
      return value.replace(/[<>]/g,'');
    }

    function validateEmail(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

    function safeStorage(action, key, value){
      try {
        if(action==='get'){ return localStorage.getItem(key); }
        if(action==='set'){ localStorage.setItem(key, value); }
        if(action==='remove'){ localStorage.removeItem(key); }
      } catch(e){}
      return null;
    }

    function updateFeedback(el, message, state='info'){
      if(!el) return;
      el.textContent = message;
      el.dataset.state = state;
    }

    function lockForm(form){
      form.classList.add('is-success');
      window.MIROZA.utils.qsa('input, button', form).forEach(el => { el.disabled = true; });
    }

    function simulateRequest(payload){
      return new Promise((resolve)=>{
        window.setTimeout(()=> resolve({ ok:true, ...payload }), SUBMIT_LATENCY);
      });
    }

    function initNewsletter(){
      const form = window.MIROZA.utils.qs('#newsletter-form');
      if(!form) return;
      const emailInput = form.querySelector('input[type="email"]');
      const feedback = form.querySelector('.form-feedback');
      const submitBtn = form.querySelector('button[type="submit"]');
      if(!emailInput || !feedback || !submitBtn) return;

      if(safeStorage('get', NEWSLETTER_KEY) === 'subscribed'){
        updateFeedback(feedback, 'You are already subscribed.', 'success');
        lockForm(form);
      }

      form.addEventListener('submit', e=>{
        e.preventDefault();
        if(form.classList.contains('is-loading')) return;
        const email = sanitizeInput(emailInput.value.trim());
        if(!validateEmail(email)){
          updateFeedback(feedback, 'Enter a valid email address.', 'error');
          emailInput.focus();
          return;
        }
        form.classList.add('is-loading');
        submitBtn.disabled = true;
        updateFeedback(feedback, 'Subscribing you now…', 'pending');
        const finish = (keepDisabled)=>{
          form.classList.remove('is-loading');
          if(!keepDisabled){ submitBtn.disabled = false; }
        };
        simulateRequest({ email }).then(()=>{
          updateFeedback(feedback, 'You are officially on the list. Welcome aboard!', 'success');
          safeStorage('set', NEWSLETTER_KEY, 'subscribed');
          lockForm(form);
          finish(true);
        }).catch(()=>{
          updateFeedback(feedback, 'We could not reach the server. Please try again.', 'error');
          finish(false);
        });
      });
    }

    function init(){ initNewsletter(); }

    return { init };
  })();

  /* Community Interactions (share, like, comments) */
  window.MIROZA.community = (function(){
    const COMMENTS_KEY = 'miroza_comments_v1';
    const LIKE_KEY = 'miroza_likes_v1';
    const MAX_COMMENTS = 20;
    let commentsFallback = {};
    let likesCache = null;

    function sanitizePlain(value){
      if(typeof value !== 'string') return '';
      if(window.DOMPurify){ return DOMPurify.sanitize(value, { ALLOWED_TAGS:[], ALLOWED_ATTR:[] }); }
      return value.replace(/[<>]/g,'');
    }

    function getArticleKey(){
      const body = document.body;
      if(body.dataset.articleId) return body.dataset.articleId;
      if(body.dataset.slug) return body.dataset.slug;
      const path = window.location.pathname.replace(/\/+/g,'/').replace(/\/$/, '');
      return path || 'home';
    }

    function readComments(){
      try {
        const raw = localStorage.getItem(COMMENTS_KEY);
        if(!raw) return commentsFallback;
        commentsFallback = JSON.parse(raw) || {};
        return commentsFallback;
      } catch(e){
        return commentsFallback;
      }
    }

    function writeComments(data){
      commentsFallback = data;
      try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(data)); } catch(e){}
    }

    function readLikes(){
      if(likesCache) return likesCache;
      try {
        const raw = localStorage.getItem(LIKE_KEY);
        likesCache = raw ? JSON.parse(raw) : {};
      } catch(e){ likesCache = {}; }
      return likesCache;
    }

    function writeLikes(data){
      likesCache = data;
      try { localStorage.setItem(LIKE_KEY, JSON.stringify(data)); } catch(e){}
    }

    function updateFeedback(node, message, state='info'){
      if(!node) return;
      node.textContent = message;
      node.dataset.state = state;
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
