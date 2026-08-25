import { useState, useEffect, useRef } from 'react';

// 5 Farklı Dil İçin Genişletilmiş Sözlük (Günlük Reklam Sınırı Dahil)
const translations = {
  en: {
    title: "ORBIT JUMP", play: "PLAY", score: "SCORE", best: "BEST", gameOver: "GAME OVER",
    restart: "TRY AGAIN", menu: "MENU", shop: "SHOP", missions: "MISSIONS", leaderboard: "LEADERBOARD", badges: "BADGES", back: "BACK",
    crystals: "CRYSTALS", claim: "CLAIM", claimed: "CLAIMED", owned: "OWNED", select: "SELECT",
    selected: "SELECTED", perfect: "PERFECT", great: "GREAT", combo: "COMBO", enterName: "ENTER YOUR NAME", saveScore: "SAVE SCORE",
    dailyBonus: "DAILY BONUS", shield: "SHIELD", slowmo: "SLOW-MO", buy: "BUY", upgrade: "UPGRADE", level: "LVL", max: "MAX",
    watchAdReward: "WATCH AD (+50 💎)", watchAdContinue: "WATCH AD & CONTINUE", adPlaying: "📺 WATCHING AD...",
    adLimitReached: "DAILY AD LIMIT REACHED (2/2)",
    modeNormal: "NORMAL MODE", modeSupernova: "SUPERNOVA MODE (5s / 2x Gems)",
    howToPlay: "HOW TO PLAY & FEATURES",
    helpRule1: "Tap anywhere on the screen to jump from your current planet to the next one.",
    helpRule2: "Landing close to the edge gives 'Perfect' (+3 score) and triggers slow-mo.",
    helpRule3: "You have 10 seconds per planet in Normal Mode (5s in Supernova Mode). Act fast before it explodes!",
    helpRule4: "Use Shield (🛡️) to survive a miss and Slow-Mo (⏳) to time your jumps easier.",
    helpBallFeature: "Ball Upgrades: Higher ball levels give extra Crystal bonuses and expand Perfect jump pixels!",
    streakTitle: "DAILY STREAK BONUS", streakClaimed: "COLLECTED TODAY", streakBtn: "CLAIM STREAK",
    tabBalls: "BALLS", tabBoosts: "BOOSTS", tabTrails: "TRAILS", tabThemes: "THEMES",
    badge1: "Supernova Survivor", badge1Desc: "Successfully jump to a new planet",
    badge2: "Cosmic Traveler", badge2Desc: "Reach 10 planets in a single run",
    badge3: "Perfectionist", badge3Desc: "Land 3 Perfect jumps total",
    tierEasy: "EASY", tierNormal: "NORMAL", tierHard: "HARD", tierInsane: "INSANE", tierImpossible: "IMPOSSIBLE",
    m1: "Reach 10 planets in one run", m2: "Land 5 Perfect Jumps (total)", m3: "Play 10 runs (total)",
    m4: "Reach 20 planets in one run", m5: "Land 20 Perfect Jumps (total)",
    m6: "Hit a 3x Combo streak", m7: "Collect a total of 100 crystals", m8: "Land 3 Perfect Jumps in a single run"
  },
  tr: {
    title: "YÖRÜNGE", play: "OYNA", score: "SKOR", best: "REKOR", gameOver: "OYUN BİTTİ",
    restart: "TEKRAR DENE", menu: "MENÜ", shop: "MAĞAZA", missions: "GÖREVLER", leaderboard: "SKOR TABLOSU", badges: "ROZETLER", back: "GERİ",
    crystals: "KRİSTAL", claim: "AL", claimed: "ALINDI", owned: "SAHİPSİN", select: "SEÇ",
    selected: "SEÇİLİ", perfect: "MÜKEMMEL", great: "İYİ", combo: "SERİ", enterName: "İSMİNİ YAZ", saveScore: "KAYDET",
    dailyBonus: "GÜNLÜK SERİ", shield: "KALKAN", slowmo: "YAVAŞLATICI", buy: "SATIN AL", upgrade: "GELİŞTİR", level: "SEVİYE", max: "MAKS",
    watchAdReward: "REKLAM İZLE (+50 💎)", watchAdContinue: "REKLAM İZLE & DEVAM ET", adPlaying: "📺 REKLAM OYNATILIYOR...",
    adLimitReached: "GÜNLÜK REKLAM HAKKI DOLDU (2/2)",
    modeNormal: "NORMAL MOD", modeSupernova: "SÜPERNOVA MODU (5sn / 2x Kristal)",
    howToPlay: "OYANIŞ & ÖZELLİKLER",
    helpRule1: "Mevcut gezegenden sonrakine zıplamak için ekrana herhangi bir yere dokun.",
    helpRule2: "Gezegenin kenarına yakın konmak 'Mükemmel' (+3 skor) kazandırır ve yavaşlatıcı açar.",
    helpRule3: "Normal Modda gezegen başına 10 saniyen var (Süpernova Modunda 5sn). Patlamadan acele et!",
    helpRule4: "Kaçırmalara karşı Kalkan (🛡️) ve atışlarını kolaylaştırmak için Yavaşlatıcı (⏳) kullan.",
    helpBallFeature: "Top Geliştirmeleri: Top seviyesi yükseldikçe ekstra Kristal bonusu alırsın ve Mükemmel atlayış pikselleri esner!",
    streakTitle: "GÜNLÜK SERİ ÖDÜLÜ", streakClaimed: "BUGÜN ALINDI", streakBtn: "SERİYİ AL",
    tabBalls: "TOPLAR", tabBoosts: "GÜÇLER", tabTrails: "İZLER", tabThemes: "TEMALAR",
    badge1: "Süpernova Yolcusu", badge1Desc: "Herhangi bir gezegene başarıyla zıpla",
    badge2: "Kozmik Gezgin", badge2Desc: "Tek turda 10 gezegene ulaş",
    badge3: "Mükemmeliyetçi", badge3Desc: "Toplamda 3 Mükemmel atlayış yap",
    tierEasy: "KOLAY", tierNormal: "NORMAL", tierHard: "ZOR", tierInsane: "ÇILGIN", tierImpossible: "İMKANSIZ",
    m1: "Bir turda 10 gezegene ulaş", m2: "Toplam 5 Mükemmel Atlayış yap", m3: "Toplam 10 tur oyna",
    m4: "Bir turda 20 gezegene ulaş", m5: "Toplam 20 Mükemmel Atlayış yap",
    m6: "3'lü Kombo seri yakala", m7: "Toplam 100 kristal topla", m8: "Tek turda 3 Mükemmel Atlayış yap"
  },
  es: {
    title: "SALTO ÓRBITA", play: "JUGAR", score: "PUNTAJE", best: "MEJOR", gameOver: "FIN DEL JUEGO",
    restart: "INTENTAR DE NUEVO", menu: "MENÚ", shop: "TIENDA", missions: "MISIONES", leaderboard: "TABLA", badges: "INSIGNIAS", back: "ATRÁS",
    crystals: "CRISTALES", claim: "RECLAMAR", claimed: "RECLAMADO", owned: "OBTENIDO", select: "ELEGIR",
    selected: "ELEGIDO", perfect: "PERFECTO", great: "GENIAL", combo: "COMBO", enterName: "ESCRIBE TU NOMBRE", saveScore: "GUARDAR",
    dailyBonus: "BONO DIARIO", shield: "ESCUDO", slowmo: "CÁMARA LENTA", buy: "COMPRAR", upgrade: "MEJORAR", level: "NV", max: "MÁX",
    watchAdReward: "VER ANUNCIO (+50 💎)", watchAdContinue: "VER ANUNCIO Y CONTINUAR", adPlaying: "📺 REPRODUCIENDO...",
    adLimitReached: "LÍMITE DIARIO ALCANZADO (2/2)",
    modeNormal: "MODO NORMAL", modeSupernova: "MODO SUPERNOVA (5s / 2x Gemas)",
    howToPlay: "CÓMO JUGAR Y CARACTERÍSTICAS",
    helpRule1: "Toca en cualquier lugar de la pantalla para saltar al siguiente planeta.",
    helpRule2: "Aterrizar cerca del borde otorga 'Perfecto' (+3 puntos) y activa cámara lenta.",
    helpRule3: "Tienes 10s por planeta en Modo Normal (5s en Modo Supernova). ¡Actúa rápido!",
    helpRule4: "Usa Escudo (🛡️) y Cámara Lenta (⏳) para sobrevivir y mejorar tu puntaje.",
    helpBallFeature: "Mejoras de Bola: ¡Los niveles altos otorgan bonos de cristales y mejoran los saltos perfectos!",
    streakTitle: "BONO DE RACHA DIARIA", streakClaimed: "RECLAMADO HOY", streakBtn: "RECLAMAR RACHA",
    tabBalls: "BOLAS", tabBoosts: "PODERES", tabTrails: "ESTELAS", tabThemes: "TEMAS",
    badge1: "Superviviente", badge1Desc: "Salta a un nuevo planeta con éxito",
    badge2: "Viajero Cósmico", badge2Desc: "Llega a 10 planetas en una partida",
    badge3: "Perfeccionista", badge3Desc: "Logra 3 saltos perfectos",
    tierEasy: "FÁCIL", tierNormal: "NORMAL", tierHard: "DIFÍCIL", tierInsane: "INSANO", tierImpossible: "IMPOSIBLE",
    m1: "Llega a 10 planetas en una partida", m2: "Logra 5 Saltos Perfectos (total)", m3: "Juega 10 partidas (total)",
    m4: "Llega a 20 planetas en una partida", m5: "Logra 20 Saltos Perfectos (total)",
    m6: "Alcanza un combo de 3x", m7: "Recolecta un total de 100 cristales", m8: "Logra 3 Saltos Perfectos en una partida"
  },
  de: {
    title: "ORBIT SPRUNG", play: "SPIELEN", score: "PUNKTE", best: "BESTE", gameOver: "SPIEL VORBEI",
    restart: "NOCHMAL", menu: "MENÜ", shop: "SHOP", missions: "MISSIONEN", leaderboard: "BESTENLISTE", badges: "ABZEICHEN", back: "ZURÜCK",
    crystals: "KRISTALLE", claim: "ABHOLEN", claimed: "ABGEHOLT", owned: "BESESSEN", select: "WÄHLEN",
    selected: "GEWÄHLT", perfect: "PERFEKT", great: "GUT", combo: "COMBO", enterName: "NAME EINGEBEN", saveScore: "SPEICHERN",
    dailyBonus: "TÄGLICHER BONUS", shield: "SCHILD", slowmo: "SLOW-MO", buy: "KAUFEN", upgrade: "UPGRADE", level: "LVL", max: "MAX",
    watchAdReward: "WERBUNG SEHEN (+50 💎)", watchAdContinue: "WERBUNG SEHEN & WEITER", adPlaying: "📺 WERBUNG LÄUFT...",
    adLimitReached: "TÄGLICHES LIMIT ERREICHT (2/2)",
    modeNormal: "NORMALER MODUS", modeSupernova: "SUPERNOVA MODUS (5s / 2x Kristalle)",
    howToPlay: "SPIELANLEITUNG & FUNKTIONEN",
    helpRule1: "Tippe irgendwo auf den Bildschirm, um zum nächsten Planeten zu springen.",
    helpRule2: "Landungen am Rand geben 'Perfekt' (+3 Punkte) und Slow-Mo.",
    helpRule3: "Du hast 10s pro Planet im Normalmodus (5s im Supernova-Modus). Beeile dich!",
    helpRule4: "Nutze Schild (🛡️) und Slow-Mo (⏳), um länger zu überleben.",
    helpBallFeature: "Ball-Upgrades: Höhere Stufen geben Kristallboni und erleichtern perfekte Sprünge!",
    streakTitle: "TÄGLICHER SERIENBONUS", streakClaimed: "HEUTE GEHOLT", streakBtn: "BONUS HOLEN",
    tabBalls: "BÄLLE", tabBoosts: "BOOSTS", tabTrails: "SPUREN", tabThemes: "THEMEN",
    badge1: "Überlebender", badge1Desc: "Springe erfolgreich zu einem Planeten",
    badge2: "Kosmischer Reisender", badge2Desc: "Erreiche 10 Planeten in einem Lauf",
    badge3: "Perfektionist", badge3Desc: "Lande 3 perfekte Sprünge gesamt",
    tierEasy: "LEICHT", tierNormal: "NORMAL", tierHard: "SCHWER", tierInsane: "WAHNSINN", tierImpossible: "UNMÖGLICH",
    m1: "Erreiche 10 Planeten in einem Lauf", m2: "Lande 5 perfekte Sprünge (gesamt)", m3: "Spiele 10 Runden (gesamt)",
    m4: "Erreiche 20 Planeten in einem Lauf", m5: "Lande 20 perfekte Sprünge (gesamt)",
    m6: "Erreiche eine 3er-Kombo", m7: "Sammle insgesamt 100 Kristalle", m8: "Lande 3 perfekte Sprünge in einem Lauf"
  },
  ru: {
    title: "ПРЫЖОК ОРБИТЫ", play: "ИГРАТЬ", score: "СЧЕТ", best: "РЕКОРД", gameOver: "ИГРА ОКОНЧЕНА",
    restart: "ПОВТОРИТЬ", menu: "МЕНЮ", shop: "МАГАЗИН", missions: "ЗАДАНИЯ", leaderboard: "ТАБЛИЦА", badges: "ЗНАЧКИ", back: "НАЗАД",
    crystals: "КРИСТАЛЛЫ", claim: "ЗАБРАТЬ", claimed: "ПОЛУЧЕНО", owned: "ЕСТЬ", select: "ВЫБРАТЬ",
    selected: "ВЫБРАНО", perfect: "ИДЕАЛЬНО", great: "ОТЛИЧНО", combo: "КОМБО", enterName: "ВВЕДИТЕ ИМЯ", saveScore: "СОХРАНИТЬ",
    dailyBonus: "ЕЖЕДНЕВНЫЙ БОНУС", shield: "ЩИТ", slowmo: "ЗАМЕДЛЕНИЕ", buy: "КУПИТЬ", upgrade: "УЛУЧШИТЬ", level: "УР", max: "МАКС",
    watchAdReward: "СМОТРЕТЬ РЕКЛАМУ (+50 💎)", watchAdContinue: "СМОТРЕТЬ И ПРОДОЛЖИТЬ", adPlaying: "📺 РЕКЛАМА...",
    adLimitReached: "ЛИМИТ ИСЧЕРПАН (2/2)",
    modeNormal: "ОБЫЧНЫЙ РЕЖИМ", modeSupernova: "РЕЖИМ СУПЕРНОВА (5с / 2х Кристаллы)",
    howToPlay: "ПРАВИЛА И ОСОБЕННОСТИ",
    helpRule1: "Нажмите в любом месте экрана, чтобы перепрыгнуть на следующую планету.",
    helpRule2: "Точное приземление дает 'Идеально' (+3 очка) и замедление времени.",
    helpRule3: "У вас есть 10 секунд на планету (5с в режиме Супернова). Поспешите!",
    helpRule4: "Используйте Щит (🛡️) и Замедление (⏳) для прохождения сложных уровней.",
    helpBallFeature: "Улучшение шаров: Уровни шаров дают бонусы кристаллов и расширяют зону идеального прыжка!",
    streakTitle: "ЕЖЕДНЕВНАЯ СЕРИЯ БОНУСОВ", streakClaimed: "ПОЛУЧЕНО СЕГОДНЯ", streakBtn: "ЗАБРАТЬ БОНУС",
    tabBalls: "ШАРЫ", tabBoosts: "СИЛЫ", tabTrails: "СЛЕДЫ", tabThemes: "ТЕМЫ",
    badge1: "Путник", badge1Desc: "Успешно прыгните на планету",
    badge2: "Космический Странник", badge2Desc: "Достигните 10 планет за забег",
    badge3: "Перфекционист", badge3Desc: "Совершите 3 идеальных прыжка",
    tierEasy: "ЛЕГКО", tierNormal: "НОРМА", tierHard: "СЛОЖНО", tierInsane: "БЕЗУМИЕ", tierImpossible: "НЕВОЗМОЖНО",
    m1: "Достигни 10 планет за один забег", m2: "Соверши 5 идеальных прыжков (всего)", m3: "Сыграй 10 забегов (всего)",
    m4: "Достигни 20 планет за один забег", m5: "Соверши 20 идеальных прыжков (всего)",
    m6: "Добейся комбо 3х", m7: "Собери в сумме 100 кристаллов", m8: "Соверши 3 идеальных прыжка за один забег"
  }
};

