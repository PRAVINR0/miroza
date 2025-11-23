// Lightweight Puppeteer smoke-test for theme toggle
// Usage:
// 1. Serve the site locally (e.g. `python -m http.server 8080` or your dev flow)
// 2. Install puppeteer: `npm install puppeteer --save-dev`
// 3. Run: `node scripts/test-theme-toggle.js http://localhost:8080`

const puppeteer = require('puppeteer');
const pages = [
  '/',
  '/index.html',
  '/news.html',
  '/articles.html',
  '/stories.html',
  '/blog.html',
  '/detail.html?type=stories&id=2&slug=the-thunder-boy-rise-of-aayden-storm'
];

(async ()=>{
  const base = process.argv[2] || 'http://localhost:8080';
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  for(const p of pages){
    const url = new URL(p, base).href;
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    try{
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(300);
      const headerToggle = await page.$('#theme-toggle');
      const fabTheme = await page.$x("//button[contains(text(),'☼') or contains(@title,'Toggle theme')]");
      const uiCheckbox = await page.$('#ui-toggle-theme');

      const headerVisible = headerToggle ? await page.evaluate(el => { const r = el.getBoundingClientRect(); return (r.width>0 && r.height>0); }, headerToggle) : false;
      const fabCount = fabTheme.length;
      const checkboxPresent = !!uiCheckbox;

      // read current data-theme and localStorage key
      const dataTheme = await page.evaluate(()=> document.documentElement.getAttribute('data-theme'));
      const stored = await page.evaluate(()=> localStorage.getItem('miroza-theme'));

      // Click header toggle and verify change persisted
      let toggled = null;
      if(headerToggle){
        await headerToggle.click();
        await page.waitForTimeout(250);
        const afterTheme = await page.evaluate(()=> document.documentElement.getAttribute('data-theme'));
        const afterStored = await page.evaluate(()=> localStorage.getItem('miroza-theme'));
        toggled = { afterTheme, afterStored };
      }

      results.push({ url, headerVisible, fabCount, checkboxPresent, dataTheme, stored, toggled });
      await page.close();
    }catch(err){
      results.push({ url, error: err.message });
      try{ await page.close(); }catch(e){}
    }
  }

  await browser.close();
  console.log('\nTheme toggle smoke-test results:');
  for(const r of results){
    console.log('---');
    console.log(r.url);
    if(r.error){ console.log('ERROR:', r.error); continue; }
    console.log('Header toggle visible:', r.headerVisible);
    console.log('Floating FAB theme buttons found:', r.fabCount);
    console.log('Injected UI theme checkbox present:', r.checkboxPresent);
    console.log('Initial data-theme:', r.dataTheme, 'localStorage:', r.stored);
    if(r.toggled){ console.log('After toggle data-theme:', r.toggled.afterTheme, 'stored:', r.toggled.afterStored); }
  }
  console.log('\nNotes: For accurate results, run the server and ensure pages are reachable at the base URL you pass as the first argument.');
})();
