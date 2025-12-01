const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../news');
const IMG_DIR = path.join(__dirname, '../assets/images/history');
const DATA_FILE = path.join(__dirname, '../data/posts.json');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

// --- Configuration ---
const TOTAL_ITEMS = 10000;
const IMAGE_POOL_SIZE = 50;

// --- Data Sources for Generation ---
const COUNTRIES = ["USA", "USSR", "UK", "France", "Germany", "Japan", "China", "India", "Brazil", "Egypt", "South Africa", "Australia", "Canada", "Italy", "Argentina"];
const CITIES = ["New York", "London", "Moscow", "Paris", "Berlin", "Tokyo", "Beijing", "New Delhi", "Cairo", "Sydney", "Rome", "Buenos Aires", "Rio de Janeiro"];
const TOPICS = ["Politics", "Science", "Conflict", "Economy", "Culture", "Sports", "Technology"];

const VERBS = ["Signs", "Announces", "Launches", "Rejects", "Discovers", "Wins", "Loses", "Unveils", "Protests", "Celebrates", "Condemns", "Ratifies", "Builds", "Destroys"];
const NOUNS = ["Treaty", "Agreement", "Satellite", "Policy", "Monument", "Election", "Reform", "Budget", "Alliance", "Trade Deal", "Peace Plan", "Invention"];
const ADJECTIVES = ["Historic", "Controversial", "Massive", "Unexpected", "Major", "New", "Global", "Secret", "Revolutionary", "Unprecedented"];

const TEMPLATES = [
    "{Country} {Verb} {Adjective} {Noun}",
    "{Adjective} {Noun} {Verb} in {City}",
    "{Country} and {Country} {Verb} {Noun}",
    "World Leaders {Verb} {Adjective} {Noun} in {City}",
    "{City} {Verb} {Adjective} {Noun} Amidst Crisis",
    "Scientific Community {Verb} {Adjective} {Noun}",
    "{Country} {Verb} New Era of {Topic}"
];

// --- Helper Functions ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate() {
    // Generate date between 1950 and 1999
    const year = randomInt(1950, 1999);
    const month = randomInt(0, 11);
    const day = randomInt(1, 28);
    return new Date(year, month, day).toISOString();
}

function generateHeadline() {
    const template = randomItem(TEMPLATES);
    return template
        .replace(/{Country}/g, () => randomItem(COUNTRIES))
        .replace(/{City}/g, () => randomItem(CITIES))
        .replace(/{Verb}/g, () => randomItem(VERBS))
        .replace(/{Noun}/g, () => randomItem(NOUNS))
        .replace(/{Adjective}/g, () => randomItem(ADJECTIVES))
        .replace(/{Topic}/g, () => randomItem(TOPICS));
}

function generateContent(title, date, topic) {
    const year = new Date(date).getFullYear();
    const city = randomItem(CITIES);
    
    // Generate ~800-1000 words of "news-like" filler
    // We will use a structure of repeated paragraphs with variable inserts to simulate length without storing 10GB of text.
    
    let content = `<p class="lead"><strong>${city.toUpperCase()}, ${year}:</strong> In a development that has captured the attention of the world, ${title}. This event marks a pivotal moment in the history of ${topic}, reshaping the landscape of the late 20th century.</p>`;
    
    content += `<h2>The Unfolding Events</h2>`;
    content += `<p>Reports coming in from ${city} suggest that the atmosphere is electric. Eyewitnesses describe a scene of intense activity as officials and citizens alike react to the news. "It is something we never thought we would see in our lifetime," said one local resident, reflecting the general sentiment of surprise and awe.</p>`;
    content += `<p>The decision to proceed with this initiative was reportedly made after months of secret deliberations. Sources close to the matter indicate that the leadership in ${randomItem(COUNTRIES)} played a crucial role in brokering the deal, ensuring that all parties were aligned before the public announcement.</p>`;

    content += `<h2>Historical Context</h2>`;
    content += `<p>To understand the magnitude of this event, one must look back at the preceding decades. The post-war era has been defined by a struggle for dominance and progress. This latest development in ${topic} is a direct continuation of that narrative. Historians argue that this could be the defining moment of the ${Math.floor(year/10)}0s.</p>`;
    content += `<p>Previously, attempts to achieve similar outcomes had failed due to lack of consensus. However, the changing geopolitical climate of ${year} has evidently created a window of opportunity that was seized upon by visionary leaders.</p>`;

    content += `<h2>Global Reactions</h2>`;
    content += `<p>The international community has responded with a mix of optimism and caution. The United Nations has issued a statement calling for calm and cooperation. Meanwhile, markets in London and New York reacted sharply, with indices fluctuating as traders digested the implications of the news.</p>`;
    content += `<p>In ${randomItem(COUNTRIES)}, the government has convened an emergency session to discuss the impact. "We stand ready to support our allies and navigate this new reality," stated the Foreign Minister during a press conference earlier today.</p>`;

    // Filler loop to ensure length
    const subheadings = ["Economic Impact", "Social Repercussions", "Technological Aspects", "Future Outlook", "Expert Opinions"];
    
    subheadings.forEach(sub => {
        content += `<h3>${sub}</h3>`;
        content += `<p>Turning to the <strong>${sub}</strong>, the ramifications are extensive. Experts predict that this will lead to a significant shift in how resources are allocated. For the average citizen, this could mean changes in daily life that were previously unimaginable.</p>`;
        content += `<p>Furthermore, the ${sub} cannot be viewed in isolation. It is deeply interconnected with the broader trends of the era. As we move closer to the new millennium, events like these serve as markers of our progress—and our challenges.</p>`;
        content += `<p>One analyst noted, "The ${sub} of this event will be studied for generations. It is a textbook example of how ${topic} intersects with human ambition."</p>`;
    });

    content += `<h2>Conclusion</h2>`;
    content += `<p>As the dust settles on this historic day in ${year}, one thing is clear: the world has changed. The ${title} will undoubtedly go down in history as a turning point. MIROZA Archives will continue to preserve the record of these times for future generations.</p>`;

    return content;
}

