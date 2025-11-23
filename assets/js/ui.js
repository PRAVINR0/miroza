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
    document.querySelectorAll('.footer-inner, .card').forEach(el=>io.observe(el));
  }

  function setYear(){
    const yearEls = document.querySelectorAll('#year');
    yearEls.forEach(el=>el.textContent = new Date().getFullYear());
  }

  onReady(()=>{
    initLogoLinks();
    addRipple();
    pageTransitions();
    revealOnScroll();
    setYear();
  });
  // expose minimal
  window.ui = {initLogoLinks};
})();
