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
    var div = document.createElement('article');
    div.className = 'data-card reveal-on-scroll';
    var head = document.createElement('div'); head.className = 'card-head';
    var title = document.createElement('h3'); title.className = 'card-title';
    var a = document.createElement('a'); a.href = item.path || ('articles/article-' + (item.id||'') + '.html');
    a.textContent = item.title;
    title.appendChild(a);
    var meta = document.createElement('div'); meta.className = 'card-meta'; meta.textContent = item.date || '';
    head.appendChild(title);
    if(item.category){
      var cat = document.createElement('span'); cat.className='card-cat'; cat.textContent = item.category; head.appendChild(cat);
    }
    head.appendChild(meta);
    var desc = document.createElement('p'); desc.className='card-desc'; desc.textContent = item.description || '';
    div.appendChild(head);
    div.appendChild(desc);
    return div;
  }

  function createNewsCard(item){
    var div = document.createElement('article');
    div.className = 'data-card reveal-on-scroll';
    var head = document.createElement('div'); head.className = 'card-head';
    var title = document.createElement('h3'); title.className = 'card-title';
    var a = document.createElement('a'); a.href = item.path || '#'; a.textContent = item.title;
    title.appendChild(a);
    var meta = document.createElement('div'); meta.className = 'card-meta'; meta.textContent = item.date || '';
    head.appendChild(title); head.appendChild(meta);
    var desc = document.createElement('p'); desc.className='card-desc'; desc.textContent = item.description || '';
    div.appendChild(head); div.appendChild(desc);
    return div;
  }

  // articles
  if(document.getElementById('articles-container')){
    fetch('assets/data/articles.json')
      .then(function(res){ if(!res.ok) throw new Error('Network response not ok'); return res.json(); })
      .then(function(data){
        var container = document.getElementById('articles-container');
        data.forEach(function(item){
          var card = createArticleCard(item);
          container.appendChild(card);
        });
        // initialize reveal observer for new elements if animations script is present
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
          var card = createNewsCard(item);
          container.appendChild(card);
        });
        if(window.IntersectionObserver){
          var els = container.querySelectorAll('.reveal-on-scroll');
          els.forEach(function(el){ el.classList.add('revealed'); });
        }
      })
      .catch(function(err){ console.error('Failed to load news.json', err); });
  }
})();
