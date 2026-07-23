import { useState } from 'react';
import { UserProfile, Trip, ChatMessage, UserRole } from './types';
import RoleSelection from './components/RoleSelection';
import Login from './components/Login';
import Register from './components/Register';
import CompleteProfile from './components/CompleteProfile';
import Home from './components/Home';
import Activity from './components/Activity';
import Chat from './components/Chat';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';
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
  const [view, setView] = useState<'role_selection' | 'login' | 'register' | 'complete_profile' | 'home' | 'activity' | 'chat' | 'profile'>('role_selection');
  
  // Selected role from welcome screen
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // Bottom Navigation View Change
  const handleViewChange = (newView: 'home' | 'activity' | 'chat' | 'profile') => {
    setView(newView);
  };

  // Welcome page role selection completion
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Adjust default user data to selected role
    if (role === 'cliente') {
      setUser({
        name: 'Carlos Rodríguez', // default name as mockup
        email: 'carlos.cliente@cargoflow.co',
        phone: '+57 320 123 4567',
        role: 'cliente',
        isVerified: true,
        rating: 5.0,
        balance: 1250000,
      });
      setView('login');
    } else {
      setUser({
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
      setView('login');
    }
  };

  // Login completion
  const handleLoginSuccess = (email: string) => {
    setUser(prev => ({
      ...prev,
      email: email,
    }));
    
    if (selectedRole === 'conductor' && !user.plateNumber) {
      setView('complete_profile');
    } else {
      setView('home');
    }
  };

  // Registration completion
  const handleRegisterSuccess = (name: string, email: string, phone: string) => {
    setUser({
      name,
      email,
      phone,
      role: selectedRole,
      isVerified: true,
      rating: 5.0,
      balance: 1250000, // starting balance COP
    });

    if (selectedRole === 'conductor') {
      setView('complete_profile');
    } else {
      setView('home');
    }
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
    setView('home');
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

  // Reset/Logout helper
  const handleLogout = () => {
    setView('role_selection');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="min-h-screen flex flex-col"
        >
          {view === 'role_selection' && (
            <RoleSelection 
              onRoleSelect={handleRoleSelect} 
              onNavigateToLogin={() => setView('login')} 
            />
          )}

          {view === 'login' && (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onNavigateToRegister={() => setView('register')} 
            />
          )}

          {view === 'register' && (
            <Register 
              onRegisterSuccess={handleRegisterSuccess} 
              onNavigateToLogin={() => setView('login')} 
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
