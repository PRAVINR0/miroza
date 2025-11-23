<#
  generate_site.ps1
  PowerShell version of site generator for Windows environments without Node available.
  Generates:
    - assets/data/search-index.json
    - sitemap.xml
    - feed-news.xml
    - feed.xml
    - tags/*.html
    - categories/*.html
#>

Set-StrictMode -Version Latest
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DataDir = Join-Path $RepoRoot 'assets\data'
$OutSitemap = Join-Path $RepoRoot 'sitemap.xml'
$OutFeedNews = Join-Path $RepoRoot 'feed-news.xml'
$OutFeed = Join-Path $RepoRoot 'feed.xml'
$OutSearch = Join-Path $DataDir 'search-index.json'
$TagsDir = Join-Path $RepoRoot 'tags'
$CatsDir = Join-Path $RepoRoot 'categories'

function Safe-Slug([string]$s){ if(-not $s) { return '' } ; return ($s.ToLower() -replace '[^a-z0-9]+','-').Trim('-') }
function Escape-Xml([string]$s){ if(-not $s) { return '' } ; return ($s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;') }

if(-not (Test-Path $DataDir)){ Write-Error "Data directory not found: $DataDir"; exit 2 }

# Read JSON files
$items = @()
$newsItems = @()
$tagsMap = @{}
$catsMap = @{}

Get-ChildItem -Path $DataDir -Filter *.json | ForEach-Object {
  $fname = $_.Name
  $type = $fname -replace '\.json$',''
  try{
    $arr = Get-Content -Raw -Path $_.FullName | ConvertFrom-Json -ErrorAction Stop
  }catch{
    Write-Warning "Failed to parse $($_.FullName): $($_.Exception.Message)"; $arr = @()
  }
  if($arr -is [System.Collections.IEnumerable]){
    foreach($it in $arr){
      # Convert incoming object to a PSObject so we can use dot-property access safely
      $obj = New-Object PSObject
      foreach($p in $it.PSObject.Properties){ $obj | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value -Force }
      $obj | Add-Member -NotePropertyName 'type' -NotePropertyValue $type -Force
      $items += ,$obj
      if($type -eq 'news'){ $newsItems += ,$obj }
      foreach($t in @($it.tags)){
        if(-not $t) { continue }
        $key = $t.ToString().ToLower()
        if(-not $tagsMap.ContainsKey($key)){ $tagsMap[$key] = @() }
        $tagsMap[$key] += ,$obj
      }
      $c = ($it.category -as [string])
      if($c){ $ck = $c.ToLower(); if(-not $catsMap.ContainsKey($ck)){ $catsMap[$ck] = @() }; $catsMap[$ck] += ,$obj }
    }
  }
}

# sort by date desc
$items = $items | Sort-Object -Property @{Expression={ $_.date -as [string] }} -Descending
$newsItems = $newsItems | Sort-Object -Property @{Expression={ $_.date -as [string] }} -Descending

# write search-index
$searchIndex = $items | ForEach-Object {
  $s = $_.slug -as [string]
  if(-not $s){ $s = Safe-Slug $_.title }
  [PSCustomObject]@{
    id = $_.id
    title = $_.title
    slug = $s
    type = $_.type
    tags = @($_.tags)
    category = $_.category
    date = $_.date
    description = $_.description
  }
}
($searchIndex | ConvertTo-Json -Depth 5) | Out-File -FilePath $OutSearch -Encoding UTF8

# sitemap
$urls = @(
  @{ loc = '/'; priority = '1.0' },
  @{ loc = '/index.html'; priority = '1.0' },
  @{ loc = '/news.html'; priority = '0.8' },
  @{ loc = '/blog.html'; priority = '0.8' },
  @{ loc = '/articles.html'; priority = '0.8' },
  @{ loc = '/stories.html'; priority = '0.8' },
  @{ loc = '/info.html'; priority = '0.8' },
  @{ loc = '/search.html'; priority = '0.5' }
)
foreach($it in $items){
  $slug = $it.slug -as [string]
  if(-not $slug){ $slug = Safe-Slug $it.title }
  $loc = "/detail.html?type=$($it.type)&id=$($it.id)&slug=$([uri]::EscapeDataString($slug))"
  $urls += @{ loc = $loc; lastmod = $it.date; priority = '0.6' }
}

$sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
foreach($u in $urls){ $sitemap += "  <url>\n    <loc>$(Escape-Xml $u.loc)</loc>"; if($u.lastmod){ $sitemap += "\n    <lastmod>$(Escape-Xml $u.lastmod)</lastmod>" }; $sitemap += "\n    <priority>$($u.priority)</priority>\n  </url>\n" }
$sitemap += "</urlset>\n"
$sitemap | Out-File -FilePath $OutSitemap -Encoding UTF8

# RSS builder
function Build-ItemXml($it){
  $title = Escape-Xml $it.title
  $s = $it.slug -as [string]
  if(-not $s){ $s = Safe-Slug $it.title }
  $link = Escape-Xml ("/detail.html?type=$($it.type)&id=$($it.id)&slug=$([uri]::EscapeDataString($s))")
  if($it.date){ $pubDate = (Get-Date $it.date).ToUniversalTime().ToString('R') } else { $pubDate = (Get-Date).ToUniversalTime().ToString('R') }
  $desc = Escape-Xml ($it.description -or $it.content -or '')
  $xml = "  <item>\n"
  $xml += "    <title>$title</title>\n"
  $xml += "    <link>$link</link>\n"
  $xml += '    <guid isPermaLink="false">' + ($it.type.ToString() + '-' + $it.id.ToString()) + "</guid>\n"
  $xml += "    <pubDate>$pubDate</pubDate>\n"
  $xml += "    <description>$desc</description>\n"
  $xml += "  </item>"
  return $xml
}

$newsFeed = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\">\n<channel>\n  <title>Miroza - News</title>\n  <link>/</link>\n  <description>Latest news from Miroza</description>\n"
$newsFeed += ($newsItems | Select-Object -First 50 | ForEach-Object { Build-ItemXml $_ }) -join "\n"
$newsFeed += "\n</channel>\n</rss>\n"
$newsFeed | Out-File -FilePath $OutFeedNews -Encoding UTF8

# combined feed
$recent = $items | Select-Object -First 50
$combined = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\">\n<channel>\n  <title>Miroza - Recent</title>\n  <link>/</link>\n  <description>Recent posts across Miroza</description>\n"
$combined += ($recent | ForEach-Object { Build-ItemXml $_ }) -join "\n"
$combined += "\n</channel>\n</rss>\n"
$combined | Out-File -FilePath $OutFeed -Encoding UTF8

# tags and categories pages
New-Item -ItemType Directory -Force -Path $TagsDir | Out-Null
New-Item -ItemType Directory -Force -Path $CatsDir | Out-Null
foreach($k in $tagsMap.Keys){
  $list = $tagsMap[$k]
  $html = "<!doctype html><html><head><meta charset='utf-8'><title>Tag: $(Escape-Xml $k)</title><link rel='stylesheet' href='/assets/css/style.css'></head><body><main><h1>Tag: $(Escape-Xml $k)</h1><ul>"
  foreach($it in $list){
    # items are PSObjects so use dot-access
    $type = $it.type
    $id = $it.id
    $title = $it.title
    $date = $it.date
    $slug = $it.slug
    if(-not $slug){ $slug = Safe-Slug $title }
    $html += "<li><a href='/detail.html?type=$([uri]::EscapeDataString($type))&id=$([uri]::EscapeDataString($id))&slug=$([uri]::EscapeDataString($slug))'>$(Escape-Xml $title)</a> <small>$(Escape-Xml $date)</small></li>"
  }
  $html += "</ul></main></body></html>"
  $filename = (Safe-Slug $k) + '.html'
  $dest = Join-Path $TagsDir $filename
  $html | Out-File -FilePath $dest -Encoding UTF8
}
foreach($k in $catsMap.Keys){
  $list = $catsMap[$k]
  $html = "<!doctype html><html><head><meta charset='utf-8'><title>Category: $(Escape-Xml $k)</title><link rel='stylesheet' href='/assets/css/style.css'></head><body><main><h1>Category: $(Escape-Xml $k)</h1><ul>"
  foreach($it in $list){
    $type = $it.type
    $id = $it.id
    $title = $it.title
    $date = $it.date
    $slug = $it.slug
    if(-not $slug){ $slug = Safe-Slug $title }
    $html += "<li><a href='/detail.html?type=$([uri]::EscapeDataString($type))&id=$([uri]::EscapeDataString($id))&slug=$([uri]::EscapeDataString($slug))'>$(Escape-Xml $title)</a> <small>$(Escape-Xml $date)</small></li>"
  }
  $html += "</ul></main></body></html>"
  $filename = (Safe-Slug $k) + '.html'
  $dest = Join-Path $CatsDir $filename
  $html | Out-File -FilePath $dest -Encoding UTF8
}

Write-Output "Generation complete (PowerShell)."