function generateSVG(index) {
    // Generate a "Sepia" or "Black and White" style image
    const hue = randomInt(20, 40); // Sepia-ish
    const sat = randomInt(20, 60);
    const light = randomInt(40, 80);
    const color = `hsl(${hue}, ${sat}%, ${light}%)`;
    
    return `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="450" fill="${color}" />
  <rect x="0" y="0" width="800" height="450" fill="url(#grain)" opacity="0.2" />
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
    </filter>
  </defs>
  <text x="400" y="225" font-family="Courier New, monospace" font-size="40" fill="#333" text-anchor="middle" dy=".3em" style="opacity: 0.7">ARCHIVE FOOTAGE ${1900 + index}</text>
  <text x="780" y="430" font-family="Courier New, monospace" font-size="20" fill="#333" text-anchor="end">MIROZA HISTORY</text>
</svg>`;
}

// --- Main Execution ---

console.log("Starting generation of 10,000 historical news items...");

// 1. Generate Image Pool
console.log("Generating image pool...");
const imagePool = [];
for (let i = 0; i < IMAGE_POOL_SIZE; i++) {
    const svg = generateSVG(i);
    const filename = `history-${i}.svg`;
    fs.writeFileSync(path.join(IMG_DIR, filename), svg);
    imagePool.push(`/assets/images/history/${filename}`);
}

// 2. Generate Articles
let posts = [];
try {
    posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (e) {
    console.log("Creating new posts array.");
}

const newPosts = [];

for (let i = 0; i < TOTAL_ITEMS; i++) {
    const date = generateDate();
    const headline = generateHeadline();
    const slug = `history-${i}-${headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    const topic = randomItem(TOPICS);
    const image = randomItem(imagePool);
    
    const content = generateContent(headline, date, topic);
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline} — MIROZA Archives</title>
  <link rel="icon" type="image/svg+xml" href="/assets/icons/logo.svg" />
  <meta name="description" content="Historical Archive: ${headline}. Coverage from ${new Date(date).getFullYear()}." />
  <link rel="stylesheet" href="/styles/main.min.css" />
</head>
<body data-page="news-article">
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/">
        <img src="/assets/icons/logo.svg" alt="MIROZA" width="32" height="32" />
        <span class="logo-text">MIROZA</span>
      </a>
      <nav class="main-nav">
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/news/news.html">News</a></li>
          <li><a href="/articles/articles.html">Articles</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main id="main">
    <article class="single-article">
      <div class="content-navigation"><a href="/news/news.html" class="btn-back">← Back to News</a></div>
      <header>
        <h1>${headline}</h1>
        <p class="meta">By MIROZA Archives • <time datetime="${date}">${new Date(date).toLocaleDateString()}</time> • ${topic}</p>
      </header>
      <figure>
        <img src="${image}" alt="${headline}" width="800" height="450" loading="lazy" />
        <figcaption>Archival Image: ${headline}</figcaption>
      </figure>
      <div class="article-content">${content}</div>
    </article>
  </main>
  <footer class="site-footer"><div class="copyright">&copy; 2025 MIROZA. All rights reserved.</div></footer>
  <script src="/scripts/app.min.js" defer></script>
</body>
</html>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html);

    newPosts.push({
        id: `history-${i}`,
        title: headline,
        excerpt: `Archival Report (${new Date(date).getFullYear()}): ${headline}. A look back at this significant historical event.`,
        url: `/news/${slug}.html`,
        image: image,
        category: "History",
        date: date,
        tags: ["History", topic, "Archive"]
    });

    if (i % 1000 === 0) console.log(`Generated ${i} articles...`);
}

// 3. Update Index
const allPosts = [...newPosts, ...posts];
fs.writeFileSync(DATA_FILE, JSON.stringify(allPosts, null, 2));

console.log(`Completed! Generated ${TOTAL_ITEMS} historical news items.`);
