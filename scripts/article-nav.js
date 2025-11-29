/**
 * MIROZA Article Navigation & Engagement
 * Handles:
 * 1. Previous/Next Article Navigation
 * 2. Social Sharing Buttons
 * 3. Reading Progress Bar (Bonus)
 */
(function () {
  'use strict';

  // --- Configuration ---
  const SELECTORS = {
    article: '.single-article, main article, .post-content',
    title: 'h1',
    navContainer: '.article-nav',
    shareContainer: '.article-share'
  };

  // --- Utilities ---
  function getSlug() {
    const path = location.pathname;
    // Match /articles/slug.html or /blogs/slug.html
    const match = path.match(/\/(articles|blogs|news)\/([^/]+)\.html$/);
    return match ? match[2] : null;
  }

  // --- Social Sharing ---
  function renderSocialShare() {
    const article = document.querySelector(SELECTORS.article);
    if (!article) return;

    // Avoid duplicates
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

  // --- Navigation (Prev/Next) ---
  async function renderNavigation() {
    const slug = getSlug();
    if (!slug) return;

    try {
      const res = await fetch('/data/posts.json');
      if (!res.ok) return;
      const allPosts = await res.json();

      // Sort by date descending (Newest first)
      const sorted = allPosts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      
      // Find current index
      const idx = sorted.findIndex(p => p.slug === slug || (p.link && p.link.includes(slug)));
      if (idx === -1) return;

      // Next (newer) is idx - 1, Prev (older) is idx + 1 because of desc sort
      const nextPost = sorted[idx - 1];
      const prevPost = sorted[idx + 1];

      if (!nextPost && !prevPost) return;

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

      const article = document.querySelector(SELECTORS.article);
      if (article) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = navHTML;
        article.appendChild(wrapper.firstElementChild);
      }

    } catch (e) {
      console.error('Nav load failed', e);
    }
  }

  // --- Initialization ---
  function init() {
    // Only run on article/blog pages
    if (!document.querySelector(SELECTORS.article)) return;
    
    renderSocialShare();
    renderNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
