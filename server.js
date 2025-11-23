// Minimal static file server for local preview (no external dependencies)
// Usage: `node server.js` or `npm run start` (binds to PORT or 8080)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const PORT = process.env.PORT || 8080;

function contentTypeByExt(ext){
	switch(ext){
		case '.html': return 'text/html; charset=utf-8';
		case '.css': return 'text/css; charset=utf-8';
		case '.js': return 'application/javascript; charset=utf-8';
		case '.json': return 'application/json; charset=utf-8';
		case '.xml': return 'application/xml; charset=utf-8';
		case '.png': return 'image/png';
		case '.jpg': case '.jpeg': return 'image/jpeg';
		case '.svg': return 'image/svg+xml';
		case '.webmanifest': return 'application/manifest+json';
		default: return 'application/octet-stream';
	}
}

const server = http.createServer((req, res) => {
	try{
		const urlPath = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
		let filePath = path.join(ROOT, urlPath);
		// If path is directory, try index.html
		if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');

		// Prevent directory traversal
		if (!filePath.startsWith(ROOT)) {
			res.writeHead(403); res.end('Forbidden'); return;
		}

		fs.stat(filePath, (err, stat) => {
			if (err || !stat.isFile()){
				// fallback to index.html for SPA-like routing
				const fallback = path.join(ROOT, 'index.html');
				fs.readFile(fallback, (er, data) => {
					if (er){ res.writeHead(404); res.end('Not found'); return; }
					res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
					res.end(data);
				});
				return;
			}
			const ext = path.extname(filePath).toLowerCase();
			const ct = contentTypeByExt(ext);
			fs.readFile(filePath, (e, data) => {
				if (e){ res.writeHead(500); res.end('Server error'); return; }
				res.writeHead(200, {'Content-Type': ct});
				res.end(data);
			});
		});
	}catch(e){ res.writeHead(500); res.end('Server error'); }
});

server.listen(PORT, () => console.log(`Static server running at http://localhost:${PORT}`));

process.on('SIGINT', ()=>{ console.log('Stopping server'); server.close(()=>process.exit(0)); });
