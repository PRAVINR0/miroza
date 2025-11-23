'use strict';
document.addEventListener('DOMContentLoaded', async ()=>{
  // Year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // Register SW
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/service-worker.js').catch(()=>{});
  }

  // Global search handling
  const searchInput = document.getElementById('global-search');
  const searchClear = document.getElementById('search-clear');
  if(searchInput){
    const go = utils.debounce((e)=>{
      const q = e.target.value.trim();
      if(!q) return;
      window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
    },300);
    searchInput.addEventListener('input',go);
    searchInput.addEventListener('keydown', (e)=>{ if(e.key==='/' ){ e.preventDefault(); searchInput.focus(); }});
  }
  if(searchClear) searchClear.addEventListener('click', ()=>{ if(searchInput) searchInput.value=''; });

  // Render feed on homepage
  const feed = document.getElementById('feed');
  if(feed){
    const items = await datastore.combinedLatest(18);
    items.forEach(it=>{
      const el = document.createElement('article');
      el.className = 'card fade-in';
      el.innerHTML = `<a href="/detail.html?type=${it._type}&id=${it.id}">
        <div class="card-media"><img loading="lazy" src="${it.image}" alt="${it.title}"></div>
        <div class="card-body"><div class="badge">${it._type}</div><h3>${it.title}</h3><p>${it.description}</p></div>
      </a>`;
      feed.appendChild(el);
    });
  }
});
