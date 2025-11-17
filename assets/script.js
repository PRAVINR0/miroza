/* Basic client-side router and utilities for single-file blog
   - Allows opening a full article in the right-side reader panel
   - Updates title and history state for shareable links (#article=slug)
   - Simple search by text
   NOTE: Static HTML is best for SEO; this script enhances UX for visitors.
*/
(function(){
  'use strict'

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Simple helper to select all existing article cards on the page
  function getCards(){
    return Array.from(document.querySelectorAll('.card'))
  }

  // Open reader panel with article content from a card node
  function openArticleFromCard(card){
    const slug = card.dataset.slug || card.getAttribute('data-slug')
    const title = card.querySelector('.card-title')?.textContent || ''
    const author = card.dataset.author || 'Miroza'
    const date = card.dataset.date || ''
    const img = card.querySelector('img')?.src || ''
    const body = card.querySelector('.card-excerpt')?.textContent || ''
    openReader({slug,title,author,date,img,body})
  }

  function openReader({slug,title,author,date,img,body}){
    const panel = document.getElementById('reader-panel')
    const tmpl = document.getElementById('article-template')
    if (!panel || !tmpl) return

    panel.innerHTML = ''
    const node = tmpl.content.cloneNode(true)
    node.querySelector('h1').textContent = title
    node.querySelector('[itemprop="author"]').textContent = author
    const timeEl = node.querySelector('time')
    if (timeEl){ timeEl.textContent = date; timeEl.setAttribute('datetime', date) }
    const imgEl = node.querySelector('figure img')
    if (imgEl){ imgEl.src = img; imgEl.alt = title }
    node.querySelector('.reader-body').textContent = body

    panel.appendChild(node)
    panel.classList.add('open')
    panel.setAttribute('aria-hidden','false')
    document.title = title + ' — Miroza'
    history.pushState({slug}, title, '#article=' + encodeURIComponent(slug))
  }

  function closeReader(){
    const panel = document.getElementById('reader-panel')
    if (!panel) return
    panel.classList.remove('open')
    panel.setAttribute('aria-hidden','true')
    document.title = 'Miroza — News, features and short articles'
    history.pushState({}, '', location.pathname)
  }

  // Attach click handlers to article links
  function bindCards(){
    getCards().forEach(card => {
      const link = card.querySelector('.card-link')
      if (link){
        link.addEventListener('click', function(ev){
          ev.preventDefault()
          openArticleFromCard(card)
        })
      }
    })
  }

  // Very small client-side search
  function setupSearch(){
    const btn = document.getElementById('btn-search')
    if (!btn) return
    btn.addEventListener('click', function(){
      const q = prompt('Search articles — enter keywords')
      if (!q) return
      const cards = getCards()
      const ql = q.toLowerCase()
      cards.forEach(c => {
        const t = (c.textContent || '').toLowerCase()
        c.style.display = t.indexOf(ql) !== -1 ? '' : 'none'
      })
    })
  }

  // On load: bind, restore state from hash
  window.addEventListener('DOMContentLoaded', function(){
    // allow CSS to render without FOUC
    document.documentElement.style.visibility = ''
    bindCards()
    setupSearch()

    // close reader when clicking outside
    document.addEventListener('click', function(e){
      const panel = document.getElementById('reader-panel')
      if (!panel) return
      if (panel.classList.contains('open')){
        if (!panel.contains(e.target) && !e.target.closest('.card')){
          closeReader()
        }
      }
    })

    // handle back/forward navigation
    window.addEventListener('popstate', function(e){
      if (location.hash && location.hash.startsWith('#article=')){
        // do nothing — state handled by pushState
      } else {
        closeReader()
      }
    })

    // If page loaded with #article=slug, open reader if slug exists
    if (location.hash && location.hash.startsWith('#article=')){
      const slug = decodeURIComponent(location.hash.split('=')[1] || '')
      const card = document.querySelector('.card[data-slug="'+CSS.escape(slug)+'"]')
      if (card) openArticleFromCard(card)
    }
  })

})();
