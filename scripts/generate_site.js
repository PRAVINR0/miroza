#!/usr/bin/env node
/*
  generate_site.js
  Reads `assets/data/*.json` and generates:
    - assets/data/search-index.json
    - sitemap.xml (root)
    - feed-news.xml (RSS for news)
    - feed.xml (combined recent items)
    - tags/<tag>.html and categories/<category>.html (simple listings)

  Designed to run in CI (GitHub Actions) or locally (Node 16+).
*/

const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const OUT_SITEMAP = path.join(ROOT, 'sitemap.xml');
const OUT_FEED_NEWS = path.join(ROOT, 'feed-news.xml');
const OUT_FEED = path.join(ROOT, 'feed.xml');
const OUT_SEARCH = path.join(DATA_DIR, 'search-index.json');
const TAGS_DIR = path.join(ROOT, 'tags');
const CATS_DIR = path.join(ROOT, 'categories');

function safeSlug(s){ return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function escapeXml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function readJsonFiles(){
  const files = await fs.readdir(DATA_DIR);
  const objs = {};
  for(const f of files){
    if(!f.endsWith('.json')) continue;
    const p = path.join(DATA_DIR,f);
    try{
      const txt = await fs.readFile(p,'utf8');
      objs[f] = JSON.parse(txt);
    }catch(err){ console.warn('Failed to read',p,err.message); objs[f] = []; }
  }
  return objs;
}

async function writeIfChanged(file, content){
  try{
    const old = await fs.readFile(file,'utf8');
    if(old === content) return false;
  }catch(e){}
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, 'utf8');
  return true;
}

async function generate(){
  const dataFiles = await readJsonFiles();
  const items = []; // all items
  const newsItems = [];
  const tagsMap = {};
  const catsMap = {};

  for(const fname of Object.keys(dataFiles)){
    const type = fname.replace(/\.json$/, '');
    const arr = Array.isArray(dataFiles[fname]) ? dataFiles[fname] : [];
    for(const it of arr){
      const item = Object.assign({}, it, { type });
      items.push(item);
      if(type === 'news') newsItems.push(item);
      // tags
      (it.tags || []).forEach(t=>{ const key = String(t||'').toLowerCase(); tagsMap[key] = tagsMap[key] || []; tagsMap[key].push(item); });
      // categories
      const c = (it.category || '').toLowerCase(); if(c){ catsMap[c] = catsMap[c] || []; catsMap[c].push(item); }
    }
  }

  // Sort items by date desc
  items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  newsItems.sort((a,b)=> (b.date||'').localeCompare(a.date||''));

  // search-index
  const searchIndex = items.map(it=>({ id: it.id, title: it.title, slug: it.slug, type: it.type, tags: it.tags||[], category: it.category||'', date: it.date||'', description: it.description||'' }));
  await writeIfChanged(OUT_SEARCH, JSON.stringify(searchIndex, null, 2));

  // sitemap
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/index.html', priority: '1.0' },
    { loc: '/news.html', priority: '0.8' },
    { loc: '/blog.html', priority: '0.8' },
    { loc: '/articles.html', priority: '0.8' },
    { loc: '/stories.html', priority: '0.8' },
    { loc: '/info.html', priority: '0.8' },
    { loc: '/search.html', priority: '0.5' }
  ];
  // add detail urls
  for(const it of items){
    const slug = it.slug || safeSlug(it.title || ('id-'+String(it.id||'')));
    const loc = `/detail.html?type=${encodeURIComponent(it.type)}&id=${encodeURIComponent(it.id)}&slug=${encodeURIComponent(slug)}`;
    urls.push({ loc, lastmod: it.date || '', priority: '0.6' });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>{
    return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ''}\n    <priority>${u.priority}</priority>\n  </url>`
  }).join('\n')}\n</urlset>\n`;
  await writeIfChanged(OUT_SITEMAP, sitemapXml);

  // feed-news.xml (RSS 2.0)
  function buildItemXml(it){
    const title = escapeXml(it.title || '');
    const link = escapeXml(`/detail.html?type=${encodeURIComponent(it.type)}&id=${encodeURIComponent(it.id)}&slug=${encodeURIComponent(it.slug||'')}`);
    const pubDate = it.date ? new Date(it.date).toUTCString() : new Date().toUTCString();
    const desc = escapeXml(it.description || it.content || '');
    return `  <item>\n    <title>${title}</title>\n    <link>${link}</link>\n    <guid isPermaLink="false">${it.type}-${it.id}</guid>\n    <pubDate>${pubDate}</pubDate>\n    <description>${desc}</description>\n  </item>`;
  }

  const newsFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>Miroza - News</title>\n  <link>/</link>\n  <description>Latest news from Miroza</description>\n${newsItems.slice(0,50).map(buildItemXml).join('\n')}\n</channel>\n</rss>\n`;
  await writeIfChanged(OUT_FEED_NEWS, newsFeed);

  // combined feed (recent 50 across all types)
  const recent = items.slice(0,50);
  const combined = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>Miroza - Recent</title>\n  <link>/</link>\n  <description>Recent posts across Miroza</description>\n${recent.map(buildItemXml).join('\n')}\n</channel>\n</rss>\n`;
  await writeIfChanged(OUT_FEED, combined);

  // tags and categories pages
  await fs.mkdir(TAGS_DIR, { recursive: true });
  await fs.mkdir(CATS_DIR, { recursive: true });
  for(const t of Object.keys(tagsMap)){
    const list = tagsMap[t];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Tag: ${escapeXml(t)}</title><link rel="stylesheet" href="/assets/css/styles.css"></head><body><main><h1>Tag: ${escapeXml(t)}</h1><ul>${list.map(it=>`<li><a href="/detail.html?type=${encodeURIComponent(it.type)}&id=${encodeURIComponent(it.id)}&slug=${encodeURIComponent(it.slug||'')}">${escapeXml(it.title)}</a> <small>${escapeXml(it.date||'')}</small></li>`).join('')}</ul></main></body></html>`;
    const dest = path.join(TAGS_DIR, `${safeSlug(t)}.html`);
    await writeIfChanged(dest, html);
  }
  for(const c of Object.keys(catsMap)){
    const list = catsMap[c];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Category: ${escapeXml(c)}</title><link rel="stylesheet" href="/assets/css/styles.css"></head><body><main><h1>Category: ${escapeXml(c)}</h1><ul>${list.map(it=>`<li><a href="/detail.html?type=${encodeURIComponent(it.type)}&id=${encodeURIComponent(it.id)}&slug=${encodeURIComponent(it.slug||'')}">${escapeXml(it.title)}</a> <small>${escapeXml(it.date||'')}</small></li>`).join('')}</ul></main></body></html>`;
    const dest = path.join(CATS_DIR, `${safeSlug(c)}.html`);
    await writeIfChanged(dest, html);
  }

  console.log('Generation complete.');
}

generate().catch(err=>{ console.error(err); process.exitCode = 2; });
