import { useState, useEffect, useRef } from 'react';
import { UserProfile, Trip, ChatMessage, UserRole } from './types';
import Login from './components/Login';
import CompleteProfile from './components/CompleteProfile';
import Home from './components/Home';
import Activity from './components/Activity';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import NotificationToast from './components/NotificationToast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import {
  requestNotificationPermission,
  listenForSWMessages,
  sendInAppNotification,
} from './services/notificationService';

const INITIAL_TRIPS: Trip[] = [
  {
    id: '#CF-8842',
    status: 'EN CAMINO',
    price: 1250000,
    date: 'Hoy, 14:30',
    origin: 'Bogotá, Cundinamarca',
    originDetail: 'Centro Logístico Fontibón',
    destination: 'Medellín, Antioquia',
    destinationDetail: 'Zona Industrial Guayabal',
    vehicleType: 'Tractomula',
    tag: 'REFRIGERADO',
  },
  {
    id: '#CF-8821',
    status: 'COMPLETADO',
    price: 850000,
    date: '12 Oct, 09:15',
    origin: 'Cali, Valle del Cauca',
    originDetail: 'Terminal Logística de Cali',
    destination: 'Buenaventura, Valle del Cauca',
    destinationDetail: 'Zona Portuaria Sociedad Portuaria',
    vehicleType: 'Camión Sencillo',
    tag: 'FRÁGIL',
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'driver',
    text: 'Buenas tardes, ya estoy en el punto de carga. ¿Por qué puerta ingreso?',
    timestamp: '14:30',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Hola Carlos. Ingresa por la puerta 3, la carga ya está lista en el muelle A.',
    timestamp: '14:32',
    isRead: true,
  },
  {
    id: 'msg-3',
    sender: 'driver',
    text: 'Documentos de remisión recibidos y firmados por bodega.',
    timestamp: '14:45',
    attachmentUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7Ni2J9mIQdEC-_mery1HR1eITP8ujrDv7cUBoos-8uxn654p1cXf6gQNwgBICsftKkSS5jLRUXolNSWMRw5DEtawj4dUcjMGxBYvdh_vbd1jB2QyX0UgF74iwD1g1PX3ffUQpUva-T9vOu0b29_hkFvsB2G5U0XRFvPXvEQWzxGALO9iN7k1A-Zcb35zA1Yvg_m4O83ttx240Nj0EjX5VsWFUW3L9P9Un5HTf3V0bi6My_pyvjLYP',
  }
];

