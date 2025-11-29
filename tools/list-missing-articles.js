const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'data', 'posts.json');

function loadPosts() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

function toFilename(link) {
  if (!link) return null;
  const p = link.replace(/^\//, '');
  return path.join(repoRoot, p.split('/').join(path.sep));
}

const posts = loadPosts();
let total = 0;
let missing = 0;
posts.forEach(p => {
  const link = p.link || p.contentPath || null;
  if (!link) return;
  if (!link.startsWith('/articles/')) return;
  total++;
  const fn = toFilename(link);
  const exists = fs.existsSync(fn);
  if (!exists) {
    console.log('MISSING:', link, '->', fn);
    missing++;
  }
});
console.log(`Checked ${total} article entries, missing: ${missing}`);
