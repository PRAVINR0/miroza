'use strict';
const utils = (()=>{
  function formatDate(d){try{const dt=new Date(d);return dt.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});}catch(e){return d}}
  function slugify(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
  function preloadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=res;i.onerror=rej;i.src=src})}
  function debounce(fn,wait=250){let t;return function(...args){clearTimeout(t);t=setTimeout(()=>fn.apply(this,args),wait)}}
  return {formatDate,slugify,preloadImage,debounce};
})();
