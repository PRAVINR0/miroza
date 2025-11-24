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
    safeHTML(str) { // If DOMPurify available, use it, else fallback to text node
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML; }
  };

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
    function fetchPosts(){ return fetch(dataUrl).then(r=>r.json()).then(json=>{ posts=json; return posts; }).catch(err=>{ console.error('Posts load failed', err); return []; }); }
    function filterByCategory(cat){ return posts.filter(p=>p.category.toLowerCase()===cat.toLowerCase()); }
    function trending(){ return window.MIROZA.utils.shuffle([...posts]).slice(0,5); }
    function buildCard(post){ const card=document.createElement('article'); card.className='card fade-in'; card.setAttribute('data-id', post.id);
      const img=document.createElement('img'); img.loading='lazy'; img.src=post.image || '/assets/images/placeholder.svg'; img.alt=post.title; img.width=400; img.height=225; card.appendChild(img);
      const content=document.createElement('div'); content.className='card-content';
      const h=document.createElement('h3'); h.className='card-title'; h.innerHTML=window.MIROZA.utils.safeHTML(post.title);
      const ex=document.createElement('p'); ex.className='card-excerpt'; ex.innerHTML=window.MIROZA.utils.safeHTML(post.excerpt);
      const link=document.createElement('a'); link.href='/articles/'+post.slug+'.html'; link.textContent='Read More →'; link.className='read-more'; link.setAttribute('data-prefetch','');
      content.appendChild(h); content.appendChild(ex); content.appendChild(link); card.appendChild(content); return card; }
    function renderLatest(){ const target = window.MIROZA.utils.qs('#latest-cards'); if(!target) return; target.innerHTML=''; const latest = window.MIROZA.utils.shuffle([...posts]).slice(0,8); latest.forEach(p=> target.appendChild(buildCard(p))); }
    function renderCategory(cat, id){ const target=window.MIROZA.utils.qs(id); if(!target) return; target.innerHTML=''; filterByCategory(cat).slice(0,4).forEach(p=> target.appendChild(buildCard(p))); }
    function renderTrending(){ const list = window.MIROZA.utils.qs('#trending-list'); if(!list) return; list.innerHTML=''; trending().forEach(p=>{ const li=document.createElement('li'); const a=document.createElement('a'); a.href='/articles/'+p.slug+'.html'; a.textContent=p.title; a.setAttribute('data-prefetch',''); li.appendChild(a); list.appendChild(li); }); }
    function init(){ fetchPosts().then(()=>{ renderLatest(); renderCategory('News','#news-cards'); renderCategory('Blog','#blog-cards'); renderCategory('Article','#articles-cards'); renderTrending(); }); }
    return { init, posts:()=>posts };
  })();

  /* Link Prefetch */
  window.MIROZA.prefetch = (function(){
    const supportsPrefetch = 'relList' in document.createElement('link') && document.createElement('link').relList.supports && document.createElement('link').relList.supports('prefetch');
    function handler(e){ const a=e.target.closest('a[data-prefetch]'); if(!a) return; if(!supportsPrefetch) return; if(a.dataset.prefetched) return; const link=document.createElement('link'); link.rel='prefetch'; link.href=a.href; document.head.appendChild(link); a.dataset.prefetched='true'; }
    function init(){ document.addEventListener('mouseover', handler); document.addEventListener('touchstart', handler, {passive:true}); }
    return { init };
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
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.posts.init();
    window.MIROZA.prefetch.init();
    window.MIROZA.a11y.init();
    window.MIROZA.pwa.register();
    // Theme toggle button binding
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle'); if(themeBtn){ themeBtn.addEventListener('click', window.MIROZA.theme.toggle); }
    // Dynamic year
    const yearEl = window.MIROZA.utils.qs('#year'); if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
  });
})();