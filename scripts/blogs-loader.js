/* blogs-loader.js
   Dynamic loader for /blogs/blogs.html
   - Fetches /data/posts.json
   - Filters blog entries (category includes 'blog' OR contentPath startsWith '/blogs')
   - Sorts by date desc
   - Renders responsive cards into the page and removes legacy hard-coded cards
*/
(function(){
  const DATA_URL = '/data/posts.json';
  const PLACEHOLDER = '/assets/images/placeholder.svg';

  function addStylesheet(){
    if(document.querySelector('link[href="/styles/blogs.css"]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = '/styles/blogs.css';
    document.head.appendChild(l);
  }

  function formatDate(d){
    try{ const dt = new Date(d); return dt.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});}catch(e){return d}
  }

  function createCard(post){
    const a = document.createElement('a');
    a.className = 'card-link';
    // determine url: contentPath > link > constructed from slug
    let url = post.contentPath || post.link || (post.slug? `/blogs/${post.slug}.html` : (post.id? `/blogs/blog-${post.id}.html` : '#'));
    a.href = url;
    a.setAttribute('aria-label', post.title || 'Blog post');

    const article = document.createElement('article');
    article.className = 'post-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'card-image-wrap';
    const img = document.createElement('img');
    img.className = 'card-image';
    // use image object if present
    if(post.image && post.image.src){
      img.src = post.image.src;
      if(post.image.srcset) img.srcset = post.image.srcset;
      if(post.image.sizes) img.sizes = post.image.sizes;
      img.alt = (post.image.alt||post.title||'');
    }else if(post.imagePrompt){
      // no generated image yet
      img.src = PLACEHOLDER;
      img.alt = post.title||'placeholder';
    }else{
      img.src = PLACEHOLDER;
      img.alt = post.title||'placeholder';
    }
    img.loading = 'lazy';
    imgWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = post.title || (post.slug||'Untitled');
    body.appendChild(h3);

    const p = document.createElement('p');
    p.className = 'card-excerpt';
    p.textContent = post.excerpt || post.description || '';
    body.appendChild(p);

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const author = document.createElement('span'); author.className='card-author'; author.textContent = post.author || post.by || '';
    const date = document.createElement('span'); date.className='card-date'; date.textContent = post.date? formatDate(post.date) : '';
    meta.appendChild(author); meta.appendChild(date);
    body.appendChild(meta);

    if(post.keywords || post.category){
      const tags = document.createElement('div'); tags.className = 'card-tags';
      const items = [];
      if(post.category) items.push(post.category);
      if(Array.isArray(post.keywords)) items.push(...post.keywords.slice(0,4));
      items.slice(0,6).forEach(t=>{
        const s = document.createElement('span'); s.className='tag'; s.textContent = t; tags.appendChild(s);
      });
      body.appendChild(tags);
    }

    // read more
    const more = document.createElement('div'); more.className='card-cta';
    const btn = document.createElement('span'); btn.className='read-more'; btn.textContent = 'Read More →'; more.appendChild(btn);
    body.appendChild(more);

    a.appendChild(imgWrap);
    a.appendChild(body);
    article.appendChild(a);
    return article;
  }

  async function load(){
    addStylesheet();
    const grid = document.getElementById('posts-grid');
    const skeleton = document.getElementById('posts-skeleton');
    if(skeleton) skeleton.style.display = 'block';

    try{
      const res = await fetch(DATA_URL, {cache:'no-store'});
      if(!res.ok) throw new Error('Failed loading posts.json');
      const data = await res.json();
      // filter blog-like entries
      const blogs = (Array.isArray(data)? data : []).filter(p=>{
        const cat = (p.category||p.categoryName||'').toString().toLowerCase();
        if(cat.includes('blog')) return true;
        if((p.contentPath||'').toString().startsWith('/blogs')) return true;
        if((p.link||'').toString().includes('/blogs')) return true;
        return false;
      });

      // sort by date desc
      blogs.sort((a,b)=>{ const da = new Date(a.date||a.published||0); const db = new Date(b.date||b.published||0); return db - da; });

      // clear legacy cards
      if(grid){
        // remove existing post-card nodes
        Array.from(grid.querySelectorAll('.post-card')).forEach(n=>n.remove());
      }

      // render
      const fragment = document.createDocumentFragment();
      blogs.forEach(post=>{
        const card = createCard(post);
        fragment.appendChild(card);
      });

      if(grid) grid.appendChild(fragment);

    }catch(err){
      console.error('blogs-loader error', err);
    }finally{
      if(skeleton) skeleton.style.display = 'none';
      if(grid) grid.classList.add('loaded');
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
