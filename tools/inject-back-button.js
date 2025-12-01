const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

const sections = [
  { dir: 'articles', backLink: '/articles/articles.html', backText: 'Back to Articles' },
  { dir: 'news', backLink: '/news/news.html', backText: 'Back to News' },
  { dir: 'blogs', backLink: '/blogs/blogs.html', backText: 'Back to Blogs' }
];

function processFile(filePath, section) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Inject CSS link if missing
  if (!content.includes('href="/styles/global.css"')) {
      const cssLink = '<link rel="stylesheet" href="/styles/global.css" />';
      // Try to insert after styles.min.css
      if (content.includes('href="/styles/styles.min.css"')) {
          content = content.replace('<link rel="stylesheet" href="/styles/styles.min.css" />', '<link rel="stylesheet" href="/styles/styles.min.css" />\n  ' + cssLink);
          console.log(`Added global.css link to ${filePath}`);
          modified = true;
      } else if (content.includes('</head>')) {
          content = content.replace('</head>', `  ${cssLink}\n</head>`);
          console.log(`Added global.css link to ${filePath} (before head close)`);
          modified = true;
      }
  }

  // 2. Inject Back Button if missing
  if (!content.includes('class="btn-back"')) {
    const backButtonHtml = `
    <div class="content-navigation">
      <a href="${section.backLink}" class="btn-back">
        <span class="icon-arrow-left">←</span> ${section.backText}
      </a>
    </div>`;

    // Insert after <article ...> tag opening.
    const articleTagRegex = /(<article[^>]*>)/i;
    
    if (articleTagRegex.test(content)) {
      content = content.replace(articleTagRegex, `$1\n${backButtonHtml}`);
      console.log(`Added back button to ${filePath}`);
      modified = true;
    } else {
      // Fallback: try to insert after <main ...>
      const mainTagRegex = /(<main[^>]*>)/i;
      if (mainTagRegex.test(content)) {
          content = content.replace(mainTagRegex, `$1\n${backButtonHtml}`);
          console.log(`Added back button to ${filePath} (in main)`);
          modified = true;
      } else {
          console.warn(`Could not find <article> or <main> tag in ${filePath}`);
      }
    }
  } else {
      console.log(`Skipping back button for ${filePath} (already exists)`);
  }

  if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
  }
}

sections.forEach(section => {
  const dirPath = path.join(rootDir, section.dir);
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (!file.endsWith('.html')) return;
    // Skip the main listing page (e.g. articles.html in articles folder)
    if (file === `${section.dir}.html`) return;

    processFile(path.join(dirPath, file), section);
  });
});
