const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const TOTAL_POSTS = 30000;

// Data for generation
const STOCK_PREFIXES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Prime', 'Global', 'Future', 'Tech', 'Green', 'Solar', 'Quantum', 'Cyber', 'Bio', 'Nano', 'Mega', 'Ultra', 'Star', 'Blue', 'Red'];
const STOCK_SUFFIXES = ['Corp', 'Inc', 'Ltd', 'Group', 'Holdings', 'Systems', 'Energy', 'Pharma', 'Motors', 'Financial', 'Bank', 'Trust', 'Capital', 'Realty', 'Logistics', 'Networks', 'Data', 'Cloud', 'AI', 'Robotics'];
const CRYPTO_NAMES = ['Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Ripple', 'Polkadot', 'Dogecoin', 'Shiba Inu', 'Litecoin', 'Chainlink', 'Stellar', 'Monero', 'EOS', 'Tron', 'Neo', 'IOTA', 'Dash', 'Zcash', 'Tezos', 'Maker'];
const FOREX_PAIRS = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'];
const BANK_NAMES = ['First National', 'Royal', 'Imperial', 'Sovereign', 'United', 'Citizen', 'Republic', 'Union', 'Heritage', 'Liberty', 'Pioneer', 'Vanguard', 'Summit', 'Apex', 'Zenith', 'Meridian', 'Horizon', 'Spectrum', 'Matrix', 'Nexus'];

const CATEGORIES = ['Stock Market', 'Banking', 'Crypto', 'Forex', 'Mutual Funds', 'Personal Finance'];
const TRENDS = ['Bullish', 'Bearish', 'Volatile', 'Stable', 'Surging', 'Plunging', 'Recovering', 'Correcting', 'Rallying', 'Crashing'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateStockName() {
    return `${getRandomItem(STOCK_PREFIXES)} ${getRandomItem(STOCK_SUFFIXES)}`;
}

function generateBankName() {
    return `${getRandomItem(BANK_NAMES)} Bank`;
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/-+$/, '');
}

