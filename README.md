# TÜMAKÜDER – Kurumsal Web Sitesi

Tüm Akü İthalatçıları ve Üreticileri Derneği için hazırlanmış statik web sitesi.
İçerik tumakuder.org'dan taşınmış, tasarım dili lasder.org.tr referans alınarak modernleştirilmiştir.

## Çalıştırma

```bash
npm run dev
```

`build.mjs` sayfaları üretir, `serve.mjs` önizlemeyi http://localhost:4173 adresinde açar
(port doluysa otomatik olarak bir sonraki boş porta geçer).

> Sayfalar üye listesi, tüzük, takvim ve arama verisini `fetch` ile okur; bu yüzden dosyayı
> çift tıklayarak (`file://`) değil, bir sunucu üzerinden açın.

## Dizin yapısı

```
src/layout.html      Ortak şablon (header, arama, footer, JSON-LD, scriptler)
src/pages/*.html     Yalnızca sayfa içeriği + başındaki <!--meta --> bloğu
build.mjs            Şablon + içerik → kök dizindeki .html; arama indeksi ve sitemap üretir
serve.mjs            Basit statik geliştirme sunucusu
tools/gorsel.mjs     Görselleri WebP'ye çevirir, paylaşım kapağını üretir (npm run gorsel)
assets/css/style.css Tüm stil
assets/js/main.js    Menü, slider, arama, harita, takvim, SSS, tablolar, hesaplayıcı
assets/data/         Site verisi (aşağıda)
assets/img/          Hero görselleri, logo, EÇBS ekranları, etiket örneği
assets/docs/         PDF / DOC / XLS mevzuat ve form dosyaları
```

## Veri dosyaları

Sitenin içeriğinin büyük kısmı JSON'dan gelir; HTML'e dokunmadan güncellenebilir.

| Dosya | İçerik |
|---|---|
| `uyeler.json` | 111 asil üye + 55 fahri üye. Tablolar, harita ve arama bu dosyadan beslenir. `site` alanı firma adının bağlandığı adrestir. |
| `tuzuk.json` | 19 bölüm, 201 madde. Tüzük sayfası ve bölüm çipleri buradan üretilir. |
| `takvim.json` | Yükümlülük tarihleri (`tip`: yillik / ceyreklik / aylik / surekli). Kartlar bugüne göre sıralanır. |
| `bedeller.json` | Yıllara göre GEKAP / depozito tutarları. **Tutarlar `null` olduğu sürece hesaplayıcı 0 gösterir.** |
| `iller.json` | Türkiye sınır çizimi (Natural Earth, public domain) + 81 ilin harita koordinatı. |
| `hero.json` | Ana sayfa slaytları (görsel, etiket, başlık, metin, buton). Yeni slayt eklemek için buraya kayıt ekleyin. |
| `arama.json` | `build.mjs` tarafından otomatik üretilir — elle düzenlemeyin. |

### Depozito bedellerini girmek

`assets/data/bedeller.json` içindeki `yillar` bölümünde her kategorinin `tutar` alanına
Resmî Gazete'de yayımlanan tebliğdeki değeri yazın:

```json
{ "kategori": "Kurşun asitli akümülatör", "birim": "adet", "tutar": 25.50 }
```

Tutar girildiği anda tablo dolar, hesaplayıcı çalışır ve sayfadaki "tutarlar girilmemiştir"
uyarısı kendiliğinden kaybolur. Yeni bir yıl eklemek için `yillar` altına yeni bir anahtar
(`"2026": [ ... ]`) ve `kaynak` bölümüne o yılın tebliğ bilgisini ekleyin.

## Sayfa eklemek

1. `src/pages/` altında bir `.html` dosyası oluşturun.
2. En başına meta bloğunu yazın:

