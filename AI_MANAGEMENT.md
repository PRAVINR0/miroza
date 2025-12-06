# AI Content Management Guide

This guide explains how to add new content to the Miroza website. This system is designed to be easily managed by an AI agent or a human without complex coding.

## 1. Creating a New Post

### Step 1: Choose the Right Template
Navigate to the `templates/` directory and choose the appropriate template:
- **News:** `templates/news.html`
- **Article:** `templates/article.html`
- **Blog:** `templates/blog.html`

### Step 2: Create the File
1. Copy the chosen template file.
2. Paste it into the corresponding directory (`news/`, `articles/`, or `blogs/`).
3. Rename the file using a URL-friendly format (e.g., `my-new-post-title.html`).

### Step 3: Fill in the Content
Open the new file and replace the placeholders marked with `<!-- AI_INSTRUCTION: ... -->`:
- `{{TITLE}}`: The headline of the post.
- `{{DATE}}`: The current date (e.g., "Dec 06, 2025").
- `{{AUTHOR}}`: The author's name.
- `{{IMAGE_URL}}`: URL to the featured image (use `https://placehold.co/800x450?text=Topic` if no image is provided).
- `{{CONTENT}}`: The main body text. Wrap paragraphs in `<p>` tags.

## 2. Updating Listing Pages

After creating the post, you must link to it so users can find it.

### Step 1: Identify the Listing Page
- **News:** Update `news.html`
- **Articles:** Update `articles.html`
- **Blogs:** Update `blog.html`

### Step 2: Insert the Link
Find the comment `<!-- AI_INSERTION_POINT: ..._LIST -->` in the file. Insert a new item block *immediately after* the instructions comment.

**Example Block for News/Articles/Blogs:**
```html
<div class="article-card" style="display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
    <div style="flex: 1;">
        <h2 style="font-size: 22px; margin-bottom: 10px;"><a href="FOLDER/FILENAME.html" class="hover-red">POST TITLE</a></h2>
        <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
            SHORT EXCERPT OR SUMMARY HERE...
        </p>
        <span style="font-size: 12px; color: #888;">DATE / AUTHOR</span>
    </div>
</div>
```

## 3. Updating the Homepage (Optional)

To feature the new post on the homepage (`index.html`):

1. Find `<!-- AI_INSERTION_POINT: HOMEPAGE_GRID -->`.
2. Insert a new card block:

```html
<article class="news-card">
    <img src="IMAGE_URL" alt="ALT_TEXT">
    <h3><a href="FOLDER/FILENAME.html">POST TITLE</a></h3>
    <p>SHORT SUMMARY</p>
</article>
```

## 4. Maintenance

- **Sitemap:** Periodically update `sitemap.xml` to include new URLs.
- **Images:** If using local images, save them to `assets/images/` (create the folder if needed) and reference them as `../assets/images/filename.jpg`.
