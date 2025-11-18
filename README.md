# Miroza — Static site generator

This repository includes a minimal static-site generator that creates a fully static website (homepage + per-article pages). The generator is intentionally dependency-free and uses Node's built-in modules.

Quick start
```powershell
# remove previous output
node scripts/clean.js

# generate 1000 articles (default). Set --baseUrl to your site URL.
node scripts/generate.js --count=1000 --baseUrl=https://example.com

# preview the generated site
npx http-server dist -c-1
```

Files of interest
- `scripts/generate.js` — generator script. Accepts `--count` and `--baseUrl`.
- `scripts/clean.js` — deletes `dist/`.
- `templates/` — simple HTML templates used for index and article pages.
- `data/articles.json` — sample article metadata; you can add entries here.
- `assets/` — CSS and JS used by generated pages. Customize `assets/styles.css` and `assets/script.js`.
- `DESCRIPTION.md` — full description and workflow.

Publishing
- The `dist/` folder contains ready-to-serve static HTML. Use GitHub Pages, Netlify, Vercel (static), or S3 to host.

If you want, I can run the generator with your preferred count and commit the `dist/` output for you, or add Markdown support so you can write articles as `.md` files.
