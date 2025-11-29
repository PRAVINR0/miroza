const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'data', 'posts.json');
const articlesDir = path.join(repoRoot, 'articles');
const themeInitPath = '/js/theme.js';

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadPosts() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse posts.json:', e.message);
    process.exit(2);
  }
}

function toFilename(link) {
  // link expected like /articles/slug.html
  if (!link) return null;
  const p = link.replace(/^\//, '');
  return path.join(repoRoot, p.split('/').join(path.sep));
}

function templateFor(post) {
  const title = post.title || post.slug || 'Untitled';
  const excerpt = post.excerpt || '';
  const author = post.author || 'MIROZA';
  const date = post.date || new Date().toISOString().slice(0,10);
  const image = (post.image && post.image.src) ? post.image.src : '/assets/images/default-hero.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'author': { '@type': 'Person', 'name': author },
    'datePublished': date,
    'image': image,
    'description': excerpt
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(excerpt)}">
  <link rel="stylesheet" href="/styles/theme.css">
  <script src="${themeInitPath}" defer></script>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <main class="article">
    <article>
      <header>
        <h1>${escapeHtml(title)}</h1>
        <p class="meta">By ${escapeHtml(author)} • ${escapeHtml(date)}</p>
      </header>
      <figure class="hero"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}"></figure>
      <section class="excerpt"><p>${escapeHtml(excerpt)}</p></section>
      <section class="content">
        <p>This is a placeholder article generated automatically. Replace with the final content when ready.</p>
      </section>
    </article>
  </main>
  <script src="/scripts/app.js" defer></script>
</body>
</html>`;
}

function escapeHtml(s) {
  return (''+s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c] || c));
}

function main() {
  safeMkdir(articlesDir);
  const posts = loadPosts();
  let created = 0;
  let skipped = 0;

  posts.forEach(post => {
    const link = post.link || post.contentPath || post.path || null;
    if (!link) return skipped++;
    const filename = toFilename(link);
    if (!filename) return skipped++;
    if (fs.existsSync(filename)) return skipped++;

    const dir = path.dirname(filename);
    safeMkdir(dir);
    try {
      fs.writeFileSync(filename, templateFor(post), 'utf8');
      created++;
      console.log('Created:', filename);
    } catch (e) {
      console.error('Failed to write', filename, e.message);
    }
  });

  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
}

if (require.main === module) main();
