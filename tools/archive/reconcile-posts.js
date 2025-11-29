const fs = require('fs');
const path = require('path');
const postsPath = path.join(__dirname, '..', 'data', 'posts.json');
const backupPath = path.join(__dirname, '..', 'data', `posts.json.bak-${Date.now()}`);
const cleanedPath = path.join(__dirname, '..', 'data', 'posts.cleaned.json');

function fileExistsSync(p){ try { return fs.existsSync(p); } catch(e){ return false; } }

function localPathFromUrl(url){ if(!url) return null; try{ const u = new URL(url, 'http://localhost'); return u.pathname; }catch(e){ return url; } }

function main(){
  if(!fileExistsSync(postsPath)){
    console.error('posts.json not found at', postsPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(postsPath,'utf8');
  let data;
  try{ data = JSON.parse(raw); } catch(e){ console.error('Failed to parse posts.json', e); process.exit(2); }

  let items = [];
  let containerKey = null;
  if(Array.isArray(data)) { items = data; }
  else if(data.articles && Array.isArray(data.articles)) { items = data.articles; containerKey = 'articles'; }
  else if(data.posts && Array.isArray(data.posts)) { items = data.posts; containerKey = 'posts'; }
  else { console.error('Unrecognized posts.json structure'); process.exit(3); }

  const root = path.join(__dirname, '..');
  const kept = [];
  const removed = [];

  items.forEach(it => {
    const slug = it.slug;
    const url = it.url || it.link || it.path || null;
    let candidate = null;
    if(slug){ candidate = path.join(root, 'articles', `${slug}.html`); }
    if(!candidate && url){
      const p = localPathFromUrl(url);
      // handle leading slash
      candidate = p.startsWith('/') ? path.join(root, p.replace(/^[\\/]+/, '')) : path.join(root, p);
    }
    if(candidate && fileExistsSync(candidate)){
      kept.push(it);
    } else {
      removed.push(Object.assign({}, it, { resolvedPath: candidate }));
    }
  });

  // prepare cleaned structure
  let out;
  if(containerKey) {
    out = Object.assign({}, data);
    out[containerKey] = kept;
  } else {
    out = kept;
  }

  // backup original
  fs.copyFileSync(postsPath, backupPath);
  fs.writeFileSync(cleanedPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('Reconciliation complete. Kept:', kept.length, 'Removed:', removed.length);
  if(removed.length) console.log('Sample removed entry:', removed[0]);
  console.log('Backup of original saved to:', backupPath);
  console.log('Cleaned posts written to:', cleanedPath);
}

main();
