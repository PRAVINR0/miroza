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

  // Use shared slugify from utilities when available
  function slugify(s){ return (window.utils && window.utils.slugify) ? window.utils.slugify(s) : String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  // Generate snippet and JSON
  document.getElementById('generate-html').addEventListener('click', ()=>{
    const data = gatherForm();
    const html = renderHtmlSnippet(data);
    document.getElementById('snippet').textContent = html;
  });

  document.getElementById('save-post').addEventListener('click', (e)=>{
    e.preventDefault();
    const data = gatherForm();
    // Try to fetch existing file and create a merged download ready to commit.
    const targetPath = `/assets/data/${data.type}.json`;
    fetch(targetPath, { cache: 'no-store' }).then(res=>{
      if(!res.ok) throw new Error('no-file');
      return res.json();
    }).then(existing=>{
      if(!Array.isArray(existing)) existing = [];
      // ensure id uniqueness (if existing ids are numeric or string)
      existing.unshift(data);
      const mergedName = `${data.type}-merged-${data.slug}.json`;
      if(window.utils && window.utils.downloadJSON){ window.utils.downloadJSON(existing, mergedName); }
      else {
        const blob = new Blob([JSON.stringify(existing,null,2)],{type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = mergedName; document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      }
      alert('Merged JSON prepared for commit: ' + mergedName);
    }).catch(()=>{
      // fallback: download single-item JSON
      const fname = `new-${data.type}-${data.slug}.json`;
      if(window.utils && window.utils.downloadJSON){ window.utils.downloadJSON([data], fname); }
      else { const blob = new Blob([JSON.stringify([data],null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }
      alert('Could not fetch existing file; downloaded single-item JSON: ' + fname);
    });
    // Also save to localStorage for quick retrieval
    const storeKey = `miroza-admin-${data.type}`;
    let existing = JSON.parse(localStorage.getItem(storeKey) || '[]');
    existing.unshift(data);
    localStorage.setItem(storeKey, JSON.stringify(existing));
    alert('Saved to localStorage. Use the downloaded merged JSON to commit to the repo.');
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
    const data = { id: (window.utils && window.utils.uid) ? window.utils.uid() : Date.now(), slug, title, category, tags, image, description, content, date, type, views:0, clicks:0 };
    return data;
  }

  function renderHtmlSnippet(it){
    // returns a card HTML matching site structure with data attributes
    const img = it.image ? `<div class="thumb" style="background-image:url('${it.image}')"></div>` : '';
    const esc = (window.utils && window.utils.escapeHtml) ? window.utils.escapeHtml : (s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<!-- Paste into the corresponding list page or merge into JSON -->\n<a href="${(window.utils && window.utils.buildDetailUrl) ? window.utils.buildDetailUrl(it.type,it.id,it.slug) : '/detail.html?type='+encodeURIComponent(it.type)+'&id='+encodeURIComponent(it.id)}" class="card-link">\n  <article class="card" data-title="${esc(it.title)}" data-category="${esc(it.category)}" data-tags="${esc(it.tags.join(','))}" data-description="${esc(it.description)}" data-views="${it.views}" data-date="${it.date}" data-id="${it.id}">\n    ${img}\n    <h3>${esc(it.title)}</h3>\n    <p>${esc(it.description)}</p>\n    <div class="meta muted">${it.date} • ${it.category}</div>\n  </article>\n</a>`;

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
    if(window.utils && window.utils.readJSONFile){
      window.utils.readJSONFile(f, (err, obj)=>{ if(err){ alert('Invalid JSON'); } else { alert('File loaded. Use the UI to inspect structure.'); } });
    }else{
      const reader = new FileReader(); reader.onload = ()=>{ try{ const obj = JSON.parse(reader.result); alert('File loaded. Use the UI to inspect structure.'); }catch(err){ alert('Invalid JSON'); } }; reader.readAsText(f);
    }
  });

  // GitHub publish flow (optional)
  function toBase64(str){ try { return btoa(unescape(encodeURIComponent(str))); } catch(e){ return btoa(str); } }

  // publishToGitHub disabled in static-only mode
  async function publishToGitHub(pat, owner, repo, type, newItem){
    const statusEl = document.getElementById('github-status');
    if(statusEl) statusEl.textContent = 'Publish disabled: repository is in static-only mode. See /backup/old_unused/ for original scripts.';
    // Provide a clear rejection so callers know publishing is disabled
    throw new Error('Publish disabled: static-only repository');
  }

  // Publishing via the admin panel is disabled in static-only mode to avoid exposing tokens or making network commits.
  document.getElementById('github-publish').addEventListener('click', ()=>{
    alert('Publishing is disabled in this static-only repository. To publish, use the original scripts in /backup/old_unused/ on a trusted machine.');
    const statusEl = document.getElementById('github-status'); if(statusEl) statusEl.textContent = 'Publish disabled: static-only mode.';
  });

  document.getElementById('github-clear').addEventListener('click', ()=>{ document.getElementById('github-pat').value = ''; if(document.getElementById('github-status')) document.getElementById('github-status').textContent = ''; alert('PAT cleared from the form.'); });

})();
