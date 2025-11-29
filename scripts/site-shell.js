// Inject a consistent header and footer across pages and wire the theme toggle
(function(){
  function buildHeader(){
    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="header-inner">
        <a class="logo" href="/index.html"><img src="/assets/icons/logo.svg" alt="MIROZA logo" width="40" height="40" loading="lazy"> MIROZA</a>
        <nav class="main-nav" aria-label="Primary navigation">
          <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/news/news.html">News</a></li>
            <li><a href="/blogs/blogs.html">Blogs</a></li>
            <li><a href="/articles/articles.html">Articles</a></li>
            <li><a href="/about.html">About</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
        </nav>
        <button class="theme-toggle" aria-label="Toggle dark/light"><img src="/assets/icons/moon.svg" alt="Toggle theme" width="24" height="24" /></button>
      </div>`;
    return header;
  }

  function buildFooter(){
    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="footer-grid">
        <div>
          <h3>MIROZA</h3>
          <p>Modern news & articles hub.</p>
        </div>
      </div>
      <p class="copyright">&copy; <span id="year"></span> MIROZA.</p>`;
    return footer;
  }

  function ensureShell(){
    // Header: replace existing header or insert before main
    var existing = document.querySelector('header.site-header');
    var shellHeader = buildHeader();
    if(existing){
      existing.parentNode.replaceChild(shellHeader, existing);
    } else {
      var main = document.querySelector('main');
      if(main) main.parentNode.insertBefore(shellHeader, main);
      else document.body.insertBefore(shellHeader, document.body.firstChild);
    }

    // Footer
    var existingF = document.querySelector('footer.site-footer');
    var shellFooter = buildFooter();
    if(existingF){
      existingF.parentNode.replaceChild(shellFooter, existingF);
    } else {
      document.body.appendChild(shellFooter);
    }

    // Year
    var y = document.getElementById('year');
    if(y) y.textContent = new Date().getFullYear();

    // Theme toggle wiring (delegated)
    var btn = document.querySelector('.theme-toggle');
    if(btn){
      btn.addEventListener('click', function(){
        try{
          var cur = document.documentElement.dataset.theme || 'light';
          var next = cur === 'dark' ? 'light' : 'dark';
          document.documentElement.dataset.theme = next;
          localStorage.setItem('theme', next);
          updateToggleIcon(next);
        }catch(e){console.warn(e);}    
      });
    }

    // update icon based on theme
    function updateToggleIcon(theme){
      var img = document.querySelector('.theme-toggle img');
      if(!img) return;
      img.src = theme === 'dark' ? '/assets/icons/sun.svg' : '/assets/icons/moon.svg';
    }

    // initialize icon
    var initial = localStorage.getItem('theme') || document.documentElement.dataset.theme || 'light';
    document.documentElement.dataset.theme = initial;
    updateToggleIcon(initial);
    // fix common legacy links across pages
    try{ fixLegacyLinks(); }catch(e){}
  }

  function fixLegacyLinks(){
    var map = {
      '/news.html':'/news/news.html',
      '/articles.html':'/articles/articles.html',
      '/blog.html':'/blogs/blogs.html',
      '/blogs.html':'/blogs/blogs.html',
      '/':'/index.html'
    };
    document.querySelectorAll('a[href]').forEach(function(a){
      try{
        var h = a.getAttribute('href');
        if(map[h]) a.setAttribute('href', map[h]);
      }catch(e){}
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureShell);
  else ensureShell();
})();
