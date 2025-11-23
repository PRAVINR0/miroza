#!/usr/bin/env node
// wire_site_ui.js
// Inject UI assets (ui.css, ui.js, images.js, meta.js) into all HTML files in the repo root and top-level directories.

const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UI_SNIPPET = `  <link rel="stylesheet" href="/assets/css/ui.css">
  <script src="/assets/js/ui.js" defer></script>
  <script src="/assets/js/images.js" defer></script>
  <script src="/assets/js/meta.js" defer></script>`;

async function findHtml(dir){
  const res = [];
  const items = await fs.readdir(dir);
  for(const it of items){
    const p = path.join(dir, it);
    const stat = await fs.stat(p);
    if(stat.isDirectory()){
      // skip node_modules, .git, assets
      if(['node_modules','.git','assets'].includes(it)) continue;
      const inner = await findHtml(p); res.push(...inner);
    } else if(it.endsWith('.html')) res.push(p);
  }
  return res;
}

async function inject(file){
  let txt = await fs.readFile(file,'utf8');
  if(txt.includes('/assets/js/ui.js')) return false;
  // find closing </head>
  const idx = txt.indexOf('</head>');
  if(idx === -1) return false;
  const before = txt.slice(0, idx);
  const after = txt.slice(idx);
  const newTxt = before + '\n' + UI_SNIPPET + '\n' + after;
  await fs.writeFile(file, newTxt, 'utf8');
  return true;
}

async function run(){
  const files = await findHtml(ROOT);
  let count = 0;
  for(const f of files){ if(await inject(f)) count++; }
  console.log(`Injected UI into ${count} HTML files`);
}

run().catch(err=>{ console.error(err); process.exitCode = 2 });