const planetThemes = [
  {
    planet: "bg-[radial-gradient(circle_at_30%_30%,_#fed7aa,_#ea580c,_#431407)] shadow-[0_0_80px_rgba(234,88,12,0.5),inset_-20px_-20px_40px_rgba(0,0,0,0.95),inset_10px_10px_20px_rgba(255,255,255,0.6)] border-orange-500/70",
    ring: "border-orange-300/50 shadow-[0_0_20px_rgba(249,115,22,0.7)]"
  },
  {
    planet: "bg-[radial-gradient(circle_at_30%_30%,_#fbcfe8,_#db2777,_#500724)] shadow-[0_0_80px_rgba(219,39,119,0.5),inset_-20px_-20px_40px_rgba(0,0,0,0.95),inset_10px_10px_20px_rgba(255,255,255,0.6)] border-pink-500/70",
    ring: "border-pink-300/50 shadow-[0_0_20px_rgba(236,72,153,0.7)]"
  },
  {
    planet: "bg-[radial-gradient(circle_at_30%_30%,_#a7f3d0,_#059669,_#022c22)] shadow-[0_0_80px_rgba(5,150,105,0.5),inset_-20px_-20px_40px_rgba(0,0,0,0.95),inset_10px_10px_20px_rgba(255,255,255,0.6)] border-emerald-500/70",
    ring: "border-emerald-300/50 shadow-[0_0_20px_rgba(16,185,129,0.7)]"
  },
  {
    planet: "bg-[radial-gradient(circle_at_30%_30%,_#c7d2fe,_#4f46e5,_#1e1b4b)] shadow-[0_0_80px_rgba(79,70,229,0.5),inset_-20px_-20px_40px_rgba(0,0,0,0.95),inset_10px_10px_20px_rgba(255,255,255,0.6)] border-indigo-500/70",
    ring: "border-indigo-300/50 shadow-[0_0_20px_rgba(99,102,241,0.7)]"
  },
  {
    planet: "bg-[radial-gradient(circle_at_30%_30%,_#a5f3fc,_#0891b2,_#083344)] shadow-[0_0_80px_rgba(8,145,178,0.5),inset_-20px_-20px_40px_rgba(0,0,0,0.95),inset_10px_10px_20px_rgba(255,255,255,0.6)] border-cyan-500/70",
    ring: "border-cyan-300/50 shadow-[0_0_20px_rgba(6,182,212,0.7)]"
  }
];

