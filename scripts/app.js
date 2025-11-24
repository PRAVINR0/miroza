/* MIROZA Main JS
   Provides theme toggle, mobile nav, data loading, shuffling, prefetch, accessibility, and PWA registration.
   All functions exist under the window.MIROZA namespace to avoid global collisions.
*/
(function(){
  'use strict';

  // Namespace root
  window.MIROZA = window.MIROZA || {};

  /* Utilities */
  window.MIROZA.utils = {
    qs: (sel, ctx=document) => ctx.querySelector(sel),
    qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
    shuffle(arr) { for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()* (i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr;},
    safeHTML(str) {
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML;
    },
    prefersReducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
    formatNumber(num){ try { return Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(num||0); } catch(e){ return num || 0; } },
    isInternalLink(href){ try { const url=new URL(href, window.location.origin); return url.origin === window.location.origin; } catch(e){ return false; } }
  };

  const DEFAULT_IMAGE_SIZES = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px';
  const FALLBACK_IMAGE = {
    src: '/assets/images/hero-insight-800.svg',
    srcset: '/assets/images/hero-insight-400.svg 400w, /assets/images/hero-insight-800.svg 800w, /assets/images/hero-insight-1200.svg 1200w',
    sizes: DEFAULT_IMAGE_SIZES,
    alt: 'MIROZA featured story'
  };

  function buildCard(post){
    const card=document.createElement('article');
    card.className='card fade-in';
    card.setAttribute('data-id', post.id);
    card.dataset.label = post.category || 'Story';
    const isTrending = window.MIROZA.posts?.isTrending?.(post.id);
    if(isTrending) card.dataset.trending='true'; else card.removeAttribute('data-trending');

    const imgData = post.image || FALLBACK_IMAGE;
    const img=document.createElement('img');
    img.loading='lazy';
    img.decoding='async';
    img.src = imgData.src || FALLBACK_IMAGE.src;
    if (imgData.srcset) img.setAttribute('srcset', imgData.srcset);
    img.setAttribute('sizes', imgData.sizes || DEFAULT_IMAGE_SIZES);
    img.alt = imgData.alt || post.title;
    img.width=400; img.height=225;
    card.appendChild(img);

    const content=document.createElement('div');
    content.className='card-content';
    const h=document.createElement('h3');
    h.className='card-title';
    h.innerHTML=window.MIROZA.utils.safeHTML(post.title);
    const meta=document.createElement('p');
    meta.className='card-meta';
    const viewsLabel = window.MIROZA.utils.formatNumber(post.views || 0);
    meta.textContent=`${post.category || 'Story'} • ${viewsLabel} views`;
    const ex=document.createElement('p');
    ex.className='card-excerpt';
    ex.innerHTML=window.MIROZA.utils.safeHTML(post.excerpt);
    const link=document.createElement('a');
    link.href = post.link || ('/articles/'+post.slug+'.html');
    link.textContent='Read More →';
    link.className='read-more';
    link.setAttribute('data-prefetch','');
    link.setAttribute('data-transition','');
    content.appendChild(h);
    content.appendChild(meta);
    content.appendChild(ex);
    content.appendChild(link);
    card.appendChild(content);
    return card;
  }

  window.MIROZA.buildCard = buildCard;

  /* Hero Rotator */
  window.MIROZA.hero = (function(){
    const ROTATE_INTERVAL = 12000;
    let items = [];
    let index = 0;
    let timer = null;
    let controlsBound = false;
    const els = { tag:null, title:null, excerpt:null, link:null, picture:null, image:null, advance:null };

    function cacheEls(){
      els.tag = window.MIROZA.utils.qs('#hero-tag');
      els.title = window.MIROZA.utils.qs('[data-hero-title]');
      els.excerpt = window.MIROZA.utils.qs('[data-hero-excerpt]');
      els.link = window.MIROZA.utils.qs('#hero-link');
      els.picture = window.MIROZA.utils.qs('#hero-picture');
      els.image = window.MIROZA.utils.qs('#hero-image');
      els.advance = window.MIROZA.utils.qs('.hero-advance');
    }

    function bindControls(){
      if(controlsBound) return;
      controlsBound = true;
      els.advance?.addEventListener('click', ()=> advance(true));
    }

    function stopTimer(){ if(timer){ window.clearInterval(timer); timer=null; } }
    function startTimer(){
      if(items.length <= 1 || window.MIROZA.utils.prefersReducedMotion()) return;
      stopTimer();
      timer = window.setInterval(()=> advance(false), ROTATE_INTERVAL);
    }

    function getLink(post){ return post.link || (post.slug ? `/articles/${post.slug}.html` : '#'); }

    function apply(post){
      if(!post) return;
      const safeHTML = window.MIROZA.utils.safeHTML;
      els.tag && (els.tag.textContent = post.category || 'Featured Story');
      els.title && (els.title.innerHTML = safeHTML(post.title));
      els.excerpt && (els.excerpt.innerHTML = safeHTML(post.excerpt));
      if(els.link){
        els.link.href = getLink(post);
        els.link.setAttribute('data-prefetch','');
      }
      const imageData = post.image || FALLBACK_IMAGE;
      if(els.image){
        els.image.src = imageData.src || FALLBACK_IMAGE.src;
        if(imageData.srcset){ els.image.srcset = imageData.srcset; }
        els.image.sizes = imageData.sizes || DEFAULT_IMAGE_SIZES;
        els.image.alt = imageData.alt || post.title;
      }
      if(els.picture){ els.picture.dataset.storyId = post.id; }
    }

    function advance(manual=false){
      if(!items.length) return;
      index = (index + 1) % items.length;
      apply(items[index]);
      if(manual) startTimer();
    }

    function mount(heroItems=[]){
      cacheEls();
      items = heroItems.filter(Boolean);
      index = 0;
      if(!items.length) return;
      apply(items[0]);
      bindControls();
      startTimer();
    }

    function setItems(heroItems=[]){
      items = heroItems.filter(Boolean);
      index = 0;
      if(!items.length){ stopTimer(); return; }
      apply(items[0]);
      startTimer();
    }

    return { mount, setItems, next:()=>advance(true) };
  })();

  /* Theme Module */
  window.MIROZA.theme = (function(){
    const storageKey='miroza_theme';
    function current(){ return document.documentElement.dataset.theme || 'light'; }
    function setTheme(theme){ document.documentElement.dataset.theme=theme; try{ localStorage.setItem(storageKey, theme); }catch(e){} updateToggleIcon(); }
    function toggle(){ setTheme(current()==='light'? 'dark':'light'); }
    function updateToggleIcon(){ const btn = window.MIROZA.utils.qs('.theme-toggle img'); if(!btn) return; btn.src = current()==='light'? '/assets/icons/moon.svg':'/assets/icons/sun.svg'; btn.alt = current()==='light'? 'Enable dark mode':'Enable light mode'; }
    function init(){ updateToggleIcon(); }
    return { init, toggle };
  })();

  /* Mobile Navigation */
  window.MIROZA.nav = (function(){
    let open=false; let navEl, toggleBtn;
    function renderState(){ if(open){ navEl.classList.add('open'); toggleBtn.setAttribute('aria-expanded','true'); toggleBtn.innerHTML='<img src="/assets/icons/close.svg" alt="Close" width="24" height="24" />'; } else { navEl.classList.remove('open'); toggleBtn.setAttribute('aria-expanded','false'); toggleBtn.innerHTML='<img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />'; } }
    function toggle(){ open=!open; renderState(); if(open){ navEl.querySelector('a')?.focus(); } else { toggleBtn.focus(); } }
    function init(){ navEl=window.MIROZA.utils.qs('.main-nav'); toggleBtn=window.MIROZA.utils.qs('.menu-toggle'); if(!navEl||!toggleBtn) return; toggleBtn.addEventListener('click', toggle); }
    return { init, toggle };
  })();

  /* Posts Loading & Rendering */
  window.MIROZA.posts = (function(){
    const dataUrl = '/data/posts.json';
    let posts=[];
    let readyPromise=null;
    let heroCandidates=[];
    let trendingSet=new Set();

    function fetchPosts(){
      return fetch(dataUrl)
        .then(r=>r.json())
        .then(json=>{ posts=json; computeDerived(); return posts; })
        .catch(err=>{ console.error('Posts load failed', err); return []; });
    }

    function computeDerived(){
      heroCandidates = [...posts].sort((a,b)=> (b.views||0) - (a.views||0));
      trendingSet = new Set(heroCandidates.slice(0,5).map(p=>p.id));
    }

    function filterByCategory(cat){
      const match = (cat || '').toLowerCase();
      return posts.filter(p=>(p.category || '').toLowerCase() === match);
    }
    function trending(){ return heroCandidates.slice(0,5); }
    function isTrending(id){ return trendingSet.has(id); }

    function renderTrending(){
      const list = window.MIROZA.utils.qs('#trending-list');
      if(!list) return;
      list.innerHTML='';
      trending().forEach(p=>{
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href = p.link || ('/articles/'+p.slug+'.html');
        a.textContent=p.title;
        a.setAttribute('data-prefetch','');
        a.setAttribute('data-transition','');
        const meta=document.createElement('span');
        meta.className='card-meta';
        meta.textContent = window.MIROZA.utils.formatNumber(p.views||0)+' views';
        li.appendChild(a);
        li.appendChild(meta);
        list.appendChild(li);
      });
    }

    function mountHomeSections(){
      const latestOrder = [...posts].sort((a,b)=>{
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      });
      window.MIROZA.pagination.mount({ targetSelector:'#latest-cards', controlsSelector:'#latest-pagination', getData:()=>latestOrder, pageSize:8, emptyMessage:'Fresh stories are on the way.', mode:'load-more', autoLoad:true });
      window.MIROZA.pagination.mount({ targetSelector:'#news-cards', controlsSelector:'#news-pagination', getData:()=>filterByCategory('News'), pageSize:6, emptyMessage:'News stories publishing soon.', mode:'load-more' });
      window.MIROZA.pagination.mount({ targetSelector:'#blog-cards', controlsSelector:'#blog-pagination', getData:()=>filterByCategory('Blog'), pageSize:6, emptyMessage:'Blog stories publishing soon.', mode:'load-more' });
      window.MIROZA.pagination.mount({ targetSelector:'#articles-cards', controlsSelector:'#articles-pagination', getData:()=>filterByCategory('Article'), pageSize:6, emptyMessage:'Long-form stories publishing soon.', mode:'load-more' });
      renderTrending();
      window.MIROZA.hero?.mount(heroCandidates.slice(0,5));
    }

    function mountCategoryPage(){
      const category = document.body.dataset.category;
      if(!category) return;
      window.MIROZA.pagination.mount({ targetSelector:'#category-list', controlsSelector:'#category-pagination', getData:()=>filterByCategory(category), pageSize:10, emptyMessage:`${category} stories publishing soon.`, mode:'load-more', autoLoad:true });
      renderTrending();
    }

    function hydratePage(){
      const pageType = document.body.dataset.page;
      if(pageType === 'home') mountHomeSections();
      if(pageType === 'category') mountCategoryPage();
      if(!pageType) renderTrending();
    }

    function init(){
      if(!readyPromise){ readyPromise = fetchPosts().then(()=>{ hydratePage(); return posts; }); }
      else { readyPromise.then(()=>hydratePage()); }
      return readyPromise;
    }

    function ready(){ return readyPromise ?? (readyPromise = fetchPosts()); }

    function heroFeed(){ return heroCandidates.slice(0,5); }

    return { init, ready, posts:()=>posts, filterByCategory, trending, isTrending, heroFeed };
  })();

  /* Pagination Helper */
  window.MIROZA.pagination = (function(){
    function mount({ targetSelector, controlsSelector, getData, pageSize=10, emptyMessage='More stories coming soon.', mode='paged', autoLoad=false }){
      const target = window.MIROZA.utils.qs(targetSelector);
      const controls = window.MIROZA.utils.qs(controlsSelector);
      if(!target || !controls || typeof getData !== 'function') return null;
      const state = { page:0 };
      const loadMoreMode = mode === 'load-more';
      let io;
      function render(){
        const data = getData() || [];
        if(!data.length){
          target.innerHTML = '';
          const emptyState = document.createElement('p');
          emptyState.className = 'card-excerpt';
          emptyState.textContent = emptyMessage;
          target.appendChild(emptyState);
          controls.innerHTML = '';
          return;
        }
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        state.page = Math.min(state.page, totalPages - 1);
        if(loadMoreMode){
          renderLoadMore(data, totalPages);
          return;
        }
        const start = state.page * pageSize;
        const slice = data.slice(start, start + pageSize);
        target.innerHTML='';
        slice.forEach(post => target.appendChild(window.MIROZA.buildCard(post)));
        controls.innerHTML='';
        const prev = document.createElement('button');
        prev.type='button'; prev.textContent='Previous'; prev.disabled = state.page === 0;
        prev.addEventListener('click', ()=>{ if(state.page>0){ state.page--; render(); } });
        const indicator = document.createElement('span');
        indicator.className='page-indicator';
        indicator.textContent = `Page ${state.page+1} of ${totalPages}`;
        const next = document.createElement('button');
        next.type='button'; next.textContent='Next'; next.disabled = state.page >= totalPages-1;
        next.addEventListener('click', ()=>{ if(state.page<totalPages-1){ state.page++; render(); } });
        controls.appendChild(prev);
        controls.appendChild(indicator);
        controls.appendChild(next);
      }

      render();
      function renderLoadMore(data, totalPages){
        const visibleCount = Math.min((state.page + 1) * pageSize, data.length);
        target.innerHTML='';
        data.slice(0, visibleCount).forEach(post => target.appendChild(window.MIROZA.buildCard(post)));
        controls.innerHTML='';
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='load-more-btn';
        const moreAvailable = state.page < totalPages - 1;
        btn.textContent = moreAvailable ? 'Load more stories' : 'All stories loaded';
        btn.disabled = !moreAvailable;
        btn.addEventListener('click', ()=>{
          if(state.page < totalPages-1){
            state.page++;
            render();
          }
        });
        controls.appendChild(btn);
        if(autoLoad && moreAvailable && 'IntersectionObserver' in window){
          io?.disconnect();
          io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if(entry.isIntersecting && !btn.disabled){ btn.click(); }
            });
          }, { rootMargin:'200px 0px' });
          io.observe(btn);
        }
      }
      return { render };
    }

    return { mount };
  })();

  /* Link Prefetch */
  window.MIROZA.prefetch = (function(){
    const supportsPrefetch = 'relList' in document.createElement('link') && document.createElement('link').relList.supports && document.createElement('link').relList.supports('prefetch');
    function handler(e){ const a=e.target.closest('a[data-prefetch]'); if(!a) return; if(!supportsPrefetch) return; if(a.dataset.prefetched) return; const link=document.createElement('link'); link.rel='prefetch'; link.href=a.href; document.head.appendChild(link); a.dataset.prefetched='true'; }
    function init(){ document.addEventListener('mouseover', handler); document.addEventListener('touchstart', handler, {passive:true}); }
    return { init };
  })();

  /* UI Interactions */
  window.MIROZA.ui = (function(){
    let header, backToTopBtn, lazyObserver, ticking=false;

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
    }

    return { init, hydrateLazySections };
  })();

  /* Analytics & Diagnostics */
  window.MIROZA.analytics = (function(){
    const defaults = { enabled:false, plausibleDomain:'', debug:false };
    let config = { ...defaults };
    let plausibleLoaded=false;

    function loadConfig(){
      const external = window.MIROZA.analyticsConfig || {};
      config = { ...defaults, ...external };
    }

    function injectPlausible(){
      if(plausibleLoaded || !config.plausibleDomain) return;
      const existing = document.querySelector('script[data-analytics="plausible"]');
      if(existing){ plausibleLoaded = true; return; }
      const script=document.createElement('script');
      script.src='https://plausible.io/js/plausible.js';
      script.defer=true;
      script.dataset.domain=config.plausibleDomain;
      script.dataset.analytics='plausible';
      script.addEventListener('load', ()=>{ plausibleLoaded=true; if(config.debug){ console.info('[MIROZA]', 'Plausible analytics loaded'); } });
      document.head.appendChild(script);
    }

    function log(...args){ if(config.debug){ console.info('[MIROZA]', ...args); } }

    function enableDiagnostics(){
      if(!config.debug) return;
      log('Debug diagnostics enabled');
      window.addEventListener('load', ()=>{
        const nav = window.performance?.getEntriesByType?.('navigation')?.[0];
        if(nav){
          log('Navigation timing (ms)', {
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
            total: Math.round(nav.duration)
          });
        }
      }, { once:true });

      if('PerformanceObserver' in window){
        try {
          const paintObserver = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => log('Paint metric', entry.name, Math.round(entry.startTime)+'ms'));
          });
          paintObserver.observe({ type:'paint', buffered:true });
        } catch(err){ log('Paint observer unavailable', err.message); }
      }

      if(window.MIROZA.posts?.ready){
        window.MIROZA.posts.ready().then(items=>{
          log('Posts available', items.length);
        }).catch(err=> console.warn('MIROZA diagnostics unable to read posts', err));
      }
    }

    function init(){
      loadConfig();
      if(config.enabled){ injectPlausible(); }
      enableDiagnostics();
    }

    return { init, config:()=>({ ...config }) };
  })();

  /* Accessibility Enhancements */
  window.MIROZA.a11y = (function(){
    function skipLinkFocus(){ const skip = window.MIROZA.utils.qs('.skip-link'); if(skip){ skip.addEventListener('click', ()=>{ window.MIROZA.utils.qs('#main')?.focus(); }); } }
    function keyboardNav(){ document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ // close mobile nav if open
        const nav=window.MIROZA.utils.qs('.main-nav'); if(nav && nav.classList.contains('open')){ window.MIROZA.nav.toggle(); }
      }
    }); }
    function init(){ skipLinkFocus(); keyboardNav(); }
    return { init };
  })();

  /* Service Worker Registration */
  window.MIROZA.pwa = (function(){
    function register(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(err=> console.warn('SW registration failed', err)); } }
    return { register };
  })();

  /* Initialization on DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', function(){
    window.MIROZA.analytics.init();
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.posts.init();
    window.MIROZA.prefetch.init();
    window.MIROZA.ui.init();
    window.MIROZA.a11y.init();
    window.MIROZA.pwa.register();
    // Theme toggle button binding
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle'); if(themeBtn){ themeBtn.addEventListener('click', window.MIROZA.theme.toggle); }
    // Dynamic year
    const yearEl = window.MIROZA.utils.qs('#year'); if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
  });
})();