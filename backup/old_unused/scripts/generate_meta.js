#!/usr/bin/env node
/*
  generate_meta.js
  Reads `assets/data/*.json` and emits `assets/data/meta.json` mapping keys "<type>:<id>" to metadata objects used for OG/Twitter/JSON-LD.
*/

const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const OUT_META = path.join(DATA_DIR, 'meta.json');

function safeSlug(s){ return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function truncate(s, n=160){ if(!s) return ''; return String(s).replace(/\s+/g,' ').trim().slice(0,n); }

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

async function generate(){
  const data = await readJsonFiles();
  const metaMap = {};
  for(const fname of Object.keys(data)){
    const type = fname.replace(/\.json$/,'');
    const arr = Array.isArray(data[fname]) ? data[fname] : [];
    for(const it of arr){
      const id = it.id || it.slug || (Math.random().toString(36).slice(2,9));
      const slug = it.slug || safeSlug(it.title || id);
      const title = it.title || '';
      const description = it.description || (it.content ? truncate(it.content,200) : '');
      const image = it.og_image || it.image || '';
      const url = `/detail.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}&slug=${encodeURIComponent(slug)}`;
      const datePublished = it.date || '';
      const author = it.author || it.by || '';

      const key = `${type}:${id}`;
      const schemaType = (type === 'news') ? 'NewsArticle' : 'Article';
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        'headline': title,
        'description': description,
        'url': url,
        'datePublished': datePublished || undefined,
      };
      if(author) jsonLd.author = { '@type':'Person', 'name': author };
      if(image) jsonLd.image = image;

      metaMap[key] = {
        title, description, image, url, datePublished, author, jsonLd
      };
    }
  }
  await fs.writeFile(OUT_META, JSON.stringify(metaMap, null, 2), 'utf8');
  console.log('Wrote meta map to', OUT_META);
}

generate().catch(err=>{ console.error(err); process.exitCode = 2; });
