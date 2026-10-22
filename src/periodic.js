import { db } from './firebase';
import { collection, setDoc, doc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

// Günlük meydan okuma ve haftalık tablo UTC'ye göre döner; herkes aynı gün
// aynı haritayı oynar. Günlük görevler ise oyuncunun yerel gece yarısında yenilenir.
const pad = (n) => String(n).padStart(2, '0');
export const utcDayId = (d = new Date()) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export const localDayId = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ISO hafta numarası (pazartesi başlar), ör. "2026-W43"
export const utcWeekId = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad(week)}`;
};

const hashString = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

// mulberry32: aynı tohum her cihazda aynı sayı dizisini verir
export const seededRandom = (seedText) => {
  let a = hashString(seedText);
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// --- Dönemlik skor tabloları: daily/{gün}/scores/{uid}, weekly/{hafta}/scores/{uid}
const bestKey = (kind) => `orbit_best_${kind}`;

const readPeriodBest = (kind, periodId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(bestKey(kind)) || 'null');
    return saved && saved.id === periodId ? saved.score : 0;
  } catch { return 0; }
};

// Yalnızca bu dönemin kendi rekoru geçilince yazılır (gereksiz ağ isteği yok).
export const submitPeriodScore = async (kind, periodId, uid, name, score) => {
  if (score <= readPeriodBest(kind, periodId)) return;
  try { localStorage.setItem(bestKey(kind), JSON.stringify({ id: periodId, score })); } catch {}
  await setDoc(doc(db, kind, periodId, 'scores', uid), { name, score, uid, date: serverTimestamp() });
};

export const fetchPeriodScores = async (kind, periodId) => {
  const snap = await getDocs(query(collection(db, kind, periodId, 'scores'), orderBy('score', 'desc'), limit(10)));
  const scores = [];
  snap.forEach((d) => scores.push({ id: d.id, ...d.data() }));
  return scores;
};

// --- Günlük görevler: havuzdan her gün farklı 3 tanesi seçilir.
const dailyMissionPool = [
  { stat: 'games', targets: [3, 5, 8], reward: 15 },
  { stat: 'perfects', targets: [3, 6, 10], reward: 25 },
  { stat: 'bestScore', targets: [8, 12, 18], reward: 25 },
  { stat: 'crystals', targets: [10, 20], reward: 20 },
  { stat: 'maxCombo', targets: [3, 4], reward: 25 },
  { stat: 'daily', targets: [1], reward: 30 },
];

export const emptyDailyStats = (id) => ({ id, games: 0, perfects: 0, bestScore: 0, crystals: 0, maxCombo: 0, daily: 0, claimed: [] });

export const dailyMissionsFor = (dayId) => {
  const rand = seededRandom(`missions-${dayId}`);
  const pool = [...dailyMissionPool];
  const picked = [];
  while (picked.length < 3) {
    const m = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    const target = m.targets[Math.floor(rand() * m.targets.length)];
    picked.push({ id: `${dayId}-${m.stat}`, stat: m.stat, target, reward: m.reward + (target > m.targets[0] ? 10 : 0) });
  }
  return picked;
};
