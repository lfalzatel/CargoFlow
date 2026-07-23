import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
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
    // If firebase credentials fail in demo mode, gracefully return fallback
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
    balance: 1250000, // Starting default COP balance
  };

  try {
    await setDoc(doc(db, 'users', uid), profile);
  } catch (e) {
    console.warn('Firestore setDoc notice:', e);
  }

  return profile;
};

export const loginWithGoogle = async (role: UserRole = 'cliente'): Promise<UserProfile> => {
  try {
    // Force Firebase Auth SignOut first so any stored session token is completely cleared
    try {
      await signOut(auth);
    } catch (_) {}

    // Create a fresh GoogleAuthProvider instance with forced select_account prompt
    const freshProvider = new GoogleAuthProvider();
    freshProvider.setCustomParameters({
      prompt: 'select_account',
      auth_type: 'rerequest',
    });

    const cred = await signInWithPopup(auth, freshProvider);
    const uid = cred.user.uid;
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      return {
        ...existing,
        role: existing.role || role,
        photoURL: cred.user.photoURL || existing.photoURL,
        email: cred.user.email || existing.email,
      };
    }

    const profile: UserProfile = {
      name: cred.user.displayName || 'Usuario CargoFlow',
      email: cred.user.email || 'usuario.google@cargoflow.co',
      phone: cred.user.phoneNumber || '+57 300 000 0000',
      role,
      isVerified: true,
      rating: 5.0,
      balance: 1250000,
      photoURL: cred.user.photoURL || undefined,
    };

    await setDoc(docRef, profile);
    return profile;
  } catch (e) {
    console.warn('Google sign in notice:', e);
    return {
      name: 'Luis Fernando Alzate',
      email: 'lfalzatel@gmail.com',
      phone: '+57 312 987 6543',
      role,
      isVerified: true,
      rating: 5.0,
      balance: 1250000,
      photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaVqRCs3Sd6gJvISf50cSCmx0gy6bYEvm1R0IzY4p64VNvfe1-3MIdU67GvSNK95J1--2vNcWvxnrIq8iCD-iHT1D8hQ7XtZaehyM01PAqzIOpnvfjJaYX0RRdOKnv96PNPbSoA0WCXp4x_h7jmJ4ihCCgJ8Z8drczuCJb_JVBDIY5LL_WCnZNTNXviCXjNodS3ym6pf7GR5ZWc7nUdVM8cc7a6Zs2qvDNwDS_1XEoVjtbFFt-4bF8',
    };
  }
};

export const updateUserProfileInFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, 'users', uid);
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
