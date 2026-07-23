import React, { useState } from 'react';
import { Eye, EyeOff, Truck, ArrowRight, X } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterProps {
  onRegisterSuccess: (name: string, email: string, phone: string) => void;
  onNavigateToLogin: () => void;
}

export default function Register({ onRegisterSuccess, onNavigateToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && phone && password && acceptedTerms) {
      onRegisterSuccess(name, email, phone);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-background w-full top-0 sticky flex items-center justify-between px-6 py-4 z-50 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <Truck className="text-primary-container" size={24} fill="currentColor" />
          <span className="text-lg font-bold text-primary-container">CargoFlow</span>
        </div>
        <button 
          onClick={onNavigateToLogin}
          className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 w-full max-w-md mx-auto">
        <div className="w-full bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-6 border border-surface-container flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Crea tu cuenta</h1>
            <p className="text-sm text-on-surface-variant mt-1">Únete a la red logística más eficiente.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name Input */}
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-transparent focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
                placeholder=" "
                required
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Nombre completo
              </label>
            </div>

            {/* Email Input */}
            <div className="relative">
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

            {/* Phone Input */}
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-transparent focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
                placeholder=" "
                required
              />
              <label
                htmlFor="phone"
                className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Teléfono
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-[1.5px] border-outline rounded-md checked:bg-primary-container checked:border-primary-container focus:ring-2 focus:ring-primary-container/30 focus:ring-offset-1 transition-all"
                  required
                />
                <svg
                  className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity stroke-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors select-none leading-relaxed">
                Acepto los{' '}
                <a href="#" className="text-primary-container hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                  términos y condiciones
                </a>{' '}
                de servicio.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!acceptedTerms}
              className={`mt-4 w-full h-[56px] rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm ${
                acceptedTerms 
                  ? 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] cursor-pointer hover:shadow-md'
                  : 'bg-surface-variant text-outline opacity-60 cursor-not-allowed'
              }`}
            >
              Crear cuenta
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Navigation to Login */}
          <div className="text-center pt-4 border-t border-surface-container-high">
            <p className="text-sm text-on-surface-variant">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-primary-container font-bold hover:underline focus:outline-none"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
