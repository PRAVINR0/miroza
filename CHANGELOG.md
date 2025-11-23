# Changelog

All notable changes to this project are documented in this file.

## Unreleased (2025-11-23)
- Move theme-init to external file `/scripts/theme-init.js` to avoid FOUC and allow stricter CSP for scripts.
- Externalized inline share handlers to `/scripts/inline-handlers.js` and removed inline `onclick` attributes.
- Tightened CSP in HTML templates by removing `script-src 'unsafe-inline'` (styles still allow inline until migrated).
- Enhanced `sw.js` with versioned caches, runtime image caching, and cache cleanup on activate.
- Cleaned stray artifacts and normalized paths in `article.html`.

## 2025-11-22
- Initial project scaffold and baseline template files.
