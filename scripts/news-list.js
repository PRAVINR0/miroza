// Populate a news listing by merging /data/news.json and /data/posts.json
(function(){
  function fmtDate(d){
    try{ return new Date(d).toLocaleDateString(); }catch(e){ return d; }
  }

  function makeCard(item){
    var a = document.createElement('a');
    a.className = 'card-link';
    a.href = item.link || ('/news/' + (item.slug || item.id) + '.html');

    var card = document.createElement('article');
    card.className = 'card';

    if(item.image){
      var img = document.createElement('img'); img.alt = item.title || '';
      img.src = item.image;
      card.appendChild(img);
    }

    var h3 = document.createElement('h3'); h3.textContent = item.title || 'Untitled';
    var meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = fmtDate(item.date || item.published || '') ;
    var p = document.createElement('p'); p.textContent = item.excerpt || item.summary || (item.description||'');

    card.appendChild(h3); card.appendChild(meta); card.appendChild(p);
    a.appendChild(card);
    return a;
  }

  async function load(targetId){
    var container = document.getElementById(targetId || 'india-news-list' ) || document.getElementById('news-list');
    if(!container) return;
    container.innerHTML = '';
    try{
      var [newsRes, postsRes] = await Promise.all([fetch('/data/news.json'), fetch('/data/posts.json')]);
      var news = newsRes.ok ? await newsRes.json() : [];
      var posts = postsRes.ok ? await postsRes.json() : [];

      // Normalize to array of items with slug/title/date/excerpt/image/link
      var items = [];
      if(Array.isArray(news)) news.forEach(function(n){ items.push({ title:n.title, date:n.date||n.published, excerpt:n.excerpt||n.summary, image:n.image||n.hero, slug:n.contentFile? n.contentFile.replace(/\.html$/,'') : (n.slug||n.id), link: n.contentFile?('/news/'+n.contentFile):n.link }); });
      if(Array.isArray(posts)) posts.forEach(function(p){ if(p.type==='news' || p.type==='post') items.push({ title:p.title, date:p.date, excerpt:p.excerpt||p.summary, image:p.image||p.hero, slug:p.slug, link:p.link || ('/news/'+(p.slug||'')+'.html') }); });

      // de-dupe by slug
      var seen = new Set();
      var combined = items.filter(function(it){ if(!it || !it.slug) return false; if(seen.has(it.slug)) return false; seen.add(it.slug); return true; });

      // sort by date desc
      combined.sort(function(a,b){ return (new Date(b.date||0)) - (new Date(a.date||0)); });

      combined.forEach(function(it){ container.appendChild(makeCard(it)); });
    }catch(e){ console.error('news load failed', e); container.innerHTML = '<p>Unable to load news.</p>'; }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ load(); }); else load();

  // expose for manual reload
  window.MIROZA = window.MIROZA||{}; window.MIROZA.loadNews = load;
})();
