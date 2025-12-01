const fs = require('fs');
const path = require('path');

const NEWS_FILE = path.join(__dirname, '../data/news.json');
const POSTS_FILE = path.join(__dirname, '../data/posts.json');

const news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));

// Filter out the 10 new India items from news.json (they are at the top)
// Or just identify them by ID prefix 'news-india-'
const newIndiaNews = news.filter(item => item.id && item.id.startsWith('news-india-'));

console.log(`Found ${newIndiaNews.length} new India news items.`);

// Add them to posts.json if not already present
let addedCount = 0;
newIndiaNews.forEach(item => {
    const exists = posts.find(p => p.id === item.id);
    if (!exists) {
        // Adapt structure if necessary (posts.json usually has title, excerpt, slug/url, image, category)
        const postEntry = {
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            url: `/news/${item.slug}.html`, // Ensure URL format matches
            image: item.image,
            category: "India News",
            date: item.date,
            tags: ["India", "News", "2025"]
        };
        posts.unshift(postEntry); // Add to top
        addedCount++;
    }
});

fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
console.log(`Added ${addedCount} items to main index.`);
