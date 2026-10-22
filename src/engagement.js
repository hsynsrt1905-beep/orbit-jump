import { Capacitor } from '@capacitor/core';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Share } from '@capacitor/share';
import { InAppReview } from '@capacitor-community/in-app-review';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

const isNative = Capacitor.isNativePlatform();
const STORE_URL = 'https://play.google.com/store/apps/details?id=com.orbitjump.game';

// AdMob "OrbitJump_Interstitial" birimi. Boş bırakılırsa geçiş reklamı kapanır.
const INTERSTITIAL_AD_ID = 'ca-app-pub-1803044471635660/1592634831';
const GAMES_PER_INTERSTITIAL = 4;
const INTERSTITIAL_MIN_GAP_MS = 3 * 60 * 1000;
// Yeni oyuncu ilk gün ve ilk 15 oyunda geçiş reklamı görmez; oyunu
// bırakmaların en çok ilk oturumdaki reklamdan geldiği görülüyor.
const AD_FREE_MS = 24 * 60 * 60 * 1000;
const AD_FREE_GAMES = 15;

const STREAK_REMINDER_ID = 1001;
const STREAK_REMINDER_HOUR = 20;
const COMEBACK_IDS = [1002, 1003];
const COMEBACK_DAYS = [2, 5];
const COMEBACK_HOUR = 18;

const REVIEW_MIN_GAMES = 5;
const REVIEW_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const readNum = (key) => {
  try { return parseInt(localStorage.getItem(key) || '0', 10) || 0; } catch { return 0; }
};
const writeNum = (key, val) => {
  try { localStorage.setItem(key, String(val)); } catch {}
};

// İlk açılış zamanı bir kez yazılır; reklamsız ilk gün buna göre hesaplanır.
if (!readNum('orbit_first_open')) writeNum('orbit_first_open', Date.now());

// --- Analytics: oyuncunun nerede bıraktığını görmek için olaylar. Elde tutma
// (1. gün / 7. gün) Firebase konsolunda kendiliğinden hesaplanır.
export const track = (name, params = {}) => {
  if (!isNative) return;
  FirebaseAnalytics.logEvent({ name, params }).catch(() => {});
};

// --- Crashlytics: yerel çökmeler kendiliğinden raporlanır; JS hataları da eklenir.
export const initCrashReporting = () => {
  if (!isNative) return;
  const report = (message, stack) => {
    FirebaseCrashlytics.recordException({ message: String(message).slice(0, 500) }).catch(() => {});
    if (stack) FirebaseCrashlytics.log({ message: String(stack).slice(0, 1000) }).catch(() => {});
  };
  window.addEventListener('error', (e) => report(e.message, e.error?.stack));
  window.addEventListener('unhandledrejection', (e) => report(e.reason?.message || e.reason, e.reason?.stack));
};

// --- Değerlendirme isteği: en az 5 oyundan sonra, rekor kırıldığında, 30 günde bir.
// Google penceresi gösterip göstermemeye kendisi de karar verir (kota uygular).
export const maybeRequestReview = (gamesPlayed, isNewRecord) => {
  if (!isNative || gamesPlayed < REVIEW_MIN_GAMES || !isNewRecord) return;
  const last = readNum('orbit_review_asked_at');
  if (Date.now() - last < REVIEW_COOLDOWN_MS) return;
  writeNum('orbit_review_asked_at', Date.now());
  InAppReview.requestReview().catch(() => {});
};

// --- Skor paylaşma
export const shareScore = async (text) => {
  const message = `${text}\n${STORE_URL}`;
  try {
    if (isNative) {
      await Share.share({ text: message, dialogTitle: 'Orbit Jump' });
    } else if (navigator.share) {
      await navigator.share({ text: message });
    }
  } catch {}
};

// --- Geçiş reklamı: her 4 oyunda bir, en az 3 dakika arayla, oyun bitip
// oyuncu yeniden başlatırken/menüye dönerken (devam reklamı kararını bölmeden).
let gamesSinceInterstitial = 0;
let lastInterstitialAt = 0;
let interstitialReady = false;

