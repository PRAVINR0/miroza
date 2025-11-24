# MIROZA

MIROZA is a modern, performant, accessible news / articles / blog platform scaffold. All content provided here is placeholder material for development and design iteration.

## Features
- Semantic HTML5 structure for improved SEO & accessibility
- Responsive layout using CSS Grid + Flexbox
- Dark / Light mode with CSS variables and localStorage persistence (`miroza_theme`)
- Modular JavaScript under `window.MIROZA` namespace (theme, nav, posts, pagination, prefetch, a11y, PWA)
- Skeleton loaders while content (JSON) fetches
- Prefetch on link hover / touch for perceived performance
- Service Worker caches core shell + offline page with runtime strategies for data/images
- SEO: meta tags, OpenGraph, Twitter Card, JSON-LD for site & articles
- Security: strict CSP example, external links use `rel="noopener noreferrer"`
- Performance: lazy-loaded images, minimal critical CSS inline, transform/opacity animations
- Responsive art-directed SVG bundles with `srcset` + `sizes`
- DOMPurify ready for safe user-generated content ingestion (sample usage documented in `scripts/app.js`)
- RSS feed (`rss.xml`) advertised in `<head>` for subscribers
- Client-side pagination module for home & category listings (10 posts per page)

## Structure
```
index.html
articles/
category/
styles/styles.css
scripts/app.js
assets/images/
assets/icons/
data/posts.json
manifest.json
sw.js
sitemap.xml
robots.txt
rss.xml
.htaccess.example
```

## Getting Started
1. Serve the root directory with any static server (examples below).
2. Ensure `manifest.json`, `sw.js`, and `rss.xml` stay at the project root for proper scope.
3. Update `canonical` + OpenGraph URLs to your production domain.

### Quick Dev Server (Node)
```bash
npx serve .
```

### Python (if available)
```bash
python -m http.server 8080
```

Visit `http://localhost:8080` and inspect the Network tab: the service worker should register.

## Theming
- Variables defined for light & dark palettes in `styles.css`.
- Theme persistence stored in `localStorage` (`miroza_theme`).
- Toggle updates icons and labels for assistive tech.

## Posts Data
- Located in `data/posts.json`.
- Each post entry contains `{ id, title, slug, excerpt, category, author, date, image }`.
- `image` is an object with `src`, `srcset`, `sizes`, `alt` for responsive rendering.
- Extend by adding new JSON entries and corresponding HTML article pages.

## Adding Articles
1. Create a new HTML file under `articles/` named `<slug>.html`.
2. Include proper meta tags + JSON-LD schema.
3. Ensure `slug` matches the JSON entry for deep linking.
4. Reuse the art-directed SVG sets or add your own responsive sources (400 / 800 / 1200) and update the JSON entry.

## Accessibility
- Skip link for keyboard users.
- Focus management when mobile nav toggles.
- Sufficient contrast maintained (verify via tooling).
- Pagination controls expose current state via text (`Page X of Y`).

## Security Notes
- `.htaccess.example` includes CSP, HSTS, Permissions-Policy, and caching best practices.
- DOMPurify CDN + inline example show where to sanitize user submissions.

## Performance Considerations
- Responsive SVG sets reduce payload without sacrificing quality.
- Prefetched links + paginated DOM operations keep bundle small.
- Additional optimization: inline font preload once custom fonts are selected.
- Consider responsive bitmap sources (WebP/AVIF) if photography is added later.

## PWA
- Simplified `manifest.json` with base icon.
- Service worker precaches the app shell, `offline.html`, and auto-updates caches with stale-while-revalidate for JSON/images.
- Navigation requests fall back to the offline card when the network is unreachable.
- Extend by adding push notifications or background sync once APIs are wired up.

## Roadmap Ideas
- Pagination & dynamic search results
- CMS or static site generator integration
- Tag-based filtering & related posts
- Author profile pages & newsletter automation

## License
Placeholder scaffold – integrate into your existing project with appropriate licensing considerations for fonts/images you add later.
