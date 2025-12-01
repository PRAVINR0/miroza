const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const articlesPath = path.join(dataDir, 'articles.json');
const newsPath = path.join(dataDir, 'news.json');
const blogsPath = path.join(dataDir, 'blogs.json');
const postsPath = path.join(dataDir, 'posts.json');
const categoriesPath = path.join(dataDir, 'categories.json');

function readArray(filePath){
  if(!fs.existsSync(filePath)){
    console.warn(`Skipping missing file: ${path.relative(rootDir, filePath)}`);
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error){
    console.warn(`Unable to parse ${filePath}: ${error.message}`);
    return [];
  }
}

function writeJson(filePath, payload){
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function sortByDateDesc(a, b){
  const timeA = Date.parse(a?.date || a?.updated || 0) || 0;
  const timeB = Date.parse(b?.date || b?.updated || 0) || 0;
  return timeB - timeA;
}

function slugify(value){
  return (value || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toLabel(value){
  if(!value) return 'Stories';
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function ensureSlug(value, fallback){
  const slug = value ? value.toString().trim() : '';
  if(slug) return slug;
  return fallback;
}

function formatDateLabel(value){
  if(!value) return '';
  const parsed = new Date(value);
  if(Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split('T')[0];
}

function normalizeArticle(entry, index){
  if(!entry || typeof entry !== 'object') return null;
  const slug = ensureSlug(entry.slug, `article-${index + 1}`);
  const date = entry.date || entry.updated || new Date().toISOString();
  const category = entry.category || 'Article';
  return {
    ...entry,
    slug,
    date,
    category,
    link: entry.link || entry.contentFile || `/articles/${slug}.html`
  };
}

function buildCategories(articles, news){
  const buckets = new Map();
  const addToBucket = (item)=>{
    if(!item) return;
    const slug = slugify(item.category || 'story');
    if(!slug) return;
    if(!buckets.has(slug)){
      buckets.set(slug, {
        slug,
        label: toLabel(item.category || 'Story'),
        count: 0,
        items: []
      });
    }
    const bucket = buckets.get(slug);
    bucket.count += 1;
    bucket.items.push({
      id: item.id || item.slug,
      title: item.title,
      slug: item.slug,
      date: item.date,
      excerpt: item.excerpt || '',
      link: item.link,
      category: item.category,
      image: item.image || null
    });
  };

  articles.forEach(addToBucket);
  news.forEach(addToBucket);

  const payload = Array.from(buckets.values()).map(bucket => {
    bucket.items.sort(sortByDateDesc);
    const latest = bucket.items[0]?.date || null;
    return {
      ...bucket,
      updated: latest,
      description: latest ? `Updated ${formatDateLabel(latest)} • ${bucket.count} stories` : `${bucket.count} stories ready`,
      href: `/articles.html?topic=${encodeURIComponent(bucket.label)}`,
      previews: bucket.items.slice(0, 4)
    };
  }).sort((a, b) => {
    const timeA = Date.parse(a.updated || 0) || 0;
    const timeB = Date.parse(b.updated || 0) || 0;
    return timeB - timeA;
  });

  return payload;
}

function main(){
  if(!fs.existsSync(articlesPath)){
    throw new Error(`Missing source feed at ${articlesPath}`);
  }

  const articles = readArray(articlesPath)
    .map(normalizeArticle)
    .filter(Boolean);

  const blogs = readArray(blogsPath)
    .map(normalizeArticle)
    .filter(Boolean);

  const allPosts = [...articles, ...blogs].sort(sortByDateDesc);

  writeJson(postsPath, allPosts);
  console.log(`posts.json refreshed with ${allPosts.length} entries.`);

  const indiaNews = readArray(newsPath).map((entry, index) => ({
    ...entry,
    category: entry.category || 'News',
    date: entry.date || entry.updated || new Date(Date.now() - (index * 86400000)).toISOString(),
    link: entry.contentFile || `/news/${ensureSlug(entry.slug, `india-news-${index + 1}`)}.html`,
    slug: ensureSlug(entry.slug, `india-news-${index + 1}`)
  }));

  const categories = buildCategories(allPosts, indiaNews);
  writeJson(categoriesPath, categories);
  console.log(`categories.json generated with ${categories.length} category buckets.`);
}

main();
