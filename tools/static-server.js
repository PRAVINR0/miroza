// Simple static file server for smoke tests
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT ? parseInt(process.env.PORT,10) : 8080;
const root = path.resolve(__dirname, '..');

const mime = {
  '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.woff2':'font/woff2', '.woff':'font/woff'
};

function send404(res){ res.statusCode = 404; res.end('Not found'); }

const server = http.createServer((req, res) => {
  try{
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if(urlPath === '/') urlPath = '/index.html';
    const file = path.join(root, urlPath.replace(/^\//,''));
    if(fs.existsSync(file) && fs.statSync(file).isFile()){
      const ext = path.extname(file).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', type);
      const stream = fs.createReadStream(file);
      stream.pipe(res);
      stream.on('error', () => send404(res));
      return;
    }
    // fallback to index.html for directories
    const alt = path.join(root, 'index.html');
    if(fs.existsSync(alt)){
      res.setHeader('Content-Type', 'text/html');
      fs.createReadStream(alt).pipe(res);
      return;
    }
    send404(res);
  }catch(e){ console.error(e); send404(res); }
});

server.listen(port, () => console.log(`Static server running at http://localhost:${port}/`));

// keep process alive
process.on('SIGINT', () => { server.close(()=>process.exit(0)); });
