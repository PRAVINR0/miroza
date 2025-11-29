const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','posts.json'),'utf8'));
const missing = [];
for(const p of data){
  // prefer explicit link/url or contentPath/path when present (blogs use contentPath)
  const link = p.link || p.url || p.contentPath || p.path || (p.slug ? (`/articles/${p.slug}.html`) : null);
  if(!link) continue;
  // normalize
  const rel = link.replace(/^\//, '');
  const full = path.join(__dirname,'..', rel.replace(/\//g, path.sep));
  if(!fs.existsSync(full)) missing.push({id:p.id, title:p.title, link, path: full});
}
if(missing.length){
  console.log('Missing files for posts:');
  missing.forEach(m=> console.log(`- ${m.title} -> ${m.link} (resolved: ${m.path})`));
  process.exitCode = 2;
} else {
  console.log('All post links resolved to files on disk.');
}
