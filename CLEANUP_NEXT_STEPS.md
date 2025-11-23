## Cleanup Next Steps — Run Coverage Locally

I prepared a PowerShell helper script to run the preview server and the Puppeteer coverage collector.

Files added:
- `scripts/run_local_coverage.ps1` — runs `npm ci`, starts `node server.js`, runs `npm run coverage`, then stops the server.

How to run (PowerShell):

```powershell
# from repository root
npm ci
.\scripts\run_local_coverage.ps1
```

Notes:
- This environment did not have Node.js available (the earlier `node server.js` attempt exited with code 1). Run the script on your machine where Node is installed.
- The coverage script `npm run coverage` is expected to run `scripts/collect_coverage.js` and write its artifacts (see that script for exact output path).

After you run the script, please upload the generated coverage report(s) or paste the output here and I'll:

1. Analyze CSS/JS coverage and identify safe removals.
2. Produce conservative patch(es) removing unused selectors and dead JS functions.
3. Run a smoke-test checklist (manual steps) and finalize the cleanup report.
# Cleanup — Next Steps (commands to run locally)

I started a conservative, safe cleanup and refactor. To finish the full automated cleanup (remove unused CSS selectors and dead JS safely) we need runtime coverage data. Follow these steps locally and then share the generated coverage report (`assets/data/coverage-report.json`) or let me run further edits.

1) Ensure Node.js (>=16) is installed on your machine. Verify:

```powershell
node -v
npm -v
```

2) Install dev dependency (Puppeteer) — this will download a Chromium binary used for coverage collection:

```powershell
npm ci
npm install puppeteer --save-dev
```

3) Start the local static server (leave this running in a terminal):

```powershell
node server.js
# server listens on http://localhost:8080 by default
```

4) In another terminal, run the coverage script:

```powershell
npm run coverage
```

This writes `assets/data/coverage-report.json`. Share that file or commit it and tell me; I'll analyze it and apply safe removals (unused CSS, unused JS branches, dead files) and then run smoke tests.

If you'd rather I proceed without running coverage, I can continue with conservative, manual cleanup (merge duplicate CSS rules, remove commented-out code, and make additional refactors). That approach is safer but may leave unused selectors behind.

If you'd like me to attempt running these steps here, allow me to install Node in the environment or run the commands — otherwise please run them locally and then I will proceed with the automated removals based on the coverage output.
