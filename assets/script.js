// Lightweight search + theme toggle + small UX enhancements
(function(){
  function el(id){return document.getElementById(id)}

  // Search filtering
  var input = el('search');
  var posts = Array.from(document.querySelectorAll('.posts-list .post'));
  if(input && posts.length){
    input.addEventListener('input', function(){
      var q = this.value.trim().toLowerCase();
      if(!q){ posts.forEach(p=>p.style.display=''); return }
      posts.forEach(function(p){
        var text = (p.innerText||'').toLowerCase();
        p.style.display = text.indexOf(q) !== -1 ? '' : 'none';
      })
    });
  }

  // Theme toggle: remembers preference in localStorage
  function createThemeToggle(){
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.title = 'Toggle light / dark theme';
    function updateIcon(){
      var cur = document.documentElement.getAttribute('data-theme');
      if(cur === 'dark') btn.innerText = '☀️'; else btn.innerText = '🌙';
    }
    btn.addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme');
      if(cur === 'dark'){
        document.documentElement.setAttribute('data-theme','light');
        localStorage.setItem('theme','light');
      } else {
        document.documentElement.setAttribute('data-theme','dark');
        localStorage.setItem('theme','dark');
      }
      updateIcon();
    });
    document.body.appendChild(btn);
    updateIcon();
  }

  // Apply saved theme on load
  try{
    var saved = localStorage.getItem('theme');
    if(saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
    else {
      // respect system preference if no saved choice
      try{ if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme','dark'); }catch(e){}
    }
  }catch(e){}
  createThemeToggle();

  // Lazy image reveal animation
  document.addEventListener('DOMContentLoaded', function(){
    var imgs = Array.from(document.querySelectorAll('img'));
    imgs.forEach(function(i){ i.loading = i.loading || 'lazy'; i decoding = 'async'; });
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      },{threshold:0.08});
      document.querySelectorAll('img').forEach(function(img){ io.observe(img); });
    } else { document.querySelectorAll('img').forEach(i=>i.classList.add('visible')); }
  });

})();

