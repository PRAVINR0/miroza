# MIROZA

Miroza is a modern, world-class news and articles website featuring a responsive 3-column layout inspired by leading global publications like The Times of India.

## Features

- **Responsive Design:** A robust 3-column grid layout (Left Sidebar, Center Content, Right Sidebar) that adapts seamlessly to mobile devices.
- **Clean Typography:** Uses a combination of Georgia (Serif) for headings and Roboto (Sans-Serif) for body text for optimal readability.
- **Navigation:** Sticky header with a comprehensive navigation menu and a mobile-friendly hamburger menu.
- **Performance:** Lightweight static HTML, CSS, and JS with no heavy framework dependencies.
- **PWA Ready:** Includes a Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) for offline capabilities and installability.

## Project Structure

```
miroza/
 index.html          # Homepage
 news.html           # News section landing page
 articles.html       # Articles section landing page
 blog.html           # Blogs section landing page
 about.html          # About Us page
 contact.html        # Contact Us page
 privacy.html        # Privacy Policy
 terms.html          # Terms of Use
 security.html       # Security Policy
 newsletter.html     # Newsletter subscription page
 404.html            # Custom 404 Error page
 offline.html        # Offline fallback page
 styles/
    main.css        # Main stylesheet containing all styles and variables
 scripts/
    app.js          # Main JavaScript for navigation and UI interactions
 articles/           # Directory for article content pages
 news/               # Directory for news content pages
 blogs/              # Directory for blog content pages
 assets/             # Images and icons
 sw.js               # Service Worker
 manifest.json       # Web App Manifest
 robots.txt          # SEO configuration
 sitemap.xml         # Sitemap
```

## Getting Started

Since this is a static website, you can serve it using any static file server.

### Using Python
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Using Node.js (serve)
```bash
npx serve .
```

## Customization

- **Styles:** Edit `styles/main.css` to change colors (e.g., `--toi-red`), fonts, or layout dimensions.
- **Scripts:** Edit `scripts/app.js` to modify behavior like the sticky header or mobile menu.
- **Content:** Add new HTML files to `articles/`, `news/`, or `blogs/` using the existing files as templates.

## License

Copyright  2025 Miroza Media Ltd. All rights reserved.

