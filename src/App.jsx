import { useState, useEffect, useRef } from 'react';
import { AdMob, RewardAdPluginEvents, AdmobConsentStatus } from '@capacitor-community/admob';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';

// FIREBASE
import { db, auth } from './firebase';
import { collection, setDoc, doc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

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
    namePlaceholder: "Your nickname", saveAndStart: "SAVE & START",
    offlineScores: "Offline — showing local scores."
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
    namePlaceholder: "Takma Adın", saveAndStart: "KAYDET VE BAŞLA",
    offlineScores: "Çevrimdışı — yerel skorlar gösteriliyor."
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
    namePlaceholder: "Tu apodo", saveAndStart: "GUARDAR Y EMPEZAR",
    offlineScores: "Sin conexión — mostrando puntuaciones locales."
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
    namePlaceholder: "Dein Spitzname", saveAndStart: "SPEICHERN & STARTEN",
    offlineScores: "Offline — lokale Ergebnisse werden angezeigt."
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
    namePlaceholder: "Ваш ник", saveAndStart: "СОХРАНИТЬ И НАЧАТЬ",
    offlineScores: "Нет сети — показаны локальные результаты."
  }
};

const backgroundThemesList = {
  bg_nebula: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-600 via-purple-800 via-30% to-indigo-950 pointer-events-none overflow-hidden transition-colors duration-700",
  bg_void: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 via-zinc-900 via-25% to-black pointer-events-none overflow-hidden transition-colors duration-700",
  bg_solar: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400 via-orange-700 via-30% to-slate-950 pointer-events-none overflow-hidden transition-colors duration-700",
  bg_galactic: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300 via-blue-800 via-30% to-slate-950 pointer-events-none overflow-hidden transition-colors duration-700"
};

const backgroundAccents = {
  bg_nebula: 'bg-fuchsia-500/40',
  bg_void: 'bg-slate-300/20',
  bg_solar: 'bg-amber-400/45',
  bg_galactic: 'bg-cyan-300/45'
};

/* ============================================================
   GEZEGENLER — her biri farklı tipte bir gök cismi.
   Renkler ve katman görünürlükleri CSS değişkeni olarak
   uygulanıyor, böylece her inişte tek hamlede tema değişiyor.
   ============================================================ */
const planetThemes = [
  { // Volkanik dünya — kraterli, lav çatlaklı
    light: '#ffd9a8', mid: '#ea580c', dark: '#2f0d03',
    glow: '234,88,12', ringRgb: '249,115,22',
    bands: 0, craters: 0.85, land: 0, ice: 0, storm: 0, lava: 0.9, ringOn: 0
  },
  { // Gaz devi — kuşaklı, büyük fırtına lekeli, halkalı
    light: '#ffd7ec', mid: '#db2777', dark: '#3d0420',
    glow: '219,39,119', ringRgb: '236,72,153',
    bands: 0.85, craters: 0, land: 0, ice: 0, storm: 0.9, lava: 0, ringOn: 1
  },
  { // Yaşanabilir dünya — kıtalar ve bulut örtüsü
    light: '#b8f5d6', mid: '#059669', dark: '#012019',
    glow: '5,150,105', ringRgb: '16,185,129',
    bands: 0, craters: 0, land: 0.95, ice: 0, storm: 0, lava: 0, ringOn: 0
  },
  { // Buz devi — yumuşak kuşaklar, halkalı
    light: '#d7ddff', mid: '#4f46e5', dark: '#12102e',
    glow: '79,70,229', ringRgb: '99,102,241',
    bands: 0.55, craters: 0, land: 0, ice: 0.45, storm: 0, lava: 0, ringOn: 1
  },
  { // Donmuş okyanus — çatlaklı buz kabuğu
    light: '#c2f4ff', mid: '#0891b2', dark: '#04212c',
    glow: '8,145,178', ringRgb: '6,182,212',
    bands: 0, craters: 0.2, land: 0, ice: 0.95, storm: 0, lava: 0, ringOn: 0
  }
];

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
};

/* ============================================================
   TOPLAR — her biri farklı malzeme ve siluet.
   gold: metal küre | ruby: kesme taş (sekizgen)
   emerald: altıgen kristal | nova: dönen plazma çekirdeği
   ============================================================ */
