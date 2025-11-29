Development & Test Setup
=======================

Quick notes for running the included tools locally (Windows PowerShell):

- Start the static server (serves files from repo root on port 8080):

```powershell
# from repo root
node ./tools/static-server.js
# then open http://localhost:8080 in a browser
```

- Run the link-checker (verifies entries in `data/posts.json` map to files):

```powershell
node ./tools/check-links.js
```

- Run the smoke tests (spawns the static server and uses Puppeteer):

```powershell
node ./tools/smoke-test.js
```

Note: The smoke test requires `puppeteer` to be available. You can install dev dependencies with:

```powershell
npm install
```

Or install `puppeteer` alone:

```powershell
npm install --no-save puppeteer
```

- Add `defer` to script tags referencing `scripts/*.js` (conservative, non-destructive):

```powershell
node ./tools/add-defer-to-scripts.js
```

If you'd like me to run any of the above for you (install deps, run smoke tests), tell me and I'll proceed.
