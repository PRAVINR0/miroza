/* main.js
 - Injects the site header into every page
 - Handles theme toggling using localStorage
 - Fetches JSON data and renders responsive cards
 - Controls the 3-dot menu
 - Provides small utility helpers (shuffle, fetchJSON, renderCards)
*/

'use strict';

/* Insert the header into the page. Call this early on each page. */
function injectHeader(){
  const header = document.getElementById('site-header');
  if(!header) return;
  header.innerHTML = `
    <header class="site-header">
      <div class="brand">
        <a class="logo" href="index.html">Miroza</a>
      </div>
      <nav class="nav" aria-label="Main navigation">
        <a href="index.html">Home</a>
        <a href="news.html">News</a>
        <a href="blog.html">Blogs</a>
        <a href="articles.html">Articles</a>
        <a href="stories.html">Stories</a>
        <a href="info.html">Info</a>
      </nav>
      <div class="header-right">
        <div class="more-menu">
          <button class="icon-btn" id="more-btn" aria-expanded="false" aria-controls="more-panel">⋯</button>
          <div class="more-panel" id="more-panel" role="menu">
            <a href="news.html">News</a>
            <a href="blog.html">Blogs</a>
            <a href="articles.html">Articles</a>
            <a href="stories.html">Stories</a>
            <a href="info.html">Info</a>
          </div>
        </div>
        <button class="icon-btn" id="theme-toggle" aria-pressed="false">🌓</button>
      </div>
    </header>
  `;

  // Inject footer once per page
  if(!document.getElementById('site-footer')){
    const footer = document.createElement('footer');
    footer.id = 'site-footer';
    footer.innerHTML = `
      <div class="container" style="padding:24px 16px;text-align:center;color:var(--muted)">
        <small>© Miroza <span id="year"></span>. All Rights Reserved.</small>
      </div>
    `;
    document.body.appendChild(footer);
    // Set year
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();
  }
}

/* Initialize menu interactions */
function initMenus(){
  const moreBtn = document.getElementById('more-btn');
  const morePanel = document.getElementById('more-panel');
  if(moreBtn && morePanel){
    moreBtn.addEventListener('click', ()=>{
      const open = morePanel.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close when clicking outside
    document.addEventListener('click', (e)=>{
      if(!morePanel.contains(e.target) && e.target !== moreBtn){
        morePanel.classList.remove('open');
        moreBtn.setAttribute('aria-expanded','false');
      }
    });
  }
  // theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
      localStorage.setItem('miroza-theme', next);
      themeToggle.setAttribute('aria-pressed', next === 'dark');
    });
  }
}

/* Initialize theme from localStorage or prefers-color-scheme */
function initTheme(){
  const saved = localStorage.getItem('miroza-theme');
  if(saved){
    if(saved === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
  } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    document.documentElement.setAttribute('data-theme','dark');
  }
}

/* Fetch JSON helper */
async function fetchJSON(path){
  const res = await fetch(path, {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load '+path);
  return res.json();
}

/* Render an array of items into a container element.
   Each item should be {title,description,date,image,type?}
*/
function renderCards(container, items, large=false, typeOverride){
  if(!container) return;
  container.innerHTML = '';
  items.forEach((it, idx)=>{
    const cardLink = document.createElement('a');
    // Determine type for link param: prefer provided type, then item.type, then override
    const itemType = typeOverride || it.type || '';
    const id = it.id != null ? it.id : idx+1;
    cardLink.href = `detail.html?type=${encodeURIComponent(itemType)}&id=${encodeURIComponent(id)}`;
    cardLink.style.textDecoration = 'none';
    cardLink.style.color = 'inherit';

    const card = document.createElement('article');
    card.className = 'card fade-in';
    if(large) card.style.minHeight = '180px';
    const img = document.createElement('div');
    img.className = 'thumb';
    img.style.backgroundImage = `url('${it.image || ''}')`;
    const h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
    const p = document.createElement('p'); p.textContent = it.description || '';
    const meta = document.createElement('div'); meta.className='meta muted';
    meta.textContent = `${it.date || ''} ${itemType ? ' • '+capitalize(itemType) : ''}`;
    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta);
    cardLink.appendChild(card);
    container.appendChild(cardLink);
  });
}

/* Parse query string into an object */
function getQueryParams(){
  const q = {};
  const search = window.location.search.replace(/^\?/, '');
  if(!search) return q;
  search.split('&').forEach(pair=>{
    const [k,v] = pair.split('=');
    if(k) q[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return q;
}

/* Load and render a detail view into a container with id 'detail-container' */
async function loadDetail(){
  const params = getQueryParams();
  const type = params.type || '';
  const id = Number(params.id);
  const container = document.getElementById('detail-container');
  if(!container){ console.warn('No detail container'); return; }
  if(!type || !id){
    container.innerHTML = '<p class="muted">Missing type or id in URL.</p>';
    return;
  }
  try{
    const items = await fetchJSON(`assets/data/${type}.json`);
    const item = items.find(it=> Number(it.id) === id);
    if(!item){ container.innerHTML = '<p class="muted">Item not found.</p>'; return; }

    container.innerHTML = '';
    const backLink = document.createElement('a');
    backLink.href = (type === 'articles' ? 'articles.html' : type + '.html') || 'index.html';
    backLink.textContent = `← Back to ${capitalize(type || 'Home')}`;
    backLink.className = 'muted';
    backLink.style.display = 'inline-block';
    backLink.style.marginBottom = '12px';

    const title = document.createElement('h1'); title.textContent = item.title;
    const img = document.createElement('div'); img.className = 'thumb'; img.style.height='360px'; img.style.backgroundImage = `url('${item.image || ''}')`;
    const meta = document.createElement('div'); meta.className='meta muted'; meta.textContent = `${item.date || ''} ${item.category ? ' • '+item.category : ''}`;
    const content = document.createElement('div'); content.className='content'; content.style.marginTop='16px'; content.innerHTML = `<p>${(item.content || '').replace(/\n/g,'</p><p>')}</p>`;

    container.appendChild(backLink);
    container.appendChild(title);
    container.appendChild(img);
    container.appendChild(meta);
    container.appendChild(content);
  }catch(e){ console.error(e); container.innerHTML = '<p class="muted">Failed to load item.</p>'; }
}

/* Shuffle helper (Fisher-Yates) */
function shuffleArray(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
}

function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s }

// Export some helpers to global scope for inline usage in pages
window.injectHeader = injectHeader;
window.initTheme = initTheme;
window.initMenus = initMenus;
window.fetchJSON = fetchJSON;
window.renderCards = renderCards;
window.shuffleArray = shuffleArray;
