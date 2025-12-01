const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const TOTAL_POSTS = 20000;

// Data for generation
const FIRST_NAMES = [
    'Elon', 'Jeff', 'Bill', 'Mark', 'Warren', 'Larry', 'Sergey', 'Steve', 'Tim', 'Satya',
    'Sundar', 'Jensen', 'Richard', 'Jack', 'Masayoshi', 'Mukesh', 'Gautam', 'Bernard', 'Francoise', 'Alice',
    'Julia', 'Mackenzie', 'Sheryl', 'Indra', 'Mary', 'Ginni', 'Safra', 'Abigail', 'Laurene', 'Susanne',
    'Arianna', 'Oprah', 'Rihanna', 'Beyonce', 'Kim', 'Kylie', 'Taylor', 'Reese', 'Gwyneth', 'Jessica',
    'Peter', 'Reid', 'Marc', 'Ben', 'Paul', 'Graham', 'Sam', 'Vitalik', 'Changpeng', 'Brian'
];

const LAST_NAMES = [
    'Musk', 'Bezos', 'Gates', 'Zuckerberg', 'Buffett', 'Page', 'Brin', 'Jobs', 'Cook', 'Nadella',
    'Pichai', 'Huang', 'Branson', 'Ma', 'Son', 'Ambani', 'Adani', 'Arnault', 'Bettencourt', 'Walton',
    'Koch', 'Scott', 'Sandberg', 'Nooyi', 'Barra', 'Rometty', 'Catz', 'Johnson', 'Powell', 'Klatten',
    'Huffington', 'Winfrey', 'Fenty', 'Knowles', 'Kardashian', 'Jenner', 'Swift', 'Witherspoon', 'Paltrow', 'Alba',
    'Thiel', 'Hoffman', 'Andreessen', 'Horowitz', 'Graham', 'Altman', 'Buterin', 'Zhao', 'Chesky', 'Armstrong'
];

const COMPANY_PREFIXES = ['Tech', 'Global', 'Future', 'Smart', 'Eco', 'Cyber', 'Quantum', 'Neural', 'Space', 'Bio', 'Fin', 'Data', 'Cloud', 'Meta', 'Auto', 'Solar', 'Hyper', 'Omni', 'Inter', 'Star'];
const COMPANY_SUFFIXES = ['Corp', 'Inc', 'Systems', 'Solutions', 'Dynamics', 'Ventures', 'Group', 'Holdings', 'Labs', 'Technologies', 'Industries', 'Robotics', 'Energy', 'Networks', 'Logistics', 'Capital', 'Partners', 'Media', 'Soft', 'AI'];

const INDUSTRIES = ['Artificial Intelligence', 'Biotechnology', 'Fintech', 'E-commerce', 'Space Exploration', 'Green Energy', 'Electric Vehicles', 'Cloud Computing', 'Cybersecurity', 'Robotics', 'Social Media', 'Venture Capital', 'Real Estate', 'Healthcare', 'Education Technology'];
const CITIES = ['San Francisco', 'New York', 'London', 'Singapore', 'Tokyo', 'Shanghai', 'Bangalore', 'Berlin', 'Tel Aviv', 'Dubai', 'Austin', 'Seattle', 'Toronto', 'Paris', 'Stockholm'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
    return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
}

