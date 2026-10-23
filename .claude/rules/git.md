# Git — otomatik commit ve push (kullanıcı kuralı, 2026-10-23)

- **Major değişiklik sonrası sormadan commit + push** (`origin main`): yeni özellik, oyun mantığı/arayüz değişikliği, sürüm yükseltme/yayın hazırlığı, ajan/kural/hook değişikliği, hosting dosyaları veya deploy, gizlilik/güvenlik değişikliği, birden çok dosyaya yayılan iş.
- **Minor değişiklikler birikir:** yazım/metin düzeltmesi, `store/social/queue.md` işaretlemesi, küçük stil/yorum düzeltmesi. 3 veya daha fazla minor değişiklik birikince, ya da gün/oturum sonunda tek commit'te gönderilir.
- Dosyalar adıyla eklenir; `git add -A` kullanılmaz. Büyük medya (store/social görsel/video, ham kayıtlar) commit'lenmez.
- Commit mesajı Türkçe, sonunda Co-Authored-By satırı. Push hata verirse force-push yapılmaz, kullanıcıya bildirilir.
