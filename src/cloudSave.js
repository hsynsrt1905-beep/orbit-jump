import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, linkWithCredential, signInWithCredential, signInAnonymously, signOut, deleteUser, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, runTransaction, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from './firebase';
import { utcDayId, utcWeekId } from './periodic';

export const isGoogleUser = (user) => !!user && !user.isAnonymous;

// Skor tablosu için oturum: Google ile girildiyse onu kullan, yoksa anonim aç.
// signInAnonymously'yi Google oturumu varken çağırmak oturumu kapatırdı.
export const ensureSignedIn = async () => {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
};

// Yerel cihazdaki anonim hesap Google hesabına bağlanır, böylece UID (ve skor
// tablosundaki kayıt) korunur. Google hesabı daha önce başka cihazda
// kullanıldıysa bağlama başarısız olur; o zaman doğrudan o hesaba geçilir.
export const signInWithGoogle = async () => {
  if (!Capacitor.isNativePlatform()) throw new Error('Google sign-in is only available in the app');
  const result = await FirebaseAuthentication.signInWithGoogle();
  const credential = GoogleAuthProvider.credential(result.credential?.idToken);

  const current = auth.currentUser;
  if (current && current.isAnonymous) {
    try {
      return (await linkWithCredential(current, credential)).user;
    } catch (e) {
      if (e?.code !== 'auth/credential-already-in-use') throw e;
      const existing = GoogleAuthProvider.credentialFromError(e) || credential;
      return (await signInWithCredential(auth, existing)).user;
    }
  }
  return (await signInWithCredential(auth, credential)).user;
};

export const signOutGoogle = async () => {
  try { await FirebaseAuthentication.signOut(); } catch {}
  await signOut(auth);
};

// Hesap silme (Play politikası): bulut kaydı, skor tablosu kaydı ve Firebase
// kullanıcısı silinir. Firebase yakın tarihli giriş isterse Google ile yeniden
// doğrulanıp tekrar denenir.
export const deleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'saves', user.uid));
  await deleteDoc(doc(db, 'leaderboard', user.uid));
  // Güncel dönem tablolarındaki kayıtlar da silinir (eski dönemler gösterilmez).
  const yesterday = new Date(Date.now() - 86400000);
  await Promise.all([
    deleteDoc(doc(db, 'daily', utcDayId(), 'scores', user.uid)),
    deleteDoc(doc(db, 'daily', utcDayId(yesterday), 'scores', user.uid)),
    deleteDoc(doc(db, 'weekly', utcWeekId(), 'scores', user.uid)),
  ]).catch(() => {});
  await releaseNames(user.uid).catch(() => {});
  try {
    await deleteUser(user);
  } catch (e) {
    if (e?.code !== 'auth/requires-recent-login') throw e;
    const result = await FirebaseAuthentication.signInWithGoogle();
    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(result.credential?.idToken));
    await deleteUser(user);
  }
  try { await FirebaseAuthentication.signOut(); } catch {}
};

// --- Benzersiz oyuncu isimleri: names/{küçük harfli isim} belgesi ismi bir
// UID'ye ayırır. Eski oyuncuların ayırması olmadığından skor tablosundaki aynı
// isim de "alınmış" sayılır.
export const nameKey = (name) => name.trim().toLowerCase().replace(/\s+/g, ' ');

// 1.0.13 ve öncesi anahtarı yanlış üretiyordu ("s" harflerini boşluğa çeviriyordu).
// O sürümlerle alınmış isimler hâlâ bu anahtarla duruyor; yeni anahtarda belge
// yoksa eskisine de bakılır. Eski anahtar farklı isimleri çakıştırabildiği için
// belgedeki asıl isim de karşılaştırılır.
const legacyNameKey = (name) => name.trim().toLowerCase().replace(/s+/g, ' ');

export const claimPlayerName = async (name) => {
  const uid = (await ensureSignedIn()).uid;
  const clean = name.trim().substring(0, 12);
  const key = nameKey(clean);
  const legacyKey = legacyNameKey(clean);

  const lb = await getDocs(query(collection(db, 'leaderboard'), where('name', '==', clean), limit(5)));
  if (lb.docs.some((d) => d.id !== uid)) throw new Error('name-taken');

  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'names', key);
    const snap = await tx.get(ref);
    if (snap.exists() && snap.data().uid !== uid) throw new Error('name-taken');
    if (legacyKey !== key) {
      const legacy = await tx.get(doc(db, 'names', legacyKey));
      const d = legacy.exists() ? legacy.data() : null;
      if (d && d.uid !== uid && nameKey(d.name || '') === key) throw new Error('name-taken');
    }
    if (!snap.exists()) tx.set(ref, { uid, name: clean });
  });
  return clean;
};

// Oyuncunun eski isim ayırmalarını bırakır (isim değişince / hesap silinince).
export const releaseNames = async (uid, keepKey) => {
  const snap = await getDocs(query(collection(db, 'names'), where('uid', '==', uid)));
  await Promise.all(snap.docs.filter((d) => d.id !== keepKey).map((d) => deleteDoc(d.ref)));
};

export const loadCloudSave = async (uid) => {
  const snap = await getDoc(doc(db, 'saves', uid));
  return snap.exists() ? snap.data().progress : null;
};

export const writeCloudSave = (uid, progress) =>
  setDoc(doc(db, 'saves', uid), { progress, updatedAt: serverTimestamp() });

const union = (a = [], b = []) => [...new Set([...a, ...b])];
const maxPerKey = (a = {}, b = {}) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = typeof v === 'number' && typeof out[k] === 'number' ? Math.max(out[k], v) : (out[k] ?? v);
  }
  return out;
};
const dateValue = (s) => (s ? new Date(s).getTime() || 0 : 0);

// İki cihazın ilerlemesini birleştirir; hiçbir tarafta kazanılan şey kaybolmaz.
export const mergeProgress = (local, cloud) => {
  if (!cloud) return local;
  const cloudStreakNewer = dateValue(cloud.lastStreakDate) >= dateValue(local.lastStreakDate);
  return {
    crystals: Math.max(local.crystals || 0, cloud.crystals || 0),
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    ownedItems: union(local.ownedItems, cloud.ownedItems),
    claimedMissions: union(local.claimedMissions, cloud.claimedMissions),
    claimedBadges: union(local.claimedBadges, cloud.claimedBadges),
    ballLevels: maxPerKey(local.ballLevels, cloud.ballLevels),
    boostLevels: maxPerKey(local.boostLevels, cloud.boostLevels),
    boostCounts: maxPerKey(local.boostCounts, cloud.boostCounts),
    stats: maxPerKey(local.stats, cloud.stats),
    selectedSkin: cloud.selectedSkin ?? local.selectedSkin,
    selectedTrail: cloud.selectedTrail ?? local.selectedTrail,
    selectedTheme: cloud.selectedTheme ?? local.selectedTheme,
    streakDays: cloudStreakNewer ? (cloud.streakDays ?? local.streakDays) : local.streakDays,
    lastStreakDate: cloudStreakNewer ? (cloud.lastStreakDate ?? local.lastStreakDate) : local.lastStreakDate,
    playerName: cloud.playerName || local.playerName,
  };
};
