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
      window.utils.readJSONFile(f, (err, obj)=>{ if(err){ alert('Invalid JSON'); } else { console.log(obj); alert('File loaded. Check console for structure.'); } });
    }else{
      const reader = new FileReader(); reader.onload = ()=>{ try{ const obj = JSON.parse(reader.result); console.log(obj); alert('File loaded. Check console for structure.'); }catch(err){ alert('Invalid JSON'); } }; reader.readAsText(f);
    }
  });

  // GitHub publish flow (optional)
  function toBase64(str){ try { return btoa(unescape(encodeURIComponent(str))); } catch(e){ return btoa(str); } }

  async function publishToGitHub(pat, owner, repo, type, newItem){
    const statusEl = document.getElementById('github-status');
    function setStatus(s){ if(statusEl) statusEl.textContent = s; }
    try{
      setStatus('Starting publish...');
      const headers = { 'Authorization': 'Bearer ' + pat, 'Accept': 'application/vnd.github+json', 'Content-Type':'application/json' };

      // 1) get main ref sha
      setStatus('Fetching main branch info...');
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`, { headers });
      if(!refRes.ok) throw new Error('Failed to get main ref: ' + refRes.status);
      const refJson = await refRes.json();
      const mainSha = refJson.object && refJson.object.sha;
      if(!mainSha) throw new Error('Could not determine main branch SHA');

      // 2) create a new branch
      const branch = 'ai/publish-' + Date.now().toString(36);
      setStatus('Creating branch ' + branch + '...');
      await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, { method: 'POST', headers, body: JSON.stringify({ ref: 'refs/heads/' + branch, sha: mainSha }) });

      // 3) fetch existing file on main (if any)
      setStatus('Fetching existing data file...');
      let existing = [];
      const filePath = `assets/data/${type}.json`;
      const contentRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`, { headers });
      if(contentRes.ok){
        const contentJson = await contentRes.json();
        if(contentJson.content){
          const raw = atob(contentJson.content.replace(/\n/g,''));
          try{ existing = JSON.parse(raw); if(!Array.isArray(existing)) existing = []; }catch(e){ existing = []; }
        }
      }

      // prepend new item (ensure id uniqueness by timestamp if needed)
      existing.unshift(newItem);
      const newContent = JSON.stringify(existing, null, 2);

      // 4) put file on new branch
      setStatus('Uploading merged file to branch...');
      const putBody = { message: `chore: add post ${newItem.slug || newItem.title}`, content: toBase64(newContent), branch };
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, { method: 'PUT', headers, body: JSON.stringify(putBody) });
      if(!putRes.ok){ const txt = await putRes.text(); throw new Error('Failed to upload file: ' + putRes.status + ' ' + txt); }

      // 5) open PR
      setStatus('Creating pull request...');
      const prBody = { title: `Add post: ${newItem.title}`, head: branch, base: 'main', body: `Automated post by admin panel: ${newItem.title}` };
      const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, { method: 'POST', headers, body: JSON.stringify(prBody) });
      if(!prRes.ok){ const txt = await prRes.text(); throw new Error('Failed to create PR: ' + prRes.status + ' ' + txt); }
      const prJson = await prRes.json();
      setStatus('Pull request created: ' + prJson.html_url);
      return prJson.html_url;
    }catch(err){
      const message = err && err.message ? err.message : String(err);
      if(document.getElementById('github-status')) document.getElementById('github-status').textContent = 'Publish failed: ' + message;
      throw err;
    }
  }

  document.getElementById('github-publish').addEventListener('click', async ()=>{
    const pat = document.getElementById('github-pat').value.trim();
    const owner = document.getElementById('github-owner').value.trim() || 'PRAVINR0';
    const repo = document.getElementById('github-repo').value.trim() || 'miroza';
    if(!pat){ alert('Paste a GitHub Personal Access Token (PAT) with repo scope to publish.'); return; }
    try{
      const data = gatherForm();
      document.getElementById('github-status').textContent = 'Preparing post...';
      const prUrl = await publishToGitHub(pat, owner, repo, data.type, data);
      alert('Published: PR created\n' + prUrl);
    }catch(err){ console.error(err); alert('Publish failed: ' + (err.message||err)); }
  });

  document.getElementById('github-clear').addEventListener('click', ()=>{ document.getElementById('github-pat').value = ''; if(document.getElementById('github-status')) document.getElementById('github-status').textContent = ''; alert('PAT cleared from the form.'); });

})();
