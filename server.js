// Ten Ten maison : talkie-walkie entre amis. Node seul, aucune dépendance.
// Un "groupe" = un code partagé entre amis. Tout le monde dans le même groupe s'entend.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MAX_CLIP = 2 * 1024 * 1024; // 2 Mo ~ une minute de voix
const groups = new Map(); // code -> Set<{res, name}>
// ponytail: tout en mémoire, rien n'est stocké ; un redémarrage déconnecte (les clients se reconnectent seuls)

const send = (res, event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
const members = code => [...(groups.get(code) || [])].map(c => c.name);
const broadcast = (code, event, data, except) => {
  for (const c of groups.get(code) || []) if (c !== except) send(c.res, event, data);
};
const clean = s => String(s || '').trim().slice(0, 30);

const files = { '/': 'index.html', '/manifest.json': 'manifest.json', '/icon.svg': 'icon.svg' };
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/manifest+json', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const code = clean(url.searchParams.get('group')).toLowerCase();
  const name = clean(url.searchParams.get('name'));

  if (files[url.pathname]) {
    const f = path.join(__dirname, 'public', files[url.pathname]);
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] });
    return fs.createReadStream(f).pipe(res);
  }

  if (!code || !name) { res.writeHead(400); return res.end('groupe et pseudo requis'); }

  // Écoute en direct (Server-Sent Events)
  if (url.pathname === '/listen') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const client = { res, name };
    if (!groups.has(code)) groups.set(code, new Set());
    groups.get(code).add(client);
    broadcast(code, 'members', members(code));
    const ping = setInterval(() => res.write(': ping\n\n'), 25000); // garde la connexion ouverte derrière les proxys
    req.on('close', () => {
      clearInterval(ping);
      groups.get(code).delete(client);
      if (!groups.get(code).size) groups.delete(code);
      else broadcast(code, 'members', members(code));
    });
    return;
  }

  // Envoi d'un message vocal
  if (url.pathname === '/talk' && req.method === 'POST') {
    const chunks = []; let size = 0;
    req.on('data', d => {
      size += d.length;
      if (size > MAX_CLIP) { res.writeHead(413); res.end('trop long'); req.destroy(); }
      else chunks.push(d);
    });
    req.on('end', () => {
      if (size > MAX_CLIP) return;
      const type = clean(req.headers['content-type']).split(';')[0] || 'audio/webm';
      const audio = `data:${type};base64,${Buffer.concat(chunks).toString('base64')}`;
      const sender = [...(groups.get(code) || [])].find(c => c.name === name);
      broadcast(code, 'voice', { from: name, audio }, sender);
      res.writeHead(204); res.end();
    });
    return;
  }

  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`Ten Ten maison sur http://localhost:${PORT}`));
