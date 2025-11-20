# Project structure — Miroza

This document explains the folder layout and purpose of each file.

Root
- `index.html` — the site entrypoint. Works standalone for GitHub Pages.

/assets
- `/css` — stylesheets
  - `main.css` — base layout, typography, header/footer
  - `components.css` — cards, buttons, transitions, reveal animations
  - `dark-theme.css` — variable overrides for dark theme (applied via `html[data-theme='dark']`)
- `/js` — JavaScript behavior
  - `main.js` — smooth scroll, navbar scroll behavior, small click animations, mobile menu toggle
  - `theme-toggle.js` — toggles and persists user's theme choice in `localStorage`
  - `animations.js` — IntersectionObserver-based reveal effects for scroll
- `/images` — static images
  - `logo.svg` — minimal emblem used in header

/docs
- `structure_explained.md` — this file
- `css_explained.md` — explains CSS variables, layout and responsive rules
- `js_explained.md` — explains JS functions and flow
- `how_to_add_new_posts.md` — instructions for adding article HTML files manually

Notes
- All paths are relative so the site runs from the repo root on GitHub Pages.
- Keep generated or large media outside the repo; use CDN or external storage if needed.
