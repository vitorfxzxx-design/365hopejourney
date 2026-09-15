import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCXAMgFPOqmYxQH83VyVOVSUHm-i4y9BrA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hopejourney-e2861.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hopejourney-e2861",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hopejourney-e2861.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1087608534375",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1087608534375:web:d6eb0a0ed398fb8c0a2bc2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
