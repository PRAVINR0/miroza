const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function run() {
  const url = process.argv[2] || 'http://localhost:8080';
  console.log('Starting Chrome and running Lighthouse for', url);
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });
  try {
    const options = {port: chrome.port, logLevel: 'info', output: 'json'};
    const runnerResult = await lighthouse(url, options);
    const reportJson = runnerResult.report;
    fs.writeFileSync('lh-report.json', reportJson, 'utf8');
    console.log('Lighthouse JSON written to lh-report.json');
    // print a short summary
    try {
      const parsed = JSON.parse(reportJson);
      const categories = parsed.categories || {};
      const summary = Object.keys(categories).map(k => ({key: k, score: categories[k].score}));
      console.log('Category scores (0-1):', summary);
    } catch (e) {
      // ignore
    }
  } finally {
    await chrome.kill();
  }
}

run().catch(err => {
  console.error('Lighthouse run failed:', err && err.message ? err.message : err);
  process.exit(1);
});
