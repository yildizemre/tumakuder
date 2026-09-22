/**
 * TÜMAKÜDER – basit statik site üreticisi
 *   node build.mjs
 * - src/pages/*.html içeriklerini src/layout.html şablonuna gömer, kök dizine yazar
 * - her sayfa için BreadcrumbList (JSON-LD) üretir
 * - assets/data/arama.json arama indeksini oluşturur
 * - sitemap.xml dosyasını günceller
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.tumakuder.org/';
const layout = fs.readFileSync(path.join(kok, 'src/layout.html'), 'utf8');
const sayfaDizin = path.join(kok, 'src/pages');
const dosyalar = fs.readdirSync(sayfaDizin).filter((f) => f.endsWith('.html'));

const duz = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();

const aramaIndeksi = [];
let sayac = 0;

/* ---- Ana sayfa slaytları (assets/data/hero.json) ---- */
function heroUret() {
  let veri;
  try {
    veri = JSON.parse(fs.readFileSync(path.join(kok, 'assets/data/hero.json'), 'utf8'));
  } catch {
    return '';
  }
  const slaytlar = (veri.slaytlar || []).filter((s) => {
    const varMi = fs.existsSync(path.join(kok, s.gorsel));
    if (!varMi) console.log(`  ! hero görseli bulunamadı, atlandı: ${s.gorsel}`);
    return varMi;
  });
  if (!slaytlar.length) return '';

  const kacis = (s) => String(s || '').replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;');

  const arkaPlan = slaytlar
    .map((s, i) => {
      const webp = s.gorsel.replace(/\.(jpe?g|png)$/i, '.webp');
      const kaynak = fs.existsSync(path.join(kok, webp))
        ? `          <source srcset="${webp}" type="image/webp">\n`
        : '';
      return (
        `        <picture class="hero__bg${i === 0 ? ' is-active' : ''}">\n` +
        kaynak +
        `          <img src="${s.gorsel}" alt=""${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>\n` +
        `        </picture>`
      );
    })
    .join('\n');

  const noktalar = slaytlar
    .map((s, i) => `        <button${i === 0 ? ' class="is-active"' : ''} aria-label="${i + 1}. slayt"></button>`)
    .join('\n');

  const icerikler = slaytlar
    .map(
      (s, i) =>
        `        <div class="hero__slide${i === 0 ? ' is-active' : ''}">\n` +
        `          <div class="eyebrow eyebrow--left">${kacis(s.etiket)}</div>\n` +
        `          <h1>${s.baslik}</h1>\n` +
        `          <p>${kacis(s.metin)}</p>\n` +
        (s.btnYazi
          ? `          <a class="btn btn--amber" href="${s.btnBag || '#'}">${kacis(s.btnYazi)} <i>↗</i></a>\n`
          : '') +
        `        </div>`
    )
    .join('\n\n');

  console.log(`  · hero: ${slaytlar.length} slayt`);
  return `<section class="hero">
  <div class="container">
    <div class="hero__frame">
      <div class="hero__bgs" aria-hidden="true">
${arkaPlan}
      </div>

      <div class="hero__dots">
${noktalar}
      </div>

      <div class="hero__content">
${icerikler}
      </div>
    </div>
  </div>
</section>`;
}
const heroHtml = heroUret();

