import { Capacitor, registerPlugin } from '@capacitor/core';

// Google Play Oyun Hizmetleri başarımları: oyundaki rozet açılınca Play'deki
// karşılığı da açılır. Kimlikler Play Console → Play Oyun Hizmetleri →
// Başarımlar sayfasından (store/play-games/achievements.md). Boş kimlik atlanır.
const P = 'CgkIkPD1stobEAIQ';
const ACHIEVEMENT_IDS = {
  badge1: `${P}Ag`, badge2: `${P}Aw`, badge3: `${P}BA`, badge4: `${P}BQ`, badge5: `${P}Bg`, badge6: `${P}Bw`,
  badge7: `${P}CA`, badge8: `${P}CQ`, badge9: `${P}Cg`, badge10: `${P}Cw`, badge11: `${P}DA`, badge12: `${P}DQ`,
};

const PlayGames = registerPlugin('PlayGames');
const enabled = Capacitor.getPlatform() === 'android';
const SENT_KEY = 'orbit_pg_unlocked';

const readSent = () => {
  try { return JSON.parse(localStorage.getItem(SENT_KEY) || '[]'); } catch { return []; }
};

// Açık rozetlerden Play'e henüz gönderilmemiş olanları gönderir. Play tarafında
// unlock tekrar çağrılırsa sorun olmaz; yerel liste gereksiz çağrıyı önler.
// Oyuncu Play Games'e giriş yapmamışsa gönderilmez, sonraki açılışta denenir.
export const syncAchievements = async (unlockedBadgeIds) => {
  if (!enabled) return;
  const sent = readSent();
  const pending = unlockedBadgeIds.filter((id) => ACHIEVEMENT_IDS[id] && !sent.includes(id));
  if (pending.length === 0) return;
  try {
    const { value } = await PlayGames.isAuthenticated();
    if (!value) return;
    for (const id of pending) await PlayGames.unlock({ id: ACHIEVEMENT_IDS[id] });
    localStorage.setItem(SENT_KEY, JSON.stringify([...sent, ...pending]));
  } catch { /* Play Games yoksa veya hata verirse oyun etkilenmez */ }
};

export const playGamesAvailable = enabled;

// Başarımlar ekranı; giriş yapılmamışsa önce Play Games girişi istenir
export const showAchievements = async () => {
  if (!enabled) return;
  try {
    const { value } = await PlayGames.isAuthenticated();
    if (!value) {
      const res = await PlayGames.signIn();
      if (!res.value) return;
    }
    await PlayGames.showAchievements();
  } catch { /* yok say */ }
};
