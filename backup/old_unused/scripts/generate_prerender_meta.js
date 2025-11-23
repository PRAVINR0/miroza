#!/usr/bin/env node
// generate_prerender_meta.js
// Read assets/data/meta.json and emit meta/<type>-<id>.html files with proper OG/Twitter meta tags

const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const META_FILE = path.join(DATA_DIR, 'meta.json');
const OUT_DIR = path.join(ROOT, 'meta');

async function ensureDir(d){ await fs.mkdir(d, { recursive: true }); }

function metaHtml(m){
  const title = m.title || '';
  const desc = m.description || '';
  const image = m.image || '';
  const url = m.url || '/';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ''}
  <meta name="robots" content="index, follow">
</head>
<body>
  <noscript>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(desc)}</p>
    ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}">` : ''}
  </noscript>
  <script>location.replace(${JSON.stringify(url)});</script>
</body>
</html>`;
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

async function run(){
  try{
    const txt = await fs.readFile(META_FILE,'utf8');
    const map = JSON.parse(txt);
    await ensureDir(OUT_DIR);
    let count = 0;
    for(const key of Object.keys(map)){
      const [type,id] = key.split(':');
      const filename = `${type}-${id}.html`;
      const out = path.join(OUT_DIR, filename);
      const html = metaHtml(map[key]);
      await fs.writeFile(out, html, 'utf8');
      count++;
    }
    console.log(`Wrote ${count} pre-rendered meta pages to ${OUT_DIR}`);
  }catch(err){ console.error('generate_prerender_meta failed', err); process.exitCode = 2 }
}

run();
