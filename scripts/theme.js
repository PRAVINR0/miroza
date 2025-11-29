// Lightweight theme helper: reads/writes localStorage 'theme' and applies dataset on <html>
(function(){
  function setTheme(t){
    try{
      document.documentElement.dataset.theme = t;
      localStorage.setItem('theme', t);
    }catch(e){console.warn('theme set failed', e)}
  }

  function toggle(){
    var cur = document.documentElement.dataset.theme || 'light';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  function init(){
    try{
      var stored = localStorage.getItem('theme');
      if(stored) document.documentElement.dataset.theme = stored;
      else if(!document.documentElement.dataset.theme) document.documentElement.dataset.theme = 'light';
    }catch(e){console.warn(e);}    
    // expose
    window.MIROZA = window.MIROZA || {};
    window.MIROZA.theme = { set: setTheme, toggle: toggle };
  }
})();
