// Basit statik geliştirme sunucusu:  node serve.mjs  ->  http://localhost:4173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const tipler = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const sunucu = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  if (!path.extname(p)) p += '.html';
  const dosya = path.join(kok, p);
  if (!dosya.startsWith(kok) || !fs.existsSync(dosya) || fs.statSync(dosya).isDirectory()) {
    const yol404 = path.join(kok, '404.html');
    if (fs.existsSync(yol404)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(yol404).pipe(res);
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>404</h1><a href="/">Ana sayfa</a>');
  }
  res.writeHead(200, { 'Content-Type': tipler[path.extname(dosya).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(dosya).pipe(res);
});

// Port doluysa cokme: sonraki bos porta gec (en fazla 20 deneme)
let port = PORT;
sunucu.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && port < PORT + 20) {
    console.log(`  ! ${port} portu dolu, ${port + 1} deneniyor...`);
    sunucu.close();
    sunucu.listen(++port);
    return;
  }
  console.error(err.message);
  process.exit(1);
});
sunucu.on('listening', () => {
  console.log('');
  console.log('  TUMAKUDER  ->  http://localhost:' + port);
  console.log('  Durdurmak icin Ctrl+C');
  console.log('');
});
sunucu.listen(port);
