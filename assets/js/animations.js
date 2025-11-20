// animations.js — reveal-on-scroll using IntersectionObserver
(function(){
  var observer = null;
  function init(){
    var els = document.querySelectorAll('.reveal-on-scroll');
    if('IntersectionObserver' in window){
      observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('revealed');
            if(observer) observer.unobserve(entry.target);
          }
        });
      },{threshold:0.08});
      els.forEach(function(el){ observer.observe(el); });
    } else {
      // fallback: reveal all
      els.forEach(function(el){ el.classList.add('revealed'); });
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
