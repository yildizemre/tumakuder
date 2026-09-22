/* TÜMAKÜDER – arayüz etkileşimleri */
(function () {
  'use strict';

  /* ---- Mobil menü ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mobile-nav');
  var backdrop = document.querySelector('.backdrop');

  function closeNav() {
    if (!mnav) return;
    mnav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      mnav.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
    document.querySelector('.mobile-nav__close').addEventListener('click', closeNav);
    backdrop.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

    Array.prototype.forEach.call(mnav.querySelectorAll('.m-toggle'), function (btn) {
      btn.addEventListener('click', function () {
        var sub = btn.nextElementSibling;
        var open = sub.classList.toggle('is-open');
        btn.querySelector('.caret').style.transform = open ? 'rotate(-135deg) translateY(-2px)' : '';
      });
    });
  }

  /* ---- Akordeon (bilgi merkezi) ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.acc-head'), function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.acc-item');
      var body = head.nextElementSibling;
      var isOpen = item.classList.contains('is-open');
      var group = item.parentElement;
      Array.prototype.forEach.call(group.querySelectorAll('.acc-item'), function (i) {
        i.classList.remove('is-open');
        i.querySelector('.acc-body').classList.remove('is-open');
      });
      if (!isOpen) { item.classList.add('is-open'); body.classList.add('is-open'); }
    });
  });

  /* ---- Hero slider ---- */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dots button');
  if (slides.length > 1) {
    var idx = 0, timer;
    var arkaPlanlar = document.querySelectorAll('.hero__bg');
    function show(i) {
      idx = (i + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, n) { s.classList.toggle('is-active', n === idx); });
      Array.prototype.forEach.call(dots, function (d, n) { d.classList.toggle('is-active', n === idx); });
      Array.prototype.forEach.call(arkaPlanlar, function (b, n) { b.classList.toggle('is-active', n === idx); });
    }
    function play() { timer = setInterval(function () { show(idx + 1); }, 7000); }
    Array.prototype.forEach.call(dots, function (d, n) {
      d.addEventListener('click', function () { clearInterval(timer); show(n); play(); });
    });
    show(0); play();
  }

  /* ---- Sekmeler ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (wrap) {
    var tabs = wrap.querySelectorAll('.tab');
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-target');
        Array.prototype.forEach.call(tabs, function (t) { t.classList.toggle('is-active', t === tab); });
        Array.prototype.forEach.call(wrap.querySelectorAll('.tab-panel'), function (p) {
          p.classList.toggle('is-active', p.id === target);
        });
      });
    });
  });

  /* ---- Yukarı çık ---- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---- Görünüme girince belirme ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(reveals, function (el, i) {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  /* ---- Sayaç ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, hedef = parseInt(el.getAttribute('data-count'), 10), n = 0;
        var adim = Math.max(1, Math.round(hedef / 45));
        var t = setInterval(function () {
          n += adim;
          if (n >= hedef) { n = hedef; clearInterval(t); }
          el.textContent = n.toLocaleString('tr-TR') + (el.getAttribute('data-suffix') || '');
        }, 26);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (el) { co.observe(el); });
  }

  /* ---- Üye tabloları ---- */
  var uyeAlan = document.querySelector('[data-uyeler]');
  if (uyeAlan) {
    fetch('assets/data/uyeler.json')
      .then(function (r) { return r.json(); })
      .then(function (veri) {
        kurTablo('asil', veri.asil);
        kurTablo('fahri', veri.fahri);
      })
      .catch(function () {
        document.querySelectorAll('.uye-yukleniyor').forEach(function (el) {
          el.textContent = 'Üye listesi yüklenemedi. Sayfayı yenilemeyi deneyin.';
        });
      });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function kurTablo(tip, liste) {
    var govde = document.querySelector('#tablo-' + tip + ' tbody');
    var arama = document.querySelector('[data-arama="' + tip + '"]');
    var sehirSec = document.querySelector('[data-sehir="' + tip + '"]');
    var sayac = document.querySelector('[data-sayac="' + tip + '"]');
    if (!govde) return;

    var sehirler = liste.map(function (u) { return (u.sehir || '').trim(); })
      .filter(Boolean)
      .map(function (s) { return s.toLocaleUpperCase('tr-TR'); });
    sehirler = Array.from(new Set(sehirler)).sort(function (a, b) { return a.localeCompare(b, 'tr'); });
    if (sehirSec) {
      sehirSec.innerHTML = '<option value="">Tüm şehirler</option>' +
        sehirler.map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('');
    }

    function ciz() {
      var q = (arama && arama.value ? arama.value : '').toLocaleLowerCase('tr-TR').trim();
      var sehir = sehirSec && sehirSec.value ? sehirSec.value : '';
      var sonuc = liste.filter(function (u) {
        var metin = [u.kod, u.firma, u.sehir].join(' ').toLocaleLowerCase('tr-TR');
        var sehirOk = !sehir || (u.sehir || '').toLocaleUpperCase('tr-TR') === sehir;
        return sehirOk && (!q || metin.indexOf(q) > -1);
      });
      if (!sonuc.length) {
        govde.innerHTML = '<tr class="empty-row"><td colspan="3">Aramanıza uyan üye bulunamadı.</td></tr>';
      } else {
        govde.innerHTML = sonuc.map(function (u) {
          var ad = u.site
            ? '<a href="' + esc(u.site) + '" target="_blank" rel="noopener noreferrer" class="firma-bag">' + esc(u.firma) + ' <span aria-hidden="true">↗</span></a>'
            : esc(u.firma);
          return '<tr>' +
            (tip === 'asil' ? '<td class="kod">' + esc(u.kod) + '</td>' : '') +
            '<td class="firma">' + ad + '</td>' +
            '<td>' + esc(u.sehir || '—') + '</td>' +
            '</tr>';
        }).join('');
      }
      if (sayac) sayac.innerHTML = '<b>' + sonuc.length + '</b> / ' + liste.length + ' üye';
    }
    if (arama) arama.addEventListener('input', ciz);
    if (sehirSec) sehirSec.addEventListener('change', ciz);
    ciz();
  }

  /* ---- Tüzük ---- */
  var tuzukAlan = document.querySelector('[data-tuzuk]');
  if (tuzukAlan) {
    fetch('assets/data/tuzuk.json')
      .then(function (r) { return r.json(); })
      .then(function (veri) {
        var nav = document.querySelector('[data-tuzuk-nav]');
        if (nav) {
          nav.innerHTML = veri.bolumler.map(function (b) {
            return '<a href="#bolum-' + b.no + '">' + b.no + '. ' + esc(b.baslik) + '</a>';
          }).join('');
        }
        tuzukAlan.innerHTML = veri.bolumler.map(function (b) {
          return '<section class="tuzuk-bolum" id="bolum-' + b.no + '">' +
            '<h2><span class="no">Madde ' + b.no + '</span> ' + esc(b.baslik) + '</h2>' +
            b.maddeler.map(function (m) {
              if (!m.metin) return '';
              return '<div class="madde">' +
                (m.no ? '<b>Madde ' + esc(m.no) + '</b>' : '') +
                '<p>' + esc(m.metin) + '</p></div>';
            }).join('') +
            '</section>';
        }).join('');
        var ara = document.querySelector('[data-tuzuk-ara]');
        if (ara) {
          ara.addEventListener('input', function () {
            var q = ara.value.toLocaleLowerCase('tr-TR').trim();
            var bulunan = 0;
            Array.prototype.forEach.call(tuzukAlan.querySelectorAll('.tuzuk-bolum'), function (sec) {
              var esles = !q || sec.textContent.toLocaleLowerCase('tr-TR').indexOf(q) > -1;
              sec.style.display = esles ? '' : 'none';
              if (esles) bulunan++;
            });
            var bilgi = document.querySelector('[data-tuzuk-sayac]');
            if (bilgi) bilgi.innerHTML = '<b>' + bulunan + '</b> / ' + veri.bolumler.length + ' bölüm';
          });
        }
      })
      .catch(function () {
        tuzukAlan.innerHTML = '<p>Tüzük metni yüklenemedi. Sayfayı yenilemeyi deneyin.</p>';
      });
  }

  /* ---- Yıl ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-yil]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ==========================================================================
   TÜMAKÜDER – ek bileşenler: tema, arama, harita, takvim, SSS, hesaplayıcı
   ========================================================================== */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function kucuk(s) { return String(s || '').toLocaleLowerCase('tr-TR'); }
  function buyuk(s) { return String(s || '').toLocaleUpperCase('tr-TR'); }

  /* ---------- Okuma ilerlemesi ---------- */
  var cubuk = document.querySelector('.read-progress');
  if (cubuk) {
    var guncelle = function () {
      var yukseklik = document.documentElement.scrollHeight - window.innerHeight;
      cubuk.style.width = (yukseklik > 0 ? (window.scrollY / yukseklik) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', guncelle, { passive: true });
    window.addEventListener('resize', guncelle);
    guncelle();
  }

  /* ---------- Süreç bağlantı çizgisi ---------- */
  var surec = document.querySelector('.process');
  if (surec && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (girisler, gozlemci) {
      girisler.forEach(function (g) {
        if (g.isIntersecting) { surec.classList.add('is-in'); gozlemci.disconnect(); }
      });
    }, { threshold: 0.25 }).observe(surec);
  }

  /* ---------- Site içi arama ---------- */
  var katman = document.querySelector('.search-overlay');
  if (katman) {
    var girdi = katman.querySelector('input');
    var sonucAlan = katman.querySelector('.search-results');
    var indeks = null, secili = -1;

    function ac() {
      katman.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      girdi.focus();
      if (!indeks) {
        fetch('assets/data/arama.json')
          .then(function (r) { return r.json(); })
          .then(function (v) { indeks = v; ciz(); })
          .catch(function () { sonucAlan.innerHTML = '<p class="search-empty">Arama verisi yüklenemedi.</p>'; });
      }
    }
    function kapat() {
      katman.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-arama-ac]'), function (b) {
      b.addEventListener('click', ac);
    });
    katman.addEventListener('click', function (e) { if (e.target === katman) kapat(); });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); ac(); return; }
      if (!katman.classList.contains('is-open')) return;
      if (e.key === 'Escape') { kapat(); return; }
      var baglar = sonucAlan.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!baglar.length) return;
        secili = (secili + (e.key === 'ArrowDown' ? 1 : -1) + baglar.length) % baglar.length;
        Array.prototype.forEach.call(baglar, function (a, i) { a.classList.toggle('is-hl', i === secili); });
        baglar[secili].scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter' && secili > -1 && baglar[secili]) baglar[secili].click();
    });

    function isaretle(metin, q) {
      var yer = kucuk(metin).indexOf(q);
      if (yer === -1) return esc(metin.slice(0, 110)) + (metin.length > 110 ? '…' : '');
      var bas = Math.max(0, yer - 45);
      var parca = metin.slice(bas, yer + q.length + 75);
      var i = kucuk(parca).indexOf(q);
      var son = bas + parca.length < metin.length ? '…' : '';
      return (bas > 0 ? '…' : '') + esc(parca.slice(0, i)) + '<mark>' + esc(parca.slice(i, i + q.length)) +
        '</mark>' + esc(parca.slice(i + q.length)) + son;
    }

    function ciz() {
      var q = kucuk(girdi.value).trim();
      secili = -1;
      if (!indeks) return;
      if (q.length < 2) {
        sonucAlan.innerHTML = '<p class="search-empty">Sayfalarda, tüzük maddelerinde ve üye firmalarda arayın.<br>En az 2 harf yazın.</p>';
        return;
      }
      var bulunan = indeks.filter(function (k) { return kucuk(k.b + ' ' + k.m).indexOf(q) > -1; });
      bulunan.sort(function (a, b) {
        return (kucuk(a.b).indexOf(q) > -1 ? 0 : 1) - (kucuk(b.b).indexOf(q) > -1 ? 0 : 1);
      });
      if (!bulunan.length) {
        sonucAlan.innerHTML = '<p class="search-empty">“' + esc(girdi.value) + '” için sonuç bulunamadı.</p>';
        return;
      }
      sonucAlan.innerHTML = bulunan.slice(0, 30).map(function (k) {
        return '<a href="' + esc(k.u) + '"><span class="tur">' + esc(k.t) + '</span><b>' +
          isaretle(k.b, q) + '</b><small>' + isaretle(k.m, q) + '</small></a>';
      }).join('');
    }
    girdi.addEventListener('input', ciz);
  }

  /* ---------- Türkiye haritası ---------- */
  var haritaAlan = document.querySelector('[data-harita]');
  if (haritaAlan) {
    Promise.all([
      fetch('assets/data/iller.json').then(function (r) { return r.json(); }),
      fetch('assets/data/uyeler.json').then(function (r) { return r.json(); })
    ]).then(function (v) {
      var harita = v[0], uyeler = v[1];
      var panel = document.querySelector('[data-harita-panel]');
      var baslik = document.querySelector('[data-harita-baslik]');
      var altBaslik = document.querySelector('[data-harita-alt]');

      // İçel = Mersin
      function ilAdi(s) {
        var a = buyuk((s || '').trim());
        return a === 'İÇEL' ? 'MERSİN' : a;
      }
      var kayitlar = [];
      uyeler.asil.forEach(function (u) { kayitlar.push({ tur: 'asil', il: ilAdi(u.sehir), firma: u.firma, site: u.site }); });
      uyeler.fahri.forEach(function (u) { kayitlar.push({ tur: 'fahri', il: ilAdi(u.sehir), firma: u.firma, site: u.site }); });

      var sayim = {};
      kayitlar.forEach(function (k) {
        if (!sayim[k.il]) sayim[k.il] = { asil: 0, fahri: 0 };
        sayim[k.il][k.tur]++;
      });

      var enYuksek = Math.max.apply(null, Object.keys(sayim).map(function (i) { return sayim[i].asil + sayim[i].fahri; }).concat([1]));

      var svg = '<svg class="tr-map" viewBox="' + harita.viewBox + '" role="img" aria-label="Türkiye haritası üzerinde üye firma dağılımı">' +
        '<path class="kara" d="' + harita.path + '"/>';
      Object.keys(harita.iller).forEach(function (il) {
        var xy = harita.iller[il];
        var s = sayim[il];
        if (!s) return;
        var toplam = s.asil + s.fahri;
        var r = 7 + Math.round(Math.sqrt(toplam / enYuksek) * 11);
        svg += '<g class="il' + (toplam >= enYuksek * 0.4 ? ' yogun' : '') + '" data-il="' + esc(il) + '" tabindex="0" role="button" aria-label="' + esc(il) + ', ' + toplam + ' firma">' +
          '<circle class="halka" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + (r + 7) + '"/>' +
          '<circle class="nokta" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + r + '"/>' +
          '<text class="etiket" x="' + xy[0] + '" y="' + (xy[1] - r - 9) + '" text-anchor="middle">' + esc(il) + ' (' + toplam + ')</text>' +
          '</g>';
      });
      svg += '</svg>';
      haritaAlan.innerHTML = svg;

      function goster(il) {
        var liste = kayitlar.filter(function (k) { return k.il === il; });
        liste.sort(function (a, b) { return a.tur === b.tur ? a.firma.localeCompare(b.firma, 'tr') : (a.tur === 'fahri' ? -1 : 1); });
        if (baslik) baslik.textContent = il;
        if (altBaslik) altBaslik.textContent = liste.length + ' firma · ' +
          liste.filter(function (k) { return k.tur === 'fahri'; }).length + ' yetkili çözüm ortağı';
        panel.innerHTML = liste.map(function (k) {
          return '<div class="firma-kart"><span class="rozet rozet--' + k.tur + '">' +
            (k.tur === 'asil' ? 'ASİL ÜYE' : 'YETKİLİ FİRMA') + '</span><b>' +
            (k.site ? '<a href="' + esc(k.site) + '" target="_blank" rel="noopener noreferrer" class="firma-bag">' + esc(k.firma) + ' <span aria-hidden="true">↗</span></a>' : esc(k.firma)) +
            '</b></div>';
        }).join('');
        Array.prototype.forEach.call(haritaAlan.querySelectorAll('.il'), function (g) {
          g.classList.toggle('is-active', g.getAttribute('data-il') === il);
        });
      }

      Array.prototype.forEach.call(haritaAlan.querySelectorAll('.il'), function (g) {
        var il = g.getAttribute('data-il');
        g.addEventListener('click', function () { goster(il); });
        g.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goster(il); }
        });
      });

      var secGirdi = document.querySelector('[data-harita-ara]');
      if (secGirdi) {
        secGirdi.innerHTML = '<option value="">İl seçin…</option>' +
          Object.keys(sayim).sort(function (a, b) { return a.localeCompare(b, 'tr'); })
            .map(function (i) { return '<option value="' + esc(i) + '">' + esc(i) + ' (' + (sayim[i].asil + sayim[i].fahri) + ')</option>'; }).join('');
        secGirdi.addEventListener('change', function () { if (secGirdi.value) goster(secGirdi.value); });
      }

      var ilkIl = location.hash ? decodeURIComponent(location.hash.slice(1)).toLocaleUpperCase('tr-TR') : 'İSTANBUL';
      goster(sayim[ilkIl] ? ilkIl : 'İSTANBUL');
    }).catch(function () {
      haritaAlan.innerHTML = '<p class="map-bos">Harita verisi yüklenemedi.</p>';
    });
  }

  /* ---------- Yükümlülük takvimi ---------- */
  var takvimAlan = document.querySelector('[data-takvim]');
  var takvimMini = document.querySelector('[data-takvim-mini]');
  if (takvimAlan || takvimMini) {
    fetch('assets/data/takvim.json').then(function (r) { return r.json(); }).then(function (veri) {
      var bugun = new Date(); bugun.setHours(0, 0, 0, 0);
      var aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

      var kayitlar = veri.yukumlulukler.map(function (y) {
        var k = { veri: y };
        if (y.tip === 'yillik') {
          var t = new Date(bugun.getFullYear(), y.ay - 1, y.gun);
          if (t < bugun) t = new Date(bugun.getFullYear() + 1, y.ay - 1, y.gun);
          k.tarih = t;
          k.etiket = y.gun + ' ' + aylar[y.ay - 1] + ' ' + t.getFullYear();
          k.kalan = Math.round((t - bugun) / 86400000);
        } else if (y.tip === 'ceyreklik') {
          var ay = [3, 6, 9, 12].find(function (a) { return a > bugun.getMonth() + 1 || (a === bugun.getMonth() + 1); }) || 3;
          k.etiket = 'Üçer aylık dönem';
          k.kalan = null;
        } else if (y.tip === 'aylik') {
          k.etiket = 'Her ay';
          k.kalan = null;
        } else {
          k.etiket = 'Sürekli';
          k.kalan = null;
        }
        return k;
      });

      var tarihli = kayitlar.filter(function (k) { return k.tarih; }).sort(function (a, b) { return a.tarih - b.tarih; });
      var tarihsiz = kayitlar.filter(function (k) { return !k.tarih; });

      if (takvimAlan) {
        takvimAlan.innerHTML = tarihli.concat(tarihsiz).map(function (k) {
          var sinif = k.kalan !== null && k.kalan <= 45 ? ' yakin' : '';
          var kalanYazi = k.kalan === null ? 'düzenli' : (k.kalan === 0 ? 'bugün' : k.kalan + ' gün kaldı');
          return '<article class="duty' + sinif + '">' +
            '<span class="duty__kalan">' + kalanYazi + '</span>' +
            '<span class="duty__tarih">' + esc(k.etiket) + '</span>' +
            '<h3>' + esc(k.veri.baslik) + '</h3>' +
            '<p>' + esc(k.veri.aciklama) + '</p>' +
            (k.veri.bag ? '<a class="duty__tekrar" href="' + esc(k.veri.bag) + '">Ayrıntı ↗</a>' : '') +
            '</article>';
        }).join('');
      }

      if (takvimMini) {
        takvimMini.innerHTML = tarihli.slice(0, 3).map(function (k) {
          return '<li><time>' + esc(k.etiket) + '</time><span>' + esc(k.veri.baslik) +
            (k.kalan !== null ? ' <b style="color:var(--amber-500)">· ' + k.kalan + ' gün</b>' : '') + '</span></li>';
        }).join('');
      }
    }).catch(function () {
      if (takvimAlan) takvimAlan.innerHTML = '<p>Takvim yüklenemedi.</p>';
    });
  }

  /* ---------- SSS ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.faq-q'), function (soru) {
    soru.addEventListener('click', function () {
      var kutu = soru.closest('.faq-item');
      var cevap = soru.nextElementSibling;
      var acik = kutu.classList.toggle('is-open');
      cevap.classList.toggle('is-open', acik);
      soru.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });
  });

  /* ---------- Depozito hesaplayıcı ---------- */
  var hesapAlan = document.querySelector('[data-hesap]');
  if (hesapAlan) {
    fetch('assets/data/bedeller.json').then(function (r) { return r.json(); }).then(function (veri) {
      var yilSec = document.querySelector('[data-hesap-yil]');
      var toplamEl = document.querySelector('[data-hesap-toplam]');
      var uyariEl = document.querySelector('[data-hesap-uyari]');
      var tabloEl = document.querySelector('[data-bedel-tablo]');
      var yillar = Object.keys(veri.yillar).sort().reverse();

      if (yilSec) {
        yilSec.innerHTML = yillar.map(function (y) { return '<option>' + esc(y) + '</option>'; }).join('');
        yilSec.addEventListener('change', function () { kur(yilSec.value); });
      }

      function para(n) {
        return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
      }

      function kur(yil) {
        var satirlar = veri.yillar[yil] || [];
        var eksik = satirlar.some(function (s) { return s.tutar === null || s.tutar === undefined; });

        if (tabloEl) {
          tabloEl.innerHTML = '<div class="table-scroll"><table class="data"><thead><tr>' +
            '<th>Akümülatör kategorisi</th><th>Birim</th><th>' + esc(yil) + ' tutarı</th></tr></thead><tbody>' +
            satirlar.map(function (s) {
              return '<tr><td class="firma">' + esc(s.kategori) + '</td><td>' + esc(s.birim) + '</td><td>' +
                (s.tutar == null ? '<span style="color:var(--ink-400)">tebliğe bakınız</span>' : para(s.tutar)) + '</td></tr>';
            }).join('') + '</tbody></table></div>';
        }

        hesapAlan.innerHTML = satirlar.map(function (s, i) {
          return '<div class="calc-row"><span>' + esc(s.kategori) +
            (s.tutar == null ? '' : ' <small style="color:var(--ink-400)">· ' + para(s.tutar) + '/' + esc(s.birim) + '</small>') +
            '</span><input type="number" min="0" step="1" value="0" data-i="' + i + '" aria-label="' + esc(s.kategori) + ' adedi"></div>';
        }).join('');

        if (uyariEl) uyariEl.style.display = eksik ? '' : 'none';

        function hesapla() {
          var toplam = 0;
          Array.prototype.forEach.call(hesapAlan.querySelectorAll('input'), function (inp) {
            var s = satirlar[+inp.getAttribute('data-i')];
            var adet = parseFloat(inp.value) || 0;
            if (s && s.tutar != null) toplam += adet * s.tutar;
          });
          if (toplamEl) toplamEl.textContent = para(toplam);
        }
        Array.prototype.forEach.call(hesapAlan.querySelectorAll('input'), function (inp) {
          inp.addEventListener('input', hesapla);
        });
        hesapla();

        var kaynak = veri.kaynak && veri.kaynak[yil];
        var kaynakEl = document.querySelector('[data-hesap-kaynak]');
        if (kaynakEl) {
          kaynakEl.innerHTML = kaynak && kaynak.belge
            ? 'Kaynak: <a href="' + esc(kaynak.belge) + '" target="_blank" rel="noopener">' + esc(yil) + ' tebliğ eki (' + esc(kaynak.tebligNo || '-') + ')</a>'
            : '';
        }
      }
      kur(yillar[0]);
    }).catch(function () {
      hesapAlan.innerHTML = '<p>Bedel verisi yüklenemedi.</p>';
    });
  }
})();
