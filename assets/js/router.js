/* router.js
   Small routing helpers and detail page loader.
   Extracted from main.js to keep responsibilities separated.
 */
(function(){
  function getQueryParams(){ const q = {}; const search = window.location.search.replace(/^\?/, ''); if(!search) return q; search.split('&').forEach(pair=>{ const [k,v] = pair.split('='); if(k) q[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return q; }

  async function loadDetail(){
    const params = getQueryParams(); const type = params.type || ''; const id = Number(params.id);
    const container = document.getElementById('detail-container'); if(!container) return console.warn('No detail container');
    const allowed = ['articles','blogs','news','stories','info'];
    if(!type || !Number.isFinite(id) || id <= 0 || !allowed.includes(type)){ container.innerHTML = '<p class="muted">Invalid or missing `type` or `id` in URL.</p>'; return; }
    try{
      const items = await window.fetchJSON(`assets/data/${type}.json`);
      if(!Array.isArray(items)) throw new Error('Invalid data file');
      const item = items.find(it => Number(it.id) === id);
      if(!item){ container.innerHTML = '<p class="muted">Item not found.</p>'; return; }

      container.innerHTML = '';
      const backLink = document.createElement('a'); backLink.href = (type === 'articles' ? '/articles.html' : '/' + type + '.html') || '/index.html'; backLink.textContent = `← Back to ${type ? (type.charAt(0).toUpperCase()+type.slice(1)) : 'Home'}`; backLink.className = 'muted'; backLink.style.display='inline-block'; backLink.style.marginBottom='12px';
      const title = document.createElement('h1'); title.textContent = item.title;
      const img = document.createElement('img'); img.className = 'thumb'; img.style.height = '360px'; img.loading='lazy'; img.decoding='async'; img.alt = item.title || ''; if(item.image) img.src = item.image;
      const meta = document.createElement('div'); meta.className='meta muted'; meta.textContent = `${item.date || ''}${item.category ? ' • ' + item.category : ''}`;
      const content = document.createElement('div'); content.className='content'; content.style.marginTop='16px'; content.innerHTML = `<p>${(item.content || '').replace(/\n/g,'</p><p>')}</p>`;

      const paramsSlug = getQueryParams().slug;
      if(item.slug && paramsSlug !== item.slug){ const canonical = window.utils.buildDetailUrl(type, id, item.slug); try{ window.history.replaceState({}, '', canonical); }catch(e){} }

      container.appendChild(backLink); container.appendChild(title); container.appendChild(img); container.appendChild(meta); container.appendChild(content);
    }catch(err){ console.error(err); container.innerHTML = '<p class="muted">Failed to load item.</p>'; }
  }

  window.getQueryParams = getQueryParams;
  window.loadDetail = loadDetail;
})();
