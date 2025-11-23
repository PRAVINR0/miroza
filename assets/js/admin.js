/* admin.js
 - Simple client-side admin interface to create content JSON and HTML snippets
 - NOTE: Editing repository files directly from browser is not possible without a server or GitHub token.
 - This tool provides: form UI, slug generation, JSON export (download), HTML snippet generation, and localStorage save.
*/

(function(){
  const password = 'miroza-admin-pass'; // change as needed
  const loginEl = document.getElementById('login');
  const panel = document.getElementById('panel');
  const loginBtn = document.getElementById('login-btn');
  const passInput = document.getElementById('admin-pass');

  function showPanel(){ loginEl.classList.add('hidden'); panel.classList.remove('hidden'); }

  loginBtn.addEventListener('click', ()=>{
    if(passInput.value === password){ showPanel(); } else { alert('Wrong password'); }
  });

  // wire add buttons
  document.querySelectorAll('[data-action="add"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const type = btn.getAttribute('data-type');
      document.getElementById('post-type').value = type;
      document.getElementById('title').focus();
    });
  });

  function slugify(s){ return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  // Generate snippet and JSON
  document.getElementById('generate-html').addEventListener('click', ()=>{
    const data = gatherForm();
    const html = renderHtmlSnippet(data);
    document.getElementById('snippet').textContent = html;
  });

  document.getElementById('save-post').addEventListener('click', (e)=>{
    e.preventDefault();
    const data = gatherForm();
    // Download JSON for the content type to be merged manually or via GitHub API
    const filename = `${data.type}.json`;
    const blob = new Blob([JSON.stringify([data],null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `new-${data.type}-${data.slug}.json`; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    // Also save to localStorage for quick retrieval
    const storeKey = `miroza-admin-${data.type}`;
    let existing = JSON.parse(localStorage.getItem(storeKey) || '[]');
    existing.unshift(data);
    localStorage.setItem(storeKey, JSON.stringify(existing));
    alert('JSON prepared and saved to localStorage. Downloaded new-*.json with the new post.');
  });

  document.getElementById('clear-form').addEventListener('click', ()=>{ document.getElementById('post-form').reset(); document.getElementById('snippet').textContent=''; });

  function gatherForm(){
    const type = document.getElementById('post-type').value;
    const title = document.getElementById('title').value || 'Untitled';
    const slug = slugify(title);
    const category = document.getElementById('category').value || '';
    const tags = (document.getElementById('tags').value || '').split(',').map(s=>s.trim()).filter(Boolean);
    const image = document.getElementById('image').value || '';
    const description = document.getElementById('description').value || '';
    const content = document.getElementById('content').value || '';
    const date = new Date().toISOString().slice(0,10);
    const data = { id: Date.now(), slug, title, category, tags, image, description, content, date, type, views:0, clicks:0 };
    return data;
  }

  function renderHtmlSnippet(it){
    // returns a card HTML matching site structure with data attributes
    const img = it.image ? `<div class="thumb" style="background-image:url('${it.image}')"></div>` : '';
    return `<!-- Paste into the corresponding list page or merge into JSON -->\n<a href="/detail.html?type=${it.type}&id=${it.id}" class="card-link">\n  <article class="card" data-title="${escapeHtml(it.title)}" data-category="${escapeHtml(it.category)}" data-tags="${escapeHtml(it.tags.join(','))}" data-description="${escapeHtml(it.description)}" data-views="${it.views}" data-date="${it.date}" data-id="${it.id}">\n    ${img}\n    <h3>${escapeHtml(it.title)}</h3>\n    <p>${escapeHtml(it.description)}</p>\n    <div class="meta muted">${it.date} • ${it.category}</div>\n  </article>\n</a>`;
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // support image file upload by converting to object URL and placing value into image field
  document.getElementById('image-file').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const url = URL.createObjectURL(f);
    document.getElementById('image').value = url;
    alert('Image URL set to object URL (only local preview). For production, upload the image to /assets/images/ and update the URL before publishing.');
  });

  // Export all JSON stored in localStorage as single zip-like JSON file
  document.getElementById('export-all').addEventListener('click', ()=>{
    const types = ['blogs','articles','news','stories','info'];
    const out = {};
    types.forEach(t=>{ out[t] = JSON.parse(localStorage.getItem(`miroza-admin-${t}`) || '[]'); });
    const blob = new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'miroza-admin-export.json'; document.body.appendChild(a); a.click(); a.remove();
    alert('Exported content from admin localStorage. To publish, merge the JSON into /assets/content/*.json or use a scripted workflow.');
  });

  // Simple upload support (user can upload a full JSON to merge)
  document.getElementById('upload-json').addEventListener('change', (e)=>{
    const f = e.target.files[0]; if(!f) return;
    const reader = new FileReader(); reader.onload = ()=>{
      try{ const obj = JSON.parse(reader.result); console.log(obj); alert('File loaded. Check console for structure.'); }catch(err){ alert('Invalid JSON'); }
    }; reader.readAsText(f);
  });

})();