function generateHTML(post) {
    const canonicalUrl = `https://miroza.online/blogs/${post.slug}.html`;
    const dateStr = new Date().toISOString().split('T')[0];
    
    // Image logic: Local path with fallback
    const imageUrl = `/assets/images/finance/${post.slug}.jpg`; 
    const fallbackImage = `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(post.category)}`;

    let statsHtml = '';
    if (post.category === 'Stock Market') {
        statsHtml = `
            <div class="stat-box">
                <span class="stat-label">Price</span>
                <span class="stat-value">$${(Math.random() * 1000).toFixed(2)}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Change</span>
                <span class="stat-value" style="color: ${Math.random() > 0.5 ? '#10b981' : '#ef4444'}">${(Math.random() * 10 - 5).toFixed(2)}%</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Market Cap</span>
                <span class="stat-value">$${(Math.random() * 500).toFixed(1)}B</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">P/E Ratio</span>
                <span class="stat-value">${(Math.random() * 50 + 10).toFixed(1)}</span>
            </div>`;
    } else if (post.category === 'Crypto') {
        statsHtml = `
            <div class="stat-box">
                <span class="stat-label">Price</span>
                <span class="stat-value">$${(Math.random() * 50000).toFixed(2)}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">24h Change</span>
                <span class="stat-value" style="color: ${Math.random() > 0.5 ? '#10b981' : '#ef4444'}">${(Math.random() * 20 - 10).toFixed(2)}%</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Volume (24h)</span>
                <span class="stat-value">$${(Math.random() * 10).toFixed(1)}B</span>
            </div>`;
    } else if (post.category === 'Banking') {
        statsHtml = `
            <div class="stat-box">
                <span class="stat-label">Assets</span>
                <span class="stat-value">$${(Math.random() * 2000).toFixed(1)}B</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Interest Rate</span>
                <span class="stat-value">${(Math.random() * 5 + 1).toFixed(2)}%</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Branches</span>
                <span class="stat-value">${Math.floor(Math.random() * 1000 + 100)}</span>
            </div>`;
    } else {
        statsHtml = `
            <div class="stat-box">
                <span class="stat-label">Trend</span>
                <span class="stat-value">${post.trend}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Impact</span>
                <span class="stat-value">${getRandomItem(['High', 'Medium', 'Low'])}</span>
            </div>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} — MIROZA Finance</title>
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
    "@type":"NewsArticle",
    "headline":"${post.title}",
    "image":"${fallbackImage}",
    "datePublished": "${post.date}",
    "description":"${post.excerpt}",
    "url": "${canonicalUrl}",
    "author": {
        "@type": "Organization",
        "name": "MIROZA Finance Desk"
    }
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
  <style>
    .finance-header { text-align: center; margin-bottom: 2rem; padding: 2rem; background: var(--bg-alt); border-radius: 12px; }
    .finance-badge { display: inline-block; background: var(--accent); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; }
    .finance-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-box { background: var(--bg-main); padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow); }
    .stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
    .chart-placeholder { width: 100%; height: 300px; background: var(--bg-alt); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 2rem 0; border: 1px dashed var(--border); color: var(--text-muted); }
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
      
      <div class="finance-header">
        <span class="finance-badge">${post.category}</span>
        <h1 id="article-title" style="font-size: 2.5rem; margin: 1rem 0;">${post.title}</h1>
        <p class="meta">By MIROZA Finance • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time></p>
      </div>

      <figure style="margin: 0 0 2rem 0; border-radius: 12px; overflow: hidden;">
        <img src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'" alt="${post.title}" width="800" height="450" style="width: 100%; height: auto;" />
      </figure>

      <div class="finance-stats">
        ${statsHtml}
      </div>

      <div class="article-content">
        <p class="lead"><strong>${post.location}</strong> — The ${post.category} sector is witnessing significant movement today as ${post.subject} shows ${post.trend.toLowerCase()} signs. Analysts are closely monitoring the situation.</p>
        
        <h2>Market Analysis</h2>
        <p>In a surprising turn of events, ${post.subject} has captured the attention of investors worldwide. The recent data suggests a ${post.trend.toLowerCase()} trend that could reshape the short-term outlook. "It's a pivotal moment for ${post.category}," says Jane Doe, Chief Analyst at MIROZA.</p>
        
        <div class="chart-placeholder">
            [Interactive Real-Time Chart Loading...]
        </div>

        <h2>Key Drivers</h2>
        <p>Several factors are contributing to this volatility:</p>
        <ul>
            <li>Global economic shifts affecting ${post.category}.</li>
            <li>Regulatory updates in key markets.</li>
            <li>Technological advancements driving efficiency.</li>
            <li>Investor sentiment shifting towards ${post.trend === 'Bullish' ? 'risk-on' : 'risk-off'} assets.</li>
        </ul>

        <h2>What This Means for Investors</h2>
        <p>For retail and institutional investors alike, the current climate presents both risks and opportunities. Diversification remains key. Experts recommend keeping a close eye on ${post.subject} over the coming weeks as the market digests this new information.</p>
        
        <h2>Future Outlook</h2>
        <p>Looking ahead, the ${post.category} landscape is expected to evolve rapidly. Whether this ${post.trend.toLowerCase()} momentum sustains will depend on broader macroeconomic indicators. Stay tuned to MIROZA for real-time updates.</p>
      </div>

      <!-- Ad Slot -->
      <div class="ad-slot" style="margin: 3rem 0; padding: 2rem; background: var(--bg-alt); text-align: center; border: 1px solid var(--border);">
        <p style="font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase;">Sponsored Content</p>
        <p style="font-weight: bold; font-size: 1.2rem;">Trade Smarter with MIROZA Pro</p>
        <button style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer;">Start Free Trial</button>
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
    console.log(`Starting generation of ${TOTAL_POSTS} finance blogs...`);
    
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

    for (let i = 0; i < TOTAL_POSTS; i++) {
        const category = getRandomItem(CATEGORIES);
        const trend = getRandomItem(TRENDS);
        let title, subject;

        if (category === 'Stock Market') {
            subject = generateStockName();
            title = `${subject} Stock ${trend === 'Bullish' ? 'Soars to New Highs' : 'Faces Market Correction'}`;
        } else if (category === 'Crypto') {
            subject = getRandomItem(CRYPTO_NAMES);
            title = `${subject} Price Analysis: ${trend} Signals Ahead`;
        } else if (category === 'Forex') {
            subject = getRandomItem(FOREX_PAIRS);
            title = `${subject} Outlook: Currency Pair Remains ${trend}`;
        } else if (category === 'Banking') {
            subject = generateBankName();
            title = `${subject} Reports ${trend === 'Bullish' ? 'Strong Growth' : 'Mixed Results'} in Q4`;
        } else {
            subject = 'Global Markets';
            title = `${category} Update: ${trend} Sentiment Dominates`;
        }

        // Ensure uniqueness
        let slug = slugify(`${title}-${i + 100000}`); // Offset ID to avoid collision
        
        const post = {
            title: title,
            slug: slug,
            date: new Date().toISOString(),
            category: category,
            subject: subject,
            trend: trend,
            location: getRandomItem(['New York', 'London', 'Tokyo', 'Hong Kong', 'Frankfurt', 'Singapore']),
            excerpt: `Real-time analysis: ${title}. Expert insights on ${subject} and the broader ${category} sector.`,
            image: `/assets/images/finance/${slug}.jpg`,
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

        if ((i + 1) % 5000 === 0) {
            console.log(`Generated ${i + 1} finance blogs...`);
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts];
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${TOTAL_POSTS} finance blogs in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
