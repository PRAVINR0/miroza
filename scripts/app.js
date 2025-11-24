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

    function formatDate(ts){
      try {
        return new Intl.DateTimeFormat('en', { month:'short', day:'numeric', year:'numeric' }).format(new Date(ts));
      } catch(e){
        return new Date(ts).toLocaleDateString();
      }
    }

    function renderComments(list, items){
      if(!list) return;
      list.innerHTML='';
      if(!items.length){
        const empty=document.createElement('li');
        empty.className='card-meta';
        empty.textContent='No comments yet. Share your perspective below (stored locally only).';
        list.appendChild(empty);
        return;
      }
      items.forEach(entry=>{
        const li=document.createElement('li');
        li.className='comment-card';
        const meta=document.createElement('div');
        meta.className='comment-meta';
        meta.textContent = `${entry.name} • ${formatDate(entry.ts)}`;
        const body=document.createElement('p');
        body.textContent = entry.comment;
        li.appendChild(meta);
        li.appendChild(body);
        list.appendChild(li);
      });
    }

    function saveComment(entry){
      const key = getArticleKey();
      const store = { ...readComments() };
      const list = store[key] ? [...store[key]] : [];
      list.push(entry);
      store[key] = list.slice(-MAX_COMMENTS);
      writeComments(store);
      return store[key];
    }

    function toggleLike(button, feedback){
      const key = getArticleKey();
      const likes = { ...readLikes() };
      const nextState = !likes[key];
      if(nextState){ likes[key]=true; } else { delete likes[key]; }
      writeLikes(likes);
      if(button){
        button.dataset.liked = nextState ? 'true':'false';
        button.setAttribute('aria-pressed', nextState ? 'true':'false');
        button.textContent = nextState ? '♥ Liked' : '♡ Appreciate';
      }
      updateFeedback(feedback, nextState ? 'Thanks for the love!' : 'Like removed.', 'success');
    }

    function handleShare(action, feedback, button){
      const url = window.location.href;
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content || 'Discover more from MIROZA.';
      const encodedUrl = encodeURIComponent(url);
      if(action === 'like'){ toggleLike(button, feedback); return; }
      if(action === 'copy'){
        if(navigator.clipboard?.writeText){
          navigator.clipboard.writeText(url).then(()=> updateFeedback(feedback, 'Link copied to clipboard.', 'success')).catch(()=> fallbackCopy(url, feedback));
        } else { fallbackCopy(url, feedback); }
        return;
      }
      if(action === 'twitter'){
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`, '_blank', 'noopener');
        updateFeedback(feedback, 'Opening X (Twitter)…', 'pending');
        return;
      }
      if(action === 'linkedin'){
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener');
        updateFeedback(feedback, 'Opening LinkedIn…', 'pending');
        return;
      }
      if(action === 'native' && navigator.share){
        navigator.share({ title, text: description, url })
          .then(()=> updateFeedback(feedback, 'Thanks for sharing!', 'success'))
          .catch(()=> updateFeedback(feedback, 'Share cancelled.', 'info'));
        return;
      }
      // fallback to copy link
      handleShare('copy', feedback);
    }

    function fallbackCopy(url, feedback){
      const copyPrompt = window.prompt('Copy this link and share it anywhere:', url);
      if(copyPrompt !== null){ updateFeedback(feedback, 'Copy the highlighted link to share.', 'info'); }
    }

    function buildShareActions(article){
      let block = article.querySelector('.share-actions');
      if(!block){
        block = document.createElement('div');
        block.className='share-actions';
        block.setAttribute('aria-label', 'Share actions');
        const buttons = [
          { type:'native', label:'Quick share' },
          { type:'twitter', label:'Post to X' },
          { type:'linkedin', label:'Share on LinkedIn' },
          { type:'copy', label:'Copy link' }
        ];
        const frag=document.createDocumentFragment();
        buttons.forEach(cfg=>{
          const btn=document.createElement('button');
          btn.type='button';
          btn.dataset.share=cfg.type;
          btn.textContent=cfg.label;
          frag.appendChild(btn);
        });
        const likeBtn=document.createElement('button');
        likeBtn.type='button';
        likeBtn.dataset.share='like';
        likeBtn.classList.add('like-btn');
        const liked = !!readLikes()[getArticleKey()];
        likeBtn.dataset.liked = liked ? 'true':'false';
        likeBtn.setAttribute('aria-pressed', liked ? 'true':'false');
        likeBtn.textContent = liked ? '♥ Liked' : '♡ Appreciate';
        frag.appendChild(likeBtn);
        block.appendChild(frag);
        const header = article.querySelector('header');
        if(header){ header.insertAdjacentElement('afterend', block); }
        else { article.prepend(block); }
      }
      let feedback = article.querySelector('.share-feedback');
      if(!feedback){
        feedback = document.createElement('p');
        feedback.className='form-feedback share-feedback';
        feedback.setAttribute('aria-live','polite');
        feedback.textContent='';
        block.insertAdjacentElement('afterend', feedback);
      }
      return { block, feedback };
    }

    function buildCommentsSection(article){
      let section = article.querySelector('.comments');
      if(!section){
        const slug = getArticleKey().split('/').pop() || 'story';
        const uid = `comments-${slug.replace(/[^a-z0-9]+/gi,'-')}`;
        section = document.createElement('section');
        section.className='comments';
        section.setAttribute('aria-labelledby', `${uid}-heading`);
        section.innerHTML = `
          <h2 id="${uid}-heading">Join the conversation</h2>
          <form class="comment-form" novalidate>
            <label for="${uid}-name">Name</label>
            <input type="text" id="${uid}-name" name="name" maxlength="60" placeholder="Your name" required />
            <label for="${uid}-body">Comment</label>
            <textarea id="${uid}-body" name="comment" maxlength="500" placeholder="Be constructive and kind." required></textarea>
            <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <p class="form-feedback" aria-live="polite"></p>
            <button type="submit">Post comment</button>
          </form>
          <ul class="comment-list" aria-live="polite"></ul>
        `;
        article.appendChild(section);
      }
      return section;
    }

    function bindShare(block, feedback){
      if(!block || block.dataset.shareBound) return;
      block.dataset.shareBound='true';
      block.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-share]');
        if(!btn) return;
        const action = btn.dataset.share;
        handleShare(action, feedback, btn);
      });
    }

    function bindComments(section){
      const form = section.querySelector('form');
      const list = section.querySelector('.comment-list');
      const feedback = form.querySelector('.form-feedback');
      const store = readComments();
      const existing = store[getArticleKey()] || [];
      renderComments(list, existing);
      updateFeedback(feedback, 'Comments stay on this device until realtime APIs are wired up.', 'info');
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const formData = new FormData(form);
        if(formData.get('company')){ form.reset(); return; }
        const name = sanitizePlain((formData.get('name') || 'Guest').trim()).slice(0,60) || 'Guest';
        const comment = sanitizePlain((formData.get('comment') || '').trim());
        if(comment.length < 5){
          updateFeedback(feedback, 'Please add a bit more detail (minimum 5 characters).', 'error');
          return;
        }
        const entry = { name, comment, ts: Date.now() };
        const latest = saveComment(entry);
        renderComments(list, latest);
        updateFeedback(feedback, 'Comment captured locally for preview. ✅', 'success');
        form.reset();
      });
    }

    function enhanceArticle(){
      if(document.body.dataset.page !== 'article') return;
      const article = window.MIROZA.utils.qs('.single-article');
      if(!article) return;
      const { block, feedback } = buildShareActions(article);
      bindShare(block, feedback);
      const commentsSection = buildCommentsSection(article);
      bindComments(commentsSection);
    }

    function init(){ enhanceArticle(); }

    return { init };
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
    window.MIROZA.forms.init();
    window.MIROZA.community.init();
    window.MIROZA.ui.init();
    window.MIROZA.a11y.init();
    window.MIROZA.pwa.register();
    // Theme toggle button binding
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle'); if(themeBtn){ themeBtn.addEventListener('click', window.MIROZA.theme.toggle); }
    // Dynamic year
    const yearEl = window.MIROZA.utils.qs('#year'); if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
  });
})();