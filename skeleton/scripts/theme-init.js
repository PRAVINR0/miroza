// theme-init.js — runs in <head> to apply saved theme before first paint
// This small script avoids a flash of the wrong theme (FOUC).
(function(){
  try {
    var key = 'miroza_theme';
    var t = null;
    try { t = localStorage.getItem(key); } catch(e) { /* ignore */ }
    if (t === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else if (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('theme-dark');
    }
  } catch (e) { /* fail silently */ }
})();
