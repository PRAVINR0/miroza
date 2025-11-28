/* MIROZA Main JS
   Provides theme toggle, mobile nav, data loading, shuffling, prefetch, accessibility, and PWA registration.
   All functions exist under the window.MIROZA namespace to avoid global collisions.
*/
(function(){
  'use strict';
  const THEME_STORAGE_KEY = 'miroza_theme';
  const SITE_BASE = 'https://miroza.online';

  function readStoredTheme(){
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch(e){
      return null;
    }
  }

  (function primeTheme(){
    const stored = readStoredTheme();
    if(stored && document.documentElement.dataset.theme !== stored){
      document.documentElement.dataset.theme = stored;
      return;
    }
    if(!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.dataset.theme = 'dark';
    }
  })();

  const TOPIC_LABELS = {
    world:'World',
    science:'Science',
    health:'Health',
    space:'Space',
    economy:'Economy',
    technology:'Technology',
    weather:'Weather',
    business:'Business',
    finance:'Finance',
    education:'Education',
    climate:'Climate',
    travel:'Travel',
    culture:'Culture',
    analysis:'Analysis',
    ideas:'Ideas',
    lifestyle:'Lifestyle',
    automobiles:'Automobiles',
    career:'Career',
    energy:'Energy',
    security:'Security'
  };
  const CATEGORY_ROUTE_MAP = {
    news:'/news.html',
    'india-news':'/news.html',
    india:'/news.html',
    blog:'/blog.html',
    article:'/articles.html',
    articles:'/articles.html',
    story:'/articles.html',
    posts:'/articles.html'
  };
  Object.entries(TOPIC_LABELS).forEach(([slug, label])=>{
    if(!CATEGORY_ROUTE_MAP[slug]){
      CATEGORY_ROUTE_MAP[slug] = `/articles.html?topic=${encodeURIComponent(label)}`;
    }
  });

  function normalizeRouteSlug(value){
    return (value || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  function resolveCategoryRoute(value){
    const slug = normalizeRouteSlug(value);
    return CATEGORY_ROUTE_MAP[slug] || null;
  }

  function patchLegacyCategoryLinks(){
    if(!window.MIROZA?.utils) return;
    const legacyNewsTargets = new Set(['/news/index.html', 'news/index.html']);
    window.MIROZA.utils.qsa('a[href]').forEach(link => {
      const rawHref = link.getAttribute('href') || '';
      if(legacyNewsTargets.has(rawHref)){
        link.setAttribute('href', '/news.html');
        link.dataset.prefetch = link.dataset.prefetch || '';
        return;
      }
    });
    window.MIROZA.utils.qsa('a[href^="/category/"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const slug = normalizeRouteSlug(href.replace('/category/','').replace(/\.html?$/,''));
      const next = resolveCategoryRoute(slug);
      if(next){
        link.setAttribute('href', next);
        link.dataset.prefetch = link.dataset.prefetch || '';
      }
    });
  }
  document.documentElement.classList.add('js-ready'); // Flag for CSS fallbacks so content stays visible when JS runs

  // Namespace root
  window.MIROZA = window.MIROZA || {};

  /* Utilities */
  window.MIROZA.utils = {
    qs: (sel, ctx=document) => ctx.querySelector(sel),
    qsa: (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel)),
    shuffle(arr) { for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()* (i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr;},
    safeHTML(str) {
      if (window.DOMPurify) return DOMPurify.sanitize(str, {USE_PROFILES:{html:true}});
      const div=document.createElement('div'); div.textContent=str; return div.innerHTML;
    },
    prefersReducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
    formatNumber(num){ try { return Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(num||0); } catch(e){ return num || 0; } },
    isInternalLink(href){ try { const url=new URL(href, window.location.origin); return url.origin === window.location.origin; } catch(e){ return false; } }
  };

  /* Shared shell helpers (nav/footer) */
  window.MIROZA.shell = (function(){
    const NAV_ITEMS = [
      { label:'Home', href:'/', match:['/'] },
      { label:'News', href:'/news.html', startsWith:['/news'] },
      { label:'Articles', href:'/articles.html', startsWith:['/articles'] },
      { label:'Blogs', href:'/blog.html', startsWith:['/blog', '/blogs'] },
      { label:'About', href:'/#about', hash:'#about', homeOnly:true },
      { label:'Contact', href:'/#contact', hash:'#contact', homeOnly:true }
    ];

    function init(){ enhanceNav(); }

    function enhanceNav(){
      const nav = window.MIROZA.utils.qs('.main-nav');
      if(!nav) return;
      let list = nav.querySelector('ul');
      if(!list){
        list = document.createElement('ul');
        nav.appendChild(list);
      }
      list.innerHTML='';
      NAV_ITEMS.forEach(item => {
        const li=document.createElement('li');
        const link=document.createElement('a');
        link.href=item.href;
        link.textContent=item.label;
        link.setAttribute('data-prefetch','');
        if(shouldMarkActive(item)){
          link.setAttribute('aria-current','page');
        }
        li.appendChild(link);
        list.appendChild(li);
      });
      nav.dataset.shellReady='true';
    }

    function shouldMarkActive(item){
      const path = normalizePath(window.location.pathname);
      if(item.startsWith && matchesStart(path, item.startsWith)) return true;
      if(item.match && matchesExact(path, item.match)) return true;
      if(item.hash){
        return !item.homeOnly ? window.location.hash === item.hash : (path === '/' && window.location.hash === item.hash);
      }
      if(item.href === '/' && path === '/' && !window.location.hash) return true;
      return false;
    }

    function matchesStart(path, candidates){
      const list = Array.isArray(candidates) ? candidates : [candidates];
      return list.some(candidate => path.startsWith(candidate));
    }

    function matchesExact(path, candidates){
      const list = Array.isArray(candidates) ? candidates : [candidates];
      return list.includes(path);
    }

    function normalizePath(pathname){
      if(!pathname) return '/';
      const normalized = pathname.replace(/\\/g,'/').replace(/\/index\.html$/i,'/');
      return normalized === '' ? '/' : normalized;
    }

    return { init, enhanceNav };
  })();

  /* Shared footer/components */
  window.MIROZA.components = (function(){
    const FOOTER_COLUMNS = [
      {
        title:'MIROZA',
        body:['Modern news & articles hub focused on trustworthy analysis and zero-noise delivery.', 'Updated daily with world, economy, and culture briefings.']
      },
      {
        title:'Coverage',
        links:[
          { label:'News', href:'/news.html' },
          { label:'Blog', href:'/blog.html' },
          { label:'Articles', href:'/articles.html' },
          { label:'Privacy Memo', href:'/privacy.html' }
        ]
      },
      {
        title:'Resources',
        links:[
          { label:'Security Checklist', href:'/security.html' },
          { label:'RSS Feed', href:'/rss.xml' },
          { label:'Sitemap', href:'/sitemap.xml' },
          { label:'Offline Brief', href:'/offline.html' }
        ]
      },
      {
        title:'Connect',
        links:[
          { label:'contact@miroza.online', href:'mailto:contact@miroza.online' },
          { label:'LinkedIn', href:'https://linkedin.com', external:true },
          { label:'Twitter', href:'https://twitter.com', external:true }
        ]
      }
    ];

    function init(){ enhanceFooter(); }

    function enhanceFooter(){
      const footer = window.MIROZA.utils.qs('.site-footer');
      if(!footer || footer.dataset.componentReady==='true') return;
      const grid = footer.querySelector('.footer-grid');
      if(!grid) return;
      grid.innerHTML='';
      FOOTER_COLUMNS.forEach(column => grid.appendChild(renderColumn(column)));
      footer.dataset.componentReady='true';
    }

    function renderColumn(column){
      const wrapper=document.createElement('div');
      const heading=document.createElement('h3');
      heading.textContent = column.title;
      wrapper.appendChild(heading);
      if(Array.isArray(column.body)){
        column.body.forEach(text => {
          const p=document.createElement('p');
          p.textContent = text;
          wrapper.appendChild(p);
        });
      }
      if(Array.isArray(column.links)){
        const list=document.createElement('ul');
        column.links.forEach(link => {
          const li=document.createElement('li');
          const anchor=document.createElement('a');
          anchor.href = link.href;
          anchor.textContent = link.label;
          anchor.setAttribute('data-prefetch','');
          if(link.external){
            anchor.target='_blank';
            anchor.rel='noopener noreferrer';
          }
          li.appendChild(anchor);
          list.appendChild(li);
        });
        wrapper.appendChild(list);
      }
      return wrapper;
    }

    return { init, enhanceFooter };
  })();

  const DEFAULT_IMAGE_SIZES = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px';
  const FALLBACK_IMAGE = {
    src: '/assets/images/hero-insight-800.svg',
    srcset: '/assets/images/hero-insight-400.svg 400w, /assets/images/hero-insight-800.svg 800w, /assets/images/hero-insight-1200.svg 1200w',
    sizes: DEFAULT_IMAGE_SIZES,
    alt: 'MIROZA featured story'
  };

  function buildCard(post, options={}){
    if(!post || typeof post !== 'object') return null;
    const card=document.createElement('article');
    card.className='card fade-in';
    card.setAttribute('data-id', post.id);
    card.dataset.label = post.category || 'Story';
    const isTrending = window.MIROZA.posts?.isTrending?.(post.id);
    if(isTrending) card.dataset.trending='true'; else card.removeAttribute('data-trending');
    if(typeof options.order === 'number'){
      card.style.setProperty('--card-order', options.order);
    }

    const imgData = post.image || FALLBACK_IMAGE;
    const picture=document.createElement('picture');
    if(Array.isArray(imgData.sources)){
      imgData.sources.forEach(sourceCfg => {
        const source=document.createElement('source');
        Object.entries(sourceCfg || {}).forEach(([attr, value])=>{ if(value) source.setAttribute(attr, value); });
        picture.appendChild(source);
      });
    }
    const img=document.createElement('img');
    img.loading='lazy';
    img.decoding='async';
    img.src = imgData.src || FALLBACK_IMAGE.src;
    if (imgData.srcset) img.setAttribute('srcset', imgData.srcset);
    img.setAttribute('sizes', imgData.sizes || DEFAULT_IMAGE_SIZES);
    img.alt = imgData.alt || post.title;
    img.width=400; img.height=225;
    picture.appendChild(img);
    card.appendChild(picture);

    const content=document.createElement('div');
    content.className='card-content';
    const h=document.createElement('h3');
    h.className='card-title';
    h.innerHTML=window.MIROZA.utils.safeHTML(post.title);
    const meta=document.createElement('p');
    meta.className='card-meta';
    const viewsLabel = window.MIROZA.utils.formatNumber(post.views || 0);
    const metaLabel = post.metaLabel || `${post.category || 'Story'} • ${viewsLabel} views`;
    meta.textContent=metaLabel;
    const ex=document.createElement('p');
    ex.className='card-excerpt';
    ex.innerHTML=window.MIROZA.utils.safeHTML(post.excerpt);
    const link=document.createElement('a');
    link.href = post.link || ('/articles/'+post.slug+'.html');
    link.textContent='Read More →';
    link.className='read-more';
    link.setAttribute('data-prefetch','');
    link.setAttribute('data-transition','');
    link.dataset.trackStory = post.id ?? post.slug ?? '';
    link.dataset.trackSlug = post.slug || '';
    link.dataset.trackTitle = post.title;
    link.dataset.trackCategory = post.category || 'Story';
    content.appendChild(h);
    content.appendChild(meta);
    content.appendChild(ex);
    content.appendChild(link);
    card.appendChild(content);
    return card;
  }

  window.MIROZA.buildCard = buildCard;

  /* Hero Rotator */
  window.MIROZA.hero = (function(){
    const ROTATE_INTERVAL = 12000;
    const TAGLINE_INTERVAL = 9000;
    const HERO_TAGLINES = [
      'Climate finance, corridors, and civic infrastructure.',
      'Ports, policy, and the people connecting them.',
      'Signals our partners brief boards with before dawn.',
      'Emerging market pilots, resilience, and governance.'
    ];
    let items = [];
    let index = 0;
    let timer = null;
    let taglineIndex = 0;
    let taglineTimer = null;
    let controlsBound = false;
    const els = { tag:null, title:null, excerpt:null, link:null, picture:null, image:null, advance:null, tagline:null };

    function cacheEls(){
      els.tag = window.MIROZA.utils.qs('#hero-tag');
      els.title = window.MIROZA.utils.qs('[data-hero-title]');
      els.excerpt = window.MIROZA.utils.qs('[data-hero-excerpt]');
      els.link = window.MIROZA.utils.qs('#hero-link');
      els.picture = window.MIROZA.utils.qs('#hero-picture');
      els.image = window.MIROZA.utils.qs('#hero-image');
      els.advance = window.MIROZA.utils.qs('.hero-advance');
      els.tagline = window.MIROZA.utils.qs('[data-hero-tagline]');
    }

    function bindControls(){
      if(controlsBound) return;
      controlsBound = true;
      els.advance?.addEventListener('click', ()=> advance(true));
    }

    function stopTimer(){ if(timer){ window.clearInterval(timer); timer=null; } }
    function startTimer(){
      if(items.length <= 1 || window.MIROZA.utils.prefersReducedMotion()) return;
      stopTimer();
      timer = window.setInterval(()=> advance(false), ROTATE_INTERVAL);
    }

    function startTaglines(){
      if(!els.tagline || HERO_TAGLINES.length < 2) {
        if(HERO_TAGLINES.length === 1) applyTagline(HERO_TAGLINES[0]);
        return;
      }
      stopTaglines();
      applyTagline(HERO_TAGLINES[taglineIndex]);
      if(window.MIROZA.utils.prefersReducedMotion()) return;
      taglineTimer = window.setInterval(()=> advanceTagline(), TAGLINE_INTERVAL);
    }

    function stopTaglines(){ if(taglineTimer){ window.clearInterval(taglineTimer); taglineTimer=null; } }

    function advanceTagline(){
      taglineIndex = (taglineIndex + 1) % HERO_TAGLINES.length;
      applyTagline(HERO_TAGLINES[taglineIndex]);
    }

    function getLink(post){ return post.link || (post.slug ? `/articles/${post.slug}.html` : '#'); }

    function apply(post){
      if(!post) return;
      const safeHTML = window.MIROZA.utils.safeHTML;
      els.tag && (els.tag.textContent = post.category || 'Featured Story');
      els.title && (els.title.innerHTML = safeHTML(post.title));
      els.excerpt && (els.excerpt.innerHTML = safeHTML(post.excerpt));
      if(els.link){
        els.link.href = getLink(post);
        els.link.setAttribute('data-prefetch','');
        els.link.dataset.trackStory = post.id ?? post.slug ?? 'hero';
        els.link.dataset.trackSlug = post.slug || '';
        els.link.dataset.trackTitle = post.title;
        els.link.dataset.trackCategory = post.category || 'Story';
      }
      const imageData = post.image || FALLBACK_IMAGE;
      if(els.image){
        els.image.src = imageData.src || FALLBACK_IMAGE.src;
        if(imageData.srcset){ els.image.srcset = imageData.srcset; }
        els.image.sizes = imageData.sizes || DEFAULT_IMAGE_SIZES;
        els.image.alt = imageData.alt || post.title;
      }
      if(els.picture){ els.picture.dataset.storyId = post.id; }
    }

    function applyTagline(text){
      if(!els.tagline || !text) return;
      els.tagline.textContent = text;
    }

    function advance(manual=false){
      if(!items.length) return;
      index = (index + 1) % items.length;
      apply(items[index]);
      if(manual) startTimer();
    }

    function mount(heroItems=[]){
      cacheEls();
      items = heroItems.filter(Boolean);
      index = 0;
      if(!items.length) return;
      apply(items[0]);
      bindControls();
      startTimer();
      startTaglines();
    }

    function setItems(heroItems=[]){
      items = heroItems.filter(Boolean);
      index = 0;
      if(!items.length){ stopTimer(); stopTaglines(); return; }
      apply(items[0]);
      startTimer();
      startTaglines();
    }

    return { mount, setItems, next:()=>advance(true) };
  })();

  /* Theme Module */
  window.MIROZA.theme = (function(){
    const storageKey = THEME_STORAGE_KEY;
    function current(){ return document.documentElement.dataset.theme || 'light'; }
    function setTheme(theme, { persist=true }={}){
      const next = theme === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      if(persist){
        try { localStorage.setItem(storageKey, next); } catch(e){}
      }
      updateToggleIcon();
    }
    function toggle(){ setTheme(current()==='light'? 'dark':'light'); }
    function updateToggleIcon(){
      const btn = window.MIROZA.utils.qs('.theme-toggle img');
      if(!btn) return;
      const isLight = current() === 'light';
      btn.src = isLight ? '/assets/icons/moon.svg' : '/assets/icons/sun.svg';
      btn.alt = isLight ? 'Enable dark mode' : 'Enable light mode';
    }
    function init(){
      const stored = readStoredTheme();
      if(stored && stored !== current()){
        document.documentElement.dataset.theme = stored;
      }
      updateToggleIcon();
    }
    return { init, toggle, set:setTheme };
  })();

  /* Mobile Navigation */
  window.MIROZA.nav = (function(){
    let open=false; let navEl, toggleBtn;
    function renderState(){ if(open){ navEl.classList.add('open'); toggleBtn.setAttribute('aria-expanded','true'); toggleBtn.innerHTML='<img src="/assets/icons/close.svg" alt="Close" width="24" height="24" />'; } else { navEl.classList.remove('open'); toggleBtn.setAttribute('aria-expanded','false'); toggleBtn.innerHTML='<img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />'; } }
    function toggle(){ open=!open; renderState(); if(open){ navEl.querySelector('a')?.focus(); } else { toggleBtn.focus(); } }
    function init(){ navEl=window.MIROZA.utils.qs('.main-nav'); toggleBtn=window.MIROZA.utils.qs('.menu-toggle'); if(!navEl||!toggleBtn) return; toggleBtn.addEventListener('click', toggle); }
    return { init, toggle };
  })();

  /* Posts Loading & Rendering */
  window.MIROZA.posts = (function(){
    const ARTICLE_SOURCE = '/data/articles.json';
    const LEGACY_POST_SOURCE = '/data/posts.json';
    const NEWS_SOURCE = '/data/news.json';
    let posts=[];
    let readyPromise=null;
    let heroCandidates=[];
    let trendingSet=new Set();
    let trendingList=[];
    const postsById = new Map();

    function normalizeCategory(value){
      return (value || '').toLowerCase();
    }

    function normalizeContentType(value, fallback='article'){
      const normalized = normalizeCategory(value);
      if(!normalized) return fallback;
      if(normalized === 'india-news') return 'news';
      return normalized;
    }

    function isNewsCategory(value){
      const slug = normalizeCategory(value);
      return slug === 'news' || slug === 'india';
    }

    function isBlogCategory(value){
      return normalizeCategory(value) === 'blog';
    }

    function isArticleCategory(value){
      const slug = normalizeCategory(value);
      if(!slug) return false;
      return slug !== 'news' && slug !== 'blog';
    }

    function buildLink(contentType, slug, category){
      if(!slug) return '#';
      const normalizedType = normalizeContentType(contentType);
      const normalizedCategory = normalizeCategory(category);
      if(normalizedType === 'blog' || normalizedCategory === 'blog') return `/blogs/${slug}.html`;
      if(normalizedType === 'news' || normalizedCategory === 'news' || normalizedCategory === 'india') return `/news/${slug}.html`;
      return `/articles/${slug}.html`;
    }

    function matchContentType(item, type){
      if(!item) return false;
      const target = normalizeCategory(type);
      if(!target) return false;
      const itemType = normalizeContentType(item.contentType || item.category);
      return itemType === target;
    }

    function normalizeImage(data, fallbackAlt){
      if(!data){
        return { ...FALLBACK_IMAGE, alt: fallbackAlt || FALLBACK_IMAGE.alt };
      }
      if(typeof data === 'string'){
        return { src:data, alt:fallbackAlt || 'Story art', sizes: DEFAULT_IMAGE_SIZES };
      }
      return {
        src: data.src || FALLBACK_IMAGE.src,
        srcset: data.srcset || FALLBACK_IMAGE.srcset,
        sizes: data.sizes || DEFAULT_IMAGE_SIZES,
        alt: data.alt || fallbackAlt || FALLBACK_IMAGE.alt,
        sources: Array.isArray(data.sources) ? data.sources : undefined
      };
    }

    function formatDisplayDate(value){
      if(!value) return '';
      const parsed = new Date(value);
      if(Number.isNaN(parsed.getTime())) return '';
      try {
        return new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric', year:'numeric' }).format(parsed);
      } catch(e){
        return parsed.toISOString().slice(0, 10);
      }
    }

    function enrichPost(entry, index, sourceType='article'){
      const slug = entry.slug || `story-${entry.id || index + 1}`;
      const category = entry.category || 'Story';
      const normalizedCategory = normalizeCategory(category);
      const contentType = normalizeContentType(entry.contentType || sourceType);
      const dateValue = Date.parse(entry.date || entry.updated || '') || Date.now() - index;
      const link = entry.link || entry.contentFile || buildLink(contentType, slug, category);
      const metaLabel = entry.metaLabel || [category, formatDisplayDate(entry.date)].filter(Boolean).join(' • ');
      const excerpt = entry.excerpt || entry.summary || '';
      const image = normalizeImage(entry.image, entry.title);
      const defaultViews = normalizedCategory === 'news' ? (1150 - index * 12) : (1600 - index * 20);
      const views = typeof entry.views === 'number' ? entry.views : defaultViews;
      return { ...entry, slug, category, link, dateValue, metaLabel, excerpt, image, views, contentType };
    }

    function normalizeNewsEntry(entry, index){
      if(!entry) return null;
      const slug = entry.slug || `news-${index+1}`;
      const regionLabel = entry.category || 'News';
      const hydrated = enrichPost({
        ...entry,
        id: entry.id || `news-${index+1}`,
        slug,
        category: regionLabel,
        contentFile: entry.contentFile
      }, index + 1000, 'news');
      const dateLabel = formatDisplayDate(hydrated.date);
      const metaPieces = [regionLabel, dateLabel].filter(Boolean);
      hydrated.metaLabel = metaPieces.join(' • ') || regionLabel;
      hydrated.views = hydrated.views || (1200 - index * 15);
      hydrated.region = regionLabel;
      return hydrated;
    }

    function fetchJSON(url){
      return fetch(url).then(response => {
        if(!response.ok) throw new Error(`${url} responded with ${response.status}`);
        return response.json();
      });
    }

    function fetchArticlesFeed(){
      return fetchJSON(ARTICLE_SOURCE)
        .catch(err => {
          console.warn('MIROZA: Falling back to legacy posts feed', err);
          return fetchJSON(LEGACY_POST_SOURCE);
        })
        .catch(err => {
          console.error('MIROZA: Unable to load article feed', err);
          return [];
        });
    }

    function fetchNewsFeed(){
      return fetchJSON(NEWS_SOURCE)
        .catch(err => {
          console.error('MIROZA: Unable to load news feed', err);
          return [];
        });
    }

    function ensureArray(payload){
      return Array.isArray(payload) ? payload : [];
    }

    function fetchPosts(){
      return Promise.all([fetchArticlesFeed(), fetchNewsFeed()])
        .then(([articlePayload, newsPayload]) => {
          const articleEntries = ensureArray(articlePayload)
            .map((entry, index) => enrichPost(entry, index, 'article'))
            .filter(item => !isBlogCategory(item.category))
            .sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
          const newsEntries = ensureArray(newsPayload)
            .map((entry, index) => normalizeNewsEntry(entry, index))
            .filter(Boolean)
            .sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
          primeNewsModule(newsPayload);
          posts = [...newsEntries, ...articleEntries];
          computeDerived();
          return posts;
        })
        .catch(err => {
          console.error('Posts load failed', err);
          posts = [];
          computeDerived();
          return posts;
        });
    }

    function primeNewsModule(payload){
      if(window.MIROZA?.indiaNews?.prime && Array.isArray(payload) && payload.length){
        try {
          window.MIROZA.indiaNews.prime(payload);
        } catch(error){
          console.warn('MIROZA: Unable to seed India desk from posts module', error);
        }
      }
    }

    function computeDerived(){
      postsById.clear();
      posts.forEach(post => {
        const key = (post.id ?? post.slug ?? post.link ?? Math.random()).toString();
        postsById.set(key, post);
      });
      const articlePool = posts.filter(item => matchContentType(item, 'article'));
      heroCandidates = articlePool.slice().sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
      const trendingPool = posts.slice().sort((a,b)=> (b.views || 0) - (a.views || 0));
      trendingList = trendingPool.slice(0,8);
      trendingSet = new Set(trendingList.map(item => item.id));
    }

    function filterByCategory(cat){
      const match = normalizeCategory(cat);
      if(match === 'news') return newsSectionItems();
      if(match === 'article') return articleSectionItems();
      return posts
        .filter(p=> normalizeCategory(p.category) === match)
        .sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
    }

    function filterByCategoryList(slugs){
      if(!Array.isArray(slugs) || !slugs.length) return posts.slice();
      const normalized = slugs.map(item => normalizeCategory(item));
      const wantsArticles = normalized.includes('article');
      const wantsNews = normalized.includes('news');
      return posts
        .filter(post => {
          const categorySlug = normalizeCategory(post.category);
          if(wantsArticles && matchContentType(post, 'article')) return true;
          if(wantsNews && matchContentType(post, 'news')) return true;
          return normalized.includes(categorySlug);
        })
        .sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
    }

    function parseCategoryList(raw){
      if(!raw) return [];
      return raw.split(',').map(item => normalizeCategory(item)).filter(Boolean);
    }

    function highlightTopicChips(activeSlug){
      const chips = window.MIROZA.utils?.qsa?.('.chip') || [];
      if(!chips.length) return;
      chips.forEach(chip => {
        let chipSlug = '';
        try {
          const chipUrl = new URL(chip.href, window.location.origin);
          const topicParam = chipUrl.searchParams.get('topic');
          chipSlug = normalizeCategory(topicParam || (chip.textContent || ''));
          if(topicParam){
            chip.setAttribute('aria-current', chipSlug && chipSlug === activeSlug ? 'page' : 'false');
          } else {
            chip.setAttribute('aria-current', activeSlug ? 'false' : 'page');
          }
        } catch(e){
          chip.setAttribute('aria-current', activeSlug ? 'false' : 'page');
        }
      });
    }

    function syncCategoryHeading(topicLabel){
      const heading = window.MIROZA.utils?.qs?.('[data-category-label]');
      if(!heading) return;
      if(!heading.dataset.defaultTitle){ heading.dataset.defaultTitle = heading.textContent?.trim() || ''; }
      if(topicLabel){
        heading.textContent = `${topicLabel} Briefings`;
      } else if(heading.dataset.defaultTitle){
        heading.textContent = heading.dataset.defaultTitle;
      }
    }

    function trending(){ return trendingList.slice(0,5); }
    function isTrending(id){ return trendingSet.has(id); }

    function renderTrending(){
      const list = window.MIROZA.utils.qs('#trending-list');
      if(!list) return;
      list.innerHTML='';
      trending().forEach(p=>{
        const li=document.createElement('li');
        const a=document.createElement('a');
        a.href = p.link || ('/articles/'+p.slug+'.html');
        a.textContent=p.title;
        a.setAttribute('data-prefetch','');
        a.setAttribute('data-transition','');
        const meta=document.createElement('span');
        meta.className='card-meta';
        meta.textContent = p.metaLabel || (window.MIROZA.utils.formatNumber(p.views||0)+' views');
        li.appendChild(a);
        li.appendChild(meta);
        list.appendChild(li);
      });
    }

    function newsSectionItems(){
      return posts.filter(item => matchContentType(item, 'news')).sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
    }

    function articleSectionItems(){
      return posts.filter(item => matchContentType(item, 'article')).sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
    }

    function mountHomeSections(){
      try {
        const baseLatest = [...posts];
        let blogExtras = [];
        let latestOrder = [];

        function rebuildLatest(newExtras){
          if(Array.isArray(newExtras)){ blogExtras = newExtras.map(item => ({ ...item })); }
          latestOrder = [...baseLatest, ...blogExtras].sort((a,b)=>{
            const dateA = a.dateValue || Date.parse(a.date || 0) || 0;
            const dateB = b.dateValue || Date.parse(b.date || 0) || 0;
            return dateB - dateA;
          });
        }

        rebuildLatest();
        let latestFilter='all';
        const latestPagination = window.MIROZA.pagination.mount({
          targetSelector:'#latest-cards',
          controlsSelector:'#latest-pagination',
          getData:()=>filterLatest(latestOrder, latestFilter),
          pageSize:8,
          emptyMessage:'Fresh stories are on the way.',
          mode:'load-more',
          autoLoad:true
        });
        window.MIROZA.filters?.initLatest({ onChange:(filter)=>{
          latestFilter = filter;
          latestPagination?.render();
        }});
        if(window.MIROZA.blogs?.ready){
          window.MIROZA.blogs.ready().then(()=>{
            const extras = window.MIROZA.blogs.all ? window.MIROZA.blogs.all() : window.MIROZA.blogs.latest(20);
            rebuildLatest(extras);
            latestPagination?.render({ reset:true });
          }).catch(()=>{});
        }
        window.MIROZA.pagination.mount({ targetSelector:'#news-cards', controlsSelector:'#news-pagination', getData:()=>newsSectionItems(), pageSize:6, emptyMessage:'News stories publishing soon.', mode:'load-more' });
        window.MIROZA.pagination.mount({ targetSelector:'#articles-cards', controlsSelector:'#articles-pagination', getData:()=>articleSectionItems(), pageSize:6, emptyMessage:'Long-form stories publishing soon.', mode:'load-more' });
        renderTrending();
        const heroFeed = heroCandidates.slice(0,5);
        window.MIROZA.hero?.mount(heroFeed);
        window.MIROZA.ui?.hydrateLazySections?.();
        console.info('[MIROZA] Home sections rendered', {
          totalPosts: posts.length,
          latestRendered: latestOrder.length,
          heroStories: heroFeed.length
        });
      } catch(error){
        console.error('MIROZA: Failed to render home layout', error);
        const latestCards = document.getElementById('latest-cards');
        if(latestCards){
          latestCards.innerHTML='';
          const fallback=document.createElement('p');
          fallback.className='card-excerpt';
          fallback.textContent='We hit a snag while loading stories. Please refresh to try again.';
          latestCards.appendChild(fallback);
        }
      }
    }

    function filterLatest(source, filter){
      if(filter==='all') return source;
      const match = normalizeCategory(filter);
      if(match === 'article') return source.filter(item => matchContentType(item, 'article'));
      if(match === 'news') return source.filter(item => matchContentType(item, 'news'));
      if(match === 'blog') return source.filter(item => matchContentType(item, 'blog'));
      return source.filter(item => normalizeCategory(item.category) === match);
    }

    function mountCategoryPage(){
      const category = document.body.dataset.category;
      if(!category) return;
      const normalized = (category || '').toLowerCase();
      if(normalized === 'blog'){
        window.MIROZA.blogs?.ready().then(()=> window.MIROZA.blogs.mountCategorySection()).catch(()=>{});
        renderTrending();
        return;
      }
      const attrList = parseCategoryList(document.body.dataset.categories || '');
      const params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(window.location.search || '') : null;
      const topicParam = params?.get('topic') || '';
      const topicSlug = normalizeCategory(topicParam);
      const baseItems = attrList.length ? filterByCategoryList(attrList) : filterByCategory(category);
      const activeItems = topicSlug ? baseItems.filter(item => normalizeCategory(item.category) === topicSlug) : baseItems;
      const emptyLabel = topicSlug && topicParam ? `${topicParam} coverage is publishing soon.` : `${category} stories publishing soon.`;
      syncCategoryHeading(topicParam);
      highlightTopicChips(topicSlug);
      window.MIROZA.pagination.mount({ targetSelector:'#category-list', controlsSelector:'#category-pagination', getData:()=>activeItems, pageSize:10, emptyMessage: emptyLabel, mode:'load-more', autoLoad:true });
      renderTrending();
    }

    function hydratePage(){
      const pageType = document.body.dataset.page;
      if(pageType === 'home') mountHomeSections();
      if(pageType === 'category') mountCategoryPage();
      if(!pageType) renderTrending();
    }

    function init(){
      if(!readyPromise){ readyPromise = fetchPosts().then(()=>{ hydratePage(); return posts; }); }
      else { readyPromise.then(()=>hydratePage()); }
      return readyPromise;
    }

    function ready(){ return readyPromise ?? (readyPromise = fetchPosts()); }

    function heroFeed(){ return heroCandidates.slice(0,5); }

    function findById(id){ if(!id) return null; return postsById.get(id.toString()) || posts.find(p=> (p.slug || '') === id); }

    return { init, ready, posts:()=>posts, filterByCategory, trending, isTrending, heroFeed, byId:findById };
  })();

  /* Categories Directory Feed */
  window.MIROZA.categories = (function(){
    const dataUrl = '/data/categories.json';
    let categories = [];
    let readyPromise = null;

    function init(){
      if(!needsCategories()) return;
      ready();
    }

    function needsCategories(){
      return !!window.MIROZA.utils?.qs?.('[data-category-directory]') || !!window.MIROZA.utils?.qs?.('[data-category-chips]');
    }

    function ready(){
      if(!readyPromise){ readyPromise = fetchCategories(); }
      return readyPromise;
    }

    function fetchCategories(){
      return fetch(dataUrl)
        .then(response => {
          if(!response.ok) throw new Error(`Categories feed responded with ${response.status}`);
          return response.json();
        })
        .then(payload => {
          categories = normalize(payload);
          renderDirectory();
          renderChips();
          notifyQuickFind();
          return categories;
        })
        .catch(error => {
          console.warn('MIROZA: Unable to load categories feed', error);
          categories = [];
          renderDirectory(true);
          return categories;
        });
    }

    function normalize(payload){
      const source = Array.isArray(payload) ? payload : [];
      return source.map(item => {
        const slug = normalizeRouteSlug(item.slug || item.label || '');
        const label = item.label || item.title || formatLabel(slug);
        const href = item.href || resolveCategoryRoute(slug) || buildTopicLink(label);
        const count = typeof item.count === 'number' ? item.count : (Array.isArray(item.items) ? item.items.length : 0);
        const updated = item.updated || item.latestDate || item.previews?.[0]?.date || item.items?.[0]?.date || null;
        const previews = Array.isArray(item.previews) ? item.previews.slice(0,4) : (Array.isArray(item.items) ? item.items.slice(0,4) : []);
        return {
          slug,
          label,
          href,
          count,
          updated,
          updatedLabel: formatUpdatedLabel(updated),
          description: item.description || buildDescription(label, count, updated),
          previews: previews.map(preview => ({
            title: preview.title,
            link: preview.link || (preview.slug ? `/articles/${preview.slug}.html` : href),
            date: preview.date,
            category: preview.category || label
          }))
        };
      }).filter(entry => entry.slug && entry.href).sort((a, b) => {
        const timeA = Date.parse(a.updated || 0) || 0;
        const timeB = Date.parse(b.updated || 0) || 0;
        return timeB - timeA;
      });
    }

    function formatLabel(slug){
      if(!slug) return 'Stories';
      return slug.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
    }

    function buildTopicLink(label){
      if(!label) return '/articles.html';
      return `/articles.html?topic=${encodeURIComponent(label)}`;
    }

    function formatUpdatedLabel(value){
      if(!value) return 'recently';
      const date = new Date(value);
      if(Number.isNaN(date.getTime())) return value;
      try {
        return new Intl.DateTimeFormat('en-US', { month:'short', day:'numeric' }).format(date);
      } catch(error){
        return date.toISOString().split('T')[0];
      }
    }

    function buildDescription(label, count, updated){
      const updatedLabel = formatUpdatedLabel(updated);
      const total = count > 0 ? `${count} stories` : 'Fresh coverage';
      return `${total} • Updated ${updatedLabel}`;
    }

    function renderDirectory(showFallback=false){
      const containers = window.MIROZA.utils?.qsa?.('[data-category-directory]') || [];
      if(!containers.length) return;
      containers.forEach(container => {
        const limit = parseInt(container.dataset.categoryLimit || '', 10) || categories.length || 6;
        const list = categories.slice(0, limit);
        container.innerHTML='';
        if(!list.length){
          if(showFallback){
            container.appendChild(buildEmptyMessage('Category data unavailable right now.'));
          } else {
            container.appendChild(buildSkeletonCard());
            container.appendChild(buildSkeletonCard());
          }
          return;
        }
        list.forEach((entry, index) => container.appendChild(buildCard(entry, index)));
      });
    }

    function renderChips(){
      const chipRows = window.MIROZA.utils?.qsa?.('[data-category-chips]') || [];
      if(!chipRows.length || !categories.length) return;
      chipRows.forEach(row => {
        const limit = parseInt(row.dataset.categoryLimit || '', 10) || categories.length || 8;
        row.innerHTML='';
        categories.slice(0, limit).forEach(category => {
          const chip=document.createElement('a');
          chip.className='chip';
          chip.href = category.href;
          chip.textContent = category.label;
          chip.setAttribute('data-prefetch','');
          row.appendChild(chip);
        });
      });
    }

    function notifyQuickFind(){
      if(!categories.length) return;
      const condensed = categories.map(item => ({ slug:item.slug, label:item.label, count:item.count, href:item.href }));
      window.MIROZA.quickFind?.setCategories?.(condensed);
    }

    function buildCard(entry, index){
      const article=document.createElement('article');
      article.className='category-card fade-in';
      article.style.setProperty('--card-order', index);
      const tag=document.createElement('p');
      tag.className='hero-tag';
      tag.textContent='Category';
      const heading=document.createElement('h3');
      heading.textContent = entry.label;
      const meta=document.createElement('p');
      meta.className='category-card__meta';
      meta.textContent = `${entry.count} stories • Updated ${entry.updatedLabel}`;
      const desc=document.createElement('p');
      desc.className='category-card__description';
      desc.textContent = entry.description;
      const list=document.createElement('ul');
      list.className='category-card__previews';
      if(entry.previews.length){
        entry.previews.forEach(item => {
          const li=document.createElement('li');
          const link=document.createElement('a');
          link.href = item.link || entry.href;
          link.textContent = item.title;
          link.setAttribute('data-prefetch','');
          li.appendChild(link);
          list.appendChild(li);
        });
      } else {
        const li=document.createElement('li');
        li.textContent='Coverage refreshes shortly.';
        list.appendChild(li);
      }
      const cta=document.createElement('a');
      cta.href = entry.href;
      cta.className='text-link';
      cta.textContent='Open coverage →';
      cta.setAttribute('data-prefetch','');
      article.appendChild(tag);
      article.appendChild(heading);
      article.appendChild(meta);
      article.appendChild(desc);
      article.appendChild(list);
      article.appendChild(cta);
      return article;
    }

    function buildSkeletonCard(){
      const skeleton=document.createElement('article');
      skeleton.className='category-card skeleton';
      skeleton.setAttribute('aria-hidden','true');
      return skeleton;
    }

    function buildEmptyMessage(message){
      const p=document.createElement('p');
      p.className='category-directory__empty';
      p.textContent=message;
      return p;
    }

    return { init, ready, list:()=>categories.slice() };
  })();

  /* Blog Feed Loader */
  window.MIROZA.blogs = (function(){
    const dataUrl = '/data/blogs.json';
    let raw = [];
    let cards = [];
    let readyPromise = null;

    function fetchBlogs(){
      return fetch(dataUrl)
        .then(response => response.json())
        .then(json => {
          raw = Array.isArray(json) ? json : [];
          cards = raw.map(mapToCard).sort((a,b)=> (b.dateValue || 0) - (a.dateValue || 0));
          return cards;
        })
        .catch(error => {
          console.error('MIROZA: Failed to load blogs', error);
          raw = [];
          cards = [];
          return [];
        });
    }

    function mapToCard(entry){
      const link = entry.url || entry.canonical || `/blogs/${entry.slug || ('blog-' + entry.id)}.html`;
      const dateValue = Date.parse(entry.date || entry.displayDate || '') || 0;
      const metaPieces = [entry.displayDate, entry.readTimeMinutes ? `${entry.readTimeMinutes} min read` : null].filter(Boolean);
      return {
        id: entry.slug || `blog-${entry.id}`,
        slug: entry.slug,
        title: entry.title,
        excerpt: entry.excerpt,
        category: 'Blog',
        link,
        metaLabel: metaPieces.join(' • ') || 'Blog insight',
        date: entry.date,
        dateValue,
        tags: entry.tags || [],
        views: entry.readTimeMinutes ? entry.readTimeMinutes * 100 : undefined, // pseudo metric for consistency
        contentType: 'blog'
      };
    }

    function latest(count=8){
      return cards.slice(0, count);
    }

    function all(){
      return cards.slice();
    }

    function renderHomeSection(){
      const target = window.MIROZA.utils.qs('#blog-cards');
      const pagination = window.MIROZA.utils.qs('#blog-pagination');
      if(!target) return;
      const items = latest(8);
      target.innerHTML='';
      if(!items.length){
        const empty=document.createElement('p');
        empty.className='card-excerpt';
        empty.textContent='Blogs are publishing soon.';
        target.appendChild(empty);
        if(pagination){ pagination.innerHTML=''; }
        return;
      }
      items.forEach((item, index) => {
        const card = window.MIROZA.buildCard(item, { order:index });
        if(card) target.appendChild(card);
      });
      if(pagination){
        pagination.innerHTML='';
        const info=document.createElement('p');
        info.className='card-meta';
        info.textContent=`Showing ${items.length} of ${cards.length} blog posts`;
        pagination.appendChild(info);
      }
    }

    function mountCategorySection(){
      const listSelector = '#category-list';
      const paginationSelector = '#category-pagination';
      const listEl = window.MIROZA.utils.qs(listSelector);
      const paginationEl = window.MIROZA.utils.qs(paginationSelector);
      if(!listEl || !paginationEl) return;
      if(!cards.length){
        listEl.innerHTML='';
        const empty=document.createElement('p');
        empty.className='card-excerpt';
        empty.textContent='Blog posts are publishing soon.';
        listEl.appendChild(empty);
        paginationEl.innerHTML='';
        return;
      }
      window.MIROZA.pagination.mount({
        targetSelector: listSelector,
        controlsSelector: paginationSelector,
        getData: () => cards,
        pageSize: 10,
        emptyMessage: 'Blog posts are publishing soon.',
        mode: 'load-more',
        autoLoad: true
      });
    }

    function hydrate(){
      const pageType = document.body.dataset.page;
      const category = (document.body.dataset.category || '').toLowerCase();
      if(pageType === 'home'){ renderHomeSection(); }
      if(pageType === 'category' && category === 'blog'){ mountCategorySection(); }
    }

    function init(){
      if(!readyPromise){ readyPromise = fetchBlogs(); }
      readyPromise.then(()=> hydrate());
      return readyPromise;
    }

    function ready(){ return readyPromise ?? (readyPromise = fetchBlogs()); }

    return { init, ready, latest, all, renderHomeSection, mountCategorySection };
  })();

  /* Pagination Helper */
  window.MIROZA.pagination = (function(){
    function mount({ targetSelector, controlsSelector, getData, pageSize=10, emptyMessage='More stories coming soon.', mode='paged', autoLoad=false }){
      const target = window.MIROZA.utils.qs(targetSelector);
      const controls = window.MIROZA.utils.qs(controlsSelector);
      if(!target || !controls || typeof getData !== 'function') return null;
      const state = { page:0 };
      const loadMoreMode = mode === 'load-more';
      let io;
      function render(options){
        const opts = typeof options === 'boolean' ? { reset: options } : (options || {});
        if(opts.reset){ state.page = 0; }
        const data = getData() || [];
        if(!data.length){
          target.innerHTML = '';
          const emptyState = document.createElement('p');
          emptyState.className = 'card-excerpt';
          emptyState.textContent = emptyMessage;
          target.appendChild(emptyState);
          controls.innerHTML = '';
          return;
        }
        const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
        state.page = Math.min(state.page, totalPages - 1);
        if(loadMoreMode){
          renderLoadMore(data, totalPages);
          return;
        }
        const start = state.page * pageSize;
        const slice = data.slice(start, start + pageSize);
        target.innerHTML='';
        slice.forEach((post, index) => {
          const card = window.MIROZA.buildCard(post, { order: start + index });
          if(card) target.appendChild(card);
        });
        controls.innerHTML='';
        const prev = document.createElement('button');
        prev.type='button'; prev.textContent='Previous'; prev.disabled = state.page === 0;
        prev.addEventListener('click', ()=>{ if(state.page>0){ state.page--; render(); } });
        const indicator = document.createElement('span');
        indicator.className='page-indicator';
        indicator.textContent = `Page ${state.page+1} of ${totalPages}`;
        const next = document.createElement('button');
        next.type='button'; next.textContent='Next'; next.disabled = state.page >= totalPages-1;
        next.addEventListener('click', ()=>{ if(state.page<totalPages-1){ state.page++; render(); } });
        controls.appendChild(prev);
        controls.appendChild(indicator);
        controls.appendChild(next);
      }

      render();
      function renderLoadMore(data, totalPages){
        const visibleCount = Math.min((state.page + 1) * pageSize, data.length);
        target.innerHTML='';
        data.slice(0, visibleCount).forEach((post, index) => {
          const card = window.MIROZA.buildCard(post, { order:index });
          if(card) target.appendChild(card);
        });
        controls.innerHTML='';
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='load-more-btn';
        const moreAvailable = state.page < totalPages - 1;
        btn.textContent = moreAvailable ? 'Load more stories' : 'All stories loaded';
        btn.disabled = !moreAvailable;
        btn.addEventListener('click', ()=>{
          if(state.page < totalPages-1){
            state.page++;
            render();
          }
        });
        controls.appendChild(btn);
        if(autoLoad && moreAvailable && 'IntersectionObserver' in window){
          io?.disconnect();
          io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if(entry.isIntersecting && !btn.disabled){ btn.click(); }
            });
          }, { rootMargin:'200px 0px' });
          io.observe(btn);
        }
      }
      return { render };
    }

    return { mount };
  })();

  /* India News Feed */
  window.MIROZA.indiaNews = (function(){
    const dataUrl = '/data/news.json';
    let items = [];
    let readyPromise = null;
    let hydratedPage = null;

    function setItems(payload){
      const normalized = normalize(payload);
      if(!normalized.length) return false;
      items = normalized;
      readyPromise = Promise.resolve(items);
      return true;
    }

    function fetchNews(){
      return fetch(dataUrl)
        .then(resp => resp.json())
        .then(json => {
          setItems(json);
          return items;
        })
        .catch(err => {
          console.error('MIROZA: Unable to load India news feed', err);
          items = [];
          return items;
        });
    }

    function normalize(payload){
      const source = Array.isArray(payload) ? payload : [];
      return source.map((entry, index) => {
        const slug = entry.slug || `india-news-${index+1}`;
        const dateStr = entry.date || '';
        const readableDate = formatDate(dateStr);
        const category = entry.category || 'India';
        const title = entry.title || 'India desk update';
        return {
          id: slug,
          slug,
          title,
          excerpt: entry.excerpt || '',
          category,
          date: dateStr,
          metaLabel: readableDate ? `${category} • ${readableDate}` : category,
          link: entry.contentFile || `/news/${slug}.html`,
          image: entry.image ? { src: entry.image, alt: title, sizes: DEFAULT_IMAGE_SIZES } : FALLBACK_IMAGE
        };
      }).sort((a, b) => {
        const timeA = new Date(a.date || 0).getTime();
        const timeB = new Date(b.date || 0).getTime();
        return timeB - timeA;
      });
    }

    function formatDate(value){
      if(!value) return '';
      const parsed = new Date(value);
      if(isNaN(parsed)) return value;
      try {
        return new Intl.DateTimeFormat('en-US', { month:'short', day:'2-digit', year:'numeric' }).format(parsed);
      } catch(e){
        return parsed.toISOString().slice(0, 10);
      }
    }

    function mountHome(){
      if(document.body?.dataset?.page !== 'home') return;
      if(!window.MIROZA.utils.qs('#india-news-cards')) return;
      window.MIROZA.pagination.mount({
        targetSelector:'#india-news-cards',
        controlsSelector:'#india-news-controls',
        getData:()=>items,
        pageSize:4,
        emptyMessage:'India desk coverage publishes shortly.',
        mode:'load-more',
        autoLoad:true
      });
    }

    function mountHub(){
      if(document.body?.dataset?.page !== 'india-news') return;
      if(!window.MIROZA.utils.qs('#india-news-list')) return;
      window.MIROZA.pagination.mount({
        targetSelector:'#india-news-list',
        controlsSelector:'#india-news-pagination',
        getData:()=>items,
        pageSize:6,
        emptyMessage:'India desk stories are being prepared.',
        mode:'load-more',
        autoLoad:true
      });
    }

    function hydrate(){
      const pageType = document.body?.dataset?.page;
      if(!pageType || hydratedPage === pageType) return;
      if(pageType === 'home'){
        mountHome();
        hydratedPage = pageType;
        return;
      }
      if(pageType === 'india-news'){
        mountHub();
        hydratedPage = pageType;
      }
    }

    function init(){
      const pageType = document.body?.dataset?.page;
      if(pageType !== 'home' && pageType !== 'india-news') return;
      ready().then(()=> hydrate());
    }

    function ready(){
      if(!readyPromise){ readyPromise = fetchNews(); }
      return readyPromise;
    }

    function prime(payload){
      if(setItems(payload)){
        const pageType = document.body?.dataset?.page;
        if(pageType === 'home' || pageType === 'india-news'){
          window.requestAnimationFrame(()=> hydrate());
        }
      }
    }

    return { init, ready, items:()=>items.slice(), prime };
  })();

  /* Link Prefetch */
  window.MIROZA.prefetch = (function(){
    const supportsPrefetch = 'relList' in document.createElement('link') && document.createElement('link').relList.supports && document.createElement('link').relList.supports('prefetch');
    function handler(e){ const a=e.target.closest('a[data-prefetch]'); if(!a) return; if(!supportsPrefetch) return; if(a.dataset.prefetched) return; const link=document.createElement('link'); link.rel='prefetch'; link.href=a.href; document.head.appendChild(link); a.dataset.prefetched='true'; }
    function init(){ document.addEventListener('mouseover', handler); document.addEventListener('touchstart', handler, {passive:true}); }
    return { init };
  })();

  /* UI Interactions */
  window.MIROZA.ui = (function(){
    let header, backToTopBtn, lazyObserver, ticking=false, lazyFallbackTimer;
    const FALLBACK_REVEAL_DELAY = 2500;

    function handleScroll(){
      const offset = window.scrollY || document.documentElement.scrollTop || 0;
      if(header){ header.classList.toggle('is-stuck', offset > 24); }
      if(backToTopBtn){ backToTopBtn.classList.toggle('visible', offset > 480); }
    }

    function bindBackToTop(){
      if(!backToTopBtn) return;
      backToTopBtn.addEventListener('click', ()=>{
        const behavior = window.MIROZA.utils.prefersReducedMotion()? 'auto':'smooth';
        window.scrollTo({ top:0, behavior });
      });
    }

    function hydrateLazySections(){
      const lazyEls = window.MIROZA.utils.qsa('[data-lazy]');
      if(!lazyEls.length) return;
      if(!('IntersectionObserver' in window)){
        lazyEls.forEach(el=> el.classList.add('lazy-ready'));
        return;
      }
      lazyObserver?.disconnect();
      lazyObserver = new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('lazy-ready');
            lazyObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin:'0px 0px -10% 0px' });
      lazyEls.forEach(el=> lazyObserver.observe(el));
      window.clearTimeout(lazyFallbackTimer);
      lazyFallbackTimer = window.setTimeout(forceRevealLazySections, FALLBACK_REVEAL_DELAY); // Safety net for browsers that fail IO callbacks
    }

    function forceRevealLazySections(){
      window.MIROZA.utils.qsa('[data-lazy]:not(.lazy-ready)').forEach(el=> el.classList.add('lazy-ready'));
    }

    function init(){
      header = window.MIROZA.utils.qs('.site-header');
      backToTopBtn = window.MIROZA.utils.qs('.back-to-top');
      bindBackToTop();
      window.addEventListener('scroll', ()=>{
        if(ticking) return;
        ticking = true;
        window.requestAnimationFrame(()=>{ handleScroll(); ticking=false; });
      }, { passive:true });
      handleScroll();
      hydrateLazySections();
      enhanceInlineMedia();
    }

    function enhanceInlineMedia(){
      const inlineImages = window.MIROZA.utils.qsa('.single-article img, main img[data-enhance-responsive]');
      if(!inlineImages.length) return;
      inlineImages.forEach(img => {
        if(!img) return;
        if(!img.getAttribute('loading')) img.loading = 'lazy';
        img.decoding = 'async';
        if(!img.hasAttribute('srcset')){
          const responsive = buildResponsiveSet(img.getAttribute('src'));
          if(responsive){
            img.setAttribute('srcset', responsive);
            if(!img.hasAttribute('sizes')){
              img.setAttribute('sizes', '(max-width: 900px) 100vw, 800px');
            }
          }
        }
      });
    }

    function buildResponsiveSet(src){
      if(!src) return null;
      if(!/images\.(unsplash|pexels)\.com/i.test(src)) return null;
      const widths = [480, 768, 1200];
      const entries = widths.map(width => `${swapWidthParam(src, width)} ${width}w`);
      return entries.join(', ');
    }

    function swapWidthParam(url, width){
      const widthParam = `w=${width}`;
      if(/w=\d+/i.test(url)){
        return url.replace(/w=\d+/gi, widthParam);
      }
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${widthParam}`;
    }

    return { init, hydrateLazySections };
  })();

  /* Forms & Newsletter Handling */
  window.MIROZA.forms = (function(){
    const NEWSLETTER_KEY = 'miroza_newsletter_optin';
    const SUBMIT_LATENCY = 900;

    function sanitizeInput(value){
      if(typeof value !== 'string') return '';
      if(window.DOMPurify){ return DOMPurify.sanitize(value, { ALLOWED_TAGS:[], ALLOWED_ATTR:[] }); }
      return value.replace(/[<>]/g,'');
    }

    function validateEmail(value){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

    function safeStorage(action, key, value){
      try {
        if(action==='get'){ return localStorage.getItem(key); }
        if(action==='set'){ localStorage.setItem(key, value); }
        if(action==='remove'){ localStorage.removeItem(key); }
      } catch(e){}
      return null;
    }

    function updateFeedback(el, message, state='info'){
      if(!el) return;
      el.textContent = message;
      el.dataset.state = state;
    }

    function lockForm(form){
      form.classList.add('is-success');
      window.MIROZA.utils.qsa('input, button', form).forEach(el => { el.disabled = true; });
    }

    function simulateRequest(payload){
      return new Promise((resolve)=>{
        window.setTimeout(()=> resolve({ ok:true, ...payload }), SUBMIT_LATENCY);
      });
    }

    function initNewsletter(){
      const form = window.MIROZA.utils.qs('#newsletter-form');
      if(!form) return;
      const emailInput = form.querySelector('input[type="email"]');
      const feedback = form.querySelector('.form-feedback');
      const submitBtn = form.querySelector('button[type="submit"]');
      if(!emailInput || !feedback || !submitBtn) return;

      if(safeStorage('get', NEWSLETTER_KEY) === 'subscribed'){
        updateFeedback(feedback, 'You are already subscribed.', 'success');
        lockForm(form);
      }

      form.addEventListener('submit', e=>{
        e.preventDefault();
        if(form.classList.contains('is-loading')) return;
        const email = sanitizeInput(emailInput.value.trim());
        if(!validateEmail(email)){
          updateFeedback(feedback, 'Enter a valid email address.', 'error');
          emailInput.focus();
          return;
        }
        form.classList.add('is-loading');
        submitBtn.disabled = true;
        updateFeedback(feedback, 'Subscribing you now…', 'pending');
        const finish = (keepDisabled)=>{
          form.classList.remove('is-loading');
          if(!keepDisabled){ submitBtn.disabled = false; }
        };
        simulateRequest({ email }).then(()=>{
          updateFeedback(feedback, 'You are officially on the list. Welcome aboard!', 'success');
          safeStorage('set', NEWSLETTER_KEY, 'subscribed');
          lockForm(form);
          finish(true);
        }).catch(()=>{
          updateFeedback(feedback, 'We could not reach the server. Please try again.', 'error');
          finish(false);
        });
      });
    }

    function init(){ initNewsletter(); }

    return { init };
  })();

  /* Community Interactions (share, like, comments) */
  window.MIROZA.community = (function(){
    const COMMENTS_KEY = 'miroza_comments_v1';
    const LIKE_KEY = 'miroza_likes_v1';
    const MAX_COMMENTS = 20;
    let commentsFallback = {};
    let likesCache = null;

    function sanitizePlain(value){
      if(typeof value !== 'string') return '';
      if(window.DOMPurify){ return DOMPurify.sanitize(value, { ALLOWED_TAGS:[], ALLOWED_ATTR:[] }); }
      return value.replace(/[<>]/g,'');
    }

    function getArticleKey(){
      const body = document.body;
      if(body.dataset.articleId) return body.dataset.articleId;
      if(body.dataset.slug) return body.dataset.slug;
      const path = window.location.pathname.replace(/\/+/g,'/').replace(/\/$/, '');
      return path || 'home';
    }

    function readComments(){
      try {
        const raw = localStorage.getItem(COMMENTS_KEY);
        if(!raw) return commentsFallback;
        commentsFallback = JSON.parse(raw) || {};
        return commentsFallback;
      } catch(e){
        return commentsFallback;
      }
    }

    function writeComments(data){
      commentsFallback = data;
      try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(data)); } catch(e){}
    }

    function readLikes(){
      if(likesCache) return likesCache;
      try {
        const raw = localStorage.getItem(LIKE_KEY);
        likesCache = raw ? JSON.parse(raw) : {};
      } catch(e){ likesCache = {}; }
      return likesCache;
    }

    function writeLikes(data){
      likesCache = data;
      try { localStorage.setItem(LIKE_KEY, JSON.stringify(data)); } catch(e){}
    }

    function updateFeedback(node, message, state='info'){
      if(!node) return;
      node.textContent = message;
      node.dataset.state = state;
    }

    function formatDate(ts){
      try {
        return new Intl.DateTimeFormat('en', { month:'short', day:'numeric', year:'numeric' }).format(new Date(ts));
      } catch(e){
        return new Date(ts).toLocaleDateString();
      }
    }

    function renderComments(list, items){
      if(!list) return;
      list.innerHTML='';
      if(!items.length){
        const empty=document.createElement('li');
        empty.className='card-meta';
        empty.textContent='No comments yet. Share your perspective below (stored locally only).';
        list.appendChild(empty);
        return;
      }
      items.forEach(entry=>{
        const li=document.createElement('li');
        li.className='comment-card';
        const meta=document.createElement('div');
        meta.className='comment-meta';
        meta.textContent = `${entry.name} • ${formatDate(entry.ts)}`;
        const body=document.createElement('p');
        body.textContent = entry.comment;
        li.appendChild(meta);
        li.appendChild(body);
        list.appendChild(li);
      });
    }

    function saveComment(entry){
      const key = getArticleKey();
      const store = { ...readComments() };
      const list = store[key] ? [...store[key]] : [];
      list.push(entry);
      store[key] = list.slice(-MAX_COMMENTS);
      writeComments(store);
      return store[key];
    }

    function toggleLike(button, feedback){
      const key = getArticleKey();
      const likes = { ...readLikes() };
      const nextState = !likes[key];
      if(nextState){ likes[key]=true; } else { delete likes[key]; }
      writeLikes(likes);
      if(button){
        button.dataset.liked = nextState ? 'true':'false';
        button.setAttribute('aria-pressed', nextState ? 'true':'false');
        button.textContent = nextState ? '♥ Liked' : '♡ Appreciate';
      }
      updateFeedback(feedback, nextState ? 'Thanks for the love!' : 'Like removed.', 'success');
    }

    function handleShare(action, feedback, button){
      const url = window.location.href;
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.content || 'Discover more from MIROZA.';
      const encodedUrl = encodeURIComponent(url);
      if(action === 'like'){ toggleLike(button, feedback); return; }
      if(action === 'copy'){
        if(navigator.clipboard?.writeText){
          navigator.clipboard.writeText(url).then(()=> updateFeedback(feedback, 'Link copied to clipboard.', 'success')).catch(()=> fallbackCopy(url, feedback));
        } else { fallbackCopy(url, feedback); }
        return;
      }
      if(action === 'twitter'){
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`, '_blank', 'noopener');
        updateFeedback(feedback, 'Opening X (Twitter)…', 'pending');
        return;
      }
      if(action === 'linkedin'){
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener');
        updateFeedback(feedback, 'Opening LinkedIn…', 'pending');
        return;
      }
      if(action === 'native' && navigator.share){
        navigator.share({ title, text: description, url })
          .then(()=> updateFeedback(feedback, 'Thanks for sharing!', 'success'))
          .catch(()=> updateFeedback(feedback, 'Share cancelled.', 'info'));
        return;
      }
      // fallback to copy link
      handleShare('copy', feedback);
    }

    function fallbackCopy(url, feedback){
      const copyPrompt = window.prompt('Copy this link and share it anywhere:', url);
      if(copyPrompt !== null){ updateFeedback(feedback, 'Copy the highlighted link to share.', 'info'); }
    }

    function buildShareActions(article){
      let block = article.querySelector('.share-actions');
      if(!block){
        block = document.createElement('div');
        block.className='share-actions';
        block.setAttribute('aria-label', 'Share actions');
        const buttons = [
          { type:'native', label:'Quick share' },
          { type:'twitter', label:'Post to X' },
          { type:'linkedin', label:'Share on LinkedIn' },
          { type:'copy', label:'Copy link' }
        ];
        const frag=document.createDocumentFragment();
        buttons.forEach(cfg=>{
          const btn=document.createElement('button');
          btn.type='button';
          btn.dataset.share=cfg.type;
          btn.textContent=cfg.label;
          frag.appendChild(btn);
        });
        const likeBtn=document.createElement('button');
        likeBtn.type='button';
        likeBtn.dataset.share='like';
        likeBtn.classList.add('like-btn');
        const liked = !!readLikes()[getArticleKey()];
        likeBtn.dataset.liked = liked ? 'true':'false';
        likeBtn.setAttribute('aria-pressed', liked ? 'true':'false');
        likeBtn.textContent = liked ? '♥ Liked' : '♡ Appreciate';
        frag.appendChild(likeBtn);
        block.appendChild(frag);
        const header = article.querySelector('header');
        if(header){ header.insertAdjacentElement('afterend', block); }
        else { article.prepend(block); }
      }
      let feedback = article.querySelector('.share-feedback');
      if(!feedback){
        feedback = document.createElement('p');
        feedback.className='form-feedback share-feedback';
        feedback.setAttribute('aria-live','polite');
        feedback.textContent='';
        block.insertAdjacentElement('afterend', feedback);
      }
      return { block, feedback };
    }

    function buildCommentsSection(article){
      let section = article.querySelector('.comments');
      if(!section){
        const slug = getArticleKey().split('/').pop() || 'story';
        const uid = `comments-${slug.replace(/[^a-z0-9]+/gi,'-')}`;
        section = document.createElement('section');
        section.className='comments';
        section.setAttribute('aria-labelledby', `${uid}-heading`);
        section.innerHTML = `
          <h2 id="${uid}-heading">Join the conversation</h2>
          <form class="comment-form" novalidate>
            <label for="${uid}-name">Name</label>
            <input type="text" id="${uid}-name" name="name" maxlength="60" placeholder="Your name" required />
            <label for="${uid}-body">Comment</label>
            <textarea id="${uid}-body" name="comment" maxlength="500" placeholder="Be constructive and kind." required></textarea>
            <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <p class="form-feedback" aria-live="polite"></p>
            <button type="submit">Post comment</button>
          </form>
          <ul class="comment-list" aria-live="polite"></ul>
        `;
        article.appendChild(section);
      }
      return section;
    }

    function bindShare(block, feedback){
      if(!block || block.dataset.shareBound) return;
      block.dataset.shareBound='true';
      block.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-share]');
        if(!btn) return;
        const action = btn.dataset.share;
        handleShare(action, feedback, btn);
      });
    }

    function bindComments(section){
      const form = section.querySelector('form');
      const list = section.querySelector('.comment-list');
      const feedback = form.querySelector('.form-feedback');
      const store = readComments();
      const existing = store[getArticleKey()] || [];
      renderComments(list, existing);
      updateFeedback(feedback, 'Comments stay on this device until realtime APIs are wired up.', 'info');
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const formData = new FormData(form);
        if(formData.get('company')){ form.reset(); return; }
        const name = sanitizePlain((formData.get('name') || 'Guest').trim()).slice(0,60) || 'Guest';
        const comment = sanitizePlain((formData.get('comment') || '').trim());
        if(comment.length < 5){
          updateFeedback(feedback, 'Please add a bit more detail (minimum 5 characters).', 'error');
          return;
        }
        const entry = { name, comment, ts: Date.now() };
        const latest = saveComment(entry);
        renderComments(list, latest);
        updateFeedback(feedback, 'Comment captured locally for preview. ✅', 'success');
        form.reset();
      });
    }

    function enhanceArticle(){
      if(document.body.dataset.page !== 'article') return;
      const article = window.MIROZA.utils.qs('.single-article');
      if(!article) return;
      const { block, feedback } = buildShareActions(article);
      bindShare(block, feedback);
      const commentsSection = buildCommentsSection(article);
      bindComments(commentsSection);
    }

    function init(){ enhanceArticle(); }

    function getLikedMap(){ return { ...readLikes() }; }

    return { init, getLikedMap };
  })();

  /* Breadcrumb injector */
  window.MIROZA.breadcrumbs = (function(){
    const DETAIL_PAGES = {
      article: { label:'Articles', href:'/articles.html' },
      'blog-article': { label:'Blogs', href:'/blog.html' },
      'news-article': { label:'News', href:'/news.html' }
    };

    function init(){
      const pageType = document.body?.dataset?.page;
      if(!pageType || !DETAIL_PAGES[pageType]) return;
      const article = window.MIROZA.utils.qs('.single-article') || window.MIROZA.utils.qs('main');
      if(!article || article.querySelector('.breadcrumbs')) return;
      const titleNode = article.querySelector('h1') || window.MIROZA.utils.qs('h1');
      const title = titleNode?.textContent?.trim();
      if(!title) return;
      const crumbs = buildCrumbs(pageType, title);
      const nav = render(crumbs);
      if(!nav) return;
      article.insertAdjacentElement('afterbegin', nav);
    }

    function buildCrumbs(pageType, title){
      const crumbs = [{ label:'Home', href:'/' }];
      const secondary = DETAIL_PAGES[pageType];
      if(secondary) crumbs.push(secondary);
      crumbs.push({ label:title, current:true });
      return crumbs;
    }

    function render(items){
      if(!Array.isArray(items) || items.length < 2) return null;
      const nav=document.createElement('nav');
      nav.className='breadcrumbs';
      nav.setAttribute('aria-label','Breadcrumb');
      const list=document.createElement('ol');
      items.forEach(item => {
        const li=document.createElement('li');
        if(item.current || !item.href){
          li.textContent=item.label;
          li.setAttribute('aria-current','page');
        } else {
          const link=document.createElement('a');
          link.href=item.href;
          link.textContent=item.label;
          link.setAttribute('data-prefetch','');
          li.appendChild(link);
        }
        list.appendChild(li);
      });
      nav.appendChild(list);
      return nav;
    }

    return { init };
  })();

  /* SEO + Metadata Enhancer */
  window.MIROZA.seo = (function(){
    const DEFAULT_IMAGE = `${SITE_BASE}/assets/images/hero-insight-1200.svg`;
    const DEFAULT_LOGO = `${SITE_BASE}/assets/icons/logo.svg`;
    const DEFAULT_KEYWORDS = 'news, blog, articles, analysis, intelligence, MIROZA';
    const DEFAULT_AUTHOR = 'MIROZA Editorial Desk';

    function init(){
      if(!document?.head) return;
      const canonicalUrl = ensureCanonical();
      ensureMetaTags(canonicalUrl);
      injectSchemas(canonicalUrl);
    }

    function ensureCanonical(){
      const origin = getSiteOrigin();
      const path = (window.location?.pathname || '/') || '/';
      const canonicalValue = new URL(path, origin).toString();
      let link = document.head.querySelector('link[rel="canonical"]');
      if(!link){
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalValue;
      return canonicalValue;
    }

    function ensureMetaTags(canonicalUrl){
      const title = (document.title || 'MIROZA').trim();
      const description = deriveDescription();
      const keywords = DEFAULT_KEYWORDS;
      const author = document.head.querySelector('meta[name="author"]')?.content?.trim() || DEFAULT_AUTHOR;
      const image = determineOgImage();
      upsertMeta('description', description);
      upsertMeta('keywords', keywords);
      upsertMeta('author', author);
      upsertMeta('last-modified', new Date(document.lastModified || Date.now()).toISOString());
      upsertMeta('og:title', title, 'property');
      upsertMeta('og:description', description, 'property');
      upsertMeta('og:url', canonicalUrl, 'property');
      upsertMeta('og:image', image, 'property');
      upsertMeta('twitter:title', title);
      upsertMeta('twitter:description', description);
      upsertMeta('twitter:image', image);
    }

    function injectSchemas(canonicalUrl){
      injectArticleSchema(canonicalUrl);
      injectBreadcrumbSchema();
      injectWebsiteSchema();
    }

    function injectArticleSchema(canonicalUrl){
      const pageType = document.body?.dataset?.page;
      if(!['article','news-article','blog-article'].includes(pageType)) return;
      if(document.head.querySelector('script[type="application/ld+json"][data-seo="article"]')) return;
      if(hasSchemaType(schemaType)) return;
      const headline = document.querySelector('.single-article h1')?.textContent?.trim() || document.title;
      if(!headline) return;
      const description = deriveDescription();
      const image = determineOgImage();
      const authorName = document.head.querySelector('meta[name="author"]')?.content?.trim() || DEFAULT_AUTHOR;
      const published = determinePublishedDate();
      const schemaType = pageType === 'blog-article' ? 'BlogPosting' : 'NewsArticle';
      const payload = {
        '@context':'https://schema.org',
        '@type': schemaType,
        'headline': headline,
        'description': description,
        'image': image,
        'datePublished': published,
        'dateModified': new Date(document.lastModified || Date.now()).toISOString(),
        'author': { '@type':'Organization', 'name': authorName },
        'publisher': { '@type':'Organization', 'name':'MIROZA', 'logo': { '@type':'ImageObject', 'url': DEFAULT_LOGO } },
        'mainEntityOfPage': canonicalUrl
      };
      appendJsonLd(payload, 'article');
    }

    function injectBreadcrumbSchema(){
      const crumbList = document.querySelector('.breadcrumbs ol');
      if(!crumbList) return;
      if(document.head.querySelector('script[type="application/ld+json"][data-seo="breadcrumbs"]')) return;
      if(hasSchemaType('BreadcrumbList')) return;
      const origin = getSiteOrigin();
      const canonical = document.head.querySelector('link[rel="canonical"]')?.href || origin;
      const items = Array.from(crumbList.querySelectorAll('li')).map((li, index) => {
        const anchor = li.querySelector('a');
        const href = anchor ? new URL(anchor.getAttribute('href'), origin).toString() : canonical;
        return { '@type':'ListItem', position:index+1, name: li.textContent.trim(), item: href };
      });
      if(!items.length) return;
      appendJsonLd({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:items }, 'breadcrumbs');
    }

    function injectWebsiteSchema(){
      if(document.body?.dataset?.page !== 'home') return;
      if(document.head.querySelector('script[type="application/ld+json"][data-seo="website"]')) return;
      if(hasSchemaType('WebSite')) return;
      const origin = getSiteOrigin();
      const payload = {
        '@context':'https://schema.org',
        '@type':'WebSite',
        'url': origin,
        'name':'MIROZA',
        'potentialAction': {
          '@type':'SearchAction',
          'target': `${origin}/?q={search_term_string}`,
          'query-input':'required name=search_term_string'
        }
      };
      appendJsonLd(payload, 'website');
    }

    function appendJsonLd(payload, marker){
      const script=document.createElement('script');
      script.type='application/ld+json';
      script.dataset.seo = marker;
      script.textContent = JSON.stringify(payload);
      document.head.appendChild(script);
    }

    function hasSchemaType(targetType){
      const nodes = Array.from(document.head.querySelectorAll('script[type="application/ld+json"]'));
      return nodes.some(node => {
        try {
          const data = JSON.parse(node.textContent);
          if(Array.isArray(data)) return data.some(entry => matchesType(entry, targetType));
          return matchesType(data, targetType);
        } catch(e){
          return false;
        }
      });
    }

    function matchesType(entry, targetType){
      if(!entry || !entry['@type']) return false;
      const type = entry['@type'];
      if(Array.isArray(type)) return type.includes(targetType);
      return type === targetType;
    }

    function upsertMeta(name, content, attr='name'){
      if(!content) return;
      let meta = document.head.querySelector(`meta[${attr}="${name}"]`);
      if(!meta){
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      const current = meta.getAttribute('content');
      if(!current || /example\.com|lorem ipsum/i.test(current)){
        meta.setAttribute('content', content);
      }
    }

    function deriveDescription(){
      const existing = document.head.querySelector('meta[name="description"]')?.getAttribute('content');
      if(existing && !/example\.com/i.test(existing)) return existing;
      const lead = document.querySelector('.single-article p, main p');
      if(lead){
        const text = lead.textContent.trim();
        if(text) return text.length > 160 ? `${text.slice(0, 157)}...` : text;
      }
      return 'MIROZA curates fast, accessible intelligence across news, blogs, and analytical articles.';
    }

    function determineOgImage(){
      const candidate = document.querySelector('.single-article img, .hero img');
      const raw = candidate?.currentSrc || candidate?.src;
      if(raw){
        try { return new URL(raw, getSiteOrigin()).toString(); } catch(e){ return raw; }
      }
      return DEFAULT_IMAGE;
    }

    function determinePublishedDate(){
      const timeEl = document.querySelector('time[datetime]');
      const metaDate = document.head.querySelector('meta[name="date"], meta[property="article:published_time"]');
      const value = timeEl?.getAttribute('datetime') || metaDate?.getAttribute('content');
      if(value){
        const parsed = new Date(value);
        if(!isNaN(parsed)) return parsed.toISOString();
      }
      return new Date(document.lastModified || Date.now()).toISOString();
    }

    function getSiteOrigin(){
      try {
        const { protocol, host } = window.location;
        if(host && !/localhost|127\.0\.0\.1/i.test(host)){
          return `${protocol}//${host}`;
        }
      } catch(e){}
      return SITE_BASE;
    }

    return { init };
  })();

  /* Search Suggestions */
  window.MIROZA.search = (function(){
    const MAX_RESULTS = 5;
    const DEBOUNCE_MS = 120;
    let input, panel, posts = [], blogPosts = [], results = [], activeIndex = -1, debounceTimer;

    function init(){
      input = window.MIROZA.utils.qs('#search');
      panel = window.MIROZA.utils.qs('#search-suggestions');
      if(!input || !panel) return;
      bindEvents();
      window.MIROZA.posts.ready().then(data => { posts = data || []; }).catch(()=>{});
      if(window.MIROZA.blogs?.ready){
        window.MIROZA.blogs.ready().then(data => { blogPosts = data ? (window.MIROZA.blogs.all ? window.MIROZA.blogs.all() : data) : []; }).catch(()=>{});
      }
    }

    function bindEvents(){
      input.addEventListener('input', handleInput, { passive:true });
      input.addEventListener('focus', ()=>{ if(input.value.trim().length>=2){ runSearch(input.value.trim()); } });
      input.addEventListener('keydown', handleKeydown);
      document.addEventListener('click', e=>{
        if(e.target === input || panel.contains(e.target)) return;
        hidePanel();
      });
      panel.addEventListener('mousedown', e=> e.preventDefault());
      panel.addEventListener('click', e=>{
        const btn = e.target.closest('.search-suggestion');
        if(!btn) return;
        const idx = Number(btn.dataset.index);
        selectResult(idx);
      });
    }

    function handleInput(){
      const value = input.value.trim();
      window.clearTimeout(debounceTimer);
      if(value.length < 2){ hidePanel(); return; }
      debounceTimer = window.setTimeout(()=> runSearch(value), DEBOUNCE_MS);
    }

    function runSearch(query){
      const norm = query.toLowerCase();
      const combined = [...posts, ...blogPosts];
      const matches = combined.filter(post => {
        const haystack = [post.title, post.excerpt, post.category].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(norm);
      }).slice(0, MAX_RESULTS).map(post => ({
        title: post.title,
        category: post.category || 'Story',
        link: post.link || (post.slug ? `/articles/${post.slug}.html` : '#')
      }));
      results = matches;
      activeIndex = matches.length ? 0 : -1;
      render();
    }

    function render(){
      if(!panel) return;
      panel.innerHTML='';
      if(!results.length){ hidePanel(); return; }
      results.forEach((item, index)=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='search-suggestion'+(index===activeIndex?' is-active':'');
        btn.dataset.index=String(index);
        btn.setAttribute('role','option');
        const title=document.createElement('strong');
        title.textContent=item.title;
        const meta=document.createElement('span');
        meta.textContent=item.category;
        btn.appendChild(title);
        btn.appendChild(meta);
        panel.appendChild(btn);
      });
      panel.hidden=false;
    }

    function handleKeydown(e){
      if(panel.hidden) return;
      if(e.key==='ArrowDown'){ e.preventDefault(); moveActive(1); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); moveActive(-1); }
      else if(e.key==='Enter'){ if(activeIndex>-1){ e.preventDefault(); selectResult(activeIndex); } }
      else if(e.key==='Escape'){ hidePanel(); }
    }

    function moveActive(step){
      if(!results.length) return;
      activeIndex = (activeIndex + step + results.length) % results.length;
      render();
    }

    function selectResult(index){
      const item = results[index];
      if(!item) return;
      window.location.href = item.link;
      hidePanel();
    }

    function hidePanel(){
      if(!panel) return;
      panel.hidden=true;
      activeIndex=-1;
      panel.innerHTML='';
    }

    return { init };
  })();

  /* Filter Controls */
  window.MIROZA.filters = (function(){
    let latestController=null;
    function initLatest({ onChange }={}){
      const container = window.MIROZA.utils.qs('#latest-filters');
      if(!container) return;
      const buttons = window.MIROZA.utils.qsa('button[data-filter]', container);
      if(!buttons.length) return;
      let active = 'all';

      function setActive(next){
        active = next;
        buttons.forEach(btn=> btn.setAttribute('aria-pressed', btn.dataset.filter === active ? 'true':'false'));
        onChange?.(active);
      }
      latestController = { setActive };

      container.addEventListener('click', e=>{
        const btn = e.target.closest('button[data-filter]');
        if(!btn || btn.dataset.filter === active) return;
        setActive(btn.dataset.filter);
      });
    }

    function setLatestFilter(filter){ if(filter) latestController?.setActive(filter); }

    return { initLatest, setLatestFilter };
  })();

  /* Quick Find Drawer */
  window.MIROZA.quickFind = (function(){
    const STORAGE_KEYS = {
      recent:'miroza_recent_reads_v1',
      saved:'miroza_saved_stories_v1'
    };
    const MAX_RECENTS = 8;
    const state = { recents:[], savedManual:[] };
    const els = { panel:null, toggle:null, recent:null, saved:null, categories:null, title:null };
    const filterButtons = new Set();
    let postsCache=[];
    let cachedSavedStories=[];
    let lastFocus=null;
    let externalCategories=[];

    function init(){
      cacheEls();
      if(!els.panel || !els.toggle) return;
      loadStorage();
      cacheFilterKeys();
      bindUI();
      hydratePosts();
      renderRecent();
      renderSaved();
      renderCategories();
    }

    function setCategories(list){
      externalCategories = Array.isArray(list) ? list : [];
      renderCategories();
    }

    function cacheEls(){
      els.panel = document.getElementById('quick-find');
      els.toggle = window.MIROZA.utils.qs('.quick-find-toggle');
      els.recent = document.getElementById('quick-find-recent');
      els.saved = document.getElementById('quick-find-saved');
      els.categories = document.getElementById('quick-find-categories');
      els.title = document.getElementById('quick-find-title');
    }

    function cacheFilterKeys(){
      window.MIROZA.utils.qsa('#latest-filters button[data-filter]').forEach(btn =>{
        if(btn?.dataset.filter){ filterButtons.add(btn.dataset.filter); }
      });
    }

    function bindUI(){
      els.toggle.addEventListener('click', toggle);
      window.MIROZA.utils.qsa('[data-close="quick-find"]', els.panel).forEach(btn => btn.addEventListener('click', close));
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('click', handleTrackedLinkClick, true);
      els.panel.addEventListener('click', handlePanelClick);
      els.categories?.addEventListener('click', handleCategoryClick);
    }

    function hydratePosts(){
      const postPromise = window.MIROZA.posts?.ready?.() || Promise.resolve([]);
      const blogPromise = window.MIROZA.blogs?.ready?.().then(()=> window.MIROZA.blogs.all ? window.MIROZA.blogs.all() : []) || Promise.resolve([]);
      Promise.all([postPromise, blogPromise]).then(([postItems, blogItems])=>{
        postsCache = [...(postItems || []), ...(blogItems || [])];
        renderCategories();
        renderSaved();
      }).catch(()=>{});
    }

    function loadStorage(){
      state.recents = readStorage(STORAGE_KEYS.recent);
      state.savedManual = readStorage(STORAGE_KEYS.saved);
    }

    function readStorage(key){
      try {
        const raw = window.localStorage?.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch(e){ return []; }
    }

    function writeStorage(key, value){
      try { window.localStorage?.setItem(key, JSON.stringify(value)); } catch(e){}
    }

    function handleKeydown(e){
      if(e.key === 'Escape' && isOpen()){ e.preventDefault(); close(); return; }
      if((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)){
        const target = e.target;
        if(isTypingContext(target)) return;
        e.preventDefault();
        open();
      }
    }

    function handleTrackedLinkClick(e){
      const link = e.target.closest('a[data-track-story]');
      if(!link) return;
      const story = extractStory(link);
      if(!story) return;
      recordRecent(story);
    }

    function handlePanelClick(e){
      const actionBtn = e.target.closest('[data-quick-find-action]');
      if(actionBtn){
        const { quickFindAction:action, storyId, storyHref } = actionBtn.dataset;
        if(action === 'save'){ toggleManualSave(storyId, storyHref); }
        if(action === 'remove'){ removeManualSave(storyId, storyHref); }
        return;
      }
      const link = e.target.closest('.quick-find__details a');
      if(link){ close(); }
    }

    function handleCategoryClick(e){
      const btn = e.target.closest('button[data-category]');
      if(!btn) return;
      const action = btn.dataset.action;
      if(action === 'filter'){
        const key = btn.dataset.filterKey || btn.dataset.category;
        if(key){ window.MIROZA.filters?.setLatestFilter?.(key); }
        close();
        scrollToLatest(() => focusFilterButton(key));
        return;
      }
      if(action === 'navigate' && btn.dataset.href){
        close();
        window.location.href = btn.dataset.href;
      }
    }

    function focusFilterButton(key){
      if(!key) return;
      window.setTimeout(()=>{
        const btn = window.MIROZA.utils.qs(`#latest-filters button[data-filter="${key}"]`);
        btn?.focus();
      }, 220);
    }

    function isTypingContext(node){
      if(!node) return false;
      const tag = node.tagName;
      return node.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function open(){
      if(isOpen()) return;
      lastFocus = document.activeElement;
      els.panel.hidden = false;
      document.body.classList.add('quick-find-open');
      els.toggle.setAttribute('aria-expanded','true');
      window.requestAnimationFrame(()=> els.title?.focus());
      renderRecent();
      renderSaved();
    }

    function close(){
      if(!isOpen()) return;
      els.panel.hidden = true;
      document.body.classList.remove('quick-find-open');
      els.toggle.setAttribute('aria-expanded','false');
      lastFocus?.focus?.();
      lastFocus = null;
    }

    function toggle(){ isOpen()? close(): open(); }

    function isOpen(){ return !!els.panel && !els.panel.hidden; }

    function extractStory(link){
      const dataset = link.dataset || {};
      const href = link.href;
      if(!href) return null;
      const resolved = resolvePost(dataset.trackStory || dataset.trackSlug);
      const title = dataset.trackTitle || resolved?.title || link.textContent?.trim();
      if(!title) return null;
      return {
        id: dataset.trackStory || resolved?.id || dataset.trackSlug || href,
        slug: dataset.trackSlug || resolved?.slug || '',
        title,
        category: dataset.trackCategory || resolved?.category || 'Story',
        href,
        ts: Date.now()
      };
    }

    function resolvePost(id){
      if(!id) return null;
      return window.MIROZA.posts?.byId?.(id) || null;
    }

    function recordRecent(entry){
      if(!entry) return;
      const existing = state.recents.filter(item => !matchesStory(item, entry.id, entry.href));
      state.recents = [entry, ...existing].slice(0, MAX_RECENTS);
      persistRecents();
      if(isOpen()) renderRecent();
    }

    function persistRecents(){ writeStorage(STORAGE_KEYS.recent, state.recents); }

    function persistSaved(){ writeStorage(STORAGE_KEYS.saved, state.savedManual.slice(0, MAX_RECENTS)); }

    function toggleManualSave(id, href){
      const idx = state.savedManual.findIndex(item => matchesStory(item, id, href));
      if(idx > -1){
        state.savedManual.splice(idx,1);
      } else {
        const source = findStory(id, href);
        if(source){ state.savedManual.unshift({ ...source, ts: Date.now() }); }
      }
      state.savedManual = state.savedManual.slice(0, MAX_RECENTS);
      persistSaved();
      renderSaved();
      renderRecent();
    }

    function removeManualSave(id, href){
      const next = state.savedManual.filter(item => !matchesStory(item, id, href));
      if(next.length === state.savedManual.length) return;
      state.savedManual = next;
      persistSaved();
      renderSaved();
      renderRecent();
    }

    function findStory(id, href){
      return state.recents.find(item => matchesStory(item, id, href))
        || state.savedManual.find(item => matchesStory(item, id, href))
        || buildStoryFromPost(resolvePost(id) || findPostByHref(href));
    }

    function findPostByHref(href){
      if(!href || !postsCache.length) return null;
      try {
        const url = new URL(href, window.location.origin);
        const slug = url.pathname.split('/').pop()?.replace('.html','');
        if(!slug) return null;
        return window.MIROZA.posts?.byId?.(slug) || null;
      } catch(e){ return null; }
    }

    function buildStoryFromPost(post){
      if(!post) return null;
      const ts = Date.parse(post.date || '') || Date.now();
      return {
        id: post.id || post.slug || post.link,
        slug: post.slug || '',
        title: post.title,
        category: post.category || 'Story',
        href: post.link || (post.slug ? `/articles/${post.slug}.html` : '#'),
        ts
      };
    }

    function matchesStory(item, id, href){
      if(!item) return false;
      if(id && (item.id === id || item.slug === id)) return true;
      if(href && item.href === href) return true;
      return false;
    }

    function refreshSavedCache(){
      cachedSavedStories = getSavedStories();
      return cachedSavedStories;
    }

    function getSavedStories(){
      const seen=new Set();
      const manual = state.savedManual.map(entry => ({ ...entry, origin:'manual' }));
      const liked = mapLikedStories();
      return [...manual, ...liked].filter(item => {
        const key = item.id || item.href;
        if(!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    function mapLikedStories(){
      const likedMap = window.MIROZA.community?.getLikedMap?.() || {};
      return Object.keys(likedMap).map(key => {
        const slug = key.split('/').filter(Boolean).pop();
        const post = slug ? (window.MIROZA.posts?.byId?.(slug) || postsCache.find(p => p.slug === slug)) : null;
        if(!post) return null;
        return { ...buildStoryFromPost(post), origin:'liked' };
      }).filter(Boolean);
    }

    function renderRecent(){
      if(!els.recent) return;
      const fragment=document.createDocumentFragment();
      const recents = state.recents;
      const savedKeys = new Set(refreshSavedCache().map(item => item.id || item.href));
      if(!recents.length){
        fragment.appendChild(buildEmptyRow('Explore a story to see it here.'));
      } else {
        recents.forEach(item => fragment.appendChild(buildListRow(item, {
          allowToggle:true,
          isPinned: savedKeys.has(item.id || item.href)
        })));
      }
      els.recent.innerHTML='';
      els.recent.appendChild(fragment);
    }

    function renderSaved(){
      if(!els.saved) return;
      const fragment=document.createDocumentFragment();
      const saved = refreshSavedCache();
      if(!saved.length){
        fragment.appendChild(buildEmptyRow('Tap the heart inside an article or pin a recent story.'));
      } else {
        saved.forEach(item => fragment.appendChild(buildListRow(item, {
          allowRemoval: item.origin === 'manual'
        })));
      }
      els.saved.innerHTML='';
      els.saved.appendChild(fragment);
    }

    function renderCategories(){
      if(!els.categories) return;
      els.categories.innerHTML='';
      const categories = deriveCategories();
      if(!categories.length){
        const fallback=document.createElement('p');
        fallback.className='quick-find__meta';
        fallback.textContent='Stories are loading…';
        els.categories.appendChild(fallback);
        return;
      }
      categories.forEach(item => {
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.category=item.slug;
        btn.dataset.action=item.action;
        if(item.filterKey){ btn.dataset.filterKey=item.filterKey; }
        if(item.href){ btn.dataset.href=item.href; }
        btn.textContent = `${item.label} (${item.count})`;
        els.categories.appendChild(btn);
      });
    }

    function deriveCategories(){
      if(externalCategories.length){
        return externalCategories.slice(0, 8).map(item => {
          const slug = normalizeCategory(item.slug || item.label);
          const label = item.label || item.title || slug;
          const count = typeof item.count === 'number' ? item.count : 0;
          const filterKey = mapToFilterKey(slug);
          if(filterKey){
            return { slug, label, count, action:'filter', filterKey };
          }
          const href = item.href || buildCategoryRoute(slug);
          if(!href) return null;
          return { slug, label, count, action:'navigate', href };
        }).filter(Boolean);
      }
      if(!postsCache.length) return [];
      const counts = {};
      postsCache.forEach(post => {
        const label = (post.category || '').trim();
        if(!label) return;
        const slug = normalizeCategory(label);
        if(!slug) return;
        if(!counts[slug]) counts[slug] = { label, slug, count:0 };
        counts[slug].count += 1;
        counts[slug].label = label;
      });
      return Object.values(counts).sort((a,b)=> b.count - a.count).slice(0,8).map(item => {
        const filterKey = mapToFilterKey(item.slug);
        if(filterKey) return { ...item, action:'filter', filterKey };
        const route = buildCategoryRoute(item.slug);
        if(route) return { ...item, action:'navigate', href: route };
        return null;
      }).filter(Boolean);
    }

    function buildCategoryRoute(slug){
      if(!slug) return null;
      return resolveCategoryRoute(slug);
    }

    function mapToFilterKey(slug){
      if(!slug) return null;
      if(filterButtons.has(slug)) return slug;
      if(slug.endsWith('s')){
        const singular = slug.slice(0,-1);
        if(filterButtons.has(singular)) return singular;
      }
      return null;
    }

    function normalizeCategory(label){
      return (label || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    }

    function buildEmptyRow(message){
      const li=document.createElement('li');
      li.className='empty';
      li.textContent=message;
      return li;
    }

    function buildListRow(item, { allowToggle=false, isPinned=false, allowRemoval=false }={}){
      const li=document.createElement('li');
      const details=document.createElement('div');
      details.className='quick-find__details';
      const link=document.createElement('a');
      link.href=item.href || '#';
      link.textContent=item.title;
      link.setAttribute('data-prefetch','');
      link.setAttribute('data-track-story', item.id || item.slug || '');
      link.dataset.trackSlug = item.slug || '';
      link.dataset.trackTitle = item.title;
      link.dataset.trackCategory = item.category || 'Story';
      const meta=document.createElement('p');
      meta.className='quick-find__meta';
      meta.textContent=[item.category, formatRelativeTime(item.ts)].filter(Boolean).join(' • ');
      details.appendChild(link);
      details.appendChild(meta);
      li.appendChild(details);
      if(allowToggle){
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='quick-find__action';
        btn.dataset.quickFindAction='save';
        btn.dataset.storyId=item.id || '';
        btn.dataset.storyHref=item.href || '';
        btn.textContent = isPinned ? 'Saved' : 'Save';
        btn.setAttribute('aria-pressed', isPinned ? 'true':'false');
        li.appendChild(btn);
      } else if(allowRemoval){
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='quick-find__action';
        btn.dataset.quickFindAction='remove';
        btn.dataset.storyId=item.id || '';
        btn.dataset.storyHref=item.href || '';
        btn.textContent='Remove';
        li.appendChild(btn);
      }
      return li;
    }

    function formatRelativeTime(ts){
      if(!ts) return '';
      const diff = Date.now() - ts;
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;
      try {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric:'auto' });
        if(diff < minute) return 'Just now';
        if(diff < hour) return rtf.format(-Math.round(diff / minute), 'minute');
        if(diff < day) return rtf.format(-Math.round(diff / hour), 'hour');
        return rtf.format(-Math.round(diff / day), 'day');
      } catch(e){
        return new Date(ts).toLocaleString();
      }
    }

    function scrollToLatest(cb){
      const section = document.getElementById('latest-heading');
      if(section){
        section.scrollIntoView({ behavior: window.MIROZA.utils.prefersReducedMotion()? 'auto':'smooth', block:'start' });
      }
      if(typeof cb === 'function'){ window.setTimeout(cb, 300); }
    }

    return { init, open, close, setCategories };
  })();

  /* Analytics & Diagnostics */
  window.MIROZA.analytics = (function(){
    const defaults = { enabled:false, plausibleDomain:'', debug:false };
    let config = { ...defaults };
    let plausibleLoaded=false;

    function loadConfig(){
      const external = window.MIROZA.analyticsConfig || {};
      config = { ...defaults, ...external };
    }

    function injectPlausible(){
      if(plausibleLoaded || !config.plausibleDomain) return;
      const existing = document.querySelector('script[data-analytics="plausible"]');
      if(existing){ plausibleLoaded = true; return; }
      const script=document.createElement('script');
      script.src='https://plausible.io/js/plausible.js';
      script.defer=true;
      script.dataset.domain=config.plausibleDomain;
      script.dataset.analytics='plausible';
      script.addEventListener('load', ()=>{ plausibleLoaded=true; if(config.debug){ console.info('[MIROZA]', 'Plausible analytics loaded'); } });
      document.head.appendChild(script);
    }

    function log(...args){ if(config.debug){ console.info('[MIROZA]', ...args); } }

    function enableDiagnostics(){
      if(!config.debug) return;
      log('Debug diagnostics enabled');
      window.addEventListener('load', ()=>{
        const nav = window.performance?.getEntriesByType?.('navigation')?.[0];
        if(nav){
          log('Navigation timing (ms)', {
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
            total: Math.round(nav.duration)
          });
        }
      }, { once:true });

      if('PerformanceObserver' in window){
        try {
          const paintObserver = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => log('Paint metric', entry.name, Math.round(entry.startTime)+'ms'));
          });
          paintObserver.observe({ type:'paint', buffered:true });
        } catch(err){ log('Paint observer unavailable', err.message); }
      }

      if(window.MIROZA.posts?.ready){
        window.MIROZA.posts.ready().then(items=>{
          log('Posts available', items.length);
        }).catch(err=> console.warn('MIROZA diagnostics unable to read posts', err));
      }
    }

    function init(){
      loadConfig();
      if(config.enabled){ injectPlausible(); }
      enableDiagnostics();
    }

    return { init, config:()=>({ ...config }) };
  })();

  /* Core Web Vitals Sampling */
  window.MIROZA.vitals = (function(){
    const metrics = {};
    const STORAGE_KEY = 'miroza_vitals_snapshot';
    function init(){
      if(!('PerformanceObserver' in window)) return;
      observe('largest-contentful-paint', entry => record('lcp', entry.renderTime || entry.loadTime || entry.startTime));
      observe('first-input', entry => record('fid', entry.processingStart - entry.startTime));
      observe('layout-shift', entry => { if(!entry.hadRecentInput){ record('cls', ((metrics.cls || 0) + entry.value)); } });
    }

    function observe(type, handler){
      try {
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => handler(entry));
        });
        const options = type === 'layout-shift' ? { type, buffered:true } : { type, buffered:true }; // maintain buffered for initial entries
        observer.observe(options);
      } catch(e){}
    }

    function record(name, value){
      if(typeof value !== 'number' || !isFinite(value)) return;
      metrics[name] = value;
      persist();
      if(window.MIROZA.analytics?.config?.().debug){
        console.info('[MIROZA][Vitals]', name, value);
      }
    }

    function persist(){
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics)); } catch(e){}
    }

    return { init, get:()=>({ ...metrics }) };
  })();

  /* Accessibility Enhancements */
  window.MIROZA.a11y = (function(){
    function skipLinkFocus(){ const skip = window.MIROZA.utils.qs('.skip-link'); if(skip){ skip.addEventListener('click', ()=>{ window.MIROZA.utils.qs('#main')?.focus(); }); } }
    function keyboardNav(){ document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ // close mobile nav if open
        const nav=window.MIROZA.utils.qs('.main-nav'); if(nav && nav.classList.contains('open')){ window.MIROZA.nav.toggle(); }
      }
    }); }
    function init(){ skipLinkFocus(); keyboardNav(); }
    return { init };
  })();

  /* Service Worker Registration */
  window.MIROZA.pwa = (function(){
    function register(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('/sw.js').catch(err=> console.warn('SW registration failed', err)); } }
    return { register };
  })();

  /* Initialization on DOMContentLoaded */
  document.addEventListener('DOMContentLoaded', function(){
    window.MIROZA.shell.init();
    window.MIROZA.components.init();
    window.MIROZA.analytics.init();
    window.MIROZA.theme.init();
    window.MIROZA.nav.init();
    window.MIROZA.posts.init();
    window.MIROZA.blogs.init();
    window.MIROZA.categories.init();
    window.MIROZA.indiaNews.init();
    window.MIROZA.prefetch.init();
    window.MIROZA.forms.init();
    window.MIROZA.community.init();
    window.MIROZA.search.init();
    window.MIROZA.quickFind.init();
    window.MIROZA.ui.init();
    window.MIROZA.a11y.init();
    window.MIROZA.vitals.init();
    window.MIROZA.pwa.register();
    window.MIROZA.breadcrumbs.init();
    window.MIROZA.seo.init();
    patchLegacyCategoryLinks();
    // Theme toggle button binding
    const themeBtn = window.MIROZA.utils.qs('.theme-toggle'); if(themeBtn){ themeBtn.addEventListener('click', window.MIROZA.theme.toggle); }
    // Dynamic year
    const yearEl = window.MIROZA.utils.qs('#year'); if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
  });
})();