/* theme.js
   Theme management: initTheme and related helpers.
   Moves theme toggle logic out of main.js for clarity.
 */
(function(){
  function applyTheme(name){
    if(name === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) themeToggle.setAttribute('aria-pressed', name === 'dark');
  }

  function initTheme(){
    const saved = localStorage.getItem('miroza-theme');
    let applied = 'light';
    if(saved){
      applied = saved === 'dark' ? 'dark' : 'light';
      applyTheme(applied);
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      applied = 'dark'; applyTheme('dark');
    } else {
      applyTheme('light');
    }

    // Wire the header theme toggle if present
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle){
      themeToggle.addEventListener('click', ()=>{
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('miroza-theme', next);
      });
    }
  }

  window.initTheme = initTheme;
  window.applyTheme = applyTheme;
})();
