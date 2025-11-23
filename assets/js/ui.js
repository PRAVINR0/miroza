'use strict';
// UI helpers: page transitions, ripple, and header interactions
(function(){
  function onReady(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}

  function initLogoLinks(){
    // ensure any .brand anchor goes to /index.html
    document.querySelectorAll('.brand').forEach(a=>{
      a.setAttribute('href','/index.html');
      a.addEventListener('click',(e)=>{
        // allow normal navigation; add exit animation
      });
    });
  }

  function addRipple(){
    document.addEventListener('click', function(e){
      const el = e.target.closest('.ripple-effect,button, .btn, .icon-btn');
      if(!el) return;
      const rect = el.getBoundingClientRect();
      const circle = document.createElement('span');
      circle.className = 'ripple-anim';
      const size = Math.max(rect.width, rect.height)*1.2;
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size/2) + 'px';
      circle.style.top = (e.clientY - rect.top - size/2) + 'px';
      el.style.position = el.style.position || 'relative';
      el.appendChild(circle);
      setTimeout(()=>circle.remove(),700);
    });
  }

  function pageTransitions(){
    // add fade-in for body
    document.documentElement.classList.add('page-fade');
    onReady(()=>{
      document.documentElement.classList.add('visible');
    });

    // intercept internal link clicks to play exit animation
    document.addEventListener('click', (e)=>{
      const a = e.target.closest('a');
      if(!a) return;
      const href = a.getAttribute('href') || '';
      const target = a.getAttribute('target');
      if(target === '_blank' || href.startsWith('mailto:') || href.startsWith('http')) return; // don't intercept external
      // allow anchor hashes and same page
      if(href.startsWith('#') || href === '' ) return;
      e.preventDefault();
      document.documentElement.classList.remove('visible');
      setTimeout(()=>{ window.location.href = href; }, 260);
    });
  }

  function revealOnScroll(){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ en.target.classList.add('fade-in'); io.unobserve(en.target); }
      });
    },{threshold:0.08});
    // observe cards and footer
    document.querySelectorAll('.footer-inner, .card, .card-media, .hero, .detail-media').forEach(el=>io.observe(el));
  }

  function setYear(){
    const yearEls = document.querySelectorAll('#year');
    yearEls.forEach(el=>el.textContent = new Date().getFullYear());
  }

  function initFAB(){
    // create FAB if not present
    if(document.querySelector('.fab-wrap')) return;
    const wrap = document.createElement('div'); wrap.className='fab-wrap';
    wrap.innerHTML = `
      <div class="fab-actions" aria-hidden="true" style="display:none">
        <div class="fab-label">Home</div><button class="fab-action" data-action="home" title="Home">🏠</button>
        <div class="fab-label">Search</div><button class="fab-action" data-action="search" title="Search">🔍</button>
        <div class="fab-label">Theme</div><button class="fab-action" data-action="theme" title="Toggle theme">🌓</button>
      </div>
      <button class="fab fab-main" aria-label="Quick menu">✦</button>
    `;
    document.body.appendChild(wrap);
    const main = wrap.querySelector('.fab-main');
    const actions = wrap.querySelector('.fab-actions');
    let open=false;
    function toggleFab(){ open = !open; actions.style.display = open ? 'flex' : 'none'; main.style.transform = open ? 'rotate(45deg) scale(1.04)' : ''; }
    main.addEventListener('click', toggleFab);
    wrap.addEventListener('click', (e)=>{
      const a = e.target.closest('[data-action]');
      if(!a) return;
      const act = a.dataset.action;
      if(act==='home') window.location.href='/index.html';
      if(act==='search'){ const q = prompt('Search MIROZA'); if(q) window.location.href=`/search.html?q=${encodeURIComponent(q)}` }
      if(act==='theme'){ if(window.theme && window.theme.toggle) window.theme.toggle(); }
    });
  }

  function initMobileNav(){
    // create drawer overlay and wire to #mobile-menu button
    if(document.querySelector('.mobile-drawer')) return;
    const drawer = document.createElement('div'); drawer.className='mobile-drawer';
    drawer.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;justify-content:flex-end;pointer-events:none;';
    drawer.innerHTML = `
      <div class="mobile-drawer-panel" style="width:320px;background:var(--card);backdrop-filter:blur(12px);box-shadow:0 20px 60px rgba(2,6,23,0.6);transform:translateX(110%);transition:transform .36s ease;pointer-events:auto;padding:20px;">
        <button class="close-drawer" style="float:right">✕</button>
        <h3 style="margin-top:6px">Menu</h3>
        <nav style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
          <a href="/index.html">Home</a>
          <a href="/news.html">News</a>
          <a href="/articles.html">Articles</a>
          <a href="/blogs.html">Blogs</a>
          <a href="/stories.html">Stories</a>
          <a href="/info.html">Info</a>
        </nav>
      </div>
    `;
    document.body.appendChild(drawer);
    const panel = drawer.querySelector('.mobile-drawer-panel');
    const openBtn = document.getElementById('mobile-menu');
    function open(){ drawer.style.pointerEvents='auto'; panel.style.transform='translateX(0)'; }
    function close(){ panel.style.transform='translateX(110%)'; setTimeout(()=>drawer.style.pointerEvents='none',380); }
    if(openBtn) openBtn.addEventListener('click', (e)=>{ e.preventDefault(); open(); });
    drawer.querySelector('.close-drawer').addEventListener('click', close);
    drawer.addEventListener('click', (e)=>{ if(e.target===drawer) close(); });
  }

  function enhanceImages(){
    document.querySelectorAll('img').forEach(img=>{
      if(img.dataset.uiEnhanced) return; img.dataset.uiEnhanced = '1';
      // apply blur class until loaded
      img.classList.add('img-blur');
      if(img.complete){ img.classList.add('img-loaded'); img.classList.remove('img-blur'); }
      img.addEventListener('load', ()=>{ img.classList.add('img-loaded'); img.classList.remove('img-blur'); });
    });
  }

  onReady(()=>{
    initLogoLinks();
    addRipple();
    pageTransitions();
    revealOnScroll();
    setYear();
    initFAB();
    enhanceImages();
  });
  // expose minimal
  window.ui = {initLogoLinks};
})();
