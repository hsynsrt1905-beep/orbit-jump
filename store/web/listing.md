# Orbit Jump – web sürümü yayın bilgileri

Paket: `store/web/orbit-jump-web.zip` (index.html kökte, HTML5, ~0.3 MB)
Yeniden üretmek için: `npm run build:web` → `dist-web/` (ayrıca `hosting/game/` güncellenir)
Kendi sitemizde: https://orbit-jump-73b68.web.app/game/

Web sürümünde reklam ve Google girişi yok; menüde ve oyun sonunda "Google Play'den indir"
butonu var (Play bağlantısına `utm_source=<site adı>` eklenir, Play Console → Edinme
raporlarında hangi siteden geldiği görülür).

## itch.io (https://itch.io/game/new)

- Title: Orbit Jump
- Project URL: orbit-jump
- Short description: Tap at the right moment and hop from planet to planet. One-tap space arcade.
- Classification: Games · Kind of project: HTML
- Upload: orbit-jump-web.zip → "This file will be played in the browser" işaretle
- Embed options: Viewport 405 x 720, "Mobile friendly" açık, "Fullscreen button" açık,
  Orientation: portrait
- Genre: Action · Tags: arcade, one-button, space, casual, hyper-casual, mobile, high-score, relaxing
- Pricing: No payments
- Description:

```
Orbit Jump is a one-tap space arcade game.

Your ball orbits a planet. Tap at the right moment to launch it to the next planet. Land near the edge for a PERFECT and chain combos. Every planet has a timer, so don't wait too long or it goes supernova.

• Daily Challenge: the same map for everyone, every day
• Weekly and all-time leaderboards
• 4 modes: Normal, Supernova (5 seconds, double points), Zen (no timer), Fast
• Daily missions, badges, unlockable balls, trails and space themes

Made by a solo developer from Turkey.

📲 Also on Android (cloud save + daily streak rewards):
https://play.google.com/store/apps/details?id=com.orbitjump.game
```

## CrazyGames (https://developer.crazygames.com)

- HTML5 oyunu olarak "Submit game" → zip yükle.
- Not: CrazyGames başka reklam ağına izin vermez (web sürümünde reklam zaten yok).
  İlk incelemede genelde SDK zorunlu tutulmaz; gelir için sonradan CrazyGames SDK
  (gameplayStart/gameplayStop, ödüllü reklam) eklenebilir.
- Kategori: Casual / Arcade · Tags: one-button, space, clicker, high score
- Açıklama: itch.io metniyle aynı.

## Poki / GameDistribution

- Poki: https://developers.poki.com → "Submit your game" formu (seçici, önce itch.io /
  CrazyGames verisiyle başvurmak daha iyi).
- GameDistribution: https://gamedistribution.com/developers → HTML5 zip, SDK sonra.
