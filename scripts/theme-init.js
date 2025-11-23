/* scripts/theme-init.js
   Small, dependency-free script that applies the saved theme (or system preference)
   as early as possible to avoid FOUC (flash of unstyled / wrong-theme content).
   Keep this file tiny so it can be included in <head> without delaying render.
*/
(function(){
  try{
    var t = null;
    try{ t = localStorage.getItem('miroza_theme'); }catch(e){}
    if(!t){
      var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      t = (mq && mq.matches) ? 'dark' : 'light';
    }
    if(t === 'dark') document.documentElement.classList.add('theme-dark');
  }catch(e){ /* silent fallback */ }
})();
