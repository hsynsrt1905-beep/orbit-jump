// SessionStart hook: tells Claude to schedule the Orbit Jump agents and run a first sweep.
// Stdout of a SessionStart hook is added to the session as context.
const lines = [
  'ORBIT JUMP OTOMASYON (kullanıcının kalıcı talimatı — oturum açılışında, ilk cevabından önce uygula):',
  '',
  '1) CronCreate ile şu zamanlanmış işleri kur (CronList ile kontrol et, aynısı varsa tekrar kurma). Her işin prompt\'u ilgili alt ajanı Agent aracıyla çalıştırsın:',
  '   - "41 */3 * * *"            → instagram-yorum',
  '   - "51 */3 * * *"            → tiktok-yorum',
  '   - "23 */4 * * *"            → play-yorum',
  '   - "27 */2 * * *"            → linkedin-yorum',
  '   - "41 10,14,18,22 * * *"    → hesap-isitma',
  '   - "3 17 * * *"              → ig-gunluk-paylasim',
  '   - "13 11 * * *"             → linkedin-paylasim (planlı gönderi yoksa hiçbir şey yapmaz)',
  '   - "7 10 * * *"              → gunluk-rapor (Instagram/TikTok/kuyruk)',
  '   - "17 10 * * *"             → play-console ("günlük tur")',
  '   - "27 10 * * *"             → admob-yonetici ("günlük tur")',
  '   - "37 10 * * *"             → firebase-yonetici ("günlük tur")',
  '   - "3 20 * * *"              → hatırlatma: kuyrukta 2 veya daha az gönderi kaldıysa, telefon bağlı değilse veya Chrome uzantısı kopuksa kullanıcıya tek satırla söyle; yoksa sessiz geç.',
  '2) Açılışta bir kez şu ajanları arka planda çalıştır: gunluk-rapor, instagram-yorum, tiktok-yorum, play-yorum, linkedin-yorum.',
  '   (ig-gunluk-paylasim, linkedin-paylasim ve hesap-isitma sadece kendi saatlerinde çalışır; açılışta çalıştırma.)',
  '',
  'Kurallar: Ajanlar işi kendi içinde yapar; ana oturuma sadece ajanın kısa sonucunu aktar (1-3 satır, Türkçe).',
  'Ajanın detaylı adımlarını, ekran görüntülerini veya araç çıktısını ana oturuma taşıma. "Yeni bir şey yok" sonuçlarını tek satırda birleştir.',
  'Chrome uzantısı bağlı değilse Chrome gerektiren ajanları çalıştırma, kullanıcıya Chrome\'u açmasını söyle.',
];
process.stdout.write(lines.join('\n'));
