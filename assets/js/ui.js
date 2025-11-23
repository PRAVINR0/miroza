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
    if(document.getElementById('ui-fab')) return;
    const wrap = document.createElement('div'); wrap.id = 'ui-fab';
    const sizeBtn = document.createElement('button'); sizeBtn.className='ui-fab-btn'; sizeBtn.title='Increase font'; sizeBtn.textContent='A+';
    const sizeDown = document.createElement('button'); sizeDown.className='ui-fab-btn'; sizeDown.title='Decrease font'; sizeDown.textContent='A-';
    wrap.appendChild(sizeBtn); wrap.appendChild(sizeDown);
    document.body.appendChild(wrap);

    // Only font scaling is managed here. Theme controls are centralized in header (`assets/js/main.js`).
    sizeBtn.addEventListener('click', ()=>{ const s=loadSettings(); s.fontScale = (s.fontScale || 1) + 0.05; applySettings(s); saveSettings(s); });
    sizeDown.addEventListener('click', ()=>{ const s=loadSettings(); s.fontScale = Math.max(0.8, (s.fontScale || 1) - 0.05); applySettings(s); saveSettings(s); });
  }

  function applySettings(s){
    s = s || {};
    // UI settings only control font scaling now. Theme is controlled by header toggle and `localStorage['miroza-theme']`.
    if(s.fontScale){ document.documentElement.style.fontSize = (100 * s.fontScale) + '%'; } else { document.documentElement.style.fontSize = '' }
  }

  function injectControls(){
    if(document.getElementById('ui-controls')) return;
    const c = document.createElement('div'); c.id='ui-controls';
    c.innerHTML = `
      <div style="margin-top:8px"><button id="ui-font-dec">A-</button> <button id="ui-font-inc">A+</button></div>
    `;
    document.body.appendChild(c);
    const inc = c.querySelector('#ui-font-inc'); const dec = c.querySelector('#ui-font-dec');
    const s = loadSettings();
    inc.addEventListener('click', ()=>{ const cur=loadSettings(); cur.fontScale = (cur.fontScale||1)+0.05; applySettings(cur); saveSettings(cur); });
    dec.addEventListener('click', ()=>{ const cur=loadSettings(); cur.fontScale = Math.max(0.8, (cur.fontScale||1)-0.05); applySettings(cur); saveSettings(cur); });
  }

  function initUI(){
    createProgress(); createBackToTop(); createFAB(); injectControls(); applySettings(loadSettings());
  }

  // expose
  window.initUI = initUI;
  window.applyUISettings = applySettings;
})(window, document);
