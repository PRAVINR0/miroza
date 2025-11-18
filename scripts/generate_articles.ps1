param(
    [int]$count = 1000,
    [string]$baseUrl = 'https://example.com'
)

$topics = @('Technology','Space','Medicine','Health','Business','Automotive','Science','Education','Environment','Culture','Policy','Economy')

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

$artDir = Join-Path $root 'articles'
if(-not (Test-Path $artDir)) { New-Item -ItemType Directory -Path $artDir | Out-Null }

function Repeat-String([string]$s, [int]$n){
    $out = ''
    for($k=0;$k -lt $n;$k++){ $out += $s + ' ' }
    return $out.Trim()
}

Write-Output "Generating $count articles into $artDir ..."
for($i=1; $i -le $count; $i++){
    $slug = "article-$i"
    $topic = $topics[(Get-Random -Minimum 0 -Maximum $topics.Count)]
    $title = "Latest $topic update — $i"
    $excerpt = "A short update about $topic."
    $date = (Get-Date).AddDays(- (Get-Random -Minimum 0 -Maximum 365)).ToString('yyyy-MM-dd')
    $image = "https://picsum.photos/seed/$slug/1200/628"
    $body = Repeat-String $excerpt 6
    $url = $baseUrl.TrimEnd('/') + "/articles/$slug.html"

    $content = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>$title — Miroza</title>
  <meta name="description" content="$excerpt" />
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="canonical" href="$url" />
</head>
<body>
  <header class="site-header"><div class="wrap"><a href="/">Miroza</a></div></header>
  <main class="article-body">
    <h1>$title</h1>
    <div class="article-meta">$date · $topic</div>
    <img class="feature" src="$image" alt="$title">
    <p>$body</p>
    <p><a href="/">← Back to home</a></p>
  </main>
  <footer class="site-footer"><div class="wrap">© $((Get-Date).Year) Miroza</div></footer>
</body>
</html>
"@

    $outPath = Join-Path $artDir ("$slug.html")
    $content | Set-Content -Path $outPath -Encoding UTF8
    if($i % 100 -eq 0){ Write-Output "  created $i articles" }
}

# Generate paginated index pages (20 per page)
$perPage = 20
$pages = [math]::Ceiling($count / $perPage)

for($p=1; $p -le $pages; $p++){
    $start = ($p - 1) * $perPage + 1
    $end = [math]::Min($p * $perPage, $count)
    $itemsHtml = ''
    for($j=$start; $j -le $end; $j++){
        $slug = "article-$j"
        $title = "Latest $($topics[(Get-Random -Minimum 0 -Maximum $topics.Count)]) update — $j"
        $date = (Get-Date).AddDays(- (Get-Random -Minimum 0 -Maximum 365)).ToString('yyyy-MM-dd')
        $category = $topics[(Get-Random -Minimum 0 -Maximum $topics.Count)]
        $image = "https://picsum.photos/seed/$slug/400/240"
        $path = "articles/$slug.html"
        $excerpt = "A short update about $category."
        $itemsHtml += "<article class=\"post\">`n  <div class=\"thumb\"><img src=\"$image\" alt=\"$title\"></div>`n  <div class=\"content\">`n    <h2><a href=\"$path\">$title</a></h2>`n    <p class=\"meta\">$date · $category</p>`n    <p>$excerpt</p>`n  </div>`n</article>`n`n"
    }

    # navigation
    $nav = ''
    if($p -gt 1){
        $prev = if($p -eq 2){ 'index.html' } else { "page-$($p - 1).html" }
        $nav += "<a class=\"prev\" href=\"/$prev\">&larr; Newer</a>"
    } else {
        $nav += "<a class=\"prev disabled\">&larr; Newer</a>"
    }
    if($p -lt $pages){
        $next = "page-$($p + 1).html"
        $nav += "`n      <a class=\"next\" href=\"/$next\">Older posts &rarr;</a>"
    } else {
        $nav += "`n      <a class=\"next disabled\">Older &rarr;</a>"
    }

    $pageHtml = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Miroza — Page $p</title>
  <meta name="description" content="Archive page $p" />
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <h1 class="site-title">Miroza</h1>
      <p class="site-tag">Archive — page $p</p>
    </div>
  </header>

  <main class="wrap">
    <section class="posts-list">
$itemsHtml
    </section>

    <nav class="pagination">
$nav
    </nav>
  </main>

  <footer class="site-footer">
    <div class="wrap">© $((Get-Date).Year) Miroza</div>
  </footer>

  <script src="assets/script.js"></script>
</body>
</html>
"@

    $outFile = if($p -eq 1){ Join-Path $root 'index.html' } else { Join-Path $root ("page-$p.html") }
    $pageHtml | Set-Content -Path $outFile -Encoding UTF8
}

# Write sitemap
$sitemap = @()
$sitemap += '<?xml version="1.0" encoding="UTF-8"?>'
$sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
$sitemap += "  <url><loc>$($baseUrl.TrimEnd('/'))/</loc></url>"
for($p=2; $p -le $pages; $p++){ $sitemap += "  <url><loc>$($baseUrl.TrimEnd('/'))/page-$p.html</loc></url>" }
for($i=1; $i -le $count; $i++){ $sitemap += "  <url><loc>$($baseUrl.TrimEnd('/'))/articles/article-$i.html</loc></url>" }
$sitemap += '</urlset>'
$sitemap -join "`n" | Set-Content -Path (Join-Path $root 'sitemap.xml') -Encoding UTF8

Write-Output "Generation complete: $count articles, $pages pages."