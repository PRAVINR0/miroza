/* utilities.js
 * Shared small utilities for Miroza
 * Exposes a `window.utils` object with common helpers used across pages and admin.
 */
(function(){
  function slugify(s){
    if(!s) return '';
    return String(s).toLowerCase().trim()
      .replace(/[^a-z0-9\-\s_]+/g,'')
      .replace(/[\s_]+/g,'-')
      .replace(/(^-|-$)/g,'');
  }

  function uid(prefix){
    // High-entropy id: timestamp + random hex
    const t = Date.now().toString(36);
    const r = Math.floor(Math.random()*0xFFFFFF).toString(16);
    return (prefix?prefix+'-':'') + t + '-' + r;
  }

  function todayISO(){ return new Date().toISOString().slice(0,10); }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function capitalize(s){ return s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : ''; }

  function createCardElement(it, opts){
    opts = opts || {};
    const large = !!opts.large;
    const typeOverride = opts.typeOverride || it.type || '';
    const id = (opts.id != null) ? opts.id : (it.id != null ? it.id : undefined);

    const a = document.createElement('a');
    const itemType = typeOverride || '';
    if(id != null){
      a.href = buildDetailUrl(itemType, id, it.slug || it.title && slugify(it.title) || '');
    } else if(it.url){
      a.href = it.url;
    } else {
      a.href = '/';
    }
    a.style.textDecoration = 'none'; a.style.color = 'inherit';

    const card = document.createElement('article'); card.className = 'card fade-in'; if(large) card.style.minHeight = '180px';
    const img = document.createElement('img'); img.className = 'thumb'; img.loading = 'lazy'; img.decoding = 'async'; img.alt = it.title || '';
    if(it.image) img.src = it.image; else img.setAttribute('aria-hidden','true');

    const h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
    const p = document.createElement('p'); p.textContent = it.description || '';
    const meta = document.createElement('div'); meta.className = 'meta muted';
    const metaText = `${it.date || ''}${itemType ? ' • ' + (capitalize(itemType)) : ''}`;
    meta.textContent = metaText;

    card.appendChild(img); card.appendChild(h3); card.appendChild(p); card.appendChild(meta);
    card.setAttribute('data-title', it.title || ''); card.setAttribute('data-type', itemType || ''); card.setAttribute('data-description', it.description || ''); if(id != null) card.setAttribute('data-id', id);
    a.appendChild(card);
    return a;
  }

  function downloadJSON(obj, filename){
    const blob = new Blob([JSON.stringify(obj,null,2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename || 'data.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
  }

  function readJSONFile(file, cb){
    const r = new FileReader(); r.onload = ()=>{ try{ cb(null, JSON.parse(r.result)); }catch(err){ cb(err); } };
    r.onerror = ()=>cb(new Error('Failed to read file'));
    r.readAsText(file);
  }

  function buildDetailUrl(type, id, slug){
    const q = `type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}` + (slug ? `&slug=${encodeURIComponent(slug)}` : '');
    return `/detail.html?${q}`;
  }

  async function fetchJSON(path, { timeout = 8000, retries = 1 } = {}){
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), timeout);
    try{
      const res = await fetch(path, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timer);
      if(!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
      return await res.json();
    }catch(err){
      if(retries > 0) return fetchJSON(path, { timeout, retries: retries - 1 });
      throw err;
    }
  }

  window.utils = window.utils || {};
  Object.assign(window.utils, { slugify, uid, todayISO, escapeHtml, capitalize, createCardElement, downloadJSON, readJSONFile, buildDetailUrl });
  // Expose a lightweight fetch helper globally for legacy code that expects `fetchJSON`.
  window.fetchJSON = fetchJSON;
})();
