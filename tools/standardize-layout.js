
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dirs = ['articles', 'news', 'blogs', '.']; // '.' for root files like about.html

const standardHeader = `
  <header class="site-header" aria-label="Site header">
    <div class="header-inner">
      <a class="logo" href="/" aria-label="MIROZA Home">
        <img src="/assets/icons/logo.svg" alt="MIROZA" width="32" height="32" />
        <span class="logo-text">MIROZA</span>
      </a>

      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <img src="/assets/icons/menu.svg" alt="Menu" width="24" height="24" />
      </button>

      <nav class="main-nav" aria-label="Primary navigation">
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/news/news.html">News</a></li>
          <li><a href="/articles/articles.html">Articles</a></li>
          <li><a href="/blogs/blogs.html">Blogs</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>

      <form class="search-form" role="search" onsubmit="return false;">
        <label for="search" class="visually-hidden">Search</label>
        <input id="search" name="q" type="search" placeholder="Search..." autocomplete="off" />
        <div class="search-suggestions" id="search-suggestions" hidden></div>
      </form>

      <button class="theme-toggle" aria-label="Toggle dark mode">
        <img src="/assets/icons/moon.svg" alt="Enable dark mode" width="24" height="24" />
      </button>
    </div>
  </header>
`;

const standardFooter = `
  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <h3>MIROZA</h3>
        <p>Modern news & articles hub. Fast, accessible, secure.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <ul>
          <li><a href="/news/news.html">News</a></li>
          <li><a href="/articles/articles.html">Articles</a></li>
          <li><a href="/blogs/blogs.html">Blogs</a></li>
        </ul>
      </div>
      <div>
        <h3>Connect</h3>
        <ul>
          <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="/contact.html">Contact Us</a></li>
          <li><a href="/contact.html#advertise">Advertise with us</a></li>
        </ul>
      </div>
      <div>
        <h3>Legal</h3>
        <ul>
          <li><a href="/privacy.html">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="copyright">
      &copy; <span id="year">2025</span> MIROZA. All rights reserved.
    </div>
  </footer>
`;

const backToTopButton = `
  <button class="back-to-top" aria-label="Back to top">↑</button>
`;

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'tools' && file !== 'scripts' && file !== 'styles' && file !== 'assets' && file !== 'data') {
             // Skip non-content dirs if recursing from root, but we are explicit with dirs array
        } else if (stats.isFile() && file.endsWith('.html')) {
            callback(filepath);
        }
    });
}

dirs.forEach(d => {
    const fullPath = path.join(rootDir, d);
    if (fs.existsSync(fullPath)) {
        walk(fullPath, (filepath) => {
            if (filepath.endsWith('index.html')) return; // Skip index.html as it is the source
            
            let content = fs.readFileSync(filepath, 'utf8');
            let original = content;

            // Replace Header
            // Regex to match <header ... > ... </header>
            // We use [\s\S]*? for non-greedy match across lines
            content = content.replace(/<header[\s\S]*?<\/header>/, standardHeader);

            // Replace Footer
            content = content.replace(/<footer[\s\S]*?<\/footer>/, standardFooter);

            // Ensure Back to Top button exists before body end
            if (!content.includes('class="back-to-top"')) {
                content = content.replace('</body>', `${backToTopButton}\n</body>`);
            }

            if (content !== original) {
                fs.writeFileSync(filepath, content, 'utf8');
                console.log(`Updated layout: ${path.relative(rootDir, filepath)}`);
            }
        });
    }
});
