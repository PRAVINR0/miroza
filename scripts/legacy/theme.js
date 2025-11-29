// Lightweight theme helper: reads/writes localStorage 'theme' and applies dataset on <html>
(function(){
  // Migrate legacy theme storage key if present
  try{
    var legacy = localStorage.getItem('miroza_theme');
    if(legacy && !localStorage.getItem('theme')){
      localStorage.setItem('theme', legacy);
    }
  }catch(e){}

  function applyThemeData(t){
    try{
      document.documentElement.dataset.theme = (t === 'dark') ? 'dark' : 'light';
    }catch(e){console.warn(e)}
  }

  function setTheme(t){
    try{
      applyThemeData(t);
      localStorage.setItem('theme', t);
      updateToggleIcon(t);
    }catch(e){console.warn('theme set failed', e)}
  }

  function toggle(){
    var cur = (localStorage.getItem('theme') || (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  function updateToggleIcon(t){
    try{
      var btns = document.querySelectorAll('.theme-toggle');
      btns.forEach(function(btn){
        var img = btn.querySelector('img');
        if(!img) return;
        if(t === 'dark'){
          img.src = '/assets/icons/sun.svg';
          img.alt = 'Switch to light mode';
          btn.setAttribute('aria-pressed', 'true');
        }else{
          img.src = '/assets/icons/moon.svg';
          img.alt = 'Switch to dark mode';
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    }catch(e){/* silent */}
  }

  function attachToggleHandlers(){
    try{
      var btns = document.querySelectorAll('.theme-toggle');
      btns.forEach(function(b){
        b.addEventListener('click', function(e){
          e.preventDefault();
          toggle();
        });
      });
    }catch(e){/* silent */}
  }

  function init(){
    try{
      var stored = null;
      try{ stored = localStorage.getItem('theme'); }catch(e){}
      if(stored) applyThemeData(stored);
      else {
        // Respect existing dataset set by any head initializer
        var hasDark = (document.documentElement.dataset.theme === 'dark');
        setTheme(hasDark ? 'dark' : 'light');
      }
    }catch(e){console.warn(e);}    

    attachToggleHandlers();
    updateToggleIcon(localStorage.getItem('theme') || (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));

    // expose
    window.MIROZA = window.MIROZA || {};
    window.MIROZA.theme = { set: setTheme, toggle: toggle };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
