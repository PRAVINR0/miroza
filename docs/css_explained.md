# CSS explained

This file explains the styles and how to customize them.

Variables
- `--primary` — accent color used for buttons and links.
- `--background` — page background color for light mode.
- `--surface` — card surface color.
- `--muted` — secondary text color.
- `--text-color` — main text color.
- `--card-radius` — border radius for cards.
- `--transition` — base transition duration.

Files
- `main.css` contains the core layout rules:
  - Sticky header with `.site-header` and `.site-header.scrolled` state (applies background and shadow when the page scrolls).
  - `.container` centers content and constrains width.
  - `.hero` layout uses CSS grid and adapts at <880px.
  - `.grid` uses `grid-template-columns: repeat(auto-fit, minmax(260px,1fr))` — this creates responsive cards with auto-fit behavior.

- `components.css` contains card and reveal animations:
  - `.card` and `.card:hover` provide soft shadows and lift on hover.
  - `.reveal-on-scroll` and `.reveal-on-scroll.revealed` pair with `animations.js` to animate appearances.

- `dark-theme.css` overrides variables under `html[data-theme='dark']` so the theme toggling is fast and CSS-only (variables change instantly).

Tips
- To change colors, edit the variables in `main.css` and `dark-theme.css`.
- To speed up transitions, change `--transition` value.
- To change card radius, edit `--card-radius`.
