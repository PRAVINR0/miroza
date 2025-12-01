const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const TOTAL_ARTICLES = 20000;
const BATCH_SIZE = 1000;

// Topics for generation
const TOPICS = {
    ancient: ['Ancient Egypt', 'Roman Empire', 'Mesopotamia', 'Indus Valley', 'Mayan Civilization', 'Greek Philosophy', 'Ancient Technology', 'Lost Cities', 'Mythology', 'Archaeology'],
    society: ['Social Structures', 'Cultural Evolution', 'Modern Relationships', 'Urban Living', 'Global Communities', 'Digital Society', 'Education Systems', 'Workplace Dynamics', 'Family Traditions', 'Social Justice'],
    psychology: ['Cognitive Bias', 'Emotional Intelligence', 'Child Development', 'Mental Health', 'Behavioral Science', 'Dream Analysis', 'Personality Types', 'Social Psychology', 'Neuroscience', 'Mindfulness'],
    general: ['Future Trends', 'Sustainable Living', 'Space Exploration', 'Artificial Intelligence', 'Health & Wellness', 'Economic Shifts', 'Art History', 'Music Theory', 'Culinary Arts', 'Travel Diaries']
};

const ADJECTIVES = ['Hidden', 'Forgotten', 'Modern', 'Secret', 'Essential', 'Revolutionary', 'Mysterious', 'Impactful', 'Transformative', 'Timeless'];
const NOUNS = ['Truths', 'Discoveries', 'Perspectives', 'Systems', 'Innovations', 'Traditions', 'Mysteries', 'Strategies', 'Insights', 'Lessons'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle() {
    const category = getRandomItem(Object.keys(TOPICS));
    const topic = getRandomItem(TOPICS[category]);
    const adj = getRandomItem(ADJECTIVES);
    const noun = getRandomItem(NOUNS);
    return {
        title: `The ${adj} ${noun} of ${topic}`,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        topic: topic
    };
}

function generateContent(title, topic) {
    return `
      <section>
        <p>In the realm of <strong>${topic}</strong>, few things are as compelling as the concept of ${title.toLowerCase()}. This article explores the deep connections between our past and present, shedding light on how ${topic} continues to shape our world.</p>
        <h2>The Historical Context</h2>
        <p>To understand ${title}, we must first look back. Historians and experts have long debated the significance of ${topic} in the broader context of human development. From ancient texts to modern studies, the evidence suggests a complex interplay of factors.</p>
        <h2>Modern Implications</h2>
        <p>Today, we see the echoes of these ancient principles in our daily lives. Whether it's through social structures, psychological patterns, or technological advancements, the legacy of ${topic} remains undeniable.</p>
        <h2>Key Takeaways</h2>
        <ul>
            <li>Understanding the roots of ${topic} helps us navigate the future.</li>
            <li>The ${title.toLowerCase()} offers a unique lens through which to view society.</li>
            <li>Innovation often stems from rediscovering forgotten wisdom.</li>
        </ul>
        <p>As we move forward, it is crucial to keep these insights in mind. The study of ${topic} is not just about the past; it is a roadmap for the future.</p>
      </section>
    `;
}

function generateHTML(post) {
    const canonicalUrl = `https://miroza.online/articles/${post.slug}.html`;
    const dateStr = new Date().toISOString().split('T')[0];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} — MIROZA</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="${post.excerpt}" />
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.excerpt}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://miroza.online/assets/images/hero-insight-800.svg" />
  <meta property="og:site_name" content="MIROZA" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${post.excerpt}" />
  <meta name="twitter:image" content="https://miroza.online/assets/images/hero-insight-800.svg" />
  
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://plausible.io; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests;" />
  
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":"${post.title}",
    "image":"https://miroza.online/assets/images/hero-insight-800.svg",
    "datePublished":"${dateStr}",
    "author":{"@type":"Person","name":"MIROZA Editorial"},
    "publisher":{"@type":"Organization","name":"MIROZA","logo":{"@type":"ImageObject","url":"https://miroza.online/assets/icons/logo.svg"}},
    "description":"${post.excerpt}",
    "articleSection":"${post.category}"
  }
  </script>
  <link rel="stylesheet" href="/styles/main.min.css" />
</head>
<body data-page="article">
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
        <a href="/articles/articles.html" class="btn-back">
          <span class="icon-arrow-left">←</span> Back to Articles
        </a>
      </div>
      <header>
        <h1 id="article-title">${post.title}</h1>
        <p class="meta">By <span class="author">MIROZA Editorial</span> • <time datetime="${dateStr}">${new Date().toLocaleDateString()}</time> • Category: <a href="/articles/articles.html">${post.category}</a></p>
      </header>
      <figure>
        <img src="/assets/images/hero-insight-800.svg" alt="${post.title}" width="800" height="450" loading="lazy" />
        <figcaption>Visual representation of ${post.topic}</figcaption>
      </figure>

      <!-- Ad Slot: Article Top -->
      <div class="ad-slot" data-slot="article-top" style="margin: 2rem 0; text-align: center; min-height: 90px; background: var(--bg-alt); display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border);">
        <span style="color: var(--text-alt); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Advertisement</span>
      </div>

      ${post.content}
    
      <!-- Newsletter Signup -->
      <div class="newsletter-signup" style="margin-top: 3rem; padding: 2rem; background: var(--bg-alt); border-radius: 8px; text-align: center;">
        <h3>Stay Updated</h3>
        <p>Get the latest stories delivered to your inbox weekly.</p>
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

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
    console.log(`Starting generation of ${TOTAL_ARTICLES} articles...`);
    
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

    for (let i = 0; i < TOTAL_ARTICLES; i++) {
        const { title, category, topic } = generateTitle();
        // Add random suffix to ensure uniqueness
        const uniqueTitle = `${title} ${Math.floor(Math.random() * 10000)}`;
        const slug = slugify(uniqueTitle);
        const excerpt = `Explore the fascinating world of ${topic} and discover the ${title.toLowerCase()} in this in-depth analysis.`;
        const content = generateContent(uniqueTitle, topic);
        
        const post = {
            title: uniqueTitle,
            slug: slug,
            date: new Date().toISOString(),
            category: category,
            excerpt: excerpt,
            content: content, // For HTML generation
            topic: topic,
            image: '/assets/images/hero-insight-800.svg',
            link: `/articles/${slug}.html`
        };

        // Write HTML file
        const html = generateHTML(post);
        fs.writeFileSync(path.join(ARTICLES_DIR, `${slug}.html`), html);

        // Add to index (lightweight version)
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
            console.log(`Generated ${i + 1} articles...`);
        }
    }

    // Merge and Save
    const allPosts = [...newPosts, ...posts]; // Newest first
    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Completed! Generated ${TOTAL_ARTICLES} articles in ${duration}s.`);
    console.log(`Total posts in database: ${allPosts.length}`);
}

main();
