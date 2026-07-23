import React from 'react';
import { motion } from 'motion/react';
import CargoFlowLogo from './CargoFlowLogo';

interface SplashScreenProps {
  message?: string;
  subtext?: string;
}

export default function SplashScreen({ 
  message = 'Cargando CargoFlow...', 
  subtext = 'Tu solución inteligente de transporte' 
}: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#09152b] via-[#0b224d] to-[#041029] text-white flex flex-col items-center justify-between py-12 px-6 antialiased select-none"
    >
      {/* Top Spacer */}
      <div className="w-full flex justify-center pt-4">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20">
          CargoFlow Colombia PWA
        </span>
      </div>

      {/* Main Center Animated Logo & Status */}
      <div className="flex flex-col items-center justify-center gap-6 text-center my-auto">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <CargoFlowLogo size="xl" />
        </motion.div>

        <div className="flex flex-col items-center gap-2 max-w-xs">
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-extrabold text-white tracking-tight"
          >
            CargoFlow
          </motion.h2>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-semibold text-blue-200/90"
          >
            {message}
          </motion.p>
          
          <motion.span 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-slate-400 mt-1"
          >
            {subtext}
          </motion.span>
        </div>

        {/* Pulse Bar Indicator */}
        <div className="w-36 h-1.5 bg-blue-950/80 rounded-full overflow-hidden border border-blue-500/20 mt-2">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-slate-400 font-medium">
          Plataforma de Logística & Carga Terrestre
        </p>
      </div>
    </motion.div>
  );
}
