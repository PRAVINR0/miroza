#!/usr/bin/env node
// Fallback build using esbuild-wasm when native esbuild isn't available
const fs = require('fs');
const path = require('path');
(async function(){
  try{
    const { initialize, build } = require('esbuild-wasm');
    const http = require('http');
    await initialize({ wasmURL: 'https://unpkg.com/esbuild-wasm@0.18.10/esbuild.wasm' });
    const result = await build({
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
