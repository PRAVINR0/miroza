// Lightweight external handlers to replace inline onclick attributes
// Delegated handlers keep markup clean and enable CSP tightening.
(function () {
  function copyLink(el) {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(()=>{
        alert('Link copied');
      }, ()=>{
        alert('Could not copy link');
      });
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        alert('Link copied');
      } catch (e) { alert('Copy not supported'); }
    }
  }

  function openShare(target) {
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'copy') return copyLink(target);
    if (action === 'twitter') {
      const u = encodeURIComponent(window.location.href);
      window.open('https://twitter.com/intent/tweet?url='+u, '_blank', 'noopener');
      return;
    }
    if (action === 'facebook') {
      const u = encodeURIComponent(window.location.href);
      window.open('https://www.facebook.com/sharer/sharer.php?u='+u, '_blank', 'noopener');
      return;
    }
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    // handle share buttons
    if (btn.closest('.share')) {
      e.preventDefault();
      openShare(btn);
    }
  }, false);

  // Keyboard activation for accessibility (Enter/Space)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const btn = e.target.closest && e.target.closest('[data-action]');
    if (!btn) return;
    e.preventDefault();
    openShare(btn);
  }, false);
})();
