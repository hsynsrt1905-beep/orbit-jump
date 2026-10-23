# LinkedIn 2. gönderi — "Ucuz telefonda kasma" (planlanan: 2026-10-26)

Görsel: oyun-2.png (veya menu.png)

```
Orbit Jump'ı Google Play'e koyalı birkaç gün oldu. İlk geri bildirimler güzel ama beni en çok düşündüren şey bir yorum değil, bir telefon oldu 🙂

Kendi telefonumda oyun yağ gibi akıyordu. Sonra birkaç yıllık, giriş seviyesi bir Android'de denedim: gezegenlerin parıltısı, arka plandaki yıldızlar, topun ardındaki iz… hepsi bir araya gelince oyun takılmaya başladı. Tek dokunuşla oynanan bir oyunda bu, oyunun bozuk olması demek.

Çözüm olarak oyuna kendi kendini ölçen bir "hafif mod" ekledim:
• Oyunun ilk ~4 saniyesinde her karenin ne kadar sürdüğüne bakıyor.
• Karelerin %30'undan fazlası 22 ms'yi geçiyorsa (yani 45 fps'in altı) sessizce hafif moda geçiyor.
• Hafif modda animasyonlu dokular, gölgeler ve ışımalar kapanıyor, iz parçacıkları yarıya iniyor. Oynanış birebir aynı kalıyor.
• Kullanıcı grafik ayarını elle değiştirdiyse sistem ona hiç dokunmuyor.

Öğrendiğim şey şu: "Benim telefonumda çalışıyor" bir test sonucu değil. Kullanıcıların çoğu bizim test ettiğimiz cihazlarla oynamıyor.

Siz projelerinizde düşük donanımlı cihazlar için ne yapıyorsunuz? Ayrı bir mod mu, yoksa baştan hafif tasarım mı?

https://play.google.com/store/apps/details?id=com.orbitjump.game

#gamedev #indiedev #android #performance #mobiloyun
```
