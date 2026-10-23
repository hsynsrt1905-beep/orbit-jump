# Orbit Jump — proje durumu

> Son güncelleme: 23 Ekim 2026 · Bu dosya her önemli gelişmede ve yeni hedefte güncellenir.

## Proje ne yapıyor?

**Orbit Jump: Uzay Zıplama Oyunu**, tek dokunuşla oynanan bir uzay arcade oyunudur. Top bir gezegenin etrafında döner; oyuncu doğru anda dokunup topu bir sonraki gezegene fırlatır. Gezegenin kenarına yakın iniş "PERFECT" sayılır ve kombo zinciri başlatır. Her gezegende bir süre sayacı vardır, beklerse gezegen süpernova olur.

- **Platform:** Android (Google Play, paket `com.orbitjump.game`) + tarayıcı sürümü (https://orbit-jump-73b68.web.app/game/)
- **Teknoloji:** React 19 + Vite, Capacitor 8 (Android), Firebase (Auth, Firestore, Analytics, Crashlytics, Hosting), Google AdMob
- **Geliştirici:** Tek kişilik bağımsız geliştirici (Türkiye)
- **Gelir modeli:** Ücretsiz oyun + reklam (ödüllü, geçiş). Web sürümü reklamsız, Play Store'a yönlendirir.

## Gelinen aşama

| Alan | Durum |
|---|---|
| Play Store | Yayında. Son yayınlanan sürüm 1.0.11 (11 Ekim 2026); **1.0.13 (kod 14) incelemede** |
| Değerlendirmeler | 5,0★ — 12 puan, 11 yorum, hepsi cevaplı |
| AdMob | Yayında, politika sorunu yok. Ekim ayı ~₺18, eBGBM ~₺223, eşleşme %100. Ödeme için kimlik/banka adımları kullanıcıda |
| Firebase | Spark (ücretsiz) plan, kotaların çok altında. Site yayında: /play, /privacy, /delete-account, /game, app-ads.txt |
| Web sürümü | Kendi sitemizde yayında; itch.io / CrazyGames yüklemesi bekliyor (ofis ağı bu siteleri engelliyor) |
| Instagram @orbit.jump | 7 gönderi (5 Reels), en iyi Reels 2.100+ izlenme, düzenli günlük paylaşım + linkli hikâye |
| TikTok @orbit.jump | 5 video; telefondan atılanlar izlenme alıyor, webden atılanlar 0'da kaldı |
| LinkedIn | Lansman gönderisi yayında; 2. gönderi 24 Ekim'de planlı |
| Otomasyon | 14 alt ajan (yorum cevaplama, paylaşım, hesap ısıtma, Play Console / AdMob / Firebase yöneticileri), oturum açılışında otomatik kurulum |

## Özellikler (features)

### Oynanış
- Tek dokunuşla gezegenden gezegene zıplama, gezegen başına süre sayacı
- **PERFECT** iniş ve kombo/seri çarpanı
- Zorluk kademeleri (Kolay → Normal → …) skor arttıkça yükselir
- **4 oyun modu:** Normal · Süpernova (gezegen başına 5 sn, 2× puan) · Zen (süre yok) · Hızlı
- Güçlendirmeler (kalkan, zaman) ve ödüllü reklamla "Reklam izle & devam et"

### İlerleme ve elde tutma
- **Günlük Meydan Okuma:** herkes için aynı harita (gün tohumlu)
- **Skor tabloları:** tüm zamanlar, haftalık, günlük (Firestore)
- **Günlük görevler** ve **rozetler**
- **Günlük seri ödülü** (art arda giriş) + yerel hatırlatma bildirimleri ve "geri dön" bildirimleri
- Kristal ekonomisi ve **mağaza:** toplar (altın, yakut, zümrüt, nova), izler (altın, ateş, camgöbeği), uzay temaları (Nebula, Boşluk, Güneş, Galaktik)

### Hesap ve veri
- Anonim giriş + isteğe bağlı **Google ile giriş** → bulut kayıt (cihazlar arası ilerleme birleştirme)
- Benzersiz oyuncu adı, **hesap silme** (uygulama içi ve web sayfası)
- AB/İngiltere için **GDPR onay mesajı** (UMP), menüde "Gizlilik seçenekleri"

### Teknik
- Zayıf cihazlar için otomatik **lite mod** (akıcılık)
- **Çok dil:** Türkçe, İngilizce, İspanyolca, Almanca, Rusça
- Firebase Analytics olayları, Crashlytics çökme raporu
- Uygulama içi **değerlendirme isteği** (en az 5 oyun + yeni rekor, 30 günde bir)
- Skor paylaşma (Play Store bağlantısıyla)
- Tarayıcı sürümü: reklamsız, Google girişsiz, Play yönlendirmeli (`npm run build:web`)

## Hedefler

### Yakın (bu hafta / bu ay)
- [ ] 1.0.13'ün incelemeden geçip yayına çıkması (Günlük Meydan Okuma, haftalık tablo, günlük görevler)
- [ ] Play Store'da görünen geliştirici adresinin değiştirilmesi (kullanıcı yapacak)
- [ ] AdMob kimlik doğrulama ve banka bilgisi (kullanıcı yapacak)
- [ ] Web sürümünü itch.io ve CrazyGames'e yüklemek (başka ağdan)
- [ ] Yeni oyun kayıtlarıyla Reels/TikTok kuyruğunu doldurmak (Süpernova, PERFECT serisi, tema/mağaza)
- [ ] `cloudSave.js` içindeki `nameKey` hatası (`/s+/g` → `/\s+/g`) — mevcut isimler için geçiş planıyla düzeltmek
- [ ] AdMob'a kullanıcının telefonunu test cihazı olarak eklemek

### Orta vade (1-3 ay)
- [ ] Instagram ve TikTok'ta ilk 100 takipçi; Play'de 100+ yükleme, 50+ değerlendirme
- [ ] Ödüllü reklam yerleşimlerini artırmak (günlük ödülü ikiye katla, kozmetik aç) — oyuncu dostu şekilde
- [ ] Global kitle: yüksek eBGBM'li ülkelere (ABD, Almanya, İngiltere) yönelik İngilizce içerik
- [ ] Yeni içerik: yeni temalar/toplar, sezonluk etkinlik, başarımlar (Play Games başarımları)
- [ ] Web sürümüne CrazyGames SDK (gelir) ve Poki başvurusu

### Uzun vade
- [ ] iOS sürümü (App Store)
- [ ] Gerekirse Firebase Blaze plana geçiş (günlük binlerce oyuncu veya sunucu tarafı hile kontrolü gerekince)
- [ ] Sunucu tarafı skor doğrulama (hile önleme)