const shopItems = [
  { id: 'gold', type: 'ball', price: 0, trailTint: '#fde047', nameKey: 'itemGold' },
  { id: 'ruby', type: 'ball', price: 40, trailTint: '#fb7185', nameKey: 'itemRuby' },
  { id: 'emerald', type: 'ball', price: 60, trailTint: '#4ade80', nameKey: 'itemEmerald' },
  { id: 'nova', type: 'ball', price: 100, trailTint: '#a78bfa', nameKey: 'itemNova' },
  { id: 'trail_gold', type: 'trail', price: 50, color: '#fde047', nameKey: 'trailGold' },
  { id: 'trail_fire', type: 'trail', price: 75, color: '#ef4444', nameKey: 'trailFire' },
  { id: 'trail_cyan', type: 'trail', price: 75, color: '#06b6d4', nameKey: 'trailCyan' },
  { id: 'bg_nebula', type: 'theme', price: 120, nameKey: 'themeNebula' },
  { id: 'bg_void', type: 'theme', price: 150, nameKey: 'themeVoid' },
  { id: 'bg_solar', type: 'theme', price: 180, nameKey: 'themeSolar' },
  { id: 'bg_galactic', type: 'theme', price: 200, nameKey: 'themeGalactic' }
];

/* Top görseli — hem oyunda hem mağaza önizlemesinde aynı bileşen */
function BallVisual({ skinId, level = 1, size = 32, shieldActive = false, boosted = false }) {
  return (
    <div className="ball-wrap" style={{ width: size, height: size }}>
      {shieldActive && <div className="ball-shield" />}
      {skinId === 'nova' && <div className="ball-corona" />}
      <div className={`ball-body ball-${skinId} ${boosted ? 'ball-boosted' : ''}`}>
        <div className="ball-facets" />
        <div className="ball-sheen" />
        <div className="ball-shade" />
        <div className="ball-spec" />
        <div className="ball-rim" />
        {level > 1 && <div className="ball-ring" style={{ opacity: (level - 1) * 0.28 }} />}
        {level >= 5 && <div className="ball-core" />}
      </div>
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

const badgeDefs = [
  { id: 'badge1', nameKey: 'badge1', descKey: 'badge1Desc', icon: '🌟', reward: 50, check: (s) => s.gamesPlayed >= 1 },
  { id: 'badge2', nameKey: 'badge2', descKey: 'badge2Desc', icon: '🪐', reward: 50, check: (s) => s.bestRun >= 10 },
  { id: 'badge3', nameKey: 'badge3', descKey: 'badge3Desc', icon: '💎', reward: 50, check: (s) => s.totalPerfects >= 3 },
  { id: 'badge4', nameKey: 'badge4', descKey: 'badge4Desc', icon: '💰', reward: 100, check: (s) => s.totalCrystalsEarned >= 500 }
];

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
  } catch (e) {}
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
  } catch(e) {}
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
  } catch (e) {}
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
  } catch (e) {}
};

const vibrate = (pattern) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
};

const loadJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
};
const saveJSON = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
};

let particleUid = 0;

