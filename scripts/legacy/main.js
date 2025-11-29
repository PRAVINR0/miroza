// Main entry adapter: call MIROZA.init() if available
(function(){
  function run(){
    try{
      if(window.MIROZA && typeof window.MIROZA.init === 'function') window.MIROZA.init();
      if(window.MIROZA && window.MIROZA.loadNews && document.getElementById('india-news-list')) window.MIROZA.loadNews();
    }catch(e){console.warn('main init error', e)}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