const shopItems = [
  { id: 'gold', type: 'ball', price: 0, gradient: 'bg-[radial-gradient(circle_at_35%_35%,_#ffffff,_#fde047,_#ca8a04)]', glow: 'shadow-[0_0_30px_#fde047,inset_-2px_-2px_6px_rgba(0,0,0,0.5)]', border: 'border-yellow-100', name: 'Altın Top' },
  { id: 'ruby', type: 'ball', price: 40, gradient: 'bg-[radial-gradient(circle_at_35%_35%,_#ffffff,_#fb7185,_#9f1239)]', glow: 'shadow-[0_0_30px_#fb7185,inset_-2px_-2px_6px_rgba(0,0,0,0.5)]', border: 'border-rose-100', name: 'Yakut Top' },
  { id: 'emerald', type: 'ball', price: 60, gradient: 'bg-[radial-gradient(circle_at_35%_35%,_#ffffff,_#4ade80,_#166534)]', glow: 'shadow-[0_0_30px_#4ade80,inset_-2px_-2px_6px_rgba(0,0,0,0.5)]', border: 'border-emerald-100', name: 'Zümrüt Top' },
  { id: 'nova', type: 'ball', price: 100, gradient: 'bg-[radial-gradient(circle_at_35%_35%,_#ffffff,_#a78bfa,_#4c1d95)]', glow: 'shadow-[0_0_35px_#a78bfa,inset_-2px_-2px_6px_rgba(0,0,0,0.5)]', border: 'border-violet-100', name: 'Süpernova Top' },

  { id: 'trail_gold', type: 'trail', price: 50, color: '#fde047', name: 'Altın Tozu' },
  { id: 'trail_fire', type: 'trail', price: 75, color: '#ef4444', name: 'Alev İzi' },
  { id: 'trail_cyan', type: 'trail', price: 75, color: '#06b6d4', name: 'Plazma İzi' },

  { id: 'bg_nebula', type: 'theme', price: 120, name: 'Nebula Bulutsusu' },
  { id: 'bg_void', type: 'theme', price: 150, name: 'Kara Delik' }
];

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
  { id: 'runPerfects', statKey: 'bestRunPerfects', target: 3, reward: 40, labelKey: 'm8' }
];

const badgeDefs = [
  { id: 'badge1', nameKey: 'badge1', descKey: 'badge1Desc', icon: '🌟', reward: 50, check: (s) => s.gamesPlayed >= 1 },
  { id: 'badge2', nameKey: 'badge2', descKey: 'badge2Desc', icon: '🪐', reward: 50, check: (s) => s.bestRun >= 10 },
  { id: 'badge3', nameKey: 'badge3', descKey: 'badge3Desc', icon: '💎', reward: 50, check: (s) => s.totalPerfects >= 3 }
];

// --- SES VE AMBİYANS ---
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

