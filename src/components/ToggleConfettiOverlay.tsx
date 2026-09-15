// src/components/ToggleConfettiOverlay.tsx
'use client';

import React, { useEffect } from 'react';
import { Star, CheckCircle, Sparkles } from 'lucide-react';
import { playToggleConfettiSound, speakVoiceConfirmation } from '../lib/ui-sounds';

interface ToggleConfettiOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  statusText?: string;
  activated?: boolean;
}

// Genera 40 partículas de confeti dorado cayendo continuamente estilo videojuego
const CONFETTI_PARTICLES = Array.from({ length: 42 }).map((_, i) => ({
  id: i,
  left: Math.floor(Math.random() * 96) + 2, // 2% a 98%
  size: Math.floor(Math.random() * 10) + 8, // 8px a 18px
  aspectRatio: Math.random() > 0.5 ? 'w-2 h-3.5' : 'w-3 h-3',
  color: [
    '#fbbf24', // Dorado brillante
    '#f59e0b', // Ámbar
    '#fde047', // Amarillo sol
    '#ffffff', // Blanco destello
    '#d97706', // Naranja dorado
    '#10b981', // Esmeralda (si activo)
  ][i % 6],
  duration: 1.8 + Math.random() * 2.2, // 1.8s a 4s
  delay: Math.random() * 2.5, // 0s a 2.5s
  rotation: Math.floor(Math.random() * 360),
}));

export default function ToggleConfettiOverlay({
  isOpen,
  onClose,
  title = 'Actualización exitosa.',
  subtitle = 'Configuración guardada correctamente',
  statusText,
  activated = true,
}: ToggleConfettiOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      playToggleConfettiSound(activated);
      const voiceText = statusText ? `Actualización exitosa. ${statusText}` : `Actualización exitosa. ${subtitle}`;
      speakVoiceConfirmation(voiceText);
    }
  }, [isOpen, activated, title, subtitle, statusText]);

  if (!isOpen) return null;
  if (typeof window !== 'undefined' && localStorage.getItem('cf_gamification_anim_enabled') === 'false') {
    return null;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-between p-6 bg-slate-950/85 backdrop-blur-md select-none cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* CSS Keyframes de Lluvia Infinita de Confeti */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translate3d(0, -60px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate3d(20px, 105vh, 0) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pulseBeam {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.45; }
          50% { transform: scale(1.15) rotate(180deg); opacity: 0.75; }
        }
      `}</style>

      {/* Lluvia Continua de Partículas Doradas (42 confetis) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {CONFETTI_PARTICLES.map((pt) => (
          <div
            key={pt.id}
            className={`absolute rounded-xs shadow-sm ${pt.aspectRatio}`}
            style={{
              left: `${pt.left}%`,
              top: '-30px',
              backgroundColor: pt.color,
              boxShadow: `0 0 10px ${pt.color}`,
              animation: `confettiFall ${pt.duration}s linear ${pt.delay}s infinite`,
              transform: `rotate(${pt.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Espaciador Superior */}
      <div className="pt-10 opacity-0">Top</div>

      {/* Centro: Resplandor + Estrella Gigante + Texto de Estado (Igual a la imagen de referencia) */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-sm px-4">
        {/* Rayos de Luz Radiantes de Fondo */}
        <div className="absolute w-[360px] h-[360px] rounded-full pointer-events-none flex items-center justify-center -z-10 animate-[pulseBeam_12s_linear_infinite]">
          <div
            className="w-full h-full rounded-full opacity-60"
            style={{
              background: `conic-gradient(from 0deg, #fbbf24 0deg 20deg, transparent 20deg 40deg, #f59e0b 40deg 60deg, transparent 60deg 80deg, #fbbf24 80deg 100deg, transparent 100deg 120deg, #f59e0b 120deg 140deg, transparent 140deg 160deg, #fbbf24 160deg 180deg, transparent 180deg 200deg, #f59e0b 200deg 220deg, transparent 220deg 240deg, #fbbf24 240deg 260deg, transparent 260deg 280deg, #f59e0b 280deg 300deg, transparent 300deg 320deg, #fbbf24 320deg 340deg, transparent 340deg 360deg)`,
              maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)',
            }}
          />
        </div>

        {/* Ícono de Estrella 3D Brillante */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4 flex items-center justify-center animate-[bounce_2s_infinite]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 blur-xl opacity-80 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border-4 border-yellow-200 shadow-[0_0_50px_rgba(251,191,36,0.9)] flex items-center justify-center">
            <Star className="w-16 h-16 sm:w-20 sm:h-20 text-slate-950 fill-amber-950 drop-shadow-md" />
          </div>
        </div>

        {/* Título Principal de la Actualización */}
        <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-tight mb-2">
          {title}
        </h2>

        {/* Texto de Estado Específico (si aplica) */}
        {statusText && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-extrabold text-sm mb-2 shadow-lg backdrop-blur-sm">
            <Sparkles size={16} />
            <span>{statusText}</span>
          </div>
        )}

        {/* Subtítulo descriptivo */}
        <p className="text-xs sm:text-sm font-bold text-yellow-100/90 max-w-xs drop-shadow-xs leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Parte Inferior: Clic para continuar (Igual a la imagen de referencia) */}
      <div className="pb-10 z-20 flex flex-col items-center gap-1.5 animate-pulse">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-200/90 drop-shadow-md bg-white/10 border border-white/20 px-5 py-2 rounded-full backdrop-blur-md">
          Clic para continuar
        </span>
      </div>
    </div>
  );
}
