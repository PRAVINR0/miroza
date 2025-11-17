# miroza — Static HTML blog/news template

This repository now contains a lightweight, single-file static blog/news template you can use and edit directly.

Files added:
- `index.html` — the full site (homepage, article card list, reader template). Copy/paste the supplied article block to add new items.
- `assets/styles.css` — responsive styles, smooth transitions, and reader panel styling.
- `assets/script.js` — small client-side router to open articles in a right-side reader panel, update history, and provide a simple search.

Goals and design choices
- Single-file HTML approach: everything needed to host on GitHub Pages or any static host.
- SEO-friendly front-matter: homepage meta tags, Open Graph tags and JSON-LD for the site are included. For best SEO, create individual article pages (see notes below).
- Smooth UI: CSS transitions and a reader panel implement a modern, app-like feel while remaining static and dependency-free.

How to add a new article (quick, copy-paste method)
1. Open `index.html` and find the sample article block inside the `#articles-grid` section (it's commented out). Copy that entire `<article class="card" ...>` block and paste it inside the `#articles-grid` div.
2. Edit these fields in the pasted block:
	- `data-slug` — a short, URL-safe slug (e.g., `my-article-title`).
	- `img src` — the article image path (use `assets/` or an external URL).
	- `h3.card-title` — the article headline.
	- `p.card-excerpt` — the short excerpt shown on the card.
	- `meta itemprop="datePublished"` — set the publish date (YYYY-MM-DD).
	- `meta itemprop="author"` or `data-author` on the card — author name.
3. Save and open `index.html` in a browser. Click the "Read" link to open the article in the reader panel.

SEO notes (important)
- Single-page JS-driven sites have UX benefits, but search engines index static HTML more reliably. For optimal discoverability, create a standalone HTML file per article (e.g., `articles/my-article-title.html`) containing proper meta tags, canonical link, and JSON-LD. The `index.html` approach is good for quick publishing and local use.
- Keep `title`, `meta description`, and `og:` tags unique for each article page to improve search and social sharing.
- Add `sitemap.xml` and `robots.txt` when you publish the site.

Hosting
- This is a plain static site: you can host it on GitHub Pages, Netlify, Vercel (static export), or any static web server. For GitHub Pages, place `index.html` at the repository root or in the `docs/` folder and enable Pages in the repo settings.

Accessibility & performance
- Images use `loading="lazy"` where possible. Use compressed images (WebP if possible) for performance.
- The layout includes a skip link, readable fonts, and reduced-motion respect.

Limitations & next improvements I can implement
- Per-article HTML pages for full SEO indexing (recommended).
- Sitemap and RSS feed generation.
- Server-side build step (if you'd like to manage many articles with templates).

If you want, I can now:
- Generate several sample articles inside `index.html` so the site looks populated.
- Create an `articles/` folder with individual article pages (best for SEO).
- Add a simple `sitemap.xml` and `robots.txt`.

Tell me which next step you'd like me to take and I'll implement it.
# miroza