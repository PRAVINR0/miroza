const fs = require('fs');
const path = require('path');

function collectHtml(dir){
  let out = [];
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for(const e of ents){
    if(e.name === 'node_modules' || e.name === 'backup') continue;
    const full = path.join(dir, e.name);
    if(e.isDirectory()) out = out.concat(collectHtml(full));
    else if(e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function ensureMain(file){
  let txt = fs.readFileSync(file, 'utf8');
  if(/<main[\s>]/i.test(txt)) return false;
  // find closing header
  const headerClose = txt.search(/<\/header>/i);
  if(headerClose === -1) return false; // no header to anchor

  // find footer start
  const footerStart = txt.search(/<footer[\s>]/i);
  let before = txt.slice(0, headerClose + 9);
  let middle = '';
  let after = '';
  if(footerStart !== -1){
    middle = txt.slice(headerClose + 9, footerStart);
    after = txt.slice(footerStart);
    // wrap middle with main
    middle = '\n<main id="main">' + middle + '</main>\n';
  } else {
    // no footer — wrap until before </body>
    const bodyClose = txt.search(/<\/body>/i);
    if(bodyClose === -1) return false;
    middle = txt.slice(headerClose + 9, bodyClose);
    after = txt.slice(bodyClose);
    middle = '\n<main id="main">' + middle + '</main>\n';
  }
  const newTxt = before + middle + after;
  fs.writeFileSync(file, newTxt, 'utf8');
  return true;
}

const root = path.join(__dirname, '..');
const files = collectHtml(root);
const changed = [];
for(const f of files){
  try{ if(ensureMain(f)) changed.push(path.relative(root, f)); }
  catch(e){ console.error('err', f, e); }
}
console.log('ensure-main-wrapper: processed', files.length, 'HTML files.');
if(changed.length) console.log('Updated files:\n', changed.join('\n'));
else console.log('No updates needed.');
