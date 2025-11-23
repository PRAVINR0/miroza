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
    const p = path.join(DATA_DIR,f);
    try{
      // read raw buffer to detect BOM bytes reliably
      const buf = await fs.readFile(p);
      let txt;
      if(buf.length >= 3 && buf[0]===0xEF && buf[1]===0xBB && buf[2]===0xBF){
        // remove UTF-8 BOM
        txt = buf.slice(3).toString('utf8');
      } else {
        txt = buf.toString('utf8');
      }
      try{ JSON.parse(txt); console.log('OK:', f); continue; }catch(e){ /* fallthrough */ }
      console.log('Attempting to clean:', f);
      const cleaned = sanitizeText(txt);
      // try parse cleaned
      JSON.parse(cleaned);
      // backup original (raw)
      await fs.copyFile(p, path.join(BACKUP_DIR, f + '.orig'));
      await fs.writeFile(p, cleaned, 'utf8');
      console.log('Cleaned and backed up:', f);
    }catch(err){
      console.warn('Failed to clean', f, err.message);
    }
  }
}

run().catch(err=>{ console.error(err); process.exitCode = 2 });
