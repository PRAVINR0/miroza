#!/usr/bin/env node
// collect_coverage.js
// Visits site pages on localhost:8080, gathers CSS and JS coverage using Puppeteer,
// and writes a summary report to `assets/data/coverage-report.json`.

const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

async function loadFirstId(dataPath){
  try{
    const txt = await fs.readFile(dataPath,'utf8');
    const arr = JSON.parse(txt);
    if(Array.isArray(arr) && arr.length>0){ return arr[0].id || arr[0].slug || null }
  }catch(e){ }
  return null;
}

async function run(){
  const host = process.env.HOST || 'http://localhost:8080';
  // determine a valid detail URL by reading articles/news
  const artId = await loadFirstId(path.join(__dirname,'..','assets','data','articles.json'));
  const pages = ['/', '/index.html', '/news.html', '/blog.html', '/articles.html', '/stories.html', '/info.html', '/search.html'];
  if(artId) pages.push(`/detail.html?type=articles&id=${encodeURIComponent(artId)}`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // start coverage
  await Promise.all([page.coverage.startCSSCoverage(), page.coverage.startJSCoverage()]);

  const visited = [];
  for(const p of pages){
    const url = host.replace(/\/$/,'') + p;
    try{
      console.log('Visiting', url);
      const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      visited.push({ url, status: res && res.status ? res.status() : null });
      // small delay to let lazy images etc. load
      await page.waitForTimeout(600);
    }catch(e){ console.warn('Failed', url, e.message); visited.push({ url, error: e.message }); }
  }

  const [jsCoverage, cssCoverage] = await Promise.all([page.coverage.stopJSCoverage(), page.coverage.stopCSSCoverage()]);

  await browser.close();

  // Summarize
  function summarizeCoverage(list){
    return list.map(item=>{
      const used = item.ranges.reduce((s,r)=>s + (r.end - r.start), 0);
      return { url: item.url || item.sourceURL || '(inline)', textLength: item.text ? item.text.length : 0, usedBytes: used, totalBytes: item.text ? item.text.length : 0 };
    });
  }

  const report = { generated: new Date().toISOString(), visited, js: summarizeCoverage(jsCoverage), css: summarizeCoverage(cssCoverage) };
  const outPath = path.join(__dirname,'..','assets','data','coverage-report.json');
  await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Coverage written to', outPath);
}

run().catch(err=>{ console.error(err); process.exitCode = 2 });
