const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

// Output files
const LATEST_FILE = path.join(DATA_DIR, 'latest.json');
const NEWS_FEED_FILE = path.join(DATA_DIR, 'news-feed.json');
const BLOGS_FEED_FILE = path.join(DATA_DIR, 'blogs-feed.json');
const ARTICLES_FEED_FILE = path.join(DATA_DIR, 'articles-feed.json');

console.log("Reading posts.json...");
const rawData = fs.readFileSync(POSTS_FILE, 'utf8');
const posts = JSON.parse(rawData);

console.log(`Total items: ${posts.length}`);

// Sort by date descending
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Helper to strip heavy content if present (we only need metadata for feeds)
function clean(item) {
    return {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        date: item.date,
        image: item.image,
        url: item.url || item.link || item.contentFile // Normalize URL
    };
}

// Generate Feeds
const latest = posts.slice(0, 50).map(clean);
const news = posts.filter(p => p.category === 'News' || p.category === 'India' || p.category === 'History').slice(0, 100).map(clean);
const blogs = posts.filter(p => p.category === 'Blog' || p.category === 'Invention' || p.category === 'Vehicle' || p.category === 'Movies').slice(0, 100).map(clean);
const articles = posts.filter(p => !news.find(n => n.id === p.id) && !blogs.find(b => b.id === p.id)).slice(0, 100).map(clean);

console.log(`Writing optimized feeds...`);
fs.writeFileSync(LATEST_FILE, JSON.stringify(latest, null, 2));
fs.writeFileSync(NEWS_FEED_FILE, JSON.stringify(news, null, 2));
fs.writeFileSync(BLOGS_FEED_FILE, JSON.stringify(blogs, null, 2));
fs.writeFileSync(ARTICLES_FEED_FILE, JSON.stringify(articles, null, 2));

console.log("Data optimization complete.");
