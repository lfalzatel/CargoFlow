import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, Bell, Truck, Sparkles } from 'lucide-react';
import { playCoinClaimSound } from '../lib/ui-sounds';

export interface AlertModalOptions {
  title?: string;
  message: string;
  variant?: 'warning' | 'info' | 'success' | 'danger';
  icon?: string;
  buttonText?: string;
}

export function showAlert(message: string, options?: Omit<AlertModalOptions, 'message'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('cargoflow:alert', {
      detail: { message, ...options }
    })
  );
}

export const AppAlertModal: React.FC = () => {
  const [alertData, setAlertData] = useState<AlertModalOptions | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'original';
    return localStorage.getItem('cf_theme') || 'original';
  });

  useEffect(() => {
    const handleAlert = (e: Event) => {
      const detail = (e as CustomEvent<AlertModalOptions>).detail;
      if (detail && detail.message) {
        setAlertData(detail);
        try { playCoinClaimSound(); } catch (_) {}
      }
    };

    const handleThemeChange = (e?: any) => {
      const newTheme = e?.detail?.theme || localStorage.getItem('cf_theme') || 'original';
      setActiveTheme(newTheme);
    };

    window.addEventListener('cargoflow:alert', handleAlert);
    window.addEventListener('cargoflow:theme-changed', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('cargoflow:alert', handleAlert);
      window.removeEventListener('cargoflow:theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const handleClose = () => {
    setAlertData(null);
  };

  if (!alertData) return null;

  const variant = alertData.variant || 'warning';
  const title = alertData.title || (
    variant === 'warning' ? 'Atención Requerida' :
    variant === 'danger' ? 'Error' :
    variant === 'success' ? '¡Excelente!' : 'Información CargoFlow'
  );

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] backdrop-blur-md bg-black/75 flex items-center justify-center p-4 animate-fade-in"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className={
            activeTheme === 'original'
              ? "bg-white w-full max-w-sm rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-amber-400 flex flex-col items-center relative text-center my-auto overflow-hidden"
              : activeTheme === 'noche'
              ? "bg-slate-900 text-white w-full max-w-sm rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.75)] border-2 border-slate-800 flex flex-col items-center relative text-center my-auto overflow-hidden"
              : "bg-white text-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border-2 border-slate-200 flex flex-col items-center relative text-center my-auto overflow-hidden"
          }
        >
          {/* Top Decorative Mario / Accent Bar */}
          {activeTheme === 'original' ? (
            <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400" />
          ) : (
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              variant === 'danger' ? 'bg-red-500' :
              variant === 'success' ? 'bg-emerald-500' :
              variant === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />
          )}

          {/* Close X Button */}
          <button
            type="button"
            onClick={handleClose}
            className={`absolute top-3.5 right-3.5 p-1.5 rounded-full transition-colors cursor-pointer border ${
              activeTheme === 'noche'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 border-slate-200'
            }`}
          >
            <X size={18} />
          </button>

          {/* Icon Header Badge */}
          <div className="mb-3 mt-1 flex flex-col items-center">
            {alertData.icon ? (
              <div className="text-4xl p-3 bg-amber-100/30 rounded-2xl mb-1">
                {alertData.icon}
              </div>
            ) : activeTheme === 'original' ? (
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white shadow-md mb-2 animate-bounce-subtle ${
                variant === 'danger' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                variant === 'success' ? 'bg-gradient-to-br from-emerald-400 to-teal-600' :
                variant === 'warning' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                {variant === 'danger' && <AlertCircle size={32} className="text-white drop-shadow-md" />}
                {variant === 'success' && <CheckCircle2 size={32} className="text-white drop-shadow-md" />}
                {variant === 'warning' && <AlertTriangle size={32} className="text-white drop-shadow-md" />}
                {variant === 'info' && <Truck size={32} className="text-white drop-shadow-md" fill="currentColor" />}
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${
                variant === 'danger' ? (activeTheme === 'noche' ? 'bg-red-950/80 border border-red-800 text-red-400' : 'bg-red-50 text-red-600') :
                variant === 'success' ? (activeTheme === 'noche' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600') :
                variant === 'warning' ? (activeTheme === 'noche' ? 'bg-amber-950/80 border border-amber-800 text-amber-400' : 'bg-amber-50 text-amber-600') :
                (activeTheme === 'noche' ? 'bg-blue-950/80 border border-blue-800 text-blue-400' : 'bg-blue-50 text-blue-600')
              }`}>
                {variant === 'danger' && <AlertCircle size={28} />}
                {variant === 'success' && <CheckCircle2 size={28} />}
                {variant === 'warning' && <AlertTriangle size={28} />}
                {variant === 'info' && <Truck size={28} fill="currentColor" />}
              </div>
            )}

            {/* Badge Pill in Original Theme */}
            {activeTheme === 'original' && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full text-white shadow-xs ${
                variant === 'danger' ? 'bg-red-600' :
                variant === 'success' ? 'bg-emerald-600' :
                variant === 'warning' ? 'bg-amber-600' : 'bg-blue-600'
              }`}>
                📢 AVISO CARGOFLOW
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-base font-black leading-snug mb-1.5 ${
            activeTheme === 'noche' ? 'text-white' : 'text-slate-900'
          }`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`text-xs font-semibold leading-relaxed mb-5 max-w-xs ${
            activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {alertData.message}
          </p>

          {/* Accept Button */}
          <button
            type="button"
            onClick={handleClose}
            className={`w-full py-3.5 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-white border ${
              variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-red-300' :
              variant === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-emerald-300' :
              variant === 'warning' ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 border-amber-300' :
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-blue-300'
            } ${
              activeTheme === 'original' ? 'shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-0.5' : ''
            }`}
          >
            <span>{alertData.buttonText || '¡Entendido!'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
