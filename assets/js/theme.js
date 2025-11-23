'use strict';
(function(){
  const key = 'miroza-theme';
  function get(){return localStorage.getItem(key)||((window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light')}
  function apply(t){document.documentElement.classList.toggle('dark', t==='dark');document.body.classList.toggle('dark', t==='dark');}
  function toggle(){const t = get() === 'dark' ? 'light' : 'dark';localStorage.setItem(key,t);apply(t);}
  document.addEventListener('DOMContentLoaded', ()=>{
    apply(get());
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.addEventListener('click', ()=>toggle());
  });
  // expose for debugging
  window.theme = {get,apply,toggle};
})();
