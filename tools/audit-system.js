const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BLOGS_DIR = path.join(ROOT_DIR, 'blogs');
const ARTICLES_DIR = path.join(ROOT_DIR, 'articles');
const NEWS_DIR = path.join(ROOT_DIR, 'news');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const FEEDS = ['latest.json', 'news-feed.json', 'blogs-feed.json', 'articles-feed.json'];

function checkFileExists(filePath) {
    return fs.existsSync(filePath);
}

function countFiles(dir) {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter(f => f.endsWith('.html')).length;
}

function validateJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        return { valid: true, count: Array.isArray(json) ? json.length : 0 };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

function validateSitemap(filePath) {
    if (!fs.existsSync(filePath)) return { exists: false };
    const content = fs.readFileSync(filePath, 'utf8');
    const isIndex = content.includes('<sitemapindex');
    const isUrlSet = content.includes('<urlset');
    const count = (content.match(/<loc>/g) || []).length;
    return { exists: true, isIndex, isUrlSet, count };
}

function sampleHtmlValidation(dir, sampleSize = 3) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    const samples = [];
    
    for (let i = 0; i < sampleSize; i++) {
        if (files.length === 0) break;
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const content = fs.readFileSync(path.join(dir, randomFile), 'utf8');
        
        const hasDoctype = content.includes('<!DOCTYPE html>');
        const hasTitle = content.includes('<title>');
        const hasCanonical = content.includes('<link rel="canonical"');
        const hasSchema = content.includes('application/ld+json');
        
        samples.push({ file: randomFile, hasDoctype, hasTitle, hasCanonical, hasSchema });
    }
    return samples;
}

async function audit() {
    console.log('=== MIROZA SYSTEM AUDIT ===\n');

    // 1. File Counts
    console.log('--- Content Directories ---');
    const blogsCount = countFiles(BLOGS_DIR);
    const articlesCount = countFiles(ARTICLES_DIR);
    const newsCount = countFiles(NEWS_DIR);
    console.log(`Blogs: ${blogsCount}`);
    console.log(`Articles: ${articlesCount}`);
    console.log(`News: ${newsCount}`);
    console.log(`Total HTML Files: ${blogsCount + articlesCount + newsCount}`);
    console.log('');

    // 2. Data Integrity
    console.log('--- Data Feeds ---');
    const postsCheck = validateJSON(POSTS_FILE);
    console.log(`posts.json: ${postsCheck.valid ? 'VALID' : 'INVALID'} (${postsCheck.count} items)`);
    
    FEEDS.forEach(feed => {
        const feedPath = path.join(DATA_DIR, feed);
        if (checkFileExists(feedPath)) {
            const check = validateJSON(feedPath);
            console.log(`${feed}: VALID (${check.count} items)`);
        } else {
            console.log(`${feed}: MISSING`);
        }
    });
    console.log('');

    // 3. Sitemaps
    console.log('--- Sitemaps ---');
    const indexCheck = validateSitemap(path.join(ROOT_DIR, 'sitemap.xml'));
    console.log(`sitemap.xml (Index): ${indexCheck.exists ? 'EXISTS' : 'MISSING'} (Links to ${indexCheck.count} sitemaps)`);

    let sitemapIndex = 1;
    while (true) {
        const sitemapPath = path.join(ROOT_DIR, `sitemap-${sitemapIndex}.xml`);
        if (!fs.existsSync(sitemapPath)) break;
        const check = validateSitemap(sitemapPath);
        console.log(`sitemap-${sitemapIndex}.xml: ${check.exists ? 'EXISTS' : 'MISSING'} (${check.count} URLs)`);
        sitemapIndex++;
    }
    console.log('');

    // 4. Asset Directories
    console.log('--- Assets ---');
    const imageDirs = ['winners', 'business', 'actors'];
    imageDirs.forEach(dir => {
        const dirPath = path.join(ASSETS_DIR, 'images', dir);
        console.log(`assets/images/${dir}: ${fs.existsSync(dirPath) ? 'EXISTS' : 'MISSING'}`);
    });
    console.log('');

    // 5. HTML Validation
    console.log('--- HTML Validation (Random Samples) ---');
    const blogSamples = sampleHtmlValidation(BLOGS_DIR);
    console.log('Blogs Samples:');
    blogSamples.forEach(s => console.log(`  [${s.file}] DOCTYPE:${s.hasDoctype} TITLE:${s.hasTitle} CANONICAL:${s.hasCanonical} SCHEMA:${s.hasSchema}`));
    
    console.log('\nAudit Complete.');
}

audit();
