#!/usr/bin/env node
// Node image optimizer using sharp
// Downloads image URLs from assets/data/*.json and writes optimized images + tiny placeholders

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
// Use `assets/data` for JSON sources in this repository
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const ORIG_DIR = path.join(ROOT, 'assets', 'images', 'originals');
const OPT_DIR = path.join(ROOT, 'assets', 'images', 'optimized');
const PLC_DIR = path.join(ROOT, 'assets', 'images', 'placeholders');
const OUT_MAP = path.join(DATA_DIR, 'image-placeholders.json');

async function ensureDir(d){ await fs.mkdir(d, { recursive: true }); }

function hashString(s){ const crypto = require('crypto'); return crypto.createHash('sha1').update(s).digest('hex'); }

async function collectUrls(){
  const urls = new Set();
  const files = await fs.readdir(DATA_DIR);
  for(const f of files){
    if(!f.endsWith('.json')) continue;
    const p = path.join(DATA_DIR,f);
    try{
      let txt = await fs.readFile(p,'utf8');
      txt = txt.replace(/^\uFEFF/, '');
      txt = txt.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const parsed = JSON.parse(txt);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      arr.forEach(it=>{ if(it && it.image) urls.add(it.image); });
    }catch(e){ console.warn('skip',f,e.message); }
  }
  return Array.from(urls);
}

async function download(url, dest){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`fetch ${res.status}`);
  const buf = await res.buffer();
  await fs.writeFile(dest, buf);
}

async function processUrl(url){
  const hash = hashString(url);
  const origExt = path.extname(url).split('?')[0] || '.jpg';
  const origPath = path.join(ORIG_DIR, `${hash}${origExt}`);
  await ensureDir(ORIG_DIR);
  try{ if(! (await fs.stat(origPath).catch(()=>null)) ){ console.log('Downloading', url); await download(url, origPath); } else { console.log('Already downloaded', url); } }catch(e){ console.warn('Download failed', url, e.message); return null }

  await ensureDir(OPT_DIR); await ensureDir(PLC_DIR);
  const optPath = path.join(OPT_DIR, `${hash}.jpg`);
  const plcPath = path.join(PLC_DIR, `${hash}.jpg`);
  try{
    // optimize (max width 1200)
    await sharp(origPath).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 78 }).toFile(optPath);
    // placeholder tiny (32px)
    const plcBuf = await sharp(origPath).resize({ width: 32 }).jpeg({ quality: 40 }).toBuffer();
    await fs.writeFile(plcPath, plcBuf);
    const b64 = plcBuf.toString('base64');
    const dataUri = `data:image/jpeg;base64,${b64}`;
    return { url, hash, optPath, plcPath, dataUri };
  }catch(e){ console.warn('sharp failed', url, e.message); return null }
}

async function run(){
  const urls = await collectUrls();
  if(!urls.length){ console.log('No image URLs found'); return }
  const map = {};
  for(const u of urls){ const r = await processUrl(u); if(r) map[u] = r.dataUri }
  await fs.writeFile(OUT_MAP, JSON.stringify(map, null, 2), 'utf8');
  console.log('Wrote', OUT_MAP);
}

run().catch(err=>{ console.error(err); process.exitCode = 2 });
