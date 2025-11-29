const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const articlesDir = path.join(root, 'articles');
const dataFile = path.join(root, 'data', 'posts.json');

if(!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir, { recursive: true });
if(!fs.existsSync(path.join(root, 'data'))) fs.mkdirSync(path.join(root, 'data'));

function slugify(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}

function randomDate(start, end, i, total){
  const startMs = +new Date(start);
  const endMs = +new Date(end);
  const t = startMs + Math.floor((endMs - startMs) * (i/Math.max(1,total-1)));
  return new Date(t).toISOString().slice(0,10);
}

const author = 'MIROZA Editorial Team';
const category = 'Articles';

const topics = [];
for(let i=1;i<=100;i++){
  topics.push(`In-depth Guide ${i}: Practical Insights & Strategies`);
}

let existing = {};
try{ existing = JSON.parse(fs.readFileSync(dataFile,'utf8')); }catch(e){ existing = {}; }
if(!Array.isArray(existing.articles)) existing.articles = existing.articles || [];

const start = new Date('2024-01-01');
const end = new Date('2025-11-29');

const newArticles = [];
for(let i=0;i<100;i++){
  const title = topics[i];
  const slug = slugify(title + ' ' + (i+1));
  const date = randomDate(start, end, i, 100);
  const excerpt = `${title} — concise summary and key takeaways for readers.`;
  const keywords = ['guide','how-to','insights','miroza',`topic-${i+1}`];
  const imagePrompt = `Editorial photo for ${title}, professional composition, 16:9, natural light`;

  const article = { title, slug, date, author, category, excerpt, keywords, imagePrompt };
  newArticles.push(article);

  const html = renderArticleHTML(article, generateContent(title));
  fs.writeFileSync(path.join(articlesDir, `${slug}.html`), html, 'utf8');
}

// Append into existing.posts articles array
existing.articles = existing.articles.concat(newArticles.map(a=>({
  title: a.title,
  slug: a.slug,
  category: a.category,
  date: a.date,
  excerpt: a.excerpt,
  imagePrompt: a.imagePrompt,
  keywords: a.keywords,
  contentPath: `/articles/${a.slug}.html`
})));
fs.writeFileSync(dataFile, JSON.stringify(existing, null, 2), 'utf8');
console.log('Wrote 100 articles to data/posts.json and created pages.');

// regenerate articles listing page
const articlesIndexPath = path.join(articlesDir, 'articles.html');
fs.writeFileSync(articlesIndexPath, renderArticlesIndex(existing.articles), 'utf8');
console.log('Updated /articles/articles.html');

