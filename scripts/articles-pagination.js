(function(){
  const PER_PAGE = 20;
  const listEl = document.getElementById('articles-list');
  const paginationEl = document.getElementById('articles-pagination');
  const loadingEl = document.getElementById('articles-loading');

  function qs(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString(); } catch(e) { return iso; }
  }

  function renderArticles(items, page) {
    listEl.innerHTML = '';
    const start = (page-1)*PER_PAGE;
    const end = start + PER_PAGE;
    const slice = items.slice(start, end);
    if (slice.length === 0) {
      listEl.innerHTML = '<p>No articles found.</p>';
      return;
    }
    slice.forEach(it => {
      const a = document.createElement('a');
      a.href = it.url || ('/articles/' + it.slug + '.html');
      a.className = 'post-card-link';

      const article = document.createElement('article');
      article.className = 'post-card';

      const h3 = document.createElement('h3');
      h3.textContent = it.title;

      const meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = formatDate(it.date || it.published || '');

      const p = document.createElement('p');
      p.textContent = it.excerpt || it.summary || '';

      article.appendChild(h3);
      article.appendChild(meta);
      article.appendChild(p);
      a.appendChild(article);
      listEl.appendChild(a);
    });
  }

  function renderPagination(totalItems, currentPage) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
    paginationEl.innerHTML = '';
    paginationEl.setAttribute('role','navigation');
    paginationEl.setAttribute('aria-label','Articles pagination');

    function createButton(label, page, disabled) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn';
      btn.textContent = label;
      btn.setAttribute('aria-label', typeof label === 'string' && label.match(/^[0-9]+$/) ? `Page ${label}` : label);
      if (disabled) btn.disabled = true;
      if (disabled && typeof label === 'string' && label.match(/^[0-9]+$/)) btn.setAttribute('aria-current','page');
      btn.addEventListener('click', () => goToPage(page));
      return btn;
    }

    const prev = createButton('Prev', Math.max(1, currentPage-1), currentPage===1);
    paginationEl.appendChild(prev);

    // show up to 7 page buttons centered on current
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons/2));
    let end = start + maxButtons - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxButtons + 1); }

    for (let i = start; i <= end; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'page-btn' + (i===currentPage ? ' active' : '');
      btn.textContent = String(i);
      if (i===currentPage) { btn.disabled = true; btn.setAttribute('aria-current','page'); }
      btn.setAttribute('aria-label', `Page ${i}`);
      btn.addEventListener('click', () => goToPage(i));
      paginationEl.appendChild(btn);
    }

    const next = createButton('Next', Math.min(totalPages, currentPage+1), currentPage===totalPages);
    paginationEl.appendChild(next);
  }

  // keyboard navigation for pagination (Left/Right)
  if (paginationEl) {
    paginationEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const cur = parseInt(qs('page')) || 1;
        if (cur > 1) goToPage(cur - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const cur = parseInt(qs('page')) || 1;
        const totalPages = Math.max(1, Math.ceil((window.__MIROZA_ARTICLES ? window.__MIROZA_ARTICLES.length : 0) / PER_PAGE));
        if (cur < totalPages) goToPage(cur + 1);
      }
    });
  }

  function goToPage(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    history.pushState({page}, '', url.toString());
    // scroll to top of list
    listEl.scrollIntoView({behavior:'smooth'});
    // render (items stored on window)
    if (window.__MIROZA_ARTICLES) {
      renderArticles(window.__MIROZA_ARTICLES, page);
      renderPagination(window.__MIROZA_ARTICLES.length, page);
    }
  }

  function init(items) {
    // ensure items sorted by date desc
    items.sort((a,b) => {
      const da = new Date(a.date || a.published || a.pubdate || 0).getTime();
      const db = new Date(b.date || b.published || b.pubdate || 0).getTime();
      return db - da;
    });

    window.__MIROZA_ARTICLES = items;
    loadingEl && loadingEl.remove();
    const page = parseInt(qs('page')) || 1;
    renderArticles(items, page);
    renderPagination(items.length, page);
  }

  document.addEventListener('DOMContentLoaded', function(){
    // fetch posts.json and select articles
    fetch('/data/posts.json', {cache: 'no-store'})
      .then(r => r.json())
      .then(data => {
        // data may have top-level 'articles' or 'posts' array; normalize
        let items = [];
        if (Array.isArray(data.articles)) items = data.articles;
        else if (Array.isArray(data.posts)) items = data.posts.filter(p => p.type === 'article');
        else if (Array.isArray(data)) items = data; // fallback
        init(items);
      })
      .catch(err => {
        console.error('Failed to load articles list', err);
        if (loadingEl) loadingEl.textContent = 'Failed to load articles.';
      });

    window.addEventListener('popstate', (ev) => {
      const page = ev.state && ev.state.page ? ev.state.page : (parseInt(qs('page')) || 1);
      if (window.__MIROZA_ARTICLES) {
        renderArticles(window.__MIROZA_ARTICLES, page);
        renderPagination(window.__MIROZA_ARTICLES.length, page);
      }
    });
  });
})();
