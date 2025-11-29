// Lightweight theme helper: reads/writes localStorage 'theme' and applies dataset on <html>
(function(){
  // Migrate legacy theme storage key if present
  try{
    var legacy = localStorage.getItem('miroza_theme');
    if(legacy && !localStorage.getItem('theme')){
      localStorage.setItem('theme', legacy);
    }
  }catch(e){}

  function applyClass(t){
    try{
      if(t === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }catch(e){console.warn(e)}
  }

  function setTheme(t){
    try{
      applyClass(t);
      localStorage.setItem('theme', t);
      updateToggleIcon(t);
    }catch(e){console.warn('theme set failed', e)}
  }

  function toggle(){
    var cur = (localStorage.getItem('theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
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
        }else{
          img.src = '/assets/icons/moon.svg';
          img.alt = 'Switch to dark mode';
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
      if(stored) applyClass(stored);
      else {
        // if html already has class (set by head init), respect it and persist
        var hasDark = document.documentElement.classList.contains('dark');
        setTheme(hasDark ? 'dark' : 'light');
      }
    }catch(e){console.warn(e);}    

    attachToggleHandlers();
    updateToggleIcon(localStorage.getItem('theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));

    // expose
    window.MIROZA = window.MIROZA || {};
    window.MIROZA.theme = { set: setTheme, toggle: toggle };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
