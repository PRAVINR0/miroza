const path = require('path');
const puppeteer = require('puppeteer');

async function run(){
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.error('[pageerror]', err);
  });
  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);
  const summary = await page.evaluate(() => ({
    cards: document.querySelectorAll('.cards .card').length,
    lazyReady: document.querySelectorAll('[data-lazy].lazy-ready').length,
    pageType: document.body?.dataset?.page || 'unknown'
  }));
  console.log('Page summary:', summary);
  await browser.close();
}

run().catch(err => {
  console.error('[debug-homepage] Failed', err);
  process.exitCode = 1;
});
