// Synchronous theme initializer — runs immediately when included in <head>
(function(){
  try{
    // prefer stored value
    var t = null;
    try{ t = localStorage.getItem('theme'); }catch(e){}

    // fallback to legacy html[data-theme] attribute if present
    if(!t){
      try{ t = document.documentElement.getAttribute('data-theme') || null; }catch(e){}
    }

    // fallback to prefers-color-scheme
    if(!t){
      try{ t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }catch(e){ t = 'light'; }
    }

    if(t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // remove legacy attribute to avoid selector conflicts
    try{ document.documentElement.removeAttribute('data-theme'); }catch(e){}
  }catch(e){/* silent */}
})();
