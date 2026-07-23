import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBswD3N2y9du6rKmKAS1ln4L_D6MtC19zg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'cargoflow-c387d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'cargoflow-c387d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'cargoflow-c387d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '442004043385',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:442004043385:web:145dde85e0d2685ebec6a8',
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
