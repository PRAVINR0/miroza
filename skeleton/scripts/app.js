// scripts/app.js — MIROZA skeleton interactive helpers
// - Theme toggle (dark / light)
// - Mobile menu toggle with keyboard accessibility
// - Small helpers (year injection)

/*
  Notes:
  - Theme preference is stored in localStorage key `miroza_theme` with values 'light' or 'dark'.
  - The `scripts/theme-init.js` file runs in <head> to apply the saved theme before paint.
  - Avoid using innerHTML for content insertion; use textContent or DOM methods for security.
*/

(function () {
  'use strict';

  // Helper: safely read localStorage (wrap to avoid exceptions in some browsers)
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  // Toggle CSS class on <html> to switch theme
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('theme-dark');
    else root.classList.remove('theme-dark');
  }

  // Update theme UI (button label/icon) for accessibility
  function updateThemeButton(btn, theme) {
    if (!btn) return;
    const pressed = theme === 'dark';
    btn.setAttribute('aria-pressed', String(pressed));
    btn.querySelector('.theme-label').textContent = pressed ? 'Dark' : 'Light';
    btn.querySelector('.theme-icon').textContent = pressed ? '🌙' : '☀️';
  }

  // Toggle handler bound to button
  function onThemeToggle(e) {
    const current = safeGet('miroza_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    safeSet('miroza_theme', next);
    applyTheme(next);
    updateThemeButton(e.currentTarget, next);
  }

  // Menu toggle with accessibility attributes
  function initMenuToggle() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function setExpanded(expanded) {
      toggle.setAttribute('aria-expanded', String(expanded));
      if (expanded) nav.removeAttribute('hidden'); else nav.setAttribute('hidden', '');
    }

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
    });

    // Keyboard support (Enter / Space)
    toggle.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        toggle.click();
      }
    });
  }

  // Inject current year into footer
  function setYear() {
    const el = document.getElementById('year');
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  // Initialize everything after DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    // Enable transitions after paint so initial theme swap doesn't animate
    requestAnimationFrame(function () {
      document.documentElement.classList.add('transitions-enabled');
    });

    // Apply UI state for theme
    const saved = safeGet('miroza_theme');
    const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(initial);

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      updateThemeButton(themeBtn, initial);
      themeBtn.addEventListener('click', onThemeToggle);
      themeBtn.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); themeBtn.click(); } });
    }

    // Menu
    initMenuToggle();

    // Year
    setYear();
  });

})();

