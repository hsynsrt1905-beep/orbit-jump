import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { GoogleAuthProvider, linkWithCredential, signInWithCredential, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

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