for (const dosya of dosyalar) {
  const ham = fs.readFileSync(path.join(sayfaDizin, dosya), 'utf8');

  const meta = {};
  const m = ham.match(/^<!--meta([\s\S]*?)-->/);
  if (m) {
    for (const satir of m[1].split('\n')) {
      const p = satir.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
      if (p) meta[p[1]] = p[2];
    }
  }
  const icerik = ham.replace(/^<!--meta[\s\S]*?-->\s*/, '').replace('{{HERO}}', heroHtml);
  const slug = dosya === 'index.html' ? '' : dosya;
  const baslik = meta.title || 'TÜMAKÜDER';

  // Ekmek kırıntısı (ana sayfa hariç)
  let jsonld = '';
  if (slug) {
    jsonld = `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE },
        { '@type': 'ListItem', position: 2, name: baslik, item: SITE + slug },
      ],
    })}</script>`;
  }
  // SSS sayfası: içerikteki soru-cevaplardan FAQPage üret
  if (meta.faq === 'true') {
    const sorular = [];
    for (const f of icerik.matchAll(
      /<button class="faq-q"[^>]*>([\s\S]*?)<span class="sign">[\s\S]*?<div class="faq-a"><div>([\s\S]*?)<\/div><\/div>/g
    )) {
      const soru = duz(f[1]);
      const cevap = duz(f[2]);
      if (soru && cevap) sorular.push({ '@type': 'Question', name: soru, acceptedAnswer: { '@type': 'Answer', text: cevap } });
    }
    if (sorular.length) {
      jsonld += '\n<script type="application/ld+json">' +
        JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: sorular }) + '</script>';
      console.log(`  · SSS: ${sorular.length} soru JSON-LD'ye eklendi`);
      for (const s of sorular) aramaIndeksi.push({ t: 'SSS', b: s.name, m: s.acceptedAnswer.text.slice(0, 240), u: 'sss.html' });
    }
  }

  // <img src="assets/img/x.jpg"> → webp sürümü varsa <picture> ile sar.
  // Zaten <picture> içinde yazılmış görseller korunur.
  const korunan = [];
  let icerikWebp = icerik.replace(/<picture[\s\S]*?<\/picture>/g, (blok) => {
    korunan.push(blok);
    return `@@PICTURE${korunan.length - 1}@@`;
  });
  icerikWebp = icerikWebp.replace(
    /<img ([^>]*?)src="(assets\/img\/[^"]+\.(?:jpe?g|png))"([^>]*)>/g,
    (tam, once, yol, sonra) => {
      const webp = yol.replace(/\.(jpe?g|png)$/i, '.webp');
      if (!fs.existsSync(path.join(kok, webp))) return tam;
      return `<picture><source srcset="${webp}" type="image/webp"><img ${once}src="${yol}"${sonra}></picture>`;
    }
  );
  icerikWebp = icerikWebp.replace(/@@PICTURE(\d+)@@/g, (_, i) => korunan[+i]);

  let cikti = layout
    .replace(/{{TITLE}}/g, baslik)
    .replace(/{{DESC}}/g, meta.desc || 'Tüm Akü İthalatçıları ve Üreticileri Derneği')
    .replace(/{{SLUG}}/g, slug)
    .replace('{{JSONLD}}', jsonld)
    .replace('{{CONTENT}}', icerikWebp);

  if (meta.nav) {
    cikti = cikti.replace(
      new RegExp('<li data-nav="' + meta.nav + '"'),
      '<li class="is-active" data-nav="' + meta.nav + '"'
    );
  }

  fs.writeFileSync(path.join(kok, dosya), cikti);
  sayac++;

  if (dosya !== '404.html') {
    const metin = duz(icerik);
    aramaIndeksi.push({ t: 'SAYFA', b: baslik, m: (meta.desc || metin).slice(0, 260), u: dosya });
    // uzun sayfaları başlıklarına göre de indeksle
    for (const h of icerik.matchAll(/<h([23])[^>]*?(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/g)) {
      const bas = duz(h[3]);
      if (bas.length < 4 || bas.length > 90) continue;
      const yer = metin.indexOf(bas);
      const sonrasi = yer > -1 ? metin.slice(yer + bas.length, yer + bas.length + 240).trim() : '';
      aramaIndeksi.push({ t: 'BÖLÜM', b: bas + ' — ' + baslik, m: sonrasi, u: dosya + (h[2] ? '#' + h[2] : '') });
    }
  }
}

// --- Tüzük maddeleri
try {
  const tuzuk = JSON.parse(fs.readFileSync(path.join(kok, 'assets/data/tuzuk.json'), 'utf8'));
  for (const b of tuzuk.bolumler) {
    for (const md of b.maddeler) {
      if (!md.metin || md.metin.length < 25) continue;
      aramaIndeksi.push({
        t: 'TÜZÜK',
        b: 'Madde ' + (md.no || b.no) + ' — ' + b.baslik,
        m: md.metin.slice(0, 240),
        u: 'tuzuk.html#bolum-' + b.no,
      });
    }
  }
} catch {}

// --- Üye firmalar
try {
  const uye = JSON.parse(fs.readFileSync(path.join(kok, 'assets/data/uyeler.json'), 'utf8'));
  for (const u of uye.asil) {
    aramaIndeksi.push({ t: 'ASİL ÜYE', b: u.firma, m: [u.sehir, u.kod ? 'Kod: ' + u.kod : ''].filter(Boolean).join(' · '), u: 'uyeler.html' });
  }
  for (const u of uye.fahri) {
    aramaIndeksi.push({ t: 'YETKİLİ FİRMA', b: u.firma, m: u.sehir || '', u: 'uyeler.html#fahri' });
  }
} catch {}

fs.writeFileSync(path.join(kok, 'assets/data/arama.json'), JSON.stringify(aramaIndeksi));

// --- Site haritası
const yayin = fs.readdirSync(kok).filter((f) => f.endsWith('.html') && f !== '404.html').sort();
const bugun = new Date().toISOString().slice(0, 10);
const oncelik = (s) => (s === 'index.html' ? '1.0' : /^duyuru-/.test(s) ? '0.6' : '0.8');
fs.writeFileSync(
  path.join(kok, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    yayin
      .map(
        (s) =>
          `  <url>\n    <loc>${SITE}${s === 'index.html' ? '' : s}</loc>\n    <lastmod>${bugun}</lastmod>\n    <priority>${oncelik(s)}</priority>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>\n'
);

console.log(`✓ ${sayac} sayfa üretildi.`);
console.log(`✓ arama indeksi: ${aramaIndeksi.length} kayıt (${Math.round(fs.statSync(path.join(kok, 'assets/data/arama.json')).size / 1024)} KB)`);
console.log(`✓ sitemap: ${yayin.length} adres`);
