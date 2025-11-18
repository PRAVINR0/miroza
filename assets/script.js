// Lightweight search: filters posts list on the index pages
(function(){
  function el(id){return document.getElementById(id)}
  var input = el('search');
  if(!input) return;
  var posts = Array.from(document.querySelectorAll('.posts-list .post'));
  input.addEventListener('input', function(){
    var q = this.value.trim().toLowerCase();
    if(!q){ posts.forEach(p=>p.style.display=''); return }
    posts.forEach(function(p){
      var text = (p.innerText||'').toLowerCase();
      p.style.display = text.indexOf(q) !== -1 ? '' : 'none';
    })
  });
})();
