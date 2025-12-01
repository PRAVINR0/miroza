const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = 'https://miroza.online';

const DIRS_TO_PROCESS = ['articles', 'news', 'blogs'];

function processFile(filePath, relativePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // 1. Canonical Tag
        const canonicalUrl = `${BASE_URL}/${relativePath.replace(/\\/g, '/')}`;
        if (!content.includes('<link rel="canonical"')) {
            const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
            content = content.replace('</head>', `  ${canonicalTag}\n</head>`);
            modified = true;
        }

        // 2. Open Graph Tags (Basic)
        if (!content.includes('<meta property="og:title"')) {
            // Extract title
            const titleMatch = content.match(/<title>(.*?)<\/title>/);
            const title = titleMatch ? titleMatch[1] : 'MIROZA';
            
            const ogTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${BASE_URL}/assets/images/hero-insight-800.svg" />
    <meta property="og:site_name" content="MIROZA" />`;
            
            content = content.replace('</head>', `${ogTags}\n</head>`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            // console.log(`Updated SEO for: ${relativePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.html')) {
            const relativePath = path.relative(ROOT_DIR, fullPath);
            processFile(fullPath, relativePath);
        }
    });
}

console.log('Starting SEO injection...');
DIRS_TO_PROCESS.forEach(dirName => {
    const dirPath = path.join(ROOT_DIR, dirName);
    if (fs.existsSync(dirPath)) {
        console.log(`Processing directory: ${dirName}`);
        walkDir(dirPath);
    } else {
        console.warn(`Directory not found: ${dirName}`);
    }
});
console.log('SEO injection complete.');
