import React from 'react';
import { Truck } from 'lucide-react';
import { motion } from 'motion/react';

interface CargoFlowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function CargoFlowLogo({ size = 'md', showText = false }: CargoFlowLogoProps) {
  // Size mapping
  const dimensions = {
    sm: { box: 'w-16 h-16', svg: 80, icon: 20, stroke: 2.5 },
    md: { box: 'w-24 h-24', svg: 120, icon: 32, stroke: 3 },
    lg: { box: 'w-32 h-32', svg: 160, icon: 44, stroke: 3.5 },
    xl: { box: 'w-40 h-40', svg: 200, icon: 56, stroke: 4 },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className={`relative ${dimensions.box} flex items-center justify-center`}>
        {/* Outer Ring rotating Clockwise (Divided into 3 segments) */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute inset-0 w-full h-full text-emerald-500 overflow-visible"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            strokeDasharray="64 32" // 3 equal segments (64px stroke + 32px gap = 96px x 3 = 288px circumference)
            strokeLinecap="round"
            className="opacity-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
        </motion.svg>

        {/* Inner Ring rotating Counter-Clockwise (Divided into 3 segments) */}
        <motion.svg
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          className="absolute inset-0 w-full h-full text-blue-500 overflow-visible"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            strokeDasharray="52 27" // 3 equal segments
            strokeLinecap="round"
            className="opacity-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
        </motion.svg>

        {/* Central Circular Badge with Seamless Blue Truck Icon */}
        <div className="w-[68%] h-[68%] rounded-full bg-gradient-to-br from-[#0b244d] via-[#091b3a] to-[#041026] shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center border-2 border-cyan-400/60 z-10 relative overflow-hidden p-0.5">
          <img 
            src="/pwa-512x512.png" 
            alt="CargoFlow Truck Icon" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {showText && (
        <span className="font-headline-md text-2xl font-extrabold text-primary-container tracking-tight mt-3">
          CargoFlow
        </span>
      )}
    </div>
  );
}
