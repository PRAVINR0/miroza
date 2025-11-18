# Miroza — Static Blog (GitHub Pages)

This repository contains a compact, SEO-friendly static blog intended for hosting on GitHub Pages.

What is included
- `index.html` — site homepage (page 1 of posts)
- `page-2.html` — older posts (page 2)
- `articles/` — per-article HTML files
- `assets/` — `styles.css` and `script.js`
- `sitemap.xml`, `robots.txt`, `.nojekyll`

Preview locally
PowerShell (Windows):
```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes before publishing to GitHub Pages
- GitHub Pages serves `index.html` at the repository root by default. This project is structured so `index.html` is the entrypoint.
- Update `sitemap.xml` and `robots.txt` to use your real site URL (or set up a `CNAME` file).
- If you want many articles generated programmatically, ask me and I can add a generator script (Node or Python) to create pages from markdown or JSON.

Deploying
1. Push to GitHub on the branch configured for Pages (usually `gh-pages` or `main`).
2. In repository Settings -> Pages, set the source to the branch and root folder.

If you want, I can now:
- generate more posts automatically and add them here (note: committing thousands of files will increase repo size), or
- add a small generator that reads markdown from `content/` and builds `articles/` and paginated indexes.

Generator script
- `scripts/generate_articles.py` — a Python script to generate many placeholder articles and a sitemap. It uses placeholder images from `picsum.photos` so you don't need to commit binary images.

Example: generate 1000 articles locally
```powershell
python .\scripts\generate_articles.py --count 1000 --base-url https://example.com
```

Notes
- The generator creates/overwrites files in `articles/`, `index.html`, `page-*.html`, and `sitemap.xml` in the repo root. Review generated content before committing large numbers of files.
- If you'd prefer I generate the 1000 files here and commit them for you, confirm and I'll proceed (warning: large commit). Otherwise run the script locally and push when you're ready.
