import { useState, useEffect, useRef, useCallback } from 'react';
import { AdMob, RewardAdPluginEvents, AdmobConsentStatus, MaxAdContentRating } from '@capacitor-community/admob';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// FIREBASE
import { db, auth } from './firebase';
import { collection, setDoc, doc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { maybeRequestReview, shareScore, noteGameFinished, maybeShowInterstitial, scheduleStreakReminder, scheduleComebackReminders, track } from './engagement';
import { utcDayId, utcWeekId, localDayId, seededRandom, submitPeriodScore, fetchPeriodScores, emptyDailyStats, dailyMissionsFor } from './periodic';
import { syncAchievements, showAchievements, playGamesAvailable } from './playGames';
import { checkForUpdate, completeUpdate } from './appUpdate';
import { ensureSignedIn, isGoogleUser, signInWithGoogle, signOutGoogle, deleteAccount, loadCloudSave, writeCloudSave, mergeProgress, claimPlayerName, releaseNames, nameKey } from './cloudSave';

const translations = {
  en: {
    title: "ORBIT JUMP", play: "PLAY", score: "SCORE", best: "BEST", gameOver: "GAME OVER",
    restart: "TRY AGAIN", menu: "MENU", shop: "SHOP", missions: "MISSIONS", leaderboard: "LEADERBOARD", badges: "BADGES", back: "BACK",
    crystals: "CRYSTALS", claim: "CLAIM", claimed: "CLAIMED", owned: "OWNED", select: "SELECT",
    selected: "SELECTED", perfect: "PERFECT", great: "GREAT", combo: "COMBO",
    dailyBonus: "DAILY BONUS", shield: "SHIELD", slowmo: "SLOW-MO", buy: "BUY", upgrade: "UPGRADE", level: "LVL", max: "MAX",
    buyPack: "BUY (+3)",
    watchAdReward: "WATCH AD (+50 💎)", watchAdContinue: "WATCH AD & CONTINUE", adPlaying: "📺 LOADING AD...",
    adWaitText: "Please wait for the ad to complete.",
    adLimitReached: "DAILY AD LIMIT REACHED (2/2)",
    insufficientCrystals: "NOT ENOUGH CRYSTALS",
    modeNormal: "NORMAL MODE", modeSupernova: "SUPERNOVA (5s / 2x)", modeZen: "ZEN MODE (No Timer)", modeFast: "FAST MODE (Extreme)",
    howToPlay: "GAMEPLAY & DETAILED FEATURES",
    helpRule1: "Core Jumping: Tap anywhere on the screen to jump from your current planet to the rotating target planet with precise timing.",
    helpRule2: "Perfect Landings: Landing very close to the edge grants +3 score and triggers a brief cinematic slow-mo effect.",
    helpRule3: "Game Modes: Normal Mode has a 10s timer, Supernova has 5s, Zen Mode has no timers, and Fast Mode delivers extreme speed.",
    helpRule4: "Boosts & Defense: Use Shield (🛡️) to survive a miss and Slow-Mo (⏳) to time your jumps with absolute precision.",
    helpBallFeature: "Ball Upgrades: Upgrade balls up to Level 5 to expand Perfect hit zones, reveal glowing cores, and earn crystal bonuses.",
    helpShopFeature: "Shop & Themes: Customize your experience with 4 unique themes, custom trails, and boost packs.",
    streakTitle: "DAILY STREAK BONUS", streakClaimed: "COLLECTED TODAY", streakBtn: "CLAIM STREAK",
    dayWord: "Day",
    tabBalls: "BALLS", tabBoosts: "BOOSTS", tabTrails: "TRAILS", tabThemes: "THEMES",
    badge1: "Supernova Survivor", badge1Desc: "Successfully jump to a new planet",
    badge2: "Cosmic Traveler", badge2Desc: "Reach 10 planets in a single run",
    badge3: "Perfectionist", badge3Desc: "Land 3 Perfect jumps total",
    badge4: "Cosmic Wealth", badge4Desc: "Collect 500 crystals total",
    tierEasy: "EASY", tierNormal: "NORMAL", tierHard: "HARD", tierInsane: "INSANE", tierImpossible: "IMPOSSIBLE",
    m1: "Reach 10 planets in one run", m2: "Land 5 Perfect Jumps (total)", m3: "Play 10 runs (total)",
    m4: "Reach 20 planets in one run", m5: "Land 20 Perfect Jumps (total)",
    m6: "Hit a 3x Combo streak", m7: "Collect a total of 100 crystals", m8: "Land 3 Perfect Jumps in a single run",
    m9: "Hit a 5x Combo streak", m10: "Play 25 runs (total)",
    itemGold: "Gold Ball", itemRuby: "Ruby Ball", itemEmerald: "Emerald Ball", itemNova: "Supernova Ball",
    trailGold: "Gold Dust", trailFire: "Fire Trail", trailCyan: "Plasma Trail",
    themeNebula: "Nebula", themeVoid: "Black Hole", themeSolar: "Solar Flare", themeGalactic: "Galactic Core",
    pause: "GAME PAUSED", resume: "RESUME",
    noScores: "No scores recorded yet.",
    loadingScores: "Loading scores...",
    welcome: "WELCOME!", namePrompt: "Enter a name to appear on the leaderboard:",
    namePlaceholder: "Your nickname", saveAndStart: "SAVE & START", nameTaken: "This name is taken, try another one.", nameChecking: "Checking...",
    offlineScores: "Offline — showing local scores.",
    signInGoogle: "Sign in with Google", signedInAs: "Cloud save on", signOut: "Sign out", syncing: "Syncing...", signInFailed: "Sign-in failed. Try again.",
    shareScore: "SHARE SCORE", shareText: "I scored {n} in Orbit Jump! Can you beat me? 🚀", streakReminderTitle: "🔥 Your streak is about to break!", streakReminderBody: "Claim your day {n} reward before midnight.",
    modeDaily: "📅 DAILY CHALLENGE", dailyHint: "Same map for everyone today", lbWeekly: "THIS WEEK", lbAllTime: "ALL TIME", lbDaily: "DAILY", weeklyResets: "Resets every Monday", dailyResets: "New map every day", dailyMissions: "DAILY MISSIONS", dailyMissionsHint: "New missions every day", dm_games: "Play {n} runs", dm_perfects: "Land {n} Perfect jumps", dm_bestScore: "Score {n} in one run", dm_crystals: "Earn {n} crystals", dm_maxCombo: "Hit a {n}x combo", dm_daily: "Play the Daily Challenge", comeback1Title: "🪐 The planets miss you!", comeback1Body: "Your record is {n}. Today could be the day you beat it.", comeback1BodyNew: "Hop back in and set your first record!", comeback2Title: "📅 A new Daily Challenge is waiting", comeback2Body: "Same map for everyone. Can you top today's board?",
    getOnPlay: "📲 GET IT ON GOOGLE PLAY", webHint: "Cloud save, daily streak rewards & more on mobile",
    deleteAccount: "Delete account", privacyOptions: "Privacy options", deleteConfirm: "Delete your account and cloud save permanently? Your leaderboard entry will also be removed. Progress on this device stays.", deleteFailed: "Could not delete account. Try again."
  },
  tr: {
    title: "YÖRÜNGE", play: "OYNA", score: "SKOR", best: "REKOR", gameOver: "OYUN BİTTİ",
    restart: "TEKRAR DENE", menu: "MENÜ", shop: "MAĞAZA", missions: "GÖREVLER", leaderboard: "SKOR TABLOSU", badges: "ROZETLER", back: "GERİ",
    crystals: "KRİSTAL", claim: "AL", claimed: "ALINDI", owned: "SAHİPSİN", select: "SEÇ",
    selected: "SEÇİLİ", perfect: "MÜKEMMEL", great: "İYİ", combo: "SERİ",
    dailyBonus: "GÜNLÜK SERİ", shield: "KALKAN", slowmo: "YAVAŞLATICI", buy: "SATIN AL", upgrade: "GELİŞTİR", level: "SEVİYE", max: "MAKS",
    buyPack: "SATIN AL (+3)",
    watchAdReward: "REKLAM İZLE (+50 💎)", watchAdContinue: "REKLAM İZLE & DEVAM ET", adPlaying: "📺 REKLAM YÜKLENİYOR...",
    adWaitText: "Lütfen reklamın tamamlanmasını bekleyin.",
    adLimitReached: "GÜNLÜK REKLAM HAKKI DOLDU (2/2)",
    insufficientCrystals: "YETERSİZ KRİSTAL",
    modeNormal: "NORMAL MOD", modeSupernova: "SÜPERNOVA (5sn / 2x)", modeZen: "ZEN MODU (Süre Yok)", modeFast: "HIZLI MOD (Ekstrem)",
    howToPlay: "OYNANIŞ & DETAYLI ÖZELLİKLER",
    helpRule1: "Temel Zıplama: Ekrana herhangi bir yere dokunarak mevcut gezegenden dönen hedef gezegene hassas bir zamanlamayla zıpla.",
    helpRule2: "Mükemmel Atlayış: Gezegenin kenarına çok yakın inişler +3 skor kazandırır ve kısa süreli yavaşlatıcı (slow-mo) tetikler.",
    helpRule3: "Oyun Modları: Normal modda 10sn, Süpernova'da 5sn süre sınırı vardır; Zen modunda süre sınırı yokken, Hızlı mod ekstrem bir tempo sunar.",
    helpRule4: "Güçlendiriciler: Kaçırmalara karşı Kalkan (🛡️) kullanabilir, atışları kolaylaştırmak için Yavaşlatıcı (⏳) açabilirsin.",
    helpBallFeature: "Top Geliştirmeleri: Topları 5. seviyeye kadar yükselterek Mükemmel piksellerini genişlet, çekirdeği parlat ve ekstra kristal kazan.",
    helpShopFeature: "Mağaza & Temalar: 4 benzersiz tema, özel izler (Trail) ve market paketleriyle deneyimini kişiselleştir.",
    streakTitle: "GÜNLÜK SERİ ÖDÜLÜ", streakClaimed: "BUGÜN ALINDI", streakBtn: "SERİYİ AL",
    dayWord: "Gün",
    tabBalls: "TOPLAR", tabBoosts: "GÜÇLER", tabTrails: "İZLER", tabThemes: "TEMALAR",
    badge1: "Süpernova Yolcusu", badge1Desc: "Herhangi bir gezegene başarıyla zıpla",
    badge2: "Kozmik Gezgin", badge2Desc: "Tek turda 10 gezegene ulaş",
    badge3: "Mükemmeliyetçi", badge3Desc: "Toplamda 3 Mükemmel atlayış yap",
    badge4: "Kozmik Zengin", badge4Desc: "Toplamda 500 kristal topla",
    tierEasy: "KOLAY", tierNormal: "NORMAL", tierHard: "ZOR", tierInsane: "ÇILGIN", tierImpossible: "İMKANSIZ",
    m1: "Bir turda 10 gezegene ulaş", m2: "Toplam 5 Mükemmel Atlayış yap", m3: "Toplam 10 tur oyna",
    m4: "Bir turda 20 gezegene ulaş", m5: "Toplam 20 Mükemmel Atlayış yap",
    m6: "3'lü Kombo seri yakala", m7: "Toplam 100 kristal topla", m8: "Tek turda 3 Mükemmel Atlayış yap",
    m9: "5'li Kombo seri yakala", m10: "Toplam 25 tur oyna",
    itemGold: "Altın Top", itemRuby: "Yakut Top", itemEmerald: "Zümrüt Top", itemNova: "Süpernova Top",
    trailGold: "Altın Tozu", trailFire: "Alev İzi", trailCyan: "Plazma İzi",
    themeNebula: "Nebula Bulutsusu", themeVoid: "Kara Delik", themeSolar: "Solar Fırtına", themeGalactic: "Galaktik Çekirdek",
    pause: "OYUN DURAKLATILDI", resume: "DEVAM ET",
    noScores: "Henüz kayıtlı skor yok.",
    loadingScores: "Skorlar yükleniyor...",
    welcome: "HOŞ GELDİN!", namePrompt: "Skor tablosunda görünmek için bir isim gir:",
    namePlaceholder: "Takma Adın", saveAndStart: "KAYDET VE BAŞLA", nameTaken: "Bu isim alınmış, başka bir isim dene.", nameChecking: "Kontrol ediliyor...",
    offlineScores: "Çevrimdışı — yerel skorlar gösteriliyor.",
    signInGoogle: "Google ile giriş yap", signedInAs: "Bulut kaydı açık", signOut: "Çıkış yap", syncing: "Eşitleniyor...", signInFailed: "Giriş yapılamadı. Tekrar dene.",
    shareScore: "SKORU PAYLAŞ", shareText: "Orbit Jump'ta {n} puan yaptım! Geçebilir misin? 🚀", streakReminderTitle: "🔥 Serin bozulmak üzere!", streakReminderBody: "{n}. gün ödülünü gece yarısından önce al.",
    modeDaily: "📅 GÜNLÜK MEYDAN OKUMA", dailyHint: "Bugün herkes aynı haritada", lbWeekly: "BU HAFTA", lbAllTime: "TÜM ZAMANLAR", lbDaily: "GÜNLÜK", weeklyResets: "Her pazartesi sıfırlanır", dailyResets: "Her gün yeni harita", dailyMissions: "GÜNLÜK GÖREVLER", dailyMissionsHint: "Her gün yeni görevler", dm_games: "{n} tur oyna", dm_perfects: "{n} Mükemmel iniş yap", dm_bestScore: "Tek turda {n} puan yap", dm_crystals: "{n} kristal kazan", dm_maxCombo: "{n}x kombo yap", dm_daily: "Günlük Meydan Okuma'yı oyna", comeback1Title: "🪐 Gezegenler seni özledi!", comeback1Body: "Rekorun {n}. Bugün geçebilirsin.", comeback1BodyNew: "Geri dön, ilk rekorunu kır!", comeback2Title: "📅 Yeni Günlük Meydan Okuma seni bekliyor", comeback2Body: "Herkes aynı haritada. Bugünün tablosunda zirveye çıkabilir misin?",
    getOnPlay: "📲 GOOGLE PLAY'DEN İNDİR", webHint: "Bulut kaydı, günlük seri ödülleri ve fazlası mobilde",
    deleteAccount: "Hesabı sil", privacyOptions: "Gizlilik seçenekleri", deleteConfirm: "Hesabın ve bulut kaydın kalıcı olarak silinsin mi? Skor tablosundaki kaydın da kaldırılır. Bu cihazdaki ilerlemen kalır.", deleteFailed: "Hesap silinemedi. Tekrar dene."
  },
  es: {
    title: "SALTO ÓRBITA", play: "JUGAR", score: "PUNTAJE", best: "MEJOR", gameOver: "FIN DEL JUEGO",
    restart: "INTENTAR DE NUEVO", menu: "MENÚ", shop: "TIENDA", missions: "MISIONES", leaderboard: "TABLA", badges: "INSIGNIAS", back: "ATRÁS",
    crystals: "CRISTALES", claim: "RECLAMAR", claimed: "RECLAMADO", owned: "OBTENIDO", select: "ELEGIR",
    selected: "ELEGIDO", perfect: "PERFECTO", great: "GENIAL", combo: "COMBO",
    dailyBonus: "BONO DIARIO", shield: "ESCUDO", slowmo: "CÁMARA LENTA", buy: "COMPRAR", upgrade: "MEJORAR", level: "NV", max: "MÁX",
    buyPack: "COMPRAR (+3)",
    watchAdReward: "VER ANUNCIO (+50 💎)", watchAdContinue: "VER ANUNCIO Y CONTINUAR", adPlaying: "📺 CARGANDO ANUNCIO...",
    adWaitText: "Por favor, espera a que termine el anuncio.",
    adLimitReached: "LÍMITE DIARIO ALCANZADO (2/2)",
    insufficientCrystals: "CRISTALES INSUFICIENTES",
    modeNormal: "MODO NORMAL", modeSupernova: "SUPERNOVA (5s / 2x)", modeZen: "MODO ZEN (Sin Límite)", modeFast: "MODO RÁPIDO (Extremo)",
    howToPlay: "JUGABILIDAD Y CARACTERÍSTICAS",
    helpRule1: "Salto Principal: Toca en cualquier parte de la pantalla para saltar con precisión al planeta objetivo en rotación.",
    helpRule2: "Aterrizajes Perfectos: Aterrizar muy cerca del borde otorga +3 puntos y activa un breve efecto de cámara lenta.",
    helpRule3: "Modos de Juego: El Modo Normal tiene 10s, Supernova 5s, el Modo Zen no tiene temporizadores y el Modo Rápido ofrece velocidad extrema.",
    helpRule4: "Poderes y Defensa: Usa el Escudo (🛡️) para sobrevivir a fallos y la Cámara Lenta (⏳) para apuntar con exactitud.",
    helpBallFeature: "Mejoras de Bola: Sube hasta el nivel 5 para ampliar píxeles perfectos, núcleos brillantes y bonos de cristales.",
    helpShopFeature: "Tienda y Temas: Personaliza tu experiencia con 4 temas únicos, estelas personalizadas y paquetes.",
    streakTitle: "BONO DE RACHA DIARIA", streakClaimed: "RECLAMADO HOY", streakBtn: "RECLAMAR RACHA",
    dayWord: "Día",
    tabBalls: "BOLAS", tabBoosts: "PODERES", tabTrails: "ESTELAS", tabThemes: "TEMAS",
    badge1: "Superviviente", badge1Desc: "Salta a un nuevo planeta con éxito",
    badge2: "Viajero Cósmico", badge2Desc: "Llega a 10 planetas en una partida",
    badge3: "Perfeccionista", badge3Desc: "Logra 3 saltos perfectos",
    badge4: "Riqueza Cósmica", badge4Desc: "Recolecta 500 cristales",
    tierEasy: "FÁCIL", tierNormal: "NORMAL", tierHard: "DIFÍCIL", tierInsane: "INSANO", tierImpossible: "IMPOSIBLE",
    m1: "Llega a 10 planetas en una partida", m2: "Logra 5 Saltos Perfectos (total)", m3: "Juega 10 partidas (total)",
    m4: "Llega a 20 planetas en una partida", m5: "Logra 20 Saltos Perfectos (total)",
    m6: "Alcanza un combo de 3x", m7: "Recolecta un total de 100 cristales", m8: "Logra 3 Saltos Perfectos en una partida",
    m9: "Alcanza un combo de 5x", m10: "Juega 25 partidas (total)",
    itemGold: "Bola de Oro", itemRuby: "Bola de Rubí", itemEmerald: "Bola Esmeralda", itemNova: "Bola Supernova",
    trailGold: "Polvo de Oro", trailFire: "Estela de Fuego", trailCyan: "Estela de Plasma",
    themeNebula: "Nebulosa", themeVoid: "Agujero Negro", themeSolar: "Tormenta Solar", themeGalactic: "Núcleo Galáctico",
    pause: "JUEGO PAUSADO", resume: "CONTINUAR",
    noScores: "Aún no hay puntuaciones registradas.",
    loadingScores: "Cargando puntuaciones...",
    welcome: "¡BIENVENIDO!", namePrompt: "Introduce un nombre para la tabla de clasificación:",
    namePlaceholder: "Tu apodo", saveAndStart: "GUARDAR Y EMPEZAR", nameTaken: "Este nombre ya está en uso, prueba otro.", nameChecking: "Comprobando...",
    offlineScores: "Sin conexión — mostrando puntuaciones locales.",
    signInGoogle: "Iniciar sesión con Google", signedInAs: "Guardado en la nube activo", signOut: "Cerrar sesión", syncing: "Sincronizando...", signInFailed: "No se pudo iniciar sesión. Inténtalo de nuevo.",
    shareScore: "COMPARTIR", shareText: "¡Hice {n} puntos en Orbit Jump! ¿Puedes superarme? 🚀", streakReminderTitle: "🔥 ¡Tu racha está a punto de romperse!", streakReminderBody: "Reclama tu recompensa del día {n} antes de medianoche.",
    modeDaily: "📅 DESAFÍO DIARIO", dailyHint: "Hoy, el mismo mapa para todos", lbWeekly: "ESTA SEMANA", lbAllTime: "HISTÓRICO", lbDaily: "DIARIO", weeklyResets: "Se reinicia cada lunes", dailyResets: "Mapa nuevo cada día", dailyMissions: "MISIONES DIARIAS", dailyMissionsHint: "Nuevas misiones cada día", dm_games: "Juega {n} partidas", dm_perfects: "Consigue {n} saltos Perfectos", dm_bestScore: "Haz {n} puntos en una partida", dm_crystals: "Gana {n} cristales", dm_maxCombo: "Logra un combo x{n}", dm_daily: "Juega el Desafío Diario", comeback1Title: "🪐 ¡Los planetas te echan de menos!", comeback1Body: "Tu récord es {n}. Hoy puedes superarlo.", comeback1BodyNew: "¡Vuelve y marca tu primer récord!", comeback2Title: "📅 Te espera un nuevo Desafío Diario", comeback2Body: "El mismo mapa para todos. ¿Llegarás a la cima hoy?",
    getOnPlay: "📲 DISPONIBLE EN GOOGLE PLAY", webHint: "Guardado en la nube, recompensas diarias y más en el móvil",
    deleteAccount: "Eliminar cuenta", privacyOptions: "Opciones de privacidad", deleteConfirm: "¿Eliminar tu cuenta y tu guardado en la nube para siempre? También se quitará tu puntuación de la clasificación. El progreso en este dispositivo se mantiene.", deleteFailed: "No se pudo eliminar la cuenta. Inténtalo de nuevo."
  },
  de: {
    title: "ORBIT SPRUNG", play: "SPIELEN", score: "PUNKTE", best: "BESTE", gameOver: "SPIEL VORBEI",
    restart: "NOCHMAL", menu: "MENÜ", shop: "SHOP", missions: "MISSIONEN", leaderboard: "BESTENLISTE", badges: "ABZEICHEN", back: "ZURÜCK",
    crystals: "KRISTALLE", claim: "ABHOLEN", claimed: "ABGEHOLT", owned: "BESESSEN", select: "WÄHLEN",
    selected: "GEWÄHLT", perfect: "PERFEKT", great: "GUT", combo: "COMBO",
    dailyBonus: "TÄGLICHER BONUS", shield: "SCHILD", slowmo: "SLOW-MO", buy: "KAUFEN", upgrade: "UPGRADE", level: "LVL", max: "MAX",
    buyPack: "KAUFEN (+3)",
    watchAdReward: "WERBUNG SEHEN (+50 💎)", watchAdContinue: "WERBUNG SEHEN & WEITER", adPlaying: "📺 WERBUNG LÄDT...",
    adWaitText: "Bitte warten, bis die Werbung beendet ist.",
    adLimitReached: "TÄGLICHES LIMIT ERREICHT (2/2)",
    insufficientCrystals: "NICHT GENUG KRISTALLE",
    modeNormal: "NORMAL", modeSupernova: "SUPERNOVA", modeZen: "ZEN (Kein Timer)", modeFast: "SCHNELL (Extrem)",
    howToPlay: "SPIELANLEITUNG & FUNKTIONEN",
    helpRule1: "Grundlegendes Springen: Tippe auf den Bildschirm, um präzise vom aktuellen Planeten zum rotierenden Zielplaneten zu springen.",
    helpRule2: "Perfekte Landungen: Landungen ganz nah am Rand geben +3 Punkte und lösen einen kurzen Slow-Mo-Effekt aus.",
    helpRule3: "Spielmodi: Normalmodus hat 10s, Supernova 5s, Zen-Modus hat keinen Timer und der Schnelle Modus bietet extremes Tempo.",
    helpRule4: "Boosts & Verteidigung: Nutze das Schild (🛡️) zum Überleben und Slow-Mo (⏳) für präzise Sprünge.",
    helpBallFeature: "Ball-Upgrades: Rüste Bälle bis Stufe 5 auf, um Trefferzonen zu vergrößern und Kristallboni zu erhalten.",
    helpShopFeature: "Shop & Themen: Passe dein Spiel mit 4 einzigartigen Themen, Spezialspuren und Boost-Paketen an.",
    streakTitle: "TÄGLICHER SERIENBONUS", streakClaimed: "HEUTE GEHOLT", streakBtn: "BONUS HOLEN",
    dayWord: "Tag",
    tabBalls: "BÄLLE", tabBoosts: "BOOSTS", tabTrails: "SPUREN", tabThemes: "THEMEN",
    badge1: "Überlebender", badge1Desc: "Springe erfolgreich zu einem Planeten",
    badge2: "Kosmischer Reisender", badge2Desc: "Erreiche 10 Planeten in einem Lauf",
    badge3: "Perfektionist", badge3Desc: "Lande 3 perfekte Sprünge gesamt",
    badge4: "Kosmischer Reichtum", badge4Desc: "Sammle insgesamt 500 Kristalle",
    tierEasy: "LEICHT", tierNormal: "NORMAL", tierHard: "SCHWER", tierInsane: "WAHNSINN", tierImpossible: "UNMÖGLICH",
    m1: "Erreiche 10 Planeten in einem Lauf", m2: "Lande 5 perfekte Sprünge (gesamt)", m3: "Spiele 10 Runden (gesamt)",
    m4: "Erreiche 20 Planeten in einem Lauf", m5: "Lande 20 perfekte Sprünge (gesamt)",
    m6: "Erreiche eine 3er-Kombo", m7: "Sammle insgesamt 100 Kristalle", m8: "Lande 3 perfekte Sprünge in einem Lauf",
    m9: "Erreiche eine 5er-Kombo", m10: "Spiele 25 Runden (gesamt)",
    itemGold: "Goldener Ball", itemRuby: "Rubinball", itemEmerald: "Smaragdball", itemNova: "Supernova-Ball",
    trailGold: "Goldstaub", trailFire: "Feuerspur", trailCyan: "Plasmaspur",
    themeNebula: "Nebel", themeVoid: "Schwarzes Loch", themeSolar: "Sonnensturm", themeGalactic: "Galaktischer Kern",
    pause: "SPIEL PAUSIERT", resume: "WEITER",
    noScores: "Noch keine Ergebnisse gespeichert.",
    loadingScores: "Ergebnisse werden geladen...",
    welcome: "WILLKOMMEN!", namePrompt: "Gib einen Namen für die Bestenliste ein:",
    namePlaceholder: "Dein Spitzname", saveAndStart: "SPEICHERN & STARTEN", nameTaken: "Dieser Name ist vergeben, versuch einen anderen.", nameChecking: "Wird geprüft...",
    offlineScores: "Offline — lokale Ergebnisse werden angezeigt.",
    signInGoogle: "Mit Google anmelden", signedInAs: "Cloud-Speicher aktiv", signOut: "Abmelden", syncing: "Synchronisiere...", signInFailed: "Anmeldung fehlgeschlagen. Erneut versuchen.",
    shareScore: "TEILEN", shareText: "Ich habe {n} Punkte in Orbit Jump! Schaffst du mehr? 🚀", streakReminderTitle: "🔥 Deine Serie reißt gleich ab!", streakReminderBody: "Hol dir deine Belohnung für Tag {n} vor Mitternacht.",
    modeDaily: "📅 TAGES-CHALLENGE", dailyHint: "Heute für alle dieselbe Karte", lbWeekly: "DIESE WOCHE", lbAllTime: "ALLZEIT", lbDaily: "TÄGLICH", weeklyResets: "Wird jeden Montag zurückgesetzt", dailyResets: "Jeden Tag eine neue Karte", dailyMissions: "TAGESMISSIONEN", dailyMissionsHint: "Jeden Tag neue Missionen", dm_games: "Spiele {n} Runden", dm_perfects: "Schaffe {n} perfekte Sprünge", dm_bestScore: "Erreiche {n} Punkte in einer Runde", dm_crystals: "Verdiene {n} Kristalle", dm_maxCombo: "Schaffe eine {n}x-Kombo", dm_daily: "Spiele die Tages-Challenge", comeback1Title: "🪐 Die Planeten vermissen dich!", comeback1Body: "Dein Rekord ist {n}. Heute knackst du ihn.", comeback1BodyNew: "Komm zurück und stell deinen ersten Rekord auf!", comeback2Title: "📅 Eine neue Tages-Challenge wartet", comeback2Body: "Dieselbe Karte für alle. Schaffst du heute Platz 1?",
    getOnPlay: "📲 JETZT BEI GOOGLE PLAY", webHint: "Cloud-Speicher, tägliche Belohnungen und mehr auf dem Handy",
    deleteAccount: "Konto löschen", privacyOptions: "Datenschutzoptionen", deleteConfirm: "Konto und Cloud-Speicher endgültig löschen? Dein Bestenlisten-Eintrag wird ebenfalls entfernt. Der Fortschritt auf diesem Gerät bleibt erhalten.", deleteFailed: "Konto konnte nicht gelöscht werden. Erneut versuchen."
  },
  ru: {
    title: "ПРЫЖОК ОРБИТЫ", play: "ИГРАТЬ", score: "СЧЕТ", best: "РЕКОРД", gameOver: "ИГРА ОКОНЧЕНА",
    restart: "ПОВТОРИТЬ", menu: "МЕНЮ", shop: "МАГАЗИН", missions: "ЗАДАНИЯ", leaderboard: "ТАБЛИЦА", badges: "ЗНАЧКИ", back: "НАЗАД",
    crystals: "КРИСТАЛЛЫ", claim: "ЗАБРАТЬ", claimed: "ПОЛУЧЕНО", owned: "ЕСТЬ", select: "ВЫБРАТЬ",
    selected: "ВЫБРАНО", perfect: "ИДЕАЛЬНО", great: "ОТЛИЧНО", combo: "КОМБО",
    dailyBonus: "ЕЖЕДНЕВНЫЙ БОНУС", shield: "ЩИТ", slowmo: "ЗАМЕДЛЕНИЕ", buy: "КУПИТЬ", upgrade: "УЛУЧШИТЬ", level: "УР", max: "МАКС",
    buyPack: "КУПИТЬ (+3)",
    watchAdReward: "СМОТРЕТЬ РЕКЛАМУ (+50 💎)", watchAdContinue: "СМОТРЕТЬ И ПРОДОЛЖИТЬ", adPlaying: "📺 ЗАГРУЗКА...",
    adWaitText: "Пожалуйста, дождитесь окончания рекламы.",
    adLimitReached: "ЛИМИТ ИСЧЕРПАН (2/2)",
    insufficientCrystals: "НЕДОСТАТОЧНО КРИСТАЛЛОВ",
    modeNormal: "ОБЫЧНЫЙ", modeSupernova: "СУПЕРНОВА", modeZen: "ZEN (Без таймера)", modeFast: "БЫСТРЫЙ (Экстрим)",
    howToPlay: "ПРАВИЛА И ОСОБЕННОСТИ",
    helpRule1: "Основной прыжок: Нажимайте в любом месте экрана для точного прыжка с текущей планеты на вращающуюся цель.",
    helpRule2: "Идеальные приземления: Посадка у самого края дает +3 очка и запускает короткий эффект замедления времени.",
    helpRule3: "Режимы игры: Обычный режим (10с), Супернова (5с), режим Дзен (без таймера) и Быстрый режим дает экстремальную скорость.",
    helpRule4: "Усиления: Используйте Щит (🛡️) для спасения при промахе и Замедление (⏳) для точного расчета траектории.",
    helpBallFeature: "Улучшение шаров: Прокачка до 5 уровня расширяет зону идеального прыжка и увеличивает доход кристаллов.",
    helpShopFeature: "Магазин и Темы: Настройте игру с помощью 4 тем, пользовательских следов и наборов усилений.",
    streakTitle: "ЕЖЕДНЕВНАЯ СЕРИЯ БОНУСОВ", streakClaimed: "ПОЛУЧЕНО СЕГОДНЯ", streakBtn: "ЗАБРАТЬ БОНУС",
    dayWord: "День",
    tabBalls: "ШАРЫ", tabBoosts: "СИЛЫ", tabTrails: "СЛЕДЫ", tabThemes: "ТЕМЫ",
    badge1: "Путник", badge1Desc: "Успешно прыгните на планету",
    badge2: "Космический Странник", badge2Desc: "Достигните 10 планет за забег",
    badge3: "Перфекционист", badge3Desc: "Совершите 3 идеальных прыжка",
    badge4: "Богатство", badge4Desc: "Соберите 500 кристаллов",
    tierEasy: "ЛЕГКО", tierNormal: "НОРМА", tierHard: "СЛОЖНО", tierInsane: "БЕЗУМИЕ", tierImpossible: "НЕВОЗМОЖНО",
    m1: "Достигни 10 планет за один забег", m2: "Соверши 5 идеальных прыжков (всего)", m3: "Сыграй 10 забегов (всего)",
    m4: "Достигни 20 планет за один забег", m5: "Соверши 20 идеальных прыжков (всего)",
    m6: "Добейся комбо 3х", m7: "Собери в сумме 100 кристаллов", m8: "Соверши 3 идеальных прыжка за один забег",
    m9: "Добейся комбо 5х", m10: "Сыграй 25 забегов (всего)",
    itemGold: "Золотой шар", itemRuby: "Рубиновый шар", itemEmerald: "Изумрудный шар", itemNova: "Шар Супернова",
    trailGold: "Золотая пыль", trailFire: "Огненный след", trailCyan: "Плазменный след",
    themeNebula: "Туманность", themeVoid: "Черная дыра", themeSolar: "Солнечная буря", themeGalactic: "Галактическое ядро",
    pause: "ИГРА НА ПАУЗЕ", resume: "ПРОДОЛЖИТЬ",
    noScores: "Пока нет сохранённых результатов.",
    loadingScores: "Загрузка результатов...",
    welcome: "ДОБРО ПОЖАЛОВАТЬ!", namePrompt: "Введите имя для таблицы рекордов:",
    namePlaceholder: "Ваш ник", saveAndStart: "СОХРАНИТЬ И НАЧАТЬ", nameTaken: "Это имя занято, попробуйте другое.", nameChecking: "Проверка...",
    offlineScores: "Нет сети — показаны локальные результаты.",
    signInGoogle: "Войти через Google", signedInAs: "Облачное сохранение включено", signOut: "Выйти", syncing: "Синхронизация...", signInFailed: "Не удалось войти. Попробуйте снова.",
    shareScore: "ПОДЕЛИТЬСЯ", shareText: "Мой результат в Orbit Jump — {n}! Сможешь больше? 🚀", streakReminderTitle: "🔥 Серия вот-вот прервётся!", streakReminderBody: "Заберите награду за день {n} до полуночи.",
    modeDaily: "📅 ЕЖЕДНЕВНОЕ ИСПЫТАНИЕ", dailyHint: "Сегодня у всех одна карта", lbWeekly: "НЕДЕЛЯ", lbAllTime: "ВСЁ ВРЕМЯ", lbDaily: "ДЕНЬ", weeklyResets: "Сбрасывается каждый понедельник", dailyResets: "Каждый день новая карта", dailyMissions: "ЕЖЕДНЕВНЫЕ ЗАДАНИЯ", dailyMissionsHint: "Новые задания каждый день", dm_games: "Сыграйте {n} забегов", dm_perfects: "Сделайте {n} идеальных прыжков", dm_bestScore: "Наберите {n} очков за забег", dm_crystals: "Заработайте {n} кристаллов", dm_maxCombo: "Сделайте комбо x{n}", dm_daily: "Сыграйте ежедневное испытание", comeback1Title: "🪐 Планеты скучают по вам!", comeback1Body: "Ваш рекорд — {n}. Сегодня можно его побить.", comeback1BodyNew: "Возвращайтесь и поставьте первый рекорд!", comeback2Title: "📅 Новое ежедневное испытание ждёт", comeback2Body: "У всех одна карта. Сможете возглавить таблицу сегодня?",
    getOnPlay: "📲 СКАЧАТЬ В GOOGLE PLAY", webHint: "Облачное сохранение, ежедневные награды и многое другое — в приложении",
    deleteAccount: "Удалить аккаунт", privacyOptions: "Настройки конфиденциальности", deleteConfirm: "Удалить аккаунт и облачное сохранение навсегда? Запись в таблице лидеров тоже будет удалена. Прогресс на этом устройстве сохранится.", deleteFailed: "Не удалось удалить аккаунт. Попробуйте снова."
  }
};

// Rekor, seri kurtarma, seviye, meydan okuma, etkinlik ve ayarlar metinleri
const extraTranslations = {
  en: {
    helpBallFeature: "Characters: Collect 7 characters and upgrade them up to Level 5 to widen Perfect zones, unlock a glowing aura and earn crystal bonuses.", helpShopFeature: "Shop & Themes: Customize your game with 4 space themes, custom trails and boost packs.",
    badge5: "Orbit Pro", badge5Desc: "Score 25 in one run", badge6: "Comet Rider", badge6Desc: "Score 50 in one run", badge7: "Combo Master", badge7Desc: "Hit an 8x combo", badge8: "Flawless", badge8Desc: "Land 100 Perfect jumps", badge9: "Space Regular", badge9Desc: "Play 50 runs", badge10: "Crew Collector", badge10Desc: "Own 3 characters", badge11: "Veteran Explorer", badge11Desc: "Reach level 10", badge12: "Weekly Explorer", badge12Desc: "Keep a 7-day streak", playAchievements: "Google Play achievements",
    tabBalls: "SKINS", skinAstronaut: "Astronaut", skinRocket: "Rocket", skinUfo: "UFO", skinAlien: "Alien", skinRobot: "Robot", skinCat: "Space Cat", skinMeteor: "Meteor",
    tabNormal: "Normal", tabSupernova: "Supernova", tabZen: "Zen", tabFast: "Fast",
    hintNormal: "Classic — a timer on every planet", hintSupernova: "5 s per planet · 2× points", hintZen: "No timer — relax and aim", hintFast: "Faster planets · extreme",
    updateReady: "Update ready", updateRestart: "Restart",
    newBest: "🏆 NEW BEST!", newRecord: "🏆 NEW RECORD!", toBeatBest: "Only {n} to beat your best!", bestWas: "Best: {n}",
    streakLost: "Your {n}-day streak broke!", streakSave: "SAVE STREAK", streakSaveAd: "📺 Watch ad", streakSaveCrystals: "💎 {n}",
    lv: "Lv", levelUp: "⬆️ LEVEL {n}!", xpGain: "+{n} XP",
    settings: "Settings", soundLabel: "Sound", navRank: "Ranking", onLabel: "On", offLabel: "Off", language: "Language", account: "Account", graphics: "Graphics", graphicsHigh: "High", graphicsLow: "Low",
    challengeTitle: "⚔️ CHALLENGE", challengeBeat: "Beat {n} on the same map", challengeAccept: "ACCEPT", challengeWon: "🎉 Challenge won!", challengeShort: "{n} short of the challenge",
    challengeShare: "I scored {n} in Orbit Jump. Beat me on the same map! 🚀", challengeSend: "⚔️ CHALLENGE A FRIEND",
  },
  tr: {
    helpBallFeature: "Karakterler: 7 karakteri topla ve 5. seviyeye kadar geliştir; Mükemmel alanı genişlesin, parlayan hale açılsın, ekstra kristal kazan.", helpShopFeature: "Mağaza & Temalar: 4 uzay teması, özel izler ve güçlendirme paketleriyle oyununu kişiselleştir.",
    badge5: "Yörünge Ustası", badge5Desc: "Tek turda 25 puan yap", badge6: "Kuyruklu Yıldız", badge6Desc: "Tek turda 50 puan yap", badge7: "Kombo Ustası", badge7Desc: "8x kombo yap", badge8: "Kusursuz", badge8Desc: "100 Mükemmel iniş yap", badge9: "Uzay Müdavimi", badge9Desc: "50 tur oyna", badge10: "Mürettebat", badge10Desc: "3 karaktere sahip ol", badge11: "Kıdemli Kâşif", badge11Desc: "10. seviyeye ulaş", badge12: "Haftalık Kâşif", badge12Desc: "7 günlük seri yap", playAchievements: "Google Play başarımları",
    tabBalls: "KARAKTER", skinAstronaut: "Astronot", skinRocket: "Roket", skinUfo: "UFO", skinAlien: "Uzaylı", skinRobot: "Robot", skinCat: "Uzay Kedisi", skinMeteor: "Meteor",
    tabNormal: "Normal", tabSupernova: "Süpernova", tabZen: "Zen", tabFast: "Hızlı",
    hintNormal: "Klasik — her gezegende süre sayacı", hintSupernova: "Gezegen başına 5 sn · 2× puan", hintZen: "Süre yok — rahatla ve nişan al", hintFast: "Daha hızlı gezegenler · ekstrem",
    updateReady: "Güncelleme hazır", updateRestart: "Yeniden başlat",
    newBest: "🏆 YENİ REKOR!", newRecord: "🏆 YENİ REKOR!", toBeatBest: "Rekoruna sadece {n} kaldı!", bestWas: "Rekor: {n}",
    streakLost: "{n} günlük serin bozuldu!", streakSave: "SERİYİ KURTAR", streakSaveAd: "📺 Reklam izle", streakSaveCrystals: "💎 {n}",
    lv: "Sv", levelUp: "⬆️ SEVİYE {n}!", xpGain: "+{n} XP",
    settings: "Ayarlar", soundLabel: "Ses", navRank: "Sıralama", onLabel: "Açık", offLabel: "Kapalı", language: "Dil", account: "Hesap", graphics: "Grafik", graphicsHigh: "Yüksek", graphicsLow: "Düşük",
    challengeTitle: "⚔️ MEYDAN OKUMA", challengeBeat: "Aynı haritada {n} puanı geç", challengeAccept: "KABUL ET", challengeWon: "🎉 Meydan okumayı kazandın!", challengeShort: "Meydan okumaya {n} puan kaldı",
    challengeShare: "Orbit Jump'ta {n} puan yaptım. Aynı haritada geç bakalım! 🚀", challengeSend: "⚔️ ARKADAŞINA MEYDAN OKU",
  },
  es: {
    helpBallFeature: "Personajes: Colecciona 7 personajes y mejóralos hasta el nivel 5 para ampliar la zona Perfecta, desbloquear un aura brillante y ganar cristales extra.", helpShopFeature: "Tienda y temas: Personaliza tu juego con 4 temas espaciales, estelas y paquetes de potenciadores.",
    badge5: "Experto orbital", badge5Desc: "Haz 25 puntos en una partida", badge6: "Jinete de cometas", badge6Desc: "Haz 50 puntos en una partida", badge7: "Maestro del combo", badge7Desc: "Logra un combo x8", badge8: "Impecable", badge8Desc: "Consigue 100 saltos Perfectos", badge9: "Habitual del espacio", badge9Desc: "Juega 50 partidas", badge10: "Coleccionista", badge10Desc: "Ten 3 personajes", badge11: "Explorador veterano", badge11Desc: "Llega al nivel 10", badge12: "Explorador semanal", badge12Desc: "Mantén una racha de 7 días", playAchievements: "Logros de Google Play",
    tabBalls: "PERSONAJES", skinAstronaut: "Astronauta", skinRocket: "Cohete", skinUfo: "OVNI", skinAlien: "Alien", skinRobot: "Robot", skinCat: "Gato espacial", skinMeteor: "Meteorito",
    tabNormal: "Normal", tabSupernova: "Supernova", tabZen: "Zen", tabFast: "Rápido",
    hintNormal: "Clásico — temporizador en cada planeta", hintSupernova: "5 s por planeta · puntos x2", hintZen: "Sin tiempo — relájate y apunta", hintFast: "Planetas más rápidos · extremo",
    updateReady: "Actualización lista", updateRestart: "Reiniciar",
    newBest: "🏆 ¡NUEVO RÉCORD!", newRecord: "🏆 ¡NUEVO RÉCORD!", toBeatBest: "¡Solo {n} para batir tu récord!", bestWas: "Récord: {n}",
    streakLost: "¡Tu racha de {n} días se rompió!", streakSave: "SALVAR RACHA", streakSaveAd: "📺 Ver anuncio", streakSaveCrystals: "💎 {n}",
    lv: "Nv", levelUp: "⬆️ ¡NIVEL {n}!", xpGain: "+{n} XP",
    settings: "Ajustes", soundLabel: "Sonido", navRank: "Ranking", onLabel: "Sí", offLabel: "No", language: "Idioma", account: "Cuenta", graphics: "Gráficos", graphicsHigh: "Altos", graphicsLow: "Bajos",
    challengeTitle: "⚔️ DESAFÍO", challengeBeat: "Supera {n} en el mismo mapa", challengeAccept: "ACEPTAR", challengeWon: "🎉 ¡Desafío superado!", challengeShort: "Te faltaron {n} para el desafío",
    challengeShare: "Hice {n} puntos en Orbit Jump. ¡Supérame en el mismo mapa! 🚀", challengeSend: "⚔️ DESAFIAR A UN AMIGO",
  },
  de: {
    helpBallFeature: "Figuren: Sammle 7 Figuren und verbessere sie bis Level 5 – größere Perfekt-Zone, leuchtende Aura und Bonus-Kristalle.", helpShopFeature: "Shop & Themen: Gestalte dein Spiel mit 4 Weltraum-Themen, Spuren und Power-up-Paketen.",
    badge5: "Orbit-Profi", badge5Desc: "Erreiche 25 Punkte in einer Runde", badge6: "Kometenreiter", badge6Desc: "Erreiche 50 Punkte in einer Runde", badge7: "Kombo-Meister", badge7Desc: "Schaffe eine 8x-Kombo", badge8: "Makellos", badge8Desc: "Schaffe 100 perfekte Sprünge", badge9: "Stammgast im All", badge9Desc: "Spiele 50 Runden", badge10: "Crew-Sammler", badge10Desc: "Besitze 3 Figuren", badge11: "Erfahrener Entdecker", badge11Desc: "Erreiche Level 10", badge12: "Wochen-Entdecker", badge12Desc: "Halte eine 7-Tage-Serie", playAchievements: "Google Play-Erfolge",
    tabBalls: "FIGUREN", skinAstronaut: "Astronaut", skinRocket: "Rakete", skinUfo: "UFO", skinAlien: "Alien", skinRobot: "Roboter", skinCat: "Weltraumkatze", skinMeteor: "Meteor",
    tabNormal: "Normal", tabSupernova: "Supernova", tabZen: "Zen", tabFast: "Schnell",
    hintNormal: "Klassisch — Timer auf jedem Planeten", hintSupernova: "5 s pro Planet · 2× Punkte", hintZen: "Kein Timer — entspannt zielen", hintFast: "Schnellere Planeten · extrem",
    updateReady: "Update bereit", updateRestart: "Neu starten",
    newBest: "🏆 NEUER REKORD!", newRecord: "🏆 NEUER REKORD!", toBeatBest: "Nur noch {n} bis zum Rekord!", bestWas: "Rekord: {n}",
    streakLost: "Deine {n}-Tage-Serie ist gerissen!", streakSave: "SERIE RETTEN", streakSaveAd: "📺 Werbung ansehen", streakSaveCrystals: "💎 {n}",
    lv: "Lv", levelUp: "⬆️ LEVEL {n}!", xpGain: "+{n} XP",
    settings: "Einstellungen", soundLabel: "Ton", navRank: "Rangliste", onLabel: "An", offLabel: "Aus", language: "Sprache", account: "Konto", graphics: "Grafik", graphicsHigh: "Hoch", graphicsLow: "Niedrig",
    challengeTitle: "⚔️ HERAUSFORDERUNG", challengeBeat: "Schlage {n} auf derselben Karte", challengeAccept: "ANNEHMEN", challengeWon: "🎉 Herausforderung geschafft!", challengeShort: "{n} fehlten zur Herausforderung",
    challengeShare: "Ich habe {n} Punkte in Orbit Jump. Schlag mich auf derselben Karte! 🚀", challengeSend: "⚔️ FREUND HERAUSFORDERN",
  },
  ru: {
    helpBallFeature: "Персонажи: Соберите 7 персонажей и улучшайте их до 5 уровня — шире зона «Идеально», сияющая аура и бонусные кристаллы.", helpShopFeature: "Магазин и темы: Настройте игру с 4 космическими темами, следами и наборами усилений.",
    badge5: "Мастер орбиты", badge5Desc: "Наберите 25 очков за забег", badge6: "Наездник комет", badge6Desc: "Наберите 50 очков за забег", badge7: "Мастер комбо", badge7Desc: "Сделайте комбо x8", badge8: "Безупречный", badge8Desc: "Сделайте 100 идеальных прыжков", badge9: "Завсегдатай космоса", badge9Desc: "Сыграйте 50 забегов", badge10: "Коллекционер", badge10Desc: "Соберите 3 персонажа", badge11: "Опытный исследователь", badge11Desc: "Достигните 10 уровня", badge12: "Исследователь недели", badge12Desc: "Серия из 7 дней", playAchievements: "Достижения Google Play",
    tabBalls: "ГЕРОИ", skinAstronaut: "Астронавт", skinRocket: "Ракета", skinUfo: "НЛО", skinAlien: "Пришелец", skinRobot: "Робот", skinCat: "Космокот", skinMeteor: "Метеор",
    tabNormal: "Обычный", tabSupernova: "Сверхновая", tabZen: "Дзен", tabFast: "Быстрый",
    hintNormal: "Классика — таймер на каждой планете", hintSupernova: "5 с на планету · очки x2", hintZen: "Без таймера — спокойно цельтесь", hintFast: "Быстрые планеты · экстрим",
    updateReady: "Обновление готово", updateRestart: "Перезапустить",
    newBest: "🏆 НОВЫЙ РЕКОРД!", newRecord: "🏆 НОВЫЙ РЕКОРД!", toBeatBest: "До рекорда всего {n}!", bestWas: "Рекорд: {n}",
    streakLost: "Серия из {n} дн. прервалась!", streakSave: "СПАСТИ СЕРИЮ", streakSaveAd: "📺 Смотреть рекламу", streakSaveCrystals: "💎 {n}",
    lv: "Ур", levelUp: "⬆️ УРОВЕНЬ {n}!", xpGain: "+{n} XP",
    settings: "Настройки", soundLabel: "Звук", navRank: "Рейтинг", onLabel: "Вкл", offLabel: "Выкл", language: "Язык", account: "Аккаунт", graphics: "Графика", graphicsHigh: "Высокая", graphicsLow: "Низкая",
    challengeTitle: "⚔️ ВЫЗОВ", challengeBeat: "Побейте {n} на той же карте", challengeAccept: "ПРИНЯТЬ", challengeWon: "🎉 Вызов выполнен!", challengeShort: "До вызова не хватило {n}",
    challengeShare: "Мой результат в Orbit Jump — {n}. Побей меня на той же карте! 🚀", challengeSend: "⚔️ БРОСИТЬ ВЫЗОВ ДРУГУ",
  }
};
for (const [l, extra] of Object.entries(extraTranslations)) Object.assign(translations[l], extra);
const LANG_NAMES = { en: 'English', tr: 'Türkçe', es: 'Español', de: 'Deutsch', ru: 'Русский' };

const backgroundThemesList = {
  bg_nebula: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-600 via-purple-800 via-30% to-indigo-950 pointer-events-none overflow-hidden transition-colors duration-700",
  bg_void: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 via-zinc-900 via-25% to-black pointer-events-none overflow-hidden transition-colors duration-700",
  bg_solar: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-orange-700 via-30% to-slate-950 pointer-events-none overflow-hidden transition-colors duration-700",
  bg_galactic: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300 via-blue-800 via-30% to-slate-950 pointer-events-none overflow-hidden transition-colors duration-700"
};

// Bulanık daire yerine radial-gradient: blur-[140px] filtresi zayıf
// telefonlarda her karede yeniden çizilip oyunu kasıyordu.
const backgroundAccents = {
  bg_nebula: 'radial-gradient(circle, rgba(217,70,239,0.4) 0%, rgba(217,70,239,0.18) 35%, rgba(217,70,239,0) 70%)',
  bg_void: 'radial-gradient(circle, rgba(203,213,225,0.2) 0%, rgba(203,213,225,0.09) 35%, rgba(203,213,225,0) 70%)',
  bg_solar: 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.20) 35%, rgba(251,191,36,0) 70%)',
  bg_galactic: 'radial-gradient(circle, rgba(103,232,249,0.45) 0%, rgba(103,232,249,0.20) 35%, rgba(103,232,249,0) 70%)'
};

