/**
 * Görsel araçları:  node tools/gorsel.mjs
 * - assets/img içindeki jpg/png dosyalarının .webp sürümlerini üretir
 * - paylaşım (OG) kapak görselini oluşturur
 * sharp paketi kurulu değilse sessizce atlanır.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp kurulu değil — görsel dönüşümü atlandı (npm i sharp).');
  process.exit(0);
}

const imgDizin = path.join(kok, 'assets/img');

/* ---- 1) WebP sürümleri ---- */
let kazanc = 0, adet = 0;
for (const dosya of fs.readdirSync(imgDizin)) {
  if (!/\.(jpe?g|png)$/i.test(dosya)) continue;
  const kaynak = path.join(imgDizin, dosya);
  const hedef = kaynak.replace(/\.(jpe?g|png)$/i, '.webp');
  const oncesi = fs.statSync(kaynak).size;
  await sharp(kaynak).webp({ quality: 80 }).toFile(hedef);
  const sonrasi = fs.statSync(hedef).size;
  kazanc += oncesi - sonrasi;
  adet++;
  console.log(`  ${dosya}: ${(oncesi / 1024).toFixed(0)} KB → ${(sonrasi / 1024).toFixed(0)} KB`);
}
console.log(`✓ ${adet} görsel webp'ye çevrildi, ${(kazanc / 1024 / 1024).toFixed(2)} MB kazanç`);

/* ---- 2) Paylaşım kapağı ---- */
// Logoyu koyu zeminde okunur kılmak için beyaz siluete çevir
const logoYol = path.join(imgDizin, 'tumakuder-logo.png');
const ust = await sharp(logoYol).ensureAlpha().metadata();
const maske = await sharp(logoYol).ensureAlpha().extractChannel('alpha').toBuffer();
const logoBeyaz = await sharp({
  create: { width: ust.width, height: ust.height, channels: 3, background: '#ffffff' },
})
  .joinChannel(maske)
  .png()
  .toBuffer();
const logoB64 = logoBeyaz.toString('base64');
const kapakSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c6b47"/><stop offset="55%" stop-color="#10402c"/><stop offset="100%" stop-color="#08251a"/>
    </linearGradient>
    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5a623"/><stop offset="100%" stop-color="#e2930f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1010" cy="300" r="250" fill="#2fae70" opacity=".12"/>
  <circle cx="1010" cy="300" r="190" fill="none" stroke="#2fae70" stroke-opacity=".3" stroke-width="2" stroke-dasharray="8 10"/>
  <g transform="translate(905,205)">
    <rect x="10" y="26" width="210" height="160" rx="18" fill="#0f4a33" stroke="#2fae70" stroke-opacity=".75" stroke-width="3"/>
    <rect x="36" y="4" width="42" height="26" rx="8" fill="#2fae70"/>
    <rect x="150" y="4" width="42" height="26" rx="8" fill="#f5a623"/>
    <rect x="30" y="80" width="170" height="78" rx="12" fill="#08251a" opacity=".65"/>
    <rect x="42" y="94" width="34" height="50" rx="6" fill="url(#c)"/>
    <rect x="86" y="94" width="34" height="50" rx="6" fill="url(#c)" opacity=".7"/>
    <rect x="130" y="94" width="34" height="50" rx="6" fill="url(#c)" opacity=".45"/>
  </g>
  <image href="data:image/png;base64,${logoB64}" x="90" y="88" width="330"/>
  <text x="90" y="290" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="62" font-weight="800" fill="#ffffff">Atık Akümülatörler</text>
  <text x="90" y="366" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="62" font-weight="800" fill="#f5a623">Geri Kazanıma</text>
  <text x="90" y="438" font-family="'Segoe UI',sans-serif" font-size="27" fill="#ffffff" opacity=".8">Tüm Akü İthalatçıları ve Üreticileri Derneği</text>
  <rect x="90" y="486" width="86" height="5" rx="3" fill="#f5a623"/>
  <text x="90" y="546" font-family="'Segoe UI',sans-serif" font-size="24" fill="#ffffff" opacity=".65">tumakuder.org</text>
</svg>`;

await sharp(Buffer.from(kapakSvg)).png().toFile(path.join(imgDizin, 'og-kapak.png'));
console.log('✓ og-kapak.png üretildi');
