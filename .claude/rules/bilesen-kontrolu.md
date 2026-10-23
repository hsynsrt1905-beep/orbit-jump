# Bileşen kontrolü — Context7 + npm audit (kullanıcı kuralı, 2026-10-23)

Kaynak: Context7 MCP sunucusu (https://github.com/upstash/context7), projede `.mcp.json` ile tanımlı (`https://mcp.context7.com/mcp`).

## Ne zaman

Her bileşen (npm paketi, Capacitor eklentisi, Firebase/AdMob SDK'sı, Gradle bağımlılığı) **eklenirken, güncellenirken veya kodda yeni bir API'si kullanılırken**.

## Nasıl

1. **Güncellik:** `npm view <paket> version` ile son sürüm; Context7'den (`resolve-library-id` → `get-library-docs`) o sürümün güncel dokümanı ve kullanım şekli. Kodda kullanılan API'nin kaldırılmış/eskimiş (deprecated) olup olmadığına bak.
2. **Uyum:** Birbirine bağlı bileşenlerin sürüm eşleşmesi kontrol edilir. Bu projede özellikle:
   - Capacitor çekirdeği (`@capacitor/core`, `cli`, `android`) ile tüm `@capacitor/*`, `@capacitor-community/*`, `@capacitor-firebase/*` eklentileri aynı ana sürümde olmalı (şu an 8).
   - `firebase` web SDK'sı ile `@capacitor-firebase/*` eklentilerinin desteklediği Firebase sürümü.
   - `react` / `react-dom` aynı sürüm; `@vitejs/plugin-react` ↔ `vite`; `tailwindcss` ↔ `@tailwindcss/vite`; `eslint` ↔ eslint eklentileri.
   - Android: Gradle / AGP / JDK (jbr-21) ve `compileSdk`/`targetSdk` (şu an 36, minSdk 24) — Play'in hedef SDK şartı.
   - Uyumsuzlukta `npm install` çıktısındaki peer dependency uyarıları da okunur.
3. **Güvenlik:** `npm audit --omit=dev` (canlıya giden paketler) ve `npm audit` (tümü). Ayrıca Context7 / paket sürüm notlarında güvenlik düzeltmesi var mı.

## Sonuç

- **Güvenlik açığı varsa kullanıcıyı mutlaka uyar:** "⚠️ Güvenlik açığı — yama yapmalıyız" başlığıyla paket, önem derecesi (critical/high/moderate/low), etkilenen sürüm, düzelten sürüm ve canlı uygulamayı etkileyip etkilemediği (dependency mi devDependency mi).
- Yama önerisi: `npm audit fix` ile çözülüyorsa onu; ana sürüm atlaması gerekiyorsa (breaking) önce uyum kontrolü + derleme + test, sonra güncelleme. `npm audit fix --force` kullanıcı onayı olmadan çalıştırılmaz.
- Güncel olmayan ama güvenlik sorunu olmayan paketler kısa liste halinde bildirilir, acil sayılmaz.
- Yama sonrası: `npm run build`, `npm run lint`, gerekiyorsa `npx cap sync android`; büyük değişiklik sayılır → commit + push (`.claude/rules/git.md`).
