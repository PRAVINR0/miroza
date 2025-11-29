// Simple data loader helpers used by listing pages
window.MIROZA = window.MIROZA || {};
window.MIROZA.dataLoader = (function(){
  async function fetchJSON(path){
    try{ var r = await fetch(path); if(r.ok) return await r.json(); return []; }catch(e){console.warn('fetchJSON failed', path, e); return []; }
  }
  return { fetchPosts: function(){return fetchJSON('/data/posts.json');}, fetchNews: function(){return fetchJSON('/data/news.json');} };
})();
