const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/posts.json');

console.log("Loading search index...");
const startLoad = Date.now();
const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const endLoad = Date.now();
console.log(`Index loaded in ${endLoad - startLoad}ms. Total items: ${posts.length}`);

function search(query) {
    const start = Date.now();
    const q = query.toLowerCase();
    const results = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);
    const end = Date.now();
    
    console.log(`\nSearch for "${query}": Found ${results.length} results in ${end - start}ms`);
    results.forEach(r => console.log(` - [${r.category}] ${r.title}`));
}

// Test Queries
search("BMW");
search("Samurai");
search("Invention");
search("Treaty");
search("India");
