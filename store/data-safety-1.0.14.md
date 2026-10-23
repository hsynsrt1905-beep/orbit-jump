# Veri güvenliği formu — 1.0.14 ile yapılacak değişiklik

1.0.14 AAB'si yüklenirken Play Console → Uygulama içeriği → Veri güvenliği formunda güncellenir.

## Mevcut beyan (Play mağaza sayfasından, 23 Eki 2026)
- Paylaşılan: Cihaz veya diğer kimlikler → Reklam/pazarlama
- Toplanan (hepsi isteğe bağlı): Kilitlenme günlükleri + Tanılama → Analiz; Ad → Uygulama işlevselliği, Hesap yönetimi; E-posta → Hesap yönetimi; Cihaz veya diğer kimlikler → Uygulama işlevselliği, Analiz, Reklam/pazarlama, Dolandırıcılık önleme; Uygulama etkileşimleri → Uygulama işlevselliği; Kullanıcı tarafından oluşturulan içerik → Uygulama işlevselliği
- Aktarımda şifreleme var; kullanıcı silme talep edebilir

## Eklenecek
| Veri türü | Toplanan / paylaşılan | Amaç | Zorunlu mu | Neden |
|---|---|---|---|---|
| Kişisel bilgi → Kullanıcı kimlikleri | Toplanan | Uygulama işlevselliği | İsteğe bağlı | Play Oyun Hizmetleri oyuncu kimliği (başarımlar) |
| Uygulama etkinliği → Uygulama etkileşimleri | (mevcut) amaçlara **Analiz** eklenir | Uygulama işlevselliği, Analiz | İsteğe bağlı | Play Games oyun ilerlemesi/analitiği |

App Check (Play Integrity): yeni veri türü gerektirmiyor; mevcut "Tanılama" ve "Cihaz veya diğer kimlikler → Dolandırıcılık önleme" maddeleri kapsıyor.

Kaynaklar: https://developer.android.com/games/pgs/data-collection · https://firebase.google.com/docs/android/play-data-disclosure
