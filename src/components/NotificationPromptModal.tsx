import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Sparkles, AlertCircle, Volume2 } from 'lucide-react';
import { requestNotificationPermission } from '../services/notificationService';
import { playGamificationFanfare, playCoinClaimSound } from '../lib/ui-sounds';

export const NotificationPromptModal: React.FC = () => {
  // Modal states: 'prompt' | 'celebration' | 'minimized' | 'hidden'
  const [modalState, setModalState] = useState<'prompt' | 'celebration' | 'minimized' | 'hidden'>('hidden');
  const [hamburgerPosition, setHamburgerPosition] = useState<'right' | 'left'>('right');

  // Drag bounding container ref
  const dragBoundsRef = useRef<HTMLDivElement>(null);

  // Helper to check if notifications are active both in browser AND CargoFlow app settings
  const isNotificationActive = () => {
    if (typeof window === 'undefined') return true;
    const browserGranted = 'Notification' in window && Notification.permission === 'granted';
    const appEnabled = localStorage.getItem('cf_notif_enabled') !== 'false';
    return browserGranted && appEnabled;
  };

  // Evaluate notification state and determine prompt/sphere/hidden
  const evaluateState = () => {
    if (typeof window === 'undefined') return;

    if (isNotificationActive()) {
      setModalState('hidden');
      return;
    }

    // If notifications are inactive (disabled in app settings or browser permission not granted)
    const isMinimized = sessionStorage.getItem('cf_notif_prompt_minimized') === 'true';
    if (isMinimized) {
      setModalState('minimized');
    } else {
      setModalState('prompt');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check hamburger menu button position from localStorage
    const updateHamburgerPos = () => {
      const storedPos = localStorage.getItem('cf_map_controls_position') || 'right';
      setHamburgerPosition(storedPos === 'left' ? 'left' : 'right');
    };

    updateHamburgerPos();
    evaluateState();

    // Event listeners for config/storage/notif changes
    const handleStorageChange = () => evaluateState();
    const handleConfettiToggle = (e: any) => {
      if (e?.detail?.activated === false) {
        // Notifications were turned OFF in header dropdown
        sessionStorage.removeItem('cf_notif_prompt_minimized');
        setModalState('prompt');
      } else if (e?.detail?.activated === true) {
        evaluateState();
      }
    };

    window.addEventListener('cargoflow:map-controls-config-changed', updateHamburgerPos);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cargoflow:toggle-confetti', handleConfettiToggle);
    window.addEventListener('cargoflow:notif-settings-changed', handleStorageChange);

    return () => {
      window.removeEventListener('cargoflow:map-controls-config-changed', updateHamburgerPos);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cargoflow:toggle-confetti', handleConfettiToggle);
      window.removeEventListener('cargoflow:notif-settings-changed', handleStorageChange);
    };
  }, []);

  const handleActivateClick = async () => {
    playCoinClaimSound();
    localStorage.setItem('cf_notif_enabled', 'true');
    window.dispatchEvent(new StorageEvent('storage', { key: 'cf_notif_enabled', newValue: 'true' }));

    const perm = await requestNotificationPermission();
    setModalState('celebration');
    playGamificationFanfare();
    sessionStorage.removeItem('cf_notif_prompt_minimized');
  };

  const handleMinimize = () => {
    sessionStorage.setItem('cf_notif_prompt_minimized', 'true');
    setModalState('minimized');
  };

  const handleReopenPrompt = () => {
    playCoinClaimSound();
    setModalState('prompt');
  };

  // If modal state is hidden, don't render anything
  if (modalState === 'hidden') {
    return null;
  }

  // Calculate opposite position in X and Y relative to hamburger button
  const spherePositionClass = hamburgerPosition === 'right'
    ? 'left-3 top-20'
    : 'right-3 top-20';

  // Calculate exit trajectory coordinates so modal glides toward sphere location
  const exitTargetX = hamburgerPosition === 'right' ? '-38vw' : '38vw';
  const exitTargetY = '-35vh';

  return (
    <>
      {/* ── DRAG BOUNDS CONTAINER FOR FLOATING SPHERE ───────────────── */}
      <div 
        ref={dragBoundsRef} 
        className="fixed inset-0 top-[75px] bottom-[20px] left-2 right-2 pointer-events-none z-[350] overflow-visible"
      >
        {/* ── FLOATING NOTIFICATION SPHERE (MINIMIZED STATE) ────────────── */}
        <AnimatePresence>
          {modalState === 'minimized' && (
            <motion.div
              drag
              dragConstraints={dragBoundsRef}
              dragElastic={0.08}
              dragMomentum={false}
              whileDrag={{ scale: 1.15 }}
              initial={{ scale: 0.2, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 280 }}
              className={`pointer-events-auto absolute ${spherePositionClass} z-[350] touch-none`}
            >
              <button
                onClick={handleReopenPrompt}
                className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 border-2 border-amber-200 shadow-[0_8px_25px_rgba(245,158,11,0.5)] flex items-center justify-center transition-transform active:scale-90 cursor-grab active:cursor-grabbing hover:opacity-95 relative group"
                title="Activar Notificaciones (Toca para abrir)"
              >
                {/* Glowing ring animation */}
                <div className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
                
                {/* Notification Icon */}
                <Bell size={22} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" />

                {/* Badge indicator */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white font-black text-[10px] rounded-full border-2 border-white flex items-center justify-center shadow-md animate-bounce">
                  !
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MARIO BROS PROMPT MODAL (IMAGE 1 STYLE WITH MORPHING EXIT) ─ */}
      <AnimatePresence>
        {modalState === 'prompt' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed inset-0 z-[450] backdrop-blur-md bg-black/75 flex items-center justify-center p-4"
            onClick={handleMinimize}
          >
            <motion.div
              initial={{ scale: 0.25, opacity: 0, y: 80 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
              exit={{ 
                scale: 0.15, 
                opacity: 0.1, 
                x: exitTargetX, 
                y: exitTargetY, 
                rotate: -12 
              }}
              transition={{ 
                type: 'spring', 
                damping: 18, 
                stiffness: 260, 
                bounce: 0.4 
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden border-4 border-amber-400 flex flex-col items-center relative text-center my-auto"
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-red-500 to-emerald-400" />
              
              {/* Close X button */}
              <button
                onClick={handleMinimize}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Game Badge Image Banner */}
              <div className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 rounded-2xl p-4 border-2 border-amber-300 mb-4 mt-2 flex flex-col items-center shadow-inner relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center mb-2 animate-bounce-subtle">
                  <Bell size={32} className="text-white drop-shadow-md" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-3.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  ⚡ ALERTAS EN TIEMPO REAL
                </span>
              </div>

              {/* Speech Bubble Content */}
              <h3 className="text-base font-black text-slate-900 leading-tight mb-2">
                ¿Quieres activar las <span className="text-amber-600">Notificaciones</span>?
              </h3>
              
              <p className="text-xs font-bold text-slate-600 leading-relaxed mb-5 px-1">
                ¡Entérate al instante de nuevos fletes, ofertas tentadoras de conductores y el estado de tus envíos en tiempo real!
              </p>

              {/* Mascot / Toad Character Avatar */}
              <div className="flex items-center justify-center gap-2 mb-4 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl">
                <span className="text-xl">🍄</span>
                <span className="text-[11px] font-black text-amber-900">
                  ¡No te pierdas ninguna oportunidad!
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={handleActivateClick}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_6px_0_#15803d] active:shadow-[0_2px_0_#15803d] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300"
                >
                  <Sparkles size={18} />
                  <span>¡Activar Notificaciones!</span>
                </button>

                <button
                  onClick={handleMinimize}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition cursor-pointer border border-slate-200"
                >
                  Ahora no (Minimizar a esfera)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEVEL UP / CELEBRATION MODAL (IMAGES 2 & 3 STYLE) ────────── */}
      <AnimatePresence>
        {modalState === 'celebration' && (
          <div 
            className="fixed inset-0 z-[500] backdrop-blur-md bg-black/80 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setModalState('hidden')}
          >
            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ y: -20, opacity: 1, x: Math.random() * 300 - 150, rotate: 0 }}
                  animate={{ y: 600, opacity: 0, rotate: 360 }}
                  transition={{ duration: 2.5 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 0.5 }}
                  className="absolute top-0 left-1/2 w-3 h-3 rounded-sm shadow-md"
                  style={{
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-yellow-400 flex flex-col items-center relative text-center my-auto"
            >
              {/* Golden Scroll Banner */}
              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs uppercase tracking-widest px-6 py-1.5 rounded-full shadow-md border-2 border-amber-200 mb-4 animate-pulse">
                🌟 USTED RECIBIÓ 🌟
              </div>

              {/* Level Up Title */}
              <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-1.5 justify-center">
                <span>¡Nivel Desbloqueado!</span>
              </h3>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-4">
                Notificaciones Activadas con Éxito
              </p>

              {/* Central Reward Item Icon (Image 2/3 style) */}
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-amber-200 shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                  <Bell size={48} className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow-md">
                  +100 EXP
                </div>
              </div>

              {/* Unlocked Perks List */}
              <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 mb-5 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Alertas de fletes en tiempo real</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Ofertas de conductores al instante</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Rastreo y estado de envíos</span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={() => {
                  playCoinClaimSound();
                  setModalState('hidden');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_6px_0_#15803d] active:shadow-[0_2px_0_#15803d] active:translate-y-1 transition-all cursor-pointer border border-emerald-300"
              >
                ¡Excelente! Clic para continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
