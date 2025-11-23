#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function find(file){
  try{
    const txt = await fs.readFile(file,'utf8');
    const problems = [];
    for(let i=0;i<txt.length;i++){
      const cp = txt.charCodeAt(i);
      // disallow control chars except tab(9), LF(10), CR(13)
      if((cp >= 0 && cp <= 0x1f && cp !== 9 && cp !== 10 && cp !== 13) || cp === 0x2028 || cp === 0x2029){
        problems.push({index:i, code:cp});
      }
    }
    if(!problems.length){ console.log(file, '— no control chars found'); return; }
    console.log(file, '— found', problems.length, 'control chars');
    for(const p of problems.slice(0,20)){
      const start = Math.max(0, p.index-20); const end = Math.min(txt.length, p.index+20);
      console.log('Index', p.index, 'code', p.code.toString(16));
      console.log(txt.slice(start, end).replace(/\n/g,'\\n'));
      console.log('-----');
    }
  }catch(e){ console.error('error reading', file, e.message); }
}

(async ()=>{
  const ROOT = path.resolve(__dirname, '..');
  const files = ['news.json','stories.json'].map(f=>path.join(ROOT,'assets','data',f));
  for(const f of files) await find(f);
})();
