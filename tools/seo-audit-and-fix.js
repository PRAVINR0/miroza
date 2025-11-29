const fs = require('fs');
const path = require('path');

function collectHtml(dir){
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const e of entries){
    if(e.name === 'node_modules' || e.name === 'backup') continue;
    const full = path.join(dir, e.name);
    if(e.isDirectory()) out.push(...collectHtml(full));
    else if(e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function ensureHeadTags(file){
  let txt = fs.readFileSync(file, 'utf8');
  const orig = txt;
  // find <head> ... </head>
  const headMatch = txt.match(/<head[\s\S]*?>[\s\S]*?<\/head>/i);
  if(!headMatch) return false;
  let head = headMatch[0];

  // ensure charset
  if(!/meta\s+charset=/i.test(head)){
    head = head.replace(/<head(.*?)>/i, `<head$1>\n    <meta charset="utf-8">`);
  }
  // ensure viewport
  if(!/name="viewport"/i.test(head)){
    head = head.replace(/<meta charset="[^"]+">/i, `$&\n    <meta name="viewport" content="width=device-width, initial-scale=1">`);
  }
  // default description if missing
  if(!/name="description"/i.test(head)){
    head = head.replace(/(<meta[^>]*name=["']?keywords["']?[^>]*>)/i, `$1\n    <meta name="description" content="MIROZA — modern news and articles.">`);
    if(!/name="keywords"/i.test(head)){
      // insert after viewport
      head = head.replace(/<meta name="viewport"[\s\S]*?>/i, match => match + '\n    <meta name="description" content="MIROZA — modern news and articles.">');
    }
  }
  // ensure canonical link
  if(!/rel=["']canonical["']/i.test(head)){
    // derive canonical from file path
    const relPath = path.relative(path.join(__dirname,'..'), file).replace(/\\/g, '/');
    const canon = `    <link rel="canonical" href="https://miroza.online/${relPath}">`;
    head = head.replace(/<meta name="description"[\s\S]*?>/i, match => match + '\n' + canon);
  }
  // add favicon if missing
  if(!/rel=["']icon["']/i.test(head)){
    head = head.replace(/<\/title>/i, `</title>\n    <link rel="icon" href="/assets/icons/favicon.ico">`);
  }

  // replace head in document
  txt = txt.replace(/<head[\s\S]*?>[\s\S]*?<\/head>/i, head);
  if(txt !== orig){
    fs.writeFileSync(file, txt, 'utf8');
    return true;
  }
  return false;
}

const root = path.join(__dirname,'..');
const files = collectHtml(root);
const changed = [];
for(const f of files){
  try{ if(ensureHeadTags(f)) changed.push(path.relative(root,f)); }
  catch(e){ console.error('Error on', f, e); }
}

console.log('SEO audit: processed', files.length, 'HTML files.');
if(changed.length) console.log('Modified files:\n', changed.join('\n'));
else console.log('No changes needed.');
