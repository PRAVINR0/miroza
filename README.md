# MIROZA

MIROZA is a modern, performant, accessible news / articles / blog platform scaffold. All content provided here is placeholder material for development and design iteration.

## Features
- Semantic HTML5 structure for improved SEO & accessibility
- Responsive layout using CSS Grid + Flexbox
- Dark / Light mode with CSS variables and localStorage persistence (`miroza_theme`)
- Modular JavaScript under `window.MIROZA` namespace (theme, nav, posts, prefetch, a11y, PWA)
- Skeleton loaders while content (JSON) fetches
- Prefetch on link hover / touch for perceived performance
- Service Worker caching core assets, offline navigation fallback
- SEO: meta tags, OpenGraph, Twitter Card, JSON-LD for site & articles
- Security: strict CSP example, external links use `rel="noopener noreferrer"`
- Performance: lazy-loaded images, minimal critical CSS inline, transform/opacity animations

## Structure
```
index.html
articles/ (individual article pages)
category/ (category listing pages)
styles/styles.css
scripts/app.js
assets/images/placeholder.svg
assets/icons/*.svg
data/posts.json
manifest.json
sw.js
sitemap.xml
robots.txt
.htaccess.example
```

## Getting Started
1. Serve the root directory with any static server (examples below).
2. Ensure `manifest.json` and `sw.js` are at root scope for PWA functionality.
3. Update `canonical` + OpenGraph URLs to your production domain.

### Quick Dev Server (Node)
```bash
npx serve .
```

### Python (if available)
```bash
python -m http.server 8080
```

Visit `http://localhost:8080` and inspect network tab: service worker should register.

## Theming
- Stored in `localStorage` key `miroza_theme`.
- Applied before first paint via inline script for FOUC prevention.
- Variables defined for light & dark palettes in `styles.css`.

## Posts Data
- Located in `data/posts.json`.
- Each post: `{ id, title, slug, excerpt, category, author, date, image }`.
- Extend by adding new JSON entries and corresponding HTML article pages.

## Adding Articles
1. Create a new HTML file under `articles/` named `<slug>.html`.
2. Include proper meta tags + JSON-LD schema.
3. Ensure `slug` matches the JSON entry for deep linking.

## Accessibility
- Skip link for keyboard users.
- Focus management when mobile nav toggles.
- Sufficient contrast maintained (verify via tooling).

## Security Notes
- Example `.htaccess.example` shows recommended headers.
- CSP restricts sources to self + data URIs for images.
- For user-generated HTML, add DOMPurify and replace `safeHTML` fallback.

## Performance Considerations
- Additional optimization: inline font preload once custom fonts decided.
- Consider responsive image sets (srcset) when real images available.
- Preconnect / dns-prefetch can be added if external APIs are integrated.

## PWA
- Simplified `manifest.json` with base icon.
- Service worker caches core shell; navigation fallback to `index.html`.
- Extend by adding runtime caching strategies for API calls.

## Roadmap Ideas
- Pagination & dynamic search results
- CMS or static site generator integration
- Tag-based filtering & related posts
- Author profile pages & RSS feed generation

## License
Placeholder scaffold – integrate into your existing project with appropriate licensing considerations for fonts/images you add later.
