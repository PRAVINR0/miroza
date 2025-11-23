/* images.js
   Client-side lazy loader with blur-up placeholders.
   Expects a mapping at `/assets/data/image-placeholders.json` with originalUrl -> dataURI (tiny placeholder).
   Usage: add `<img data-src="..." data-srcset="..." class="lazyimg">` in markup. Call `initImages()` on DOM ready.
*/
(function(window, document){
  async function loadPlaceholders(){
    try{
      const res = await fetch('/assets/data/image-placeholders.json');
      if(!res.ok) return {};
      return await res.json();
    }catch(e){ return {} }
  }

  function applyPlaceholder(img, map){
    const src = img.getAttribute('data-src');
    if(!src) return;
    const p = map[src] || img.getAttribute('data-placeholder');
    if(p){ img.src = p; img.classList.add('blur-up'); }
    img.setAttribute('loading','lazy');
    img.style.transition = 'filter .4s, opacity .3s';
  }

  function observeLazy(img){
    if(!('IntersectionObserver' in window)){ // fallback
      loadReal(img); return
    }
    const io = new IntersectionObserver((entries, observer)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ loadReal(img); observer.unobserve(img); }
      });
    },{rootMargin:'200px'});
    io.observe(img);
  }

  function loadReal(img){
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
    if(src){
      const tmp = new Image();
      tmp.onload = ()=>{ img.src = src; img.classList.remove('blur-up'); img.classList.add('loaded'); };
      tmp.onerror = ()=>{ img.classList.remove('blur-up'); };
      tmp.src = src;
    }
  }

  async function initImages(){
    const map = await loadPlaceholders();
    const imgs = Array.from(document.querySelectorAll('img.lazyimg'));
    imgs.forEach(img=>{ applyPlaceholder(img, map); observeLazy(img); });
  }

  window.initImages = initImages;
})(window, document);
