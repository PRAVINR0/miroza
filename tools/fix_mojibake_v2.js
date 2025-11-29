
const fs = require('fs');
const path = require('path');

const dirs = ['articles', 'news', 'blogs'];
const rootDir = path.resolve(__dirname, '..');

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && file.endsWith('.html')) {
            callback(filepath);
        }
    });
}

dirs.forEach(d => {
    const fullPath = path.join(rootDir, d);
    if (fs.existsSync(fullPath)) {
        walk(fullPath, (filepath) => {
            let content = fs.readFileSync(filepath, 'utf8');
            let original = content;

            // Fix time tag corruption
            // Pattern: ₹2025-01-12"> -> • <time datetime="2025-01-12">
            content = content.replace(/₹(\d{4}-\d{2}-\d{2})">/g, '• <time datetime="$1">');

            // Fix separator corruption
            // Pattern: —€“—‚¬&copy;¢ -> •
            content = content.replace(/—€“—‚¬&copy;¢/g, '•');

            // Fix back arrow corruption
            // Pattern: —€“—€ &copy; -> ←
            content = content.replace(/—€“—€ &copy;/g, '←');

            // Fix em dash corruption
            // Pattern: —€“—‚¬" -> —
            content = content.replace(/—€“—‚¬"/g, '—');

            // Fix double copyright
            content = content.replace(/&copy;©/g, '&copy;');

            if (content !== original) {
                fs.writeFileSync(filepath, content, 'utf8');
                console.log(`Fixed: ${path.relative(rootDir, filepath)}`);
            }
        });
    }
});
