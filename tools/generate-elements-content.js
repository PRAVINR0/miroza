const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');

// Periodic Table Data
const ELEMENTS = [
    { name: "Hydrogen", symbol: "H", number: 1, category: "Nonmetal" },
    { name: "Helium", symbol: "He", number: 2, category: "Noble Gas" },
    { name: "Lithium", symbol: "Li", number: 3, category: "Alkali Metal" },
    { name: "Beryllium", symbol: "Be", number: 4, category: "Alkaline Earth Metal" },
    { name: "Boron", symbol: "B", number: 5, category: "Metalloid" },
    { name: "Carbon", symbol: "C", number: 6, category: "Nonmetal" },
    { name: "Nitrogen", symbol: "N", number: 7, category: "Nonmetal" },
    { name: "Oxygen", symbol: "O", number: 8, category: "Nonmetal" },
    { name: "Fluorine", symbol: "F", number: 9, category: "Halogen" },
    { name: "Neon", symbol: "Ne", number: 10, category: "Noble Gas" },
    { name: "Sodium", symbol: "Na", number: 11, category: "Alkali Metal" },
    { name: "Magnesium", symbol: "Mg", number: 12, category: "Alkaline Earth Metal" },
    { name: "Aluminum", symbol: "Al", number: 13, category: "Post-Transition Metal" },
    { name: "Silicon", symbol: "Si", number: 14, category: "Metalloid" },
    { name: "Phosphorus", symbol: "P", number: 15, category: "Nonmetal" },
    { name: "Sulfur", symbol: "S", number: 16, category: "Nonmetal" },
    { name: "Chlorine", symbol: "Cl", number: 17, category: "Halogen" },
    { name: "Argon", symbol: "Ar", number: 18, category: "Noble Gas" },
    { name: "Potassium", symbol: "K", number: 19, category: "Alkali Metal" },
    { name: "Calcium", symbol: "Ca", number: 20, category: "Alkaline Earth Metal" },
    { name: "Scandium", symbol: "Sc", number: 21, category: "Transition Metal" },
    { name: "Titanium", symbol: "Ti", number: 22, category: "Transition Metal" },
    { name: "Vanadium", symbol: "V", number: 23, category: "Transition Metal" },
    { name: "Chromium", symbol: "Cr", number: 24, category: "Transition Metal" },
    { name: "Manganese", symbol: "Mn", number: 25, category: "Transition Metal" },
    { name: "Iron", symbol: "Fe", number: 26, category: "Transition Metal" },
    { name: "Cobalt", symbol: "Co", number: 27, category: "Transition Metal" },
    { name: "Nickel", symbol: "Ni", number: 28, category: "Transition Metal" },
    { name: "Copper", symbol: "Cu", number: 29, category: "Transition Metal" },
    { name: "Zinc", symbol: "Zn", number: 30, category: "Transition Metal" },
    { name: "Gallium", symbol: "Ga", number: 31, category: "Post-Transition Metal" },
    { name: "Germanium", symbol: "Ge", number: 32, category: "Metalloid" },
    { name: "Arsenic", symbol: "As", number: 33, category: "Metalloid" },
    { name: "Selenium", symbol: "Se", number: 34, category: "Nonmetal" },
    { name: "Bromine", symbol: "Br", number: 35, category: "Halogen" },
    { name: "Krypton", symbol: "Kr", number: 36, category: "Noble Gas" },
    { name: "Rubidium", symbol: "Rb", number: 37, category: "Alkali Metal" },
    { name: "Strontium", symbol: "Sr", number: 38, category: "Alkaline Earth Metal" },
    { name: "Yttrium", symbol: "Y", number: 39, category: "Transition Metal" },
    { name: "Zirconium", symbol: "Zr", number: 40, category: "Transition Metal" },
    { name: "Niobium", symbol: "Nb", number: 41, category: "Transition Metal" },
    { name: "Molybdenum", symbol: "Mo", number: 42, category: "Transition Metal" },
    { name: "Technetium", symbol: "Tc", number: 43, category: "Transition Metal" },
    { name: "Ruthenium", symbol: "Ru", number: 44, category: "Transition Metal" },
    { name: "Rhodium", symbol: "Rh", number: 45, category: "Transition Metal" },
    { name: "Palladium", symbol: "Pd", number: 46, category: "Transition Metal" },
    { name: "Silver", symbol: "Ag", number: 47, category: "Transition Metal" },
    { name: "Cadmium", symbol: "Cd", number: 48, category: "Transition Metal" },
    { name: "Indium", symbol: "In", number: 49, category: "Post-Transition Metal" },
    { name: "Tin", symbol: "Sn", number: 50, category: "Post-Transition Metal" },
    { name: "Antimony", symbol: "Sb", number: 51, category: "Metalloid" },
    { name: "Tellurium", symbol: "Te", number: 52, category: "Metalloid" },
    { name: "Iodine", symbol: "I", number: 53, category: "Halogen" },
    { name: "Xenon", symbol: "Xe", number: 54, category: "Noble Gas" },
    { name: "Cesium", symbol: "Cs", number: 55, category: "Alkali Metal" },
    { name: "Barium", symbol: "Ba", number: 56, category: "Alkaline Earth Metal" },
    { name: "Lanthanum", symbol: "La", number: 57, category: "Lanthanide" },
    { name: "Cerium", symbol: "Ce", number: 58, category: "Lanthanide" },
    { name: "Praseodymium", symbol: "Pr", number: 59, category: "Lanthanide" },
    { name: "Neodymium", symbol: "Nd", number: 60, category: "Lanthanide" },
    { name: "Promethium", symbol: "Pm", number: 61, category: "Lanthanide" },
    { name: "Samarium", symbol: "Sm", number: 62, category: "Lanthanide" },
    { name: "Europium", symbol: "Eu", number: 63, category: "Lanthanide" },
    { name: "Gadolinium", symbol: "Gd", number: 64, category: "Lanthanide" },
    { name: "Terbium", symbol: "Tb", number: 65, category: "Lanthanide" },
    { name: "Dysprosium", symbol: "Dy", number: 66, category: "Lanthanide" },
    { name: "Holmium", symbol: "Ho", number: 67, category: "Lanthanide" },
    { name: "Erbium", symbol: "Er", number: 68, category: "Lanthanide" },
    { name: "Thulium", symbol: "Tm", number: 69, category: "Lanthanide" },
    { name: "Ytterbium", symbol: "Yb", number: 70, category: "Lanthanide" },
    { name: "Lutetium", symbol: "Lu", number: 71, category: "Lanthanide" },
    { name: "Hafnium", symbol: "Hf", number: 72, category: "Transition Metal" },
    { name: "Tantalum", symbol: "Ta", number: 73, category: "Transition Metal" },
    { name: "Tungsten", symbol: "W", number: 74, category: "Transition Metal" },
    { name: "Rhenium", symbol: "Re", number: 75, category: "Transition Metal" },
    { name: "Osmium", symbol: "Os", number: 76, category: "Transition Metal" },
    { name: "Iridium", symbol: "Ir", number: 77, category: "Transition Metal" },
    { name: "Platinum", symbol: "Pt", number: 78, category: "Transition Metal" },
    { name: "Gold", symbol: "Au", number: 79, category: "Transition Metal" },
    { name: "Mercury", symbol: "Hg", number: 80, category: "Transition Metal" },
    { name: "Thallium", symbol: "Tl", number: 81, category: "Post-Transition Metal" },
    { name: "Lead", symbol: "Pb", number: 82, category: "Post-Transition Metal" },
    { name: "Bismuth", symbol: "Bi", number: 83, category: "Post-Transition Metal" },
    { name: "Polonium", symbol: "Po", number: 84, category: "Metalloid" },
    { name: "Astatine", symbol: "At", number: 85, category: "Halogen" },
    { name: "Radon", symbol: "Rn", number: 86, category: "Noble Gas" },
    { name: "Francium", symbol: "Fr", number: 87, category: "Alkali Metal" },
    { name: "Radium", symbol: "Ra", number: 88, category: "Alkaline Earth Metal" },
    { name: "Actinium", symbol: "Ac", number: 89, category: "Actinide" },
    { name: "Thorium", symbol: "Th", number: 90, category: "Actinide" },
    { name: "Protactinium", symbol: "Pa", number: 91, category: "Actinide" },
    { name: "Uranium", symbol: "U", number: 92, category: "Actinide" },
    { name: "Neptunium", symbol: "Np", number: 93, category: "Actinide" },
    { name: "Plutonium", symbol: "Pu", number: 94, category: "Actinide" },
    { name: "Americium", symbol: "Am", number: 95, category: "Actinide" },
    { name: "Curium", symbol: "Cm", number: 96, category: "Actinide" },
    { name: "Berkelium", symbol: "Bk", number: 97, category: "Actinide" },
    { name: "Californium", symbol: "Cf", number: 98, category: "Actinide" },
    { name: "Einsteinium", symbol: "Es", number: 99, category: "Actinide" },
    { name: "Fermium", symbol: "Fm", number: 100, category: "Actinide" },
    { name: "Mendelevium", symbol: "Md", number: 101, category: "Actinide" },
    { name: "Nobelium", symbol: "No", number: 102, category: "Actinide" },
    { name: "Lawrencium", symbol: "Lr", number: 103, category: "Actinide" },
    { name: "Rutherfordium", symbol: "Rf", number: 104, category: "Transition Metal" },
    { name: "Dubnium", symbol: "Db", number: 105, category: "Transition Metal" },
    { name: "Seaborgium", symbol: "Sg", number: 106, category: "Transition Metal" },
    { name: "Bohrium", symbol: "Bh", number: 107, category: "Transition Metal" },
    { name: "Hassium", symbol: "Hs", number: 108, category: "Transition Metal" },
    { name: "Meitnerium", symbol: "Mt", number: 109, category: "Unknown" },
    { name: "Darmstadtium", symbol: "Ds", number: 110, category: "Unknown" },
    { name: "Roentgenium", symbol: "Rg", number: 111, category: "Unknown" },
    { name: "Copernicium", symbol: "Cn", number: 112, category: "Transition Metal" },
    { name: "Nihonium", symbol: "Nh", number: 113, category: "Unknown" },
    { name: "Flerovium", symbol: "Fl", number: 114, category: "Post-Transition Metal" },
    { name: "Moscovium", symbol: "Mc", number: 115, category: "Unknown" },
    { name: "Livermorium", symbol: "Lv", number: 116, category: "Unknown" },
    { name: "Tennessine", symbol: "Ts", number: 117, category: "Unknown" },
    { name: "Oganesson", symbol: "Og", number: 118, category: "Unknown" }
];

