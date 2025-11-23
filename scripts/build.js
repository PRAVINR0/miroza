#!/usr/bin/env node
// Simple build script: minifies JS and CSS in-place for quick deploys
const fs = require('fs').promises;
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');

const ROOT = path.resolve(__dirname, '..');
const ASSETS_CSS = path.join(ROOT, 'assets', 'css');
const ASSETS_JS = path.join(ROOT, 'assets', 'js');

async function minifyCss(file){
  try{
    const src = await fs.readFile(file,'utf8');
    const out = new CleanCSS({level:2}).minify(src);
    if(out.styles){ await fs.writeFile(file, out.styles, 'utf8'); console.log('Minified CSS:', path.basename(file)); }
  }catch(e){ console.warn('CSS minify failed', file, e.message); }
}

async function minifyJs(file){
  try{
    const src = await fs.readFile(file,'utf8');
    const res = await Terser.minify(src, {
      ecma: 2020,
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    if(res.error) throw res.error;
    if(res.code){ await fs.writeFile(file, res.code, 'utf8'); console.log('Minified JS:', path.basename(file)); }
  }catch(e){ console.warn('JS minify failed', file, e.message); }
}

async function walk(dir, ext, fn){
  const items = await fs.readdir(dir);
  for(const it of items){
    const p = path.join(dir, it);
    const stat = await fs.stat(p);
    if(stat.isDirectory()) await walk(p, ext, fn);
    else if(p.endsWith(ext)) await fn(p);
  }
}

async function run(){
  console.log('Starting build — minifying assets...');
  try{
    await walk(ASSETS_CSS, '.css', minifyCss);
    await walk(ASSETS_JS, '.js', minifyJs);
    console.log('Build complete.');
  }catch(e){ console.error('Build failed', e); process.exitCode = 2 }
}

run();