// inject latest 20 into index.html
try{
  const indexPath = path.join(root, 'index.html');
  let indexHtml = fs.readFileSync(indexPath,'utf8');
  const latest = existing.articles.slice(-20).reverse();
  const cards = latest.map(p=>`<article class="post-card"><a href="${p.contentPath}"><h3>${p.title}</h3><p class="meta">${p.date}</p><p>${p.excerpt}</p></a></article>`).join('\n');
  if(indexHtml.includes('<!-- ARTICLES_START -->')){
    indexHtml = indexHtml.replace(/<!-- ARTICLES_START -->[\s\S]*?<!-- ARTICLES_END -->/, `<!-- ARTICLES_START -->\n<section class="latest-articles">${cards}</section>\n<!-- ARTICLES_END -->`);
  }else{
    indexHtml = indexHtml.replace('</main>', `</main>\n<section class="latest-articles">${cards}</section>`);
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('Injected latest 20 into index.html');
}catch(e){ console.warn('Could not update index.html:', e && e.message); }

function renderArticleHTML(meta, content){
  const ld = {
    '@context':'https://schema.org',
    '@type':'Article',
    'headline': meta.title,
    'author': { '@type':'Organization', 'name': meta.author },
    'datePublished': meta.date,
    'description': meta.excerpt,
    'mainEntityOfPage': `https://miroza.online/articles/${meta.slug}.html`
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escape(meta.title)} — MIROZA</title>
  <link rel="icon" href="/assets/icons/favicon.ico">
  <meta name="description" content="${escape(meta.excerpt)}" />
  <meta name="keywords" content="${meta.keywords.join(', ')}" />
  <link rel="canonical" href="https://miroza.online/articles/${meta.slug}.html" />
  <meta property="og:title" content="${escape(meta.title)}" />
  <meta property="og:description" content="${escape(meta.excerpt)}" />
  <meta property="og:image" content="/assets/placeholder.jpg" />
  <script src="/js/theme.js"></script>
  <link rel="stylesheet" href="/styles/styles.min.css" />
  <link rel="stylesheet" href="/styles/theme.css" />
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <header class="site-header"><div class="header-inner"><a class="logo" href="/"><img src="/assets/icons/logo.svg" alt="MIROZA logo" width="40" height="40" loading="lazy" /> MIROZA</a><nav class="main-nav" aria-label="Primary navigation"><ul><li><a href="/index.html">Home</a></li><li><a href="/news/news.html">News</a></li><li><a href="/articles/articles.html">Articles</a></li><li><a href="/blogs/blogs.html">Blogs</a></li></ul></nav><button class="theme-toggle" aria-label="Toggle dark or light"><img src="/assets/icons/moon.svg" alt="Toggle theme" width="24" height="24" /></button></div></header>
  <main id="content">
    <article class="single-article">
      <header>
        <h1>${escape(meta.title)}</h1>
        <p class="meta">By ${escape(meta.author)} — ${meta.date}</p>
      </header>
      <figure class="hero-image"><img src="/assets/placeholder.jpg" alt="${escape(meta.title)}" loading="lazy" srcset="/assets/placeholder.jpg 1x" /></figure>
      ${content}
      <nav class="article-nav"><a href="/articles/articles.html">Back to Articles</a></nav>
    </article>
  </main>
  <footer class="site-footer"><div class="footer-grid"><div><h3>MIROZA</h3><p>Modern news and articles hub.</p></div></div><p class="copyright">&copy; <span id="year"></span> MIROZA.</p></footer>
  <script src="/scripts/app.js" defer></script>
</body>
</html>`;
}

function renderArticlesIndex(all){
  // sort desc by date
  const sorted = all.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const items = sorted.map(a=>`<article class="post-card"><a href="/articles/${a.slug}.html"><h3>${escape(a.title)}</h3><p class="meta">${a.date}</p><p>${escape(a.excerpt)}</p></a></article>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Articles — MIROZA</title>
  <link rel="icon" href="/assets/icons/favicon.ico">
  <script src="/js/theme.js"></script>
  <link rel="stylesheet" href="/styles/styles.min.css" />
  <link rel="stylesheet" href="/styles/theme.css" />
</head>
<body>
  <header class="site-header"><div class="header-inner"><a class="logo" href="/"><img src="/assets/icons/logo.svg" alt="MIROZA logo" width="40" height="40" loading="lazy" /> MIROZA</a><nav class="main-nav" aria-label="Primary navigation"><ul><li><a href="/index.html">Home</a></li><li><a href="/news/news.html">News</a></li><li><a href="/articles/articles.html">Articles</a></li><li><a href="/blogs/blogs.html">Blogs</a></li></ul></nav><button class="theme-toggle" aria-label="Toggle dark or light"><img src="/assets/icons/moon.svg" alt="Toggle theme" width="24" height="24" /></button></div></header>
  <main id="content">
    <h1>Articles</h1>
    <section class="posts-grid">
      ${items}
    </section>
  </main>
  <footer class="site-footer"><div class="footer-grid"><div><h3>MIROZA</h3><p>Modern news and articles hub.</p></div></div><p class="copyright">&copy; <span id="year"></span> MIROZA.</p></footer>
  <script src="/scripts/app.js" defer></script>
</body>
</html>`;
}

function generateContent(title){
  const sections = [];
  sections.push(`<p>${escape(title)} — this long-form article dives into background, evidence, and practical steps readers can take today.</p>`);
  sections.push(`<h2>Why this matters</h2><p>Context and high-level implications for readers, with references to research and trends.</p>`);
  sections.push(`<h2>Key concepts</h2><p>Explain the core concepts with clarity, including definitions, common misconceptions, and helpful metaphors.</p>`);
  sections.push(`<h3>Practical steps</h3><ul><li>Step 1 — start small.</li><li>Step 2 — measure progress.</li><li>Step 3 — iterate based on feedback.</li></ul>`);
  sections.push(`<h2>Case studies</h2><p>Short examples that show how ideas play out in practice.</p>`);
  sections.push(`<h2>Common pitfalls</h2><p>What to avoid and how to recover when plans go off-track.</p>`);
  sections.push(`<p>Conclusion: ${escape(title)} provides a balanced set of recommendations; adapt them to your context.</p>`);
  return sections.join('\n');
}

function escape(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
