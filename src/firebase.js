import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCv9eqQLw-kzkNSjjH4rbbklHsLqyqdx3w",
  authDomain: "orbit-jump-73b68.firebaseapp.com",
  projectId: "orbit-jump-73b68",
  storageBucket: "orbit-jump-73b68.firebasestorage.app",
  messagingSenderId: "951978915856",
  appId: "1:951978915856:web:97dcb1f5894fbebd917295"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
