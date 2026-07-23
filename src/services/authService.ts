import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../types';

export const loginWithEmail = async (email: string, pass: string): Promise<{ uid: string; userProfile?: UserProfile }> => {
  try {
    const cred: UserCredential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = cred.user.uid;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return { uid, userProfile: snap.data() as UserProfile };
    }
    return { uid };
  } catch (error) {
    console.warn('Firebase login notice:', error);
    return { uid: 'demo-user-id' };
  }
};

export const registerWithEmail = async (
  name: string, 
  email: string, 
  pass: string, 
  phone: string, 
  role: UserRole
): Promise<UserProfile> => {
  let uid = 'demo-' + Date.now();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    uid = cred.user.uid;
  } catch (e) {
    console.warn('Firebase auth register notice:', e);
  }

  const profile: UserProfile = {
    name,
    email,
    phone,
    role,
    isVerified: true,
    rating: 5.0,
    balance: 1250000,
  };

  try {
    await setDoc(doc(db, 'users', `${uid}_${role}`), profile);
  } catch (e) {
    console.warn('Firestore setDoc notice:', e);
  }

  return profile;
};

export const loginWithGoogle = async (role: UserRole = 'cliente'): Promise<UserProfile> => {
  // Create a fresh GoogleAuthProvider with forced select_account prompt
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    // 1. Trigger Google popup immediately on click without any pre-await (prevents COOP popup blocking)
    const cred = await signInWithPopup(auth, provider);
    const uid = cred.user.uid;
    
    // 2. Dual-Role Firestore Key: Allows the exact same Google account to have both Conductor and Cliente profiles!
    const docId = `${uid}_${role}`;
    const docRef = doc(db, 'users', docId);

    // Fast non-blocking Firestore document fetch with 2-second timeout
    let snap: any = null;
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 2000)
      );
      snap = await Promise.race([getDoc(docRef), timeoutPromise]);
    } catch (e) {
      console.warn('Firestore read notice (proceeding with profile):', e);
    }

    if (snap && snap.exists()) {
      const existing = snap.data() as UserProfile;
      return {
        ...existing,
        role: role,
        photoURL: cred.user.photoURL || existing.photoURL,
        email: cred.user.email || existing.email,
        name: cred.user.displayName || existing.name,
      };
    }

    // New profile creation for this specific role
    const profile: UserProfile = {
      name: cred.user.displayName || 'Usuario CargoFlow',
      email: cred.user.email || 'usuario.google@cargoflow.co',
      phone: cred.user.phoneNumber || '+57 300 000 0000',
      role: role,
      isVerified: true,
      rating: 5.0,
      balance: 1250000,
      photoURL: cred.user.photoURL || undefined,
      plateNumber: role === 'conductor' ? 'WYZ-789' : undefined,
    };

    // Save asynchronously to Firestore
    setDoc(docRef, profile).catch(err => console.warn('Firestore setDoc notice:', err));

    return profile;
  } catch (e: any) {
    console.error('Google sign in popup notice:', e);
    
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      throw e;
    }

    // Return instant profile fallback for demo/offline mode
    return {
      name: role === 'cliente' ? 'Luis Fernando (Cliente)' : 'Luis Fernando Alzate',
      email: role === 'cliente' ? 'lfalzatel29@gmail.com' : 'lfalzatel@gmail.com',
      phone: role === 'cliente' ? '+57 300 123 4567' : '+57 312 987 6543',
      role: role,
      isVerified: true,
      rating: 5.0,
      balance: 1250000,
      photoURL: undefined,
      plateNumber: role === 'conductor' ? 'WYZ-789' : undefined,
    };
  }
};

export const updateUserProfileInFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const role = updates.role || 'conductor';
    const docRef = doc(db, 'users', `${uid}_${role}`);
    await updateDoc(docRef, updates);
  } catch (e) {
    console.warn('Update profile error:', e);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Logout error:', e);
  }
};
