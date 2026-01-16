import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  // Handle API routes
  if (req.url.startsWith('/api/fetch-url')) {
    const urlObj = new URL(req.url, 'http://localhost');
    const targetUrl = urlObj.searchParams.get('url');

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }

    fetchUrl(targetUrl, res);
    return;
  }

  // Serve static files
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(distDir)) {
    filePath = path.join(distDir, 'index.html');
  }

  // Try the requested file, fall back to index.html for SPA routing
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(distDir, 'index.html'), (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

function fetchUrl(targetUrl, res) {
  const protocol = targetUrl.startsWith('https') ? https : http;
  const timeout = 5000;

  const request = protocol.get(targetUrl, { timeout }, (response) => {
    let html = '';

    // Follow redirects
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      fetchUrl(response.headers.location, res);
      return;
    }

    if (response.statusCode !== 200) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `HTTP ${response.statusCode}` }));
      return;
    }

    response.on('data', (chunk) => {
      html += chunk;
    });

    response.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ contents: html }));
    });
  }).on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }).on('timeout', () => {
    request.destroy();
    res.writeHead(504, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Request timeout' }));
  });
}

server.listen(3000, '0.0.0.0', () => {
  console.log('✅ Server running on http://0.0.0.0:3000');
});
