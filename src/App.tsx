import { useState, useEffect } from 'react';
import { UserProfile, Trip, ChatMessage, UserRole } from './types';
import Login from './components/Login';
import CompleteProfile from './components/CompleteProfile';
import Home from './components/Home';
import Activity from './components/Activity';
import Chat from './components/Chat';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { motion, AnimatePresence } from 'motion/react';

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
  const [view, setView] = useState<'login' | 'complete_profile' | 'home' | 'activity' | 'chat' | 'profile'>('login');
  
  // Splash Screen State
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashMessage, setSplashMessage] = useState<string>('Cargando CargoFlow...');
  const [splashSubtext, setSplashSubtext] = useState<string>('Tu solución inteligente de transporte');
  const [splashSound, setSplashSound] = useState<string>('/sounds/550332__wax_vibe__cyberpunk-bass.wav');

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
    setSplashSound('/sounds/550332__wax_vibe__cyberpunk-bass.wav');
    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  // Listen for active Firebase Auth session so session NEVER closes unexpectedly
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(prev => ({
          ...prev,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          photoURL: firebaseUser.photoURL || prev.photoURL,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Helper to trigger splash during async actions
  const triggerSplash = (
    msg: string, 
    sub: string, 
    sound: string = '/sounds/550332__wax_vibe__cyberpunk-bass.wav', 
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

  // Login completion (goes straight to main dashboard with Splash)
  const handleLoginSuccess = (profileData: any) => {
    const role = profileData.role || selectedRole;
    setSelectedRole(role);
    const updatedUser: UserProfile = {
      ...profileData,
      role,
      plateNumber: profileData.plateNumber || (role === 'conductor' ? 'WYZ-789' : undefined),
      isVerified: true,
    };
    setUser(updatedUser);

    triggerSplash(
      'Iniciando sesión...', 
      `Bienvenido, ${updatedUser.name.split(' ')[0]}`, 
      '/sounds/550332__wax_vibe__cyberpunk-bass.wav', 
      2600, 
      () => {
        setView('home');
      }
    );
  };

  // Complete profile completion (Driver vehicle/doc step)
  const handleCompleteProfile = (data: {
    fullName: string;
    idNumber: string;
    plateNumber: string;
    vehicleType: 'furgon' | 'sencillo';
  }) => {
    setUser(prev => ({
      ...prev,
      name: data.fullName,
      plateNumber: data.plateNumber,
      vehicleType: data.vehicleType,
      isVerified: true,
      documentsUploaded: {
        cedula: true,
        licencia: true,
        soat: true,
        propiedad: true,
      }
    }));
    triggerSplash(
      'Verificando perfil...', 
      'Configurando vehículo', 
      '/sounds/550332__wax_vibe__cyberpunk-bass.wav', 
      2600, 
      () => {
        setView('home');
      }
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

  // Update profile details helper
  const handleUpdateProfile = (name: string, vehiclePlate?: string) => {
    setUser(prev => ({
      ...prev,
      name,
      plateNumber: vehiclePlate || prev.plateNumber,
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
      '/sounds/550332__wax_vibe__cyberpunk-bass.wav', 
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
        '/sounds/550332__wax_vibe__cyberpunk-bass.wav', 
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

  // Reset/Logout helper (plays 73577__cyberpunk64bit__boomstick.mp3)
  const handleLogout = async () => {
    triggerSplash(
      'Cerrando sesión...', 
      '¡Hasta pronto!', 
      '/sounds/73577__cyberpunk64bit__boomstick.mp3', 
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
    <div className="min-h-screen bg-background text-on-surface">
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

      {/* Global Header on main authenticated dashboards */}
      {['home', 'activity', 'chat', 'profile'].includes(view) && (
        <Header
          user={user}
          linkedAccounts={linkedAccounts}
          onNavigateToView={handleViewChange}
          onLogout={handleLogout}
          onAddAccount={handleAddAccount}
          onSwitchAccount={handleSwitchAccount}
          unreadCount={2}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="min-h-screen flex flex-col"
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
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Render Bottom navigation on main dashboards */}
      {['home', 'activity', 'chat', 'profile'].includes(view) && (
        <BottomNav 
          currentView={view as any} 
          onViewChange={handleViewChange} 
          unreadChatCount={1}
        />
      )}
    </div>
  );
}
