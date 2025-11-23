'use strict';
const search = (()=>{
  async function buildIndex(){
    const index = [];
    await Promise.all(datastore.types.map(async type=>{
      const list = await datastore.fetchAll(type);
      list.forEach(it=>index.push(Object.assign({},it,{type})));
    }));
    return index;
  }

  async function performSearch(q, container){
    if(!q) return;
    const idx = await buildIndex();
    const term = q.trim().toLowerCase();
    const results = idx.filter(it=> (it.title+" "+it.description+" "+(it.content||"")+(it.tags||[]).join(' ')).toLowerCase().includes(term));
    renderResults(results,container);
  }

  function renderResults(results,container){
    container.innerHTML = '';
    if(results.length===0){container.innerHTML='<p>No results</p>';return}
    results.forEach(it=>{
      const el = document.createElement('article');
      el.className='card fade-in';
      el.innerHTML = `<a href="/detail.html?type=${it.type}&id=${it.id}">
        <div class="card-media"><img loading="lazy" src="${it.image}" alt="${it.title}"></div>
        <div class="card-body"><div class="badge">${it.type}</div><h3>${it.title}</h3><p>${it.description}</p></div>
      </a>`;
      container.appendChild(el);
    })
  }

  return {performSearch,buildIndex};
})();