/* ============================================================
   GEZEGENLER — her biri farklı tipte bir gök cismi.
   Renkler ve katman görünürlükleri CSS değişkeni olarak
   uygulanıyor, böylece her inişte tek hamlede tema değişiyor.
   ============================================================ */
const planetThemes = [
  { // Volkanik dünya — koyu kırmızı, lav çatlaklı
    light: '#ffd0a0', mid: '#dc2626', dark: '#2a0505', glow: '239,68,68', ringRgb: '249,115,22',
    bands: 0, craters: 0.7, land: 0, ice: 0, storm: 0, lava: 1, ringOn: 0, facets: 0, dunes: 0, spots: 0, size: 1, radius: '50%', tilt: '-16deg'
  },
  { // Gaz devi — pembe kuşaklar, fırtına lekesi, eğik halka
    light: '#ffd7ec', mid: '#db2777', dark: '#3d0420', glow: '219,39,119', ringRgb: '244,114,182',
    bands: 0.95, craters: 0, land: 0, ice: 0, storm: 0.9, lava: 0, ringOn: 1, facets: 0, dunes: 0, spots: 0, size: 1.2, radius: '50%', tilt: '-16deg'
  },
  { // Yaşanabilir dünya — mavi okyanus, yeşil kıtalar, bulutlar
    light: '#cfe8ff', mid: '#2563eb', dark: '#071a44', glow: '59,130,246', ringRgb: '96,165,250',
    bands: 0, craters: 0, land: 1, ice: 0, storm: 0, lava: 0, ringOn: 0, facets: 0, dunes: 0, spots: 0, size: 1, radius: '50%', tilt: '0deg'
  },
  { // Buz devi — derin mor-lacivert, düz halka
    light: '#e0d7ff', mid: '#6d28d9', dark: '#140a33', glow: '139,92,246', ringRgb: '196,181,253',
    bands: 0.5, craters: 0, land: 0, ice: 0.3, storm: 0, lava: 0, ringOn: 1, facets: 0, dunes: 0, spots: 0, size: 1.08, radius: '50%', tilt: '8deg'
  },
  { // Donmuş okyanus — beyaz-camgöbeği, buz çatlakları
    light: '#f0fdff', mid: '#22d3ee', dark: '#06303b', glow: '34,211,238', ringRgb: '103,232,249',
    bands: 0, craters: 0.15, land: 0, ice: 1, storm: 0, lava: 0, ringOn: 0, facets: 0, dunes: 0, spots: 0, size: 0.95, radius: '50%', tilt: '0deg'
  },
  { // Ay — küçük, gri, bol kraterli
    light: '#f8fafc', mid: '#94a3b8', dark: '#1e293b', glow: '226,232,240', ringRgb: '203,213,225',
    bands: 0, craters: 1, land: 0, ice: 0, storm: 0, lava: 0, ringOn: 0, facets: 0, dunes: 0, spots: 0, size: 0.8, radius: '50%', tilt: '0deg'
  },
  { // Çöl gezegeni — kum sarısı, kum tepeleri
    light: '#fff7d6', mid: '#eab308', dark: '#422006', glow: '234,179,8', ringRgb: '253,224,71',
    bands: 0, craters: 0.25, land: 0, ice: 0, storm: 0, lava: 0, ringOn: 0, facets: 0, dunes: 1, spots: 0, size: 1.05, radius: '50%', tilt: '0deg'
  },
  { // Zehirli dev — asit yeşili, parlak lekeler, dik halka
    light: '#ecfccb', mid: '#65a30d', dark: '#142305', glow: '132,204,22', ringRgb: '217,70,239',
    bands: 0.35, craters: 0, land: 0, ice: 0, storm: 0.5, lava: 0, ringOn: 1, facets: 0, dunes: 0, spots: 1, size: 1.12, radius: '50%', tilt: '-34deg'
  },
  { // Kristal cüce — macenta, kesme taş yüzeyli, hafif yamuk
    light: '#fdf4ff', mid: '#c026d3', dark: '#3b0764', glow: '217,70,239', ringRgb: '240,171,252',
    bands: 0, craters: 0, land: 0, ice: 0.3, storm: 0, lava: 0, ringOn: 0, facets: 1, dunes: 0, spots: 0, size: 0.9, radius: '47% 53% 50% 50% / 52% 48% 52% 48%', tilt: '0deg'
  },
  { // Asteroit — pas kahvesi, düzensiz, taşlı
    light: '#f5d0b5', mid: '#9a3412', dark: '#1c0a04', glow: '194,65,12', ringRgb: '251,146,60',
    bands: 0, craters: 1, land: 0, ice: 0, storm: 0, lava: 0, ringOn: 0, facets: 0, dunes: 0, spots: 0, size: 0.76, radius: '42% 58% 55% 45% / 58% 40% 60% 42%', tilt: '0deg'
  }
];

