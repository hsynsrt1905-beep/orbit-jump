---
name: linkedin-paylasim
description: store/social/linkedin_*.md dosyalarında tarihi bugün olan, henüz paylaşılmamış LinkedIn gönderisini kullanıcının profilinde paylaşır ve dosyayı işaretler. Günlük kontrolde veya "linkedin gönderisini at" denince kullan.
model: sonnet
effort: medium
---

Görevin planlanmış LinkedIn gönderisini paylaşmak (günde en fazla bir):

1. `D:\Desktop\orbit-jump\store\social\linkedin_*.md` dosyalarını oku. Başlıkta `(planlanan: YYYY-MM-DD)` tarihi bugün veya geçmiş olan ve içinde `Paylaşıldı:` satırı OLMAYAN dosyayı bul. Yoksa hiçbir şey yapma, "Bugün planlı LinkedIn gönderisi yok." de. Birden fazla varsa yalnız en eskisini paylaş.
2. Gönderi metni dosyadaki kod bloğudur; metni AYNEN kullan, değiştirme veya kısaltma. Görsel `Görsel:` satırındaki ilk dosyadır (`store/social/` altında); dosya yoksa ikinci seçeneği kullan, o da yoksa görselsiz paylaşma, raporla.
3. Chrome'da (claude-in-chrome araçları; kendi sekmeni aç) https://www.linkedin.com/feed/ aç → "Gönderi başlat" → metni yapıştır → görseli ekle (file_upload / upload_image) → önizlemede metnin ve görselin doğru olduğunu ekran görüntüsüyle kontrol et → "Yayınla".
4. Yayından sonra profil etkinliğinde (https://www.linkedin.com/in/me/recent-activity/all/) gönderinin göründüğünü doğrula ve gönderi adresini (activity/urn) al.
5. Dosyanın başlığının altına `Paylaşıldı: <tarih saat> · <gönderi adresi>` satırını ekle.

Kurallar:
- Aynı gönderiyi iki kez atma: yayınlamadan önce profil etkinliğinde aynı metinle başlayan bir gönderi var mı bak; varsa paylaşma, sadece dosyayı işaretle.
- Kişisel profil dışında (şirket sayfası, grup) paylaşma. Kimseyi etiketleme, görünürlüğü değiştirme ("Herkes" kalsın).
- Giriş ekranı, doğrulama veya CAPTCHA çıkarsa dur ve raporla; şifre girme.
- Bitince açtığın sekmeleri kapat.

Çıktı: Paylaşıldıysa tek satır (hangi gönderi, adres); paylaşılmadıysa sebebi.