export default function App() {
  const [view, setView] = useState<'login' | 'complete_profile' | 'home' | 'activity' | 'chat' | 'profile' | 'settings'>('login');
  
  // Splash Screen State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashMessage, setSplashMessage] = useState<string>('Cargando CargoFlow...');
  const [splashSubtext, setSplashSubtext] = useState<string>('Tu solución inteligente de transporte');
  // Helper to get system sounds
  const getSysTone = (type: 'login' | 'logout') => {
    if (localStorage.getItem('cf_sys_sound') === 'false') return undefined;
    const file = localStorage.getItem(`cf_sys_tone_file_${type}`) || 
      (type === 'login' ? '550332__wax_vibe__cyberpunk-bass.wav' : '73577__cyberpunk64bit__boomstick.mp3');
    return `/sounds/${file}`;
  };

  const [splashSound, setSplashSound] = useState<string | undefined>(getSysTone('login'));

  // Selected role
  const [selectedRole, setSelectedRole] = useState<UserRole>('conductor');
  
  // Current user state
  const [user, setUser] = useState<UserProfile>({
    name: 'Carlos Rodríguez',
    email: 'carlos.rod@cargoflow.co',
    phone: '+57 311 456 7890',
    role: 'conductor',
    isVerified: true,
    rating: 4.9,
    balance: 1250000,
    plateNumber: 'WYZ-789',
    vehicleType: 'furgon',
  });

  // Database of shipments (trips)
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  
  // Chat messages
  const [chatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // Splash screen on initial app load / refresh (2.6s duration)
  useEffect(() => {
    setSplashMessage('Iniciando CargoFlow...');
    setSplashSubtext('Preparando tu panel logístico');
    
    // Check localStorage for the custom login sound
    const sysSoundEnabled = localStorage.getItem('cf_sys_sound') !== 'false';
    const loginToneFile = localStorage.getItem('cf_sys_tone_file_login') || '550332__wax_vibe__cyberpunk-bass.wav';
    setSplashSound(sysSoundEnabled ? `/sounds/${loginToneFile}` : undefined);

    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  // Request notification permission once user is logged in
  // and listen for SW notification click messages
  const notifPermRequestedRef = useRef(false);
  useEffect(() => {
    if (!['home', 'activity', 'chat', 'profile'].includes(view)) return;
    if (notifPermRequestedRef.current) return;
    notifPermRequestedRef.current = true;

    // Ask for permission after a short delay (avoids permission prompt on first render)
    const t = setTimeout(() => {
      requestNotificationPermission().then((perm) => {
        if (perm === 'granted') {
          sendInAppNotification({
            title: '¡Notificaciones activadas!',
            body:  'Recibirás alertas de fletes, estado de envíos y mensajes.',
            tag:   'cargoflow-success',
          });
        }
      });
    }, 3000);

    // Listen for SW notification click -> navigate within app
    const unlistenSW = listenForSWMessages((url) => {
      if (url.includes('chat'))     setView('chat');
      else if (url.includes('activity')) setView('activity');
      else setView('home');
    });

    return () => {
      clearTimeout(t);
      unlistenSW();
    };
  }, [view]);

  // Listen for active Firebase Auth session and read full profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Always merge base auth data first and FORCE admin if email matches
        setUser(prev => ({
          ...prev,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          photoURL: firebaseUser.photoURL || prev.photoURL,
          role: firebaseUser.email === 'lfalzatel@gmail.com' ? 'admin' : prev.role,
        }));
        
        // Auto-upgrade developer email to admin
        if (firebaseUser.email === 'lfalzatel@gmail.com') {
          try {
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', `${firebaseUser.uid}_conductor`), { role: 'admin' }).catch(() => null);
            await updateDoc(doc(db, 'users', `${firebaseUser.uid}_cliente`), { role: 'admin' }).catch(() => null);
          } catch (e) {}
        }
        // Read the persisted Firestore profile to get isComplete and role-specific fields
        try {
          for (const role of ['conductor', 'cliente']) {
            const docRef = doc(db, 'users', `${firebaseUser.uid}_${role}`);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              const firestoreProfile = snap.data() as UserProfile;
              // If this role matches the currently selected role, restore the full profile
              setUser(prev => {
                if (prev.role === role || role === 'conductor') {
                  const forcedRole = firebaseUser.email === 'lfalzatel@gmail.com' ? 'admin' : (firestoreProfile.role || prev.role);
                  return {
                    ...prev,
                    ...firestoreProfile,
                    role: forcedRole,
                    name: firebaseUser.displayName || firestoreProfile.name || prev.name,
                    email: firebaseUser.email || firestoreProfile.email || prev.email,
                    photoURL: firebaseUser.photoURL || firestoreProfile.photoURL || prev.photoURL,
                  };
                }
                return prev;
              });
              break; // Stop after finding first matching profile
            }
          }
        } catch (e) {
          console.warn('Could not read Firestore profile on auth change:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);


  const triggerSplash = (
    msg: string, 
    sub: string, 
    sound: string | undefined = undefined, 
    durationMs: number = 2600, 
    callback: () => void
  ) => {
    setSplashMessage(msg);
    setSplashSubtext(sub);
    setSplashSound(sound);
    setIsSplashActive(true);
    setTimeout(() => {
      callback();
      setIsSplashActive(false);
    }, durationMs);
  };

  // Bottom Navigation View Change
  const handleViewChange = (newView: 'home' | 'activity' | 'chat' | 'profile') => {
    setView(newView);
  };

  // Login completion (Checks if profile is completed or directs to complete_profile)
  const handleLoginSuccess = (profileData: any) => {
    const role = profileData.role || selectedRole;
    setSelectedRole(role);
    const isProfileComplete = Boolean(profileData.isComplete);
    const updatedUser: UserProfile = {
      ...profileData,
      role,
      isComplete: isProfileComplete,
      plateNumber: profileData.plateNumber || (role === 'conductor' ? 'WYZ-789' : undefined),
      isVerified: true,
    };
    setUser(updatedUser);

    // Set view IMMEDIATELY underneath splash screen to eliminate any blank/white screen
    const targetView = isProfileComplete ? 'home' : 'complete_profile';
    setView(targetView);

    // Trigger splash screen overlay and sound
    triggerSplash(
      'Iniciando sesión...', 
      `Bienvenido, ${updatedUser.name.split(' ')[0]}`, 
      getSysTone('login'), 
      2600, 
      () => {
        // Splash completed
      }
    );
  };

  // Complete profile completion (Driver vehicle/doc step — only conductors reach here)
  const handleCompleteProfile = (data: {
    fullName: string;
    idNumber: string;
    plateNumber: string;
    vehicleType: 'furgon' | 'sencillo';
  }) => {
    const updatedProfile = {
      name: data.fullName,
      plateNumber: data.plateNumber,
      vehicleType: data.vehicleType,
      isVerified: true,
      isComplete: true,
      documentsUploaded: {
        cedula: true,
        licencia: true,
        soat: true,
        propiedad: true,
      }
    };

    setUser(prev => ({ ...prev, ...updatedProfile }));
    setView('home');

    // Persist to Firestore AND localStorage (localStorage is the offline fallback)
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const role = user.role || 'conductor';
      const fullProfile = { ...user, ...updatedProfile };

      // 1. Save to localStorage immediately (works offline)
      try {
        localStorage.setItem(`cf_profile_${firebaseUser.uid}_${role}`, JSON.stringify(fullProfile));
      } catch (_) {}

      // 2. Save to Firestore (async, may fail if offline — that's OK)
      const docRef = doc(db, 'users', `${firebaseUser.uid}_${role}`);
      updateDoc(docRef, updatedProfile)
        .catch(() => {
          setDoc(docRef, fullProfile)
            .catch((e: Error) => console.warn('Firestore setDoc fallback error:', e));
        });
    }

    triggerSplash(
      'Verificando perfil...', 
      'Configurando tu vehículo en CargoFlow', 
      getSysTone('login'), 
      2600, 
      () => {}
    );
  };

  // Create Shipment helper
  const handleCreateShipment = (newTrip: Trip) => {
    setTrips(prev => [newTrip, ...prev]);
  };

  // Deposit funds to wallet helper
  const handleDeposit = (amount: number) => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { auth, db } = await import('./config/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      if (auth.currentUser && user.role) {
        // Try updating both possible role documents to ensure we catch the correct one
        // especially for admin users who might be using either a conductor or cliente doc
        const possibleRoles = ['conductor', 'cliente'];
        for (const r of possibleRoles) {
          try {
            const docRef = doc(db, 'users', `${auth.currentUser.uid}_${r}`);
            await updateDoc(docRef, updates);
          } catch(e) {}
        }
      }
    } catch (e) {
      console.error('Error updating profile in DB:', e);
    }

    setUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Linked accounts list (Instagram style quick account switcher)
  const [linkedAccounts, setLinkedAccounts] = useState<UserProfile[]>([
    {
      name: 'Luis Fernando (Cliente)',
      email: 'lfalzatel29@gmail.com',
      phone: '+57 300 123 4567',
      role: 'cliente',
      isVerified: true,
      rating: 5.0,
      balance: 1500000,
    }
  ]);

  // Switch account helper (Instagram style)
  const handleSwitchAccount = (targetAccount: UserProfile) => {
    triggerSplash(
      'Cambiando de cuenta...', 
      `Accediendo como ${targetAccount.name.split(' ')[0]}`, 
      getSysTone('login'), 
      2600, 
      () => {
        setLinkedAccounts(prev => {
          const filtered = prev.filter(acc => !(acc.email === targetAccount.email && acc.role === targetAccount.role));
          const exists = prev.some(acc => acc.email === user.email && acc.role === user.role);
          if (!exists) {
            return [...filtered, user];
          }
          return filtered;
        });
        setUser(targetAccount);
        setView('home');
      }
    );
  };

  // Add new account helper (Triggers Google Auth)
  const handleAddAccount = async () => {
    try {
      const { loginWithGoogle } = await import('./services/authService');
      const targetRole = user.role === 'conductor' ? 'cliente' : 'conductor';
      const newProfile = await loginWithGoogle(targetRole);
      
      triggerSplash(
        'Conectando nueva cuenta...', 
        `Añadiendo a ${newProfile.name.split(' ')[0]}`, 
        getSysTone('login'), 
        2600, 
        () => {
          setLinkedAccounts(prev => {
            const exists = prev.some(acc => acc.email === user.email && acc.role === user.role);
            if (!exists) {
              return [...prev, user];
            }
            return prev;
          });
          setUser(newProfile);
          setView('home');
        }
      );
    } catch (e) {
      console.warn('Add account notice:', e);
    }
  };

  // Reset/Logout helper (plays logout sound)
  const handleLogout = async () => {
    triggerSplash(
      'Cerrando sesión...', 
      '¡Hasta pronto!', 
      getSysTone('logout'), 
      2600, 
      async () => {
        try {
          const { logoutUser } = await import('./services/authService');
          await logoutUser();
        } catch (e) {
          console.warn('Logout error:', e);
        }
        setView('login');
      }
    );
  };

  return (
    <>
      {/* Global in-app notification toasts — rendered above everything */}
      <NotificationToast />

      <div className={`bg-background text-on-surface ${
        ['home', 'activity', 'chat', 'profile', 'settings'].includes(view)
          ? 'h-screen flex flex-col overflow-hidden'
          : 'min-h-screen'
      }`}>
      {/* Global Splash Screen Overlay with Audio */}
      <AnimatePresence>
        {isSplashActive && (
          <SplashScreen 
            message={splashMessage} 
            subtext={splashSubtext} 
            soundUrl={splashSound}
          />
        )}
      </AnimatePresence>

      {/* Global Header on main authenticated dashboards — flex-none so it doesn't steal from content area */}
      {['home', 'activity', 'chat', 'profile', 'settings'].includes(view) && (
        <div className="flex-none">
          <Header
            user={user}
            linkedAccounts={linkedAccounts}
            onNavigateToView={handleViewChange}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onAddAccount={handleAddAccount}
            onSwitchAccount={handleSwitchAccount}
            unreadCount={2}
          />
        </div>
      )}

      {/* Main content area — flex-1 so it takes exactly the remaining space */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className={`flex flex-col ${
            view === 'home'
              ? 'flex-1 overflow-hidden'
              : ['activity', 'chat', 'profile', 'settings'].includes(view)
              ? 'flex-1 overflow-y-auto pb-28'
              : 'min-h-screen'
          }`}
        >
          {view === 'login' && (
            <Login 
              currentRole={selectedRole}
              onLoginSuccess={handleLoginSuccess} 
            />
          )}

          {view === 'complete_profile' && (
            <CompleteProfile 
              initialName={user.name}
              onComplete={handleCompleteProfile} 
              onBack={() => setView('login')} 
            />
          )}

          {view === 'home' && (
            <Home 
              user={user} 
              onCreateShipment={handleCreateShipment} 
              onNavigateToView={handleViewChange}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />
          )}

          {view === 'activity' && (
            <Activity 
              trips={trips} 
              onNavigateToChat={() => setView('chat')} 
            />
          )}

          {view === 'chat' && (
            <Chat 
              initialMessages={chatMessages} 
              onBack={() => setView('home')} 
            />
          )}

          {view === 'profile' && (
            <Profile 
              user={user} 
              onUpdateProfile={handleUpdateProfile} 
              onDeposit={handleDeposit} 
              onLogout={handleLogout}
              onNavigateToSettings={() => setView('settings')}
            />
          )}

          {view === 'settings' && (
            <Settings
              user={user}
              onBack={() => setView('home')}
              onLogout={handleLogout}
              onInstallApp={() => {
                const headerEvent = new CustomEvent('cargoflow:install-app');
                window.dispatchEvent(headerEvent);
              }}
              onShareApp={() => {
                 if (navigator.share) {
                    navigator.share({
                      title: 'CargoFlow',
                      text: 'Únete a CargoFlow, la plataforma de logística inteligente.',
                      url: window.location.origin
                    }).catch(() => {});
                 }
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Render Bottom navigation on main dashboards */}
      {['home', 'activity', 'chat', 'profile', 'settings'].includes(view) && (
        <BottomNav 
          currentView={view as any} 
          onViewChange={handleViewChange} 
          unreadChatCount={1}
        />
      )}
    </div>
    </>
  );
}
