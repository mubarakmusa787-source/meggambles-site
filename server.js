// Local dev server for the MegGambles site recreation. No dependencies.
//
//   node server.js            serves the site with the data snapshots in ./data
//   LIVE=1 node server.js     proxies /api/* to the live site instead
//   PORT=4000 node server.js  changes the port (default 3000)
//
// Any path that is not a file (e.g. /degen, /store) falls back to index.html,
// so the single-page app can route it.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const LIVE = process.env.LIVE === '1';
const LIVE_ORIGIN = process.env.LIVE_ORIGIN || 'https://irishqueenoftheslots.com';

// API path -> snapshot file, used when LIVE is off.
const SNAPSHOTS = {
  '/api/portal-data': 'data/portal-data.json',
  '/api/raffle-entries': 'data/raffle-entries.json',
  '/api/meg-referrals': 'data/referrals.json',
};

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

function sendFile(res, file, status = 200) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(status, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

function proxy(req, res) {
  const target = new URL(req.url, LIVE_ORIGIN);
  const up = https.request(target, { method: req.method, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } }, r => {
    res.writeHead(r.statusCode, { 'Content-Type': r.headers['content-type'] || 'application/json' });
    r.pipe(res);
  });
  up.on('error', e => { res.writeHead(502); res.end(JSON.stringify({ error: e.message })); });
  req.pipe(up);
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    if (LIVE) return proxy(req, res);
    const snap = SNAPSHOTS[url.pathname];
    if (snap) return sendFile(res, path.join(ROOT, snap));
    res.writeHead(501, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not available offline. This needs the backend.' }));
  }
  const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) return sendFile(res, file);
    sendFile(res, path.join(ROOT, 'index.html')); // SPA fallback
  });
}).listen(PORT, () => console.log(`MegGambles site on http://localhost:${PORT} (${LIVE ? 'live API: ' + LIVE_ORIGIN : 'snapshot data'})`));
