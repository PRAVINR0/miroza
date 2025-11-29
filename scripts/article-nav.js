(function(){
  // Inject previous/next links into article pages using /data/posts.json
  function slugFromPath(path){
    const m = path.match(/\/articles\/([^?#\/]+)\.html$/i);
    return m ? m[1] : null;
  }

  function createLink(item, rel){
    const a = document.createElement('a');
    a.href = item.url || (item.slug ? `/articles/${item.slug}.html` : '/articles/articles.html');
    a.className = 'article-nav-link ' + (rel === 'prev' ? 'prev' : 'next');
    a.innerHTML = `${rel === 'prev' ? '&larr; ' : ''}<strong>${item.title}</strong>${rel === 'next' ? ' &rarr;' : ''}`;
    a.setAttribute('aria-label', `${rel === 'prev' ? 'Previous article' : 'Next article'}: ${item.title}`);
    return a;
  }

  document.addEventListener('DOMContentLoaded', function(){
    const slug = slugFromPath(location.pathname);
    if(!slug) return; // not an article page

    fetch('/data/posts.json', {cache:'no-store'})
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        let items = [];
        if(Array.isArray(data.articles)) items = data.articles.slice();
        else if(Array.isArray(data.posts)) items = data.posts.filter(p => p.type === 'article').slice();
        else if(Array.isArray(data)) items = data.slice();

        if(!items.length) return;
        // normalize slug field if missing
        items = items.map(it => Object.assign({}, it, { slug: it.slug || (it.url ? (it.url.split('/').pop().replace(/\.html$/, '')) : '') }));
        const index = items.findIndex(it => it.slug === slug || (it.url && it.url.indexOf(slug) !== -1));
        if(index === -1) return;
        const prev = items[index-1];
        const next = items[index+1];

        const container = document.querySelector('.article-nav') || (function(){
          const el = document.createElement('nav'); el.className='article-nav'; return el;
        })();

        const wrapper = document.createElement('div');
        wrapper.className = 'prev-next-nav';
        if(prev){ wrapper.appendChild(createLink(prev,'prev')); }
        if(prev && next){ const sep = document.createElement('span'); sep.className='nav-sep'; sep.textContent=' | '; wrapper.appendChild(sep); }
        if(next){ wrapper.appendChild(createLink(next,'next')); }

        // inject rel links into head for SEO
        try{
          // remove existing rel prev/next to avoid duplicates
          ['prev','next'].forEach(r => {
            const ex = document.querySelector(`link[rel="${r}"]`);
            if(ex) ex.remove();
          });
          if(prev){
            const l = document.createElement('link'); l.rel='prev'; l.href = prev.url || (`/articles/${prev.slug}.html`);
            document.head.appendChild(l);
          }
          if(next){
            const l2 = document.createElement('link'); l2.rel='next'; l2.href = next.url || (`/articles/${next.slug}.html`);
            document.head.appendChild(l2);
          }
        }catch(e){}

        // append into container
        if(container.parentNode){ // container exists in DOM
          container.appendChild(wrapper);
        } else {
          // append after article content
          const article = document.querySelector('.single-article');
          if(article){ article.appendChild(wrapper); }
          else document.body.appendChild(wrapper);
        }
      }).catch(err => {
        // fail silently
        console.debug('article-nav: failed to load posts.json', err);
      });
  });
})();
