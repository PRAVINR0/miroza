# MIROZA — Static Site

This repository contains a lightweight, fast, responsive static site for MIROZA.

Structure (root):
- `index.html`, `news.html`, `articles.html`, `blogs.html`, `stories.html`, `info.html`, `detail.html`, `search.html`
- `manifest.json`, `service-worker.js`, `sitemap.xml`, `robots.txt`, `README.md`

Assets live under `/assets`:
- `/assets/css` — `main.css`, `theme.css`, `responsive.css`, `animations.css`
- `/assets/js` — `main.js`, `theme.js`, `datastore.js`, `router.js`, `search.js`, `utils.js`
- `/assets/images` — `logo.svg`, placeholders
- `/assets/data` — `news.json`, `articles.json`, `blogs.json`, `stories.json`, `info.json`

How to run locally:
- Host as static site (VS Code Live Server, `python -m http.server`, or any static hosting). Avoid `file://` because fetch() requires http(s).

Content workflow (for you):
When you paste a new content block here, I (Copilot) will:
1. Convert your input to the JSON format in the `assets/data/*.json` file.
2. Append it to the appropriate JSON file.
3. Update `sitemap.xml` and search index.

If you want to add content yourself locally, edit the appropriate `assets/data/*.json` file and the site will pick it up automatically.
