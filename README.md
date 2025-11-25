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
- Live search suggestions powered by cached post JSON
- Quick-find drawer (⌘/Ctrl+K) for recent reads, saved stories, and category jumps
- Category filter chips for the home feed (news, blog, articles, world)
- Hero tagline rotation plus inline trust badges linking to privacy/security blurbs
- Polished hero + navigation micro-animations for a richer UX feel
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

### Quick UX Smoke Test
1. Toggle the navigation (desktop + mobile widths) to see the underline/focus animation.
2. Hover the hero image/cards to confirm the parallax glow and depth transitions.
3. Scroll past the hero ensuring sticky header blur and back-to-top button behave smoothly.

## Quick Find Drawer
- Keyboard shortcut: press `⌘K` (macOS) or `Ctrl+K` (Windows/Linux) anywhere to open.
- Tracks clicks on any element with `data-track-story` to populate recents via `localStorage` key `miroza_recent_reads_v1`.
- Saved stories combine manual pins (from the drawer) and article “Appreciate” hearts, stored under `miroza_saved_stories_v1`.
- Category chips map directly to the latest feed filters when available; otherwise they deep-link to `/news.html`, `/blog.html`, or `/articles.html`.
- Drawer focus returns to the original trigger for accessibility, and opening the panel locks body scroll to avoid background jumps.

## Content Pipeline Workflow
1. Draft the long-form article under `articles/<slug>.html` with correct meta/JSON-LD and assign a unique `id` in `data/posts.json`.
2. Export responsive imagery (400/800/1200) and, when available, include AVIF/WebP sources by adding an `image.sources` array (see `buildCard` in `scripts/app.js`).
3. Update `data/posts.json` with the new entry, ensuring `category`, `date`, `views`, and `link`/`slug` are set.
4. Rebuild the home hero queue (top views automatically fill) or manually tag hero CTA by calling `window.MIROZA.hero.setItems([...])` in `app.js` if bespoke ordering is required.
5. Run a quick pass: open the site locally, interact with the new card, verify it appears in quick-find recents, and confirm Lighthouse/CLS metrics in `localStorage` (`miroza_vitals_snapshot`).


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
- `window.MIROZA.vitals` samples LCP/FID/CLS via `PerformanceObserver` and persists snapshots to `localStorage` (`miroza_vitals_snapshot`) for Lighthouse parity checks.
- Picture components accept optional `image.sources` entries so you can ship AVIF/WebP alongside existing SVG/PNG assets without touching layout code.
- Dedicated `/privacy.html` and `/security.html` outlines capture the policies you can share with stakeholders; the hero trust badges and assurance cards link directly to them.

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
