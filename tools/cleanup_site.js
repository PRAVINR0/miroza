const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. Delete Folders
const foldersToDelete = [
    'backup',
    'jules-reports',
    'logs',
    '.lh-temp',
    '.lh-temp2',
    'js'
];

foldersToDelete.forEach(folder => {
    const folderPath = path.join(root, folder);
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted folder: ${folder}`);
    }
});

// 2. Delete Root Files
const rootFilesToDelete = [
    'REVIEW_REPORT.txt',
    'REVIEW_SMOKE.json',
    'review.txt',
    'lh-report.json',
    'DEV_SETUP.md' // User said "remove what ever is unwanted", usually dev setup is for devs, but maybe they want clean. I'll keep README.
];

rootFilesToDelete.forEach(file => {
    const filePath = path.join(root, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${file}`);
    }
});

// 3. Delete Content Files by Pattern
const contentDeletions = [
    { dir: 'articles', patterns: [/^article-\d+\.html$/, /^in-depth-guide-.*\.html$/] },
    { dir: 'blogs', patterns: [/^blog-.*\.html$/, /^undefined-expanded\.html$/] },
    { dir: 'news', patterns: [/^news-.*\.html$/] }
];

contentDeletions.forEach(item => {
    const dirPath = path.join(root, item.dir);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (item.patterns.some(p => p.test(file))) {
                fs.unlinkSync(path.join(dirPath, file));
                console.log(`Deleted content: ${item.dir}/${file}`);
            }
        });
    }
});

// 4. Delete Generator Scripts
const toolsToDelete = [
    'generate-100-articles.js',
    'generate-100-blogs.js',
    'generate-placeholders.js',
    'generate_blogs.py'
];

const toolsDir = path.join(root, 'tools');
if (fs.existsSync(toolsDir)) {
    toolsToDelete.forEach(tool => {
        const toolPath = path.join(toolsDir, tool);
        if (fs.existsSync(toolPath)) {
            fs.unlinkSync(toolPath);
            console.log(`Deleted tool: ${tool}`);
        }
    });
}
