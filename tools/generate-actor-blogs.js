const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const TOTAL_BLOGS = 5000;

// Data for generation
const FIRST_NAMES = [
    'Robert', 'Jennifer', 'Tom', 'Angelina', 'Brad', 'Meryl', 'Leonardo', 'Scarlett', 'Johnny', 'Julia',
    'Denzel', 'Nicole', 'Will', 'Cate', 'George', 'Sandra', 'Matt', 'Charlize', 'Ben', 'Reese',
    'Chris', 'Emma', 'Ryan', 'Anne', 'Hugh', 'Natalie', 'Christian', 'Kate', 'Keanu', 'Jessica',
    'Daniel', 'Amy', 'Liam', 'Viola', 'Idris', 'Margot', 'Joaquin', 'Gal', 'Jason', 'Zendaya',
    'Timothée', 'Florence', 'Austin', 'Ana', 'Pedro', 'Jenna', 'Paul', 'Elizabeth', 'Benedict', 'Emily',
    'Samuel', 'Morgan', 'Harrison', 'Anthony', 'Jodie', 'Viola', 'Helen', 'Gary', 'Frances', 'Julianne',
    'Mahershala', 'Lupita', 'Chadwick', 'Brie', 'Michael', 'Saoirse', 'Adam', 'Rooney', 'Rami', 'Olivia',
    'James', 'Emma', 'Robert', 'Jennifer', 'Tom', 'Angelina', 'Brad', 'Meryl', 'Leonardo', 'Scarlett',
    'Amitabh', 'Shah', 'Priyanka', 'Deepika', 'Ranveer', 'Aamir', 'Salman', 'Kareena', 'Hrithik', 'Alia',
    'Jackie', 'Bruce', 'Arnold', 'Sylvester', 'Jean-Claude', 'Jet', 'Donnie', 'Michelle', 'Chow', 'Gong'
];

const LAST_NAMES = [
    'De Niro', 'Lawrence', 'Hanks', 'Jolie', 'Pitt', 'Streep', 'DiCaprio', 'Johansson', 'Depp', 'Roberts',
    'Washington', 'Kidman', 'Smith', 'Blanchett', 'Clooney', 'Bullock', 'Damon', 'Theron', 'Affleck', 'Witherspoon',
    'Hemsworth', 'Stone', 'Reynolds', 'Hathaway', 'Jackman', 'Portman', 'Bale', 'Winslet', 'Reeves', 'Chastain',
    'Craig', 'Adams', 'Neeson', 'Davis', 'Elba', 'Robbie', 'Phoenix', 'Gadot', 'Momoa', 'Coleman',
    'Chalamet', 'Pugh', 'Butler', 'de Armas', 'Pascal', 'Ortega', 'Rudd', 'Olsen', 'Cumberbatch', 'Blunt',
    'Jackson', 'Freeman', 'Ford', 'Hopkins', 'Foster', 'Mirren', 'Oldman', 'McDormand', 'Moore',
    'Ali', 'Nyong\'o', 'Boseman', 'Larson', 'Jordan', 'Ronan', 'Driver', 'Mara', 'Malek', 'Colman',
    'Bachchan', 'Khan', 'Chopra', 'Padukone', 'Singh', 'Kapoor', 'Roshan', 'Bhatt',
    'Chan', 'Willis', 'Schwarzenegger', 'Stallone', 'Van Damme', 'Li', 'Yen', 'Yeoh', 'Yun-Fat', 'Li'
];

const BIOS = [
    "started their career in theater before moving to the big screen.",
    "is known for their versatility and deep character acting.",
    "rose to fame with a breakout role in an independent film.",
    "has won multiple awards for their contributions to cinema.",
    "is celebrated for their philanthropic work alongside their acting career.",
    "began as a child actor and successfully transitioned to adult roles.",
    "is famous for performing their own stunts in action movies.",
    "studied drama at a prestigious university before debuting in Hollywood.",
    "is considered one of the most influential figures in the industry today.",
    "has a unique acting style that has garnered a cult following."
];

