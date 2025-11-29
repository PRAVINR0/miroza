const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://miroza.online';
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const POSTS_PATH = path.join(DATA_DIR, 'posts.json');

function getPosts() {
    if (!fs.existsSync(POSTS_PATH)) return [];
    return JSON.parse(fs.readFileSync(POSTS_PATH, 'utf-8'));
}

function generateSitemap(posts) {
    const staticPages = [
        '', 'about.html', 'contact.html', 'privacy.html', 
        'news/news.html', 'articles/articles.html', 'blogs/blogs.html'
    ];

    const urls = [
        ...staticPages.map(p => ({
            loc: `${SITE_URL}/${p}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: p === '' ? '1.0' : '0.8'
        })),
        ...posts.map(p => ({
            loc: `${SITE_URL}${p.link || (p.slug ? (p.category === 'Blog' ? `/blogs/${p.slug}.html` : `/articles/${p.slug}.html`) : '/')}`,
            lastmod: (p.date || new Date().toISOString()).split('T')[0],
            changefreq: 'weekly',
            priority: '0.6'
        }))
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), xml);
    console.log(`✅ sitemap.xml generated with ${urls.length} URLs.`);
}

function generateRSS(posts) {
    const feedItems = posts.slice(0, 20).map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE_URL}${p.link || (p.slug ? (p.category === 'Blog' ? `/blogs/${p.slug}.html` : `/articles/${p.slug}.html`) : '/')}</link>
      <guid>${SITE_URL}${p.link || (p.slug ? (p.category === 'Blog' ? `/blogs/${p.slug}.html` : `/articles/${p.slug}.html`) : '/')}</guid>
      <pubDate>${new Date(p.date || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
    </item>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>MIROZA</title>
  <link>${SITE_URL}</link>
  <description>Modern News &amp; Articles Hub</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
  ${feedItems}
</channel>
</rss>`;

    fs.writeFileSync(path.join(ROOT_DIR, 'rss.xml'), xml);
    console.log(`✅ rss.xml generated with ${posts.slice(0, 20).length} recent items.`);
}

function main() {
    console.log('Starting SEO Build...');
    const posts = getPosts();
    generateSitemap(posts);
    generateRSS(posts);
}

main();