function generateCompanyName() {
    return `${getRandomItem(COMPANY_PREFIXES)}${getRandomItem(COMPANY_SUFFIXES)}`;
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
    const imageUrl = `/assets/images/business/${post.slug}.jpg`; 
    const fallbackImage = `https://placehold.co/600x400/0f172a/ffffff?text=${encodeURIComponent(post.title)}`;

    const isCompany = post.type === 'Company';
    const schemaType = isCompany ? 'Organization' : 'Person';
    
    const contextText = isCompany
        ? `a leading innovator in ${post.industry}. Founded in ${post.year}, it has revolutionized the market with its cutting-edge solutions.`
        : `a visionary ${post.role} in the ${post.industry} sector. Known for their leadership at ${post.company}, they have reshaped the industry landscape.`;

    const statsHtml = isCompany 
        ? `
            <div class="stat-box">
                <span class="stat-label">Valuation</span>
                <span class="stat-value">$${(Math.random() * 100).toFixed(1)}B</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Founded</span>
                <span class="stat-value">${post.year}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">HQ</span>
                <span class="stat-value">${post.location}</span>
            </div>`
        : `
            <div class="stat-box">
                <span class="stat-label">Net Worth</span>
                <span class="stat-value">$${(Math.random() * 50).toFixed(1)}B</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Role</span>
                <span class="stat-value">${post.role}</span>
            </div>
            <div class="stat-box">
                <span class="stat-label">Location</span>
                <span class="stat-value">${post.location}</span>
            </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} - ${post.subtitle} — MIROZA</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${post.excerpt}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content>${post.title} - ${post.subtitle}" />
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
    "@type":"${schemaType}",
    "name":"${post.title}",
    "image":"${fallbackImage}",
    "description":"${post.excerpt}",
    "url": "${canonicalUrl}"
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
  <style>
    .business-profile { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
    .business-image { border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); aspect-ratio: 16/9; background: var(--bg-alt); }
    .business-image img { width: 100%; height: 100%; object-fit: cover; }
    .business-badge { display: inline-block; background: var(--accent); color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; }
    .business-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-box { background: var(--bg-alt); padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); transition: transform 0.2s; }
    .stat-box:hover { transform: translateY(-2px); border-color: var(--primary); }
    .stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--text-main); }
    @media(min-width: 768px) {
        .business-profile { grid-template-columns: 1fr; } /* Full width image for business */
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
      
      <div class="business-profile">
        <div class="business-image">
            <!-- Tries to load local image, falls back to placeholder -->
            <img src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'" alt="${post.title}" width="800" height="450" loading="eager" />
        </div>
        <div class="business-info">
            <header style="text-align: center; margin-top: 2rem;">
                <span class="business-badge">${post.industry}</span>
                <h1 id="article-title" style="font-size: 2.5rem; margin: 1rem 0;">${post.title}</h1>
                <p class="meta">${post.subtitle} • ${post.location} • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time></p>
            </header>
            
            <div class="business-stats">
                ${statsHtml}
            </div>

            <p class="lead" style="font-size: 1.25rem; line-height: 1.6; margin-bottom: 2rem;">${post.title} is ${contextText}</p>
        </div>
      </div>

      <!-- Ad Slot: Business Middle -->
      <div class="ad-slot" data-slot="business-middle" style="margin: 2rem 0; text-align: center; min-height: 90px; background: var(--bg-alt); display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border);">
        <span style="color: var(--text-alt); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Advertisement</span>
      </div>

      <section>
        <h2>Vision and Strategy</h2>
        <p>In the rapidly evolving world of ${post.industry}, ${post.title} has maintained a competitive edge through relentless innovation and strategic foresight. The focus has always been on solving complex problems and delivering value to stakeholders.</p>
        
        <h2>Market Impact</h2>
        <p>The influence of ${post.title} extends beyond just financial metrics. It has set new benchmarks for sustainability, corporate responsibility, and technological advancement. Competitors and partners alike look to them for direction.</p>
        
        <h2>Future Outlook</h2>
        <p>As we look towards 2030, ${post.title} is poised for even greater expansion. With new initiatives in the pipeline and a strong leadership team, the future looks incredibly promising for this ${isCompany ? 'organization' : 'visionary leader'}.</p>
      </section>
    
      <!-- Newsletter Signup -->
      <div class="newsletter-signup" style="margin-top: 3rem; padding: 2rem; background: var(--bg-alt); border-radius: 8px; text-align: center;">
        <h3>Business Insights</h3>
        <p>Get the latest market trends and analysis delivered to your inbox.</p>
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
    console.log(`Starting generation of ${TOTAL_POSTS} business blogs...`);
    
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
    const generatedSlugs = new Set();

    for (let i = 0; i < TOTAL_POSTS; i++) {
        const isCompany = Math.random() > 0.4; // 60% Companies, 40% People
        let title, subtitle, role, company;
        
        if (isCompany) {
            title = generateCompanyName();
            subtitle = 'Global Enterprise';
            role = 'Organization';
            company = title;
        } else {
            title = generateName();
            company = generateCompanyName();
            role = Math.random() > 0.5 ? 'CEO' : (Math.random() > 0.5 ? 'Founder' : 'Investor');
            subtitle = `${role} of ${company}`;
        }

        // Ensure uniqueness
        let slug = slugify(`${title}-${role}-${i}`);
        
        const industry = getRandomItem(INDUSTRIES);
        const location = getRandomItem(CITIES);
        const year = Math.floor(Math.random() * (2024 - 1990 + 1)) + 1990;

        const excerpt = isCompany 
            ? `Explore the rise of ${title}, a ${industry} giant based in ${location}. Innovating since ${year}.`
            : `Meet ${title}, the visionary ${role} behind ${company}. A leader in ${industry} from ${location}.`;
        
        const post = {
            title: title,
            subtitle: subtitle,
            slug: slug,
            date: new Date().toISOString(),
            category: 'Business',
            type: isCompany ? 'Company' : 'Person',
            industry: industry,
            location: location,
            year: year,
            role: role,
            company: company,
            excerpt: excerpt,
            image: `/assets/images/business/${slug}.jpg`,
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

        if ((i + 1) % 2000 === 0) {
            console.log(`Generated ${i + 1} business blogs...`);
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts];
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${TOTAL_POSTS} business blogs in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
