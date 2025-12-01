const fs = require('fs');
const path = require('path');

const SEARCH_FORM_HTML = `
      <form class="search-form" role="search" onsubmit="return false;">
        <label for="search" class="visually-hidden">Search</label>
        <input id="search" name="q" type="search" placeholder="Search..." autocomplete="off" />
        <div class="search-suggestions" id="search-suggestions" hidden></div>
      </form>`;

const THEME_TOGGLE_HTML = `
      <button class="theme-toggle" aria-label="Toggle dark mode">
        <img src="/assets/icons/moon.svg" alt="Enable dark mode" width="24" height="24" />
      </button>`;

const DIRS_TO_SCAN = [
    path.join(__dirname, '../news'),
    path.join(__dirname, '../articles'),
    path.join(__dirname, '../blogs')
];

let fixedCount = 0;
let scannedCount = 0;

function processFile(filePath) {
    scannedCount++;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Check for header-inner to ensure we are in the right place
    if (!content.includes('class="header-inner"')) return;

    // 1. Check and Inject Search Form
    if (!content.includes('class="search-form"')) {
        if (content.includes('</nav>')) {
            content = content.replace('</nav>', '</nav>' + SEARCH_FORM_HTML);
            changed = true;
        }
    }

    // 2. Check and Inject Theme Toggle
    if (!content.includes('class="theme-toggle"')) {
        if (content.includes('class="search-form"')) {
             // Insert after search form closing tag
             content = content.replace('</form>', '</form>' + THEME_TOGGLE_HTML);
             changed = true;
        } else if (content.includes('</nav>')) {
             // Fallback: Insert after nav if search form is still missing for some reason
             content = content.replace('</nav>', '</nav>' + THEME_TOGGLE_HTML);
             changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        fixedCount++;
        if (fixedCount % 1000 === 0) console.log(`Fixed ${fixedCount} files...`);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}

console.log("Starting Header Audit & Fix...");
DIRS_TO_SCAN.forEach(dir => walkDir(dir));
console.log(`Audit Complete. Scanned ${scannedCount} files. Fixed ${fixedCount} files.`);
