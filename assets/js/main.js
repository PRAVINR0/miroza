// main.js — core interactions: smooth scroll, navbar scroll behavior, button click anims
(function(){
  // smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var id = this.getAttribute('href');
      var el = document.querySelector(id);
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // navbar background change when scrolling
  var header = document.getElementById('siteHeader');
  var lastScroll = 0;
  function onScroll(){
    var y = window.scrollY || document.documentElement.scrollTop;
    if(y > 24) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // small click animation for primary buttons
  document.querySelectorAll('.btn-primary, .btn-outline, .btn').forEach(function(b){
    b.addEventListener('click', function(){
      this.classList.add('btn-clicked');
      setTimeout(()=>this.classList.remove('btn-clicked'), 220);
    });
  });

  // mobile menu toggle (simple)
  var menuToggle = document.getElementById('menuToggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      document.body.classList.toggle('menu-open');
    });
  }
})();
