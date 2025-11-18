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
