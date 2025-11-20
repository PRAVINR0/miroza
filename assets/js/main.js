// main.js — core interactions: smooth scroll, navbar scroll behavior, button click anims
(function(){
  // smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var id = this.getAttribute('href');
      var el = document.querySelector(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // navbar background change when scrolling
  var header = document.getElementById('siteHeader');
  var lastScroll = 0;
  function onScroll(){
    var y = window.scrollY || document.documentElement.scrollTop;
    if(y > 24) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // small click animation for primary buttons
  document.querySelectorAll('.btn-primary, .btn-outline, .btn').forEach(function(b){
    b.addEventListener('click', function(){
      this.classList.add('btn-clicked');
      setTimeout(()=>this.classList.remove('btn-clicked'), 220);
    });
  });

  // mobile menu toggle (simple)
  var menuToggle = document.getElementById('menuToggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      document.body.classList.toggle('menu-open');
    });
  }
})();

/* Dynamic data loader: inject articles or news when containers exist */
(function(){
  function createArticleCard(item){
    // Render a full article section (not a link to a separate file)
    var el = document.createElement('article');
    el.className = 'article-item reveal-on-scroll';
    var h = document.createElement('h2'); h.className='article-title'; h.textContent = item.title;
    var meta = document.createElement('div'); meta.className='article-meta'; meta.textContent = (item.category?item.category+' · ':'') + (item.date||'');
    el.appendChild(h);
    el.appendChild(meta);
    if(item.image){
      var img = document.createElement('img'); img.className='feature'; img.src = item.image; img.alt = item.title;
      el.appendChild(img);
    }
    var p = document.createElement('div'); p.className='article-content';
    // allow simple HTML in content if provided
    p.innerHTML = item.content ? item.content : (item.description || '');
    el.appendChild(p);
    return el;
  }

  function createNewsCard(item){
    var el = document.createElement('article');
    el.className = 'news-item reveal-on-scroll';
    var h = document.createElement('h3'); h.className='news-title'; h.textContent = item.title;
    var meta = document.createElement('div'); meta.className='article-meta'; meta.textContent = item.date || '';
    el.appendChild(h); el.appendChild(meta);
    if(item.image){
      var img = document.createElement('img'); img.className='feature'; img.src = item.image; img.alt = item.title;
      el.appendChild(img);
    }
    var p = document.createElement('div'); p.className='article-content';
    p.innerHTML = item.content ? item.content : (item.description || '');
    el.appendChild(p);
    return el;
  }

  // articles
  if(document.getElementById('articles-container')){
    fetch('assets/data/articles.json')
      .then(function(res){ if(!res.ok) throw new Error('Network response not ok'); return res.json(); })
      .then(function(data){
        var container = document.getElementById('articles-container');
        // Render each article as a full entry inside articles.html
        data.forEach(function(item){
          var articleEl = createArticleCard(item);
          container.appendChild(articleEl);
        });
        if(window.IntersectionObserver){
          var els = container.querySelectorAll('.reveal-on-scroll');
          els.forEach(function(el){ el.classList.add('revealed'); });
        }
      })
      .catch(function(err){ console.error('Failed to load articles.json', err); });
  }

  // news
  if(document.getElementById('news-container')){
    fetch('assets/data/news.json')
      .then(function(res){ if(!res.ok) throw new Error('Network response not ok'); return res.json(); })
      .then(function(data){
        var container = document.getElementById('news-container');
        data.forEach(function(item){
          var newsEl = createNewsCard(item);
          container.appendChild(newsEl);
        });
        if(window.IntersectionObserver){
          var els = container.querySelectorAll('.reveal-on-scroll');
          els.forEach(function(el){ el.classList.add('revealed'); });
        }
      })
      .catch(function(err){ console.error('Failed to load news.json', err); });
  }
})();
