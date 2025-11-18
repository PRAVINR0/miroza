Miroza — Static site generator (local)

Overview
--------
This workspace contains a minimal static-site generator designed to produce a full set of static HTML pages (an `index.html` and individual article pages) from simple article metadata. It's intentionally dependency-free (uses Node's built-in `fs` and `path`) so you can run it locally without installing packages.

What the generator does
- Reads `data/articles.json` for any article metadata you provide.
- If the requested count (via `--count`) is higher than the entries in `data/articles.json`, the script synthesizes placeholder articles automatically.
- Writes generated output to `dist/`:
  - `dist/index.html` (and `page-*.html` for pagination)
  - `dist/articles/<slug>.html` for each article
  - `dist/assets/*` copied from `assets/`
  - `dist/sitemap.xml` and `dist/robots.txt`

Important files
- `scripts/generate.js`: main generator. Run `node scripts/generate.js --count=1000 --baseUrl=https://example.com` to produce 1000 pages.
- `scripts/clean.js`: removes `dist/`.
- `templates/index.html`: index page template (used to render paginated list pages).
- `templates/article.html`: per-article template — edit to change article HTML structure.
- `data/articles.json`: article metadata (title, slug, excerpt, content, author, date, image). Add entries here to provide canonical article content.
- `assets/`: styles and scripts used by generated pages. Customize `assets/styles.css` and `assets/script.js` to change look and client-side behaviour.

How to create and edit articles
1. Prefer editing `data/articles.json` for structured metadata. Each object should include at least:
   - `title` (string)
   - `slug` (url-safe string; unique)
   - `excerpt` (short description)
   - `content` (string containing HTML for article body)
   - `author` (string)
   - `date` (YYYY-MM-DD)
   - `image` (absolute URL or `assets/` relative path)
2. If you prefer working with Markdown, you can extend `scripts/generate.js` to read `.md` files, convert to HTML (e.g., using `marked`), and include the HTML in generated pages.

Running the generator
---------------------
From the repo root:
```powershell
# (optional) remove previous output
node scripts/clean.js

# generate (default 1000)
node scripts/generate.js --count=1000 --baseUrl=https://example.com

# preview locally
npx http-server dist -c-1
```

SEO and per-article best practices
- For best indexing, prefer creating dedicated article pages (`articles/<slug>.html`) as the generator does. Each page includes meta description, og:image and canonical links.
- Use descriptive titles and unique meta descriptions per article.
- Add structured data (JSON-LD) for each article if you need richer search results — you can modify `templates/article.html` to add JSON-LD with article fields.

Publishing
- Push the `dist/` directory to GitHub Pages (gh-pages branch) or configure your static host (Netlify, Vercel static site, S3 + CloudFront) to serve `dist/` as the site root.

Customizing the look and behaviour
- Edit `assets/styles.css` to change fonts, colors, transitions, and animations.
- Edit `assets/script.js` (already lightweight) to change client-side interactions (reader panel, search, etc.).
- Templates are simple HTML with `{{placeholder}}` tokens — modify to change per-article metadata or layout.

Scaling to 1000+ articles
- The generator is synchronous and simple but will work for thousands of files locally. On low-RAM machines it may be slower but should complete.
- If you need more sophisticated build features (image optimization, minification), adopt a build toolchain (Gulp, Grunt, or Node toolchain) or use a static site generator (Hugo, Eleventy, Jekyll) which are optimized for large sites.

Support and next steps
- I can:
  - Run the generator for 1000 articles and include a `dist/` preview (if you want generated output committed).
  - Add Markdown support and lightweight image optimization.
  - Add automated GitHub Action to build and deploy to GitHub Pages.

Edit this file to document any site-specific conventions you want to preserve.
