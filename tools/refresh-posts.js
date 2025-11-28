const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const articlesPath = path.join(rootDir, 'data', 'articles.json');
const postsPath = path.join(rootDir, 'data', 'posts.json');

function readJson(filePath){
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(filePath, payload){
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function main(){
  if(!fs.existsSync(articlesPath)){
    throw new Error(`Missing source feed at ${articlesPath}`);
  }
  const articles = readJson(articlesPath);
  if(!Array.isArray(articles) || !articles.length){
    console.warn('No articles found to seed posts feed.');
  }
  writeJson(postsPath, articles);
  console.log(`posts.json refreshed with ${Array.isArray(articles) ? articles.length : 0} entries.`);
}

main();
