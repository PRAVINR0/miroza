$files = Get-ChildItem -Path "articles" -Filter "*.html" -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace CSS link
    $content = $content -replace '<link rel="stylesheet" href="/styles/main.min.css" />', '<link rel="stylesheet" href="/styles/main.css" />'
    
    # Replace JS link
    $content = $content -replace '<script src="/scripts/app.min.js" defer></script>', '<script src="/scripts/app.js"></script>'
    
    # New Header Content
    $newHeader = '
  <!-- Top Strip -->
  <div class="top-strip">
    <div class="container">
      <div class="ts-left">
        <span>Tuesday, Nov 25, 2025</span>
        <span class="separator">|</span>
        <span>28°C New Delhi</span>
      </div>
      <div class="ts-right">
        <a href="#">E-Paper</a>
        <span class="separator">|</span>
        <a href="#">Sign In</a>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header class="site-header">
    <div class="container header-grid">
      <button class="menu-toggle" aria-label="Menu">
        <img src="/assets/icons/menu.svg" alt="Menu" width="24">
      </button>
      
      <a href="/" class="logo">
        <img src="/assets/icons/logo.svg" alt="M">
        MIROZA
      </a>

      <div class="header-search">
        <form action="/search.html">
          <input type="text" placeholder="Search News, Articles...">
          <button type="submit" class="search-btn">
            <img src="/assets/icons/search.svg" alt="Search" width="16" style="filter: invert(1);">
          </button>
        </form>
      </div>

      <button class="mobile-search-toggle">
        <img src="/assets/icons/search.svg" alt="Search" width="20">
      </button>
    </div>
  </header>

  <!-- Nav Bar -->
  <nav class="main-nav-bar">
    <div class="container">
      <ul class="nav-list">
        <li><a href="/index.html">Home</a></li>
        <li><a href="/news.html">News</a></li>
        <li><a href="/articles.html">Articles</a></li>
        <li><a href="/blog.html">Blogs</a></li>
        <li><a href="/about.html">About Us</a></li>
      </ul>
    </div>
  </nav>'

    # Replace Header Block
    # We look for the start of the old header and the end of the old nav
    # Old structure: <header ...> ... </header> ... <nav ...> ... </nav> OR <header ...> ... <nav ...> ... </nav> ... </header>
    # In article-1.html it was: <header ...> ... <nav ...> ... </nav> ... </header>
    
    $content = $content -replace '(?s)<header class="site-header".*?</header>', $newHeader

    # New Footer Content
    $newFooter = '
  <!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-links">
        <div class="fl-col">
          <h4>News</h4>
          <a href="/news.html">India</a>
          <a href="/news.html">World</a>
          <a href="/news.html">Business</a>
        </div>
        <div class="fl-col">
          <h4>Opinion</h4>
          <a href="/blog.html">Blogs</a>
          <a href="/articles.html">Editorials</a>
          <a href="/articles.html">Columns</a>
        </div>
        <div class="fl-col">
          <h4>More</h4>
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
        </div>
      </div>
      <div class="copyright">
        Copyright © 2025 MIROZA. All rights reserved.
      </div>
    </div>
  </footer>'

    # Replace Footer Block
    $content = $content -replace '(?s)<footer class="site-footer">.*?</footer>', $newFooter

    # Update Main Container
    $content = $content -replace '<main id="content" tabindex="-1">', '<main class="container main-layout" style="display:block">'

    Set-Content -Path $file.FullName -Value $content
}
