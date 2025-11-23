/* main.js
 - Modernized main script for Miroza
 - Features:
   - Header/footer injection
   - Theme handling
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
        <a href="/info.html">Info</a>
      </nav>
      <div class="header-right">
        <div class="more-menu">
          <button class="icon-btn" id="more-btn" aria-expanded="false" aria-controls="more-panel">⋯</button>
          <div class="more-panel" id="more-panel" role="menu">
            <a href="/news.html">News</a>
            <a href="/blog.html">Blogs</a>
            <a href="/articles.html">Articles</a>
            <a href="/stories.html">Stories</a>
            <a href="/info.html">Info</a>
          </div>
        </div>
        <button class="icon-btn" id="theme-toggle" aria-pressed="false" aria-label="Toggle theme">🌓</button>
        <button class="icon-btn" id="pwa-install" title="Install Miroza" style="display:none">⬇️</button>
        <button class="icon-btn" id="mobile-search-btn" title="Search">🔎</button>
      </div>
    </header>`;

  // Footer (single injection)
  if(!document.getElementById('site-footer')){
    const footer = document.createElement('footer');
    footer.id = 'site-footer';
    footer.innerHTML = `<div class="container" style="padding:24px 16px;text-align:center;color:var(--muted)"><small>© Miroza <span id="year"></span>. All Rights Reserved.</small></div>`;
    document.body.appendChild(footer);
    const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

/* Menu, theme and small UI interactions */
function initMenus(){
  const moreBtn = document.getElementById('more-btn');
  const morePanel = document.getElementById('more-panel');
  if(moreBtn && morePanel){
    moreBtn.addEventListener('click', ()=>{ const open = morePanel.classList.toggle('open'); moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    document.addEventListener('click', (e)=>{ if(!morePanel.contains(e.target) && e.target !== moreBtn){ morePanel.classList.remove('open'); moreBtn.setAttribute('aria-expanded','false'); } });
  }

  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      if(next === 'dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('miroza-theme', next);
      themeToggle.setAttribute('aria-pressed', next === 'dark');
    });
  }

  const pwaBtn = document.getElementById('pwa-install');
  if(pwaBtn){ pwaBtn.addEventListener('click', async ()=>{ if(window.deferredPrompt){ await window.deferredPrompt.prompt(); window.deferredPrompt = null; pwaBtn.style.display = 'none'; } }); }
}

/* PWA registration */
function initPWA(){
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('/service-worker.js').catch(err=>console.warn('SW register failed',err)); }
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); window.deferredPrompt = e; const btn = document.getElementById('pwa-install'); if(btn) btn.style.display='inline-block'; });
  window.addEventListener('appinstalled', ()=>{ const btn = document.getElementById('pwa-install'); if(btn) btn.style.display='none'; });
}

/* Theme init */
function initTheme(){
  const saved = localStorage.getItem('miroza-theme');
  if(saved){ if(saved === 'dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme'); }
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme','dark');
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
    const cardLink = document.createElement('a');
    const itemType = typeOverride || it.type || '';
    const id = it.id != null ? it.id : idx + 1;
    cardLink.href = `/detail.html?type=${encodeURIComponent(itemType)}&id=${encodeURIComponent(id)}`;
    cardLink.style.textDecoration = 'none'; cardLink.style.color = 'inherit';

    const card = document.createElement('article'); card.className = 'card fade-in'; if(large) card.style.minHeight = '180px';
    const img = document.createElement('img'); img.className = 'thumb'; img.loading = 'lazy'; img.decoding = 'async'; img.alt = it.title || ''; if(it.image) img.src = it.image; else img.setAttribute('aria-hidden','true');
    const h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
    const p = document.createElement('p'); p.textContent = it.description || '';
    const meta = document.createElement('div'); meta.className = 'meta muted'; meta.textContent = `${it.date || ''}${itemType ? ' • ' + capitalize(itemType) : ''}`;

    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta);
    card.setAttribute('data-title', it.title || ''); card.setAttribute('data-type', itemType || ''); card.setAttribute('data-description', it.description || ''); card.setAttribute('data-id', id);
    cardLink.appendChild(card); container.appendChild(cardLink);
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

    container.appendChild(backLink); container.appendChild(title); container.appendChild(img); container.appendChild(meta); container.appendChild(content);
  }catch(err){ console.error(err); container.innerHTML = '<p class="muted">Failed to load item.</p>'; }
}

/* Shuffle helper (Fisher-Yates) */
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } }
function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s }

// Expose helpers
window.injectHeader = injectHeader; window.initTheme = initTheme; window.initMenus = initMenus; window.initPWA = initPWA; window.fetchJSON = fetchJSON; window.renderCards = renderCards; window.shuffleArray = shuffleArray; window.loadDetail = loadDetail;
