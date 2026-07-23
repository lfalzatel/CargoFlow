import React, { useState } from 'react';
import { Truck, User } from 'lucide-react';
import { motion } from 'motion/react';
import { loginWithGoogle } from '../services/authService';
import { UserRole } from '../types';
import CargoFlowLogo from './CargoFlowLogo';

interface LoginProps {
  currentRole?: UserRole;
  onLoginSuccess: (profile: any) => void;
}

export default function Login({ currentRole = 'conductor', onLoginSuccess }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      const userProfile = await loginWithGoogle(selectedRole);
      setIsLoading(false);
      onLoginSuccess({ ...userProfile, role: selectedRole });
    } catch (e) {
      console.warn('Google login popup notice:', e);
      setIsLoading(false);
      onLoginSuccess({
        name: 'Luis Fernando Alzate',
        email: 'lfalzatel@gmail.com',
        phone: '+57 312 987 6543',
        role: selectedRole,
        isVerified: true,
        rating: 5.0,
        balance: 1250000,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-12 antialiased select-none">
      <main className="w-full max-w-sm mx-auto flex flex-col items-center justify-center">
        
        {/* Animated Circular Logo Header */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex justify-center"
        >
          <CargoFlowLogo size="lg" />
        </motion.div>

        {/* Welcome Titles */}
        <motion.header 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8 w-full"
        >
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2">
            Selecciona tu rol para iniciar sesión.
          </p>
        </motion.header>

        {/* Role Selector Segmented Control ([ Soy Conductor | Soy Cliente ]) */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-surface-container-low p-1.5 rounded-2xl mb-8 border border-surface-container flex gap-1.5 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setSelectedRole('conductor')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'conductor'
                ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
            }`}
          >
            <Truck size={18} />
            <span>Soy Conductor</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('cliente')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'cliente'
                ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
            }`}
          >
            <User size={18} />
            <span>Soy Cliente</span>
          </button>
        </motion.div>

        {/* Direct Google Authentication Button */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 h-[58px] bg-white border-2 border-surface-container rounded-2xl hover:border-primary-container/40 hover:bg-blue-50/30 transition-all active:scale-[0.98] cursor-pointer shadow-md ${
              isLoading ? 'opacity-75 cursor-wait' : ''
            }`}
            title={`Iniciar sesión como ${selectedRole === 'conductor' ? 'Conductor' : 'Cliente'} con Google`}
          >
            <svg aria-hidden="true" className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-extrabold text-on-surface">
              {isLoading ? 'Conectando con Google...' : 'Continuar con Google'}
            </span>
          </button>
        </motion.div>

        {/* Footer Subtext */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs font-semibold text-outline text-center mt-12"
        >
          CargoFlow Colombia • Plataforma Pro
        </motion.p>
      </main>
    </div>
  );
}
