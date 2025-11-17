# miroza

This repository is a starter scaffold for a blogging and news website called "Miroza".

What I added for you in this repo:

- A minimal Next.js site scaffold (`package.json`, pages, components, styles).
- `data/articles.json` with 100 mini-articles (English) and images (picsum placeholders).
- `scripts/fetch-news.js` — a script that fetches latest India headlines and Tamil Nadu results using NewsAPI.org and writes `data/news.json`.
- Basic responsive styles with smooth transitions and accessible defaults.
- `.env.local.example` showing the `NEWSAPI_KEY` environment variable.

Quick start (Windows PowerShell):

```powershell
# install deps
npm install

# (optional) fetch live news — set your NewsAPI key first
#$env:NEWSAPI_KEY = "your_key_here"; npm run fetch-news

# run dev server
npm run dev
```

SEO notes and structure
- The index page uses `next` SSG (`getStaticProps`) to read `data/articles.json` and `data/news.json`.
- The site includes basic `<meta name="description">` in the index page; you can expand with Open Graph tags in `pages/_document.js` or per-page `Head`.
- To improve SEO further, add per-article pages (e.g., `pages/articles/[slug].js`) with canonical tags and structured data (JSON-LD).

How to fetch live news
- Get a free key from https://newsapi.org/ and set `NEWSAPI_KEY` (see `.env.local.example`).
- Run: `npm run fetch-news` (or the PowerShell command above). That will overwrite `data/news.json`.

Next steps I can do for you
- Add `pages/articles/[slug].js` to generate per-article pages (good for SEO).
- Add a GitHub Actions workflow to build and deploy (Vercel or static export).
- Integrate server-side RSS feed generation and sitemap generation.

If you'd like, tell me which of the above next steps to implement now.
# miroza