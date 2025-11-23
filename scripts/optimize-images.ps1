<#
  optimize-images.ps1
  Downloads image URLs found in `assets/data/*.json`, creates:
    - `assets/images/originals/<hash>.<ext>`  (downloaded source)
    - `assets/images/optimized/<hash>.jpg`    (resized up to 1200px width)
    - `assets/images/placeholders/<hash>.jpg`  (tiny 32px-wide placeholder)
  Also writes `assets/data/image-placeholders.json` mapping original URL -> data URI (base64) for client-side blur-up.

  Requirements: Windows PowerShell 5.1 with .NET Framework (System.Drawing). Run from repo root:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\optimize-images.ps1

  Note: This script performs network downloads and image processing locally. Use responsibly.
#>

Set-StrictMode -Version Latest
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DataDir = Join-Path $RepoRoot 'assets\data'
$OrigDir = Join-Path $RepoRoot 'assets\images\originals'
$OptDir = Join-Path $RepoRoot 'assets\images\optimized'
$PlcDir = Join-Path $RepoRoot 'assets\images\placeholders'
$OutMap = Join-Path $DataDir 'image-placeholders.json'

New-Item -ItemType Directory -Force -Path $OrigDir | Out-Null
New-Item -ItemType Directory -Force -Path $OptDir | Out-Null
New-Item -ItemType Directory -Force -Path $PlcDir | Out-Null

function HashString([string]$s){ $h = [System.Security.Cryptography.SHA1]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($s)); return ([System.BitConverter]::ToString($h)).Replace('-','').ToLower() }

Add-Type -AssemblyName System.Drawing

$urls = @{}
Get-ChildItem -Path $DataDir -Filter *.json | ForEach-Object {
  try{ $arr = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json -ErrorAction Stop } catch{ Write-Warning "Skipping $_.Name (invalid JSON)"; return }
  if($arr -is [System.Collections.IEnumerable]){
    foreach($it in $arr){ if($it.image){ $urls[$it.image] = $true } } 
  }
}

if(-not $urls.Keys.Count){ Write-Output "No image URLs found in $DataDir"; exit 0 }

$map = @{}
foreach($url in $urls.Keys){
  Write-Output "Processing: $url"
  try{
    $hash = HashString $url
    $ext = [IO.Path]::GetExtension($url)
    if(-not $ext){ $ext = '.jpg' }
    $origPath = Join-Path $OrigDir ($hash + $ext)
    if(-not (Test-Path $origPath)){
      Write-Output "  Downloading..."
      try{ Invoke-WebRequest -Uri $url -OutFile $origPath -UseBasicParsing -ErrorAction Stop } catch { Write-Warning "  Download failed: $($_.Exception.Message)"; continue }
    } else { Write-Output "  Already downloaded." }

    # Load image
    $bmp = [System.Drawing.Image]::FromFile($origPath)

    # Save optimized (max width 1200)
    $maxW = 1200
    $ow = $bmp.Width; $oh = $bmp.Height
    if($ow -gt $maxW){ $nw = $maxW; $nh = [int]([double]$oh * $nw / $ow) } else { $nw = $ow; $nh = $oh }
    $optBmp = New-Object System.Drawing.Bitmap $nw, $nh
    $g = [System.Drawing.Graphics]::FromImage($optBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($bmp, 0,0, $nw, $nh)
    $g.Dispose()
    $optPath = Join-Path $OptDir ($hash + '.jpg')
    $enc = [System.Drawing.Imaging.ImageFormat]::Jpeg
    $optBmp.Save($optPath, $enc)
    $optBmp.Dispose()

    # Save placeholder (width 32)
    $pw = 32
    $ph = [int]([double]$oh * $pw / $ow)
    $plcBmp = New-Object System.Drawing.Bitmap $pw, $ph
    $g2 = [System.Drawing.Graphics]::FromImage($plcBmp)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($bmp, 0,0, $pw, $ph)
    $g2.Dispose()
    $plcPath = Join-Path $PlcDir ($hash + '.jpg')
    $plcBmp.Save($plcPath, $enc)
    $plcBmp.Dispose()

    $bmp.Dispose()

    # Map URL -> base64 data uri
    $bytes = [IO.File]::ReadAllBytes($plcPath)
    $b64 = [Convert]::ToBase64String($bytes)
    $dataUri = "data:image/jpeg;base64,$b64"
    $map[$url] = $dataUri
    Write-Output "  Optimized and placeholder saved."
  }catch{
    Write-Warning "Failed processing $url : $($_.Exception.Message)"
  }
}

try{
  ($map | ConvertTo-Json -Depth 5) | Out-File -FilePath $OutMap -Encoding UTF8
  Write-Output "Wrote placeholders map: $OutMap"
}catch{ Write-Warning "Failed to write placeholder map: $($_.Exception.Message)" }

Write-Output "Image optimization complete."
