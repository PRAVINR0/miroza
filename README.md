# MIROZA — News Template

![Playwright Tests](https://github.com/PRAVINR0/miroza/actions/workflows/playwright.yml/badge.svg)

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

Deployment & Security Notes
- Use server-set HTTP headers for CSP rather than meta tags; this enables nonces per-request and stronger policies.
- After removing inline styles/scripts, set headers like:

	Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'

- If you need inline scripts for templates, prefer nonces or compute SHA-256 hashes for small inline blocks (e.g., critical JSON-LD) and add them to `script-src`.
- Service Worker: serve the site on `https` or `http://localhost` to enable SW. Update `sw.js` cache version when you change assets.
- Images: for production, generate multiple sizes and WebP/AVIF fallbacks; update `srcset` attributes or use a responsive image generator.

Build & CI
- Install dev dependencies and build assets locally:

	```powershell
	npm install
	npm run build
	```

- `npm run build` will produce `styles/styles.min.css` and `scripts/app.min.js` using PostCSS (cssnano) and Rollup + terser.
- The GitHub Actions workflow runs Playwright E2E tests and uploads HTML/JUnit reports as artifacts.

Service worker updates
- When a new SW is available the site shows a small update banner; clicking "Reload" will activate the new service worker and reload the page.

Enjoy building MIROZA!