const TOPICS = [
    { suffix: "Properties and Characteristics", type: "Science" },
    { suffix: "History and Discovery", type: "History" },
    { suffix: "Industrial Uses and Applications", type: "Industry" },
    { suffix: "Market Price and Investment Guide", type: "Finance" },
    { suffix: "Health Effects and Biological Role", type: "Health" },
    { suffix: "Future Technologies and Research", type: "Technology" },
    { suffix: "Isotopes and Nuclear Properties", type: "Physics" },
    { suffix: "Environmental Impact and Mining", type: "Environment" }
];

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/-+$/, '');
}

function generateHTML(post, element) {
    const canonicalUrl = `https://miroza.online/blogs/${post.slug}.html`;
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Image logic
    const imageUrl = `/assets/images/elements/${element.symbol.toLowerCase()}.jpg`; 
    const fallbackImage = `https://placehold.co/600x400/334155/ffffff?text=${encodeURIComponent(element.symbol + ' - ' + element.name)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} — MIROZA Science</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${post.excerpt}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.excerpt}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${fallbackImage}" />
  <meta property="og:site_name" content="MIROZA" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${post.excerpt}" />
  <meta name="twitter:image" content="${fallbackImage}" />
  
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://plausible.io; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;" />
  
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":"${post.title}",
    "image":"${fallbackImage}",
    "datePublished": "${post.date}",
    "description":"${post.excerpt}",
    "url": "${canonicalUrl}",
    "author": {
        "@type": "Organization",
        "name": "MIROZA Science Desk"
    }
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
  <style>
    .element-header { text-align: center; margin-bottom: 2rem; padding: 2rem; background: var(--bg-alt); border-radius: 12px; position: relative; overflow: hidden; }
    .element-symbol { font-size: 5rem; font-weight: 800; color: var(--accent); opacity: 0.2; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; }
    .element-content { position: relative; z-index: 1; }
    .element-badge { display: inline-block; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; }
    .element-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-box { background: var(--bg-main); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow); }
    .stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.25rem; }
    .stat-value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
  </style>
</head>
<body data-page="blog">
  <a href="#content" class="skip-link">Skip to content</a>
  
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

  <main id="content" tabindex="-1">
    <article class="single-article" aria-labelledby="article-title">
      <div class="content-navigation">
        <a href="/blogs/blogs.html" class="btn-back">
          <span class="icon-arrow-left">←</span> Back to Blogs
        </a>
      </div>
      
      <div class="element-header">
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-content">
            <span class="element-badge">${element.category}</span>
            <h1 id="article-title" style="font-size: 2.5rem; margin: 1rem 0;">${post.title}</h1>
            <p class="meta">By MIROZA Science • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time></p>
        </div>
      </div>

      <figure style="margin: 0 0 2rem 0; border-radius: 12px; overflow: hidden;">
        <img src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'" alt="${element.name}" width="800" height="450" style="width: 100%; height: auto;" />
      </figure>

      <div class="element-stats">
        <div class="stat-box">
            <span class="stat-label">Atomic Number</span>
            <span class="stat-value">${element.number}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Symbol</span>
            <span class="stat-value">${element.symbol}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Category</span>
            <span class="stat-value" style="font-size: 1rem;">${element.category}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Phase</span>
            <span class="stat-value" style="font-size: 1rem;">${element.category.includes('Gas') ? 'Gas' : 'Solid'}</span>
        </div>
      </div>

      <div class="article-content">
        <p class="lead"><strong>${element.name} (${element.symbol})</strong> is a fundamental element that plays a crucial role in our universe. This article explores its ${post.topic.toLowerCase()}.</p>
        
        <h2>Overview</h2>
        <p>${element.name} is element number ${element.number} on the periodic table. Classified as a ${element.category}, it has unique properties that make it a subject of intense study and application.</p>
        
        <h2>${post.topic}</h2>
        <p>When discussing the ${post.topic.toLowerCase()} of ${element.name}, it's important to consider its impact on science and industry. Researchers have long been fascinated by how ${element.symbol} interacts with other elements.</p>
        
        <h3>Key Facts</h3>
        <ul>
            <li><strong>Symbol:</strong> ${element.symbol}</li>
            <li><strong>Atomic Number:</strong> ${element.number}</li>
            <li><strong>Group:</strong> ${element.category}</li>
        </ul>

        <h2>Conclusion</h2>
        <p>From its discovery to its modern-day applications, ${element.name} remains a cornerstone of chemistry. Understanding its ${post.topic.toLowerCase()} helps us appreciate the complexity of the material world.</p>
      </div>

      <!-- Ad Slot -->
      <div class="ad-slot" style="margin: 3rem 0; padding: 2rem; background: var(--bg-alt); text-align: center; border: 1px solid var(--border);">
        <p style="font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase;">Sponsored Content</p>
        <p style="font-weight: bold; font-size: 1.2rem;">Discover Rare Earth Investments</p>
        <button style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">Learn More</button>
      </div>

    </article>
  </main>
  
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

  <script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.11/dist/purify.min.js" defer crossorigin="anonymous"></script>
  <script src="/scripts/app.min.js" defer></script>
  <button class="back-to-top" aria-label="Back to top">↑</button>
</body>
</html>`;
}