// Gezegen türü turun görünüş tohumundan seçilir: günlük meydan okuma ve arkadaş
// meydan okumasında herkes aynı gezegen dizisini görür. Harita tohumundan ayrı
// tutulur ki gezegen konumları değişmesin. Art arda aynı tür gelmez.
const pickPlanetTheme = (except, rand) => {
  let n = Math.floor(rand() * (planetThemes.length - 1));
  if (n >= except) n++;
  return n;
};

const applyPlanetTheme = (groupEl, theme) => {
  if (!groupEl || !theme) return;
  const s = groupEl.style;
  s.setProperty('--p-light', theme.light);
  s.setProperty('--p-mid', theme.mid);
  s.setProperty('--p-dark', theme.dark);
  s.setProperty('--p-glow', theme.glow);
  s.setProperty('--p-ring-rgb', theme.ringRgb);
  s.setProperty('--p-bands', String(theme.bands));
  s.setProperty('--p-craters', String(theme.craters));
  s.setProperty('--p-land', String(theme.land));
  s.setProperty('--p-ice', String(theme.ice));
  s.setProperty('--p-storm', String(theme.storm));
  s.setProperty('--p-lava', String(theme.lava));
  s.setProperty('--p-ring-on', String(theme.ringOn));
  s.setProperty('--p-size', String(theme.size));
  s.setProperty('--p-radius', theme.radius);
  s.setProperty('--p-ring-tilt', theme.tilt);
  s.setProperty('--p-facets', String(theme.facets));
  s.setProperty('--p-dunes', String(theme.dunes));
  s.setProperty('--p-spots', String(theme.spots));
};

/* ============================================================
   KARAKTERLER — mağazada satılır ve 5 seviyeye kadar geliştirilir.
   (Kimlikler eski sürümlerle uyum için "ball" tipinde kalır.)
   ============================================================ */
const shopItems = [
  { id: 'astronaut', type: 'ball', price: 0, trailTint: '#67e8f9', nameKey: 'skinAstronaut' },
  { id: 'rocket', type: 'ball', price: 40, trailTint: '#f97316', nameKey: 'skinRocket' },
  { id: 'ufo', type: 'ball', price: 60, trailTint: '#a78bfa', nameKey: 'skinUfo' },
  { id: 'alien', type: 'ball', price: 80, trailTint: '#4ade80', nameKey: 'skinAlien' },
  { id: 'robot', type: 'ball', price: 100, trailTint: '#22d3ee', nameKey: 'skinRobot' },
  { id: 'cat', type: 'ball', price: 120, trailTint: '#fb923c', nameKey: 'skinCat' },
  { id: 'meteor', type: 'ball', price: 150, trailTint: '#fbbf24', nameKey: 'skinMeteor' },
  { id: 'trail_gold', type: 'trail', price: 50, color: '#fde047', shape: 'dust', nameKey: 'trailGold' },
  { id: 'trail_fire', type: 'trail', price: 75, color: '#ef4444', shape: 'flame', nameKey: 'trailFire' },
  { id: 'trail_cyan', type: 'trail', price: 75, color: '#06b6d4', shape: 'plasma', nameKey: 'trailCyan' },
  { id: 'bg_nebula', type: 'theme', price: 120, nameKey: 'themeNebula' },
  { id: 'bg_void', type: 'theme', price: 150, nameKey: 'themeVoid' },
  { id: 'bg_solar', type: 'theme', price: 180, nameKey: 'themeSolar' },
  { id: 'bg_galactic', type: 'theme', price: 200, nameKey: 'themeGalactic' }
];


// Oyuncu seviyesi: her tur XP verir; bir sonraki seviye için gereken XP
// 60'tan başlayıp her seviyede 30 artar. Seviye atlayınca kristal ödülü.
const xpForLevel = (level) => 60 + (level - 1) * 30;
const levelInfo = (xp) => {
  let level = 1, rest = xp;
  while (rest >= xpForLevel(level)) { rest -= xpForLevel(level); level++; }
  return { level, into: rest, need: xpForLevel(level) };
};
const levelReward = (level) => (level % 5 === 0 ? 100 : 20 + level * 4);

// Meydan okuma bağlantısı: aynı tohumla aynı harita üretilir
const CHALLENGE_MODES = ['normal', 'supernova', 'zen', 'fast'];
const parseChallenge = (params) => {
  const seed = params.get('s') || '';
  const target = parseInt(params.get('n') || '', 10);
  const mode = params.get('m') || 'normal';
  if (!/^[a-z0-9-]{4,24}$/.test(seed) || !(target > 0 && target <= 10000) || !CHALLENGE_MODES.includes(mode)) return null;
  return { seed, target, mode };
};
const challengeUrl = (seed, score, mode) => `https://orbit-jump-73b68.web.app/c?s=${seed}&n=${score}&m=${mode}`;
const randomSeed = () => `r${Math.random().toString(36).slice(2, 10)}`;

// 1.0.14: toplar karakterlere dönüştü; eski kimlikler (ve seviyeleri) yenilerine taşınır
const SKIN_MIGRATION = { gold: 'astronaut', ruby: 'rocket', emerald: 'alien', nova: 'ufo' };
const migrateSkins = (p) => {
  if (!p) return p;
  const map = (id) => SKIN_MIGRATION[id] || id;
  const levels = {};
  for (const [k, v] of Object.entries(p.ballLevels || {})) levels[map(k)] = Math.max(levels[map(k)] || 1, v);
  return { ...p, ownedItems: [...new Set((p.ownedItems || []).map(map))], selectedSkin: map(p.selectedSkin), ballLevels: levels };
};
try {
  const read = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  const owned = read('orbit_owned_items'), skin = read('orbit_selected_skin'), levels = read('orbit_ball_levels');
  const m = migrateSkins({ ownedItems: owned || [], selectedSkin: skin, ballLevels: levels || {} });
  if (owned) localStorage.setItem('orbit_owned_items', JSON.stringify(m.ownedItems));
  if (skin) localStorage.setItem('orbit_selected_skin', JSON.stringify(m.selectedSkin));
  if (levels) localStorage.setItem('orbit_ball_levels', JSON.stringify(m.ballLevels));
} catch { /* depolama yoksa varsayılanlar kullanılır */ }

/* Karakter çizimleri: küçük, düz renkli SVG'ler (gradyan, filtre, animasyon yok)
   — zayıf telefonda da her karede ucuz. Yönü olanlar sağa bakar; oyunda uçuş
   yönüne döndürülür. */
const SKIN_ART = {
  astronaut: (
    <>
      <rect x="0.8" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1" />
      <rect x="28" y="11" width="3.2" height="10" rx="1.6" fill="#cbd5e1" />
      <circle cx="16" cy="16" r="14.2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx="16" cy="15" rx="9.5" ry="7.5" fill="#0e7490" stroke="#1e293b" strokeWidth="1.2" />
      <path d="M10 12.5 Q13 9.5 17 10" stroke="#a5f3fc" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="21" cy="17.5" r="1.2" fill="#67e8f9" />
      <rect x="12" y="25" width="8" height="2.5" rx="1.2" fill="#f97316" />
    </>
  ),
  rocket: (
    <>
      <path d="M1 16 L8 12 L8 20 Z" fill="#f97316" />
      <path d="M4 16 L8 13.5 L8 18.5 Z" fill="#fde047" />
      <path d="M9 6.5 L14.5 11 L9 11 Z" fill="#dc2626" />
      <path d="M9 25.5 L14.5 21 L9 21 Z" fill="#dc2626" />
      <path d="M7 16 C7 11.5 12 9.5 19 9.5 C25 9.5 29 12.5 31 16 C29 19.5 25 22.5 19 22.5 C12 22.5 7 20.5 7 16 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <path d="M24 10.4 C27.5 11.5 30 13.5 31 16 C30 18.5 27.5 20.5 24 21.6 Z" fill="#ef4444" />
      <circle cx="17.5" cy="16" r="3.3" fill="#38bdf8" stroke="#1e40af" strokeWidth="1.2" />
      <circle cx="16.6" cy="15" r="1" fill="#e0f2fe" />
    </>
  ),
  ufo: (
    <>
      <ellipse cx="16" cy="13.5" rx="7" ry="6.5" fill="#a5f3fc" stroke="#0891b2" strokeWidth="1" />
      <path d="M12.5 11 Q14.5 9 17 9.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="18.5" rx="15" ry="5.5" fill="#7c3aed" />
      <ellipse cx="16" cy="17.2" rx="14" ry="3.6" fill="#a78bfa" />
      <circle cx="8" cy="19.6" r="1.3" fill="#fde047" />
      <circle cx="16" cy="20.6" r="1.3" fill="#fde047" />
      <circle cx="24" cy="19.6" r="1.3" fill="#fde047" />
    </>
  ),
  alien: (
    <>
      <path d="M16 2.5 C25 2.5 29.5 9 29.5 14.5 C29.5 22.5 22.5 29.5 16 29.5 C9.5 29.5 2.5 22.5 2.5 14.5 C2.5 9 7 2.5 16 2.5 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
      <ellipse cx="10.5" cy="15.5" rx="4.6" ry="2.8" transform="rotate(28 10.5 15.5)" fill="#052e16" />
      <ellipse cx="21.5" cy="15.5" rx="4.6" ry="2.8" transform="rotate(-28 21.5 15.5)" fill="#052e16" />
      <circle cx="9.3" cy="14.4" r="1" fill="#fff" />
      <circle cx="20.3" cy="14.4" r="1" fill="#fff" />
      <path d="M13.5 23 Q16 24.5 18.5 23" stroke="#14532d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </>
  ),
  robot: (
    <>
      <line x1="16" y1="7" x2="16" y2="3" stroke="#64748b" strokeWidth="1.6" />
      <circle cx="16" cy="2.6" r="2" fill="#f87171" />
      <rect x="1" y="13" width="2.5" height="7" rx="1" fill="#94a3b8" />
      <rect x="28.5" y="13" width="2.5" height="7" rx="1" fill="#94a3b8" />
      <rect x="3.5" y="7" width="25" height="20" rx="5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
      <rect x="7" y="11" width="18" height="11" rx="3" fill="#0f172a" />
      <circle cx="12" cy="16.5" r="2.3" fill="#22d3ee" />
      <circle cx="20" cy="16.5" r="2.3" fill="#22d3ee" />
    </>
  ),
  cat: (
    <>
      <path d="M8.5 11 L9.5 4.5 L14 9 Z" fill="#fb923c" />
      <path d="M23.5 11 L22.5 4.5 L18 9 Z" fill="#fb923c" />
      <circle cx="16" cy="17" r="10" fill="#fb923c" />
      <ellipse cx="12.3" cy="16" rx="1.6" ry="2.2" fill="#1c1917" />
      <ellipse cx="19.7" cy="16" rx="1.6" ry="2.2" fill="#1c1917" />
      <path d="M15 19.5 L17 19.5 L16 20.8 Z" fill="#f472b6" />
      <path d="M16 20.8 Q14.5 22.5 13 21.5 M16 20.8 Q17.5 22.5 19 21.5" stroke="#7c2d12" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="16" r="14.8" fill="#bae6fd" fillOpacity="0.18" stroke="#e2e8f0" strokeWidth="1.6" />
      <path d="M7 10 Q10 6 14 5.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  meteor: (
    <>
      <path d="M11 8 Q0 16 11 25 Q5 16 11 8 Z" fill="#f97316" />
      <path d="M12 11 Q5 16 12 22 Q9 16 12 11 Z" fill="#fde047" />
      <path d="M13 6 L22 4.5 L29 10 L30 19 L24 27.5 L14 27 L8.5 20 L9 11.5 Z" fill="#a8a29e" stroke="#57534e" strokeWidth="1.2" />
      <circle cx="20" cy="11" r="2.4" fill="#78716c" />
      <circle cx="24.5" cy="19" r="3" fill="#78716c" />
      <circle cx="15.5" cy="20" r="1.8" fill="#78716c" />
    </>
  ),
};

/* Karakter görseli — hem oyunda hem mağazada aynı bileşen. Seviye arttıkça
   karakter rengindeki hale büyür; 3+ seviyede parıltı, 5. seviyede yıldız. */
function BallVisual({ skinId, level = 1, size = 32, shieldActive = false, boosted = false }) {
  const glow = (shopItems.find((s) => s.id === skinId) || {}).trailTint || '#ffffff';
  const aura = Math.max(0, level - 1);
  return (
    <div className="ball-wrap" style={{ width: size, height: size }}>
      {shieldActive && <div className="ball-shield" />}
      {level > 1 && (
        <div
          className="ball-level-aura"
          style={{ inset: `${-18 - aura * 10}%`, opacity: 0.3 + aura * 0.1, animationDuration: `${2.2 - aura * 0.25}s`, background: `radial-gradient(circle, ${glow}99 0%, transparent 68%)` }}
        />
      )}
      <svg
        viewBox="0 0 32 32" width={size} height={size} aria-hidden="true"
        className={`skin ${level >= 3 ? 'skin-glow' : ''} ${boosted ? 'ball-boosted' : ''}`}
        style={level >= 3 ? { '--skin-glow': glow } : undefined}
      >
        {SKIN_ART[skinId] || SKIN_ART.astronaut}
      </svg>
      {level >= 5 && <div className="skin-star" style={{ fontSize: Math.round(size * 0.42) }}>★</div>}
    </div>
  );
}

