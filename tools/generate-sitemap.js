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

const root = path.join(__dirname,'..');
const files = collectHtml(root).map(f => path.relative(root,f).replace(/\\/g,'/'))
  .filter(p => !p.startsWith('tools/') && !p.startsWith('backup/'));

const urls = files.map(p => `https://miroza.online/${p}`);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`;

fs.writeFileSync(path.join(root,'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml written with', urls.length, 'URLs');
