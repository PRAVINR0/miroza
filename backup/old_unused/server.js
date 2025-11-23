#!/usr/bin/env node
const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Enable gzip compression
app.use(compression());

// Serve static files from repo root
const ROOT = path.resolve(__dirname);
app.use(express.static(ROOT, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Do not cache HTML pages long-term
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Fallback to index.html for SPA-like navigation
app.get('*', (req, res) => {
  const index = path.join(ROOT, 'index.html');
  res.sendFile(index, err => {
    if (err) res.status(404).end();
  });
});

app.listen(PORT, () => console.log(`Static server running at http://localhost:${PORT}`));
