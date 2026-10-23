# Model seçimi — işin türüne ve zorluğuna göre dört kademe

| Model | Hangi işler |
|---|---|
| **Fable** (`fable`) | Planlama: plan modu, plan üreten ajanlar, mimari plan |
| **Opus** (`opus`) | Zor ve riskli işler: mimari, güvenlik (kimlik, yetki, kişisel veri, kurumlar arası veri ayrımı), birden çok dosyayı değiştiren işler |
| **Sonnet** (`sonnet`) | Rutin ve orta işler: tek modülde kodlama, hata ayıklama, test yazma, kod inceleme |
| **Haiku** (`haiku`) | Kısa ve mekanik işler: özet, salt-okuma veritabanı sorgusu, sınıflandırma, canlı destekte ilk bakış, tarayıcıda bakma ve ekran görüntüsü, tekrar eden işler |

Ek kurallar:
- İki kademeye uyan işte üst kademe seçilir. Kısa ama riskli bir iş Opus'a, kod yazan kısa bir iş Sonnet'e gider. Gerekçe: düşük seçmek hataya mal olur, yüksek seçmek yalnızca kotaya.
- Haiku'nun üç ajanı var (Agent aracında efor parametresi yoktur, efor ajan tanımının `effort:` alanından gelir):
  - `haiku-hafif` (`effort: low`): özet ve bakma işleri.
  - `haiku-orta` (`effort: medium`): sorgu kurup yorumlama, destek triyajı.
  - `haiku-derin` (`effort: high`): birçok kaynağı birleştiren işler.
  - Sonuç yüzeysel kalırsa iş bir üst ajana verilir. Üçü de salt-okumadır, kod değiştirmez.
- Fork model seçimini dinlemez, her zaman ana oturumun modeliyle çalışır. Bu yüzden ancak ana model o işin kademesindeyse kullanılır; değilse iş adı belli bir ajana (`general-purpose`, `Explore`, `Plan` …) model belirtilerek verilir.
- Planlama Fable'da koşar. Fable'lı bir plan modu kısayolu yoktur (yalnız `opusplan` var). Plan işi `Plan` ajanına ya da plan ajanına `model: "fable"` ile verilir; Agent çağrısındaki model, ajan tanımındakini ezer. Plan ajanları ve plan skill'i `model: fable` taşır (skill'in modeli yalnız o tur için geçerlidir, sonraki istemde oturum modeline dönülür). Ana oturumda plan modu kullanılacaksa önce `/model fable`, plan onaylanınca asıl modele dönülür.
- Model adları kısa adla yazılır (`haiku`, `sonnet`, `opus`, `fable`). Kısa ad ailesinin son sürümüne çözülür. Yeni bir model sürümü çıkınca ölçüm tekrarlanır: alt ajan transkriptlerinde (`~/.claude/projects/*/*/subagents/*.jsonl`) yanıtların `message.model` alanına bakılır. Kısa ad geride kalırsa yalnız o aile için tam ad yazılır ve sebebi buraya eklenir.
- Ölçüm kaydı: 2026-10-23 — haiku → claude-haiku-5-5 · sonnet → claude-sonnet-5-5 · opus → claude-opus-5-5 · fable → claude-opus-5-5 (Fable değil!)
  - `fable` kısa adı bu hesapta Opus 5.5'e düşüyor; Fable 5.1 hesapta açık değil gibi görünüyor. Agent aracı yalnız kısa ad kabul ettiği için çağrıda tam ad verilemiyor. Plan ajanı eklenirse frontmatter'a `model: claude-fable-5-1` yazılıp yeniden ölçülmeli; o da Opus'a düşerse planlama fiilen Opus'ta koşar (kota açısından pahalı, plan işlerini az tut).
  - `haiku-hafif` (frontmatter `model: haiku`) → claude-haiku-5-5 ✓ (oturum yeniden açıldıktan sonra ölçüldü; ajan dosyaları oturum açılırken yüklenir, aynı oturumda oluşturulan ajan çağrılamaz).

## Bu projenin otomasyon ajanları (kota kısıtlı — en ucuz yeterli kademe)

| Ajan | Model / efor | Gerekçe |
|---|---|---|
| `linkedin-yorum` | haiku / low | Çoğu kontrol "yeni yorum yok"; cevap tek satır teşekkür |
| `instagram-yorum` | haiku / medium | Bakma + kısa cevap; sık çalışır |
| `tiktok-yorum` | haiku / medium | Bakma + kısa cevap; sık çalışır |
| `gunluk-rapor` | haiku / medium | Salt-okuma; yalnız Instagram, TikTok ve kuyruk |
| `admob-yonetici` | sonnet / low | Günde 1; çoğu salt-okuma, anormallik yorumu ve ödeme adımı takibi |
| `firebase-yonetici` | sonnet / low | Günde 1; çökme triyajı ve kota yorumu, kodu yalnız okur |
| `play-yorum` | sonnet / low | Play'de herkese açık, geri alınması zahmetli cevap yayınlar |
| `hesap-isitma` | sonnet / low | Telefon ekranını yorumlayıp elle dokunma; yanlış dokunuş riski |
| `ig-gunluk-paylasim` | sonnet / medium | Çok adımlı, geri alınamaz herkese açık paylaşım |
| `bilesen-kontrol` | sonnet / low | Haftada 1, salt-okuma; açığın uygulamaya girip girmediğini yorumlamak Haiku'ya ağır |
| `linkedin-paylasim` | sonnet / medium | Planlı LinkedIn gönderisi; geri alınamaz herkese açık paylaşım, günde en fazla bir |
| `play-console` | sonnet / medium | İstek üzerine çalışır; mağaza/yayın değişiklikleri hemen yayına çıkar. Yasal beyanlar ve yayından kaldırma kullanıcı onayı olmadan yapılmaz |

Haiku ajanı işi beceremezse (sayfa okunamadı, yanlış yere tıkladı) aynı iş bir sonraki çalıştırmada `model: "sonnet"` ile tekrarlanır.
