// Oyuncu ismi denetimi (istemci). firestore.rules içindeki validNameChars ve
// isProfane ile aynı kuralları uygular; değiştirirken ikisini birlikte güncelle.

// İsimde izin verilen karakterler (firestore.rules validNameChars ile aynı):
// harf, birleşik işaret, rakam, boşluk ve _ . - ; ilk karakter harf/rakam olmalı.
export const sanitizeName = (s) => s.replace(/[^\p{L}\p{M}\p{N} _.-]/gu, '');

// Küfür/hakaret filtresi — firestore.rules isProfane ile AYNI listeler.
// İsim küçük harfe çevrilir, Türkçe harfler sadeleştirilir (ş→s, ı→i …),
// ayraçlar silinir ve rakam hileleri (0→o, 1→i, 3→e, 4→a, 5→s) çözülür.
// Kısa ve masum isimlerin içinde geçebilecek kökler yalnız tam isim olarak aranır.
const BAD_ROOTS = /orospu|orosbu|oruspu|amina|amcik|yarrak|yarak|sikerim|siktir|sikik|sikis|sikim|sikiyim|sikeyim|gotveren|gotlek|ibne|kahpe|pezevenk|kaltak|gavat|yavsak|pust|serefsiz|fuck|shit|bitch|cunt|nigg|whore|slut|asshole|pussy|porn|hitler|nazi|faggot|retard/;
const BAD_WHOLE = /^(amk|aq|mk|oc|got|sik|am|dick|cock|cum)$|^amk|amk$/;
const BAD_RAW = /piç|göt/;
const foldName = (s) => s.toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/\p{M}/gu, '')
  .replace(/[ _.-]/g, '').replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's');
export const isProfane = (s) => {
  const f = foldName(s);
  return BAD_ROOTS.test(f) || BAD_WHOLE.test(f) || BAD_RAW.test(s.toLowerCase());
};
export const isValidName = (s) => /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} _.-]*$/u.test(s) && !isProfane(s);
