// theme-toggle.js — handles light/dark theme and persistence
(function(){
  var btn = document.getElementById('themeToggle');
  if(!btn) return;
  function setTheme(theme){
    if(theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
  }
  // load saved
  try{
    var saved = localStorage.getItem('miroza-theme');
    if(saved) setTheme(saved);
    else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }catch(e){}

  function updateIcon(){
    var cur = document.documentElement.getAttribute('data-theme');
    btn.textContent = (cur === 'dark') ? '☀️' : '🌙';
  }
  updateIcon();

  btn.addEventListener('click', function(){
    var cur = document.documentElement.getAttribute('data-theme');
    var next = (cur === 'dark') ? 'light' : 'dark';
    setTheme(next);
    try{ localStorage.setItem('miroza-theme', next); }catch(e){}
    updateIcon();
  });
})();
