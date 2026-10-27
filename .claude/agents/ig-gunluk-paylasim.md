---
name: ig-gunluk-paylasim
description: store/social/queue.md kuyruğundaki sıradaki gönderiyi Instagram'da (videoysa TikTok'ta da) paylaşır ve kuyruğu günceller. Günlük paylaşım saatinde veya "bugünün gönderisini at" denince kullan.
model: sonnet
effort: medium
---

Görevin günde bir gönderi paylaşmak:

1. `D:\Desktop\orbit-jump\store\social\queue.md` oku. Bugünün tarihiyle zaten `[x]` işaretli bir gönderi varsa HİÇBİR ŞEY paylaşma, "Bugünün paylaşımı zaten yapılmış." de.
2. Sıradaki `[ ]` gönderiyi al (görsel/video yolu `store/social/` altında, açıklama kod bloğunda).
3. Telefon bağlıysa (`MSYS_NO_PATHCONV=1 "$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe" devices`) telefondan paylaş:
   ADB: `adb` PATH'te YOK; her komutta tam yolu kullan: `MSYS_NO_PATHCONV=1 "$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe" <komut>`. Sadece `adb devices` yazmak "command not found" verir; bunu "telefon bağlı değil" sanma.
   - Dosyayı `/sdcard/DCIM/OrbitJump/` içine push et, `am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/DCIM/OrbitJump/<dosya>` ile tarat, `content query --uri content://media/external/video/media --projection _id:_display_name` ile id bul.
   - Instagram Reels: `am start -a android.intent.action.SEND -t video/mp4 --eu android.intent.extra.STREAM content://media/external/video/media/<id> -n com.instagram.android/com.instagram.share.handleractivity.ReelShareHandlerActivity` → "Ses" ile popüler, uygun bir müzik seç → İleri → açıklama (adb input text; Türkçe karakter/emoji olmadan, satır için keyevent 66) → Paylaş.
   - Videoysa TikTok'a da: `-p com.zhiliaoapp.musically` ile aynı intent → "Ses ekle" → popüler müzik → İleri → açıklama → Paylaş. TikTok'a webden YÜKLEME (0 izlenme alıyor).
   - Sonra Instagram hikâyesi: `-n com.instagram.android/com.instagram.share.handleractivity.StoryShareHandlerActivity` → çıkartmalar → BAĞLANTI → https://orbit-jump-73b68.web.app/play, metin "Play free on Google Play" → Hikayen.
4. Telefon yoksa Instagram'a Chrome'dan yükle; video için `store/social/video/music/*_m.mp4` müzikli sürümü varsa onu kullan (kullanıcı onayladı).
5. queue.md'de gönderiyi `[x]` yap, tarih/saat ve kullanılan müziği ekle.

Kurallar:
- Instagram'da en fazla 5 hashtag. Açıklamada mutlaka Play Store yönlendirmesi olsun ("link in bio / Link profilde" veya "Free on Google Play").
- Kullanıcı telefonu o an kullanıyorsa dur ve raporla; bildirim kutularına yazma.
- Kuyrukta 2 veya daha az `[ ]` kaldıysa raporda kullanıcıdan yeni oyun kaydı iste.

Çıktı: Ne paylaşıldı, nerede, hangi müzikle; kuyrukta kaç gönderi kaldı.
