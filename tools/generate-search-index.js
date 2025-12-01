const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const POSTS_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const SEARCH_INDEX_FILE = path.join(ROOT_DIR, 'data', 'search.json');

async function main() {
    console.log('Generating optimized search index...');
    
    if (!fs.existsSync(POSTS_FILE)) {
        console.error('posts.json not found!');
        return;
    }

    const rawData = fs.readFileSync(POSTS_FILE, 'utf8');
    const posts = JSON.parse(rawData);

    // Map to minimal structure: t=title, c=category, u=url (link)
    const searchIndex = posts.map(p => ({
        t: p.title,
        c: p.category,
        u: p.link || p.url
    }));

    fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex));
    
    const originalSize = fs.statSync(POSTS_FILE).size / (1024 * 1024);
    const newSize = fs.statSync(SEARCH_INDEX_FILE).size / (1024 * 1024);

    console.log(`Search index generated!`);
    console.log(`Original: ${originalSize.toFixed(2)} MB`);
    console.log(`Optimized: ${newSize.toFixed(2)} MB`);
}

main();
