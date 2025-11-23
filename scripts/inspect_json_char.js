#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function inspect(file){
  try{
    const txt = await fs.readFile(file,'utf8');
    try{ JSON.parse(txt); console.log(file, 'parses ok'); return; }catch(e){
      const m = /position\s(\d+)/.exec(e.message) || /at position (\d+)/.exec(e.message);
      const pos = m ? Number(m[1]) : null;
      console.log('Parse error:', e.message);
      if(pos==null){ console.log('No position info'); return; }
      console.log('Problem at index', pos);
      const start = Math.max(0, pos-40);
      const end = Math.min(txt.length, pos+40);
      const snippet = txt.slice(start, end);
      console.log('--- surrounding text (raw) ---');
      console.log(snippet);
      console.log('--- surrounding codepoints ---');
      for(let i=start;i<end;i++){
        const ch = txt.charCodeAt(i);
        const marker = i===pos ? '<== POS' : '';
        console.log(i, ch.toString(16).padStart(4,'0'), String.fromCharCode(ch).replace(/\n/g,'\\n').replace(/\r/g,'\\r'), marker);
      }
    }
  }catch(err){ console.error('Read failed', err.message); }
}

(async ()=>{
  const ROOT = path.resolve(__dirname, '..');
  const files = ['news.json','stories.json'].map(f=>path.join(ROOT,'assets','data',f));
  for(const f of files) await inspect(f);
})();
