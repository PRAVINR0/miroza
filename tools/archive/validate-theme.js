const puppeteer = require('puppeteer');

async function checkPage(browser, url){
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  // wait for header or body
  await new Promise(r=>setTimeout(r,200));
  const hasToggle = await page.$('.theme-toggle');
  const results = { url, hasToggle: !!hasToggle };
  if(!hasToggle){
    await page.close();
    return results;
  }

  const htmlClassBefore = await page.evaluate(()=>document.documentElement.className || '');
  const imgBefore = await page.$eval('.theme-toggle img', el => el.getAttribute('src'))
    .catch(()=>null);

  await page.click('.theme-toggle');
  await new Promise(r=>setTimeout(r,250));

  const htmlClassAfter = await page.evaluate(()=>document.documentElement.className || '');
  const imgAfter = await page.$eval('.theme-toggle img', el => el.getAttribute('src'))
    .catch(()=>null);

  results.toggleClicked = true;
  results.htmlBefore = htmlClassBefore;
  results.htmlAfter = htmlClassAfter;
  results.imgBefore = imgBefore;
  results.imgAfter = imgAfter;

  await page.close();
  return results;
}

async function main(){
  const pages = [
    'http://localhost:8080/',
    'http://localhost:8080/news/news.html',
    'http://localhost:8080/blogs/blogs.html'
  ];

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const out = [];
  try{
    for(const p of pages){
      try{
        const r = await checkPage(browser, p);
        out.push(r);
        console.log('OK', p, r.hasToggle ? 'toggle' : 'no-toggle');
      }catch(e){
        console.error('ERR', p, e && e.message);
        out.push({ url: p, error: e && e.message });
      }
    }
  }finally{
    await browser.close();
  }

  console.log('\nRESULTS:\n', JSON.stringify(out, null, 2));

  const failures = out.filter(r => r.error || (r.hasToggle && (!r.toggleClicked || r.htmlBefore === r.htmlAfter)));
  process.exit(failures.length ? 2 : 0);
}

main().catch(e=>{ console.error(e); process.exit(3); });