const prepareInterstitial = async () => {
  if (!isNative || !INTERSTITIAL_AD_ID || interstitialReady) return;
  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID, isTesting: false });
    interstitialReady = true;
  } catch {
    interstitialReady = false;
  }
};

const inAdFreePeriod = () =>
  Date.now() - readNum('orbit_first_open') < AD_FREE_MS || readNum('orbit_games_total') < AD_FREE_GAMES;

export const noteGameFinished = () => {
  writeNum('orbit_games_total', readNum('orbit_games_total') + 1);
  if (inAdFreePeriod()) return;
  gamesSinceInterstitial += 1;
  if (gamesSinceInterstitial >= GAMES_PER_INTERSTITIAL - 1) prepareInterstitial();
};

// Reklam kapanana kadar bekler; çağıran oyunu ancak ondan sonra başlatmalı,
// yoksa reklam açıkken oyun arkada akar ve top düşerdi.
export const maybeShowInterstitial = async () => {
  if (!isNative || !INTERSTITIAL_AD_ID || inAdFreePeriod()) return;
  if (gamesSinceInterstitial < GAMES_PER_INTERSTITIAL) return;
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_MIN_GAP_MS) return;
  if (!interstitialReady) { prepareInterstitial(); return; }
  interstitialReady = false;
  gamesSinceInterstitial = 0;
  lastInterstitialAt = Date.now();

  await new Promise((resolve) => {
    let done = false;
    let handles = [];
    const finish = () => {
      if (done) return;
      done = true;
      handles.forEach((h) => h.remove());
      resolve();
    };
    Promise.all([
      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, finish),
      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, finish),
    ]).then((hs) => {
      handles = hs;
      if (done) hs.forEach((h) => h.remove());
    }).catch(() => {});
    AdMob.showInterstitial().catch(finish);
    setTimeout(finish, 90000);
  });
  track('interstitial_shown');
};

// --- Seri hatırlatma: bugünkü ödül alınmadıysa bugün 20:00'de, alındıysa
// yarın 20:00'de "serin bozulmak üzere" bildirimi.
const nextReminderDate = (claimedToday) => {
  const d = new Date();
  d.setHours(STREAK_REMINDER_HOUR, 0, 0, 0);
  if (claimedToday || Date.now() >= d.getTime()) d.setDate(d.getDate() + 1);
  return d;
};

export const scheduleStreakReminder = async ({ claimedToday, streakDays, title, body, askPermission }) => {
  if (!isNative) return;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'prompt' && askPermission) perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;
    await LocalNotifications.cancel({ notifications: [{ id: STREAK_REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [{
        id: STREAK_REMINDER_ID,
        title,
        body: body.replace('{n}', String(streakDays)),
        schedule: { at: nextReminderDate(claimedToday), allowWhileIdle: true },
        smallIcon: 'ic_stat_orbit',
        iconColor: '#22d3ee',
      }],
    });
  } catch {}
};

// --- Geri dönüş: oyuncu 2 ve 5 gün girmezse rekoruna atıfla bildirim.
// Her açılışta ve tur sonunda yeniden kurulur, yani oynayan kimse bunu görmez.
export const scheduleComebackReminders = async (messages) => {
  if (!isNative) return;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return;
    await LocalNotifications.cancel({ notifications: COMEBACK_IDS.map((id) => ({ id })) });
    await LocalNotifications.schedule({
      notifications: COMEBACK_IDS.map((id, i) => {
        const at = new Date();
        at.setDate(at.getDate() + COMEBACK_DAYS[i]);
        at.setHours(COMEBACK_HOUR, 0, 0, 0);
        return {
          id,
          title: messages[i].title,
          body: messages[i].body,
          schedule: { at, allowWhileIdle: true },
          smallIcon: 'ic_stat_orbit',
          iconColor: '#22d3ee',
        };
      }),
    });
  } catch {}
};
