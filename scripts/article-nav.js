// Client-side prev/next navigation injector for article pages
// Loads /data/posts.json, finds current article by URL/slug/contentPath,
// then appends a navigation block with previous and next links.
(function () {
  'use strict';

  async function fetchPosts() {
    try {
      const res = await fetch('/data/posts.json', {cache: 'no-store'});
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function parsePathParts(path) {
    // Normalize and return last pathname segment (slug or file)
    const p = path.split('/').filter(Boolean);
    return p[p.length - 1] || '';
  }

  function matchPostToLocation(post, locPath, filename) {
    if (!post) return false;
    // Match by explicit contentPath
    if (post.contentPath && post.contentPath.replace(/^\//, '') === locPath.replace(/^\//, '')) return true;
    // Match by slug -> {slug}.html or just slug
    if (post.slug) {
      if (post.slug === filename) return true;
      if ((post.slug + '.html') === filename) return true;
    }
    // Match by link field if present
    if (post.link) {
      const linkParts = post.link.split('/').filter(Boolean);
      const linkName = linkParts[linkParts.length - 1];
      if (linkName === filename) return true;
    }
    return false;
  }

  function createNavLink(post, label) {
    const a = document.createElement('a');
    a.className = 'article-nav-link';
    a.href = post.link || post.contentPath || (`/blogs/${post.slug}.html`);
    a.setAttribute('aria-label', `${label}: ${post.title}`);

    const title = document.createElement('span');
    title.className = 'article-nav-title';
    title.textContent = post.title || post.slug || 'Read more';

    const meta = document.createElement('span');
    meta.className = 'article-nav-meta';
    meta.textContent = new Date(post.date || '').toLocaleDateString();

    a.appendChild(title);
    a.appendChild(meta);
    return a;
  }

  function renderNav(prevPost, nextPost) {
    const container = document.createElement('nav');
    container.className = 'article-nav';
    container.setAttribute('aria-label', 'Article navigation');

    if (prevPost) {
      const left = document.createElement('div');
      left.className = 'article-nav-previous';
      left.appendChild(createNavLink(prevPost, 'Previous'));
      container.appendChild(left);
    } else {
      const left = document.createElement('div');
      left.className = 'article-nav-previous empty';
      container.appendChild(left);
    }

    if (nextPost) {
      const right = document.createElement('div');
      right.className = 'article-nav-next';
      right.appendChild(createNavLink(nextPost, 'Next'));
      container.appendChild(right);
    } else {
      const right = document.createElement('div');
      right.className = 'article-nav-next empty';
      container.appendChild(right);
    }

    // Try to place the nav after the main article area
    const selectors = ['main article', 'main .post', 'main .post-article', 'article.post-article', 'main'];
    let placed = false;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        el.insertAdjacentElement('afterend', container);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // fallback: append to body
      document.body.appendChild(container);
    }
  }

  async function init() {
    if (!location.pathname.includes('/blogs/')) return; // only run on blog pages
    const posts = await fetchPosts();
    if (!Array.isArray(posts) || posts.length === 0) return;

    // Normalize and sort by date ascending for easier prev/next logic
    const sorted = posts.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const locPath = location.pathname.replace(/^\//, '');
    const filename = parsePathParts(locPath).toLowerCase();

    // Find index matching current page
    let idx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (matchPostToLocation(sorted[i], locPath, filename)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return; // no match

    const prevPost = idx > 0 ? sorted[idx - 1] : null;
    const nextPost = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    renderNav(prevPost, nextPost);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
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
