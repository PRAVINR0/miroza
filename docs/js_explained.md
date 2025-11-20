# JavaScript explained

This document explains the responsibilities and core functions of the JavaScript files.

`main.js`
- Smooth scroll for navbar links:
  - Selects `.nav-link` elements and calls `element.scrollIntoView({behavior: 'smooth'})` to navigate.
- Navbar background change on scroll:
  - Adds `.scrolled` to header when `window.scrollY > 24` to apply background and shadow.
- Button click animations:
  - Adds `btn-clicked` class briefly to indicate click feedback.
- Mobile menu toggle:
  - Toggles `document.body.classList.toggle('menu-open')` when the menu button is clicked.

`theme-toggle.js`
- Handles theme persistence in `localStorage` under key `miroza-theme`.
- Sets `html[data-theme]` to `dark` or `light`.
- Reads system preference `prefers-color-scheme` if no saved choice exists.
- Updates the toggle button icon (moon/sun).

`animations.js`
- Uses `IntersectionObserver` to observe elements with `.reveal-on-scroll`.
- When an element becomes visible (threshold 0.08), adds `.revealed` which triggers CSS transitions in `components.css`.
- Falls back to revealing all elements if `IntersectionObserver` is not available.

Notes
- The scripts are dependency-free (vanilla JS) and are safe to run in modern browsers.
- For older browsers, consider adding polyfills for `IntersectionObserver` if needed.
