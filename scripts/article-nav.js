/**
 * MIROZA Article Navigation & Engagement
 * Handles:
 * 1. Breadcrumbs
 * 2. Social Sharing Buttons
 * 3. Previous/Next Article Navigation
 * 4. Related Articles
 */
(function () {
  'use strict';

  // --- Configuration ---
  const SELECTORS = {
    article: '.single-article, main article, .post-content',
    header: '.single-article header',
    title: 'h1',
    navContainer: '.article-nav',
    shareContainer: '.article-share'
  };

  // --- Utilities ---
  function getSlug() {
    const path = location.pathname;
    const match = path.match(/\/(articles|blogs|news)\/([^/]+)\.html$/);
    return match ? match[2] : null;
  }

  function getSection() {
    const path = location.pathname;
    if (path.includes('/articles/')) return 'Articles';
    if (path.includes('/blogs/')) return 'Blogs';
    if (path.includes('/news/')) return 'News';
    return 'Home';
  }

  // --- Breadcrumbs ---
  function renderBreadcrumbs() {
    const article = document.querySelector(SELECTORS.article);
    if (!article) return;
    
    // Check if already exists
    if (document.querySelector('.breadcrumbs')) return;

    const section = getSection();
    const sectionLink = `/${section.toLowerCase()}/${section.toLowerCase()}.html`;
    const title = document.querySelector('h1')?.textContent || 'Current Page';

    const html = `
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="${sectionLink}">${section}</a></li>
          <li aria-current="page">${title}</li>
        </ol>
      </nav>
    `;

    // Insert before header
    const header = document.querySelector(SELECTORS.header);
    if (header) {
      const div = document.createElement('div');
      div.innerHTML = html;
      header.parentNode.insertBefore(div.firstElementChild, header);
    }
  }

  // --- Social Sharing ---
  function renderSocialShare() {
    const article = document.querySelector(SELECTORS.article);
    if (!article) return;

    if (document.querySelector(SELECTORS.shareContainer)) return;

    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    
    const shareHTML = `
      <div class="article-share">
        <h3>Share this story</h3>
        <div class="share-buttons">
          <a href="https://twitter.com/intent/tweet?text=${title}&url=${url}" target="_blank" rel="noopener noreferrer" class="share-btn twitter" aria-label="Share on Twitter">
            <span>Twitter</span>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" class="share-btn facebook" aria-label="Share on Facebook">
            <span>Facebook</span>
          </a>
          <a href="https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}" target="_blank" rel="noopener noreferrer" class="share-btn linkedin" aria-label="Share on LinkedIn">
            <span>LinkedIn</span>
          </a>
          <a href="https://api.whatsapp.com/send?text=${title}%20${url}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp" aria-label="Share on WhatsApp">
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = shareHTML;
    article.appendChild(wrapper.firstElementChild);
  }

  // --- Related & Navigation ---
  async function renderRelatedAndNav() {
    const slug = getSlug();
    if (!slug) return;

    try {
      const res = await fetch('/data/posts.json');
      if (!res.ok) return;
      const allPosts = await res.json();

      // Sort by date descending
      const sorted = allPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      
      const idx = sorted.findIndex(p => p.slug === slug || (p.link && p.link.includes(slug)));
      if (idx === -1) return;

      const currentPost = sorted[idx];
      const nextPost = sorted[idx - 1];
      const prevPost = sorted[idx + 1];

      const article = document.querySelector(SELECTORS.article);
      if (!article) return;

      // 1. Navigation (Prev/Next)
      if (nextPost || prevPost) {
        const navHTML = `
          <nav class="article-nav" aria-label="Article navigation">
            ${prevPost ? `
              <a href="${prevPost.link || prevPost.url}" class="nav-link prev">
                <span class="nav-label">&larr; Previous</span>
                <span class="nav-title">${prevPost.title}</span>
              </a>
            ` : '<div class="nav-spacer"></div>'}
            
            ${nextPost ? `
              <a href="${nextPost.link || nextPost.url}" class="nav-link next">
                <span class="nav-label">Next &rarr;</span>
                <span class="nav-title">${nextPost.title}</span>
              </a>
            ` : '<div class="nav-spacer"></div>'}
          </nav>
        `;
        const navWrapper = document.createElement('div');
        navWrapper.innerHTML = navHTML;
        article.appendChild(navWrapper.firstElementChild);
      }

      // 2. Related Articles (Same Category)
      const related = allPosts
        .filter(p => p.category === currentPost.category && p.slug !== currentPost.slug)
        .slice(0, 3);

      if (related.length > 0) {
        const relatedHTML = `
          <section class="related-articles">
            <h3>You might also like</h3>
            <div class="related-grid">
              ${related.map(p => `
                <a href="${p.link}" class="related-card">
                  <div class="related-image">
                    <img src="${p.image || '/assets/images/hero-insight-800.svg'}" alt="${p.title}" loading="lazy">
                  </div>
                  <h4>${p.title}</h4>
                </a>
              `).join('')}
            </div>
          </section>
        `;
        const relatedWrapper = document.createElement('div');
        relatedWrapper.innerHTML = relatedHTML;
        article.appendChild(relatedWrapper.firstElementChild);
      }

    } catch (e) {
      console.error('Nav load failed', e);
    }
  }

  // --- Initialization ---
  function init() {
    if (!document.querySelector(SELECTORS.article)) return;
    
    renderBreadcrumbs();
    renderSocialShare();
    renderRelatedAndNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