function App() {
  const [lang, setLang] = useState(localStorage.getItem('orbitJumpLang') || 'en');
  const [gameState, setGameState] = useState('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState('normal');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const [soundOn, setSoundOn] = useState(() => {
    const saved = localStorage.getItem('orbit_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [playerName, setPlayerName] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
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

  const [crystals, setCrystals] = useState(0);
  const [runCrystals, setRunCrystals] = useState(0);
  const [ownedItems, setOwnedItems] = useState(['gold', 'trail_gold', 'bg_nebula']);
  const [ballLevels, setBallLevels] = useState({ gold: 1, ruby: 1, emerald: 1, nova: 1 });
  const [boostCounts, setBoostCounts] = useState({ shield: 0, slowmo: 0 });
  const [boostLevels, setBoostLevels] = useState({ shield: 1, slowmo: 1 });

  const [selectedSkin, setSelectedSkin] = useState('gold');
  const [selectedTrail, setSelectedTrail] = useState('trail_gold');
  const [selectedTheme, setSelectedTheme] = useState('bg_nebula');
  const [shopTab, setShopTab] = useState('balls');
  const [shopMessage, setShopMessage] = useState(null);
  const [upgradedBallId, setUpgradedBallId] = useState(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [adOverlay, setAdOverlay] = useState(false);

  const [dailyAdCount, setDailyAdCount] = useState(0);
  const planetTimerRef = useRef(1);
  const [supernovaActive, setSupernovaActive] = useState(false);

  const [stats, setStats] = useState({ totalPerfects: 0, gamesPlayed: 0, bestRun: 0, maxCombo: 0, totalCrystalsEarned: 0, bestRunPerfects: 0 });
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [claimedBadges, setClaimedBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streakDays, setStreakDays] = useState(1);
  const [lastStreakDate, setLastStreakDate] = useState('');

  const [comboCount, setComboCount] = useState(0);
  const [impactPulse, setImpactPulse] = useState(false);
  const slowMoUntilRef = useRef(0);

  const physicsRef = useRef({ active: { x: 0, y: 0 }, target: { x: 80, y: -440, vx: 2.0 }, ball: { x: 120, y: 0, vx: 0, vy: 0 }, angle: 0, isFlying: false, speed: 0.02, combo: 0, dead: false, camera: { x: 0, y: 200 } });

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
    trailColor: (shopItems.find((s) => s.id === selectedTrail) || {}).color || '#67e8f9'
  });
  useEffect(() => {
    liveRef.current = {
      score, highScore, runCrystals, shieldActive, gameMode,
      ballLevels, selectedSkin, soundOn,
      trailColor: (shopItems.find((s) => s.id === selectedTrail) || {}).color || '#67e8f9'
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
      } catch (e) {}
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
      try {
        const consentInfo = await AdMob.requestConsentInfo();
        if (consentInfo.status === AdmobConsentStatus.REQUIRED && consentInfo.isConsentFormAvailable) {
          await AdMob.showConsentForm();
        }
      } catch (e) {}

      try {
        await AdMob.initialize({ initializeForTesting: false });
      } catch (e) {}
    };
    initAdMob();
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('orbit_player_name');
    if (savedName) setPlayerName(savedName);
    else setShowNameModal(true);

    const savedHighScore = localStorage.getItem('orbit_highscore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));

    setCrystals(loadJSON('orbit_crystals', 60));
    setOwnedItems(loadJSON('orbit_owned_items', ['gold', 'trail_gold', 'bg_nebula']));
    setBallLevels(loadJSON('orbit_ball_levels', { gold: 1, ruby: 1, emerald: 1, nova: 1 }));
    setBoostCounts(loadJSON('orbit_boost_counts_v2', { shield: 0, slowmo: 0 }));
    setBoostLevels(loadJSON('orbit_boost_levels_v2', { shield: 1, slowmo: 1 }));
    setSelectedSkin(loadJSON('orbit_selected_skin', 'gold'));
    setSelectedTrail(loadJSON('orbit_selected_trail', 'trail_gold'));
    setSelectedTheme(loadJSON('orbit_selected_theme', 'bg_nebula'));
    setStats(loadJSON('orbit_stats', { totalPerfects: 0, gamesPlayed: 0, bestRun: 0, maxCombo: 0, totalCrystalsEarned: 0, bestRunPerfects: 0 }));
    setClaimedMissions(loadJSON('orbit_claimed_missions', []));
    setClaimedBadges(loadJSON('orbit_claimed_badges', []));
    setLeaderboard(loadJSON('orbit_leaderboard', []));
    setStreakDays(loadJSON('orbit_streak_days', 1));
    setLastStreakDate(localStorage.getItem('orbit_last_streak') || '');

    const today = new Date().toDateString();
    const storedAdDate = localStorage.getItem('orbit_last_ad_date');
    if (storedAdDate !== today) {
      setDailyAdCount(0);
      localStorage.setItem('orbit_last_ad_date', today);
      localStorage.setItem('orbit_daily_ad_count', '0');
    } else {
      setDailyAdCount(parseInt(localStorage.getItem('orbit_daily_ad_count') || '0', 10));
    }
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

  const watchRewardedAd = async (onSuccess) => {
    // Hata düzeltmesi: adOverlay zaten açıkken çift dokunuşla ikinci kez
    // tetiklenip AdMob listener'larının çakışmasını engeller.
    if (dailyAdCount >= 2 || adOverlay) return;
    playSound('click', soundOn); setAdOverlay(true);
    try {
      await AdMob.removeAllListeners();
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        const today = new Date().toDateString();
        setDailyAdCount(prev => {
          const nextCount = prev + 1;
          localStorage.setItem('orbit_daily_ad_count', nextCount.toString());
          return nextCount;
        });
        localStorage.setItem('orbit_last_ad_date', today);
        if (onSuccess) onSuccess();
      });
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => setAdOverlay(false));
      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => setAdOverlay(false));
      await AdMob.prepareRewardVideoAd({ adUnitId: 'ca-app-pub-1803044471635660/5387368632', isTesting: false });
      await AdMob.showRewardVideoAd();
    } catch (error) { setAdOverlay(false); }
  };

  const spawnParticles = (x, y, kind, themeColors) => {
    const isSupernova = kind === 'supernova';
    const isPerfect = kind === 'perfect';
    const isGreat = kind === 'great';
    const colors = isSupernova
      ? (themeColors && themeColors.length ? themeColors : ['#fde047', '#fb923c', '#ffffff'])
      : isPerfect ? ['#fde047', '#fbbf24', '#ffffff', '#fff7d6'] : isGreat ? ['#67e8f9', '#22d3ee', '#ffffff'] : ['#67e8f9', '#0ea5e9'];
    const count = isSupernova ? 46 : isPerfect ? 22 : isGreat ? 12 : 7;
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
        dot.style.boxShadow = `0 0 ${isSupernova ? 10 : 6}px ${color}`;
      }
    }
  };

  // YENİ VE GÜVENLİ autoSaveScore FONKSİYONU
  const autoSaveScore = async (finalScore) => {
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
    
    // Yalnızca yeni skor, cihazdaki eski rekoru geçerse veya eşitse Firebase'e kaydet
    if (finalScore >= savedHighScore && playerName) {
      try {
        // Arka planda anonim oturum aç (zaten açıksa mevcut olanı kullanır)
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;

        // addDoc yerine setDoc kullanarak oyuncunun UID'si ile belge oluştur/güncelle
        await setDoc(doc(db, "leaderboard", uid), {
          name: playerName,
          score: finalScore,
          uid: uid, 
          date: serverTimestamp()
        });
      } catch (e) {
        console.error("Firebase kayıt veya yetkilendirme hatası: ", e);
      }
    }
  };

  const fetchOnlineScores = async () => {
    setIsLoadingScores(true);
    setScoresFailed(false);
    try {
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const scores = [];
      querySnapshot.forEach((docSnap) => {
        scores.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOnlineLeaderboard(scores);
    } catch (e) {
      setScoresFailed(true);
    } finally {
      setIsLoadingScores(false);
    }
  };

  const finalizeRunStats = (finalScore, finalCrystals) => {
    setStats((s) => {
      const next = { ...s, gamesPlayed: s.gamesPlayed + 1, bestRun: Math.max(s.bestRun, finalScore), tempRunPerfects: 0 };
      saveJSON('orbit_stats', next);
      return next;
    });
    setCrystals((c) => {
      const next = c + finalCrystals;
      saveJSON('orbit_crystals', next);
      return next;
    });
  };

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    if (gameState === 'playing' && !adOverlay && !isPaused) {
      const render = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        if (deltaTime < 0.1) {
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
                  finalizeRunStats(live.score, live.runCrystals);
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
            {
              const trailColor = live.trailColor;
              const tIdx = trailCursorRef.current;
              trailPointsRef.current[tIdx] = { x: p.ball.x, y: p.ball.y, born: currentTime, color: trailColor };
              trailCursorRef.current = (tIdx + 1) % TRAIL_POOL_SIZE;
              const tDot = trailDotRefs.current[tIdx];
              if (tDot) {
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
              setImpactPulse(true); setTimeout(() => setImpactPulse(false), 120);

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

              if (kind === 'perfect') { playSound('perfect', live.soundOn, p.combo); vibrate([15, 25, 15]); }
              else { playSound('score', live.soundOn, p.combo); vibrate(12); }

              setScore((prevScore) => {
                const newScore = prevScore + gain + comboBonus;
                setHighScore((prevHigh) => {
                  if (newScore > prevHigh) { localStorage.setItem('orbit_highscore', newScore.toString()); return newScore; }
                  return prevHigh;
                });
                return newScore;
              });

              currentThemeIdxRef.current = nextThemeIdxRef.current;
              nextThemeIdxRef.current = (nextThemeIdxRef.current + 1) % planetThemes.length;
              applyPlanetTheme(activeGroupRef.current, planetThemes[currentThemeIdxRef.current]);
              applyPlanetTheme(targetGroupRef.current, planetThemes[nextThemeIdxRef.current]);

              p.speed = Math.min(0.02 + (live.score * 0.0035), 0.08);

              const direction = Math.random() > 0.5 ? 1 : -1;
              const randomSpeed = (1.9 + Math.random() * 1.8) * (1 + tierLevel * 0.15);
              p.target = { x: shiftX + ((Math.random() * 220) - 110), y: shiftY - (440 + tierLevel * 20), vx: direction * randomSpeed };
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
                finalizeRunStats(live.score, live.runCrystals);
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
            pt.vx *= 0.985; pt.vy *= 0.985;
          }

          let targetCamX, targetCamY;
          if (p.isFlying) {
            targetCamX = -p.ball.x;
            targetCamY = -p.ball.y + 200;
          } else {
            targetCamX = -p.active.x;
            targetCamY = -p.active.y + 200;
          }

          p.camera.x += (targetCamX - p.camera.x) * 0.14;
          p.camera.y += (targetCamY - p.camera.y) * 0.14;

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
            dot.style.opacity = String(0.15 + taper * 0.8);
            const sx = 0.3 + taper * 1.5;
            const sy = 0.4 + taper * 1.0;
            dot.style.transform = `translate(${-17 + pt.x}px, ${-3.5 + pt.y}px) rotate(${trailDir}deg) scale(${sx}, ${sy})`;
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
  }, [gameState, adOverlay, isPaused]);

  const handleJump = () => {
    if (isPaused || showNameModal) return;
    const p = physicsRef.current;
    if (!p.isFlying && gameState === 'playing' && !adOverlay) {
      p.isFlying = true; playSound('jump', soundOn); vibrate(8);
      p.ball.vx = Math.cos(p.angle) * 14; p.ball.vy = Math.sin(p.angle) * 14;
    }
  };

  const startGame = () => {
    playSound('click', soundOn); setIsPaused(false);
    currentThemeIdxRef.current = 0;
    nextThemeIdxRef.current = 1;
    applyPlanetTheme(activeGroupRef.current, planetThemes[0]);
    applyPlanetTheme(targetGroupRef.current, planetThemes[1]);

    physicsRef.current = { active: { x: 0, y: 0 }, target: { x: 80, y: -440, vx: 2.0 }, ball: { x: 120, y: 0, vx: 0, vy: 0 }, angle: 0, isFlying: false, speed: 0.02, combo: 0, dead: false, camera: { x: 0, y: 200 } };
    trailPointsRef.current = new Array(TRAIL_POOL_SIZE).fill(null);
    trailCursorRef.current = 0;
    particlesRef.current = new Array(PARTICLE_POOL_SIZE).fill(null);
    particleCursorRef.current = 0;
    shakeUntilRef.current = 0;
    if (flashRef.current) flashRef.current.style.opacity = '0';
    setScore(0); setComboCount(0); setRunCrystals(0); setPopup(null); setImpactPulse(false); setShieldActive(false); setSupernovaActive(false); planetTimerRef.current = 1; resetPlanetVisual(); slowMoUntilRef.current = 0; setGameState('playing');
  };

  const continueGameWithAd = () => {
    watchRewardedAd(() => {
      const p = physicsRef.current; p.dead = false; p.isFlying = false; p.ball.x = p.active.x + 120; p.ball.y = p.active.y; p.angle = 0; planetTimerRef.current = 1; resetPlanetVisual(); setShieldActive(true); setIsPaused(false); setGameState('playing'); playSound('shield', soundOn);
    });
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

  const claimStreakBonus = () => {
    const today = new Date().toDateString(); if (lastStreakDate === today) return;
    const daysSinceLastClaim = lastStreakDate ? Math.round((new Date(today) - new Date(lastStreakDate)) / 86400000) : null;
    const nextStreak = daysSinceLastClaim === 1 ? streakDays + 1 : 1;
    const reward = nextStreak * 15; const nextCrystals = crystals + reward;
    setCrystals(nextCrystals); setStreakDays(nextStreak); setLastStreakDate(today);
    saveJSON('orbit_crystals', nextCrystals); saveJSON('orbit_streak_days', nextStreak); localStorage.setItem('orbit_last_streak', today);
    playSound('coin', soundOn); vibrate(15);
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
    playSound('perfect', soundOn); vibrate([10, 15, 10]);
  };

  const claimBadge = (badge) => {
    const unlocked = badge.check(stats);
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
  const shownScores = (scoresFailed || onlineLeaderboard.length === 0) ? leaderboard : onlineLeaderboard;

  const PlanetBody = ({ innerRef, isSupernova, glowRef }) => (
    <>
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
        <div className="planet-layer p-bands" />
        <div className="planet-layer p-craters" />
        <div className="planet-layer p-land" />
        <div className="planet-layer p-clouds" />
        <div className="planet-layer p-ice" />
        <div className="planet-layer p-lava" />
        <div className="planet-layer p-storm" />
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
    </>
  );

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-black flex items-center justify-center overflow-hidden m-0 p-0"
      style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white font-sans overflow-hidden select-none relative m-0 p-0"
        style={{ width: '100vw', height: '100vh', WebkitTapHighlightColor: 'transparent', transform: `scale(${impactPulse || supernovaActive ? 1.04 : 1})`, transition: 'transform 0.08s ease-out' }}
        onClick={handleJump}
      >
        <style>{`
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
                          --p-bands:0; --p-craters:0; --p-land:0; --p-ice:0; --p-storm:0; --p-lava:0; --p-ring-on:0; }
          .planet { position: relative; width: 132px; height: 132px; border-radius: 50%; overflow: hidden;
                    box-shadow: 0 0 70px rgba(var(--p-glow), .65), 0 0 150px rgba(var(--p-glow), .3), 0 0 18px rgba(255,255,255,.15);
                    transform: scale(1); z-index: 25; }
          .planet-layer { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; }

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

          .p-land { opacity: var(--p-land); mix-blend-mode: multiply; background-size: 200% 100%; animation: surfaceDrift 40s linear infinite;
                    background-image:
                      radial-gradient(ellipse 26% 18% at 28% 40%, rgba(12,74,44,.95), transparent 70%),
                      radial-gradient(ellipse 18% 26% at 58% 62%, rgba(9,60,36,.95), transparent 70%),
                      radial-gradient(ellipse 14% 12% at 76% 30%, rgba(16,84,50,.9), transparent 70%),
                      radial-gradient(ellipse 20% 10% at 42% 82%, rgba(12,70,42,.85), transparent 70%); }

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
                     background-image: radial-gradient(ellipse 15% 10% at 68% 62%, rgba(255,240,245,.9) 0%, rgba(190,24,93,.85) 45%, transparent 72%); }
          @keyframes stormSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .p-terminator { background:
                            radial-gradient(circle at 76% 76%, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 34%, transparent 66%),
                            linear-gradient(118deg, transparent 38%, rgba(0,0,0,.55) 100%); }

          .p-spec { background: radial-gradient(circle at 30% 25%, rgba(255,255,255,.78) 0%, rgba(255,255,255,.22) 14%, transparent 34%); }

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
                         opacity: calc(var(--p-ring-on) * .95); transform: rotate(-16deg);
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

          .ball-gold { border-radius: 50%;
                       background: radial-gradient(circle at 34% 28%, #fffdf0 0%, #fde047 34%, #d9a406 66%, #6b4302 100%);
                       box-shadow: 0 0 28px rgba(253,224,71,.95), 0 0 50px rgba(253,224,71,.4), inset -4px -5px 10px rgba(0,0,0,.6); }
          .ball-ruby { clip-path: polygon(50% 0%, 92% 24%, 92% 76%, 50% 100%, 8% 76%, 8% 24%);
                       background: linear-gradient(142deg, #ffe4e6 0%, #fb7185 32%, #be123c 66%, #4c0519 100%);
                       filter: drop-shadow(0 0 16px rgba(251,113,133,1)) drop-shadow(0 0 30px rgba(251,113,133,.45)); }
          .ball-emerald { clip-path: polygon(26% 2%, 74% 2%, 98% 50%, 74% 98%, 26% 98%, 2% 50%);
                          background: linear-gradient(138deg, #ecfdf5 0%, #6ee7b7 28%, #059669 62%, #052e1c 100%);
                          filter: drop-shadow(0 0 16px rgba(74,222,128,1)) drop-shadow(0 0 30px rgba(74,222,128,.45)); }
          .ball-nova { border-radius: 50%;
                       background: radial-gradient(circle at 42% 36%, #ffffff 0%, #ddd6fe 20%, #8b5cf6 56%, #3b0764 100%);
                       box-shadow: 0 0 32px rgba(167,139,250,1), 0 0 55px rgba(167,139,250,.5), inset -3px -4px 10px rgba(0,0,0,.55); }

          .ball-rim { border-radius: inherit; mix-blend-mode: screen; opacity: .85;
                      background: conic-gradient(from -40deg, transparent 0deg, rgba(255,255,255,.6) 30deg, transparent 70deg, transparent 360deg); }

          .ball-facets { opacity: 0; }
          .ball-ruby .ball-facets, .ball-emerald .ball-facets { opacity: 1; mix-blend-mode: overlay;
            background-image: linear-gradient(90deg, transparent 49%, rgba(255,255,255,.55) 50%, transparent 51%),
                              linear-gradient(35deg, transparent 47%, rgba(0,0,0,.4) 48%, transparent 49%),
                              linear-gradient(-35deg, transparent 47%, rgba(255,255,255,.35) 48%, transparent 49%); }

          .ball-sheen { opacity: 0; }
          .ball-gold .ball-sheen, .ball-nova .ball-sheen { opacity: 1; border-radius: 50%; mix-blend-mode: screen;
            background: conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,.55) 40deg, transparent 110deg, transparent 360deg);
            animation: sheenSpin 2.6s linear infinite; }
          .ball-nova .ball-sheen { animation-duration: 1.3s; }
          @keyframes sheenSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

          .ball-shade { background: radial-gradient(circle at 74% 76%, rgba(0,0,0,.55) 0%, transparent 56%); }
          .ball-spec { background: radial-gradient(circle at 31% 26%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.25) 11%, transparent 26%); }

          .ball-ring { border-radius: 50%; margin: 2px; border: 1px solid rgba(255,255,255,.7); }
          .ball-core { margin: auto; width: 32%; height: 32%; border-radius: 50%; background: #fff;
                       box-shadow: 0 0 10px #fff, 0 0 20px rgba(255,255,255,.7); animation: corePulse 1.1s ease-in-out infinite; }
          @keyframes corePulse { 0%,100% { transform: scale(.85); opacity: .85; } 50% { transform: scale(1.12); opacity: 1; } }

          .ball-corona { position: absolute; inset: -30%; border-radius: 50%; pointer-events: none;
                         background: radial-gradient(circle, rgba(167,139,250,.45) 0%, transparent 62%);
                         animation: coronaPulse 1.6s ease-in-out infinite; }
          @keyframes coronaPulse { 0%,100% { transform: scale(.9); opacity: .55; } 50% { transform: scale(1.18); opacity: .95; } }

          .ball-shield { position: absolute; inset: -22%; border-radius: 50%; border: 2px solid #22d3ee;
                         box-shadow: 0 0 16px rgba(34,211,238,.8); animation: shieldPing 1.2s ease-out infinite; }
          @keyframes shieldPing { 0% { transform: scale(.9); opacity: .9; } 100% { transform: scale(1.35); opacity: 0; } }

          .trail-dot { position: absolute; width: 34px; height: 7px; border-radius: 50%; pointer-events: none; }

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
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={12}
            />
            <button
              onClick={() => {
                if (nameInput.trim().length > 0) {
                  const finalName = nameInput.trim().substring(0, 12);
                  setPlayerName(finalName);
                  localStorage.setItem('orbit_player_name', finalName);
                  setShowNameModal(false);
                  playSound('perfect', soundOn);
                }
              }}
              className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3 px-10 rounded-full text-lg shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              {t.saveAndStart}
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
          <div className={`absolute top-1/4 left-1/4 w-[700px] h-[700px] ${currentAccent} rounded-full blur-[140px] pointer-events-none transition-colors duration-700`}></div>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={`star-${i}`} className="absolute rounded-full bg-white pointer-events-none" style={{ width: 1.5, height: 1.5, left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite` }}></div>
          ))}
        </div>

        <div className="absolute top-10 right-6 flex items-center gap-3 z-50" style={{ marginTop: 'env(safe-area-inset-top)' }}>
          {gameState === 'playing' && <div className="pointer-events-none flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold px-4 h-12 rounded-full text-lg shadow-md">💎 {runCrystals}</div>}
          {gameState === 'playing' && <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setIsPaused(true); }} className="w-12 h-12 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">⏸️</button>}
          {gameState === 'playing' && <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); exitToMenu(); }} className="w-12 h-12 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">🏠</button>}
          <button onClick={(e) => { e.stopPropagation(); toggleSound(); }} className="w-12 h-12 bg-slate-900/90 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer shadow-md">{soundOn ? '🔊' : '🔇'}</button>
        </div>

        {gameState === 'menu' && (
          <div className="flex flex-col items-center z-10 px-4 pt-8">
            <div
              className="planet-group relative flex items-center justify-center mb-6"
              style={{
                width: 90, height: 90,
                '--p-light': '#ffd9a8', '--p-mid': '#ea580c', '--p-dark': '#2f0d03',
                '--p-glow': '234,88,12', '--p-ring-rgb': '249,115,22',
                '--p-craters': 0.85, '--p-lava': 0.9, '--p-ring-on': 0
              }}
            >
              <div style={{ transform: 'scale(0.62)' }} className="flex items-center justify-center">
                <PlanetBody isSupernova={false} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 text-center">{t.title}</h1>
            <p className="text-slate-400 mb-3 tracking-wider font-semibold text-sm">{playerName ? `👤 ${playerName} | ` : ''}{t.best}: {highScore}</p>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameMode('normal'); }} className={`py-1.5 px-3 rounded-full text-[11px] font-bold border cursor-pointer ${gameMode === 'normal' ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>
                {t.modeNormal}
              </button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameMode('supernova'); }} className={`py-1.5 px-3 rounded-full text-[11px] font-bold border cursor-pointer ${gameMode === 'supernova' ? 'bg-red-600 border-red-400 text-white font-black animate-pulse' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>
                {t.modeSupernova}
              </button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameMode('zen'); }} className={`py-1.5 px-3 rounded-full text-[11px] font-bold border cursor-pointer ${gameMode === 'zen' ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>
                {t.modeZen}
              </button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameMode('fast'); }} className={`py-1.5 px-3 rounded-full text-[11px] font-bold border cursor-pointer ${gameMode === 'fast' ? 'bg-amber-500 border-amber-300 text-slate-950 font-black' : 'bg-slate-900/90 border-slate-700 text-slate-300'}`}>
                {t.modeFast}
              </button>
            </div>

            <button onClick={(e) => { e.stopPropagation(); startGame(); }} className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3.5 px-14 rounded-full text-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] mb-3 cursor-pointer">{t.play}</button>
            <button onClick={(e) => { e.stopPropagation(); if (!isAdLimitReached) { watchRewardedAd(() => { const nextCrystals = crystals + 50; setCrystals(nextCrystals); saveJSON('orbit_crystals', nextCrystals); playSound('coin', soundOn); }); } }} disabled={isAdLimitReached} className={`flex items-center gap-2 font-black py-2.5 px-6 rounded-full text-xs mb-3 ${isAdLimitReached ? 'bg-slate-900/60 text-slate-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'}`}>
              📺 {isAdLimitReached ? t.adLimitReached : `${t.watchAdReward} (${2 - dailyAdCount}/2)`}
            </button>
            <button onClick={(e) => { e.stopPropagation(); claimStreakBonus(); }} disabled={!isStreakReady} className={`flex items-center gap-2 font-bold py-2 px-5 rounded-full text-xs mb-4 ${isStreakReady ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 animate-pulse' : 'bg-slate-900/60 text-slate-500'}`}>
              🔥 {t.streakTitle} ({t.dayWord} {streakDays}) {isStreakReady ? `(💎 +${streakDays * 15})` : t.streakClaimed}
            </button>
            <div className="flex flex-wrap justify-center gap-2.5 mb-5 max-w-md">
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('badges'); }} className="bg-slate-900/90 border border-slate-700/60 text-yellow-300 font-bold py-2 px-3 rounded-full text-xs shadow-md">🏅 {t.badges}</button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('howtoplay'); }} className="bg-slate-900/90 border border-slate-700/60 text-teal-300 font-bold py-2 px-3 rounded-full text-xs shadow-md">❓ {t.howToPlay}</button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('leaderboard'); fetchOnlineScores(); }} className="bg-slate-900/90 border border-slate-700/60 text-amber-300 font-bold py-2 px-3 rounded-full text-xs shadow-md">👑 {t.leaderboard}</button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('missions'); }} className="bg-slate-900/90 border border-slate-700/60 text-slate-200 font-bold py-2 px-3 rounded-full text-xs shadow-md">🏆 {t.missions}</button>
              <button onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('shop'); }} className="bg-slate-900/90 border border-slate-700/60 text-cyan-300 font-bold py-2 px-3 rounded-full text-xs shadow-md">🛒 {t.shop}</button>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-2 px-3 rounded-full text-xs shadow-md">💎 {crystals}</div>
            </div>
            <div className="flex gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800">
              {Object.keys(translations).map((l) => (
                <button key={l} onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setLang(l); localStorage.setItem('orbitJumpLang', l); }} className={`w-9 h-9 rounded-full font-bold uppercase text-xs ${lang === l ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>{l}</button>
              ))}
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
            <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {badgeDefs.map((b) => {
                const unlocked = b.check(stats);
                const claimed = claimedBadges.includes(b.id);
                return (
                  <div key={b.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${unlocked ? 'bg-slate-950/80 border-yellow-500/50' : 'bg-slate-950/30 border-slate-800 opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-slate-900 p-2.5 rounded-2xl border border-slate-800">{b.icon}</div>
                      <div>
                        <p className={`font-bold text-sm ${unlocked ? 'text-yellow-300' : 'text-slate-400'}`}>{t[b.nameKey]}</p>
                        <p className="text-xs text-slate-500">{t[b.descKey]}</p>
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

              {shopItems.filter(s => (shopTab === 'balls' && s.type === 'ball') || (shopTab === 'trails' && s.type === 'trail') || (shopTab === 'themes' && s.type === 'theme')).map((item) => {
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
              <p className="text-slate-400 text-xs mb-1">{t.score}</p>
              <p className="text-3xl font-black text-cyan-400 mb-3">{score}</p>
              <p className="text-xs text-cyan-300 font-bold mb-5">💎 +{runCrystals}</p>
              <button onClick={continueGameWithAd} disabled={isAdLimitReached} className={`w-full font-black py-3 px-4 rounded-xl text-sm shadow-md ${isAdLimitReached ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'}`}>
                📺 {isAdLimitReached ? t.adLimitReached : t.watchAdContinue}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startGame()} className="bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 font-black py-3 px-6 rounded-full text-base shadow-md">{t.restart}</button>
              <button onClick={() => { playSound('click', soundOn); setGameState('menu'); }} className="bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-full text-base border border-slate-700">{t.menu}</button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none z-[95]" style={{ opacity: 0 }}></div>
            <div className="absolute top-6 left-12 z-50 pointer-events-none">
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

            {popup && (
              <div className={`absolute z-50 pointer-events-none font-black text-2xl left-1/2 top-1/2 ${popup.kind === 'perfect' ? 'text-yellow-300' : 'text-cyan-300'}`} style={{ animation: 'popFloat 0.65s ease-out forwards', transform: 'translate(-50%, -50%)' }}>
                {popup.text} {popup.kind === 'perfect' ? `✨ ${t.perfect}` : ''}
              </div>
            )}

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
                {supernovaActive && <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 opacity-90 blur-xl z-40 pointer-events-none animate-ping"></div>}
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
