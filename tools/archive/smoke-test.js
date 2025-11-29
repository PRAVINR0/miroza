const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const pages = [
  '/',
  '/index.html',
  '/news/news.html',
  '/news/india-gdp-expected-73-q2.html',
  '/articles/articles.html',
  '/articles/global-tech-markets.html',
  '/blogs/blogs.html'
];

const base = process.env.BASE_URL || 'http://localhost:8080';

function startServer(){
  return new Promise((resolve, reject) => {
    const server = spawn(process.execPath, [path.join(__dirname,'static-server.js')], { cwd: path.join(__dirname,'..') });
    let ready = false;
    server.stdout.on('data', d => {
      const s = d.toString();
      process.stdout.write(s);
      if(s.includes('Static server running')){
        ready = true;
        resolve(server);
      }
    });
    server.stderr.on('data', d => process.stderr.write(d.toString()));
    server.on('error', e => { if(!ready) reject(e); });
    // safety timeout
    setTimeout(()=>{ if(!ready) reject(new Error('Server failed to start within timeout')); }, 8000);
  });
}

(async ()=>{
  let serverProc = null;
  try{
    serverProc = await startServer();
  }catch(e){ console.error('Failed to start server:', e); process.exit(2); }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);

  const report = [];

  page.on('console', msg => {
    report.push({ type: 'console', text: msg.text(), location: (msg.location && msg.location.url) || '' });
  });

  page.on('pageerror', err => {
    report.push({ type: 'page-error', text: err.message });
  });

  page.on('response', res => {
    const status = res.status();
    if(status >= 400){
      report.push({ type: 'http-error', url: res.url(), status });
    }
  });

  page.on('requestfailed', req => {
    report.push({ type: 'request-failed', url: req.url(), failure: req.failure() ? req.failure().errorText : '' });
  });

  for(const p of pages){
    const url = (p.startsWith('http') ? p : (base + p));
    console.log('Testing', url);
    try{
      const res = await page.goto(url, { waitUntil: 'networkidle2' });
      report.push({ type: 'visit', url, status: res ? res.status() : 'no-response' });
      try{
        const hasMain = (await page.$('#main')) !== null;
        const cards = await page.$$eval('.card', els => els.length).catch(()=>0);
        report.push({ type: 'dom-snapshot', url, hasMain, cards });
      }catch(e){ report.push({ type: 'dom-snapshot-error', url, err: e.message }); }
      await new Promise(r => setTimeout(r, 500));
      await new Promise(r => setTimeout(r, 500));
    }catch(e){
      report.push({ type: 'visit-error', url, err: String(e) });
    }
  }

  await browser.close();

  // stop server
  try{ serverProc.kill(); }catch(e){}

  // summarize
  const errors = report.filter(r => r.type === 'page-error' || r.type === 'http-error' || r.type === 'request-failed' || r.type === 'visit-error');
  console.log('\nSMOKE TEST REPORT');
  console.log('-----------------');
  report.forEach(r => console.log(JSON.stringify(r)));
  console.log('\nSUMMARY:');
  console.log('Total events:', report.length);
  console.log('Errors found:', errors.length);
  const out = { report, summary:{ events:report.length, errors: errors.length } };
  fs.writeFileSync(path.join(__dirname,'..','REVIEW_SMOKE.json'), JSON.stringify(out, null, 2));
  console.log('Report written to REVIEW_SMOKE.json');
  if(errors.length) process.exitCode = 2;
  else process.exitCode = 0;
})();