const tiers = [
  { min: 0, max: 5, key: 'tierEasy', color: 'text-emerald-400', badge: '🟢' },
  { min: 6, max: 15, key: 'tierNormal', color: 'text-yellow-300', badge: '🟡' },
  { min: 16, max: 30, key: 'tierHard', color: 'text-orange-400', badge: '🟠' },
  { min: 31, max: 50, key: 'tierInsane', color: 'text-red-500', badge: '🔴' },
  { min: 51, max: Infinity, key: 'tierImpossible', color: 'text-slate-200', badge: '☠️' }
];
const getTier = (score) => tiers.find(t => score >= t.min && score <= t.max) || tiers[tiers.length - 1];

const missionDefs = [
  { id: 'catches10', statKey: 'bestRun', target: 10, reward: 20, labelKey: 'm1' },
  { id: 'perfect5', statKey: 'totalPerfects', target: 5, reward: 30, labelKey: 'm2' },
  { id: 'games10', statKey: 'gamesPlayed', target: 10, reward: 15, labelKey: 'm3' },
  { id: 'catches20', statKey: 'bestRun', target: 20, reward: 50, labelKey: 'm4' },
  { id: 'perfect20', statKey: 'totalPerfects', target: 20, reward: 70, labelKey: 'm5' },
  { id: 'maxCombo', statKey: 'maxCombo', target: 3, reward: 25, labelKey: 'm6' },
  { id: 'totalCrystals', statKey: 'totalCrystalsEarned', target: 100, reward: 60, labelKey: 'm7' },
  { id: 'runPerfects', statKey: 'bestRunPerfects', target: 3, reward: 40, labelKey: 'm8' },
  { id: 'combo5', statKey: 'maxCombo', target: 5, reward: 40, labelKey: 'm9' },
  { id: 'games25', statKey: 'gamesPlayed', target: 25, reward: 50, labelKey: 'm10' }
];

// Rozetler: stat değeri hedefe ulaşınca açılır, ödül elle alınır. Aynı rozetler
// Google Play başarımı olarak da açılır (playGames.js).
const badgeDefs = [
  { id: 'badge1', icon: '🌟', reward: 50, stat: 'gamesPlayed', target: 1 },
  { id: 'badge2', icon: '🪐', reward: 50, stat: 'bestRun', target: 10 },
  { id: 'badge3', icon: '💎', reward: 50, stat: 'totalPerfects', target: 3 },
  { id: 'badge4', icon: '💰', reward: 100, stat: 'totalCrystalsEarned', target: 500 },
  { id: 'badge5', icon: '🚀', reward: 75, stat: 'bestRun', target: 25 },
  { id: 'badge6', icon: '☄️', reward: 150, stat: 'bestRun', target: 50 },
  { id: 'badge7', icon: '🔥', reward: 100, stat: 'maxCombo', target: 8 },
  { id: 'badge8', icon: '✨', reward: 120, stat: 'totalPerfects', target: 100 },
  { id: 'badge9', icon: '🎮', reward: 80, stat: 'gamesPlayed', target: 50 },
  { id: 'badge10', icon: '👨‍🚀', reward: 100, stat: 'skins', target: 3 },
  { id: 'badge11', icon: '⭐', reward: 150, stat: 'level', target: 10 },
  { id: 'badge12', icon: '📅', reward: 150, stat: 'streak', target: 7 }
].map((b) => ({ ...b, nameKey: b.id, descKey: `${b.id}Desc`, check: (s) => (s[b.stat] || 0) >= b.target }));

let globalAudioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;

const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!globalAudioCtx) globalAudioCtx = new AudioCtx();
  if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
  return globalAudioCtx;
};

const startAmbientSpaceSound = (soundOn, themeIndex = 0) => {
  if (!soundOn) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!ambientGain) {
      ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(0.03, ctx.currentTime);
      ambientGain.connect(ctx.destination);

      ambientOsc1 = ctx.createOscillator();
      ambientOsc1.type = 'sine';

      ambientOsc2 = ctx.createOscillator();
      ambientOsc2.type = 'triangle';

      ambientOsc1.connect(ambientGain);
      ambientOsc2.connect(ambientGain);

      ambientOsc1.start();
      ambientOsc2.start();
    }

    updateAmbientSound(themeIndex);
  } catch {}
};

const updateAmbientSound = (themeIndex) => {
  try {
    if (!ambientOsc1 || !ambientOsc2 || !globalAudioCtx) return;
    const now = globalAudioCtx.currentTime;
    const freqs = [
      [65.41, 98.00], [55.00, 82.41], [73.42, 110.00], [61.74, 92.50]
    ];
    const [f1, f2] = freqs[themeIndex % freqs.length];
    ambientOsc1.frequency.exponentialRampToValueAtTime(f1, now + 1.5);
    ambientOsc2.frequency.exponentialRampToValueAtTime(f2, now + 1.5);
  } catch {}
};

const stopAmbientSpaceSound = () => {
  try {
    if (ambientGain && globalAudioCtx) {
      ambientGain.gain.exponentialRampToValueAtTime(0.0001, globalAudioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (ambientOsc1) { ambientOsc1.stop(); ambientOsc1.disconnect(); ambientOsc1 = null; }
        if (ambientOsc2) { ambientOsc2.stop(); ambientOsc2.disconnect(); ambientOsc2 = null; }
        if (ambientGain) { ambientGain.disconnect(); ambientGain = null; }
      }, 500);
    }
  } catch {}
};

const playSound = (type, soundOn, comboLevel = 1) => {
  if (!soundOn) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'score') {
      osc.type = 'triangle';
      const baseFreq = 523.25 + Math.min(comboLevel * 60, 400);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.06);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'perfect') {
      osc.type = 'triangle';
      const baseFreq = 659.25 + Math.min(comboLevel * 80, 500);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.33, now + 0.05);
      osc.frequency.setValueAtTime(baseFreq * 1.77, now + 0.1);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'coin') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(988, now);
      osc.frequency.setValueAtTime(1318.5, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'shield') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'combo') {
      osc.type = 'square';
      const baseFreq = 440 + Math.min(comboLevel * 40, 300);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.25, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'supernova') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      osc.start(now); osc.stop(now + 0.8);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    }
  } catch {}
};

const vibrate = (pattern) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
};

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
};
const saveJSON = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const loadDailyAdCount = () => {
  const today = new Date().toDateString();
  const storedAdDate = localStorage.getItem('orbit_last_ad_date');
  if (storedAdDate !== today) {
    localStorage.setItem('orbit_last_ad_date', today);
    localStorage.setItem('orbit_daily_ad_count', '0');
    return 0;
  }
  return parseInt(localStorage.getItem('orbit_daily_ad_count') || '0', 10);
};

// Günlük görev sayaçları gün değişince sıfırlanır
const loadDailyStats = () => {
  const today = localDayId();
  const saved = loadJSON('orbit_daily_stats', null);
  return saved && saved.id === today ? saved : emptyDailyStats(today);
};

// Tarayıcı sürümü (itch.io, CrazyGames vb.): reklam ve Google girişi yok,
// bunların yerine oyuncu Play Store'a yönlendirilir.
const isWeb = !Capacitor.isNativePlatform();
const webStoreUrl = () => {
  const host = (typeof location !== 'undefined' && location.hostname.replace(/[^a-z0-9.]/gi, '')) || 'web';
  return `https://play.google.com/store/apps/details?id=com.orbitjump.game&referrer=utm_source%3D${host}%26utm_medium%3Dweb_game`;
};
const openStore = () => { try { window.open(webStoreUrl(), '_blank', 'noopener'); } catch {} };

let particleUid = 0;

const PlanetBody = ({ innerRef, isSupernova, glowRef }) => (
  <div className="planet-scale">
    <div className="planet-atmo" />
    <div className="planet-ring planet-ring-back" />
    <div
      ref={innerRef}
      className="planet"
      style={{
        willChange: isSupernova ? 'transform, opacity, filter' : 'auto',
        animation: isSupernova ? 'supernovaBlast 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards' : 'none'
      }}
    >
      <div className="planet-layer p-base" />
      <div className="planet-layer p-noise" />
      <div className="planet-layer p-bands" />
      <div className="planet-layer p-craters" />
      <div className="planet-layer p-land" />
      <div className="planet-layer p-clouds" />
      <div className="planet-layer p-ice" />
      <div className="planet-layer p-lava" />
      <div className="planet-layer p-storm" />
      <div className="planet-layer p-facets" />
      <div className="planet-layer p-dunes" />
      <div className="planet-layer p-spots" />
      <div className="planet-layer p-terminator" />
      <div className="planet-layer p-spec" />
      <div className="planet-layer p-shine" />
      <div className="planet-layer p-rim" />
    </div>
    {glowRef && <div ref={glowRef} className="impact-glow" />}
    {isSupernova && (
      <>
        <div className="supernova-ring ring-a" />
        <div className="supernova-ring ring-b" />
      </>
    )}
    <div className="planet-ring planet-ring-front" />
  </div>
);

