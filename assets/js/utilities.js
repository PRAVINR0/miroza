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

  window.utils = window.utils || {};
  Object.assign(window.utils, { slugify, uid, todayISO, escapeHtml, downloadJSON, readJSONFile, buildDetailUrl });
})();
