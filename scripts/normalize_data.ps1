<#
  normalize_data.ps1
  Ensure every item in assets/data/*.json has a string `slug` and an array `tags`.
  This script modifies files in-place. Run from repository root:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\normalize_data.ps1
#>

Set-StrictMode -Version Latest
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DataDir = Join-Path $RepoRoot 'assets\data'

function Safe-Slug([string]$s){ if(-not $s) { return '' } ; return ($s.ToLower() -replace '[^a-z0-9]+','-').Trim('-') }

if(-not (Test-Path $DataDir)){ Write-Error "Data directory not found: $DataDir"; exit 2 }

Get-ChildItem -Path $DataDir -Filter *.json | ForEach-Object {
  $path = $_.FullName
  try{
    $arr = Get-Content -Raw -Path $path | ConvertFrom-Json -ErrorAction Stop
  }catch{
    Write-Warning -Message ("Failed to parse {0}: {1}" -f $path, $_.Exception.Message)
    return
  }
  if(-not ($arr -is [System.Collections.IEnumerable])){ Write-Warning "$path does not contain an array, skipping"; return }
  $changed = $false
  for($i=0; $i -lt $arr.Count; $i++){
    $orig = $arr[$i]
    $new = [ordered]@{}
    # id
    try{ $id = $orig.id } catch { $id = $null }
    if(-not $id){ $id = ([guid]::NewGuid().ToString()) }
    $new.id = $id
    # title
    try{ $title = $orig.title } catch { $title = $null }
    $new.title = $title
    # slug
    try{ $slug = $orig.slug } catch { $slug = $null }
    if(-not $slug -or $slug -eq ''){ $slug = Safe-Slug $title; if(-not $slug){ $slug = $id } }
    $new.slug = $slug
    # tags
    try{ $tags = $orig.tags } catch { $tags = @() }
    if($tags -is [string]){ $tags = @($tags) } elseif(-not ($tags -is [System.Collections.IEnumerable])){ $tags = @() }
    $new.tags = $tags
    # date
    try{ $date = $orig.date } catch { $date = $null }
    if(-not $date){ $date = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssZ') }
    $new.date = $date
    # other optional fields
    foreach($prop in @('description','content','category','type','views','image','og_image')){
      try{ $val = $orig.$prop } catch { $val = $null }
      $new[$prop] = $val
    }
    $arr[$i] = [PSCustomObject]$new
    $changed = $true
  }
  if($changed){
    try{
      ($arr | ConvertTo-Json -Depth 10) | Out-File -FilePath $path -Encoding UTF8
      Write-Output "Normalized: $path"
    }catch{
      Write-Warning -Message ("Failed to write {0}: {1}" -f $path, $_.Exception.Message)
    }
  } else {
    Write-Output "No changes needed: $path"
  }
}

Write-Output "Normalization complete."
