#!/usr/bin/env python3
"""
generate_articles.py

Create N article HTML files under `articles/`, and (re)generate paginated
index pages and `sitemap.xml`. Uses placeholder images from picsum.photos
so you don't need to commit large image files.

Usage:
  python scripts/generate_articles.py --count 1000 --base-url https://example.com

By default it writes files into the repository `articles/` directory and
overwrites `sitemap.xml`, `index.html`, and `page-*.html` files.
"""
import os
import argparse
import datetime
import random
import textwrap

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ART_DIR = os.path.join(ROOT, 'articles')
SITEMAP = os.path.join(ROOT, 'sitemap.xml')
INDEX = os.path.join(ROOT, 'index.html')

TOPICS = [
    'Technology', 'Space', 'Medicine', 'Health', 'Business', 'Automotive',
    'Science', 'Education', 'Environment', 'Culture', 'Policy', 'Economy'
]

TEMPL_ART = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} — Miroza</title>
  <meta name="description" content="{excerpt}" />
  <link rel="stylesheet" href="/assets/styles.css">
  <link rel="canonical" href="{url}" />
</head>
<body>
  <header class="site-header"><div class="wrap"><a href="/">Miroza</a></div></header>
  <main class="article-body">
    <h1>{title}</h1>
    <div class="article-meta">{date} · {category}</div>
    <img class="feature" src="{image_url}" alt="{title}">
    <p>{body}</p>
    <p><a href="/">← Back to home</a></p>
  </main>
  <footer class="site-footer"><div class="wrap">&copy; {year} Miroza</div></footer>
</body>
</html>
'''

TEMPL_INDEX_ITEM = '<article class="post">\n  <div class="thumb"><img src="{image}" alt="{title}"></div>\n  <div class="content">\n    <h2><a href="{path}">{title}</a></h2>\n    <p class="meta">{date} · {category}</p>\n    <p>{excerpt}</p>\n  </div>\n</article>'

TEMPL_INDEX_PAGE = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Miroza — {title}</title>
  <meta name="description" content="{description}" />
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="wrap">
      <h1 class="site-title">Miroza</h1>
      <p class="site-tag">News & mini-articles — India · Tamil Nadu</p>
    </div>
  </header>
  <main class="wrap">
    <section class="posts-list">
{items}
    </section>
    <nav class="pagination">
{nav}
    </nav>
  </main>
  <footer class="site-footer">
    <div class="wrap">&copy; {year} Miroza</div>
  </footer>
  <script src="assets/script.js"></script>
</body>
</html>
'''

def ensure_dirs():
    os.makedirs(ART_DIR, exist_ok=True)

def slug(i):
    return f"article-{i}"

def make_article(i, base_url):
    title = random.choice([f'Latest on {t}' for t in TOPICS]) + f' — update {i}'
    excerpt = f'A short update about {title.lower()}.'
    body = ' '.join([excerpt]*6)
    category = random.choice(TOPICS)
    date = (datetime.date.today() - datetime.timedelta(days=random.randint(0,365))).isoformat()
    filename = f'{slug(i)}.html'
    path = os.path.join(ART_DIR, filename)
    image_url = f'https://picsum.photos/seed/{slug(i)}/1200/628'
    url = base_url.rstrip('/') + f'/articles/{filename}'
    content = TEMPL_ART.format(title=title, excerpt=excerpt, url=url, date=date, category=category, image_url=image_url, body=body, year=datetime.date.today().year)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return {
        'title': title,
        'path': f'articles/{filename}',
        'excerpt': excerpt,
        'date': date,
        'category': category,
        'image': image_url,
        'url': url,
    }

def write_index_pages(items, per_page=20, base_url='https://example.com'):
    total = len(items)
    pages = (total + per_page - 1) // per_page
    for p in range(1, pages+1):
        start = (p-1)*per_page
        chunk = items[start:start+per_page]
        rendered = '\n\n'.join([TEMPL_INDEX_ITEM.format(image=i['image'], title=i['title'], path=i['path'], date=i['date'], category=i['category'], excerpt=i['excerpt']) for i in chunk])
        # navigation
        nav = ''
        if p > 1:
            prev = 'index.html' if p==2 else f'page-{p-1}.html'
            nav += f'<a class="prev" href="/{prev}">&larr; Newer</a>'
        else:
            nav += '<a class="prev disabled">&larr; Newer</a>'
        if p < pages:
            nxt = f'page-{p+1}.html'
            nav += f"\n      <a class=\"next\" href=\"/{nxt}\">Older posts &rarr;</a>"
        else:
            nav += '\n      <a class="next disabled">Older &rarr;</a>'

        page_html = TEMPL_INDEX_PAGE.format(title=f'Page {p}', description='Archive', items=rendered, nav=nav, year=datetime.date.today().year)
        out = INDEX if p==1 else os.path.join(ROOT, f'page-{p}.html')
        with open(out, 'w', encoding='utf-8') as f:
            f.write(page_html)

def write_sitemap(items, base_url):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    lines.append(f'  <url><loc>{base_url.rstrip("/")}/</loc></url>')
    pages = (len(items)+19)//20
    for p in range(2, pages+1):
        lines.append(f'  <url><loc>{base_url.rstrip("/")}/page-{p}.html</loc></url>')
    for it in items:
        lines.append(f'  <url><loc>{it["url"]}</loc></url>')
    lines.append('</urlset>')
    with open(SITEMAP, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--count', type=int, default=1000, help='Number of articles to generate')
    parser.add_argument('--base-url', type=str, default='https://example.com', help='Base site URL used in sitemap and canonical links')
    args = parser.parse_args()

    ensure_dirs()
    items = []
    print(f'Generating {args.count} articles in {ART_DIR}...')
    for i in range(1, args.count+1):
        items.append(make_article(i, args.base_url))
        if i % 50 == 0:
            print(f'  created {i} articles')

    print('Writing index pages...')
    write_index_pages(items, per_page=20, base_url=args.base_url)
    print('Writing sitemap...')
    write_sitemap(items, args.base_url)
    print('Done. Update sitemap.xml base URL and push to GitHub Pages if ready.')

if __name__ == '__main__':
    main()
