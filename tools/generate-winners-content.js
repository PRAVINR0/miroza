const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const TOTAL_POSTS = 10000;

// Data for generation
const FIRST_NAMES = [
    'Marie', 'Albert', 'Niels', 'Werner', 'Erwin', 'Richard', 'James', 'Francis', 'Rosalind', 'Barbara',
    'Linus', 'Dorothy', 'Ahmed', 'Kofi', 'Malala', 'Barack', 'Nelson', 'Martin', 'Mother', 'Desmond',
    'Usain', 'Michael', 'Simone', 'Serena', 'Roger', 'Rafael', 'Novak', 'Lionel', 'Cristiano', 'Jesse',
    'Carl', 'Mark', 'Nadia', 'Larisa', 'Paavo', 'Emil', 'Abebe', 'Haile', 'Mo', 'Eliud',
    'Yuzuru', 'Shaun', 'Chloe', 'Mikaela', 'Lindsey', 'Bode', 'Hermann', 'Ingemar', 'Alberto', 'Kjetil',
    'Wang', 'Li', 'Chen', 'Zhang', 'Liu', 'Sun', 'Yang', 'Wu', 'Zhao', 'Huang',
    'Sven', 'Bjorn', 'Magnus', 'Astrid', 'Greta', 'Ingrid', 'Lars', 'Erik', 'Anders', 'Karin'
];

const LAST_NAMES = [
    'Curie', 'Einstein', 'Bohr', 'Heisenberg', 'Schrodinger', 'Feynman', 'Watson', 'Crick', 'Franklin', 'McClintock',
    'Pauling', 'Hodgkin', 'Zewail', 'Annan', 'Yousafzai', 'Obama', 'Mandela', 'Luther King', 'Teresa', 'Tutu',
    'Bolt', 'Phelps', 'Biles', 'Williams', 'Federer', 'Nadal', 'Djokovic', 'Messi', 'Ronaldo', 'Owens',
    'Lewis', 'Spitz', 'Comaneci', 'Latynina', 'Nurmi', 'Zatopek', 'Bikila', 'Gebrselassie', 'Farah', 'Kipchoge',
    'Hanyu', 'White', 'Kim', 'Shiffrin', 'Vonn', 'Miller', 'Maier', 'Stenmark', 'Tomba', 'Andream',
    'Wei', 'Na', 'Long', 'Yining', 'Xiang', 'Yang', 'Qian', 'Min', 'Jing', 'Hui',
    'Kramer', 'Borg', 'Carlsen', 'Lindgren', 'Garbo', 'Bergman', 'Hansen', 'Nielsen', 'Jensen', 'Pedersen'
];

