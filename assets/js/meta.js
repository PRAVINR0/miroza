/* meta.js
   Client-side meta injector for detail pages.
   Reads `assets/data/meta.json` and injects OpenGraph/Twitter meta tags and JSON-LD into the document head.
   Call `initMeta()` on detail pages after loading the DOM.
*/
(function(window, document){
  async function fetchMetaMap(){
    try{ const r = await fetch('/assets/data/meta.json'); if(!r.ok) return null; return await r.json(); }catch(e){ return null }
  }

  function setMeta(name, content, prop=false){
    if(!content) return;
    let m = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if(!m){ m = document.createElement('meta'); if(prop) m.setAttribute('property', name); else m.setAttribute('name', name); document.head.appendChild(m); }
    m.setAttribute('content', content);
  }

  function setLinkRel(rel, href){
    if(!href) return;
    let l = document.querySelector(`link[rel="${rel}"]`);
    if(!l){ l = document.createElement('link'); l.rel = rel; document.head.appendChild(l); }
    l.href = href;
  }

  function injectJsonLd(obj){
    if(!obj) return;
    let s = document.getElementById('meta-jsonld');
    if(!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'meta-jsonld'; document.head.appendChild(s); }
    s.textContent = JSON.stringify(obj);
  }

  function parseQuery(){
    const params = new URLSearchParams(window.location.search);
    return { type: params.get('type'), id: params.get('id'), slug: params.get('slug') };
  }

  async function initMeta(){
    const q = parseQuery(); if(!q.type || !q.id) return;
    const map = await fetchMetaMap(); if(!map) return;
    const key = `${q.type}:${q.id}`;
    const m = map[key] || null;
    if(!m) return;
    setMeta('description', m.description);
    setMeta('keywords', '');
    setLinkRel('canonical', m.url);
    // OpenGraph
    setMeta('og:title', m.title, true);
    setMeta('og:description', m.description, true);
    if(m.image) setMeta('og:image', m.image, true);
    setMeta('og:type', (q.type === 'news') ? 'article' : 'article', true);
    // Twitter
    setMeta('twitter:card', m.image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', m.title);
    setMeta('twitter:description', m.description);
    if(m.image) setMeta('twitter:image', m.image);
    // JSON-LD
    injectJsonLd(m.jsonLd);
  }

  window.initMeta = initMeta;
})(window, document);
