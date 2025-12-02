const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

const FEED_FILES = {
    latest: path.join(DATA_DIR, 'latest.json'),
    news: path.join(DATA_DIR, 'news-feed.json'),
    blogs: path.join(DATA_DIR, 'blogs-feed.json'),
    articles: path.join(DATA_DIR, 'articles-feed.json')
};

// Category Mappings
const CAT_MAP = {
    news: ['News', 'India', 'World', 'Politics', 'Business'],
    blogs: ['Blog', 'Finance', 'Stock Market', 'Crypto', 'Banking', 'Forex', 'Mutual Funds', 'Personal Finance', 'Science', 'Movies', 'Opinion', 'Lifestyle'],
    articles: ['Article', 'Technology', 'Health', 'Climate', 'Travel', 'Analysis', 'Deep Dive', 'Briefing']
};

function main() {
    console.log('Reading posts.json...');
    if (!fs.existsSync(POSTS_FILE)) {
        console.error('posts.json not found!');
        return;
    }

    let posts;
    try {
        posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    } catch (e) {
        console.error('Error parsing posts.json', e);
        return;
    }

    console.log(`Total posts: ${posts.length}`);

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Generate Latest Feed
    const latest = posts.slice(0, 20);
    fs.writeFileSync(FEED_FILES.latest, JSON.stringify(latest, null, 2));
    console.log(`Generated latest.json with ${latest.length} items.`);

    // Generate Specific Feeds
    const feeds = {
        news: [],
        blogs: [],
        articles: []
    };

    posts.forEach(post => {
        const cat = (post.category || 'Uncategorized').trim();
        
        // Heuristic classification
        if (CAT_MAP.news.includes(cat)) {
            feeds.news.push(post);
        } else if (CAT_MAP.articles.includes(cat)) {
            feeds.articles.push(post);
        } else {
            // Default to blogs for everything else (including Finance, Science, etc.)
            feeds.blogs.push(post);
        }
    });

    // Write Feeds
    fs.writeFileSync(FEED_FILES.news, JSON.stringify(feeds.news, null, 2));
    console.log(`Generated news-feed.json with ${feeds.news.length} items.`);

    fs.writeFileSync(FEED_FILES.blogs, JSON.stringify(feeds.blogs, null, 2));
    console.log(`Generated blogs-feed.json with ${feeds.blogs.length} items.`);

    fs.writeFileSync(FEED_FILES.articles, JSON.stringify(feeds.articles, null, 2));
    console.log(`Generated articles-feed.json with ${feeds.articles.length} items.`);

    console.log('Feed regeneration complete.');
}

main();
