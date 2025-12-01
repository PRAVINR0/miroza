const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT_DIR, 'data', 'posts.json');
const BASE_URL = 'https://miroza.online';
const CHUNK_SIZE = 40000; // Safe limit (max is 50,000)

function generateSitemaps() {
    console.log('Reading posts data...');
    if (!fs.existsSync(DATA_FILE)) {
        console.error('Error: data/posts.json not found.');
        return;
    }

    const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const totalPosts = posts.length;
    console.log(`Total items to process: ${totalPosts}`);

    // Add static pages
    const staticUrls = [
        '/',
        '/index.html',
        '/about.html',
        '/contact.html',
        '/privacy.html',
        '/news/news.html',
        '/articles/articles.html',
        '/blogs/blogs.html'
    ];

    // Combine all URLs
    let allUrls = staticUrls.map(url => ({
        loc: `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8'
    }));

    posts.forEach(post => {
        let link = post.link || post.url;
        if (!link && post.slug) {
            const cat = (post.category || '').toLowerCase();
            if (cat === 'blog') link = `/blogs/${post.slug}.html`;
            else if (cat === 'news') link = `/news/${post.slug}.html`;
            else link = `/articles/${post.slug}.html`;
        }
        
        if (link) {
            allUrls.push({
                loc: `${BASE_URL}${link.startsWith('/') ? link : '/' + link}`,
                lastmod: post.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.6'
            });
        }
    });

    // Split into chunks
    const chunks = [];
    for (let i = 0; i < allUrls.length; i += CHUNK_SIZE) {
        chunks.push(allUrls.slice(i, i + CHUNK_SIZE));
    }

    console.log(`Splitting into ${chunks.length} sitemaps...`);

    // Generate Sitemap Files
    chunks.forEach((chunk, index) => {
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        const fileName = `sitemap-${index + 1}.xml`;
        fs.writeFileSync(path.join(ROOT_DIR, fileName), sitemapContent);
        console.log(`Created ${fileName} (${chunk.length} URLs)`);
    });

    // Generate Sitemap Index
    const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, index) => `  <sitemap>
    <loc>${BASE_URL}/sitemap-${index + 1}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), sitemapIndexContent);
    console.log('Created sitemap.xml (Index)');
}

generateSitemaps();
