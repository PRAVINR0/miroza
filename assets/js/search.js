/* search.js
 - Builds a searchable index from DOM and JSON data files
 - Shows live suggestions under the header search input
 - Supports mobile slide-down search (mobile icon toggles)
 - Exposes a function to render full results (used by search.html)
*/

'use strict';

(function(){
  const dataFiles = ['articles','blogs','news','stories','info'];
  let index = []; // {title, description, type, id, url}

  // Utility: score simple text (case-insensitive contains)
  function matches(term, text){
    if(!term) return false;
    return text.toLowerCase().includes(term.toLowerCase());
  }

  async function buildIndex(){
    index = [];
    // 1) Index existing DOM cards (if present)
    document.querySelectorAll('.card').forEach(card => {
      const title = card.getAttribute('data-title') || card.querySelector('h3')?.textContent || '';
      const type = card.getAttribute('data-type') || '';
      const desc = card.getAttribute('data-description') || card.querySelector('p')?.textContent || '';
      const parentLink = card.closest('a');
      let url = parentLink ? parentLink.getAttribute('href') : '';
      // if no url, try detail link pattern
      if(!url && type){
        const id = card.getAttribute('data-id') || card.getAttribute('data-id') || '';
        url = `/detail.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;
      }
      if(title) index.push({title, description: desc, type, url});
    });

    // 2) Fetch JSON data to ensure full site index
    await Promise.all(dataFiles.map(async t=>{
      try{
        const items = await fetch(`assets/data/${t}.json`).then(r=>r.json());
        items.forEach(it=>{
          const url = `/detail.html?type=${encodeURIComponent(t)}&id=${encodeURIComponent(it.id)}`;
          // avoid duplicates by url
          if(!index.find(e=>e.url===url)){
            index.push({title: it.title||'', description: it.description||'', type: t, url});
          }
        });
      }catch(e){ /* ignore missing files */ }
    }));
  }

  function suggest(term){
    if(!term) return [];
    const results = index.map(item=>{
      let score = 0;
      if(matches(term,item.title)) score += 10;
      if(matches(term,item.description)) score += 5;
      if(matches(term,item.type)) score += 3;
      return {...item, score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    return results.slice(0,8);
  }

  function renderSuggestions(list, container){
    container.innerHTML = '';
    if(!list.length){ container.style.display='none'; return; }
    container.style.display='block';
    list.forEach(item=>{
      const el = document.createElement('a');
      el.className = 'suggestion';
      el.href = item.url;
      el.innerHTML = `<strong>${escapeHtml(item.title)}</strong><div class="smeta">${capitalize(item.type)} • ${escapeHtml(item.description)}</div>`;
      container.appendChild(el);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }

  // Wire up the search input
  async function initSearch(){
    await buildIndex();
    const input = document.getElementById('site-search-input');
    const suggestions = document.getElementById('search-suggestions');
    const mobileBtn = document.getElementById('mobile-search-btn');
    const siteSearch = document.getElementById('site-search');

    if(mobileBtn && siteSearch){
      mobileBtn.addEventListener('click', ()=>{
        // slide down (toggle class)
        siteSearch.classList.toggle('open-mobile');
        const el = document.getElementById('site-search-input');
        if(siteSearch.classList.contains('open-mobile')) setTimeout(()=>el.focus(),120);
      });
    }

    if(!input) return;
    let last = '';
    input.addEventListener('input', (e)=>{
      const q = e.target.value.trim();
      if(q === last) return; last = q;
      const results = suggest(q);
      renderSuggestions(results, suggestions);
    });

    // keyboard handling: Escape closes suggestions
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){ suggestions.innerHTML=''; suggestions.style.display='none'; input.blur(); }
      if(e.key === 'Enter'){
        // go to first suggestion if exists
        const first = suggestions.querySelector('a');
        if(first) { window.location = first.href; }
      }
    });

    // click outside closes suggestions
    document.addEventListener('click', (ev)=>{
      if(!siteSearch.contains(ev.target)) { suggestions.innerHTML=''; suggestions.style.display='none'; siteSearch.classList.remove('open-mobile'); }
    });
  }

  // Expose search rendering for search.html
  async function renderFullResults(q, container){
    if(!container) return;
    if(!index.length) await buildIndex();
    const results = suggest(q);
    container.innerHTML = '';
    if(!results.length){ container.innerHTML = '<p class="muted">No results found</p>'; return; }
    results.forEach(it=>{
      const card = document.createElement('article'); card.className='card';
      const a = document.createElement('a'); a.href = it.url; a.style.textDecoration='none'; a.style.color='inherit';
      const title = document.createElement('h3'); title.textContent = it.title;
      const meta = document.createElement('div'); meta.className='meta muted'; meta.textContent = capitalize(it.type);
      const p = document.createElement('p'); p.textContent = it.description;
      card.appendChild(title); card.appendChild(meta); card.appendChild(p);
      a.appendChild(card); container.appendChild(a);
    });
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{ initSearch().catch(()=>{}); });

  window.mirozaSearch = { buildIndex, suggest, renderFullResults };
})();
