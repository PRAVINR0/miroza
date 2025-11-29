const fs = require('fs');
const path = require('path');

// Recursively collect .html files under given dir
function collectHtml(dir){
  let out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const ent of entries){
    if(ent.name === 'node_modules' || ent.name === 'backup') continue;
    const full = path.join(dir, ent.name);
    if(ent.isDirectory()) out = out.concat(collectHtml(full));
    else if(ent.isFile() && ent.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function addDeferToFile(file){
  let txt = fs.readFileSync(file, 'utf8');
  // add defer to script tags that reference /scripts/ or scripts/ and don't already have defer/async
  const updated = txt.replace(/<script([^>]*?)src=("|'|)([^"'>]+scripts\/[^"'>]+\.js)(\2)([^>]*)>/gmi, (m, beforeSrc, quote, src, _q, after) => {
    // if already contains defer or async, leave
    if(/\bdefer\b|\basync\b/i.test(beforeSrc + after)) return m;
    // insert defer before closing >
    const insert = beforeSrc + `src=${quote}${src}${_q}` + after + ' defer>';
    return '<script' + insert;
  });
  if(updated !== txt){
    fs.writeFileSync(file, updated, 'utf8');
    return true;
  }
  return false;
}

const root = path.join(__dirname, '..');
const files = collectHtml(root);
const changed = [];
for(const f of files){
  try{
    if(addDeferToFile(f)) changed.push(path.relative(root, f));
  }catch(e){ console.error('Failed to process', f, e); }
}

console.log('add-defer-to-scripts: processed', files.length, 'HTML files.');
if(changed.length) console.log('Changed files:\n', changed.join('\n'));
else console.log('No changes made.');
