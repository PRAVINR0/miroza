'use strict';
const router = (()=>{
  function getQuery(){return Object.fromEntries(new URLSearchParams(location.search))}
  function navigateTo(url){location.href=url}
  return {getQuery,navigateTo};
})();
