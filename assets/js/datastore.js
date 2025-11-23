'use strict';
const datastore = (()=>{
  const cache = {};
  const types = ['news','articles','blogs','stories','info'];

  async function fetchJSON(path){
    if(cache[path]) return cache[path];
    const res = await fetch(path,{cache:'no-cache'});
    if(!res.ok) return [];
    const data = await res.json();
    cache[path] = data;
    return data;
  }

  async function fetchAll(type){
    if(!types.includes(type)) return [];
    return await fetchJSON(`/assets/data/${type}.json`).then(d=>Array.isArray(d)?d:d);
  }

  async function getById(type,id){
    const list = await fetchAll(type);
    return list.find(it=>it.id===id);
  }

  async function combinedLatest(limit=20){
    const all = await Promise.all(types.map(t=>fetchAll(t).then(arr=>arr.map(i=>Object.assign({},i,{_type:t})))));
    const merged = all.flat();
    merged.sort((a,b)=>new Date(b.date)-new Date(a.date));
    return merged.slice(0,limit);
  }

  // Utility to append new item - for future assistant use (note: static hosts can't write files).
  function addLocalItem(type,item){
    // This just updates in-memory cache so UI reflects changes. Persistance must be done server-side or via assistant.
    const path = `/assets/data/${type}.json`;
    if(!cache[path]) cache[path]=[];
    cache[path].push(item);
    return item;
  }

  return {fetchAll,getById,combinedLatest,addLocalItem,types};
})();
