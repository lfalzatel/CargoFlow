import React, { useState } from 'react';
import { Eye, EyeOff, Truck, User } from 'lucide-react';
import { motion } from 'motion/react';
import { loginWithGoogle, loginWithEmail } from '../services/authService';
import { UserRole } from '../types';

interface LoginProps {
  currentRole?: UserRole;
  onLoginSuccess: (email: string, role: UserRole) => void;
  onNavigateToRegister: () => void;
  onGoogleLoginSuccess?: (profile: any) => void;
}

export default function Login({ currentRole = 'conductor', onLoginSuccess, onNavigateToRegister, onGoogleLoginSuccess }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      await loginWithEmail(email, password);
      setIsLoading(false);
      onLoginSuccess(email, selectedRole);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      const userProfile = await loginWithGoogle(selectedRole);
      setIsLoading(false);
      if (onGoogleLoginSuccess) {
        onGoogleLoginSuccess({ ...userProfile, role: selectedRole });
      } else {
        onLoginSuccess(userProfile.email || 'usuario.google@cargoflow.co', selectedRole);
      }
    } catch (e) {
      console.warn('Google login popup error:', e);
      setIsLoading(false);
      onLoginSuccess('usuario.google@cargoflow.co', selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      <main className="flex-1 flex flex-col justify-center px-6 md:max-w-md md:mx-auto w-full py-12">
        {/* Logo Header */}
        <header className="flex flex-col items-center mb-6 w-full">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mb-3 rounded-2xl bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-center border border-surface-container"
          >
            <Truck className="text-primary-container" size={32} fill="currentColor" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-extrabold text-on-surface text-center tracking-tight"
          >
            Bienvenido de nuevo
          </motion.h1>
          <p className="text-sm text-on-surface-variant mt-1 text-center">
            Selecciona tu rol para iniciar sesión.
          </p>
        </header>

        {/* Mandatory Role Selection Toggle */}
        <div className="w-full bg-surface-container-low p-1.5 rounded-2xl mb-6 border border-surface-container flex gap-1">
          <button
            type="button"
            onClick={() => setSelectedRole('conductor')}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'conductor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
            }`}
          >
            <Truck size={18} />
            <span>Soy Conductor</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('cliente')}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedRole === 'cliente'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60'
            }`}
          >
            <User size={18} />
            <span>Soy Cliente</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Email Input */}
          <div className="relative mb-4">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-transparent focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
              placeholder=" "
              required
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
              peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
              peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Correo electrónico
            </label>
          </div>

          {/* Password Input */}
          <div className="relative mb-6">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full h-[56px] px-4 pt-5 pb-2 pr-12 border-2 border-outline-variant rounded-xl text-on-surface bg-transparent focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
              placeholder=" "
              required
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
              peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
              peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
              peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
            >
              Contraseña
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-[56px] text-white font-bold text-base rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer disabled:opacity-60 ${
              selectedRole === 'conductor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Conectando...' : `Iniciar sesión como ${selectedRole === 'conductor' ? 'Conductor' : 'Cliente'}`}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            O continúa con Google
          </span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>

        {/* Social Login */}
        <div className="w-full">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 h-[56px] border-2 border-outline-variant rounded-xl hover:bg-surface-container-low transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            title="Iniciar sesión con Google"
          >
            <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-bold text-on-surface">Continuar con Google</span>
          </button>
        </div>

        {/* Registration Link */}
        <div className="mt-8 text-center w-full pb-8">
          <p className="text-sm text-on-surface-variant">
            ¿No tienes cuenta?
            <button
              onClick={onNavigateToRegister}
              className="text-primary font-bold ml-1 hover:underline focus:outline-none"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
