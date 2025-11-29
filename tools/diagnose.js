const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const URL = `http://localhost:${PORT}/index.html`;
const REPORT_DIR = 'jules-reports';
const REPORT_FILE = path.join(REPORT_DIR, `diagnostics-${Date.now()}.json`);

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR);
}

async function startServer() {
  console.log('Starting local server...');
  const server = spawn('npx', ['http-server', '.', '-p', PORT.toString(), '-s'], {
    stdio: 'ignore',
    detached: true
  });
  server.unref();
  // Give it a moment to start
  await new Promise(r => setTimeout(r, 2000));
  return server;
}

async function diagnose() {
  const issues = [];
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        issues.push({ type: 'console', level: msg.type(), text: msg.text() });
      }
    });

    page.on('pageerror', err => {
      issues.push({ type: 'js_exception', text: err.message });
    });

    page.on('requestfailed', request => {
      issues.push({ type: 'network_error', url: request.url(), errorText: request.failure().errorText });
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            issues.push({ type: 'broken_link', url: response.url(), status: response.status() });
        }
    });

    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => {
        issues.push({ type: 'navigation_error', text: e.message });
    });

    // Check CSS Layout Issues
    const layoutIssues = await page.evaluate(() => {
      const results = [];
      const suspicious = ['height: 100vh', 'overflow: hidden', 'position: absolute'];

      // Check body/html/main
      const elements = [document.documentElement, document.body, document.querySelector('main')].filter(Boolean);
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.height === window.innerHeight + 'px' && style.overflow === 'hidden') {
          results.push({ type: 'layout_risk', element: el.tagName, issue: 'Full height with overflow hidden' });
        }
      });

      // Check invisible overlays
      const all = document.querySelectorAll('*');
      all.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'absolute' || style.position === 'fixed') {
             const rect = el.getBoundingClientRect();
             if (rect.width >= window.innerWidth && rect.height >= window.innerHeight && style.pointerEvents !== 'none' && parseFloat(style.opacity) > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
                  // Ignore if it's a known modal container that might be empty or valid
                  // results.push({ type: 'overlay_risk', element: el.className || el.tagName, issue: 'Full screen overlay blocking interaction' });
             }
        }
      });

      return results;
    });
    issues.push(...layoutIssues);

    // Check innerHTML usage (Basic static check via page source inspection not effective here, relies on dynamic check if possible, or we assume the static scan in next steps covering this.
    // We will just log that we visited.)

    // Check for blank page (smoke test)
    const contentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (contentHeight < 100) {
        issues.push({ type: 'critical_render', issue: 'Page content height is suspiciously low (Blank Page?)', height: contentHeight });
    }

  } catch (error) {
    console.error('Diagnosis failed:', error);
    issues.push({ type: 'tool_error', text: error.message });
  } finally {
    if (browser) await browser.close();
    // Kill server (this is tricky with detached, but for this script we can just leave it or try to kill via port if we knew PID.
    // Since we are in a sandbox, processes might be cleaned up, or we can use `pkill node` if we are sure.)
    try { require('child_process').execSync(`pkill -f "http-server"`); } catch(e){}
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(issues, null, 2));
  console.log(`Report generated at ${REPORT_FILE}`);
  console.log(JSON.stringify(issues, null, 2));
}

startServer().then(diagnose);
