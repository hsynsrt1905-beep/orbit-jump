import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, CustomProvider, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { Capacitor } from "@capacitor/core";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyCv9eqQLw-kzkNSjjH4rbbklHsLqyqdx3w",
  authDomain: "orbit-jump-73b68.firebaseapp.com",
  projectId: "orbit-jump-73b68",
  storageBucket: "orbit-jump-73b68.firebasestorage.app",
  messagingSenderId: "951978915856",
  appId: "1:951978915856:web:97dcb1f5894fbebd917295"
};

const app = initializeApp(firebaseConfig);

// App Check: Android'de Play Integrity belirteci yerel eklentiden alınıp web
// SDK'sına verilir; Firestore istekleri gerçek uygulamadan geldiğini kanıtlar.
// Konsolda zorunlu kılma kapalı olduğu sürece belirteç alınamasa da (ör. Play
// dışından kurulan sürüm) oyun çalışmaya devam eder.
if (Capacitor.isNativePlatform()) {
  FirebaseAppCheck.initialize({ isTokenAutoRefreshEnabled: true }).catch(() => {});
  initializeAppCheck(app, {
    provider: new CustomProvider({
      getToken: async () => {
        const { token, expireTimeMillis } = await FirebaseAppCheck.getToken();
        return { token, expireTimeMillis: expireTimeMillis || Date.now() + 30 * 60 * 1000 };
      }
    }),
    isTokenAutoRefreshEnabled: true
  });
} else if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  // Web sürümü: reCAPTCHA Enterprise (Google Cloud Fraud Defense) ile App Check;
  // ayda 10.000 doğrulamaya kadar ücretsiz, kart gerekmez. Anahtar yoksa (derleme
  // ortamında tanımlı değilse) App Check açılmaz, oyun eskisi gibi çalışır.
  // Konsolda zorunlu kılmadan önce bu anahtarla web derlemesi yayınlanmalı.
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

export const db = getFirestore(app);
export const auth = getAuth(app);
