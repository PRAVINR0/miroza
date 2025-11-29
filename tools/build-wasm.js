#!/usr/bin/env node
// Fallback build using esbuild-wasm when native esbuild isn't available
const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchBuffer(url){
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if(res.statusCode !== 200) return reject(new Error('Failed to download ' + url + ' status ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

(async function(){
  try{
    const esbuild = require('esbuild-wasm');
    // download wasm binary and initialize with wasmBinary for Node
    const wasmUrl = 'https://unpkg.com/esbuild-wasm@0.18.10/esbuild.wasm';
    console.log('Downloading esbuild wasm from', wasmUrl);
    const buf = await fetchBuffer(wasmUrl);
    await esbuild.initialize({ wasmBinary: buf });

    const result = await esbuild.build({
      entryPoints: [path.join(process.cwd(), 'scripts', 'app.js')],
      bundle: true,
      minify: true,
      target: ['es2018'],
      write: true,
      outfile: path.join(process.cwd(), 'scripts', 'app.min.js')
    });
    console.log('esbuild-wasm: build completed.');
    process.exit(0);
  }catch(err){
    console.error('esbuild-wasm build failed:', err);
    process.exit(1);
  }
})();
