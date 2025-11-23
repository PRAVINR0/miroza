/* app.js — MIROZA frontend module
   Implements: theme handling, post loading/rendering, shuffle, ticker, navigation, accessibility,
   skeleton placeholders, lazy-loading images, and service worker registration.

   All DOM text insertion uses safe textContent assignments to avoid XSS.
*/
(function(global){
  const MIROZA = {};
  MIROZA.config = {
    postsUrl: '/data/posts.json',
    latestPerCategory: 4,
    skeletonDelay: 300,
    swPath: '/sw.js'
  };

  /* Theme functions */
  MIROZA.initTheme = function(){
    try{
      const stored = localStorage.getItem('miroza_theme');
      if(stored) return MIROZA.applyTheme(stored);
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return MIROZA.applyTheme(prefers ? 'dark' : 'light');
    }catch(e){return MIROZA.applyTheme('light');}
  };
  MIROZA.applyTheme = function(name){
    if(name === 'dark') document.documentElement.classList.add('theme-dark'); else document.documentElement.classList.remove('theme-dark');
    localStorage.setItem('miroza_theme', name);
    const btn = document.getElementById('themeToggle'); if(btn) btn.textContent = name === 'dark' ? '☀️' : '🌙';
  };
  MIROZA.toggleTheme = function(){
    const isDark = document.documentElement.classList.contains('theme-dark');
    MIROZA.applyTheme(isDark ? 'light' : 'dark');
  };

  /* Fisher–Yates shuffle */
  MIROZA.shuffle = function(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
    return a;
  };

  /* Load posts JSON */
  MIROZA.loadPosts = async function(){
    try{
      const res = await fetch(MIROZA.config.postsUrl, {cache:'no-cache'});
      if(!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      return data.posts || [];
    }catch(e){console.warn('MIROZA: could not load posts',e);return []}
  };

  /* Render helpers */
  MIROZA.renderCard = function(post){
    const a = document.createElement('article');a.className='card fade-in';
    const img = document.createElement('img');img.setAttribute('data-src',post.image);img.alt = post.title;img.loading='lazy';img.className='lazy';
    a.appendChild(img);
    const body = document.createElement('div');body.className='card-body';
    const h3 = document.createElement('h3');
    const link = document.createElement('a');link.href = '/articles/' + post.slug + '.html';link.textContent = post.title;link.rel='noopener noreferrer';
    h3.appendChild(link);
    const meta = document.createElement('p');meta.className='muted';meta.textContent = post.author + ' • ' + new Date(post.date).toLocaleDateString();
    const ex = document.createElement('p');ex.className='excerpt';ex.textContent = post.excerpt;
    body.appendChild(h3);body.appendChild(meta);body.appendChild(ex);
    a.appendChild(body);
    return a;
  };

  MIROZA.renderCards = function(container, posts){
    container.innerHTML = ''; // clear skeletons
    posts.forEach(p=>container.appendChild(MIROZA.renderCard(p)));
    MIROZA.lazyLoadImages();
  };

  MIROZA.lazyLoadImages = function(){
    const imgs = document.querySelectorAll('img.lazy');
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries,observer)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){const img=e.target;img.src=img.getAttribute('data-src')||img.src;img.classList.remove('lazy');observer.unobserve(img)}
        });
      },{rootMargin:'200px'});
      imgs.forEach(i=>io.observe(i));
    }else{imgs.forEach(i=>{i.src=i.getAttribute('data-src')||i.src; i.classList.remove('lazy')});}
    // fallback swap for broken images
    document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>{img.src='/assets/hero-1.svg';img.alt='placeholder image';});});
  };

  /* UI: Ticker */
  MIROZA.initTicker = function(){
    const t = document.getElementById('tickerTrack');
    if(!t) return;
    // duplicate content for seamless loop
    t.innerHTML = t.innerHTML + t.innerHTML;
    let pos = 0; const speed = 0.4;
    function step(){pos -= speed; if(Math.abs(pos) >= t.scrollWidth/2) pos = 0; t.style.transform = 'translateX('+pos+'px)'; requestAnimationFrame(step);} requestAnimationFrame(step);
  };

  /* Navigation and accessibility */
  MIROZA.initNav = function(){
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    if(ham && nav){ham.addEventListener('click',()=>{const open=nav.classList.toggle('open');ham.setAttribute('aria-expanded',open);});}
    document.querySelectorAll('.has-dropdown > a').forEach(a=>{a.addEventListener('click',(e)=>{if(window.innerWidth<700){e.preventDefault();a.parentElement.classList.toggle('open');}});});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.has-dropdown.open').forEach(d=>d.classList.remove('open')); const navEl=document.getElementById('mainNav'); if(navEl) navEl.classList.remove('open');}});
  };

  /* Back to top */
  MIROZA.initBackToTop = function(){
    const btn = document.getElementById('backToTop'); if(!btn) return; window.addEventListener('scroll',()=>{if(window.scrollY>400) btn.classList.add('show'); else btn.classList.remove('show');}); btn.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});});
  };

  /* Page transitions: animate out on link click */
  MIROZA.initTransitions = function(){
    document.querySelectorAll('a').forEach(a=>{
      if(a.target && a.target==='_blank') return;
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href');
        if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        e.preventDefault(); document.documentElement.classList.add('is-transitioning');
        setTimeout(()=>{window.location.href = href;},220);
      });
    });
    window.addEventListener('pageshow', ()=>{document.documentElement.classList.remove('is-transitioning');});
  };

  /* Render homepage: categories and lists */
  MIROZA.renderHomepage = async function(){
    const posts = await MIROZA.loadPosts();
    // Trending: by recency and views demo
    const byViews = posts.slice().sort((a,b)=>b.views - a.views).slice(0,6);
    const mostRead = byViews.slice(0,5);
    const trending = posts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
    const trendingList = document.getElementById('trendingList'); if(trendingList){trending.forEach(t=>{const li=document.createElement('li');const a=document.createElement('a');a.href='/articles/'+t.slug+'.html';a.textContent=t.title;a.setAttribute('rel','noopener noreferrer');li.appendChild(a);trendingList.appendChild(li)})}
    const mostReadList = document.getElementById('mostReadList'); if(mostReadList){mostRead.forEach(m=>{const li=document.createElement('li');const a=document.createElement('a');a.href='/articles/'+m.slug+'.html';a.textContent=m.title;li.appendChild(a);mostReadList.appendChild(li)})}

    // Hero: latest by date
    const heroContent = document.getElementById('heroContent'); const heroSkeleton = document.getElementById('heroSkeleton');
    setTimeout(()=>{if(heroSkeleton) heroSkeleton.remove();},MIROZA.config.skeletonDelay);
    const latest = posts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    const hero = latest[0];
    if(hero && heroContent){
      document.getElementById('heroTitle').textContent = hero.title;
      document.getElementById('heroSummary').textContent = hero.excerpt;
      const link = document.getElementById('heroLink'); link.href = '/articles/'+hero.slug+'.html';
      const img = document.querySelector('.hero-feature img'); img.setAttribute('data-src', hero.image);
      heroContent.hidden = false;
      MIROZA.lazyLoadImages();
    }

    // Latest grid
    const latestGrid = document.getElementById('latestGrid'); if(latestGrid){
      const slice = latest.slice(0,8);
      MIROZA.renderCards(latestGrid, slice);
    }

    // Top stories (left list)
    const topStories = document.getElementById('topStories'); if(topStories){
      const top = posts.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
      top.forEach(p=>{const d=document.createElement('div');d.className='list-item';const a=document.createElement('a');a.href='/articles/'+p.slug+'.html';a.textContent=p.title;d.appendChild(a);topStories.appendChild(d)});
    }

    // Categories: latestPerCategory, shuffle
    const categoriesGrid = document.getElementById('categoriesGrid'); if(categoriesGrid){
      const cats = Array.from(new Set(posts.map(p=>p.category)));
      cats.forEach(cat=>{
        const block = document.createElement('div'); block.className='category-card';
        const h = document.createElement('h3'); h.textContent = cat; block.appendChild(h);
        const filtered = posts.filter(p=>p.category===cat).sort((a,b)=>new Date(b.date)-new Date(a.date));
        const selection = filtered.slice(0, MIROZA.config.latestPerCategory);
        const shuffled = MIROZA.shuffle(selection);
        const container = document.createElement('div'); container.className='mini-list';
        shuffled.forEach(p=>{
          const item = document.createElement('article'); item.className='mini'; const img=document.createElement('img'); img.src=p.image; img.alt=p.title; img.loading='lazy';
          const wrap = document.createElement('div'); const h4=document.createElement('h4'); const a=document.createElement('a'); a.href='/articles/'+p.slug+'.html'; a.textContent=p.title; h4.appendChild(a);
          const meta=document.createElement('p'); meta.className='muted'; meta.textContent=new Date(p.date).toLocaleDateString(); wrap.appendChild(h4); wrap.appendChild(meta);
          item.appendChild(img); item.appendChild(wrap); container.appendChild(item);
        });
        const viewAll = document.createElement('a'); viewAll.className='viewmore small'; viewAll.href='category.html?cat='+encodeURIComponent(cat); viewAll.textContent='View all';
        block.appendChild(container); block.appendChild(viewAll); categoriesGrid.appendChild(block);
      });
    }
  };

  /* Category page render */
  MIROZA.renderCategory = async function(){
    const params = new URLSearchParams(window.location.search); const cat = params.get('cat') || 'All';
    const posts = await MIROZA.loadPosts();
    const filtered = cat==='All'?posts:posts.filter(p=>p.category.toLowerCase()===cat.toLowerCase());
    filtered.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const container = document.getElementById('categoryList') || document.getElementById('latestGrid');
    if(container) MIROZA.renderCards(container, filtered);
    const title = document.querySelector('h1'); if(title) title.textContent = 'Category: ' + cat;
  };

  /* Register service worker (basic offline cache) */
  MIROZA.registerSW = function(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register(MIROZA.config.swPath).catch(e=>console.warn('SW registration failed',e));
    }
  };

  /* Init function */
  MIROZA.init = function(){
    MIROZA.initTheme();
    document.getElementById('themeToggle')?.addEventListener('click', MIROZA.toggleTheme);
    MIROZA.initNav(); MIROZA.initTicker(); MIROZA.initBackToTop(); MIROZA.initTransitions();
    // Detect page and run appropriate renderer
    const path = window.location.pathname;
    if(path.endsWith('/index.html') || path === '/' || path.endsWith('/')){ MIROZA.renderHomepage(); }
    if(path.endsWith('category.html')){ MIROZA.renderCategory(); }
    // comment forms
    const commentForm = document.getElementById('commentForm'); if(commentForm){
      const storageKey = 'miroza-comments'; const commentsList = document.getElementById('commentsList');
      function loadComments(){const raw=localStorage.getItem(storageKey)||'[]';const arr=JSON.parse(raw);commentsList.innerHTML='';arr.forEach(c=>{const div=document.createElement('div');div.className='comment';const s=document.createElement('strong');s.textContent=c.name;const meta=document.createElement('span');meta.className='muted';meta.textContent=' • '+c.date;div.appendChild(s);div.appendChild(meta);const p=document.createElement('p');p.textContent=c.text;div.appendChild(p);commentsList.appendChild(div);});}
      loadComments(); commentForm.addEventListener('submit',e=>{e.preventDefault();const name=commentForm.querySelector('[name=name]').value.trim()||'Reader';const text=commentForm.querySelector('[name=text]').value.trim(); if(!text) return; const raw=localStorage.getItem(storageKey)||'[]';const arr=JSON.parse(raw);arr.unshift({name,text,date:new Date().toLocaleString()});localStorage.setItem(storageKey, JSON.stringify(arr));commentForm.reset();loadComments();});
    }
    MIROZA.registerSW();
  };

  // Expose
  global.MIROZA = MIROZA;
  // Auto init on DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', MIROZA.init); else MIROZA.init();

})(window);

