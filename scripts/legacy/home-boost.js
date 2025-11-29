// Homepage infinite loader: appends more items to #latest-cards using window.MIROZA.store
(function(){
  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function init(){
    if(!window.MIROZA) window.MIROZA = {};
    if(!window.MIROZA.store || !window.MIROZA.builder) return;
    await window.MIROZA.store.init();

    const container = document.getElementById('latest-cards');
    if(!container) return;

    const all = window.MIROZA.store.getAll().slice().sort((a,b)=> (new Date(b.date||0)) - (new Date(a.date||0)));
    let index = 0;
    const pageSize = 8;

    function buildItem(p){
      // normalize to builder-friendly shape
      const item = Object.assign({}, p);
      if(!item.link){
        if(item.slug) item.link = (item.category && item.category.toLowerCase()==='blog') ? `/blogs/${item.slug}.html` : `/articles/${item.slug}.html`;
        else item.link = '/';
      }
      return window.MIROZA.builder.build(item);
    }

    function renderNext(){
      const slice = all.slice(index, index + pageSize);
      if(!slice.length) return false;
      slice.forEach(p => container.appendChild(buildItem(p)));
      index += slice.length;
      return index < all.length;
    }

    // initial render
    renderNext();

    // sentinel for intersection
    let sentinel = document.createElement('div');
    sentinel.className = 'infinite-sentinel';
    container.parentNode.appendChild(sentinel);

    const io = new IntersectionObserver(async (entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          const more = renderNext();
          if(!more){ io.disconnect(); sentinel.remove(); }
          // small pause to allow images/js to load
          await sleep(250);
        }
      }
    }, { rootMargin: '400px' });

    io.observe(sentinel);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
