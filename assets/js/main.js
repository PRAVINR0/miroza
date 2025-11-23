/* main.js
 - Modernized main script for Miroza
 - Features:
   - Header/footer injection
  /* Menu and small UI interactions */
   - Robust JSON fetching with timeout/retries
   - Accessible card rendering with lazy-loaded images
   - Detail page rendering with input validation
*/

"use strict";

/* Header injection */
function injectHeader(){
  const header = document.getElementById('site-header');
  if(!header) return;
  header.innerHTML = `
    <header class="site-header">
      <div class="brand">
        <a class="logo" href="/index.html">Miroza</a>
      </div>
      <div id="site-search" class="site-search">
        <span class="search-icon" aria-hidden>🔍</span>
        <input id="site-search-input" type="search" placeholder="Search Miroza..." aria-label="Search Miroza" />
        <div id="search-suggestions" class="search-suggestions" role="listbox" aria-label="Search suggestions"></div>
      </div>
      <nav class="nav" aria-label="Main navigation">
        <a href="/index.html">Home</a>
        <a href="/news.html">News</a>
        <a href="/blog.html">Blogs</a>
        <a href="/articles.html">Articles</a>
        <a href="/stories.html">Stories</a>
  // Theme handled in assets/js/theme.js (initTheme)
  // Footer (single injection)
  // fetchJSON is provided by utilities.js
    moreBtn.addEventListener('click', ()=>{ const open = morePanel.classList.toggle('open'); moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    document.addEventListener('click', (e)=>{ if(!morePanel.contains(e.target) && e.target !== moreBtn){ morePanel.classList.remove('open'); moreBtn.setAttribute('aria-expanded','false'); } });
  /* Query helper moved to router.js */

  /* Detail loader moved to router.js */

/* Theme init */
function initTheme(){
  const saved = localStorage.getItem('miroza-theme');
  let applied = 'light';
  if(saved){
    applied = saved === 'dark' ? 'dark' : 'light';
    if(applied === 'dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme');
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    applied = 'dark';
    document.documentElement.setAttribute('data-theme','dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Ensure header toggle reflects current theme state
  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){ themeToggle.setAttribute('aria-pressed', applied === 'dark'); }

  // Apply any saved font scale from UI settings (if available)
  if(window.applyFontScale) try{ window.applyFontScale(); }catch(e){}
}

/* Safe PWA initializer
   - Registers the current `/service-worker.js` if available
   - Uses try/catch and graceful failure so pages can call `initPWA()` safely
   - Keeps registration minimal; the service worker in root is a safe non-caching stub
*/
function initPWA(){
  if(typeof window === 'undefined') return;
  if(!('serviceWorker' in navigator)) return;
  try{
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{/* ignore registration errors */});
  }catch(e){ /* ignore */ }
}

/* Robust fetch with timeout and retries */
async function fetchJSON(path, { timeout = 8000, retries = 1 } = {}){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeout);
  try{
    const res = await fetch(path, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    if(!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return await res.json();
  }catch(err){
    if(retries > 0) return fetchJSON(path, { timeout, retries: retries - 1 });
    throw err;
  }
}

/* Render cards into container. Uses <img> with lazy loading and alt text for accessibility. */
function renderCards(container, items, large = false, typeOverride){
  if(!container) return;
  container.innerHTML = '';
  items.forEach((it, idx) => {
    try{
      const id = it.id != null ? it.id : idx + 1;
      const el = (window.utils && window.utils.createCardElement) ? window.utils.createCardElement(it, { large, typeOverride, id }) : null;
      if(el) container.appendChild(el);
    }catch(e){ /* ignore individual render errors */ }
  });
}

/* Query helper */
function getQueryParams(){ const q = {}; const search = window.location.search.replace(/^\?/, ''); if(!search) return q; search.split('&').forEach(pair=>{ const [k,v] = pair.split('='); if(k) q[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return q; }

/* Detail loader with validation and accessible image */
async function loadDetail(){
  const params = getQueryParams(); const type = params.type || ''; const id = Number(params.id);
  const container = document.getElementById('detail-container'); if(!container) return console.warn('No detail container');
  const allowed = ['articles','blogs','news','stories','info'];
  if(!type || !Number.isFinite(id) || id <= 0 || !allowed.includes(type)){ container.innerHTML = '<p class="muted">Invalid or missing `type` or `id` in URL.</p>'; return; }
  try{
    const items = await fetchJSON(`assets/data/${type}.json`);
    if(!Array.isArray(items)) throw new Error('Invalid data file');
    const item = items.find(it => Number(it.id) === id);
    if(!item){ container.innerHTML = '<p class="muted">Item not found.</p>'; return; }

    container.innerHTML = '';
    const backLink = document.createElement('a'); backLink.href = (type === 'articles' ? '/articles.html' : '/' + type + '.html') || '/index.html'; backLink.textContent = `← Back to ${capitalize(type || 'Home')}`; backLink.className = 'muted'; backLink.style.display='inline-block'; backLink.style.marginBottom='12px';
    const title = document.createElement('h1'); title.textContent = item.title;
    const img = document.createElement('img'); img.className = 'thumb'; img.style.height = '360px'; img.loading='lazy'; img.decoding='async'; img.alt = item.title || ''; if(item.image) img.src = item.image;
    const meta = document.createElement('div'); meta.className='meta muted'; meta.textContent = `${item.date || ''}${item.category ? ' • ' + item.category : ''}`;
    const content = document.createElement('div'); content.className='content'; content.style.marginTop='16px'; content.innerHTML = `<p>${(item.content || '').replace(/\n/g,'</p><p>')}</p>`;

    // If the item has a canonical slug, ensure URL contains it. Do not redirect; normalize history instead.
    const paramsSlug = getQueryParams().slug;
    if(item.slug && paramsSlug !== item.slug){
      const canonical = buildDetailUrl(type, id, item.slug);
      try{ window.history.replaceState({}, '', canonical); }catch(e){ /* ignore history replace errors */ }
    }

    container.appendChild(backLink); container.appendChild(title); container.appendChild(img); container.appendChild(meta); container.appendChild(content);
  }catch(err){ console.error(err); container.innerHTML = '<p class="muted">Failed to load item.</p>'; }
}

/* Shuffle helper (Fisher-Yates) */
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } }
function capitalize(s){ return (window.utils && window.utils.capitalize) ? window.utils.capitalize(s) : (s ? s.charAt(0).toUpperCase()+s.slice(1) : s); }

// Expose helpers
window.injectHeader = injectHeader; window.initTheme = initTheme; window.initMenus = initMenus; window.initPWA = initPWA; window.fetchJSON = fetchJSON; window.renderCards = renderCards; window.shuffleArray = shuffleArray; window.loadDetail = loadDetail;
