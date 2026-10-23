# Orbit Jump — proje durumu

> Son güncelleme: 23 Ekim 2026 · Bu dosya her önemli gelişmede ve yeni hedefte güncellenir.

## Proje ne yapıyor?

**Orbit Jump: Uzay Zıplama Oyunu**, tek dokunuşla oynanan bir uzay arcade oyunudur. Top bir gezegenin etrafında döner; oyuncu doğru anda dokunup topu bir sonraki gezegene fırlatır. Gezegenin kenarına yakın iniş "PERFECT" sayılır ve kombo zinciri başlatır. Her gezegende bir süre sayacı vardır, beklerse gezegen süpernova olur.

- **Platform:** Android (Google Play, paket `com.orbitjump.game`) + tarayıcı sürümü (https://orbit-jump-73b68.web.app/game/)
- **Geliştirici:** Tek kişilik bağımsız geliştirici (Türkiye)
- **Gelir modeli:** Ücretsiz oyun + reklam (ödüllü, geçiş). Web sürümü reklamsız, Play Store'a yönlendirir.

## Teknoloji

| Katman | Kullanılan | Not |
|---|---|---|
| Arayüz | React 19.2 (`react`, `react-dom`) | Oyunun tamamı `src/App.jsx` içinde; yardımcı modüller `engagement.js`, `cloudSave.js`, `periodic.js`, `firebase.js` |
| Derleme | Vite 8 + `@vitejs/plugin-react` 6 | Hızlı geliştirme sunucusu (HMR). React Compiler açık değil (geliştirme/derleme hızına etkisi yüzünden) |
| Stil | Tailwind CSS 4 (`@tailwindcss/vite`, PostCSS, autoprefixer) | |
| Kod kalitesi | ESLint 10 (`@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) | `eslint.config.js`. TypeScript yok; ileride tip denetimli lint için TS'e geçilebilir |
| Mobil | Capacitor 8 (Android) | `capacitor.config.json`, `android/`. minSdk 24, target/compile SDK 36. Simge ve açılış ekranı `@capacitor/assets` ile üretilir |
| Capacitor eklentileri | app, status-bar, share, local-notifications, `@capacitor-community/in-app-review` | Paylaşım, bildirim hatırlatmaları, uygulama içi değerlendirme |
| Reklam | `@capacitor-community/admob` 8 | Ödüllü + geçiş reklamları, UMP/GDPR onayı. Web sürümünde reklam yok (AdSense betiği derlemede çıkarılır) |
| Backend | Firebase 12 (web SDK) + `@capacitor-firebase/*` 8 | Authentication (anonim + Google), Cloud Firestore (skor tabloları, bulut kayıt, isimler), Analytics, Crashlytics, Hosting |
| Site | Firebase Hosting (`hosting/`) | /play (Play yönlendirme), /privacy, /delete-account, /game (web sürümü), app-ads.txt |
| Android derleme | Gradle 8.14, JDK jbr-21 | İmzalı AAB/APK Android Studio'da üretilir |
| Bileşen kontrolü | Context7 MCP (`.mcp.json`) + `npm audit` | Her bileşen ekleme/güncellemede güncellik, uyum ve güvenlik kontrolü (`.claude/rules/bilesen-kontrolu.md`) |

### Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu (Vite, HMR) |
| `npm run build` | Uygulama derlemesi → `dist/` (Capacitor bunu Android'e kopyalar: `npx cap sync android`) |
| `npm run build:web` | Reklamsız tarayıcı sürümü → `dist-web/` ve `hosting/game/` |
| `npm run preview` | Derlenmiş sürümü yerelde açar |
| `npm run lint` | ESLint |
| `npx firebase deploy --only hosting --project orbit-jump-73b68` | Siteyi yayınlar |

### Klasörler

- `src/` oyun kodu · `public/` statik dosyalar · `android/` Capacitor Android projesi · `hosting/` web sitesi
- `store/` mağaza ve sosyal medya malzemeleri (`store/social/` gönderi kuyrukları, görseller, videolar; `store/web/` web sürümü paketi ve site metinleri)
- `.claude/` Claude otomasyonu (ajanlar, kurallar, açılış talimatı)

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
| Otomasyon | 16 alt ajan (haftalık bileşen/güvenlik kontrolü, yorum cevaplama, Instagram/TikTok/LinkedIn paylaşımı, hesap ısıtma, Play Console / AdMob / Firebase yöneticileri), oturum açılışında otomatik kurulum |

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
- [x] `cloudSave.js` `nameKey` hatası düzeltildi (23 Eki); eski anahtarla alınmış isimler de kontrol ediliyor. Uygulamaya 1.0.14 ile girer
- [ ] AdMob'a kullanıcının telefonunu test cihazı olarak eklemek
- [ ] Güvenlik yaması 23 Eki'de `npm update` ile yapıldı (@capacitor/android 8.5.3 kritik düzeltme, vite 8.3.5). Android'e ulaşması için **yeni AAB (1.0.14) derlenip yüklenmeli**
- [ ] Kalan `npm audit` uyarıları (yalnız geliştirme araçları, uygulamaya girmiyor): `@capacitor/assets` içindeki eski tar/sharp/uuid, firebase'in Node tarafındaki `@grpc/grpc-js` — üst paketler güncellenince tekrar kontrol

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

---

# Hafıza yedeği (Claude'un kalıcı ve oturum hafızası)

> Amaç: Claude'un hafızası silinse veya yeni bir bilgisayara geçilse bile çalışma düzeninin buradan geri kurulabilmesi.
> Kalıcı hafızanın asıl yeri: `~/.claude/projects/D--Desktop-orbit-jump/memory/`. Proje kuralları: `.claude/rules/`, ajanlar: `.claude/agents/`, açılış talimatı: `.claude/hooks/session-start.js`.
> Kişisel bilgi (adres, telefon, banka) ve şifreler bilerek buraya yazılmaz.

## Kullanıcının çalışma tercihleri (kalıcı kurallar)

- **Sorma, yap:** Makul ve düşük riskli adımlarda onay isteme ("kanka bana sorma direkt yes onayla"). Soru yalnızca gerçekten belirsiz veya geri dönüşü zor işler için (force-push, veri silme, geri alınamaz dış işlem).
- **"Sormana gerek yok yap" kapsamı:** Play yorum cevapları, sürüm/yayın işleri, deploy (Firebase hosting deploy'u 23 Ekim'de açıkça devredildi).
- **Git:** Büyük değişiklikte sormadan commit + push; küçükler birikince (3+) veya gün sonunda. Dosyalar adıyla eklenir, büyük medya commit'lenmez, force-push yok (`.claude/rules/git.md`).
- **Model ve kota:** Kota kısıtlı. Basit işler basit modelle (Haiku), riskli/herkese açık işler Sonnet, Opus yalnızca zor işler (`.claude/rules/model-secimi.md`).
- **Alt ajanlar:** Ajanlar işi kendi yapar, ana oturuma sadece kısa sonuç gelir.
- **LinkedIn cevapları:** Sadece kısa teşekkür ("çok teşekkürler 🙏"); oyunu tanıtma, "dene" deme.
- **Sosyal medya:** Her gönderide oyun linki veya Play yönlendirmesi olsun. Instagram'da en fazla 5 hashtag. Sahte etkileşim/bot yok; kimseden 5 yıldız isteme. Toplu beğeni/takip döngüsü yok, her şey elle tek tek.
- **Bilgisayar 7/24 açık.** Günlük Instagram paylaşımı 17:00 civarı.
- **Dil:** Kullanıcı Türkçe konuşur, kısa ve samimi yazar; cevaplar Türkçe ve kısa.

## Güvenlik sınırları (Claude için)

- Şifre, imza anahtarı şifresi, banka/kimlik/vergi bilgisi girilmez. AdMob kimlik doğrulama ve banka bilgisini kullanıcı yapar; web panellerine girişleri kullanıcı yapar.
- Hesap açılmaz (itch.io, CrazyGames hesaplarını kullanıcı açar).
- Play Console'daki DSA satıcı (trader) durumu ve uygulama içeriği beyanları yasal beyandır, kullanıcı karar verir.
- Kendi reklamlarımıza asla tıklanmaz (geçersiz trafik → hesap kapanır). Test için AdMob test cihazı kullanılır.
- Telefonda kullanıcı aynı anda telefonu kullanıyorsa dur; bildirim cevap kutularına asla yazma.
- Claude'un kendi izinlerini veya ajan talimatlarını kendi başına genişletmesi engelli; bunları kullanıcı değiştirir.

## Hesaplar ve kimlikler

- Play Console: geliştirici `5748573854341754084`, uygulama `4975601792728453818`, paket `com.orbitjump.game`.
- Firebase projesi: `orbit-jump-73b68` (Spark plan). Site: https://orbit-jump-73b68.web.app
- Instagram / TikTok: `@orbit.jump`. Instagram bio linki: https://orbit-jump-73b68.web.app/play (Android'de Play Store'u açar; doğrudan Play linki Instagram içinde çalışmıyordu).
- LinkedIn lansman gönderisi: activity `7518224383694417920`.
- GitHub: `hsynsrt1905-beep/orbit-jump` (main).
- Destek e-postası (gizlilik politikasında herkese açık): hsynsrt1905@gmail.com.

## Teknik notlar

- **Web sürümü:** paket `store/web/orbit-jump-web.zip`, mağaza metinleri `store/web/listing.md`. Ofis ağı (Sophos) itch.io / CrazyGames / Poki'yi engelliyor → başka ağdan yüklenmeli.
- **Site güvenlik başlıkları** (`firebase.json`, 23 Eki): tüm sayfalarda nosniff, Referrer-Policy, Permissions-Policy, HSTS; ana sayfa, /play, /privacy, /delete-account'ta X-Frame-Options DENY. `/game` bilerek hariç (oyun sitelerinde iframe içinde açılabilsin).
- **Deploy sonrası:** /play, /privacy, /delete-account, /game sayfaları curl ile 200 kontrol edilir. Firestore kuralları ayrıca onayla deploy edilir.
- **Ekran görüntüsü için oyun:** `vite preview` ve localStorage `orbit_highscore` yüksek ayarlanır ki test oyunları canlı skor tablosuna yazmasın.
- **İsim anahtarı:** `nameKey` 1.0.13'e kadar `/s+/g` kullanıyordu ("s" harflerini boşluğa çeviriyordu). Düzeltildi; `claimPlayerName` eski anahtardaki ayırmaya da bakar (belgedeki asıl isimle karşılaştırarak). İsim değişince `releaseNames` eski belgeyi siler.
- **Durum çubuğu:** `~/.claude/statusline.js` (model, efor, bağlam, 5 saatlik ve haftalık limit, branch, telefon, kuyruk, sonraki paylaşım).

## Telefon (adb) ve video üretimi

- Telefon: Galaxy S24+, adb `%LOCALAPPDATA%/Android/Sdk/platform-tools/adb.exe`. Git Bash'te `MSYS_NO_PATHCONV=1` şart.
- Ekran görüntüsü 1440x3120; Claude'a 923x2000 gösterilir → koordinat × 1.56 ile `adb shell input tap`.
- `adb shell input text` Türkçe karakter ve emoji yazamaz (boşluk için `%s`); satır için `keyevent 66`.
- Oyun kaydı: kullanıcı oynarken `adb shell screenrecord --time-limit 180 /sdcard/x.mp4`. Kayıt değişken kare hızlı → kesim noktaları 0,2 sn'lik önizleme şeritleriyle bulunur. Bildirim afişleri kayda girebilir, o anlar kesilir.
- ffmpeg (ffmpeg-static): Reels 1080x1920 (scale 1080:2340 + crop y=210); yazı için font dosyası çalışma klasörüne kopyalanır (`fontfile=font.ttf`), Windows yolu çalışmadı.
- Paylaşım: dosya `/sdcard/DCIM/OrbitJump/`'a push → `MEDIA_SCANNER_SCAN_FILE` → `content query` ile id → `am start -a android.intent.action.SEND -t video/mp4 --eu android.intent.extra.STREAM content://media/external/video/media/<id>`; Instagram Reels için `-n com.instagram.android/com.instagram.share.handleractivity.ReelShareHandlerActivity`, hikâye için `...StoryShareHandlerActivity`, TikTok için `-p com.zhiliaoapp.musically`. Müzik uygulama içinden eklenir.
- Hikâye bağlantı çıkartması: Çıkartmalar → BAĞLANTI → `https://orbit-jump-73b68.web.app/play`, metin "Play free on Google Play".
- Telefon bağlı değilken Instagram'a webden, Claude'un ürettiği telifsiz müzikle (`store/social/video/music/*_m.mp4`) paylaşılır — kullanıcı onayladı.
- **TikTok'a webden yükleme yapılmaz** (0 izlenme); sadece telefondan. TikTok web'de beğeni de güvenilmez.

## Sosyal medya geçmişi ve öğrenilenler

- Instagram: lansman karuseli (20 Eki), Reels R1 "19", R2 "27" (2.100+ izlenme, en iyisi), Süpernova karuseli, R3 özelleştirme, R4 Zen, R6 "Looks easy… then 0" (23 Eki, telefondan, trend müzik) + linkli hikâye. Kuyruk: `store/social/queue.md` (kalan: R5 Hızlı mod, Temalar, Geliştirici hikâyesi, Rekor meydan okuması).
- TikTok: T1 "27", T2 Zen (webden, 0 izlenme), T3 Hızlı mod (telefondan, 187 izlenme), R6 (23 Eki). Kuyruk: `store/social/tiktok_queue.md`.
- LinkedIn: 2. gönderi metni `store/social/linkedin_2.md` (24 Ekim planlı). Planlı gönderileri `linkedin-paylasim` ajanı atar; yeni gönderi `linkedin_N.md` olarak `(planlanan: YYYY-MM-DD)` başlığıyla eklenir.
- Reddit Chrome uzantısına kapalı → kullanıcı kendisi paylaşır.
- Isıtmada etkileşilen hesaplardan bazıları: ach.owl, summitswrong, bigredeight (TikTok), indiegamesdaily (IG). Hassas içerikler (savaş teması, AI tartışması) atlanır.

## Mağaza ve gelir notları

- Play "Uygulama desteği" bölümünden telefon numarası kaldırıldı (23 Eki). Görünen adres DSA satıcı bilgisinden geliyor ve tüm AB'de görünüyor; kullanıcı değiştirecek. Tek ülkeden (ör. Almanya) çıkmak adresi gizlemez; Almanya ayrıca yüksek eBGBM'li bir ülke.
- AdMob: "Orbit Jump GDPR" onay mesajı yayında (20 Eki). Ödüllü reklam en çok kazandıran format; ülke farkı gelirde en büyük etken.
- Firebase ücretsiz kotası: Firestore günlük 50k okuma / 20k yazma; skor tablosu açılışı 10 okuma → günde ~5.000 açılışa kadar sorun yok.

## Otomasyon düzeni (zamanlanmış işler)

| Saat | Ajan | Model |
|---|---|---|
| 3 saatte bir | instagram-yorum, tiktok-yorum | haiku |
| 4 saatte bir | play-yorum | sonnet |
| 2 saatte bir | linkedin-yorum | haiku |
| 10:41, 14:41, 18:41, 22:41 | hesap-isitma | sonnet |
| 17:03 | ig-gunluk-paylasim | sonnet |
| 11:13 | linkedin-paylasim (planlı gönderi varsa) | sonnet |
| Pazartesi 09:07 | bilesen-kontrol (npm audit, güncellik, uyum) | sonnet |
| 10:07 | gunluk-rapor (Instagram/TikTok/kuyruk) | haiku |
| 10:17 / 10:27 / 10:37 | play-console / admob-yonetici / firebase-yonetici günlük tur | sonnet |
| 20:03 | akşam hatırlatması | — |

Zamanlayıcılar oturuma bağlıdır ve 7 günde silinir; oturum açılışında `.claude/hooks/session-start.js` hepsini yeniden kurar. Aynı anda tek oturum açılmalı (çift paylaşım olmasın). Chrome uzantısı kopuksa web ajanları çalışmaz.

Model ölçümü (23 Eki): `haiku`→claude-haiku-5-5, `sonnet`→claude-sonnet-5-5, `opus`→claude-opus-5-5, `fable`→claude-opus-5-5 (bu hesapta Fable açık değil).

## Açık işler (kullanıcıda)

- Play'deki geliştirici adresini değiştirmek; değişince mağaza sayfası kontrol edilecek.
- AdMob kimlik doğrulama ve banka bilgisi.
- itch.io / CrazyGames yüklemesi (başka ağdan).
- Almanya'dan çıkarma sorusu: sebep netleşince karar.
