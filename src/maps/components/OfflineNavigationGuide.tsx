import React, { useState, useEffect } from 'react';
import { Navigation, Navigation2, Compass, ArrowRight, Play, Pause, Download, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { RouteInfo, LatLng } from '../models/mapTypes';
import { mapService } from '../core/MapService';
import { regionDownloadManager } from '../services/storage/RegionDownloadManager';

interface OfflineNavigationGuideProps {
  route: RouteInfo;
  isOnline: boolean;
  onClose: () => void;
}

export const OfflineNavigationGuide: React.FC<OfflineNavigationGuideProps> = ({
  route,
  isOnline,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCachingRoute, setIsCachingRoute] = useState(false);
  const [isRouteCached, setIsRouteCached] = useState(false);
  const [speed, setSpeed] = useState(62); // km/h

  const steps = route.steps && route.steps.length > 0 ? route.steps : [
    { instruction: 'Iniciar recorrido en el punto de origen', distanceKm: 2.5, durationMin: 5, position: route.origin },
    { instruction: 'Continuar por el corredor principal de carga', distanceKm: Math.round(route.distanceKm * 0.7), durationMin: Math.round(route.durationMin * 0.7), position: route.points[Math.floor(route.points.length / 2)] },
    { instruction: 'Llegar al destino del transporte', distanceKm: 1.2, durationMin: 3, position: route.destination },
  ];

  const currentStep = steps[currentStepIdx] || steps[0];

  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            return 100;
          }
          const next = prev + 4;
          const pointIdx = Math.floor((next / 100) * (route.points.length - 1));
          if (route.points[pointIdx]) {
            mapService.setCamera({ center: route.points[pointIdx], zoom: 15 }, true);
          }
          const stepIdx = Math.floor((next / 100) * steps.length);
          if (stepIdx < steps.length) {
            setCurrentStepIdx(stepIdx);
          }
          setSpeed(50 + Math.floor(Math.random() * 25));
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isSimulating, route.points, steps.length]);

  const handleDownloadRouteTiles = async () => {
    setIsCachingRoute(true);
    try {
      // Simulate caching map tiles along the route bounds
      await new Promise((res) => setTimeout(res, 2000));
      setIsRouteCached(true);
    } catch (e) {
      console.error('Error caching route tiles:', e);
    } finally {
      setIsCachingRoute(false);
    }
  };

  const remainingDistance = Math.round(route.distanceKm * (1 - progressPercent / 100) * 10) / 10;
  const remainingTime = Math.round(route.durationMin * (1 - progressPercent / 100));

  return (
    <div className="bg-[#09152b]/95 border border-emerald-500/30 rounded-3xl shadow-2xl p-4 text-white backdrop-blur-md flex flex-col gap-3 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Guía de Navegación de Transporte
              {!isOnline && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  OFFLINE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {route.originName || 'Origen'} ➔ {route.destinationName || 'Destino'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Turn-by-Turn Maneuver Box */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
          <Navigation2 className="w-6 h-6 rotate-45" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
            Próxima Instrucción ({currentStepIdx + 1} de {steps.length})
          </div>
          <div className="text-sm font-bold text-white mt-0.5 leading-snug">
            {currentStep.instruction}
          </div>
          <div className="text-xs text-emerald-300/80 mt-1 font-medium">
            En {currentStep.distanceKm} km ({currentStep.durationMin} min aprox)
          </div>
        </div>
      </div>

      {/* Navigation Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
          <div className="text-[10px] font-medium text-slate-400">Velocidad</div>
          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
            {isSimulating ? speed : 0} <span className="text-[10px] font-normal text-slate-300">km/h</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
          <div className="text-[10px] font-medium text-slate-400">Distancia Rest.</div>
          <div className="text-sm font-extrabold text-white mt-0.5">
            {remainingDistance} <span className="text-[10px] font-normal text-slate-300">km</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 text-center">
          <div className="text-[10px] font-medium text-slate-400">ETA Restante</div>
          <div className="text-sm font-extrabold text-blue-400 mt-0.5">
            {remainingTime} <span className="text-[10px] font-normal text-slate-300">min</span>
          </div>
        </div>
      </div>

      {/* Route Progress Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-300">Progreso de la Ruta</span>
          <span className="text-emerald-400">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls & Offline Cache Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl font-bold text-xs shadow-lg transition-all ${
            isSimulating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/30'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-4 h-4 fill-current" /> Pausar Simulación
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Simular Recorrido
            </>
          )}
        </button>

        <button
          onClick={handleDownloadRouteTiles}
          disabled={isCachingRoute || isRouteCached}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl font-bold text-xs border transition-all ${
            isRouteCached
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
          }`}
          title="Guardar tiles de la ruta para uso sin conexión"
        >
          {isCachingRoute ? (
            <span className="animate-pulse">Guardando...</span>
          ) : isRouteCached ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Ruta Offline
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-blue-400" />
              Guardar Offline
            </>
          )}
        </button>
      </div>
    </div>
  );
};
