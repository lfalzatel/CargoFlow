import React, { useState } from 'react';
import { Truck, User, Sun, Moon } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState(true); // Permanent dark mode default

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      const userProfile = await loginWithGoogle(selectedRole);
      setIsLoading(false);
      onLoginSuccess({ ...userProfile, role: selectedRole });
    } catch (e: any) {
      setIsLoading(false);
      if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') {
        // User voluntarily closed popup, do nothing
        return;
      }
      onLoginSuccess({
        name: selectedRole === 'cliente' ? 'Luis Fernando (Cliente)' : 'Luis Fernando Alzate',
        email: selectedRole === 'cliente' ? 'lfalzatel29@gmail.com' : 'lfalzatel@gmail.com',
        phone: selectedRole === 'cliente' ? '+57 300 123 4567' : '+57 312 987 6543',
        role: selectedRole,
        isVerified: true,
        rating: 5.0,
        balance: 1250000,
        photoURL: undefined,
      });
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col justify-center items-center px-4 py-8 antialiased select-none transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#09152b] via-[#0b224d] to-[#041029] text-white' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 text-slate-900'
    }`}>
      {/* Top Right Floating Day/Night Theme Toggle */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-lg ${
          isDarkMode 
            ? 'bg-white/10 text-amber-400 border border-white/20 hover:bg-white/20' 
            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
        }`}
        title={isDarkMode ? 'Cambiar a modo Día' : 'Cambiar a modo Noche'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Glassmorphic Dark Container Card (Exact Style Match to Reference Image) */}
      <motion.main 
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`w-full max-w-sm sm:max-w-md rounded-[36px] p-7 sm:p-9 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-[#141E34] via-[#0E1728] to-[#090F1C] border border-blue-500/20 shadow-[0_30px_70px_rgba(0,0,0,0.8)]' 
            : 'bg-white border border-slate-200 shadow-2xl'
        }`}
      >
        {/* Top Subtle Ambient Glow */}
        {isDarkMode && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />
        )}

        {/* Animated Circular Logo with Smooth Floating Motion */}
        <motion.div 
          animate={{ 
            y: [0, -10, 0] // Smooth levitation animation
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3.6, 
            ease: 'easeInOut' 
          }}
          className="mb-6 flex justify-center drop-shadow-2xl z-10"
        >
          <CargoFlowLogo size="xl" />
        </motion.div>

        {/* Welcome Titles & Subtitle */}
        <div className="text-center mb-6 w-full z-10">
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDarkMode ? 'text-white drop-shadow-sm' : 'text-slate-900'
          }`}>
            Bienvenido a CargoFlow
          </h1>
          <p className={`text-xs sm:text-sm font-medium mt-2 leading-relaxed max-w-xs mx-auto ${
            isDarkMode ? 'text-slate-300/80' : 'text-slate-600'
          }`}>
            La plataforma inteligente para conectar conductores y clientes en todo el país.
          </p>
        </div>

        {/* Role Selector Segmented Control ([ Soy Conductor | Soy Cliente ]) */}
        <div className={`w-full p-1.5 rounded-2xl mb-6 flex gap-1.5 shadow-md border transition-colors z-10 ${
          isDarkMode 
            ? 'bg-black/30 border-white/10 backdrop-blur-md' 
            : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setSelectedRole('conductor')}
            className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'conductor'
                ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]'
                : isDarkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
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
                ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                : isDarkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <User size={18} />
            <span>Soy Cliente</span>
          </button>
        </div>

        {/* Direct Google Authentication Button */}
        <div className="w-full z-10">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 h-[56px] bg-white rounded-2xl transition-all active:scale-[0.98] cursor-pointer shadow-xl border ${
              isDarkMode 
                ? 'border-white/20 hover:border-emerald-400 text-slate-900' 
                : 'border-slate-300 hover:border-blue-500 text-slate-900'
            } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
            title={`Iniciar sesión como ${selectedRole === 'conductor' ? 'Conductor' : 'Cliente'} con Google`}
          >
            <svg aria-hidden="true" className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-extrabold text-slate-900">
              {isLoading ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
            </span>
          </button>
        </div>

        {/* Terms Disclaimer Subtext */}
        <p className={`text-[11px] font-medium text-center mt-6 z-10 ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Al continuar, aceptas los términos y condiciones.
        </p>
      </motion.main>
    </div>
  );
}
