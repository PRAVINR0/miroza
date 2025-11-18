#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Simple static generator: reads data/articles.json and templates, writes dist/
// Usage: node scripts/generate.js --count=1000 --baseUrl=https://example.com

function readJSON(p){ return JSON.parse(fs.readFileSync(p,'utf8')) }
function ensureDir(p){ if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }

// Minimal argument parsing to avoid external packages
const rawArgs = process.argv.slice(2)
const argv = {}
rawArgs.forEach(a => {
  if (a.startsWith('--')){
    const [k,v] = a.slice(2).split('=')
    argv[k] = v === undefined ? true : v
  } else if (a.startsWith('-')){
    const [k,v] = a.slice(1).split('=')
    argv[k] = v === undefined ? true : v
  }
})
const count = parseInt(argv.count || argv.c || process.env.COUNT || '1000', 10)
const baseUrl = (argv.baseUrl || process.env.BASE_URL || 'https://example.com').replace(/\/+$/,'')

const repoRoot = path.resolve(__dirname, '..')
const dataDir = path.join(repoRoot, 'data')
const templatesDir = path.join(repoRoot, 'templates')
const assetsDir = path.join(repoRoot, 'assets')
const distDir = path.join(repoRoot, 'dist')

ensureDir(distDir)
ensureDir(path.join(distDir, 'articles'))
ensureDir(path.join(distDir, 'assets'))

// copy assets (if exists)
function copyAssets(){
  if (!fs.existsSync(assetsDir)) return
  const files = fs.readdirSync(assetsDir)
  files.forEach(f => {
    const src = path.join(assetsDir, f)
    const dst = path.join(distDir, 'assets', f)
    fs.copyFileSync(src, dst)
  })
}

copyAssets()

// Load templates
const tmplIndex = fs.readFileSync(path.join(templatesDir, 'index.html'), 'utf8')
const tmplArticle = fs.readFileSync(path.join(templatesDir, 'article.html'), 'utf8')

// Load sample articles metadata (optional)
let articles = []
if (fs.existsSync(path.join(dataDir, 'articles.json'))){
  try{ articles = readJSON(path.join(dataDir, 'articles.json')) }catch(e){ console.error('Invalid data/articles.json') }
}

// If not enough articles, synthesize additional placeholder articles
function slugify(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
const startIndex = articles.length + 1
for(let i=articles.length;i<count;i++){
  const idx = i+1
  articles.push({
    title: articles[i] && articles[i].title ? articles[i].title : `Auto Article #${idx}`,
    slug: articles[i] && articles[i].slug ? articles[i].slug : slugify(`auto-article-${idx}`),
    excerpt: articles[i] && articles[i].excerpt ? articles[i].excerpt : `This is an auto-generated article number ${idx}. Use this as a placeholder and replace with real content.`,
    content: articles[i] && articles[i].content ? articles[i].content : `<p>This is the body for auto-generated article #${idx}. Replace this HTML with your own content.</p>`,
    author: articles[i] && articles[i].author ? articles[i].author : 'Miroza Auto',
    date: articles[i] && articles[i].date ? articles[i].date : new Date().toISOString().slice(0,10),
    image: articles[i] && articles[i].image ? articles[i].image : `https://picsum.photos/seed/auto${idx}/1200/800`
  })
}

// Helper to write per-article files
function writeArticle(a){
  const outPath = path.join(distDir, 'articles', `${a.slug}.html`)
  const html = tmplArticle.replace(/\{\{title\}\}/g, a.title)
    .replace(/\{\{author\}\}/g, a.author)
    .replace(/\{\{date\}\}/g, a.date)
    .replace(/\{\{image\}\}/g, a.image)
    .replace(/\{\{excerpt\}\}/g, a.excerpt)
    .replace(/\{\{content\}\}/g, a.content)
    .replace(/\{\{canonical\}\}/g, `${baseUrl}/articles/${a.slug}.html`)
    .replace(/\{\{baseUrl\}\}/g, baseUrl)
  fs.writeFileSync(outPath, html, 'utf8')
}

// Generate articles
console.log(`Generating ${articles.length} article pages...`)
articles.forEach(a => writeArticle(a))

// Pagination for index pages (20 per page)
const perPage = 20
const pages = Math.ceil(articles.length / perPage)
for(let p=1;p<=pages;p++){
  const start = (p-1)*perPage
  const slice = articles.slice(start, start+perPage)
  const itemsHtml = slice.map(a => `
    <article class="card">
      <img loading="lazy" src="${a.image}" alt="${escapeHtml(a.title)}" class="card-image">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(a.title)}</h3>
        <p class="card-excerpt">${escapeHtml(a.excerpt)}</p>
        <a class="card-link" href="articles/${a.slug}.html">Read</a>
      </div>
    </article>
  `).join('\n')

  const pageFilename = p===1 ? 'index.html' : `page-${p}.html`
  const pageHtml = tmplIndex.replace(/\{\{items\}\}/g, itemsHtml)
    .replace(/\{\{pageTitle\}\}/g, p===1 ? 'Home' : `Page ${p}`)
    .replace(/\{\{pagination\}\}/g, generatePagination(p, pages))
    .replace(/\{\{baseUrl\}\}/g, baseUrl)

  fs.writeFileSync(path.join(distDir, pageFilename), pageHtml, 'utf8')
}

// sitemap
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sitemap.push(`<url><loc>${baseUrl}/</loc></url>`)
articles.forEach(a => sitemap.push(`<url><loc>${baseUrl}/articles/${a.slug}.html</loc><lastmod>${a.date}</lastmod></url>`))
sitemap.push('</urlset>')
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap.join('\n'), 'utf8')

// robots
fs.writeFileSync(path.join(distDir, 'robots.txt'), `User-agent: *\nSitemap: ${baseUrl}/sitemap.xml\n`, 'utf8')

console.log('Done. Output in dist/ — run `npx http-server dist -c-1` to preview')

// Helpers
function generatePagination(current, total){
  let out = ''
  if (total<=1) return ''
  out += '<nav class="pagination">'
  if (current>1){
    const prev = current-1 ===1 ? 'index.html' : `page-${current-1}.html`
    out += `<a href="${prev}">Previous</a>`
  }
  out += ` <span>Page ${current} of ${total}</span> `
  if (current<total){
    const next = `page-${current+1}.html`
    out += `<a href="${next}">Next</a>`
  }
  out += '</nav>'
  return out
}

function escapeHtml(s){ return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) }
