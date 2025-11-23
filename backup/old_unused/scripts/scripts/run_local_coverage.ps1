<#
Runs the site locally, executes the coverage collector, and stops the server.

Usage: In PowerShell (from repo root):
  .\scripts\run_local_coverage.ps1

Requirements:
  - Node.js (>=16) and npm available in PATH
  - `npm ci` succeeds
  - `node server.js` (preview server) runs
  - `npm run coverage` is defined (runs `scripts/collect_coverage.js`)

This script will:
  1. Verify Node is installed
  2. Run `npm ci` to install dependencies
  3. Start `node server.js` in the background
  4. Run `npm run coverage` (in the foreground)
  5. Stop the background server process and exit with the coverage script status
#>

<# run_local_coverage.ps1 (disabled)
   Original moved to /backup/old_unused/scripts/run_local_coverage.ps1
#>
Write-Output 'run_local_coverage.ps1 disabled — original moved to /backup/old_unused/scripts/run_local_coverage.ps1'
