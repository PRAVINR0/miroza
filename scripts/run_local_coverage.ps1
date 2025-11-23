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

param(
    [int]$ServerStartWaitSeconds = 2
)

function Ensure-Node {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed or not in PATH. Install Node >=16 and re-run this script."
        exit 1
    }
}

Ensure-Node

Write-Host "Installing dependencies (npm ci)..."
npm ci
if ($LASTEXITCODE -ne 0) { Write-Error "npm ci failed (exit $LASTEXITCODE). Fix locally and re-run."; exit $LASTEXITCODE }

Write-Host "Starting preview server (node server.js)..."
$proc = Start-Process -FilePath node -ArgumentList 'server.js' -PassThru -WindowStyle Hidden
Start-Sleep -Seconds $ServerStartWaitSeconds

Write-Host "Running coverage (npm run coverage)..."
npm run coverage
$coverageExit = $LASTEXITCODE

Write-Host "Stopping preview server (PID $($proc.Id))..."
try {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
} catch {
    Write-Warning "Failed to stop process $($proc.Id): $_"
}

if ($coverageExit -ne 0) {
    Write-Error "Coverage script failed with exit code $coverageExit"
    exit $coverageExit
}

Write-Host "Coverage run completed successfully. Check the coverage artifacts (see `scripts/collect_coverage.js` for output location)."
exit 0
