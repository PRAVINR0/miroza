# MIROZA — News Template

This repository contains a production-ready front-end news template (HTML, CSS, JavaScript).

Structure
- `index.html` — Homepage (dynamic sections rendered from `data/posts.json`)
- `article-template.html` — Reusable article template
- `articles/` — Example article pages (`article-1.html`, `article-2.html`, `article-3.html`)
- `category.html` — Category listing; accepts `?cat=CategoryName`
- `styles.css`, `styles.min.css` — Main CSS (theme-aware)
- `app.js`, `app.min.js` — Main JavaScript (MIROZA namespace)
- `data/posts.json` — Sample posts used to render homepage and categories
- `assets/` — placeholder images & icons
- `sw.js` — basic service worker example
- `manifest.json` — PWA metadata
- `sitemap.xml`, `robots.txt`, `.htaccess.example` — SEO & hosting hints
- `404.html`, `500.html` — error pages

How it works
- `app.js` exposes `MIROZA.initTheme()`, `MIROZA.toggleTheme()`, `MIROZA.loadPosts()`, `MIROZA.shuffle()`, and `MIROZA.renderCards()`.
- The homepage loads `data/posts.json`, sorts posts by date, selects latest posts per category, shuffles their display order using Fisher–Yates, and renders cards.
- Theme preference is saved in `localStorage` as `miroza_theme` and applied early to avoid FOUC. Toggle in header updates preference.

Replace sample data
- Edit `data/posts.json` and update the `image` paths, `slug`, `title`, `date` and `excerpt`.
- For production, generate an `articles/<slug>.html` file per post or serve dynamic pages from your backend.

Building minified files
- Minified files (`styles.min.css`, `app.min.js`) are included. For a build step, use your preferred bundler (Rollup, Webpack) to produce minified assets.

Service worker & PWA
- `sw.js` is a minimal sample. Customize caching strategies for runtime assets and handle updates properly.
- To enable PWA features, ensure `manifest.json` points to proper icons.

Security & headers
- See `.htaccess.example` for CSP and security header hints. Configure your server to send these headers (can't be enforced via static files).

Accessibility
- Includes skip link, ARIA attributes, keyboard support for navigation, and focus outlines.

Notes
- This template uses only original code and placeholder content. Replace sample images and text with your own.
- For sanitizing rich HTML (if you allow HTML in articles), use a sanitizer like DOMPurify and configure CSP accordingly.

Enjoy building MIROZA!
