/* scripts/app.js — MIROZA frontend core
   Features:
   - Theme init (no-FOUC): applied via inline head script in pages
   - Posts loading & rendering with Fisher–Yates shuffle
   - Prefetching & PJAX navigation (History API)
   - Accessible menu, keyboard handling, search typeahead
   - Lazy-loading images, skeletons, back-to-top
   - Performance logging & analytics hook

   Exposes window.MIROZA API: init(options), loadPosts(), shuffle(), toggleTheme(), prefetch(url)
*/
(function(global){
  const MIROZA = {};
  MIROZA.config = Object.assign({postsUrl:'/data/posts.json',latestPerCategory:4,swPath:'/sw.js'}, window.MIROZA?.config || {});

  // Basic in-memory cache for prefetch
  MIROZA._cache = {html:{}};

  // Theme helpers
  MIROZA.initTheme = function(){
    // called after DOM ready; initial application happens inlined in head
    const btn = document.getElementById('themeToggle'); if(btn) btn.addEventListener('click', MIROZA.toggleTheme);
  };
  MIROZA.toggleTheme = function(){
    const isDark = document.documentElement.classList.toggle('theme-dark');
    try{localStorage.setItem('miroza_theme', isDark ? 'dark' : 'light')}catch(e){}
  };

  // Fetch posts.json
  MIROZA.loadPosts = async function(){
    try{const r=await fetch(MIROZA.config.postsUrl,{cache:'no-cache'});if(!r.ok)throw new Error('posts fetch failed');const j=await r.json();return j.posts||[]}catch(e){console.warn(e);return []}
  };

  // Fisher–Yates shuffle
  MIROZA.shuffle = function(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

  // Render helpers
  MIROZA.renderCard = function(post){const article=document.createElement('article');article.className='card';const pic=document.createElement('img');pic.setAttribute('data-src',post.image);pic.alt=post.title;pic.loading='lazy';pic.className='lazy';article.appendChild(pic);const body=document.createElement('div');body.className='card-body';const h3=document.createElement('h3');const a=document.createElement('a');a.href='/articles/'+post.slug+'.html';a.textContent=post.title;a.setAttribute('rel','noopener noreferrer');h3.appendChild(a);const meta=document.createElement('p');meta.className='muted';meta.textContent=post.author+' • '+new Date(post.date).toLocaleDateString();const ex=document.createElement('p');ex.className='excerpt';ex.textContent=post.excerpt;body.appendChild(h3);body.appendChild(meta);body.appendChild(ex);article.appendChild(body);return article};

  MIROZA.renderCards = function(container, posts){container.innerHTML='';posts.forEach(p=>container.appendChild(MIROZA.renderCard(p)));MIROZA.lazyLoadImages();};

  MIROZA.lazyLoadImages = function(){const lazy = document.querySelectorAll('img.lazy');if('IntersectionObserver' in window){const io=new IntersectionObserver((entries, observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){const img=entry.target;img.src=img.getAttribute('data-src')||img.src;img.classList.remove('lazy');observer.unobserve(img)}});},{rootMargin:'200px'});lazy.forEach(i=>io.observe(i));}else{lazy.forEach(i=>{i.src=i.getAttribute('data-src')||i.src;i.classList.remove('lazy')})}document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src='/assets/hero-1.svg';img.alt='placeholder image'}));};

  // Prefetch HTML and cache it
  MIROZA.prefetch = async function(url){if(MIROZA._cache.html[url]) return MIROZA._cache.html[url];try{const r=await fetch(url,{credentials:'same-origin'});if(!r.ok) throw new Error('prefetch failed');const txt=await r.text();MIROZA._cache.html[url]=txt;return txt}catch(e){return null}};

  // PJAX navigate: fetch url, replace <main>, update title/meta
  MIROZA.navigate = async function(url, push=true){
    const start=performance.now();document.documentElement.classList.add('is-transitioning');
    try{
      const html = MIROZA._cache.html[url] || await MIROZA.prefetch(url);
      if(!html) { window.location.href = url; return }
      const tmp = document.createElement('div'); tmp.innerHTML = html;
      const newMain = tmp.querySelector('main');
      if(!newMain){ window.location.href = url; return }
      const main = document.querySelector('main');
      // Replace main
      main.replaceWith(newMain);
      // Update title
      const newTitle = tmp.querySelector('title'); if(newTitle) document.title = newTitle.textContent;
      // Update meta description if present
      const newMeta = tmp.querySelector('meta[name="description"]'); if(newMeta){ let md = document.querySelector('meta[name="description"]'); if(md) md.setAttribute('content', newMeta.getAttribute('content')); else document.head.appendChild(newMeta.cloneNode(true)); }
      // Manage history
      if(push) history.pushState({url:url},'',url);
      // focus management
      newMain.setAttribute('tabindex','-1'); newMain.focus(); newMain.removeAttribute('tabindex');
      MIROZA.lazyLoadImages();
      // announce
      document.getElementById('liveRegion')?.textContent = 'Loaded content for '+ (tmp.querySelector('h1')?.textContent || url);
    }catch(e){console.error('PJAX error',e); window.location.href = url;}
    finally{document.documentElement.classList.remove('is-transitioning'); console.log('navigate took',performance.now()-start,'ms')}
  };

  // Initialize link handlers: prefetch on hover, hijack clicks for PJAX
  MIROZA.initRouter = function(){
    document.addEventListener('mouseover', (e)=>{const a=e.target.closest && e.target.closest('a'); if(a && a.href && a.origin===location.origin) MIROZA.prefetch(a.href);});
    document.addEventListener('click', (e)=>{const a=e.target.closest && e.target.closest('a'); if(!a) return; if(a.target==='_'+'blank') return; const href=a.getAttribute('href'); if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return; if(a.origin!==location.origin) return; e.preventDefault(); MIROZA.navigate(a.href,true);});
    window.addEventListener('popstate', (e)=>{ MIROZA.navigate(location.href,false);});
  };

  // Search typeahead (client-side filtering)
  MIROZA.initSearch = function(){
    const input = document.getElementById('searchInput'); const list = document.getElementById('searchResults'); if(!input) return;
    let postsCache = null; input.addEventListener('input', async (e)=>{const q=e.target.value.trim().toLowerCase(); if(q.length<2){ if(list) list.innerHTML=''; return } if(!postsCache) postsCache = await MIROZA.loadPosts(); const matches = postsCache.filter(p=> (p.title+p.excerpt+p.author).toLowerCase().includes(q)).slice(0,8); if(list){list.innerHTML='';matches.forEach(m=>{const li=document.createElement('div');li.className='search-item';const a=document.createElement('a');a.href='/articles/'+m.slug+'.html';a.textContent=m.title;li.appendChild(a);list.appendChild(li)})}});
  };

  MIROZA.init = function(){
    MIROZA.initTheme(); MIROZA.initRouter(); MIROZA.initSearch(); MIROZA.lazyLoadImages();
    // back to top
    const bt=document.getElementById('backToTop'); if(bt) {window.addEventListener('scroll',()=>{window.scrollY>400?bt.classList.add('show'):bt.classList.remove('show')}); bt.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));}
    // Live region for announcements
    if(!document.getElementById('liveRegion')){const lr=document.createElement('div');lr.id='liveRegion';lr.setAttribute('aria-live','polite');lr.style.position='absolute';lr.style.left='-9999px';document.body.appendChild(lr)}
    // register SW
    if('serviceWorker' in navigator){navigator.serviceWorker.register(MIROZA.config.swPath).catch(e=>console.warn('SW',e))}
  };

  // Perf logging (LCP observer)
  MIROZA.initPerf = function(){if('PerformanceObserver' in window){try{const po=new PerformanceObserver((list)=>{list.getEntries().forEach(e=>console.log('Performance entry',e.name,e.startTime,e.duration))});po.observe({type:'largest-contentful-paint',buffer:true});}catch(e){}}}

  // Expose API
  global.MIROZA = MIROZA;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', MIROZA.init); else MIROZA.init();
})(window);
