import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSy_placeholder_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cargoflow-c387d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cargoflow-c387d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cargoflow-c387d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '442004043385',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:442004043385:web:cargoflow',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