async function main() {
    console.log(`Starting generation of element blogs...`);
    
    // Load existing posts
    let posts = [];
    if (fs.existsSync(POSTS_FILE)) {
        try {
            posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading posts.json', e);
            posts = [];
        }
    }

    const newPosts = [];
    const startTime = Date.now();
    let count = 0;

    for (const element of ELEMENTS) {
        for (const topic of TOPICS) {
            const title = `${element.name}: ${topic.suffix}`;
            const slug = slugify(`${element.name}-${topic.suffix}`);
            
            const post = {
                title: title,
                slug: slug,
                date: new Date().toISOString(),
                category: "Science",
                topic: topic.suffix,
                excerpt: `A detailed look at the ${topic.suffix.toLowerCase()} of ${element.name} (${element.symbol}).`,
                image: `/assets/images/elements/${element.symbol.toLowerCase()}.jpg`,
                link: `/blogs/${slug}.html`
            };

            // Write HTML file
            const html = generateHTML(post, element);
            fs.writeFileSync(path.join(BLOGS_DIR, `${slug}.html`), html);

            // Add to index
            newPosts.push({
                title: post.title,
                slug: post.slug,
                date: post.date,
                category: post.category,
                excerpt: post.excerpt,
                image: post.image,
                link: post.link
            });
            count++;
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts];
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${count} element blogs in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
