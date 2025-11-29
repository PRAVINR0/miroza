const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function walk(dir){
  let res=[];
  fs.readdirSync(dir).forEach(f=>{
    const full = path.join(dir,f);
    const stat = fs.statSync(full);
    if(stat.isDirectory()) res = res.concat(walk(full));
    else if(/\.html?$/.test(f)) res.push(full);
  });
  return res;
}

const files = walk(root);
const snippet = /<script>\s*\(function\(\)\{try\{var t=localStorage.getItem\('(miroza_theme|theme)'\);[^<]*?\}\)\(\);<\/script>/gmi;
let changed = 0;
files.forEach(f=>{
  let txt = fs.readFileSync(f,'utf8');
  if(snippet.test(txt)){
    txt = txt.replace(snippet,'');
    fs.writeFileSync(f, txt, 'utf8');
    changed++;
    console.log('Patched', path.relative(root,f));
  }
});
console.log('Done. Files changed:', changed);
