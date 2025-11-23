/* app.js — Interactivity for MIROZA template */
document.addEventListener('DOMContentLoaded',function(){
  // Hamburger menu for mobile
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  if(hamburger){
    hamburger.addEventListener('click',()=>{
      mainNav.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
  }

  // Dropdowns: toggle on click
  document.querySelectorAll('.has-dropdown > a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      // on wide screens, allow hover; on small screens, toggle
      const parent = a.parentElement;
      if(window.innerWidth < 700){
        e.preventDefault();
        parent.classList.toggle('open');
      }
    });
  });

  // Search toggle (just focus on demo)
  const searchToggle = document.getElementById('searchToggle');
  if(searchToggle){
    searchToggle.addEventListener('click', ()=>{
      const q = prompt('Search MIROZA (demo):');
      if(q) alert('Searching for: ' + q);
    });
  }

  // Breaking news ticker (JS-driven continuous scroll)
  const tickerTrack = document.getElementById('tickerTrack');
  if(tickerTrack){
    // duplicate content for seamless loop
    const clone = tickerTrack.innerHTML;
    tickerTrack.innerHTML += clone;
    let pos = 0;
    let speed = 0.5; // pixels per frame
    function step(){
      pos -= speed;
      if(Math.abs(pos) >= tickerTrack.scrollWidth/2) pos = 0;
      tickerTrack.style.transform = `translateX(${pos}px)`;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Sticky header shrink on scroll
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if(y > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    lastScroll = y;
  });

  // Article page: comment form handling (store in localStorage)
  const commentForm = document.getElementById('commentForm');
  if(commentForm){
    const commentsList = document.getElementById('commentsList');
    const storageKey = 'miroza-comments';
    function loadComments(){
      const raw = localStorage.getItem(storageKey) || '[]';
      const arr = JSON.parse(raw);
      commentsList.innerHTML = '';
      arr.forEach(c=>{
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `<strong>${escapeHtml(c.name)}</strong> <span class="muted">• ${c.date}</span><p>${escapeHtml(c.text)}</p>`;
        commentsList.appendChild(div);
      });
    }
    loadComments();
    commentForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = commentForm.querySelector('[name=name]').value.trim() || 'Reader';
      const text = commentForm.querySelector('[name=text]').value.trim();
      if(!text) return;
      const raw = localStorage.getItem(storageKey) || '[]';
      const arr = JSON.parse(raw);
      arr.unshift({name,text,date:new Date().toLocaleString()});
      localStorage.setItem(storageKey, JSON.stringify(arr));
      commentForm.reset();
      loadComments();
    });
  }

  function escapeHtml(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');}
});