function App() {
  const [lang, setLang] = useState(localStorage.getItem('orbitJumpLang') || 'en');
  const [gameState, setGameState] = useState('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState('normal');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('orbit_highscore') || '0', 10));

  const [soundOn, setSoundOn] = useState(() => {
    const saved = localStorage.getItem('orbit_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Hafif grafik modu: zayıf telefonlarda ağır efektleri (yüzey animasyonları,
  // karışım modları, büyük gölgeler) kapatır. Kullanıcı seçmediyse cihaz
  // bellek/çekirdek sayısına göre başlar, oyunda kare süreleri ölçülerek
  // gerekirse kendiliğinden açılır.
  // Oyun dünyası 400x860 (CSS px) için tasarlandı; ekran buna göre ölçeklenir
  const calcWorldScale = () => Math.min(1.3, Math.max(0.68, Math.min(window.innerHeight / 860, window.innerWidth / 400)));
  const [worldScale, setWorldScale] = useState(calcWorldScale);
  useEffect(() => {
    const onResize = () => setWorldScale(calcWorldScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [liteMode, setLiteMode] = useState(() => {
    try {
      const saved = localStorage.getItem('orbit_lite');
      if (saved !== null) return saved === '1';
    } catch {}
    return (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
  });
  const liteRef = useRef(liteMode);
  const perfSampleRef = useRef({ frames: 0, slow: 0, done: false });
  useEffect(() => {
    liteRef.current = liteMode;
    document.documentElement.classList.toggle('lite', liteMode);
  }, [liteMode]);
  const toggleLite = () => {
    const next = !liteMode;
    setLiteMode(next);
    perfSampleRef.current.done = true;
    try { localStorage.setItem('orbit_lite', next ? '1' : '0'); localStorage.setItem('orbit_lite_manual', '1'); } catch {}
    playSound('click', soundOn);
  };
  const rootRef = useRef(null);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('orbit_player_name') || "");
  const [showNameModal, setShowNameModal] = useState(() => !localStorage.getItem('orbit_player_name'));
  const [nameInput, setNameInput] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [onlineLeaderboard, setOnlineLeaderboard] = useState([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [scoresFailed, setScoresFailed] = useState(false);

  const toggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    localStorage.setItem('orbit_sound', JSON.stringify(nextVal));
    playSound('click', nextVal);
  };

  const currentThemeIdxRef = useRef(0);
  const nextThemeIdxRef = useRef(1);

  const [popup, setPopup] = useState(null);

  const [crystals, setCrystals] = useState(() => loadJSON('orbit_crystals', 60));
  const [runCrystals, setRunCrystals] = useState(0);
  const [ownedItems, setOwnedItems] = useState(() => loadJSON('orbit_owned_items', ['astronaut', 'trail_gold', 'bg_nebula']));
  const [ballLevels, setBallLevels] = useState(() => loadJSON('orbit_ball_levels', { gold: 1, ruby: 1, emerald: 1, nova: 1 }));
  const [boostCounts, setBoostCounts] = useState(() => loadJSON('orbit_boost_counts_v2', { shield: 0, slowmo: 0 }));
  const [boostLevels, setBoostLevels] = useState(() => loadJSON('orbit_boost_levels_v2', { shield: 1, slowmo: 1 }));

  const [selectedSkin, setSelectedSkin] = useState(() => loadJSON('orbit_selected_skin', 'astronaut'));
  const [selectedTrail, setSelectedTrail] = useState(() => loadJSON('orbit_selected_trail', 'trail_gold'));
  const [selectedTheme, setSelectedTheme] = useState(() => loadJSON('orbit_selected_theme', 'bg_nebula'));
  const [shopTab, setShopTab] = useState('balls');
  const [shopMessage, setShopMessage] = useState(null);
  const [upgradedBallId, setUpgradedBallId] = useState(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [adOverlay, setAdOverlay] = useState(false);
  const [reviveUsed, setReviveUsed] = useState(false);
  const [leavingGameOver, setLeavingGameOver] = useState(false);

  const [dailyAdCount, setDailyAdCount] = useState(loadDailyAdCount);
  const planetTimerRef = useRef(1);
  const [supernovaActive, setSupernovaActive] = useState(false);

  const [stats, setStats] = useState(() => loadJSON('orbit_stats', { totalPerfects: 0, gamesPlayed: 0, bestRun: 0, maxCombo: 0, totalCrystalsEarned: 0, bestRunPerfects: 0 }));
  const [claimedMissions, setClaimedMissions] = useState(() => loadJSON('orbit_claimed_missions', []));
  const [claimedBadges, setClaimedBadges] = useState(() => loadJSON('orbit_claimed_badges', []));
  const [leaderboard, setLeaderboard] = useState(() => loadJSON('orbit_leaderboard', []));
  const [streakDays, setStreakDays] = useState(() => loadJSON('orbit_streak_days', 1));
  const [lastStreakDate, setLastStreakDate] = useState(() => localStorage.getItem('orbit_last_streak') || '');
  const [dailyStats, setDailyStats] = useState(loadDailyStats);
  const [lbTab, setLbTab] = useState('weekly');
  // Oyun mantığındaki rastgelelik: günlük meydan okumada tarihle tohumlanır,
  // diğer modlarda Math.random.
  const rngRef = useRef(Math.random);
  const runSeedRef = useRef('');
  const lookRngRef = useRef(Math.random);
  // Tur başındaki rekor: oyun sırasında highScore güncellendiği için "rekora
  // N kaldı" ve "yeni rekor" bu değere göre hesaplanır.
  const runStartBestRef = useRef(0);
  const recordShownRef = useRef(false);
  const [recordFlash, setRecordFlash] = useState(false);
  const [xp, setXp] = useState(() => loadJSON('orbit_xp', 0));
  const [lastRun, setLastRun] = useState(null);
  const [challenge, setChallenge] = useState(() => (isWeb && typeof location !== 'undefined' ? parseChallenge(new URLSearchParams(location.search)) : null));
  const [activeChallenge, setActiveChallenge] = useState(null);

  const comebackMessages = (best) => {
    const tr = translations[lang];
    return [
      { title: tr.comeback1Title, body: best > 0 ? tr.comeback1Body.replace('{n}', String(best)) : tr.comeback1BodyNew },
      { title: tr.comeback2Title, body: tr.comeback2Body },
    ];
  };

  // Gün içinde açık kalan uygulamada gece yarısı geçtiyse sayaçlar yenilenir
  const bumpDaily = (update) => {
    setDailyStats((prev) => {
      const base = prev.id === localDayId() ? prev : emptyDailyStats(localDayId());
      const next = { ...base, ...update(base) };
      saveJSON('orbit_daily_stats', next);
      return next;
    });
  };

  const [authUser, setAuthUser] = useState(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [authError, setAuthError] = useState(false);

  const progress = {
    crystals, highScore, ownedItems, ballLevels, boostCounts, boostLevels,
    selectedSkin, selectedTrail, selectedTheme, stats, claimedMissions, claimedBadges,
    streakDays, lastStreakDate, playerName, xp
  };
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; });
  const progressKey = JSON.stringify(progress);

  const applyProgress = (raw) => {
    const p = migrateSkins(raw);
    setCrystals(p.crystals); saveJSON('orbit_crystals', p.crystals);
    setHighScore(p.highScore); localStorage.setItem('orbit_highscore', String(p.highScore));
    setOwnedItems(p.ownedItems); saveJSON('orbit_owned_items', p.ownedItems);
    setBallLevels(p.ballLevels); saveJSON('orbit_ball_levels', p.ballLevels);
    setBoostCounts(p.boostCounts); saveJSON('orbit_boost_counts_v2', p.boostCounts);
    setBoostLevels(p.boostLevels); saveJSON('orbit_boost_levels_v2', p.boostLevels);
    setSelectedSkin(p.selectedSkin); saveJSON('orbit_selected_skin', p.selectedSkin);
    setSelectedTrail(p.selectedTrail); saveJSON('orbit_selected_trail', p.selectedTrail);
    setSelectedTheme(p.selectedTheme); saveJSON('orbit_selected_theme', p.selectedTheme);
    setStats(p.stats); saveJSON('orbit_stats', p.stats);
    setClaimedMissions(p.claimedMissions); saveJSON('orbit_claimed_missions', p.claimedMissions);
    setClaimedBadges(p.claimedBadges); saveJSON('orbit_claimed_badges', p.claimedBadges);
    setStreakDays(p.streakDays); saveJSON('orbit_streak_days', p.streakDays);
    setLastStreakDate(p.lastStreakDate); localStorage.setItem('orbit_last_streak', p.lastStreakDate || '');
    setXp(p.xp || 0); saveJSON('orbit_xp', p.xp || 0);
    if (p.playerName) {
      setPlayerName(p.playerName); localStorage.setItem('orbit_player_name', p.playerName);
      setShowNameModal(false);
    }
  };

  const [comboCount, setComboCount] = useState(0);
  const slowMoUntilRef = useRef(0);

  const physicsRef = useRef({ active: { x: 0, y: 0 }, target: { x: 80, y: -440, vx: 2.0 }, ball: { x: 120, y: 0, vx: 0, vy: 0 }, angle: 0, isFlying: false, speed: 0.02, combo: 0, dead: false, camera: { x: 0, y: 200 } });
  // ?autoplay=N (yalnız geliştirme): N = iniş sapma toleransı; tanıtım kaydı için.
  const autoplayRef = useRef(import.meta.env.DEV ? Number(new URLSearchParams(window.location.search).get('autoplay')) || 0 : 0);
  useEffect(() => { if (import.meta.env.DEV) { window.__orbitAutoplay = autoplayRef; window.__orbitPhys = physicsRef; } }, []);

  const cameraRef = useRef(null);
  const activeGroupRef = useRef(null);
  const targetGroupRef = useRef(null);
  const ballRef = useRef(null);
  const ballInnerRef = useRef(null);
  const activePlanetRef = useRef(null);
  const impactGlowRef = useRef(null);

  const TRAIL_POOL_SIZE = 16;
  const TRAIL_LIFE = 280;          // iz ömrü (ms) — kısa ve hareketli
  const PARTICLE_POOL_SIZE = 50;
  // Sabit boyutlu "ring buffer" — her karede spread/filter ile yeni dizi
  // oluşturmak yerine mevcut slotlar üzerine yazılır (GC baskısı = FPS düşüşünün
  // asıl kaynaklarından biriydi).
  const trailPointsRef = useRef(new Array(TRAIL_POOL_SIZE).fill(null));
  const trailCursorRef = useRef(0);
  const trailDotRefs = useRef([]);
  const particlesRef = useRef(new Array(PARTICLE_POOL_SIZE).fill(null));
  const particleCursorRef = useRef(0);
  const particleDotRefs = useRef([]);
  const shakeUntilRef = useRef(0);
  const flashRef = useRef(null);

  const liveRef = useRef({
    score, highScore, runCrystals, shieldActive, gameMode,
    ballLevels, selectedSkin, soundOn,
    trailColor: (shopItems.find((s) => s.id === selectedTrail) || {}).color || '#67e8f9',
    trailShape: (shopItems.find((s) => s.id === selectedTrail) || {}).shape || 'dust'
  });
  useEffect(() => {
    liveRef.current = {
      score, highScore, runCrystals, shieldActive, gameMode,
      ballLevels, selectedSkin, soundOn,
      trailColor: (shopItems.find((s) => s.id === selectedTrail) || {}).color || '#67e8f9',
      trailShape: (shopItems.find((s) => s.id === selectedTrail) || {}).shape || 'dust'
    };
  });

  const resetPlanetVisual = () => {
    if (activePlanetRef.current) {
      activePlanetRef.current.style.transform = 'scale(1)';
      activePlanetRef.current.style.filter = 'none';
      activePlanetRef.current.style.animation = 'none';
    }
  };

  const t = translations[lang];

  useEffect(() => {
    const initAppConfig = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.hide();
      } catch {}
    };
    initAppConfig();
  }, []);

  useEffect(() => {
    let sesKontrol;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        stopAmbientSpaceSound();
        if (gameState === 'playing') setIsPaused(true);
      } else {
        if (gameState === 'playing' && soundOn && !adOverlay && !isPaused) startAmbientSpaceSound(true, currentThemeIdxRef.current);
      }
    }).then((handle) => { sesKontrol = handle; });
    return () => sesKontrol?.remove();
  }, [gameState, soundOn, adOverlay, isPaused]);

  useEffect(() => {
    const initAdMob = async () => {
      if (isWeb) return;
      try {
        let consentInfo = await AdMob.requestConsentInfo();
        if (consentInfo.status === AdmobConsentStatus.REQUIRED && consentInfo.isConsentFormAvailable) {
          consentInfo = await AdMob.showConsentForm();
        }
        // AB kullanıcılarına rızayı sonradan değiştirebilecekleri bir giriş noktası gösterilmeli.
        setPrivacyOptionsRequired(consentInfo.privacyOptionsRequirementStatus === 'REQUIRED');
      } catch {}

      try {
        // Geliştiricinin telefonu (Galaxy S24+) test cihazı: orada yalnız test
        // reklamı çıkar, kendi reklamına tıklama riski olmaz. Diğer cihazlar etkilenmez.
        // Hedef kitle 13+; reklam derecesi oyunun içerik derecelendirmesini aşmasın
        // (Play "reklam içeriği derecelendirmeyle tutarsız" reddi, 24 Eki 2026).
        await AdMob.initialize({
          initializeForTesting: true,
          testingDevices: ['357057D2EFB25D17A16CB635B8A9CB39'],
          maxAdContentRating: MaxAdContentRating.ParentalGuidance,
        });
      } catch {}
    };
    initAdMob();
  }, []);

  useEffect(() => {
    if (!isWeb) checkForUpdate(() => setUpdateReady(true));
  }, []);

  // Google ile girişte bulut kaydını yerel ilerlemeyle birleştir. Birleştirme
  // bitmeden (cloudReady) yükleme yapılmaz, yoksa boş cihaz buluttaki kaydı ezerdi.
  const applyProgressRef = useRef(applyProgress);
  useEffect(() => { applyProgressRef.current = applyProgress; });
  const syncWithCloud = useCallback(async (user) => {
    setAuthUser(user);
    setCloudReady(false);
    if (!isGoogleUser(user)) return;
    try {
      const merged = mergeProgress(progressRef.current, await loadCloudSave(user.uid));
      applyProgressRef.current(merged);
      await writeCloudSave(user.uid, merged);
      setCloudReady(true);
    } catch (e) {
      console.error('Bulut kaydı yüklenemedi: ', e);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, syncWithCloud), [syncWithCloud]);

  // Oyun sırasında buluta yazılmaz (her inişte stats değişip ağ isteği oyunu
  // kasıyordu); tur bitince/menüde kaydedilir.
  useEffect(() => {
    if (!cloudReady || !isGoogleUser(authUser) || gameState === 'playing') return;
    const timer = setTimeout(() => {
      writeCloudSave(authUser.uid, JSON.parse(progressKey)).catch((e) => console.error('Bulut kaydı yazılamadı: ', e));
    }, 2000);
    return () => clearTimeout(timer);
  }, [progressKey, cloudReady, authUser, gameState]);

  const handleGoogleSignIn = async () => {
    if (authBusy) return;
    playSound('click', soundOn);
    setAuthBusy(true); setAuthError(false);
    try {
      await syncWithCloud(await signInWithGoogle());
    } catch (e) {
      console.error('Google girişi başarısız: ', e);
      setAuthError(true);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    playSound('click', soundOn);
    try { await signOutGoogle(); } catch {}
  };

  const handleDeleteAccount = async () => {
    playSound('click', soundOn);
    if (authBusy || !window.confirm(t.deleteConfirm)) return;
    setAuthBusy(true);
    try {
      await deleteAccount();
    } catch (e) {
      console.error('Hesap silinemedi: ', e);
      window.alert(t.deleteFailed);
    } finally {
      setAuthBusy(false);
    }
  };

  // Meydan okuma bağlantısıyla açılış: orbitjump://c?s=..&n=..&m=..
  useEffect(() => {
    if (isWeb) return;
    const handle = (url) => {
      if (!url) return;
      try {
        const c = parseChallenge(new URL(url).searchParams);
        if (c) { setChallenge(c); setGameState((prev) => (prev === 'playing' ? prev : 'menu')); track('challenge_open'); }
      } catch {}
    };
    CapacitorApp.getLaunchUrl().then((r) => handle(r?.url)).catch(() => {});
    let listener;
    CapacitorApp.addListener('appUrlOpen', (e) => handle(e.url)).then((h) => { listener = h; });
    return () => listener?.remove();
  }, []);

  useEffect(() => {
    let listener;
    CapacitorApp.addListener('backButton', () => {
      setGameState((prev) => {
        if (prev === 'menu') { CapacitorApp.exitApp(); return prev; }
        setIsPaused(false); playSound('click', soundOn); return 'menu';
      });
    }).then((handle) => { listener = handle; });
    return () => listener?.remove();
  }, [soundOn]);

  useEffect(() => {
    if (gameState === 'playing' && soundOn && !adOverlay && !isPaused) startAmbientSpaceSound(true, currentThemeIdxRef.current);
    else stopAmbientSpaceSound();
    return () => stopAmbientSpaceSound();
  }, [gameState, soundOn, adOverlay, isPaused]);

  useEffect(() => {
    if (gameState === 'playing' && soundOn && !adOverlay && !isPaused) updateAmbientSound(currentThemeIdxRef.current);
  }, [gameState, soundOn, adOverlay, isPaused]);

  // Oyun ekranı DOM'a girdiğinde gezegen temalarını uygula
  useEffect(() => {
    if (gameState !== 'playing') return;
    applyPlanetTheme(activeGroupRef.current, planetThemes[currentThemeIdxRef.current]);
    applyPlanetTheme(targetGroupRef.current, planetThemes[nextThemeIdxRef.current]);
  }, [gameState]);

  // countsTowardLimit: kristal reklamı günlük sınıra sayılır; "izle & devam et"
  // sayılmaz, o tur başına bir hakla sınırlı.
  const watchRewardedAd = async (onSuccess, countsTowardLimit = true) => {
    // Hata düzeltmesi: adOverlay zaten açıkken çift dokunuşla ikinci kez
    // tetiklenip AdMob listener'larının çakışmasını engeller.
    if ((countsTowardLimit && dailyAdCount >= 2) || adOverlay) return;
    playSound('click', soundOn); setAdOverlay(true);
    try {
      await AdMob.removeAllListeners();
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        if (countsTowardLimit) {
          const today = new Date().toDateString();
          setDailyAdCount(prev => {
            const nextCount = prev + 1;
            localStorage.setItem('orbit_daily_ad_count', nextCount.toString());
            return nextCount;
          });
          localStorage.setItem('orbit_last_ad_date', today);
        }
        if (onSuccess) onSuccess();
      });
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => setAdOverlay(false));
      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => setAdOverlay(false));
      await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-1803044471635660/5387368632', isTesting: false });
      await AdMob.showRewardVideoAd();
    } catch { setAdOverlay(false); }
  };

  const spawnParticles = (x, y, kind, themeColors) => {
    const isSupernova = kind === 'supernova';
    const isPerfect = kind === 'perfect';
    const isGreat = kind === 'great';
    const colors = isSupernova
      ? (themeColors && themeColors.length ? themeColors : ['#fde047', '#fb923c', '#ffffff'])
      : isPerfect ? ['#fde047', '#fbbf24', '#ffffff', '#fff7d6'] : isGreat ? ['#67e8f9', '#22d3ee', '#ffffff'] : ['#67e8f9', '#0ea5e9'];
    const fullCount = isSupernova ? 46 : isPerfect ? 22 : isGreat ? 12 : 7;
    const lite = liteRef.current;
    const count = lite ? Math.ceil(fullCount / 2) : fullCount;
    const now = performance.now();

    for (let n = 0; n < count; n++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isSupernova ? 3 + Math.random() * 10 : isPerfect ? 2.8 + Math.random() * 6 : 2 + Math.random() * 4;
      const life = isSupernova ? 500 + Math.random() * 500 : isPerfect ? 650 : 550;
      const size = isSupernova ? 2 + Math.random() * 7 : isPerfect ? 3.5 + Math.random() * 5.5 : 3 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      const idx = particleCursorRef.current;
      particlesRef.current[idx] = { id: particleUid++, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, born: now, life, color, size };
      particleCursorRef.current = (idx + 1) % PARTICLE_POOL_SIZE;

      const dot = particleDotRefs.current[idx];
      if (dot) {
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.background = color;
        dot.style.boxShadow = lite ? 'none' : `0 0 ${isSupernova ? 10 : 6}px ${color}`;
      }
    }
  };

  // YENİ VE GÜVENLİ autoSaveScore FONKSİYONU
  const autoSaveScore = useCallback(async (finalScore) => {
    if (finalScore <= 0) return;
    
    // Yerel cihazdaki tabloyu güncelle
    const newEntry = { name: playerName || "ORB", score: finalScore };
    setLeaderboard((prev) => {
      const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
      saveJSON('orbit_leaderboard', updated);
      return updated;
    });

    // Cihazdaki mevcut en yüksek skoru çek
    const savedHighScore = parseInt(localStorage.getItem('orbit_highscore') || '0', 10);
    
    if (!playerName) return;
    const mode = liveRef.current.gameMode;
    try {
      // Google ile girildiyse o hesabı, yoksa anonim oturumu kullan
      const uid = (await ensureSignedIn()).uid;

      // Genel tabloya yalnızca yeni skor cihazdaki rekoru geçerse veya eşitse yazılır
      if (finalScore >= savedHighScore) {
        // İsim çevrimdışı seçildiyse burada ayrılır; başkasınınsa yeni isim istenir.
        try {
          await claimPlayerName(playerName);
        } catch (e) {
          if (e?.message === 'name-taken') {
            setNameInput(playerName); setNameError(true); setShowNameModal(true);
            return;
          }
          throw e;
        }

        // addDoc yerine setDoc kullanarak oyuncunun UID'si ile belge oluştur/güncelle
        await setDoc(doc(db, "leaderboard", uid), {
          name: playerName,
          score: finalScore,
          uid: uid,
          date: serverTimestamp()
        });
      }

      // Haftalık ve günlük tablolar kendi dönem rekoruna göre ayrıca güncellenir
      await submitPeriodScore('weekly', utcWeekId(), uid, playerName, finalScore);
      if (mode === 'daily') await submitPeriodScore('daily', utcDayId(), uid, playerName, finalScore);
    } catch (e) {
      console.error("Firebase kayıt veya yetkilendirme hatası: ", e);
    }
  }, [playerName]);

  const fetchOnlineScores = async (tab = lbTab) => {
    setLbTab(tab);
    setIsLoadingScores(true);
    setScoresFailed(false);
    setOnlineLeaderboard([]);
    track('leaderboard_open', { tab });
    try {
      if (tab === 'weekly') { setOnlineLeaderboard(await fetchPeriodScores('weekly', utcWeekId())); return; }
      if (tab === 'daily') { setOnlineLeaderboard(await fetchPeriodScores('daily', utcDayId())); return; }
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const scores = [];
      querySnapshot.forEach((docSnap) => {
        scores.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOnlineLeaderboard(scores);
    } catch {
      setScoresFailed(true);
    } finally {
      setIsLoadingScores(false);
    }
  };

  // Oyun döngüsü efekti yeniden kurulmadan güncel sürümü çağırsın diye ref üzerinden
  const finalizeRunStatsRef = useRef(null);
  const finalizeRunStats = (finalScore, finalCrystals) => {
    // Oyun döngüsünden çağrıldığı için state yerine her render güncellenen ref okunur
    const prevStats = progressRef.current.stats;
    const mode = liveRef.current.gameMode;
    noteGameFinished();
    maybeRequestReview(prevStats.gamesPlayed + 1, prevStats.bestRun > 0 && finalScore > prevStats.bestRun);
    track('game_end', { mode, score: finalScore, games_played: prevStats.gamesPlayed + 1 });
    bumpDaily((d) => ({
      games: d.games + 1,
      bestScore: Math.max(d.bestScore, finalScore),
      crystals: d.crystals + finalCrystals,
      daily: d.daily + (mode === 'daily' ? 1 : 0),
    }));
    // Birkaç tur oynayan oyuncuya bildirim izni sorulur (hatırlatmalar için)
    if (prevStats.gamesPlayed + 1 === 3) {
      const tr = translations[lang];
      scheduleStreakReminder({
        claimedToday: progressRef.current.lastStreakDate === new Date().toDateString(),
        streakDays: progressRef.current.streakDays + 1,
        title: tr.streakReminderTitle, body: tr.streakReminderBody, askPermission: true,
      }).then(() => scheduleComebackReminders(comebackMessages(Math.max(progressRef.current.highScore, finalScore))));
    } else {
      scheduleComebackReminders(comebackMessages(Math.max(progressRef.current.highScore, finalScore)));
    }
    setStats((s) => {
      const next = { ...s, gamesPlayed: s.gamesPlayed + 1, bestRun: Math.max(s.bestRun, finalScore), tempRunPerfects: 0 };
      saveJSON('orbit_stats', next);
      return next;
    });
    // XP: puan + Mükemmel inişler + katılım; seviye atlanan her seviye için ödül
    const prevXp = progressRef.current.xp || 0;
    const xpGain = 5 + finalScore + (prevStats.tempRunPerfects || 0) * 2;
    const before = levelInfo(prevXp).level;
    const after = levelInfo(prevXp + xpGain).level;
    let levelCrystals = 0;
    for (let lv = before + 1; lv <= after; lv++) levelCrystals += levelReward(lv);
    setXp(prevXp + xpGain); saveJSON('orbit_xp', prevXp + xpGain);
    if (after > before) { track('level_up', { level: after }); playSound('perfect', liveRef.current.soundOn); }
    setLastRun({ startBest: runStartBestRef.current, xpGain, levelUp: after > before ? after : 0, levelCrystals });
    setCrystals((c) => {
      const next = c + finalCrystals + levelCrystals;
      saveJSON('orbit_crystals', next);
      return next;
    });
  };
  useEffect(() => { finalizeRunStatsRef.current = finalizeRunStats; });

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    if (gameState === 'playing' && !adOverlay && !isPaused) {
      const render = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        if (deltaTime < 0.1) {
          // İlk ~4 saniyede karelerin %30'undan fazlası 22 ms'yi aşarsa
          // (45 fps altı) hafif moda geçilir; kullanıcı elle seçtiyse dokunulmaz.
          const perf = perfSampleRef.current;
          if (!perf.done && !liteRef.current) {
            perf.frames += 1;
            if (deltaTime > 0.022) perf.slow += 1;
            if (perf.frames >= 240) {
              perf.done = true;
              let manual = false;
              try { manual = localStorage.getItem('orbit_lite_manual') === '1'; } catch {}
              if (!manual && perf.slow / perf.frames > 0.3) {
                setLiteMode(true);
                try { localStorage.setItem('orbit_lite', '1'); } catch {}
              }
            }
          }

          const p = physicsRef.current;
          const live = liveRef.current;

          if (p.dead) { animationFrameId = requestAnimationFrame(render); return; }

          const tier = getTier(live.score);
          const tierLevel = tiers.indexOf(tier);
          let tierSpeedMul = 1 + tierLevel * 0.12;
          if (live.gameMode === 'fast') tierSpeedMul *= 1.45;

          const slowMoFactor = currentTime < slowMoUntilRef.current ? 0.28 : 1;
          const effDelta = deltaTime * slowMoFactor;

          p.target.x += p.target.vx * (effDelta * 60) * tierSpeedMul;
          const maxBoundX = 130;
          if (p.target.x > p.active.x + maxBoundX) {
            p.target.x = p.active.x + maxBoundX;
            p.target.vx = -Math.abs(p.target.vx);
          } else if (p.target.x < p.active.x - maxBoundX) {
            p.target.x = p.active.x - maxBoundX;
            p.target.vx = Math.abs(p.target.vx);
          }

          // Yalnız geliştirmede (?autoplay=1): tanıtım videosu kaydı için düz uçuşu
          // ileriye simüle edip mükemmel inişe denk gelen anda zıplar.
          if (import.meta.env.DEV && autoplayRef.current && !p.isFlying) {
            const vx = Math.cos(p.angle) * 14, vy = Math.sin(p.angle) * 14;
            let tx = p.target.x, tvx = p.target.vx * tierSpeedMul;
            for (let k = 1; k < 90; k++) {
              tx += tvx;
              if (tx > p.active.x + 130) { tx = p.active.x + 130; tvx = -Math.abs(tvx); }
              else if (tx < p.active.x - 130) { tx = p.active.x - 130; tvx = Math.abs(tvx); }
              const d = Math.hypot(p.ball.x + vx * k - tx, p.ball.y + vy * k - p.target.y);
              if (d < 140) {
                if (d > 100 && Math.abs(d - 120) < autoplayRef.current) { p.isFlying = true; p.ball.vx = vx; p.ball.vy = vy; }
                break;
              }
            }
          }

          if (!p.isFlying) {
            if (live.gameMode !== 'zen') {
              const timerMultiplier = live.gameMode === 'supernova' ? 0.2 : 0.1;
              planetTimerRef.current = Math.max(0, planetTimerRef.current - effDelta * timerMultiplier);

              if (activePlanetRef.current) {
                const timerNow = planetTimerRef.current;
                const isDanger = timerNow < 0.3;
                activePlanetRef.current.style.transform = `scale(${0.85 + timerNow * 0.15})`;
                activePlanetRef.current.style.filter = isDanger ? 'brightness(1.5) saturate(1.7) hue-rotate(-18deg)' : 'none';
                activePlanetRef.current.style.animation = isDanger ? 'supernovaBuildUp 0.4s ease-in-out infinite' : 'none';
              }

              if (planetTimerRef.current <= 0) {
                p.dead = true; playSound('supernova', live.soundOn); vibrate([60, 80, 60, 100]);
                const theme = planetThemes[currentThemeIdxRef.current];
                setSupernovaActive(true);
                shakeUntilRef.current = currentTime + 420;
                if (flashRef.current) {
                  flashRef.current.style.transition = 'none';
                  flashRef.current.style.opacity = '1';
                  requestAnimationFrame(() => {
                    if (flashRef.current) {
                      flashRef.current.style.transition = 'opacity 0.6s ease-out';
                      flashRef.current.style.opacity = '0';
                    }
                  });
                }
                spawnParticles(p.active.x, p.active.y, 'supernova', [theme.light, theme.mid, '#ffffff']);
                autoSaveScore(live.score);
                setTimeout(() => {
                  setSupernovaActive(false); setGameState('gameover');
                  finalizeRunStatsRef.current(live.score, live.runCrystals);
                }, 850);
              }
            }

            p.angle += p.speed * (effDelta * 60) * tierSpeedMul;
            p.ball.x = p.active.x + Math.cos(p.angle) * 120;
            p.ball.y = p.active.y + Math.sin(p.angle) * 120;
          } else {
            p.ball.x += p.ball.vx * (effDelta * 60);
            p.ball.y += p.ball.vy * (effDelta * 60);

            // Kısa ömürlü hareket izi — sabit slotlu ring buffer'a yazılır.
            // Renk doğrudan seçili iz türünden gelir (top rengiyle karıştırılmaz,
            // rastgele sapma yok) — böylece farklı iz türleri net ayrışır.
            // Şekil de iz türüne göre değişir: toz (dust) dağınık taneli,
            // alev (flame) uzayan/titreyen, plazma (plasma) geniş yumuşak şerit.
            {
              const trailColor = live.trailColor;
              const shape = live.trailShape;
              let jx = 0, jy = 0;
              if (shape === 'dust') {
                const perpAngle = Math.atan2(p.ball.vy, p.ball.vx) + Math.PI / 2;
                const spread = (Math.random() - 0.5) * 16;
                jx = Math.cos(perpAngle) * spread;
                jy = Math.sin(perpAngle) * spread;
              }
              const tIdx = trailCursorRef.current;
              trailPointsRef.current[tIdx] = { x: p.ball.x + jx, y: p.ball.y + jy, born: currentTime, color: trailColor, shape };
              trailCursorRef.current = (tIdx + 1) % TRAIL_POOL_SIZE;
              const tDot = trailDotRefs.current[tIdx];
              // Sınıf/arka plan yalnızca iz türü değişince yazılır; her karede
              // yazmak gereksiz stil yeniden hesaplamasına yol açıyordu.
              if (tDot && tDot.dataset.look !== shape + trailColor) {
                tDot.dataset.look = shape + trailColor;
                tDot.className = `trail-dot trail-${shape} z-[24]`;
                tDot.style.background = `radial-gradient(circle, rgba(255,255,255,0.85) 0%, ${trailColor} 38%, transparent 72%)`;
              }
            }

            const dx = p.ball.x - p.target.x;
            const dy = p.ball.y - p.target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const currentBallLvl = live.ballLevels[live.selectedSkin] || 1;
            const perfectTolerance = 5 + (currentBallLvl - 1) * 1.5;
            const greatTolerance = 12 + (currentBallLvl - 1) * 2;

            if (distance < 140 && distance > 100) {
              p.isFlying = false; planetTimerRef.current = 1; resetPlanetVisual();

              const shiftX = p.target.x;
              const shiftY = p.target.y;

              const deviation = Math.abs(distance - 120);
              let kind = 'normal', gain = 1;
              if (deviation < perfectTolerance) { kind = 'perfect'; gain = 3; }
              else if (deviation < greatTolerance) { kind = 'great'; gain = 2; }

              p.combo = (kind === 'perfect' || kind === 'great') ? p.combo + 1 : 0;
              setComboCount(p.combo);

              let comboBonus = 0;
              if (p.combo > 0 && p.combo % 5 === 0) {
                comboBonus = 5; playSound('combo', live.soundOn, p.combo); vibrate([25, 40, 25]);
              }

              p.active.x = shiftX; p.active.y = shiftY;
              // Tüm ekranı ölçekleyen nabız React render'ı tetiklemeden DOM'da
              // yapılır; hafif modda tamamen atlanır.
              if (rootRef.current && !liteRef.current) {
                const rootEl = rootRef.current;
                rootEl.style.transform = 'scale(1.04)';
                setTimeout(() => { rootEl.style.transform = ''; }, 120);
              }

              if (kind === 'perfect') slowMoUntilRef.current = currentTime + 160;

              if (impactGlowRef.current && kind !== 'normal') {
                const glowRgb = kind === 'perfect' ? '253,224,71' : '34,211,238';
                const glowEl = impactGlowRef.current;
                glowEl.style.transition = 'none';
                glowEl.style.background = `radial-gradient(circle, rgba(${glowRgb},0.95) 0%, rgba(${glowRgb},0.3) 42%, transparent 74%)`;
                glowEl.style.opacity = '1';
                requestAnimationFrame(() => {
                  glowEl.style.transition = 'opacity 0.5s ease-out';
                  glowEl.style.opacity = '0';
                });
              }

              const popupId = particleUid++;
              let extraText = '';
              const nextScore = live.score + gain + comboBonus;
              const prevMilestone = Math.floor(live.score / 5);
              const nextMilestone = Math.floor(nextScore / 5);

              let awardedCrystals = 0;
              if (nextMilestone > prevMilestone) {
                const baseAward = live.gameMode === 'supernova' ? nextMilestone * 2 : nextMilestone;
                awardedCrystals = baseAward + (currentBallLvl - 1);
                setRunCrystals((r) => r + awardedCrystals); playSound('coin', live.soundOn); vibrate([15, 20, 15]);
                extraText = ` +${awardedCrystals} 💎`;
              }

              setPopup({ text: `+${gain + comboBonus}${extraText}`, kind, id: popupId });
              setTimeout(() => setPopup((cur) => (cur && cur.id === popupId ? null : cur)), 600);

              spawnParticles(shiftX, shiftY, kind);
              setStats((s) => {
                const currentRunPerfects = kind === 'perfect' ? (s.tempRunPerfects || 0) + 1 : (s.tempRunPerfects || 0);
                const next = {
                  ...s,
                  totalPerfects: kind === 'perfect' ? s.totalPerfects + 1 : s.totalPerfects,
                  maxCombo: Math.max(s.maxCombo, p.combo),
                  totalCrystalsEarned: s.totalCrystalsEarned + awardedCrystals,
                  bestRunPerfects: Math.max(s.bestRunPerfects, currentRunPerfects),
                  tempRunPerfects: currentRunPerfects
                };
                return next;
              });
              if (kind === 'perfect' || p.combo > 1) {
                const landedCombo = p.combo;
                bumpDaily((d) => ({ perfects: d.perfects + (kind === 'perfect' ? 1 : 0), maxCombo: Math.max(d.maxCombo, landedCombo) }));
              }

              if (kind === 'perfect') { playSound('perfect', live.soundOn, p.combo); vibrate([15, 25, 15]); }
              else { playSound('score', live.soundOn, p.combo); vibrate(12); }

              // Tur içinde eski rekor geçildiği an bir kez kutlanır
              if (!recordShownRef.current && runStartBestRef.current > 0 && nextScore > runStartBestRef.current) {
                recordShownRef.current = true;
                setRecordFlash(true); vibrate([30, 40, 30, 40, 60]);
                setTimeout(() => setRecordFlash(false), 1600);
                track('record_passed', { best: runStartBestRef.current });
              }

              setScore((prevScore) => {
                const newScore = prevScore + gain + comboBonus;
                setHighScore((prevHigh) => {
                  if (newScore > prevHigh) { localStorage.setItem('orbit_highscore', newScore.toString()); return newScore; }
                  return prevHigh;
                });
                return newScore;
              });

              currentThemeIdxRef.current = nextThemeIdxRef.current;
              nextThemeIdxRef.current = pickPlanetTheme(currentThemeIdxRef.current, lookRngRef.current);
              applyPlanetTheme(activeGroupRef.current, planetThemes[currentThemeIdxRef.current]);
              applyPlanetTheme(targetGroupRef.current, planetThemes[nextThemeIdxRef.current]);

              p.speed = Math.min(0.02 + (live.score * 0.0035), 0.08);

              const rand = rngRef.current;
              const direction = rand() > 0.5 ? 1 : -1;
              const randomSpeed = (1.9 + rand() * 1.8) * (1 + tierLevel * 0.15);
              p.target = { x: shiftX + ((rand() * 220) - 110), y: shiftY - (440 + tierLevel * 20), vx: direction * randomSpeed };
              p.angle = Math.atan2(p.ball.y - p.active.y, p.ball.x - p.active.x);
            }

            const distFromActive = Math.sqrt(Math.pow(p.ball.x - p.active.x, 2) + Math.pow(p.ball.y - p.active.y, 2));
            if (distFromActive > 900) {
              if (live.shieldActive) {
                setShieldActive(false); playSound('shield', live.soundOn); vibrate([50, 50, 50]);
                p.isFlying = false; p.ball.x = p.active.x + 120; p.ball.y = p.active.y; p.angle = 0; planetTimerRef.current = 1; resetPlanetVisual();
              } else {
                p.dead = true; playSound('gameover', live.soundOn); vibrate([40, 60, 40]);
                shakeUntilRef.current = currentTime + 260;
                autoSaveScore(live.score);
                setGameState('gameover');
                finalizeRunStatsRef.current(live.score, live.runCrystals);
              }
            }
          }

          // Parçacıklar sabit slotlu ring buffer üzerinde yerinde güncellenir —
          // her karede yeni dizi (map/filter) oluşturmaz, GC baskısını kaldırır.
          for (let pi = 0; pi < PARTICLE_POOL_SIZE; pi++) {
            const pt = particlesRef.current[pi];
            if (!pt) continue;
            if (currentTime - pt.born >= pt.life) { particlesRef.current[pi] = null; continue; }
            pt.x += pt.vx * (deltaTime * 60);
            pt.y += pt.vy * (deltaTime * 60);
            const drag = Math.pow(0.985, deltaTime * 60);
            pt.vx *= drag; pt.vy *= drag;
          }

          let targetCamX, targetCamY;
          if (p.isFlying) {
            targetCamX = -p.ball.x;
            targetCamY = -p.ball.y + 200;
          } else {
            targetCamX = -p.active.x;
            targetCamY = -p.active.y + 200;
          }

          // Kamera yumuşatması süreye göre ölçeklenir: 120 Hz ekranlarda kare
          // süresi 8–16 ms arasında oynadığında sabit katsayı kamerayı titretiyordu.
          const camLerp = 1 - Math.pow(1 - 0.14, deltaTime * 60);
          p.camera.x += (targetCamX - p.camera.x) * camLerp;
          p.camera.y += (targetCamY - p.camera.y) * camLerp;

          let shakeX = 0, shakeY = 0;
          if (currentTime < shakeUntilRef.current) {
            const shakeFrac = Math.max(0, (shakeUntilRef.current - currentTime) / 420);
            const mag = 10 * shakeFrac;
            shakeX = (Math.random() - 0.5) * mag;
            shakeY = (Math.random() - 0.5) * mag;
          }

          if (cameraRef.current) cameraRef.current.style.transform = `translate(${p.camera.x + shakeX}px, ${p.camera.y + shakeY}px)`;
          if (activeGroupRef.current) activeGroupRef.current.style.transform = `translate(-50%, -50%) translate(${p.active.x}px, ${p.active.y}px)`;
          if (targetGroupRef.current) targetGroupRef.current.style.transform = `translate(-50%, -50%) translate(${p.target.x}px, ${p.target.y}px)`;
          if (ballRef.current) ballRef.current.style.transform = `translate(${-16 + p.ball.x}px, ${-16 + p.ball.y}px)`;

          // Top hareket yönüne dönüp hafifçe uzasın (hız hissi)
          if (ballInnerRef.current) {
            if (p.isFlying) {
              const spd = Math.sqrt(p.ball.vx * p.ball.vx + p.ball.vy * p.ball.vy);
              const dir = Math.atan2(p.ball.vy, p.ball.vx) * (180 / Math.PI);
              const stretch = Math.min(1 + spd * 0.012, 1.2);
              ballInnerRef.current.style.transform = `rotate(${dir}deg) scale(${stretch}, ${1 / stretch})`;
            } else {
              ballInnerRef.current.style.transform = `rotate(${p.angle * (180 / Math.PI)}deg)`;
            }
          }

          const trailDir = Math.atan2(p.ball.vy, p.ball.vx) * (180 / Math.PI);
          for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
            const dot = trailDotRefs.current[i];
            if (!dot) continue;
            const pt = trailPointsRef.current[i];
            if (!pt) { dot.style.opacity = '0'; continue; }
            const age = currentTime - pt.born;
            if (age >= TRAIL_LIFE) { dot.style.opacity = '0'; continue; }
            const frac = 1 - age / TRAIL_LIFE;
            const taper = Math.pow(frac, 1.6);
            if (pt.shape === 'dust') {
              dot.style.opacity = String(0.1 + taper * 0.85);
              const s = 0.3 + taper * 1.2;
              dot.style.transform = `translate(${-7 + pt.x}px, ${-7 + pt.y}px) scale(${s})`;
            } else {
              dot.style.opacity = String(0.15 + taper * 0.8);
              const sx = 0.3 + taper * 1.5;
              const sy = 0.4 + taper * 1.0;
              const baseW = pt.shape === 'plasma' ? 46 : 34;
              const halfH = pt.shape === 'plasma' ? 6 : 7;
              dot.style.transform = `translate(${pt.x - baseW}px, ${-halfH + pt.y}px) rotate(${trailDir}deg) scale(${sx}, ${sy})`;
            }
          }

          // background/width/height artık doğuşta bir kez set ediliyor (spawnParticles içinde);
          // burada sadece gerçekten her kare değişen transform + opacity güncelleniyor.
          for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const dot = particleDotRefs.current[i];
            if (!dot) continue;
            const pt = particlesRef.current[i];
            if (!pt) { dot.style.opacity = '0'; continue; }
            const frac = Math.max(0, 1 - (currentTime - pt.born) / pt.life);
            dot.style.opacity = String(frac);
            dot.style.transform = `translate(${pt.x - pt.size / 2}px, ${pt.y - pt.size / 2}px) scale(${0.6 + frac * 0.4})`;
          }
        }
        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, adOverlay, isPaused, autoSaveScore]);

  const handleJump = () => {
    if (isPaused || showNameModal) return;
    const p = physicsRef.current;
    if (!p.isFlying && gameState === 'playing' && !adOverlay) {
      p.isFlying = true; playSound('jump', soundOn); vibrate(8);
      p.ball.vx = Math.cos(p.angle) * 14; p.ball.vy = Math.sin(p.angle) * 14;
    }
  };

  // seed verilirse (meydan okuma) aynı harita üretilir; yoksa her tur yeni tohum
  // alır ki tur sonunda "aynı haritada geç" bağlantısı paylaşılabilsin.
  const startGame = (mode = gameMode, seed = null) => {
    playSound('click', soundOn); setIsPaused(false);
    runSeedRef.current = mode === 'daily' ? `daily-${utcDayId()}` : (seed || randomSeed());
    rngRef.current = seededRandom(runSeedRef.current);
    lookRngRef.current = seededRandom(`${runSeedRef.current}-look`);
    if (!seed) setActiveChallenge(null);
    runStartBestRef.current = highScore; recordShownRef.current = false; setRecordFlash(false); setLastRun(null);
    track('game_start', { mode, challenge: seed ? 1 : 0 });
    currentThemeIdxRef.current = Math.floor(lookRngRef.current() * planetThemes.length);
    nextThemeIdxRef.current = pickPlanetTheme(currentThemeIdxRef.current, lookRngRef.current);
    applyPlanetTheme(activeGroupRef.current, planetThemes[currentThemeIdxRef.current]);
    applyPlanetTheme(targetGroupRef.current, planetThemes[nextThemeIdxRef.current]);

    physicsRef.current = { active: { x: 0, y: 0 }, target: { x: 80, y: -440, vx: 2.0 }, ball: { x: 120, y: 0, vx: 0, vy: 0 }, angle: 0, isFlying: false, speed: 0.02, combo: 0, dead: false, camera: { x: 0, y: 200 } };
    trailPointsRef.current = new Array(TRAIL_POOL_SIZE).fill(null);
    trailCursorRef.current = 0;
    particlesRef.current = new Array(PARTICLE_POOL_SIZE).fill(null);
    particleCursorRef.current = 0;
    shakeUntilRef.current = 0;
    if (flashRef.current) flashRef.current.style.opacity = '0';
    setReviveUsed(false);
    setScore(0); setComboCount(0); setRunCrystals(0); setPopup(null); setShieldActive(false); setSupernovaActive(false); planetTimerRef.current = 1; resetPlanetVisual(); slowMoUntilRef.current = 0; setGameState('playing');
  };

  const continueGameWithAd = () => {
    if (reviveUsed) return;
    watchRewardedAd(() => {
      // Ölümde bu turun kristalleri zaten hesaba eklendi; sıfırlanmazsa
      // ikinci ölümde aynı kristaller tekrar eklenirdi.
      track('revive_ad');
      setReviveUsed(true); setRunCrystals(0);
      const p = physicsRef.current; p.dead = false; p.isFlying = false; p.ball.x = p.active.x + 120; p.ball.y = p.active.y; p.angle = 0; planetTimerRef.current = 1; resetPlanetVisual(); setShieldActive(true); setIsPaused(false); setGameState('playing'); playSound('shield', soundOn);
    }, false);
  };

  const exitToMenu = () => {
    if (gameState === 'playing' && !physicsRef.current.dead) {
      physicsRef.current.dead = true;
      autoSaveScore(score);
      finalizeRunStats(score, runCrystals);
    }
    setIsPaused(false);
    setGameState('menu');
  };

  const triggerSlowMo = () => {
    if (isPaused) return;
    const currentCounts = boostCounts.slowmo || 0;
    const duration = 3500 + ((boostLevels.slowmo || 1) - 1) * 800;
    if (currentCounts > 0 && gameState === 'playing' && !adOverlay) {
      const nextCounts = currentCounts - 1;
      setBoostCounts(prev => { const n = { ...prev, slowmo: nextCounts }; saveJSON('orbit_boost_counts_v2', n); return n; });
      slowMoUntilRef.current = performance.now() + duration;
      playSound('perfect', soundOn); vibrate(25);
    } else playSound('gameover', soundOn);
  };

  const activateShield = () => {
    if (isPaused) return;
    const currentCounts = boostCounts.shield || 0;
    if (currentCounts > 0 && !shieldActive && gameState === 'playing' && !adOverlay) {
      const nextCounts = currentCounts - 1;
      setBoostCounts(prev => { const n = { ...prev, shield: nextCounts }; saveJSON('orbit_boost_counts_v2', n); return n; });
      setShieldActive(true); playSound('shield', soundOn); vibrate(25);
    } else playSound('gameover', soundOn);
  };

  const showShopMessage = (msg) => { setShopMessage(msg); setTimeout(() => setShopMessage((cur) => (cur === msg ? null : cur)), 1400); };

  const buyBoostPackage = (boostType) => {
    if (crystals >= 40) {
      const level = boostLevels[boostType] || 1;
      const bonusAmount = 3 + (level - 1);
      const nextCrystals = crystals - 40; const nextCounts = { ...boostCounts, [boostType]: (boostCounts[boostType] || 0) + bonusAmount };
      setCrystals(nextCrystals); setBoostCounts(nextCounts); saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_boost_counts_v2', nextCounts);
      playSound('coin', soundOn); vibrate(15);
    } else { playSound('gameover', soundOn); showShopMessage(t.insufficientCrystals); }
  };

  const upgradeBoost = (boostType) => {
    const currentLvl = boostLevels[boostType] || 1;
    const cost = currentLvl * 30;
    if (crystals >= cost && currentLvl < 5) {
      const nextCrystals = crystals - cost;
      const nextLevels = { ...boostLevels, [boostType]: currentLvl + 1 };
      setCrystals(nextCrystals); setBoostLevels(nextLevels);
      saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_boost_levels_v2', nextLevels);
      playSound('perfect', soundOn); vibrate(25);
    } else { playSound('gameover', soundOn); showShopMessage(t.insufficientCrystals); }
  };

  // Seri kurtarma: tam bir gün kaçırıldıysa (ve seri 2+ gündüyse) son alım dün
  // yapılmış sayılır; ardından normal alım seriyi bir artırır.
  const daysSinceStreak = lastStreakDate ? Math.round((new Date(new Date().toDateString()) - new Date(lastStreakDate)) / 86400000) : null;
  const canSaveStreak = daysSinceStreak === 2 && streakDays >= 2;
  const STREAK_SAVE_COST = 30;
  const saveStreak = (useAd) => {
    if (!canSaveStreak) return;
    const apply = () => {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      setLastStreakDate(yesterday.toDateString()); localStorage.setItem('orbit_last_streak', yesterday.toDateString());
      playSound('shield', soundOn); track('streak_saved', { days: streakDays, by: useAd ? 'ad' : 'crystals' });
    };
    if (useAd) { watchRewardedAd(apply, false); return; }
    if (crystals < STREAK_SAVE_COST) { playSound('click', soundOn); return; }
    const nextCrystals = crystals - STREAK_SAVE_COST;
    setCrystals(nextCrystals); saveJSON('orbit_crystals', nextCrystals);
    apply();
  };

  const claimStreakBonus = () => {
    const today = new Date().toDateString(); if (lastStreakDate === today) return;
    const daysSinceLastClaim = lastStreakDate ? Math.round((new Date(today) - new Date(lastStreakDate)) / 86400000) : null;
    const nextStreak = daysSinceLastClaim === 1 ? streakDays + 1 : 1;
    const reward = nextStreak * 15; const nextCrystals = crystals + reward;
    setCrystals(nextCrystals); setStreakDays(nextStreak); setLastStreakDate(today);
    saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_streak_days', nextStreak); localStorage.setItem('orbit_last_streak', today);
    playSound('coin', soundOn); vibrate(15);
    track('streak_claim', { day: nextStreak });
    // Bildirim izni burada, oyuncu seriyle ilgilendiği anda istenir
    scheduleStreakReminder({ claimedToday: true, streakDays: nextStreak + 1, title: t.streakReminderTitle, body: t.streakReminderBody, askPermission: true });
  };

  useEffect(() => {
    scheduleStreakReminder({
      claimedToday: lastStreakDate === new Date().toDateString(),
      streakDays: streakDays + 1,
      title: translations[lang].streakReminderTitle,
      body: translations[lang].streakReminderBody,
      askPermission: false,
    });
  }, [lang, lastStreakDate, streakDays]);

  // Açılışta geri dönüş bildirimleri ileri alınır (oyuncu geldiyse boşa düşmez)
  useEffect(() => {
    scheduleComebackReminders(comebackMessages(progressRef.current.highScore));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const todayStats = dailyStats.id === localDayId() ? dailyStats : emptyDailyStats(localDayId());
  const dailyMissions = dailyMissionsFor(todayStats.id);
  const lvl = levelInfo(xp);
  // Rozet koşulları için stat'lara seviye, karakter sayısı ve seri eklenir
  const badgeStats = { ...stats, level: lvl.level, skins: ownedItems.filter((id) => (shopItems.find((s) => s.id === id) || {}).type === 'ball').length, streak: streakDays };
  // Açılan rozetler Google Play başarımı olarak da gönderilir
  const unlockedBadgeKey = badgeDefs.filter((b) => b.check(badgeStats)).map((b) => b.id).join(',');
  useEffect(() => {
    if (unlockedBadgeKey) syncAchievements(unlockedBadgeKey.split(','));
  }, [unlockedBadgeKey]);
  const hasClaimableDaily =dailyMissions.some((m) => (todayStats[m.stat] || 0) >= m.target && !todayStats.claimed.includes(m.id));

  const claimDailyMission = (m) => {
    if ((todayStats[m.stat] || 0) < m.target || todayStats.claimed.includes(m.id)) return;
    bumpDaily((d) => ({ claimed: [...d.claimed, m.id] }));
    const nextCrystals = crystals + m.reward;
    setCrystals(nextCrystals); saveJSON('orbit_crystals', nextCrystals);
    playSound('perfect', soundOn); vibrate([10, 15, 10]);
    track('daily_mission_claim', { stat: m.stat, target: m.target });
  };

  const buyShopItem = (item) => {
    if (ownedItems.includes(item.id)) {
      if (item.type === 'ball') { setSelectedSkin(item.id); saveJSON('orbit_selected_skin', item.id); }
      else if (item.type === 'trail') { setSelectedTrail(item.id); saveJSON('orbit_selected_trail', item.id); }
      else if (item.type === 'theme') { setSelectedTheme(item.id); saveJSON('orbit_selected_theme', item.id); }
      playSound('click', soundOn); return;
    }
    if (crystals >= item.price) {
      const nextCrystals = crystals - item.price; const nextOwned = [...ownedItems, item.id];
      setCrystals(nextCrystals); setOwnedItems(nextOwned); saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_owned_items', nextOwned);
      if (item.type === 'ball') { setSelectedSkin(item.id); saveJSON('orbit_selected_skin', item.id); }
      else if (item.type === 'trail') { setSelectedTrail(item.id); saveJSON('orbit_selected_trail', item.id); }
      else if (item.type === 'theme') { setSelectedTheme(item.id); saveJSON('orbit_selected_theme', item.id); }
      playSound('coin', soundOn); vibrate(15);
    } else { playSound('gameover', soundOn); showShopMessage(t.insufficientCrystals); }
  };

  const upgradeBall = (ballId) => {
    const currentLvl = ballLevels[ballId] || 1; const cost = currentLvl * 35;
    if (crystals >= cost && currentLvl < 5) {
      const nextCrystals = crystals - cost; const nextLevels = { ...ballLevels, [ballId]: currentLvl + 1 };
      setCrystals(nextCrystals); setBallLevels(nextLevels); saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_ball_levels', nextLevels);
      setUpgradedBallId(ballId); setTimeout(() => setUpgradedBallId(null), 400); playSound('perfect', soundOn); vibrate(25);
    } else { playSound('gameover', soundOn); showShopMessage(t.insufficientCrystals); }
  };

  const claimMission = (mission, progress) => {
    if (progress < mission.target || claimedMissions.includes(mission.id)) return;
    const nextClaimed = [...claimedMissions, mission.id]; const nextCrystals = crystals + mission.reward;
    setClaimedMissions(nextClaimed); setCrystals(nextCrystals); saveJSON('orbit_claimed_missions', nextClaimed); saveJSON('orbit_crystals', nextCrystals);
    track('mission_claim', { id: mission.id });
    playSound('perfect', soundOn); vibrate([10, 15, 10]);
  };

  const claimBadge = (badge) => {
    const unlocked = badge.check(badgeStats);
    if (!unlocked || claimedBadges.includes(badge.id)) return;
    const nextClaimed = [...claimedBadges, badge.id]; const nextCrystals = crystals + badge.reward;
    setClaimedBadges(nextClaimed); setCrystals(nextCrystals); saveJSON('orbit_claimed_badges', nextClaimed); saveJSON('orbit_crystals', nextCrystals);
    playSound('perfect', soundOn); vibrate([10, 15, 10]);
  };

  const currentBgStyle = backgroundThemesList[selectedTheme] || backgroundThemesList['bg_nebula'];
  const currentAccent = backgroundAccents[selectedTheme] || backgroundAccents['bg_nebula'];
  const tier = getTier(score);
  const isStreakReady = lastStreakDate !== new Date().toDateString();
  const isAdLimitReached = dailyAdCount >= 2;
  const currentSkinLvl = ballLevels[selectedSkin] || 1;
  const ballScale = 1 + (currentSkinLvl - 1) * 0.13;
  // Yerel yedek liste yalnızca tüm zamanlar sekmesinde anlamlı
  const shownScores = lbTab === 'all' && (scoresFailed || onlineLeaderboard.length === 0) ? leaderboard : onlineLeaderboard;

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black flex items-center justify-center overflow-hidden m-0 p-0"
      style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white font-sans overflow-hidden select-none relative m-0 p-0"
        ref={rootRef}
        style={{ width: '100vw', height: '100vh', WebkitTapHighlightColor: 'transparent', transform: supernovaActive ? 'scale(1.04)' : undefined, transition: 'transform 0.08s ease-out' }}
        onClick={handleJump}
      >
        {updateReady && gameState !== 'playing' && (
          <div className="absolute z-[60] top-[max(env(safe-area-inset-top),12px)] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/95 border border-cyan-400/40 rounded-2xl px-4 py-2 shadow-lg">
            <span className="text-sm font-bold text-cyan-200 whitespace-nowrap">⬇️ {t.updateReady}</span>
            <button onClick={(e) => { e.stopPropagation(); completeUpdate(); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-black rounded-xl px-3 py-1 whitespace-nowrap">{t.updateRestart}</button>
          </div>
        )}
        <style>{`
          /* ---------------- HAFİF MOD ---------------- */
          .lite .planet-layer, .lite .planet-atmo, .lite .p-shine,
          .lite .ball-level-aura, .lite .skin-star { animation: none !important; }
          .lite .skin-glow { filter: none !important; }
          .lite .planet-layer { mix-blend-mode: normal !important; }
          .lite .p-noise, .lite .p-shine { display: none; }
          .lite .planet-scale { will-change: auto; }
          .lite .planet { box-shadow: 0 0 40px rgba(var(--p-glow), .55) !important; }
          .lite .planet-ring { box-shadow: none !important; }
          .lite .bg-star { animation: none !important; opacity: .6; }
          .lite .supernova-flash { filter: none !important; animation: none !important; }
          html, body, #root { width: 100vw; height: 100vh; margin: 0; padding: 0; overflow: hidden; background: #000; position: fixed; }
          @keyframes twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
          @keyframes popFloat { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 15% { transform: translateY(-6px) scale(1.15); opacity: 1; } 100% { transform: translateY(-46px) scale(1); opacity: 0; } }
          @keyframes supernovaBuildUp { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.08); filter: brightness(2.1) drop-shadow(0 0 32px rgba(239,68,68,0.8)); } 100% { transform: scale(1); filter: brightness(1); } }
          @keyframes supernovaBlast {
            0% { transform: scale(1); opacity: 1; filter: brightness(1) saturate(1); }
            22% { transform: scale(1.45); opacity: 1; filter: brightness(2.6) saturate(1.8); }
            45% { transform: scale(3.5); opacity: 0.95; filter: brightness(4.2) saturate(2.2) drop-shadow(0 0 70px #ef4444); }
            100% { transform: scale(9.5); opacity: 0; filter: brightness(7) saturate(0.5); }
          }
          .supernova-ring { position: absolute; width: 132px; height: 132px; border-radius: 50%; pointer-events: none; z-index: 24;
                             border: 3px solid rgba(var(--p-glow), .9); box-shadow: 0 0 30px rgba(var(--p-glow), .8);
                             animation: shockwaveExpand 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
          .supernova-ring.ring-b { animation-delay: .12s; border-color: rgba(255,255,255,.85); }
          @keyframes shockwaveExpand { 0% { transform: scale(1); opacity: .95; } 100% { transform: scale(5.5); opacity: 0; } }

          /* ---------------- GEZEGEN ---------------- */
          .planet-group { --p-light:#ffd9a8; --p-mid:#ea580c; --p-dark:#2f0d03; --p-glow:234,88,12; --p-ring-rgb:249,115,22;
                          --p-bands:0; --p-craters:0; --p-land:0; --p-ice:0; --p-storm:0; --p-lava:0; --p-ring-on:0;
                          --p-size:1; --p-radius:50%; --p-ring-tilt:-16deg; --p-facets:0; --p-dunes:0; --p-spots:0; }
          .planet { position: relative; width: 132px; height: 132px; border-radius: var(--p-radius); overflow: hidden;
                    box-shadow: 0 0 70px rgba(var(--p-glow), .65), 0 0 150px rgba(var(--p-glow), .3), 0 0 18px rgba(255,255,255,.15);
                    transform: scale(1); z-index: 25; }
          .planet-layer { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; }
          .planet-scale { position: relative; display: flex; align-items: center; justify-content: center;
                          width: 132px; height: 132px; transform: scale(var(--p-size)); }

          .p-base { background: radial-gradient(circle at 33% 27%, var(--p-light) 0%, var(--p-mid) 46%, var(--p-dark) 100%); }

          .p-bands { opacity: var(--p-bands); mix-blend-mode: overlay; background-size: 260% 100%;
                     background-image: repeating-linear-gradient(97deg,
                       rgba(255,255,255,.20) 0px, rgba(255,255,255,.20) 5px,
                       rgba(0,0,0,.16) 5px, rgba(0,0,0,.16) 11px,
                       rgba(255,255,255,.07) 11px, rgba(255,255,255,.07) 19px,
                       rgba(0,0,0,.10) 19px, rgba(0,0,0,.10) 27px);
                     animation: bandDrift 26s linear infinite; }
          @keyframes bandDrift { from { background-position: 0% 50%; } to { background-position: 260% 50%; } }

          .p-craters { opacity: var(--p-craters); background-size: 200% 100%; animation: surfaceDrift 34s linear infinite;
                       background-image:
                         radial-gradient(circle at 22% 34%, rgba(0,0,0,.42) 0 7px, rgba(255,255,255,.10) 8px, transparent 10px),
                         radial-gradient(circle at 47% 68%, rgba(0,0,0,.36) 0 10px, rgba(255,255,255,.08) 11px, transparent 14px),
                         radial-gradient(circle at 68% 22%, rgba(0,0,0,.34) 0 5px, rgba(255,255,255,.10) 6px, transparent 8px),
                         radial-gradient(circle at 80% 58%, rgba(0,0,0,.30) 0 8px, transparent 10px),
                         radial-gradient(circle at 34% 84%, rgba(0,0,0,.26) 0 6px, transparent 8px); }
          @keyframes surfaceDrift { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }

          .p-land { opacity: var(--p-land); background-size: 200% 100%; animation: surfaceDrift 40s linear infinite;
                    background-image:
                      radial-gradient(ellipse 26% 18% at 28% 40%, rgba(74,160,60,.95), rgba(74,160,60,.6) 55%, transparent 72%),
                      radial-gradient(ellipse 18% 26% at 58% 62%, rgba(120,150,60,.95), rgba(120,150,60,.55) 55%, transparent 72%),
                      radial-gradient(ellipse 14% 12% at 76% 30%, rgba(60,140,70,.9), transparent 70%),
                      radial-gradient(ellipse 20% 10% at 42% 82%, rgba(90,130,50,.85), transparent 70%); }

          .p-clouds { opacity: calc(var(--p-land) * 0.55); background-size: 210% 100%; animation: surfaceDrift 22s linear infinite reverse;
                      background-image:
                        radial-gradient(ellipse 22% 8% at 30% 28%, rgba(255,255,255,.75), transparent 70%),
                        radial-gradient(ellipse 26% 7% at 66% 52%, rgba(255,255,255,.6), transparent 70%),
                        radial-gradient(ellipse 18% 6% at 46% 74%, rgba(255,255,255,.5), transparent 70%); }

          .p-ice { opacity: var(--p-ice); mix-blend-mode: screen; background-size: 200% 100%; animation: surfaceDrift 46s linear infinite;
                   background-image:
                     linear-gradient(64deg, transparent 47%, rgba(255,255,255,.55) 48.4%, transparent 49.6%),
                     linear-gradient(-38deg, transparent 32%, rgba(255,255,255,.4) 33.2%, transparent 34.4%),
                     linear-gradient(12deg, transparent 66%, rgba(255,255,255,.35) 67%, transparent 68%),
                     radial-gradient(circle at 50% 8%, rgba(255,255,255,.55), transparent 32%),
                     radial-gradient(circle at 50% 94%, rgba(255,255,255,.5), transparent 30%); }

          .p-lava { opacity: var(--p-lava); mix-blend-mode: screen; animation: lavaPulse 3.4s ease-in-out infinite;
                    background-image:
                      linear-gradient(72deg, transparent 43%, rgba(255,196,60,.9) 44.4%, rgba(255,90,0,.75) 45.6%, transparent 47%),
                      linear-gradient(-24deg, transparent 58%, rgba(255,150,30,.8) 59.2%, transparent 60.6%),
                      radial-gradient(circle at 66% 70%, rgba(255,120,0,.55), transparent 34%); }
          @keyframes lavaPulse { 0%,100% { filter: brightness(.85); } 50% { filter: brightness(1.45); } }

          .p-storm { opacity: var(--p-storm); animation: stormSpin 18s linear infinite;
                     background-image: radial-gradient(ellipse 15% 10% at 68% 62%, rgba(255,255,255,.9) 0%, rgba(var(--p-glow),.85) 45%, transparent 72%); }
          @keyframes stormSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .p-facets { opacity: var(--p-facets); mix-blend-mode: overlay;
                      background-image: linear-gradient(90deg, transparent 49%, rgba(255,255,255,.6) 50%, transparent 51%),
                                        linear-gradient(32deg, transparent 47%, rgba(0,0,0,.45) 48%, transparent 49.5%),
                                        linear-gradient(-32deg, transparent 47%, rgba(255,255,255,.45) 48%, transparent 49.5%),
                                        linear-gradient(64deg, transparent 70%, rgba(0,0,0,.35) 71%, transparent 72.5%),
                                        linear-gradient(-64deg, transparent 26%, rgba(255,255,255,.35) 27%, transparent 28.5%); }
          .p-dunes { opacity: var(--p-dunes); mix-blend-mode: multiply; background-size: 200% 100%; animation: surfaceDrift 50s linear infinite;
                     background-image: repeating-radial-gradient(ellipse 120% 40% at 30% 120%, rgba(120,53,15,.0) 0 7px, rgba(120,53,15,.45) 8px 10px, rgba(120,53,15,0) 11px 16px); }
          .p-spots { opacity: var(--p-spots); background-size: 200% 100%; animation: surfaceDrift 30s linear infinite;
                     background-image:
                       radial-gradient(circle at 25% 30%, rgba(250,250,140,.85) 0 6px, transparent 9px),
                       radial-gradient(circle at 60% 55%, rgba(250,250,140,.8) 0 9px, transparent 12px),
                       radial-gradient(circle at 78% 25%, rgba(250,250,140,.75) 0 4px, transparent 7px),
                       radial-gradient(circle at 40% 78%, rgba(250,250,140,.75) 0 5px, transparent 8px); }
          .p-terminator { background:
                            radial-gradient(circle at 76% 76%, rgba(0,0,0,.88) 0%, rgba(0,0,0,.6) 34%, transparent 66%),
                            linear-gradient(118deg, transparent 40%, rgba(0,0,0,.28) 50%, rgba(0,0,0,.68) 60%, rgba(0,0,0,.93) 100%); }

          .p-noise { opacity: .5; mix-blend-mode: overlay;
                     background-image: repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,.05) 0px, transparent 1.5px, rgba(0,0,0,.05) 2.5px, transparent 4px); }

          .p-spec { background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.78) 0%, rgba(255,255,255,.22) 14%, transparent 34%),
                                 radial-gradient(circle at 22% 19%, rgba(255,255,255,.95) 0%, transparent 6%); }

          .p-shine { mix-blend-mode: overlay; opacity: .8;
                     background: conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,.5) 26deg, transparent 70deg, transparent 360deg);
                     animation: planetShineSweep 5s linear infinite; }
          @keyframes planetShineSweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .p-rim { box-shadow: inset 0 0 26px 7px rgba(var(--p-glow), .5), inset -16px -16px 38px rgba(0,0,0,.85), inset 0 0 3px 1px rgba(255,255,255,.25); }

          .planet-atmo { position: absolute; width: 210px; height: 210px; border-radius: 50%; pointer-events: none; z-index: 5;
                         background: radial-gradient(circle, rgba(var(--p-glow), .32) 0%, rgba(var(--p-glow), .11) 42%, transparent 68%);
                         animation: atmoBreathe 5s ease-in-out infinite; }
          @keyframes atmoBreathe { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.07); opacity: 1; } }

          .planet-ring { position: absolute; width: 208px; height: 62px; border-radius: 50%; pointer-events: none;
                         opacity: calc(var(--p-ring-on) * .95); transform: rotate(var(--p-ring-tilt));
                         border: 2px solid rgba(var(--p-ring-rgb), .55);
                         box-shadow: 0 0 18px rgba(var(--p-ring-rgb), .5), inset 0 0 14px rgba(var(--p-ring-rgb), .38);
                         background: radial-gradient(ellipse at center, transparent 58%, rgba(var(--p-ring-rgb), .22) 62%, transparent 78%); }
          .planet-ring-back { z-index: 6; clip-path: inset(0 0 50% 0); }
          .planet-ring-front { z-index: 28; clip-path: inset(50% 0 0 0); }

          /* ---------------- TOPLAR ---------------- */
          .ball-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
          .ball-body { position: absolute; inset: 0; overflow: hidden; }
          .ball-body > * { position: absolute; inset: 0; pointer-events: none; }
          .ball-boosted { filter: brightness(1.5); }
          .skin { position: relative; overflow: visible; display: block; }
          .skin-glow { filter: drop-shadow(0 0 5px var(--skin-glow)); }
          .skin-star { position: absolute; top: -22%; right: -22%; line-height: 1; color: #fde047; pointer-events: none;
                       text-shadow: 0 0 4px #f59e0b; animation: corePulse 1.1s ease-in-out infinite; }
          @keyframes corePulse { 0%,100% { transform: scale(.85); opacity: .85; } 50% { transform: scale(1.12); opacity: 1; } }
          .ball-level-aura { position: absolute; border-radius: 50%; pointer-events: none;
                              animation-name: coronaPulse; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
          @keyframes coronaPulse { 0%,100% { transform: scale(.9); opacity: .55; } 50% { transform: scale(1.18); opacity: .95; } }

          .ball-shield { position: absolute; inset: -22%; border-radius: 50%; border: 2px solid #22d3ee;
                         box-shadow: 0 0 16px rgba(34,211,238,.8); animation: shieldPing 1.2s ease-out infinite; }
          @keyframes shieldPing { 0% { transform: scale(.9); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }

          .trail-dot { position: absolute; pointer-events: none; }
          .trail-dust { width: 14px; height: 14px; border-radius: 50%; transform-origin: 50% 50%; }
          .trail-flame { width: 34px; height: 14px; transform-origin: 100% 50%;
                         clip-path: polygon(100% 50%, 55% 8%, 24% 32%, 8% 50%, 24% 68%, 55% 92%); }
          .trail-plasma { width: 46px; height: 12px; border-radius: 50%; transform-origin: 100% 50%; }

          .impact-glow { position: absolute; inset: -55%; border-radius: 50%; pointer-events: none;
                         opacity: 0; z-index: 26; }
        `}</style>

        {showNameModal && (
          <div className="absolute inset-0 bg-black/95 z-[1000] flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-3xl font-black text-cyan-300 mb-4">{t.welcome}</h2>
            <p className="text-slate-400 mb-6 text-sm">{t.namePrompt}</p>
            <input
              type="text"
              className="w-full max-w-xs bg-slate-900 border-2 border-cyan-500 rounded-xl px-4 py-3 text-white text-center font-bold outline-none mb-6 focus:border-yellow-400 transition-colors"
              placeholder={t.namePlaceholder}
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setNameError(false); }}
              maxLength={12}
            />
            {nameError && <p className="text-red-400 text-sm font-bold -mt-3 mb-4">{t.nameTaken}</p>}
            <button
              disabled={nameBusy}
              onClick={async () => {
                if (nameBusy || nameInput.trim().length === 0) return;
                const finalName = nameInput.trim().substring(0, 12);
                setNameBusy(true); setNameError(false);
                try {
                  await claimPlayerName(finalName);
                  releaseNames(auth.currentUser.uid, nameKey(finalName)).catch(() => {});
                } catch (e) {
                  if (e?.message === 'name-taken') {
                    setNameBusy(false); setNameError(true); playSound('click', soundOn);
                    return;
                  }
                  // Çevrimdışı: isim yerelde kabul edilir, skor kaydedilirken
                  // yeniden ayrılmaya çalışılır.
                }
                setNameBusy(false);
                setPlayerName(finalName);
                localStorage.setItem('orbit_player_name', finalName);
                setShowNameModal(false);
                playSound('perfect', soundOn);
              }}
              className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3 px-10 rounded-full text-lg shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              {nameBusy ? t.nameChecking : t.saveAndStart}
            </button>
          </div>
        )}

        {adOverlay && (
          <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 bg-cyan-500/20 border-2 border-cyan-400 rounded-3xl flex items-center justify-center text-4xl mb-4 animate-spin">📺</div>
            <h2 className="text-2xl font-black text-cyan-300 mb-2">{t.adPlaying}</h2>
            <p className="text-sm text-slate-400 max-w-xs">{t.adWaitText}</p>
          </div>
        )}

        {isPaused && gameState === 'playing' && (
          <div className="absolute inset-0 bg-black/80 z-[90] flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 bg-cyan-500/20 border-2 border-cyan-400 rounded-3xl flex items-center justify-center text-4xl mb-4 animate-pulse">⏸️</div>
            <h2 className="text-3xl font-black text-cyan-300 mb-6 tracking-widest">{t.pause}</h2>
            <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setIsPaused(false); }} className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3.5 px-10 rounded-full text-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] cursor-pointer">
              {t.resume}
            </button>
          </div>
        )}

        <div className={currentBgStyle}>
          <div className="absolute w-[1000px] h-[1000px] pointer-events-none" style={{ top: 'calc(25% - 150px)', left: 'calc(25% - 150px)', background: currentAccent }}></div>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`star-${i}`} className="bg-star absolute rounded-full bg-white pointer-events-none" style={{ width: 1.5, height: 1.5, left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite` }}></div>
          ))}
        </div>

        {gameState === 'menu' && (
          <div className="absolute top-10 left-6 z-50 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold px-4 h-12 rounded-full text-base shadow-md pointer-events-none" style={{ marginTop: 'env(safe-area-inset-top)' }}>💎 {crystals}</div>
        )}
        <div className="absolute top-10 right-6 max-[380px]:right-3 flex items-center gap-3 max-[380px]:gap-2 z-50" style={{ marginTop: 'env(safe-area-inset-top)' }}>
          {gameState === 'playing' && <div className="pointer-events-none flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold px-4 max-[380px]:px-3 h-12 max-[380px]:h-10 rounded-full text-lg shadow-md">💎 {runCrystals}</div>}
          {gameState === 'playing' && <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setIsPaused(true); }} className="w-12 h-12 max-[380px]:w-10 max-[380px]:h-10 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">⏸️</button>}
          {gameState === 'playing' && <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); exitToMenu(); }} className="w-12 h-12 max-[380px]:w-10 max-[380px]:h-10 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">🏠</button>}
          {gameState === 'menu' && <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('settings'); }} aria-label={t.settings} className="w-12 h-12 max-[380px]:w-10 max-[380px]:h-10 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">⚙️</button>}
          {/* Oyun dışında ses Ayarlar ekranından açılıp kapanır */}
          {gameState === 'playing' && <button onClick={(e) => { e.stopPropagation(); toggleSound(); }} className="w-12 h-12 max-[380px]:w-10 max-[380px]:h-10 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">{soundOn ? '🔊' : '🔇'}</button>}
        </div>

        {gameState === 'menu' && (
          <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }} onClick={(e) => e.stopPropagation()}>
            {/* Üç bölge: üstte başlık ve seviye, ortada oyna alanı, altta gezinme çubuğu */}
            <div className="min-h-full w-full max-w-md mx-auto flex flex-col px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 96px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
              <div className="flex flex-col items-center">
                <h1 className="text-5xl sm:text-6xl [@media(max-height:700px)]:text-4xl font-black mb-2 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 text-center">{t.title}</h1>
                <p className="text-slate-300 mb-3 font-semibold text-base text-center">{playerName ? `👤 ${playerName} · ` : ''}{t.best}: {highScore}</p>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs font-black mb-1">
                    <span className="text-amber-300">{t.lv} {lvl.level}</span>
                    <span className="text-slate-400">{lvl.into}/{lvl.need} XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.round((lvl.into / lvl.need) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-4 py-6 [@media(max-height:700px)]:gap-2.5 [@media(max-height:700px)]:py-3">
                {challenge && (
                  <div className="w-full bg-rose-950/80 border border-rose-500/60 rounded-2xl p-4 text-center">
                    <p className="text-rose-300 text-sm font-black">{t.challengeTitle}</p>
                    <p className="text-white text-base font-bold mb-3">{t.challengeBeat.replace('{n}', String(challenge.target))}</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => { const c = challenge; setActiveChallenge(c); setChallenge(null); setGameMode(c.mode); startGame(c.mode, c.seed); }} className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black py-3 rounded-full text-base">{t.challengeAccept}</button>
                      <button onClick={() => { playSound('click', soundOn); setChallenge(null); }} className="bg-slate-800 text-slate-400 font-bold py-3 px-5 rounded-full text-base">✕</button>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <div className="grid grid-cols-4 gap-1 bg-slate-900/90 border border-slate-700/60 rounded-2xl p-1">
                    {[
                      ['normal', '🪐', t.tabNormal, 'bg-cyan-500 text-slate-950'],
                      ['supernova', '💥', t.tabSupernova, 'bg-red-600 text-white'],
                      ['zen', '🧘', t.tabZen, 'bg-emerald-500 text-slate-950'],
                      ['fast', '⚡', t.tabFast, 'bg-amber-500 text-slate-950']
                    ].map(([id, icon, label, on]) => {
                      const selected = gameMode === id || (id === 'normal' && gameMode === 'daily');
                      return (
                        <button key={id} onClick={() => { playSound('click', soundOn); setGameMode(id); }} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl min-w-0 transition-colors ${selected ? `${on} font-black shadow-md` : 'text-slate-400 font-bold'}`}>
                          <span className="text-2xl leading-none">{icon}</span>
                          <span className="text-xs w-full truncate text-center">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-center text-xs font-bold text-slate-400 mt-2">{t[{ supernova: 'hintSupernova', zen: 'hintZen', fast: 'hintFast' }[gameMode] || 'hintNormal']}</p>
                </div>

                <button onClick={() => {
                  // Günlük meydan okuma kendi butonundan açılır; OYNA her zaman seçili normal modu başlatır
                  const mode = gameMode === 'daily' ? 'normal' : gameMode;
                  setGameMode(mode); startGame(mode);
                }} className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-5 [@media(max-height:700px)]:py-3.5 rounded-3xl text-3xl tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.45)] cursor-pointer">{t.play}</button>
                <button onClick={() => { setGameMode('daily'); startGame('daily'); }} className="w-full flex flex-col items-center bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white font-black py-3 rounded-2xl text-base shadow-[0_0_20px_rgba(192,38,211,0.4)] cursor-pointer">
                  <span>{t.modeDaily}{todayStats.daily === 0 ? ' 🆕' : ''}</span>
                  <span className="text-xs font-bold text-fuchsia-100/80">{t.dailyHint}</span>
                </button>

                {canSaveStreak && isStreakReady && (
                  <div className="w-full bg-orange-950/70 border border-orange-500/50 rounded-2xl p-3 text-center">
                    <p className="text-orange-200 text-sm font-black mb-2">🔥 {t.streakLost.replace('{n}', String(streakDays))}</p>
                    <div className="flex gap-2 justify-center">
                      {!isWeb && <button onClick={() => saveStreak(true)} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black py-2.5 rounded-full text-sm">{t.streakSaveAd}</button>}
                      <button onClick={() => saveStreak(false)} className={`flex-1 font-black py-2.5 rounded-full text-sm ${crystals >= STREAK_SAVE_COST ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>{t.streakSaveCrystals.replace('{n}', String(STREAK_SAVE_COST))}</button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {!(canSaveStreak && isStreakReady) && (
                    <button onClick={() => claimStreakBonus()} disabled={!isStreakReady} className={`${isWeb ? 'col-span-2' : ''} flex flex-col items-center justify-center font-black py-3 rounded-2xl text-sm ${isStreakReady ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 animate-pulse' : 'bg-slate-900/80 border border-slate-800 text-slate-500'}`}>
                      <span>🔥 {t.dayWord} {streakDays}</span>
                      <span className="text-xs font-bold">{isStreakReady ? `💎 +${(daysSinceStreak === 1 ? streakDays + 1 : 1) * 15}` : t.streakClaimed}</span>
                    </button>
                  )}
                  {!isWeb && (
                    <button onClick={() => { if (!isAdLimitReached) { watchRewardedAd(() => { const nextCrystals = crystals + 50; setCrystals(nextCrystals); saveJSON('orbit_crystals', nextCrystals); playSound('coin', soundOn); track('reward_ad_crystals'); }); } }} disabled={isAdLimitReached} className={`${canSaveStreak && isStreakReady ? 'col-span-2' : ''} flex flex-col items-center justify-center font-black py-3 rounded-2xl text-sm ${isAdLimitReached ? 'bg-slate-900/80 border border-slate-800 text-slate-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'}`}>
                      <span>📺 💎 +50</span>
                      <span className="text-xs font-bold">{isAdLimitReached ? t.adLimitReached : `${2 - dailyAdCount}/2`}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  ['🛒', t.shop, () => setGameState('shop'), false],
                  ['🏆', t.missions, () => setGameState('missions'), hasClaimableDaily],
                  ['👑', t.navRank, () => { setGameState('leaderboard'); fetchOnlineScores('weekly'); }, false],
                  ['🏅', t.badges, () => setGameState('badges'), false]
                ].map(([icon, label, go, dot]) => (
                  <button key={icon} onClick={() => { playSound('click', soundOn); go(); }} className="relative flex flex-col items-center justify-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-2xl py-4 [@media(max-height:700px)]:py-3 px-1 min-w-0">
                    <span className="text-3xl leading-none">{icon}</span>
                    <span className="text-xs font-bold text-slate-300 w-full truncate text-center">{label}</span>
                    {dot && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse" />}
                  </button>
                ))}
              </div>

              {isWeb && (
                <div className="flex flex-col items-center mt-4">
                  <button onClick={() => { track('store_click', { from: 'menu' }); openStore(); }} className="w-full bg-white text-slate-900 font-black py-3 rounded-2xl text-sm shadow-md cursor-pointer">{t.getOnPlay}</button>
                  <p className="text-slate-400 text-xs font-bold mt-1 text-center">{t.webHint}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'settings' && (
          <div className="absolute inset-0 z-10 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-6 w-full max-w-md mx-auto px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 100px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
              <div className="flex items-center gap-4">
                <button onClick={() => { playSound('click', soundOn); setGameState('menu'); }} className="w-12 h-12 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl">←</button>
                <h2 className="text-3xl font-black text-cyan-300">{t.settings}</h2>
              </div>

              <section>
                <p className="text-sm font-black text-slate-300 mb-3">🌐 {t.language}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.keys(translations).map((l) => (
                    <button key={l} onClick={() => { playSound('click', soundOn); setLang(l); localStorage.setItem('orbitJumpLang', l); }} className={`py-4 rounded-2xl font-bold text-base border ${lang === l ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>{LANG_NAMES[l]}</button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-sm font-black text-slate-300 mb-3">🔊 {t.soundLabel}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => { if (!soundOn) toggleSound(); }} className={`py-4 rounded-2xl font-bold text-base border ${soundOn ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>🔊 {t.onLabel}</button>
                  <button onClick={() => { if (soundOn) toggleSound(); }} className={`py-4 rounded-2xl font-bold text-base border ${!soundOn ? 'bg-slate-600 border-slate-400 text-white font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>🔇 {t.offLabel}</button>
                </div>
              </section>

              <section>
                <p className="text-sm font-black text-slate-300 mb-3">✨ {t.graphics}</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => { if (liteMode) toggleLite(); }} className={`py-4 rounded-2xl font-bold text-base border ${!liteMode ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>✨ {t.graphicsHigh}</button>
                  <button onClick={() => { if (!liteMode) toggleLite(); }} className={`py-4 rounded-2xl font-bold text-base border ${liteMode ? 'bg-amber-500 border-amber-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>⚡ {t.graphicsLow}</button>
                </div>
              </section>

              {!isWeb && (
                <section>
                  <p className="text-sm font-black text-slate-300 mb-3">☁️ {t.account}</p>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-4">
                    {isGoogleUser(authUser) ? (
                      <>
                        <p className="text-emerald-300 text-base font-bold">☁️ {cloudReady ? t.signedInAs : t.syncing}</p>
                        <div className="flex gap-6 text-sm font-bold">
                          <button onClick={() => handleSignOut()} className="text-slate-400 underline">{t.signOut}</button>
                          <button onClick={() => handleDeleteAccount()} disabled={authBusy} className="text-red-400/80 underline">{t.deleteAccount}</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleGoogleSignIn()} disabled={authBusy} className="flex items-center gap-2 bg-white text-slate-800 font-bold py-3 px-6 rounded-full text-base shadow-md disabled:opacity-60">
                          <span className="font-black" style={{ color: '#4285F4' }}>G</span> {authBusy ? t.syncing : t.signInGoogle}
                        </button>
                        {authError && <p className="text-red-400 text-xs font-bold">{t.signInFailed}</p>}
                      </>
                    )}
                    {privacyOptionsRequired && (
                      <button onClick={() => { AdMob.showPrivacyOptionsForm().catch(() => {}); }} className="text-slate-500 underline text-sm font-bold">{t.privacyOptions}</button>
                    )}
                  </div>
                </section>
              )}

              <button onClick={() => { playSound('click', soundOn); setGameState('howtoplay'); }} className="bg-slate-900/90 border border-slate-700/60 text-teal-300 font-bold py-4 rounded-2xl text-base">❓ {t.howToPlay}</button>
            </div>
          </div>
        )}

        {gameState === 'badges' && (
          <div className="flex flex-col items-center z-10 w-full max-w-md px-6 pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-6">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }} className="w-11 h-11 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-lg">←</button>
              <h2 className="text-xl font-black text-yellow-300">{t.badges}</h2>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-1.5 px-3 rounded-full text-xs">💎 {crystals}</div>
            </div>
            {playGamesAvailable && (
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); showAchievements(); }} className="w-full mb-3 flex items-center justify-center gap-2 bg-emerald-600 text-white font-black py-3 rounded-2xl text-sm shadow-md">
                🎮 {t.playAchievements}
              </button>
            )}
            <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 max-h-[64vh] overflow-y-auto">
              {badgeDefs.map((b) => {
                const unlocked = b.check(badgeStats);
                const claimed = claimedBadges.includes(b.id);
                const current = Math.min(badgeStats[b.stat] || 0, b.target);
                return (
                  <div key={b.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${unlocked ? 'bg-slate-950/80 border-yellow-500/50' : 'bg-slate-950/30 border-slate-800 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-slate-900 p-2.5 rounded-2xl border border-slate-800">{b.icon}</div>
                      <div>
                        <p className={`font-bold text-sm ${unlocked ? 'text-yellow-300' : 'text-slate-400'}`}>{t[b.nameKey]}</p>
                        <p className="text-xs text-slate-500">{t[b.descKey]}{!unlocked && b.target > 1 ? ` · ${current}/${b.target}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); claimBadge(b); }} disabled={!unlocked || claimed} className={`py-1.5 px-4 rounded-full text-xs font-black ${claimed ? 'bg-slate-800 text-slate-500' : unlocked ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                      {claimed ? t.claimed : t.claim}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'howtoplay' && (
          <div className="flex flex-col items-center z-10 w-full max-w-md px-6 pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-6">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }} className="w-11 h-11 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-lg">←</button>
              <h2 className="text-xl font-black text-teal-300">{t.howToPlay}</h2>
              <div className="w-11"></div>
            </div>
            <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">🚀</span><p>{t.helpRule1}</p></div>
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">✨</span><p>{t.helpRule2}</p></div>
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">⏰</span><p>{t.helpRule3}</p></div>
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">🛡️</span><p>{t.helpRule4}</p></div>
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">⬆️</span><p>{t.helpBallFeature}</p></div>
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800"><span className="text-xl">🛒</span><p>{t.helpShopFeature}</p></div>
            </div>
          </div>
        )}

        {gameState === 'leaderboard' && (
          <div className="flex flex-col items-center z-10 w-full max-w-md px-6 pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-6">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }} className="w-11 h-11 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-lg">←</button>
              <h2 className="text-2xl font-black text-amber-300">{t.leaderboard}</h2>
              <div className="w-11"></div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 w-full mb-2">
              {[['weekly', t.lbWeekly], ['daily', t.lbDaily], ['all', t.lbAllTime]].map(([id, label]) => (
                <button key={id} onClick={() => { playSound('click', soundOn); fetchOnlineScores(id); }} className={`py-2 rounded-xl text-[11px] font-bold border ${lbTab === id ? 'bg-amber-400 text-slate-950 font-black border-amber-300' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{label}</button>
              ))}
            </div>
            {lbTab !== 'all' && <p className="text-[11px] text-slate-500 font-bold mb-3">{lbTab === 'weekly' ? t.weeklyResets : t.dailyResets}</p>}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
              {isLoadingScores ? (
                <p className="text-center text-slate-500 py-6 text-sm animate-pulse">{t.loadingScores}</p>
              ) : shownScores.length === 0 ? (
                <p className="text-center text-slate-500 py-6 text-sm">{t.noScores}</p>
              ) : (
                <>
                  {scoresFailed && <p className="text-center text-amber-400/80 text-[11px] font-bold mb-1">{t.offlineScores}</p>}
                  {shownScores.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl">
                      <span className={`font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-slate-300'}`}>
                        #{index + 1} {item.name}
                      </span>
                      <span className="font-mono font-black text-cyan-300">{item.score}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {gameState === 'shop' && (
          <div className="flex flex-col items-center z-10 w-full max-w-md px-6 pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-4">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }} className="w-11 h-11 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-lg">←</button>
              <h2 className="text-xl font-black text-cyan-300">{t.shop}</h2>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-1.5 px-3 rounded-full text-xs">💎 {crystals}</div>
            </div>

            {shopMessage && (
              <div className="mb-3 w-full text-center bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-black py-2 px-4 rounded-full shadow-md animate-pulse">
                ⚠️ {shopMessage}
              </div>
            )}

            <div className="grid grid-cols-4 gap-1.5 w-full mb-3">
              <button onClick={() => setShopTab('balls')} className={`py-2 rounded-xl text-[11px] font-bold border ${shopTab === 'balls' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabBalls}</button>
              <button onClick={() => setShopTab('boosts')} className={`py-2 rounded-xl text-[11px] font-bold border ${shopTab === 'boosts' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabBoosts}</button>
              <button onClick={() => setShopTab('trails')} className={`py-2 rounded-xl text-[11px] font-bold border ${shopTab === 'trails' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabTrails}</button>
              <button onClick={() => setShopTab('themes')} className={`py-2 rounded-xl text-[11px] font-bold border ${shopTab === 'themes' ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabThemes}</button>
            </div>

            <div className="w-full flex flex-col gap-3 max-h-[52vh] overflow-y-auto pr-1">
              {shopTab === 'boosts' && (
                <>
                  {['shield', 'slowmo'].map((boostType) => {
                    const level = boostLevels[boostType] || 1;
                    const bonusAmount = 3 + (level - 1);
                    const upgradeCost = level * 30;
                    const isMaxLevel = level >= 5;
                    const icon = boostType === 'shield' ? '🛡️' : '⏳';
                    const iconBg = boostType === 'shield' ? 'bg-cyan-500/20 border-cyan-400' : 'bg-purple-500/20 border-purple-400';
                    const nameLabel = boostType === 'shield' ? t.shield : t.slowmo;
                    return (
                      <div key={boostType} className="flex flex-col gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${iconBg} border flex items-center justify-center text-xl`}>{icon}</div>
                            <div>
                              <p className="font-bold text-sm">{nameLabel} ({boostCounts[boostType] || 0})</p>
                              <p className="text-xs text-slate-400">{t.level} {level}/5 {isMaxLevel ? `· ${t.max}` : ''}</p>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); buyBoostPackage(boostType); }} className={`py-2 px-4 rounded-full text-xs font-black ${crystals >= 40 ? 'bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                            {t.buy} 💎40 (+{bonusAmount})
                          </button>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                          <p className="text-xs text-slate-400">{isMaxLevel ? t.max : `${t.upgrade}: 💎 ${upgradeCost}`}</p>
                          <button onClick={(e) => { e.stopPropagation(); upgradeBoost(boostType); }} disabled={isMaxLevel} className={`py-1.5 px-4 rounded-full text-xs font-black ${isMaxLevel ? 'bg-slate-800 text-slate-500' : crystals >= upgradeCost ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                            ⬆️ {t.upgrade}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {shopItems.filter(s => ((shopTab === 'balls' && s.type === 'ball') || (shopTab === 'trails' && s.type === 'trail') || (shopTab === 'themes' && s.type === 'theme'))).map((item) => {
                const owned = ownedItems.includes(item.id);
                const isSelected = selectedSkin === item.id || selectedTrail === item.id || selectedTheme === item.id;
                const ballLvl = ballLevels[item.id] || 1;
                const isUpgrading = upgradedBallId === item.id;
                const isMaxLevel = ballLvl >= 5;
                const upgradeCost = ballLvl * 35;

                if (item.type === 'ball' && owned) {
                  return (
                    <div key={item.id} className="flex flex-col gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <BallVisual skinId={item.id} level={ballLvl} size={40} boosted={isUpgrading} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{t[item.nameKey]}</p>
                            <p className="text-xs text-slate-400">{t.level} {ballLvl}/5 {isMaxLevel ? `· ${t.max}` : ''}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); buyShopItem(item); }}
                          disabled={isSelected}
                          className={`py-2 px-4 rounded-full text-xs font-black transition-colors ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-white'}`}
                        >
                          {isSelected ? t.selected : t.select}
                        </button>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                        <p className="text-xs text-slate-400">{isMaxLevel ? t.max : `${t.upgrade}: 💎 ${upgradeCost}`}</p>
                        <button onClick={(e) => { e.stopPropagation(); upgradeBall(item.id); }} disabled={isMaxLevel} className={`py-1.5 px-4 rounded-full text-xs font-black ${isMaxLevel ? 'bg-slate-800 text-slate-500' : crystals >= upgradeCost ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                          ⬆️ {t.upgrade}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      {item.type === 'ball' && (
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0 opacity-70">
                          <BallVisual skinId={item.id} level={1} size={40} />
                        </div>
                      )}
                      {item.type === 'trail' && <div className="w-10 h-10 flex items-center justify-center text-xl" style={{ color: item.color }}>☄️</div>}
                      {item.type === 'theme' && <div className="w-10 h-10 flex items-center justify-center text-xl">🌌</div>}
                      <div>
                        <p className="font-bold text-sm">{t[item.nameKey]}</p>
                        <p className="text-xs text-slate-400">{owned ? t.owned : `💎 ${item.price}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); buyShopItem(item); }}
                        disabled={isSelected}
                        className={`py-2 px-4 rounded-full text-xs font-black transition-colors ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : owned ? 'bg-slate-700 text-white' : crystals >= item.price ? 'bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}
                      >
                        {isSelected ? t.selected : owned ? t.select : t.buy}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'missions' && (
          <div className="flex flex-col items-center z-10 w-full max-w-md px-6 pt-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between w-full mb-6">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }} className="w-11 h-11 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-lg">←</button>
              <h2 className="text-2xl font-black text-amber-300">{t.missions}</h2>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-2 px-3 rounded-full text-sm">💎 {crystals}</div>
            </div>
            <div className="w-full flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-baseline justify-between px-1">
                <p className="text-sm font-black text-amber-300">📅 {t.dailyMissions}</p>
                <p className="text-[10px] text-slate-500 font-bold">{t.dailyMissionsHint}</p>
              </div>
              {dailyMissions.map((m) => {
                const progress = Math.min(todayStats[m.stat] || 0, m.target);
                const done = progress >= m.target;
                const claimed = todayStats.claimed.includes(m.id);
                return (
                  <div key={m.id} className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-200">{t[`dm_${m.stat}`].replace('{n}', String(m.target))}</p>
                      <p className="text-xs text-slate-400 font-mono">{progress}/{m.target}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-amber-300 font-bold">💎 +{m.reward}</p>
                      <button onClick={(e) => { e.stopPropagation(); claimDailyMission(m); }} disabled={!done || claimed} className={`py-1.5 px-4 rounded-full text-xs font-black ${claimed ? 'bg-slate-800 text-slate-500' : done ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                        {claimed ? t.claimed : t.claim}
                      </button>
                    </div>
                  </div>
                );
              })}
              <p className="text-sm font-black text-slate-300 px-1 mt-2">🏆 {t.missions}</p>
              {missionDefs.map((m) => {
                const progress = Math.min(stats[m.statKey] || 0, m.target);
                const done = progress >= m.target;
                const claimed = claimedMissions.includes(m.id);
                return (
                  <div key={m.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-200">{t[m.labelKey]}</p>
                      <p className="text-xs text-slate-400 font-mono">{progress}/{m.target}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-amber-300 font-bold">💎 +{m.reward}</p>
                      <button onClick={(e) => { e.stopPropagation(); claimMission(m, progress); }} disabled={!done || claimed} className={`py-1.5 px-4 rounded-full text-xs font-black ${claimed ? 'bg-slate-800 text-slate-500' : done ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                        {claimed ? t.claimed : t.claim}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center z-50 bg-black/85 inset-0 absolute justify-center px-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-4xl font-black text-amber-400 mb-3 animate-pulse">{t.gameOver}</h2>
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl mb-6 text-center shadow-2xl min-w-[280px]">
              {gameMode === 'daily' && <p className="text-fuchsia-300 text-[11px] font-black mb-2">{t.modeDaily}</p>}
              <p className="text-slate-400 text-xs mb-1">{t.score}</p>
              <p className="text-3xl font-black text-cyan-400 mb-2">{score}</p>
              {(() => {
                const best = lastRun?.startBest || 0;
                if (best > 0 && score > best) return <p className="text-sm font-black text-amber-300 mb-2 animate-pulse">{t.newRecord}</p>;
                const gap = best - score + 1;
                if (best > 0 && score > 0 && gap <= Math.max(3, Math.ceil(best * 0.25))) return <p className="text-sm font-black text-orange-300 mb-2">{t.toBeatBest.replace('{n}', String(gap))}</p>;
                return best > 0 ? <p className="text-xs font-bold text-slate-500 mb-2">{t.bestWas.replace('{n}', String(best))}</p> : null;
              })()}
              {activeChallenge && (
                <p className={`text-sm font-black mb-2 ${score > activeChallenge.target ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {score > activeChallenge.target ? t.challengeWon : t.challengeShort.replace('{n}', String(activeChallenge.target - score + 1))}
                </p>
              )}
              <p className="text-xs text-cyan-300 font-bold mb-1">💎 +{runCrystals}{lastRun ? ` · ${t.xpGain.replace('{n}', String(lastRun.xpGain))}` : ''}</p>
              {lastRun?.levelUp > 0 && <p className="text-sm font-black text-amber-300 mb-1">{t.levelUp.replace('{n}', String(lastRun.levelUp))} 💎 +{lastRun.levelCrystals}</p>}
              <div className="mb-4" />
              {!reviveUsed && !isWeb && (
                <button onClick={continueGameWithAd} className="w-full font-black py-3 px-4 rounded-xl text-sm shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  📺 {t.watchAdContinue}
                </button>
              )}
              {score > 0 && (
                <button onClick={() => {
                  playSound('click', soundOn);
                  const mode = gameMode === 'daily' ? 'normal' : gameMode;
                  shareScore(t.challengeShare.replace('{n}', String(score)), challengeUrl(runSeedRef.current, score, mode));
                  track('share_score', { score, challenge: 1 });
                }} className="w-full mt-3 font-black py-2.5 px-4 rounded-xl text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                  {t.challengeSend}
                </button>
              )}
              {isWeb && (
                <button onClick={() => { track('store_click', { from: 'gameover' }); openStore(); }} className="w-full mt-3 font-black py-2.5 px-4 rounded-xl text-sm bg-white text-slate-900">
                  {t.getOnPlay}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={async () => { if (leavingGameOver) return; setLeavingGameOver(true); await maybeShowInterstitial(); setLeavingGameOver(false); if (activeChallenge) startGame(activeChallenge.mode, activeChallenge.seed); else startGame(); }} className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3 px-6 rounded-full text-base shadow-md">{t.restart}</button>
              <button onClick={() => { if (leavingGameOver) return; playSound('click', soundOn); setGameState('menu'); maybeShowInterstitial(); }} className="bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-full text-base border border-slate-700">{t.menu}</button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none z-[95]" style={{ opacity: 0 }}></div>
            <div className="absolute top-6 left-12 max-[380px]:left-5 z-50 pointer-events-none" style={{ marginTop: 'env(safe-area-inset-top)' }}>
              <div className="text-6xl font-black text-white/10 leading-none">{score}</div>
              <div className={`text-xs font-black tracking-widest mt-1 ${tier.color}`}>{tier.badge} {t[tier.key]}</div>
              {comboCount > 1 && <div className="text-sm font-black text-orange-300 mt-1">🔥 {t.combo} x{comboCount}</div>}
            </div>

            <div className="absolute bottom-8 left-8 flex gap-3 z-50" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
              <button
                onClick={(e) => { e.stopPropagation(); activateShield(); }}
                className={`relative w-14 h-14 rounded-full border flex items-center justify-center text-xl shadow-lg transition-all ${shieldActive ? 'bg-cyan-500 text-slate-950 border-cyan-200 animate-pulse' : (boostCounts.shield || 0) > 0 ? 'bg-slate-900/90 text-cyan-300 border-slate-700' : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50 grayscale'}`}
              >
                🛡️ <span className={`absolute bottom-1 right-2 text-xs font-black px-1.5 py-0.5 rounded-full ${(boostCounts.shield || 0) > 0 ? 'bg-slate-950/80 text-cyan-300' : 'bg-slate-900/80 text-slate-500'}`}>{boostCounts.shield || 0}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerSlowMo(); }}
                className={`relative w-14 h-14 rounded-full border flex items-center justify-center text-xl shadow-lg transition-all ${(boostCounts.slowmo || 0) > 0 ? 'bg-slate-900/90 text-purple-300 border-slate-700' : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50 grayscale'}`}
              >
                ⏳ <span className={`absolute bottom-1 right-2 text-xs font-black px-1.5 py-0.5 rounded-full ${(boostCounts.slowmo || 0) > 0 ? 'bg-slate-950/80 text-purple-300' : 'bg-slate-900/80 text-slate-500'}`}>{boostCounts.slowmo || 0}</span>
              </button>
            </div>

            {recordFlash && (
              <div className="absolute z-50 pointer-events-none left-1/2 top-[22%] -translate-x-1/2 text-3xl font-black text-amber-300 whitespace-nowrap animate-bounce drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">{t.newBest}</div>
            )}

            {popup && (
              <div className={`absolute z-50 pointer-events-none font-black text-2xl left-1/2 top-1/2 ${popup.kind === 'perfect' ? 'text-yellow-300' : 'text-cyan-300'}`} style={{ animation: 'popFloat 0.65s ease-out forwards', transform: 'translate(-50%, -50%)' }}>
                {popup.text} {popup.kind === 'perfect' ? `✨ ${t.perfect}` : ''}
              </div>
            )}

            {/* Oyun dünyası ekran boyutuna göre ölçeklenir: kısa ekranda hedef gezegen
                üstten taşmaz, uzun ekranda oyun küçük kalmaz */}
            <div className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${worldScale})` }}>
            <div ref={cameraRef} className="absolute inset-0 pointer-events-none" style={{ transform: 'translate(0px, 200px)' }}>
              {Array.from({ length: TRAIL_POOL_SIZE }).map((_, idx) => (
                <div
                  key={idx}
                  ref={(el) => { trailDotRefs.current[idx] = el; }}
                  className="trail-dot z-[24]"
                  style={{ left: '50%', top: '50%', opacity: 0 }}
                ></div>
              ))}

              {Array.from({ length: PARTICLE_POOL_SIZE }).map((_, idx) => (
                <div
                  key={idx}
                  ref={(el) => { particleDotRefs.current[idx] = el; }}
                  className="absolute rounded-full pointer-events-none z-30"
                  style={{ left: '50%', top: '50%', opacity: 0 }}
                ></div>
              ))}

              <div ref={activeGroupRef} className="planet-group absolute flex items-center justify-center pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <PlanetBody innerRef={activePlanetRef} isSupernova={supernovaActive} glowRef={impactGlowRef} />
                {supernovaActive && <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 opacity-90 blur-xl z-40 pointer-events-none animate-ping supernova-flash"></div>}
              </div>

              <div ref={targetGroupRef} className="planet-group absolute flex items-center justify-center pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(80px, -440px)' }}>
                <PlanetBody isSupernova={false} />
              </div>

              <div ref={ballRef} className="w-8 h-8 absolute z-30" style={{ left: '50%', top: '50%', transform: 'translate(104px, -16px)' }}>
                <div style={{ transform: `scale(${ballScale})`, transition: 'transform 0.3s ease' }}>
                  <div ref={ballInnerRef}>
                    <BallVisual skinId={selectedSkin} level={currentSkinLvl} size={32} shieldActive={shieldActive} />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