const startAmbientSpaceSound = (soundOn) => {
  if (!soundOn) return;
  try {
    const ctx = getAudioContext();
    if (!ctx || ambientGain) return;

    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.03, ctx.currentTime);
    ambientGain.connect(ctx.destination);

    ambientOsc1 = ctx.createOscillator();
    ambientOsc1.type = 'sine';
    ambientOsc1.frequency.setValueAtTime(65.41, ctx.currentTime);

    ambientOsc2 = ctx.createOscillator();
    ambientOsc2.type = 'triangle';
    ambientOsc2.frequency.setValueAtTime(98.00, ctx.currentTime);

    ambientOsc1.connect(ambientGain);
    ambientOsc2.connect(ambientGain);

    ambientOsc1.start();
    ambientOsc2.start();
  } catch (e) {}
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
      // FIX #2: 'combo' sesi eksikti, artık combo bonus tetiklendiğinde çalıyor.
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
  const [lang, setLang] = useState('en');
  const [gameState, setGameState] = useState('menu');
  const [isSupernovaMode, setIsSupernovaMode] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [themeIndex, setThemeIndex] = useState(0);
  const [targetThemeIndex, setTargetThemeIndex] = useState(1);
  const [popup, setPopup] = useState(null);
  const [isFlyingUI, setIsFlyingUI] = useState(false);

  const [crystals, setCrystals] = useState(0);
  const [runCrystals, setRunCrystals] = useState(0);
  const [ownedItems, setOwnedItems] = useState(['gold', 'trail_gold']);
  const [ballLevels, setBallLevels] = useState({ gold: 1, ruby: 1, emerald: 1, nova: 1 });
  const [boostLevels, setBoostLevels] = useState({ shield: 1, slowmo: 1 });

  const [selectedSkin, setSelectedSkin] = useState('gold');
  const [selectedTrail, setSelectedTrail] = useState('trail_gold');
  const [selectedTheme, setSelectedTheme] = useState('bg_nebula');
  const [shopTab, setShopTab] = useState('balls');

  const [shieldActive, setShieldActive] = useState(false);
  const [adOverlay, setAdOverlay] = useState(false);
  const [adCallback, setAdCallback] = useState(null);

  // Günlük reklam sayaçları (Maksimum 2 hak)
  const [dailyAdCount, setDailyAdCount] = useState(0);
  const [lastAdDate, setLastAdDate] = useState('');

  const [planetTimer, setPlanetTimer] = useState(1);
  const planetTimerRef = useRef(1);
  const [supernovaActive, setSupernovaActive] = useState(false);

  const [stats, setStats] = useState({
    totalPerfects: 0, gamesPlayed: 0, bestRun: 0, maxCombo: 0,
    totalCrystalsEarned: 0, bestRunPerfects: 0
  });
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [claimedBadges, setClaimedBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const [streakDays, setStreakDays] = useState(1);
  const [lastStreakDate, setLastStreakDate] = useState('');

  const [renderPos, setRenderPos] = useState({
    activeX: 0, activeY: 0,
    targetX: 80, targetY: -300,
    posX: 120, posY: 0
  });

  const [trail, setTrail] = useState([]);
  const [particles, setParticles] = useState([]);
  const [comboCount, setComboCount] = useState(0);
  const [impactPulse, setImpactPulse] = useState(false);
  const [decoy, setDecoy] = useState(null);
  const slowMoUntilRef = useRef(0);

  const physicsRef = useRef({
    active: { x: 0, y: 0 },
    target: { x: 80, y: -300, vx: 2.5 },
    ball: { x: 120, y: 0, vx: 0, vy: 0 },
    angle: 0,
    isFlying: false,
    speed: 0.025,
    combo: 0
  });

  const t = translations[lang];

  useEffect(() => {
    const savedHighScore = localStorage.getItem('orbit_highscore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));

    setCrystals(loadJSON('orbit_crystals', 60));
    setOwnedItems(loadJSON('orbit_owned_items', ['gold', 'trail_gold']));
    setBallLevels(loadJSON('orbit_ball_levels', { gold: 1, ruby: 1, emerald: 1, nova: 1 }));
    setBoostLevels(loadJSON('orbit_boost_levels', { shield: 1, slowmo: 1 }));
    setSelectedSkin(loadJSON('orbit_selected_skin', 'gold'));
    setSelectedTrail(loadJSON('orbit_selected_trail', 'trail_gold'));
    setSelectedTheme(loadJSON('orbit_selected_theme', 'bg_nebula'));
    setStats(loadJSON('orbit_stats', {
      totalPerfects: 0, gamesPlayed: 0, bestRun: 0, maxCombo: 0,
      totalCrystalsEarned: 0, bestRunPerfects: 0
    }));
    setClaimedMissions(loadJSON('orbit_claimed_missions', []));
    setClaimedBadges(loadJSON('orbit_claimed_badges', []));
    setLeaderboard(loadJSON('orbit_leaderboard', []));
    setStreakDays(loadJSON('orbit_streak_days', 1));
    setLastStreakDate(localStorage.getItem('orbit_last_streak') || '');

    // Günlük reklam sayacını kontrol et ve sıfırla
    const today = new Date().toDateString();
    const storedAdDate = localStorage.getItem('orbit_last_ad_date');
    if (storedAdDate !== today) {
      setDailyAdCount(0);
      localStorage.setItem('orbit_last_ad_date', today);
      localStorage.setItem('orbit_daily_ad_count', '0');
    } else {
      setDailyAdCount(parseInt(localStorage.getItem('orbit_daily_ad_count') || '0', 10));
    }
    setLastAdDate(storedAdDate === today ? today : today);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && soundOn && !adOverlay) {
      startAmbientSpaceSound(true);
    } else {
      stopAmbientSpaceSound();
    }
    return () => stopAmbientSpaceSound();
  }, [gameState, soundOn, adOverlay]);

  // FIX #1: watchRewardedAd artık doğrudan dailyAdCount state'ine güveniyor.
  // Önceki versiyon lastAdDate state'ini (mount'ta hep '' ile başlayan) kıyaslıyordu,
  // bu da sayfa yenilendiğinde günlük reklam limitinin bypass edilmesine yol açıyordu.
  const watchRewardedAd = (onSuccess) => {
    if (dailyAdCount >= 2) return; // 2 hak dolduysa izletme

    playSound('click', soundOn);
    setAdCallback(() => onSuccess);
    setAdOverlay(true);

    setTimeout(() => {
      setAdOverlay(false);
      const today = new Date().toDateString();
      const nextCount = dailyAdCount + 1;
      setDailyAdCount(nextCount);
      setLastAdDate(today);
      localStorage.setItem('orbit_last_ad_date', today);
      localStorage.setItem('orbit_daily_ad_count', nextCount.toString());

      if (onSuccess) onSuccess();
    }, 3000);
  };

  const spawnParticles = (x, y, kind) => {
    const colors = kind === 'perfect'
      ? ['#fde047', '#fbbf24', '#ffffff']
      : kind === 'great'
      ? ['#67e8f9', '#22d3ee', '#ffffff']
      : ['#e2e8f0', '#94a3b8', '#ffffff'];
    const count = kind === 'perfect' ? 12 : kind === 'great' ? 9 : 6;
    const now = performance.now();
    const newParticles = Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      return {
        id: particleUid++,
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        born: now,
        life: 550 + Math.random() * 250,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4
      };
    });
    setParticles(prev => [...prev, ...newParticles].slice(-60));
  };

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    if (gameState === 'playing' && !adOverlay) {
      const render = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        if (deltaTime < 0.1) {
          const p = physicsRef.current;
          const tier = getTier(score);
          const tierLevel = tiers.indexOf(tier);
          const tierSpeedMul = 1 + tierLevel * 0.12;
          const slowMoFactor = currentTime < slowMoUntilRef.current ? 0.28 : 1;
          const effDelta = deltaTime * slowMoFactor;

          p.target.x += p.target.vx * (effDelta * 60) * tierSpeedMul;
          if (p.target.x > 200) {
            p.target.x = 200;
            p.target.vx = -Math.abs(p.target.vx);
          } else if (p.target.x < -200) {
            p.target.x = -200;
            p.target.vx = Math.abs(p.target.vx);
          }

          if (!p.isFlying) {
            const timerMultiplier = isSupernovaMode ? 0.2 : 0.1;
            planetTimerRef.current -= effDelta * timerMultiplier;
            setPlanetTimer(Math.max(0, planetTimerRef.current));

            if (planetTimerRef.current <= 0) {
              playSound('supernova', soundOn);
              vibrate([60, 80, 60, 100]);
              setSupernovaActive(true);
              spawnParticles(p.active.x, p.active.y, 'perfect');

              setTimeout(() => {
                setSupernovaActive(false);
                setGameState('gameover');
                setScoreSaved(false);
                setStats((s) => {
                  const next = {
                    ...s,
                    gamesPlayed: s.gamesPlayed + 1,
                    bestRun: Math.max(s.bestRun, score),
                    tempRunPerfects: 0
                  };
                  saveJSON('orbit_stats', next);
                  return next;
                });
                setCrystals((c) => {
                  const next = c + runCrystals;
                  saveJSON('orbit_crystals', next);
                  return next;
                });
              }, 600);
            }

            p.angle += p.speed * (effDelta * 60) * tierSpeedMul;
            p.ball.x = p.active.x + Math.cos(p.angle) * 120;
            p.ball.y = p.active.y + Math.sin(p.angle) * 120;
          } else {
            p.ball.x += p.ball.vx * (effDelta * 60);
            p.ball.y += p.ball.vy * (effDelta * 60);

            setTrail((prev) => [...prev.slice(-12), { x: p.ball.x, y: p.ball.y }]);

            const dx = p.ball.x - p.target.x;
            const dy = p.ball.y - p.target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const currentBallLvl = ballLevels[selectedSkin] || 1;
            const perfectTolerance = 5 + (currentBallLvl - 1) * 1.5;
            const greatTolerance = 12 + (currentBallLvl - 1) * 2;

            if (distance < 140 && distance > 100) {
              p.isFlying = false;
              setTrail([]);

              planetTimerRef.current = 1;
              setPlanetTimer(1);

              const shiftX = p.target.x;
              const shiftY = p.target.y;

              const deviation = Math.abs(distance - 120);
              let kind = 'normal';
              let gain = 1;
              if (deviation < perfectTolerance) { kind = 'perfect'; gain = 3; }
              else if (deviation < greatTolerance) { kind = 'great'; gain = 2; }

              if (kind === 'perfect' || kind === 'great') {
                p.combo += 1;
              } else {
                p.combo = 0;
              }
              setComboCount(p.combo);

              let comboBonus = 0;
              if (p.combo > 0 && p.combo % 5 === 0) {
                comboBonus = 5;
                playSound('combo', soundOn, p.combo);
                vibrate([15, 30, 15]);
              }

              p.active.x = shiftX;
              p.active.y = shiftY;

              setImpactPulse(true);
              setTimeout(() => setImpactPulse(false), 130);

              if (kind === 'perfect') {
                slowMoUntilRef.current = currentTime + 160;
              }

              const popupId = particleUid++;
              let extraText = '';

              const nextScore = score + gain + comboBonus;
              const prevMilestone = Math.floor(score / 5);
              const nextMilestone = Math.floor(nextScore / 5);

              let awardedCrystals = 0;
              if (nextMilestone > prevMilestone) {
                const baseAward = isSupernovaMode ? nextMilestone * 2 : nextMilestone;
                awardedCrystals = baseAward + (currentBallLvl - 1);

                setRunCrystals((r) => r + awardedCrystals);
                playSound('coin', soundOn);
                vibrate([15, 20, 15]);
                extraText = ` +${awardedCrystals} 💎`;
              }

              setPopup({ text: `+${gain + comboBonus}${extraText}`, kind, id: popupId });
              setTimeout(() => setPopup((cur) => (cur && cur.id === popupId ? null : cur)), 650);

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
                saveJSON('orbit_stats', next);
                return next;
              });

              if (kind === 'perfect') {
                playSound('perfect', soundOn, p.combo);
                vibrate([10, 20, 10, 20, 20]);
              } else {
                playSound('score', soundOn, p.combo);
                vibrate(10);
              }

              setScore((prevScore) => {
                const newScore = prevScore + gain + comboBonus;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('orbit_highscore', newScore.toString());
                }
                return newScore;
              });

              setThemeIndex(targetThemeIndex);
              setTargetThemeIndex((prev) => (prev + 1) % planetThemes.length);

              p.speed = Math.min(0.025 + (score * 0.004), 0.09);

              const direction = Math.random() > 0.5 ? 1 : -1;
              const randomSpeed = (2.4 + Math.random() * 2.2) * (1 + tierLevel * 0.15);
              const planetSpeed = direction * randomSpeed;
              const newTargetX = shiftX + ((Math.random() * 160) - 80);
              const newTargetY = shiftY - (320 + tierLevel * 15);

              p.target = {
                x: newTargetX,
                y: newTargetY,
                vx: planetSpeed
              };

              if (tierLevel >= 2 && Math.random() < 0.3) {
                setDecoy({
                  x: newTargetX + (Math.random() > 0.5 ? 1 : -1) * (90 + Math.random() * 60),
                  y: newTargetY + (Math.random() * 60 - 30),
                  themeIdx: (targetThemeIndex + 2) % planetThemes.length
                });
              } else {
                setDecoy(null);
              }

              p.angle = Math.atan2(p.ball.y - p.active.y, p.ball.x - p.active.x);
            }

            const distFromActive = Math.sqrt(Math.pow(p.ball.x - p.active.x, 2) + Math.pow(p.ball.y - p.active.y, 2));
            if (distFromActive > 750) {
              if (shieldActive) {
                setShieldActive(false);
                playSound('shield', soundOn);
                vibrate([40, 40, 40]);
                p.isFlying = false;
                p.ball.x = p.active.x + 120;
                p.ball.y = p.active.y;
                p.angle = 0;
                planetTimerRef.current = 1;
                setPlanetTimer(1);
              } else {
                playSound('gameover', soundOn);
                vibrate([30, 40, 30]);
                setGameState('gameover');
                setScoreSaved(false);
                setStats((s) => {
                  const next = {
                    ...s,
                    gamesPlayed: s.gamesPlayed + 1,
                    bestRun: Math.max(s.bestRun, score),
                    tempRunPerfects: 0
                  };
                  saveJSON('orbit_stats', next);
                  return next;
                });
                setCrystals((c) => {
                  const next = c + runCrystals;
                  saveJSON('orbit_crystals', next);
                  return next;
                });
              }
            }
          }

          setIsFlyingUI(p.isFlying);

          setParticles((prev) => {
            if (prev.length === 0) return prev;
            return prev
              .map((pt) => ({ ...pt, x: pt.x + pt.vx * (deltaTime * 60), y: pt.y + pt.vy * (deltaTime * 60) }))
              .filter((pt) => currentTime - pt.born < pt.life);
          });

          setRenderPos({
            activeX: p.active.x, activeY: p.active.y,
            targetX: p.target.x, targetY: p.target.y,
            posX: p.ball.x, posY: p.ball.y
          });
        }

        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, score, highScore, soundOn, targetThemeIndex, runCrystals, shieldActive, isSupernovaMode, ballLevels, selectedSkin, adOverlay]);

  const handleJump = () => {
    const p = physicsRef.current;
    if (!p.isFlying && gameState === 'playing' && !adOverlay) {
      p.isFlying = true;
      playSound('jump', soundOn);
      vibrate(6);
      p.ball.vx = Math.cos(p.angle) * 14;
      p.ball.vy = Math.sin(p.angle) * 14;
    }
  };

  const startGame = () => {
    playSound('click', soundOn);
    physicsRef.current = {
      active: { x: 0, y: 0 },
      target: { x: 80, y: -300, vx: 2.5 },
      ball: { x: 120, y: 0, vx: 0, vy: 0 },
      angle: 0,
      isFlying: false,
      speed: 0.025,
      combo: 0
    };
    setScore(0);
    setThemeIndex(0);
    setTargetThemeIndex(1);
    setTrail([]);
    setParticles([]);
    setComboCount(0);
    setRunCrystals(0);
    setPopup(null);
    setDecoy(null);
    setImpactPulse(false);
    setShieldActive(false);
    setSupernovaActive(false);
    planetTimerRef.current = 1;
    setPlanetTimer(1);
    slowMoUntilRef.current = 0;
    setGameState('playing');
  };

  const continueGameWithAd = () => {
    watchRewardedAd(() => {
      const p = physicsRef.current;
      p.isFlying = false;
      p.ball.x = p.active.x + 120;
      p.ball.y = p.active.y;
      p.angle = 0;
      planetTimerRef.current = 1;
      setPlanetTimer(1);
      setShieldActive(true);
      setGameState('playing');
      playSound('shield', soundOn);
    });
  };

  const triggerSlowMo = () => {
    const slowmoLvl = boostLevels.slowmo || 1;
    const duration = 3500 + (slowmoLvl - 1) * 800;

    if (slowmoLvl > 0 && gameState === 'playing' && !adOverlay) {
      slowMoUntilRef.current = performance.now() + duration;
      playSound('perfect', soundOn);
      vibrate(20);
    }
  };

  const activateShield = () => {
    const shieldLvl = boostLevels.shield || 1;
    if (shieldLvl > 0 && !shieldActive && gameState === 'playing' && !adOverlay) {
      setShieldActive(true);
      playSound('shield', soundOn);
      vibrate(20);
    }
  };

  const claimStreakBonus = () => {
    const today = new Date().toDateString();
    if (lastStreakDate === today) return;
    const reward = streakDays * 15;
    const nextCrystals = crystals + reward;
    const nextStreak = streakDays + 1;
    setCrystals(nextCrystals);
    setStreakDays(nextStreak);
    setLastStreakDate(today);
    saveJSON('orbit_crystals', nextCrystals);
    saveJSON('orbit_streak_days', nextStreak);
    localStorage.setItem('orbit_last_streak', today);
    playSound('coin', soundOn);
    vibrate(15);
  };

  const buyShopItem = (item) => {
    if (ownedItems.includes(item.id)) {
      if (item.type === 'ball') {
        setSelectedSkin(item.id);
        saveJSON('orbit_selected_skin', item.id);
      } else if (item.type === 'trail') {
        setSelectedTrail(item.id);
        saveJSON('orbit_selected_trail', item.id);
      } else if (item.type === 'theme') {
        setSelectedTheme(item.id);
        saveJSON('orbit_selected_theme', item.id);
      }
      playSound('click', soundOn);
      return;
    }
    if (crystals >= item.price) {
      const nextCrystals = crystals - item.price;
      const nextOwned = [...ownedItems, item.id];
      setCrystals(nextCrystals);
      setOwnedItems(nextOwned);
      saveJSON('orbit_crystals', nextCrystals);
      saveJSON('orbit_owned_items', nextOwned);

      if (item.type === 'ball') { setSelectedSkin(item.id); saveJSON('orbit_selected_skin', item.id); }
      else if (item.type === 'trail') { setSelectedTrail(item.id); saveJSON('orbit_selected_trail', item.id); }
      else if (item.type === 'theme') { setSelectedTheme(item.id); saveJSON('orbit_selected_theme', item.id); }

      playSound('coin', soundOn);
      vibrate(15);
    } else {
      playSound('gameover', soundOn);
    }
  };

  const upgradeBall = (ballId) => {
    const currentLvl = ballLevels[ballId] || 1;
    const cost = currentLvl * 35;
    if (crystals >= cost && currentLvl < 5) {
      const nextCrystals = crystals - cost;
      const nextLevels = { ...ballLevels, [ballId]: currentLvl + 1 };
      setCrystals(nextCrystals);
      setBallLevels(nextLevels);
      saveJSON('orbit_crystals', nextCrystals);
      saveJSON('orbit_ball_levels', nextLevels);
      playSound('perfect', soundOn);
      vibrate(20);
    } else {
      playSound('gameover', soundOn);
    }
  };

  const upgradeBoost = (boostType) => {
    const currentLvl = boostLevels[boostType] || 1;
    const cost = currentLvl * 30;
    if (crystals >= cost && currentLvl < 5) {
      const nextCrystals = crystals - cost;
      const nextBoostLevels = { ...boostLevels, [boostType]: currentLvl + 1 };
      setCrystals(nextCrystals);
      setBoostLevels(nextBoostLevels);
      saveJSON('orbit_crystals', nextCrystals);
      saveJSON('orbit_boost_levels', nextBoostLevels);
      playSound('perfect', soundOn);
      vibrate(20);
    } else {
      playSound('gameover', soundOn);
    }
  };

  const saveScoreToLeaderboard = () => {
    if (!playerName.trim() || scoreSaved) return;
    const cleanName = playerName.trim().substring(0, 3).toUpperCase();
    const newEntry = { name: cleanName, score };
    const updated = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setLeaderboard(updated);
    saveJSON('orbit_leaderboard', updated);
    setScoreSaved(true);
    playSound('perfect', soundOn);
  };

  const claimMission = (mission, progress) => {
    if (progress < mission.target || claimedMissions.includes(mission.id)) return;
    const nextClaimed = [...claimedMissions, mission.id];
    const nextCrystals = crystals + mission.reward;
    setClaimedMissions(nextClaimed);
    setCrystals(nextCrystals);
    saveJSON('orbit_claimed_missions', nextClaimed);
    saveJSON('orbit_crystals', nextCrystals);
    playSound('perfect', soundOn);
    vibrate([10, 15, 10]);
  };

  const claimBadge = (badge) => {
    const unlocked = badge.check(stats);
    if (!unlocked || claimedBadges.includes(badge.id)) return;
    const nextClaimed = [...claimedBadges, badge.id];
    const nextCrystals = crystals + badge.reward;
    setClaimedBadges(nextClaimed);
    setCrystals(nextCrystals);
    saveJSON('orbit_claimed_badges', nextClaimed);
    saveJSON('orbit_crystals', nextCrystals);
    playSound('perfect', soundOn);
    vibrate([10, 15, 10]);
  };

  const activeTheme = planetThemes[themeIndex];
  const targetTheme = planetThemes[targetThemeIndex];
  const currentSkin = shopItems.find((s) => s.id === selectedSkin) || shopItems[0];
  const currentTrailObj = shopItems.find((s) => s.id === selectedTrail) || { color: '#fde047' };
  const tier = getTier(score);
  const bgLevel = Math.floor(score / 10);
  const isStreakReady = lastStreakDate !== new Date().toDateString();
  const isAdLimitReached = dailyAdCount >= 2;

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
      style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
      onContextMenu={(e) => e.preventDefault()}
    >
    <div
      className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white selection:bg-cyan-500 font-sans overflow-hidden select-none relative"
      style={{
        WebkitTapHighlightColor: 'transparent',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        transform: `scale(${impactPulse || supernovaActive ? 1.04 : 1})`,
        transition: 'transform 0.08s ease-out'
      }}
      onClick={handleJump}
    >
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        @keyframes meteorFall {
          0% { transform: translate(0, 0) rotate(-35deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate(-420px, 420px) rotate(-35deg); opacity: 0; }
        }
        @keyframes planetSpin { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
        @keyframes ringSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes popFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { transform: translateY(-6px) scale(1.15); opacity: 1; }
          100% { transform: translateY(-46px) scale(1); opacity: 0; }
        }
        @keyframes supernovaBlast {
          0% { transform: scale(1); opacity: 1; filter: brightness(1); }
          50% { transform: scale(3.5); opacity: 0.85; filter: brightness(3) drop-shadow(0 0 50px #ef4444); }
          100% { transform: scale(6); opacity: 0; filter: brightness(5); }
        }
        @keyframes planetShake {
          0% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(-2px, 2px) scale(1.02); }
          40% { transform: translate(2px, -2px) scale(0.98); }
          60% { transform: translate(-2px, -2px) scale(1.02); }
          80% { transform: translate(2px, 2px) scale(0.98); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>

      {/* REKLAM MODALI */}
      {adOverlay && (
        <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-6 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-20 h-20 bg-cyan-500/20 border-2 border-cyan-400 rounded-3xl flex items-center justify-center text-4xl mb-4 animate-spin">
            📺
          </div>
          <h2 className="text-2xl font-black text-cyan-300 mb-2">{t.adPlaying}</h2>
          <p className="text-sm text-slate-400 max-w-xs mb-6">Lütfen ödülünüzü almak için reklamın bitmesini bekleyin.</p>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 animate-[pulse_1s_infinite]" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      {/* --- ARKAPLAN --- */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none overflow-hidden transition-all duration-1000 ${
        selectedTheme === 'bg_void' ? 'from-black via-slate-950 to-purple-950' :
        selectedTheme === 'bg_nebula' ? 'from-purple-950 via-slate-950 to-indigo-950' :
        bgLevel === 0 ? 'from-slate-900 via-slate-950 to-black' :
        bgLevel === 1 ? 'from-purple-950 via-slate-950 to-indigo-950' :
        bgLevel === 2 ? 'from-cyan-950 via-slate-950 to-blue-950' :
        'from-rose-950 via-slate-950 to-red-950'
      }`}>
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-indigo-950/25 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>

        {Array.from({ length: 22 }).map((_, i) => {
          const size = 1 + Math.random() * 1.5;
          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                width: size, height: size,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i % 5) * 0.4}s`,
                boxShadow: '0 0 6px rgba(255,255,255,0.8)'
              }}
            ></div>
          );
        })}

        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`meteor-${i}`}
            className="absolute w-16 h-[2px] bg-gradient-to-r from-transparent via-cyan-100 to-white rounded-full pointer-events-none"
            style={{
              top: `${-10 + i * 8}%`,
              left: `${60 + i * 15}%`,
              animation: `meteorFall ${3.5 + i * 1.7}s linear infinite`,
              animationDelay: `${i * 2.3}s`
            }}
          ></div>
        ))}
      </div>

      {/* ÜST SAĞ KONTROL BUTONLARI */}
      <div className="absolute top-8 right-8 flex items-center gap-3 z-50">
        {gameState === 'playing' && (
          <div className="pointer-events-none flex items-center justify-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold px-4 h-12 rounded-full text-lg shadow-md backdrop-blur-md">
            💎 {runCrystals}
          </div>
        )}

        {gameState === 'playing' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('click', soundOn);
              setGameState('menu');
            }}
            className="w-12 h-12 bg-slate-900/90 hover:bg-red-950/80 border border-slate-700/60 hover:border-red-500/50 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all shadow-md backdrop-blur-md group"
            title="Ana Menüye Dön"
          >
            <span className="group-hover:scale-110 transition-transform">🏠</span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            playSound('click', !soundOn);
            setSoundOn(!soundOn);
          }}
          className="w-12 h-12 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all shadow-md backdrop-blur-md"
          title="Ses Aç/Kapat"
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
      </div>

      {/* --- ANA MENÜ --- */}
      {gameState === 'menu' && (
        <div className="flex flex-col items-center z-10 px-4">
          <div className="relative mb-5">
            <div className={`w-20 h-20 rounded-full ${planetThemes[0].planet} opacity-90`} style={{ animation: 'planetSpin 6s linear infinite' }}></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 text-center drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            {t.title}
          </h1>
          <p className="text-slate-400 mb-3 tracking-wider font-semibold text-sm">{t.best}: {highScore}</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('click', soundOn);
              setIsSupernovaMode(!isSupernovaMode);
            }}
            className={`mb-3 py-1.5 px-5 rounded-full text-xs font-bold border transition-all cursor-pointer backdrop-blur-md ${
              isSupernovaMode
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSupernovaMode ? `⚡ ${t.modeSupernova}` : `🛡️ ${t.modeNormal}`}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); startGame(); }}
            className="bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-slate-950 font-black py-3.5 px-14 rounded-full text-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105 mb-3 cursor-pointer border border-cyan-200/40"
          >
            {t.play}
          </button>

          {/* GÜNLÜK SINIRLI REKLAM İZLE BUTONU */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isAdLimitReached) {
                watchRewardedAd(() => {
                  const nextCrystals = crystals + 50;
                  setCrystals(nextCrystals);
                  saveJSON('orbit_crystals', nextCrystals);
                  playSound('coin', soundOn);
                });
              }
            }}
            disabled={isAdLimitReached}
            className={`flex items-center gap-2 font-black py-2.5 px-6 rounded-full text-xs mb-3 shadow-md transition-all cursor-pointer ${
              isAdLimitReached
                ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105'
            }`}
          >
            📺 {isAdLimitReached ? t.adLimitReached : `${t.watchAdReward} (${2 - dailyAdCount}/2)`}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); claimStreakBonus(); }}
            disabled={!isStreakReady}
            className={`flex items-center gap-2 font-bold py-2 px-5 rounded-full text-xs mb-4 transition-all shadow-md backdrop-blur-md cursor-pointer ${
              isStreakReady
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:scale-105 animate-pulse'
                : 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            🔥 {t.streakTitle} (Gün {streakDays}) {isStreakReady ? `(💎 +${streakDays * 15})` : t.streakClaimed}
          </button>

          <div className="flex flex-wrap justify-center gap-2.5 mb-5 max-w-md">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('badges'); }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-yellow-300 font-bold py-2 px-3 rounded-full text-xs cursor-pointer transition-all shadow-md backdrop-blur-md"
            >
              🏅 {t.badges}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('howtoplay'); }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-teal-300 font-bold py-2 px-3 rounded-full text-xs cursor-pointer transition-all shadow-md backdrop-blur-md"
            >
              ❓ {t.howToPlay}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('leaderboard'); }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-amber-300 font-bold py-2 px-3 rounded-full text-xs cursor-pointer transition-all shadow-md backdrop-blur-md"
            >
              👑 {t.leaderboard}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('missions'); }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-bold py-2 px-3 rounded-full text-xs cursor-pointer transition-all shadow-md backdrop-blur-md"
            >
              🏆 {t.missions}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('shop'); }}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-cyan-300 font-bold py-2 px-3 rounded-full text-xs cursor-pointer transition-all shadow-md backdrop-blur-md"
            >
              🛒 {t.shop}
            </button>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-2 px-3 rounded-full text-xs shadow-md backdrop-blur-md">
              💎 {crystals}
            </div>
          </div>

          <div className="flex gap-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-800 shadow-xl">
            {Object.keys(translations).map((l) => (
              <button
                key={l}
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('click', soundOn);
                  setLang(l);
                }}
                className={`w-9 h-9 rounded-full font-bold uppercase transition-all cursor-pointer text-xs ${
                  lang === l ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110 font-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- ROZETLER --- */}
      {gameState === 'badges' && (
        <div className="flex flex-col items-center z-10 w-full max-w-md px-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between w-full mb-6">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }}
              className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md"
            >
              ←
            </button>
            <h2 className="text-xl font-black tracking-widest text-yellow-300 text-center">{t.badges}</h2>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-1.5 px-3 rounded-full text-xs shadow-md">
              💎 {crystals}
            </div>
          </div>

          <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {badgeDefs.map((b) => {
              const unlocked = b.check(stats);
              const claimed = claimedBadges.includes(b.id);
              return (
                <div key={b.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${unlocked ? 'bg-slate-950/80 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-slate-950/30 border-slate-800 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl bg-slate-900 p-2.5 rounded-2xl border border-slate-800">{b.icon}</div>
                    <div>
                      <p className={`font-bold text-sm ${unlocked ? 'text-yellow-300' : 'text-slate-400'}`}>{t[b.nameKey]}</p>
                      <p className="text-xs text-slate-500">{t[b.descKey]}</p>
                      <p className="text-xs text-amber-300 font-bold mt-1">💎 +{b.reward}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); claimBadge(b); }}
                    disabled={!unlocked || claimed}
                    className={`py-1.5 px-4 rounded-full text-xs font-black cursor-pointer transition-all ${
                      claimed ? 'bg-slate-800 text-slate-500 cursor-default' : unlocked ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {claimed ? t.claimed : t.claim}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- NASIL OYNANIR --- */}
      {gameState === 'howtoplay' && (
        <div className="flex flex-col items-center z-10 w-full max-w-md px-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between w-full mb-6">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }}
              className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md"
            >
              ←
            </button>
            <h2 className="text-xl font-black tracking-widest text-teal-300 text-center">{t.howToPlay}</h2>
            <div className="w-11"></div>
          </div>

          <div className="w-full bg-slate-900/85 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4 text-sm text-slate-300 max-h-[60vh] overflow-y-auto">
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xl">🚀</span>
              <p>{t.helpRule1}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xl">✨</span>
              <p>{t.helpRule2}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xl">⏰</span>
              <p>{t.helpRule3}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xl">🛡️</span>
              <p>{t.helpRule4}</p>
            </div>
            <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xl">⬆️</span>
              <p>{t.helpBallFeature}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- SKOR TABLOSU --- */}
      {gameState === 'leaderboard' && (
        <div className="flex flex-col items-center z-10 w-full max-w-md px-6">
          <div className="flex items-center justify-between w-full mb-6">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }}
              className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md"
            >
              ←
            </button>
            <h2 className="text-2xl font-black tracking-widest text-amber-300">{t.leaderboard}</h2>
            <div className="w-11"></div>
          </div>

          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col gap-3">
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">Henüz kayıtlı skor yok.</p>
            ) : (
              leaderboard.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                      #{index + 1}
                    </span>
                    <span className="font-bold tracking-widest uppercase text-cyan-200">{item.name}</span>
                  </div>
                  <span className="font-mono font-black text-white">{item.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- MAĞAZA --- */}
      {gameState === 'shop' && (
        <div className="flex flex-col items-center z-10 w-full max-w-md px-6">
          <div className="flex items-center justify-between w-full mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }}
              className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md"
            >
              ←
            </button>
            <h2 className="text-xl font-black tracking-widest text-cyan-300">{t.shop}</h2>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-1.5 px-3 rounded-full text-xs shadow-md">
              💎 {crystals}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 w-full mb-3">
            <button onClick={() => setShopTab('balls')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate px-1 ${shopTab === 'balls' ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabBalls}</button>
            <button onClick={() => setShopTab('boosts')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate px-1 ${shopTab === 'boosts' ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabBoosts}</button>
            <button onClick={() => setShopTab('trails')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate px-1 ${shopTab === 'trails' ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabTrails}</button>
            <button onClick={() => setShopTab('themes')} className={`py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer truncate px-1 ${shopTab === 'themes' ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{t.tabThemes}</button>
          </div>

          <div className="w-full flex flex-col gap-3 max-h-[52vh] overflow-y-auto pr-1">
            {shopTab === 'boosts' && (
              <>
                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xl">🛡️</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{t.shield}</p>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono font-bold">LVL {boostLevels.shield}</span>
                      </div>
                      <p className="text-xs text-slate-400">{boostLevels.shield >= 5 ? t.max : `⬆️ ${t.upgrade}: 💎 ${boostLevels.shield * 30}`}</p>
                    </div>
                  </div>
                  {boostLevels.shield < 5 && (
                    <button onClick={(e) => { e.stopPropagation(); upgradeBoost('shield'); }} className="py-2 px-4 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:scale-105 cursor-pointer">⬆️</button>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-xl">⏳</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{t.slowmo}</p>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-mono font-bold">LVL {boostLevels.slowmo}</span>
                      </div>
                      <p className="text-xs text-slate-400">{boostLevels.slowmo >= 5 ? t.max : `⬆️ ${t.upgrade}: 💎 ${boostLevels.slowmo * 30}`}</p>
                    </div>
                  </div>
                  {boostLevels.slowmo < 5 && (
                    <button onClick={(e) => { e.stopPropagation(); upgradeBoost('slowmo'); }} className="py-2 px-4 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:scale-105 cursor-pointer">⬆️</button>
                  )}
                </div>
              </>
            )}

            {shopItems.filter(s => (shopTab === 'balls' && s.type === 'ball') || (shopTab === 'trails' && s.type === 'trail') || (shopTab === 'themes' && s.type === 'theme')).map((item) => {
              const owned = ownedItems.includes(item.id);
              const isSelected = selectedSkin === item.id || selectedTrail === item.id || selectedTheme === item.id;
              const ballLvl = ballLevels[item.id] || 1;
              const upgradeCost = ballLvl * 35;
              const maxLvl = ballLvl >= 5;

              return (
                <div key={item.id} className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    {item.type === 'ball' && <div className={`w-10 h-10 rounded-full ${item.gradient} ${item.glow} border ${item.border}`}></div>}
                    {item.type === 'trail' && <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ color: item.color }}>☄️</div>}
                    {item.type === 'theme' && <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl">🌌</div>}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm capitalize">{item.name || item.id}</p>
                        {item.type === 'ball' && owned && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono font-bold">LVL {ballLvl}</span>}
                      </div>
                      <p className="text-xs text-slate-400">{owned ? (item.type === 'ball' && !maxLvl ? `⬆️ ${t.upgrade}: 💎 ${upgradeCost}` : t.owned) : `💎 ${item.price}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === 'ball' && owned && !maxLvl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); upgradeBall(item.id); }}
                        className="py-2 px-3 rounded-full text-[11px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer transition-all shadow-md"
                      >
                        ⬆️
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); buyShopItem(item); }}
                      disabled={isSelected}
                      className={`py-2 px-4 rounded-full text-xs font-black cursor-pointer transition-all ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-300 cursor-default' : owned ? 'bg-slate-700 hover:bg-slate-600 text-white' : crystals >= item.price ? 'bg-gradient-to-r from-cyan-400 to-teal-500 text-slate-950 hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? t.selected : owned ? t.select : t.select}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- GÖREVLER --- */}
      {gameState === 'missions' && (
        <div className="flex flex-col items-center z-10 w-full max-w-md px-6">
          <div className="flex items-center justify-between w-full mb-6">
            <button
              onClick={(e) => { e.stopPropagation(); playSound('click', soundOn); setGameState('menu'); }}
              className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all shadow-md"
            >
              ←
            </button>
            <h2 className="text-2xl font-black tracking-widest text-amber-300">{t.missions}</h2>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 text-cyan-200 font-bold py-2 px-3 rounded-full text-sm shadow-md">
              💎 {crystals}
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {missionDefs.map((m) => {
              const progress = Math.min(stats[m.statKey] || 0, m.target);
              const done = progress >= m.target;
              const claimed = claimedMissions.includes(m.id);
              const pct = (progress / m.target) * 100;
              return (
                <div key={m.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-200">{t[m.labelKey]}</p>
                    <p className="text-xs text-slate-400 font-mono">{progress}/{m.target}</p>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400" style={{ width: `${pct}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-amber-300 font-bold">💎 +{m.reward}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); claimMission(m, progress); }}
                      disabled={!done || claimed}
                      className={`py-1.5 px-4 rounded-full text-xs font-black cursor-pointer transition-all ${
                        claimed ? 'bg-slate-800 text-slate-500 cursor-default' : done ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {claimed ? t.claimed : t.claim}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- GAME OVER --- */}
      {gameState === 'gameover' && (
        <div
          className="flex flex-col items-center z-50 bg-black/85 inset-0 absolute justify-center backdrop-blur-md px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-4xl font-black text-amber-400 mb-3 tracking-wider animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">{t.gameOver}</h2>
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl mb-4 text-center shadow-2xl min-w-[280px] backdrop-blur-md">
            <p className="text-slate-400 text-xs mb-1">{t.score}</p>
            <p className="text-3xl font-black text-cyan-400 mb-3">{score}</p>
            <p className="text-xs text-cyan-300 font-bold mb-4">💎 +{runCrystals}</p>

            <button
              onClick={continueGameWithAd}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black py-3 px-4 rounded-xl text-sm mb-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              📺 {t.watchAdContinue}
            </button>

            {!scoreSaved ? (
              <div className="flex flex-col gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="ABC"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-center uppercase tracking-widest text-lg font-black py-2 rounded-xl text-amber-300 outline-none focus:border-cyan-400"
                />
                <button
                  onClick={saveScoreToLeaderboard}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-md"
                >
                  {t.saveScore}
                </button>
              </div>
            ) : (
              <p className="text-emerald-400 font-bold text-xs py-2">Skor Tablosuna Kaydedildi! ✔️</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startGame()}
              className="bg-gradient-to-r from-cyan-400 to-teal-500 hover:from-cyan-300 hover:to-teal-400 text-slate-950 font-black py-3 px-6 rounded-full text-base shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer transition-all hover:scale-105"
            >
              {t.restart}
            </button>
            <button
              onClick={() => {
                playSound('click', soundOn);
                setGameState('menu');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-full text-base border border-slate-700 cursor-pointer transition-all shadow-lg"
            >
              {t.menu}
            </button>
          </div>
        </div>
      )}

      {/* --- OYUN EKRANI --- */}
      {gameState === 'playing' && (
        <>
          <div className="absolute top-8 left-12 z-50 pointer-events-none">
            <div className="text-6xl font-black text-white/10 drop-shadow-md leading-none">{score}</div>
            <div className={`text-xs font-black tracking-widest mt-1 ${tier.color}`}>{tier.badge} {t[tier.key]}</div>
            {comboCount > 1 && (
              <div className="text-sm font-black text-orange-300 mt-1 drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]">
                🔥 {t.combo} x{comboCount}
              </div>
            )}
          </div>

          <div className="absolute bottom-8 left-8 flex gap-3 z-50">
            <button
              onClick={(e) => { e.stopPropagation(); activateShield(); }}
              className={`relative w-14 h-14 rounded-full border flex items-center justify-center text-xl shadow-lg transition-all cursor-pointer ${
                shieldActive ? 'bg-cyan-500 text-slate-950 border-cyan-200 animate-pulse' : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Kalkan Kullan"
            >
              🛡️ <span className="absolute bottom-1 right-2 text-[10px] font-bold">LVL {boostLevels.shield}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); triggerSlowMo(); }}
              className="relative w-14 h-14 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-purple-300 flex items-center justify-center text-xl shadow-lg transition-all cursor-pointer"
              title="Yavaşlatıcı Kullan"
            >
              ⏳ <span className="absolute bottom-1 right-2 text-[10px] font-bold">LVL {boostLevels.slowmo}</span>
            </button>
          </div>

          {popup && (
            <div
              className={`absolute z-50 pointer-events-none font-black text-2xl left-1/2 top-1/2 ${
                popup.kind === 'perfect' ? 'text-yellow-300' : popup.kind === 'great' ? 'text-cyan-300' : 'text-white'
              }`}
              style={{ animation: 'popFloat 0.65s ease-out forwards', transform: 'translate(-50%, -50%)' }}
            >
              {popup.text} {popup.kind === 'perfect' ? `✨ ${t.perfect}` : popup.kind === 'great' ? t.great : ''}
            </div>
          )}

          <div
            className="absolute inset-0 transition-transform duration-500 ease-out pointer-events-none"
            style={{ transform: `translate(${-renderPos.activeX}px, ${-renderPos.activeY}px)` }}
          >
            {trail.map((pt, idx) => (
              <div
                key={idx}
                className="absolute w-4 h-4 rounded-full blur-[2px] pointer-events-none z-25"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: currentTrailObj.color,
                  opacity: idx / trail.length,
                  transform: `translate(${-8 + pt.x}px, ${-8 + pt.y}px) scale(${idx / trail.length})`,
                  willChange: 'transform'
                }}
              ></div>
            ))}

            {particles.map((pt) => (
              <div
                key={pt.id}
                className="absolute rounded-full pointer-events-none z-30"
                style={{
                  left: '50%',
                  top: '50%',
                  width: pt.size,
                  height: pt.size,
                  background: pt.color,
                  boxShadow: `0 0 6px ${pt.color}`,
                  opacity: Math.max(0, 1 - (performance.now() - pt.born) / pt.life),
                  transform: `translate(${pt.x - pt.size / 2}px, ${pt.y - pt.size / 2}px)`,
                  willChange: 'transform, opacity'
                }}
              ></div>
            ))}

            {/* AKTİF GEZEGEN */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%) translate(${renderPos.activeX}px, ${renderPos.activeY}px)` }}
            >
              <div className={`absolute w-44 h-16 rounded-full border-2 ${activeTheme.ring} -rotate-12 pointer-events-none z-10 opacity-95`}></div>

              <div
                className={`w-32 h-32 rounded-full ${activeTheme.planet} overflow-hidden relative z-20 transition-transform duration-100`}
                style={{
                  transform: `scale(${0.85 + planetTimer * 0.15})`,
                  filter: planetTimer < 0.3 ? 'brightness(1.5) sepia(1) hue-rotate(-50deg)' : 'none',
                  animation: supernovaActive ? 'supernovaBlast 0.6s ease-out forwards' : planetTimer < 0.3 ? 'planetShake 0.25s ease-in-out infinite' : 'none'
                }}
              >
                <div className="absolute top-6 -left-4 w-44 h-10 bg-black/50 rotate-12 blur-[3px] pointer-events-none"></div>
                <div className="absolute bottom-6 -left-4 w-44 h-10 bg-black/40 -rotate-12 blur-[3px] pointer-events-none"></div>

                {planetTimer < 0.5 && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.75)_50%,transparent_55%)] opacity-80 pointer-events-none"></div>
                )}
                {planetTimer < 0.25 && (
                  <div className="absolute inset-0 bg-[linear-gradient(-30deg,transparent_40%,rgba(0,0,0,0.85)_50%,transparent_60%)] pointer-events-none"></div>
                )}

                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/50 pointer-events-none"></div>
              </div>

              {supernovaActive && (
                <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 opacity-90 blur-xl z-40 pointer-events-none animate-ping"></div>
              )}
            </div>

            {/* HEDEF GEZEGEN */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%) translate(${renderPos.targetX}px, ${renderPos.targetY}px)` }}
            >
              <div className={`absolute w-44 h-16 rounded-full border-2 ${targetTheme.ring} rotate-12 pointer-events-none z-10 opacity-95`}></div>
              {score >= 10 && (
                <div className="absolute w-40 h-40 rounded-full border border-dashed border-red-500/60 pointer-events-none z-15" style={{ animation: 'ringSpin 8s linear infinite' }}>
                  <div className="absolute -top-2 left-1/2 w-4 h-4 bg-red-400 rounded-full shadow-[0_0_8px_red]"></div>
                </div>
              )}
              <div className={`w-32 h-32 rounded-full ${targetTheme.planet} overflow-hidden relative z-20`}>
                <div className="absolute top-6 -left-4 w-44 h-10 bg-black/50 -rotate-12 blur-[3px] pointer-events-none"></div>
                <div className="absolute bottom-6 -left-4 w-44 h-10 bg-black/40 rotate-12 blur-[3px] pointer-events-none"></div>
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/50 pointer-events-none"></div>
              </div>
            </div>

            {decoy && (
              <div
                className="absolute flex items-center justify-center pointer-events-none opacity-45"
                style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%) translate(${decoy.x}px, ${decoy.y}px)` }}
              >
                <div className={`absolute w-40 h-14 rounded-full border border-dashed ${planetThemes[decoy.themeIdx].ring} rotate-6 pointer-events-none z-10`}></div>
                <div className={`w-24 h-24 rounded-full ${planetThemes[decoy.themeIdx].planet} overflow-hidden relative z-20 grayscale-[35%]`}>
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30 pointer-events-none"></div>
                </div>
              </div>
            )}

            <div
              className={`w-8 h-8 rounded-full absolute ${currentSkin.gradient} ${currentSkin.glow} border ${currentSkin.border} z-30`}
              style={{
                left: '50%', top: '50%',
                transform: `translate(${-16 + renderPos.posX}px, ${-16 + renderPos.posY}px) ${planetTimer < 0.3 && !supernovaActive ? 'scale(1.1) rotate(' + (performance.now() % 360) + 'deg)' : 'scale(1)'}`,
                filter: isFlyingUI ? 'blur(1.2px)' : 'none',
                transition: 'filter 0.1s linear',
                willChange: 'transform'
              }}
            >
              {shieldActive && (
                <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none"></div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
    </div>
  );
}

export default App;