```html
<!--meta
title: Sayfa Başlığı
desc: Arama motorları için açıklama
nav: kurumsal        (aktif menü: index, kurumsal, atik, ithalat, mevzuat, duyurular, iletisim)
faq: true            (isteğe bağlı — SSS sayfası için FAQPage JSON-LD üretir)
-->
```

3. `node build.mjs` çalıştırın. Dosya adı yayınlanan adres olur (`kimdir.html` → `/kimdir.html`).

Menü bağlantıları `src/layout.html` içindedir.

## Build'in otomatik yaptıkları

- Her sayfaya `BreadcrumbList`, ana şablona `Organization` JSON-LD ekler.
- SSS sayfasındaki soru-cevaplardan `FAQPage` JSON-LD üretir.
- `<img src="assets/img/x.jpg">` etiketlerini, WebP sürümü varsa `<picture>` ile sarar.
- Sayfalar, tüzük maddeleri, üye firmalar ve SSS'ten arama indeksi (`arama.json`) oluşturur.
- `sitemap.xml` dosyasını günceller.

## Öne çıkan özellikler

- **Site içi arama** — başlık çubuğundaki büyüteç veya `Ctrl+K`; ok tuşlarıyla gezinme.
- **Toplama noktaları haritası** — il tıklandığında o ildeki yetkili firmalar listelenir.
- **Yükümlülük takvimi** — tarihler bugüne göre hesaplanır, 45 günden yakın olanlar turuncu.
- **Depozito hesaplayıcı** — kategori bazında adet girilerek toplam tutar hesaplanır.

## Yayına alma (Netlify)

`netlify.toml` hazırdır: build komutu `node build.mjs`, yayın dizini `.`.
Eski WordPress adresleri (`/index.php/...`) yeni sayfalara 301 ile yönlendirilir.

İletişim formu **Netlify Forms** ile çalışır; gönderimler Netlify panelindeki *Forms*
bölümünde görünür. Bildirim e-postası almak için panelden form bildirimi tanımlayın.
Form gönderimi sonrası kullanıcı `mesaj-alindi.html` sayfasına yönlendirilir.

Alan adı bağlandıktan sonra `sitemap.xml`, `robots.txt` ve `src/layout.html` içindeki
`canonical` / `og:` adreslerinin doğru alan adını gösterdiğini kontrol edin.

## Üye listelerindeki bağlantılar

Üye tablolarında telefon ve e-posta gösterilmez; firma adı, firmanın web sitesine açılır.
Adresler e-posta alan adından türetilmiştir (95 asil, 37 fahri üye). Yanlış veya eksik bir
adres varsa `uyeler.json` içindeki ilgili kaydın `site` alanını düzeltin; alan silinirse
firma adı düz metin olarak görünür.

## Ana sayfa slaytı eklemek

1. Görseli `assets/img/` içine koyun (geniş bant, yaklaşık 2170×720 px, sol tarafı koyu olmalı).
2. `assets/data/hero.json` içindeki `slaytlar` dizisine bir kayıt ekleyin; başlıkta `<em>` ile sardığınız kelimeler turuncu görünür.
3. `npm run gorsel` (WebP üretir) ve `node build.mjs` çalıştırın.

Slayt sayısı kaç olursa olsun noktalar, arka planlar ve otomatik geçiş kendiliğinden uyum sağlar.
JSON'da yazan ama dosyası bulunmayan görseller atlanır ve build çıktısında uyarı verir.

## Notlar

- Üye firma logoları elde olmadığı için ana sayfada firma adları kayan şeritte tipografik
  olarak gösterilir. Logo dosyaları geldiğinde `.member-chip` içine `<img>` eklenebilir.
- Görseller `npm run gorsel` ile WebP'ye çevrilir (yaklaşık 7 MB kazanç). Yeni görsel
  eklediğinizde bu komutu çalıştırıp `node build.mjs` ile yeniden üretin.
- Harita sınır verisi Natural Earth'ten alınmıştır (public domain, atıf zorunluluğu yoktur).