const QUOTES = [
    "Acting is not about being someone different. It's finding the similarity in what is different.",
    "I love the challenge of bringing a character to life.",
    "Cinema is a mirror to society.",
    "Every role takes a piece of you, but gives you something back.",
    "The magic of movies is that they make you dream."
];

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
    
    // Using a placeholder service that supports text to simulate "Real Image" slot
    // In a real scenario, the user would replace these files.
    // We use a high-quality placeholder that looks like a portrait slot.
    const imageUrl = `/assets/images/actors/${post.slug}.jpg`; 
    const fallbackImage = `https://placehold.co/600x800/1e293b/ffffff?text=${encodeURIComponent(post.title)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} - Biography & Filmography — MIROZA</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${post.excerpt}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title} - Biography" />
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
    "jobTitle": "Actor"
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
  <style>
    .actor-profile { display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
    .actor-image { border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); aspect-ratio: 3/4; background: var(--bg-alt); }
    .actor-image img { width: 100%; height: 100%; object-fit: cover; }
    .actor-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .stat-box { background: var(--bg-alt); padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); }
    .stat-label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
    @media(min-width: 768px) {
        .actor-profile { grid-template-columns: 300px 1fr; }
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
      
      <div class="actor-profile">
        <div class="actor-image">
            <!-- Tries to load local image, falls back to placeholder -->
            <img src="${imageUrl}" onerror="this.onerror=null;this.src='${fallbackImage}'" alt="${post.title}" width="600" height="800" loading="eager" />
        </div>
        <div class="actor-info">
            <header>
                <h1 id="article-title">${post.title}</h1>
                <p class="meta">Biography • Film Industry • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time></p>
            </header>
            
            <div class="actor-stats">
                <div class="stat-box">
                    <span class="stat-label">Known For</span>
                    <span class="stat-value">Acting</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Movies</span>
                    <span class="stat-value">${Math.floor(Math.random() * 50) + 20}+</span>
                </div>
                <div class="stat-box">
                    <span class="stat-label">Awards</span>
                    <span class="stat-value">${Math.floor(Math.random() * 10)} Wins</span>
                </div>
            </div>

            <p class="lead">${post.title} ${getRandomItem(BIOS)}</p>
            <p>One of the most recognizable faces in the industry, ${post.title} has captivated audiences worldwide. "${getRandomItem(QUOTES)}" they once said in an interview, reflecting their dedication to the craft.</p>
        </div>
      </div>

      <!-- Ad Slot: Bio Middle -->
      <div class="ad-slot" data-slot="bio-middle" style="margin: 2rem 0; text-align: center; min-height: 90px; background: var(--bg-alt); display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border);">
        <span style="color: var(--text-alt); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Advertisement</span>
      </div>

      <section>
        <h2>Early Life & Career</h2>
        <p>Born with a passion for storytelling, ${post.title} pursued acting from a young age. Their journey wasn't without challenges, but persistence paid off. Early roles in television paved the way for major motion picture opportunities.</p>
        
        <h2>Notable Works</h2>
        <p>Throughout their career, they have starred in numerous blockbusters and critically acclaimed dramas. Critics often praise their ability to transform into any character, making them a sought-after talent in Hollywood and beyond.</p>
        
        <h2>Personal Life & Philanthropy</h2>
        <p>Outside of the spotlight, ${post.title} is known for their advocacy work. They support various charitable organizations and use their platform to raise awareness for important social causes.</p>
      </section>
    
      <!-- Newsletter Signup -->
      <div class="newsletter-signup" style="margin-top: 3rem; padding: 2rem; background: var(--bg-alt); border-radius: 8px; text-align: center;">
        <h3>Follow ${post.title}'s Journey</h3>
        <p>Get the latest updates on their upcoming movies and news.</p>
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
    console.log(`Starting generation of ${TOTAL_BLOGS} actor blogs...`);
    
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

    for (let i = 0; i < TOTAL_BLOGS; i++) {
        let name = generateName();
        let attempts = 0;
        while (generatedNames.has(name) && attempts < 10) {
            name = generateName();
            attempts++;
        }
        generatedNames.add(name);
        
        // Add unique ID if name collision persists
        if (attempts >= 10) name = `${name} ${i}`;

        const slug = slugify(name);
        const excerpt = `Biography, filmography, and latest news about ${name}. Discover the life and career of this talented actor.`;
        
        const post = {
            title: name,
            slug: slug,
            date: new Date().toISOString(),
            category: 'Blog',
            excerpt: excerpt,
            image: `/assets/images/actors/${slug}.jpg`, // Local path
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

        if ((i + 1) % 500 === 0) {
            console.log(`Generated ${i + 1} blogs...`);
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts];
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${TOTAL_BLOGS} blogs in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
