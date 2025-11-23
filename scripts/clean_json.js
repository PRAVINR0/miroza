#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'assets', 'data');
const BACKUP_DIR = path.join(ROOT, 'backup', 'json-backup');

async function ensure(d){ await fs.mkdir(d, { recursive: true }); }

function sanitizeText(txt){
  // strip BOM and comments
  let t = txt.replace(/^\uFEFF/, '');
  t = t.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  // replace problematic control characters except tab/newline/carriage return
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
  // replace Unicode line and paragraph separators which break JSON.parse in some engines
  t = t.replace(/\u2028|\u2029/g, ' ');
  return t;
}

async function run(){
  await ensure(BACKUP_DIR);
  const files = await fs.readdir(DATA_DIR);
  for(const f of files){
    if(!f.endsWith('.json')) continue;
    const p = path.join(DATA_DIR, f);
    try{
      const txt = await fs.readFile(p, 'utf8');
      try{ JSON.parse(txt); console.log('OK:', f); continue; }catch(e){ /* fallthrough */ }
      console.log('Attempting to clean:', f);
      const cleaned = sanitizeText(await fs.readFile(p,'utf8'));
      // try parse cleaned
      JSON.parse(cleaned);
      // backup original
      await fs.copyFile(p, path.join(BACKUP_DIR, f + '.orig'));
      await fs.writeFile(p, cleaned, 'utf8');
      console.log('Cleaned and backed up:', f);
    }catch(err){
      console.warn('Failed to clean', f, err.message);
    }
  }
}

run().catch(err=>{ console.error(err); process.exitCode = 2 });
