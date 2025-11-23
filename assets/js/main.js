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
function renderCards(container, items, large=false){
  if(!container) return;
  container.innerHTML = '';
  items.forEach((it, idx)=>{
    const card = document.createElement('article');
    card.className = 'card fade-in';
    if(large) card.style.minHeight = '180px';
    const img = document.createElement('div');
    img.className = 'thumb';
    img.style.backgroundImage = `url('${it.image || ''}')`;
    const h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
    const p = document.createElement('p'); p.textContent = it.description || '';
    const meta = document.createElement('div'); meta.className='meta muted';
    meta.textContent = `${it.date || ''} ${it.type ? ' • '+capitalize(it.type) : ''}`;
    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta);
    container.appendChild(card);
  });
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
