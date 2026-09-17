import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, Sparkles, AlertCircle, Volume2 } from 'lucide-react';
import { requestNotificationPermission } from '../services/notificationService';
import { playGamificationFanfare, playCoinClaimSound } from '../lib/ui-sounds';

export const NotificationPromptModal: React.FC = () => {
  // Modal states: 'prompt' | 'celebration' | 'minimized' | 'hidden'
  const [modalState, setModalState] = useState<'prompt' | 'celebration' | 'minimized' | 'hidden'>('hidden');
  const [hamburgerPosition, setHamburgerPosition] = useState<'right' | 'left'>('right');
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'original';
    return localStorage.getItem('cf_theme') || 'original';
  });

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

    const handleThemeChange = (e?: any) => {
      const newTheme = e?.detail?.theme || localStorage.getItem('cf_theme') || 'original';
      setActiveTheme(newTheme);
    };

    updateHamburgerPos();
    evaluateState();
    handleThemeChange();

    // Event listeners for config/storage/notif changes
    const handleStorageChange = () => {
      evaluateState();
      handleThemeChange();
    };
    const handleConfettiToggle = (e: any) => {
      if (e?.detail?.target === 'notification' || e?.detail?.key === 'cf_notif_enabled') {
        if (e?.detail?.activated === false) {
          // Notifications were turned OFF specifically
          sessionStorage.removeItem('cf_notif_prompt_minimized');
          setModalState('prompt');
        } else if (e?.detail?.activated === true) {
          evaluateState();
        }
      }
    };

    window.addEventListener('cargoflow:map-controls-config-changed', updateHamburgerPos);
    window.addEventListener('cargoflow:theme-changed', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cargoflow:toggle-confetti', handleConfettiToggle);
    window.addEventListener('cargoflow:notif-settings-changed', handleStorageChange);

    return () => {
      window.removeEventListener('cargoflow:map-controls-config-changed', updateHamburgerPos);
      window.removeEventListener('cargoflow:theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cargoflow:toggle-confetti', handleConfettiToggle);
      window.removeEventListener('cargoflow:notif-settings-changed', handleStorageChange);
    };
  }, []);

  const handleActivateClick = async () => {
    playCoinClaimSound();
    localStorage.setItem('cf_notif_enabled', 'true');
    window.dispatchEvent(new StorageEvent('storage', { key: 'cf_notif_enabled', newValue: 'true' }));
    window.dispatchEvent(new CustomEvent('cargoflow:notif-settings-changed', { detail: { key: 'cf_notif_enabled', value: true } }));
    window.dispatchEvent(new CustomEvent('cargoflow:toggle-confetti', {
      detail: {
        title: 'Notificaciones Activadas',
        subtitle: 'Recibirás alertas en tiempo real',
        statusText: '🔔 Notificaciones Activadas',
        activated: true,
      }
    }));

    await requestNotificationPermission();
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

  // Calculate exact pixel-perfect target coordinates so modal glides directly into floating sphere position
  const exitTargetX = hamburgerPosition === 'right' ? 'calc(-50vw + 42px)' : 'calc(50vw - 42px)';
  const exitTargetY = 'calc(-50vh + 106px)';

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
              initial={{ scale: 0.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.15, opacity: 0 }}
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

      {/* ── MARIO BROS PROMPT MODAL (WITH SEAMLESS MORPHING FLIGHT TO SPHERE) ─ */}
      <AnimatePresence>
        {modalState === 'prompt' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-[450] backdrop-blur-md bg-black/75 flex items-center justify-center p-4"
            onClick={handleMinimize}
          >
            <motion.div
              initial={{ 
                scale: 0.15, 
                opacity: 0, 
                x: exitTargetX, 
                y: exitTargetY, 
                borderRadius: '9999px',
                rotate: -180 
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                x: 0, 
                y: 0, 
                borderRadius: '24px', 
                rotate: 0 
              }}
              exit={{ 
                scale: 0.14, 
                opacity: 0.9, 
                x: exitTargetX, 
                y: exitTargetY, 
                borderRadius: '9999px',
                rotate: -360 
              }}
              transition={{ 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'original'
                  ? "bg-white w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-amber-400 flex flex-col items-center relative text-center my-auto overflow-hidden"
                  : activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-2 border-slate-800 flex flex-col items-center relative text-center my-auto overflow-hidden"
                  : "bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-2 border-slate-200 flex flex-col items-center relative text-center my-auto overflow-hidden"
              }
            >
              {/* Top Bar */}
              {activeTheme === 'original' ? (
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-red-500 to-emerald-400" />
              ) : (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              )}
              
              {/* Close X button */}
              <button
                onClick={handleMinimize}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors border cursor-pointer ${
                  activeTheme === 'noche'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 border-slate-200'
                }`}
              >
                <X size={18} />
              </button>

              {/* Game Badge Image Banner vs Clean Icon Box */}
              {activeTheme === 'original' ? (
                <div className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 rounded-2xl p-4 border-2 border-amber-300 mb-4 mt-2 flex flex-col items-center shadow-inner relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center mb-2 animate-bounce-subtle">
                    <Bell size={32} className="text-white drop-shadow-md" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-3.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    ⚡ ALERTAS EN TIEMPO REAL
                  </span>
                </div>
              ) : (
                <div className="w-full rounded-2xl p-3 mb-2 mt-2 flex flex-col items-center relative overflow-hidden">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-1 shadow-md ${
                    activeTheme === 'noche' ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  }`}>
                    <Bell size={32} />
                  </div>
                </div>
              )}

              {/* Speech Bubble / Title Content */}
              {activeTheme === 'original' ? (
                <>
                  <h3 className="text-base font-black text-slate-900 leading-tight mb-2">
                    ¿Quieres activar las <span className="text-amber-600">Notificaciones</span>?
                  </h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed mb-5 px-1">
                    ¡Entérate al instante de nuevos fletes, ofertas tentadoras de conductores y el estado de tus envíos en tiempo real!
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl">
                    <span className="text-xl">🍄</span>
                    <span className="text-[11px] font-black text-amber-900">
                      ¡No te pierdas ninguna oportunidad!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className={`text-lg font-black leading-tight mb-2 ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-900'}`}>
                    ¿Deseas activar las <span className="text-emerald-600">Notificaciones</span>?
                  </h3>
                  <p className={`text-xs font-medium leading-relaxed mb-6 px-2 ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Recibe alertas instantáneas en tu dispositivo sobre solicitudes de transporte, ofertas de conductores y actualización de envíos.
                  </p>
                </>
              )}

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={handleActivateClick}
                  className={`w-full py-3.5 font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTheme === 'original'
                      ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-700 text-white shadow-[0_6px_0_#15803d] active:translate-y-1 border border-emerald-300 font-black'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                  }`}
                >
                  <Sparkles size={18} />
                  <span>Activar Notificaciones</span>
                </button>

                <button
                  onClick={handleMinimize}
                  className={`w-full py-2.5 font-bold text-xs rounded-2xl transition cursor-pointer ${
                    activeTheme === 'noche'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  Ahora no
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CELEBRATION / SUCCESS MODAL ─────────────────── */}
      <AnimatePresence>
        {modalState === 'celebration' && (
          <div 
            className="fixed inset-0 z-[500] backdrop-blur-md bg-black/80 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setModalState('hidden')}
          >
            {/* Confetti particles in Original (Gamer) mode */}
            {activeTheme === 'original' && (
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-[510]">
                {[...Array(40)].map((_, i) => {
                  const leftPos = (i * 2.5) % 100;
                  const delay = (i % 8) * 0.35;
                  const duration = 3 + (i % 5) * 0.5;
                  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#eab308'];
                  return (
                    <motion.div
                      key={`confetti-p-${i}`}
                      initial={{ y: '-10vh', opacity: 1, rotate: 0 }}
                      animate={{ y: '110vh', opacity: [1, 1, 0.8, 0], rotate: 720 }}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        delay: delay,
                        ease: 'linear'
                      }}
                      className="absolute top-0 w-3.5 h-3.5 rounded-sm shadow-sm"
                      style={{
                        left: `${leftPos}%`,
                        backgroundColor: colors[i % colors.length],
                      }}
                    />
                  );
                })}
              </div>
            )}

            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'original'
                  ? "bg-white w-full max-w-sm rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-emerald-400 flex flex-col items-center relative text-center my-auto z-[520]"
                  : activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-sm rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden border-2 border-slate-800 flex flex-col items-center relative text-center my-auto z-[520]"
                  : "bg-white text-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden border-2 border-slate-200 flex flex-col items-center relative text-center my-auto z-[520]"
              }
            >
              {/* Celebration Banner */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-white font-black text-xs uppercase tracking-widest px-5 py-1.5 rounded-full shadow-md border-2 border-emerald-200 mb-4 animate-pulse">
                🎉 ¡NOTIFICACIONES ACTIVADAS!
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-black mb-1 flex items-center gap-1.5 justify-center ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-900'}`}>
                <span>¡Todo Listo!</span>
              </h3>
              <p className={`text-xs font-medium leading-relaxed mb-4 ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-600'}`}>
                Ahora recibirás alertas de fletes, ofertas y el estado de tus envíos en tiempo real.
              </p>

              {/* Central Icon */}
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 border-4 border-emerald-200 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                  <Bell size={48} className="text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full border-2 border-white shadow-md flex items-center gap-1">
                  <Sparkles size={12} /> ACTIVADO
                </div>
              </div>

              {/* Unlocked Perks List */}
              <div className={`w-full border-2 rounded-2xl p-3.5 mb-5 space-y-2 text-left ${
                activeTheme === 'noche' ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <div className={`flex items-center gap-2 text-xs font-bold ${activeTheme === 'noche' ? 'text-slate-200' : 'text-slate-800'}`}>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Alertas de fletes en tiempo real</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${activeTheme === 'noche' ? 'text-slate-200' : 'text-slate-800'}`}>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <span>Ofertas de conductores al instante</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${activeTheme === 'noche' ? 'text-slate-200' : 'text-slate-800'}`}>
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
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md cursor-pointer border border-emerald-300"
              >
                ¡Perfecto! Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
