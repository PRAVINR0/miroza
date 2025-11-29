
$files = Get-ChildItem -Path "articles", "news", "blogs" -Filter *.html -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content

    # Fix time tag corruption
    # Pattern: ₹2025-01-12"> -> • <time datetime="2025-01-12">
    $content = $content -replace '₹(\d{4}-\d{2}-\d{2})">', '• <time datetime="$1">'

    # Fix separator corruption
    # Pattern: —€“—‚¬&copy;¢ -> •
    $content = $content.Replace('—€“—‚¬&copy;¢', '•')

    # Fix back arrow corruption
    # Pattern: —€“—€ &copy; -> ←
    $content = $content.Replace('—€“—€ &copy;', '←')

    # Fix em dash corruption (approximate)
    # Pattern: —€“—‚¬" -> —
    $content = $content.Replace('—€“—‚¬"', '—')
    
    # Fix other common mojibake if safe
    # —€“ -> —
    # But be careful not to break the above if they share prefixes.
    # The above replacements are specific enough.

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed: $($file.Name)"
    }
}
