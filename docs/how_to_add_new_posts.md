# How to add new posts (manual)

This site is a static HTML site. To add a new post manually:

1. Create a new file under `/articles`, for example `articles/article-25.html`.
2. Copy the structure from an existing article (e.g., one of the generated `articles/article-*.html` files) and update:
   - `<title>` and `<meta name="description">` for SEO
   - canonical link `<link rel="canonical" href="/articles/article-25.html">`
   - article content: `<h1>`, `.article-meta`, paragraphs and images
3. Add a thumbnail reference in the index if you want it to show on the homepage.
   - Edit `index.html` and add a new `<article class="card">` block under the `#articles` grid.
   - Use a relative path like `articles/article-25.html` and images from `assets/images/` or external CDN.
4. Update `sitemap.xml` if you maintain it manually, or re-run the generator script if you use it.

Automation suggestions
- For many posts, use the `scripts/generate_articles.ps1` script (PowerShell) or the Python script in `scripts/` to generate pages from content or templates.
- For team workflows, consider moving source content into `content/` as Markdown and adding a small generator to convert Markdown → HTML.

Publishing
- Once files are ready, push changes to `main` (or branch configured for GitHub Pages) and ensure Pages is set to serve from the repository root.
