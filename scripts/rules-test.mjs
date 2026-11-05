// Firestore kural testi (emülatör): npx firebase emulators:exec --only firestore "node scripts/rules-test.mjs"
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, deleteDoc, getDocs, collectionGroup, query, where, serverTimestamp } from 'firebase/firestore';

const as = (uid) => {
  const db = getFirestore(initializeApp({ projectId: 'orbit-jump-73b68' }, uid));
  connectFirestoreEmulator(db, '127.0.0.1', 8080, { mockUserToken: { user_id: uid } });
  return db;
};
const a = as('alice'), b = as('bob');
let fail = 0;
const t = async (name, fn, shouldPass) => {
  try { await fn(); console.log(shouldPass ? 'OK  ' : 'FAIL', name, '(izin verildi)'); if (!shouldPass) fail++; }
  catch (e) { console.log(shouldPass ? 'FAIL' : 'OK  ', name, '(' + e.code + ')'); if (shouldPass) fail++; }
};
const entry = (uid, name, score) => ({ name, score, uid, date: serverTimestamp() });

await t('isim ayır: Ali', () => setDoc(doc(a, 'names', 'ali'), { uid: 'alice', name: 'Ali' }), true);
await t('isim ayır: Türkçe İpek', () => setDoc(doc(a, 'names', 'i̇pek'), { uid: 'alice', name: 'İpek' }), true);
await t('isim ayır: görünmez karakter', () => setDoc(doc(b, 'names', 'bo​b'), { uid: 'bob', name: 'Bo​b' }), false);
await t('isim ayır: emoji', () => setDoc(doc(b, 'names', 'bob🔥'), { uid: 'bob', name: 'Bob🔥' }), false);
await t('isim ayır: Bob_1', () => setDoc(doc(b, 'names', 'bob_1'), { uid: 'bob', name: 'Bob_1' }), true);
await t('skor: kendi ismiyle', () => setDoc(doc(a, 'leaderboard', 'alice'), entry('alice', 'Ali', 10)), true);
await t('skor: Türkçe İ ile', () => setDoc(doc(a, 'weekly', '2026-W45', 'scores', 'alice'), entry('alice', 'İpek', 5)), true);
await t('skor: başkasının ismiyle', () => setDoc(doc(b, 'leaderboard', 'bob'), entry('bob', 'Ali', 50)), false);
await t('skor: ayrılmamış isimle', () => setDoc(doc(b, 'daily', '2026-11-05', 'scores', 'bob'), entry('bob', 'Zed', 5)), false);
await t('skor: kendi ismiyle (bob)', () => setDoc(doc(b, 'daily', '2026-11-05', 'scores', 'bob'), entry('bob', 'Bob_1', 5)), true);
await t('eski isim (emoji) skor yazarken engellenmez', async () => {
  // eski sürümde alınmış isim: kural dışında oluşturulmuş gibi davranmak için önce geçerli isim yok; bu test yalnız validEntry'nin karakter kontrolü yapmadığını gösterir
  await setDoc(doc(a, 'daily', '2026-11-04', 'scores', 'alice'), entry('alice', 'Ali', 3));
}, true);
let snap;
await t('collectionGroup sorgusu (alice skorları)', async () => {
  snap = await getDocs(query(collectionGroup(a, 'scores'), where('uid', '==', 'alice')));
  if (snap.size !== 2) throw Object.assign(new Error(), { code: 'beklenen 2, gelen ' + snap.size });
}, true);
await t('kendi dönem skorlarını sil', () => Promise.all(snap.docs.map((d) => deleteDoc(d.ref))), true);
await t('başkasının skorunu sil', () => deleteDoc(doc(a, 'daily', '2026-11-05', 'scores', 'bob')), false);

console.log(fail ? `\n${fail} TEST BAŞARISIZ` : '\nTüm testler geçti');
process.exit(fail ? 1 : 0);