const NOBEL_CATEGORIES = ['Physics', 'Chemistry', 'Physiology or Medicine', 'Literature', 'Peace', 'Economic Sciences'];
const OLYMPIC_SPORTS = ['Athletics', 'Swimming', 'Gymnastics', 'Judo', 'Fencing', 'Cycling', 'Rowing', 'Boxing', 'Wrestling', 'Weightlifting', 'Tennis', 'Table Tennis', 'Badminton', 'Shooting', 'Archery'];
const COUNTRIES = ['USA', 'UK', 'France', 'Germany', 'Japan', 'China', 'Russia', 'Australia', 'Canada', 'Italy', 'Spain', 'Brazil', 'Kenya', 'Ethiopia', 'Jamaica', 'Sweden', 'Norway', 'India', 'South Korea', 'Netherlands'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
    return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function generateHTML(post) {
    const canonicalUrl = `https://miroza.online/blogs/${post.slug}.html`;
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Image logic: Local path with fallback
    const imageUrl = `/assets/images/winners/${post.slug}.jpg`; 
    const fallbackImage = `https://placehold.co/600x800/1e293b/ffffff?text=${encodeURIComponent(post.title)}`;

    const isNobel = post.type === 'Nobel Prize';
    const awardTitle = isNobel ? `Nobel Prize in ${post.awardCategory}` : `Olympic Gold Medalist - ${post.awardCategory}`;
    const contextText = isNobel 
        ? `awarded for their groundbreaking contributions to ${post.awardCategory}. Their work has reshaped our understanding of the field.`
        : `who dominated the field of ${post.awardCategory} at the Olympic Games. Their dedication and athletic prowess are legendary.`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} - ${awardTitle} — MIROZA</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${post.excerpt}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title} - ${awardTitle}" />
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
    "@type":"Person",
    "name":"${post.title}",
    "image":"${fallbackImage}",
    "description":"${post.excerpt}",
    "award": "${awardTitle}"
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
  <style>
    .winner-profile { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
    .winner-image { border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); aspect-ratio: 3/4; background: var(--bg-alt); }
    .winner-image img { width: 100%; height: 100%; object-fit: cover; }
    .winner-badge { display: inline-block; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }
    .winner-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-box { background: var(--bg-alt); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); }
    .stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
    @media(min-width: 768px) {
        .winner-profile { grid-template-columns: 300px 1fr; }
    }
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
      
      <div class="winner-profile">
        <div class="winner-image">
            <!-- Tries to load local image, falls back to placeholder -->
            <img src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'" alt="${post.title}" width="600" height="800" loading="eager" />
        </div>
        <div class="winner-info">
            <header>
                <span class="winner-badge">${post.type}</span>
                <h1 id="article-title">${post.title}</h1>
                <p class="meta">${awardTitle} • ${post.country} • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time></p>
            </header>
            
            <div class="winner-stats">
                <div class="stat-box">
                    <span class="stat-label">Category</span>
                    <span class="stat-value">${post.awardCategory}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Year</span>
                    <span class="stat-value">${post.year}</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Country</span>
                    <span class="stat-value">${post.country}</span>
                </div>
            </div>

            <p class="lead">${post.title} is a celebrated figure from ${post.country}, ${contextText}</p>
            <p>Their achievement in ${post.year} marked a significant milestone in the history of ${post.awardCategory}. Recognized globally, they continue to inspire future generations.</p>
        </div>
      </div>

      <!-- Ad Slot: Winner Middle -->
      <div class="ad-slot" data-slot="winner-middle" style="margin: 2rem 0; text-align: center; min-height: 90px; background: var(--bg-alt); display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border);">
        <span style="color: var(--text-alt); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Advertisement</span>
      </div>

      <section>
        <h2>The Journey to Success</h2>
        <p>Success did not come overnight for ${post.title}. Years of rigorous preparation, research, and training preceded their monumental win. The path was fraught with challenges, but their resilience shone through.</p>
        
        <h2>Impact and Legacy</h2>
        <p>Winning the ${post.type} is not just a personal victory but a testament to human potential. ${post.title}'s work in ${post.awardCategory} has left an indelible mark, influencing peers and setting new standards of excellence.</p>
        
        <h2>Global Recognition</h2>
        <p>Hailing from ${post.country}, ${post.title} has become a national icon. Their story is taught in schools and cited in academic journals, proving that dedication and passion can indeed change the world.</p>
      </section>
    
      <!-- Newsletter Signup -->
      <div class="newsletter-signup" style="margin-top: 3rem; padding: 2rem; background: var(--bg-alt); border-radius: 8px; text-align: center;">
        <h3>Stay Inspired</h3>
        <p>Get stories of greatness delivered to your inbox.</p>
        <form class="newsletter-form" onsubmit="return false;" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
          <input type="email" placeholder="you@example.com" required style="padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; flex: 1; max-width: 300px;">
          <button type="submit" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">Subscribe</button>
        </form>
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
    console.log(`Starting generation of ${TOTAL_POSTS} winner blogs...`);
    
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
    const generatedNames = new Set();

    for (let i = 0; i < TOTAL_POSTS; i++) {
        let name = generateName();
        let attempts = 0;
        while (generatedNames.has(name) && attempts < 10) {
            name = generateName();
            attempts++;
        }
        generatedNames.add(name);
        if (attempts >= 10) name = `${name} ${i}`;

        const isNobel = Math.random() > 0.5;
        const type = isNobel ? 'Nobel Prize' : 'Olympic Gold';
        const category = isNobel ? getRandomItem(NOBEL_CATEGORIES) : getRandomItem(OLYMPIC_SPORTS);
        const country = getRandomItem(COUNTRIES);
        const year = Math.floor(Math.random() * (2024 - 1900 + 1)) + 1900;

        const slug = slugify(`${name}-${type}-${category}`);
        const excerpt = `Discover the story of ${name}, ${type} winner in ${category} (${year}). A journey of excellence from ${country}.`;
        
        const post = {
            title: name,
            slug: slug,
            date: new Date().toISOString(),
            category: 'Blog', // Keep in Blog section
            type: type,
            awardCategory: category,
            country: country,
            year: year,
            excerpt: excerpt,
            image: `/assets/images/winners/${slug}.jpg`,
            link: `/blogs/${slug}.html`
        };

        // Write HTML file
        const html = generateHTML(post);
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

        if ((i + 1) % 1000 === 0) {
            console.log(`Generated ${i + 1} winner blogs...`);
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts];
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${TOTAL_POSTS} winner blogs in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
