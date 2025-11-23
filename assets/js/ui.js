/* ui.js
   Lightweight UI helpers: reading progress, back-to-top, FAB, theme toggle, font-size controls
   Usage: call `initUI()` after DOM is ready.
*/
(function(window, document){
  const storageKey = 'miroza-ui-settings'
  function saveSettings(s){ try{ localStorage.setItem(storageKey, JSON.stringify(s||{})) }catch(e){} }
  function loadSettings(){ try{ return JSON.parse(localStorage.getItem(storageKey) || '{}') }catch(e){ return {} } }

  function createProgress(){
    let bar = document.getElementById('reading-progress');
    if(!bar){ bar = document.createElement('div'); bar.id = 'reading-progress'; document.body.appendChild(bar); }
    function onScroll(){
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, Math.round(window.scrollY / h * 100)) : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function createBackToTop(){
    let btn = document.getElementById('back-to-top');
    if(!btn){ btn = document.createElement('button'); btn.id = 'back-to-top'; btn.title = 'Back to top'; btn.innerHTML = '↑'; document.body.appendChild(btn); }
    function check(){ if(window.scrollY > 300){ btn.classList.add('show') } else { btn.classList.remove('show') } }
    btn.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  function createFAB(){
    // Legacy FAB removed: font controls are centralized in the header.
    return;
  }

  function applySettings(s){
    s = s || {};
    // UI settings only control font scaling now. Theme is controlled by header toggle and `localStorage['miroza-theme']`.
    if(s.fontScale){ document.documentElement.style.fontSize = (100 * s.fontScale) + '%'; } else { document.documentElement.style.fontSize = '' }
  }

  function injectControls(){
    // Legacy injected controls removed: header contains the single global control.
    return;
  }

  function initUI(){
    createProgress(); createBackToTop(); applySettings(loadSettings());
  }

  // expose
  window.initUI = initUI;
  window.applyUISettings = applySettings;
  // Font-scale helpers (single source of truth)
  window.getFontScale = function(){ const s = loadSettings(); return s && s.fontScale ? s.fontScale : 1; };
  window.setFontScale = function(scale){ const s = loadSettings() || {}; s.fontScale = scale; applySettings(s); saveSettings(s); };
  window.adjustFontScale = function(delta){ const cur = window.getFontScale(); const next = Math.max(0.8, Math.min(1.5, Math.round((cur + delta) * 100) / 100)); window.setFontScale(next); };
  window.applyFontScale = function(){ applySettings(loadSettings()); };
})(window, document);
