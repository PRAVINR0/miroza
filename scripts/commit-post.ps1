<#
  commit-post.ps1
  Usage (PowerShell):
    .\scripts\commit-post.ps1 -MergedFilePath .\news-merged-my-post.json -Type news -Message "Add news post"

  This script copies the merged JSON into `assets/data/<type>.json`, runs the generator, stages and commits the changes locally.
  It expects Git to be available and that you're on a branch you want to commit to.
#>

param(
  [Parameter(Mandatory=$true)] [string] $MergedFilePath,
  [Parameter(Mandatory=$true)] [ValidateSet('news','blogs','articles','stories','info')] [string] $Type,
  [string] $Message = "chore: add post via admin merged file"
)

if(-not (Test-Path $MergedFilePath)){
  Write-Error "Merged file not found: $MergedFilePath"; exit 2
}

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Push-Location $RepoRoot
try{
  $dest = Join-Path $RepoRoot "assets/data/$Type.json"
  Copy-Item -Force -Path $MergedFilePath -Destination $dest
  Write-Output "Wrote merged JSON to $dest"
  if(Test-Path package.json){ npm run generate } else { Write-Output "No package.json found; run scripts/generate_site.js with Node if desired." }
  git add $dest sitemap.xml feed-news.xml feed.xml "assets/data/search-index.json" tags/ categories/ 2>$null
  git commit -m $Message
  Write-Output "Committed merged file and generated metadata. Run 'git push' to push changes." 
}catch{
  Write-Error $_.Exception.Message
}finally{ Pop-Location }
