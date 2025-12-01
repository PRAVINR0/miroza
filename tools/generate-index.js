const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

const DIRECTORIES = [
    { path: 'articles', category: 'Technology' },
    { path: 'blogs', category: 'Blog' },
    { path: 'news', category: 'News' }
];

function parseFile(filePath, defaultCategory) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip index/list pages
        if (filePath.endsWith('index.html') || filePath.endsWith('articles.html') || filePath.endsWith('blogs.html') || filePath.endsWith('news.html')) {
            return null;
        }

        // Regex Extraction
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        let title = titleMatch ? titleMatch[1].split('—')[0].trim() : path.basename(filePath, '.html').replace(/-/g, ' ');

        const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        const excerpt = descMatch ? descMatch[1] : '';

        const dateMatch = content.match(/<time\s+datetime="(.*?)"/i) || content.match(/<meta\s+property="article:published_time"\s+content="(.*?)"/i);
        let date = dateMatch ? dateMatch[1] : '';

        if (!date) {
             const filename = path.basename(filePath);
             const fileDateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
             if (fileDateMatch) {
                 date = fileDateMatch[1];
             } else {
                 const stats = fs.statSync(filePath);
                 date = stats.mtime.toISOString().split('T')[0];
             }
        }

        const imgMatch = content.match(/<meta\s+property="og:image"\s+content="(.*?)"/i) || content.match(/<img\s+[^>]*src="(.*?)"/i);
        const image = imgMatch ? imgMatch[1] : '';

        // Category from meta or default
        // Try to find "Category: <a ...>Name</a>" pattern often used in my templates
        const catMatch = content.match(/Category:\s*<a[^>]*>(.*?)<\/a>/i);
        let category = catMatch ? catMatch[1].trim() : defaultCategory;

        const slug = path.basename(filePath, '.html');
        const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

        return {
            title,
            slug,
            date,
            category,
            excerpt,
            image,
            link: '/' + relativePath,
            contentFile: '/' + relativePath
        };

    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return null;
    }
}

function generateIndex() {
    let allPosts = [];

    DIRECTORIES.forEach(dir => {
        const dirPath = path.join(ROOT_DIR, dir.path);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
            console.log(`Scanning ${dir.path}: ${files.length} files found.`);
            
            files.forEach(file => {
                const post = parseFile(path.join(dirPath, file), dir.category);
                if (post) {
                    allPosts.push(post);
                }
            });
        }
    });

    // Sort by date desc
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Ensure data dir exists
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
    }

    fs.writeFileSync(POSTS_FILE, JSON.stringify(allPosts, null, 2));
    console.log(`Successfully generated index with ${allPosts.length} posts.`);
}

generateIndex();
