import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LatLng, MapProviderType, PlaceSearchResult, RouteInfo } from '../models/mapTypes';
import { 
  Navigation, 
  Compass, 
  MapPin, 
  Flag, 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Route as RouteIcon, 
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { getMapControlsConfig, MapControlsConfig } from '../services/mapSettings';

interface MapControlsProps {
  activeProvider: MapProviderType;
  isOnline: boolean;
  isAutoSwitch: boolean;
  activeRoute: RouteInfo | null;
  onSearch: (query: string) => Promise<PlaceSearchResult[]>;
  onSelectPlace: (place: PlaceSearchResult) => void;
  onCalculateRoute: (origin: LatLng, destination: LatLng) => Promise<RouteInfo>;
  onClearRoute: () => void;
  onCenterUserLocation: () => void;
  onToggleProvider: (provider: MapProviderType) => void;
  onToggleAutoSwitch: (enabled: boolean) => void;
  onToggleTraffic: (enabled: boolean) => void;
  userLocation: LatLng;
  onOpenRegionManager?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  activeProvider,
  isOnline,
  isAutoSwitch,
  activeRoute,
  onSearch,
  onSelectPlace,
  onCalculateRoute,
  onClearRoute,
  onCenterUserLocation,
  onToggleProvider,
  onToggleAutoSwitch,
  onToggleTraffic,
  userLocation,
  onOpenRegionManager,
}) => {
  // Layout preferences config (position: left/right, direction: vertical/horizontal)
  const [config, setConfig] = useState<MapControlsConfig>(() => getMapControlsConfig());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Strict drag bounds safe-zone container ref
  const dragBoundsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Smart deployment direction ('up' vs 'down') & horizontal align ('left' vs 'right') based on drop position relative to safe zone
  const [deployDirection, setDeployDirection] = useState<'up' | 'down'>('up');
  const [horizontalAlign, setHorizontalAlign] = useState<'left' | 'right'>(() => config.position);

  useEffect(() => {
    const handleConfigChange = () => {
      const newCfg = getMapControlsConfig();
      setConfig(newCfg);
      setHorizontalAlign(newCfg.position);
    };
    window.addEventListener('cargoflow:map-controls-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('cargoflow:map-controls-config-changed', handleConfigChange);
    };
  }, []);

  const handleDragEnd = () => {
    if (triggerRef.current && dragBoundsRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const boundsRect = dragBoundsRef.current.getBoundingClientRect();
      
      // Vertical deployment direction
      const relativeY = triggerRect.top - boundsRect.top;
      if (relativeY < boundsRect.height * 0.45) {
        setDeployDirection('down');
      } else {
        setDeployDirection('up');
      }

      // Horizontal alignment direction
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;
      const boundsCenterX = boundsRect.left + boundsRect.width / 2;
      if (triggerCenterX < boundsCenterX) {
        setHorizontalAlign('left');
      } else {
        setHorizontalAlign('right');
      }
    }
  };

  const [originText, setOriginText] = useState('Mi Ubicación GPS');
  const [originPos, setOriginPos] = useState<LatLng>(userLocation);
  const [destText, setDestText] = useState('');
  const [destPos, setDestPos] = useState<LatLng | null>(null);

  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [isRouteCardExpanded, setIsRouteCardExpanded] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleInputChange = async (type: 'origin' | 'dest', text: string) => {
    if (type === 'origin') {
      setOriginText(text);
    } else {
      setDestText(text);
    }
    setActiveInput(type);

    if (text.trim().length > 1) {
      setIsSearching(true);
      const results = await onSearch(text);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (place: PlaceSearchResult) => {
    if (activeInput === 'origin') {
      setOriginText(place.title);
      setOriginPos(place.position);
    } else {
      setDestText(place.title);
      setDestPos(place.position);
    }
    onSelectPlace(place);
    setSearchResults([]);
    setActiveInput(null);
  };

  const handleUseCurrentLocationForOrigin = () => {
    setOriginText('Mi Ubicación GPS');
    setOriginPos(userLocation);
    onCenterUserLocation();
    setActiveInput(null);
  };

  const handleTraceRoute = async () => {
    if (!destPos) return;
    try {
      await onCalculateRoute(originPos, destPos);
      setIsExpanded(false);
    } catch (e) {
      console.warn('Error calculating route:', e);
    }
  };

  const isRight = config.position === 'right';
  const isVertical = config.direction === 'vertical';
  const isAlignLeft = horizontalAlign === 'left';

  const getPopoverPositionClass = () => {
    if (!isVertical) {
      return isAlignLeft ? 'left-14 top-0' : 'right-14 top-0';
    }
    const verticalClass = deployDirection === 'down' ? 'top-14' : 'bottom-14';
    const horizontalClass = isAlignLeft ? 'left-0' : 'right-0';
    return `${verticalClass} ${horizontalClass}`;
  };

  return (
    <div className="w-full h-full relative z-10 pointer-events-none flex flex-col justify-between p-3 select-none">
      
      {/* Top Section: Active Route Details Card & Route Input Box */}
      <div className="w-full max-w-md mx-auto pointer-events-auto flex flex-col gap-2 z-30">
        {/* Route Calculation Search Drawer */}
        {isExpanded && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl text-white flex flex-col gap-3 animate-slide-down">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <RouteIcon size={18} className="text-emerald-400" />
                <h3 className="font-headline text-sm font-extrabold tracking-tight">Trazar y Calcular Ruta Logística</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Origin Input */}
            <div className="relative">
              <label className="text-[10px] uppercase font-black tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                <MapPin size={11} /> Origen (Punto de Cargue)
              </label>
              <input
                type="text"
                value={originText}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                onFocus={() => setActiveInput('origin')}
                placeholder="Buscar punto de salida..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {activeInput === 'origin' && (
                <button
                  onClick={handleUseCurrentLocationForOrigin}
                  className="mt-1 text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass size={12} /> Usar mi ubicación GPS actual
                </button>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label className="text-[10px] uppercase font-black tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                <Flag size={11} /> Destino (Punto de Entrega)
              </label>
              <input
                type="text"
                value={destText}
                onChange={(e) => handleInputChange('dest', e.target.value)}
                onFocus={() => setActiveInput('dest')}
                placeholder="Buscar punto de llegada..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Search Results list */}
            {activeInput && searchResults.length > 0 && (
              <div className="max-h-36 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleSelectResult(res)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-700/80 transition flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                      <MapPin size={13} />
                      {res.title}
                    </span>
                    <span className="text-[11px] text-slate-300 truncate">{res.address}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Action Button: Trazar Ruta */}
            <button
              onClick={handleTraceRoute}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-1"
            >
              <RouteIcon size={16} />
              <span>Calcular Ruta</span>
            </button>
          </div>
        )}

        {/* Active Route Details Card & Turn-by-Turn Steps (Collapsed by default) */}
        {activeRoute && (
          !isRouteCardExpanded ? (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 border border-emerald-400/40 rounded-2xl px-3.5 py-2 shadow-lg text-white flex items-center justify-between gap-2 backdrop-blur-md animate-slide-down">
              <div 
                onClick={() => setIsRouteCardExpanded(true)}
                className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
              >
                <Navigation size={15} className="text-emerald-200 flex-shrink-0" />
                <span className="text-xs font-black text-white truncate">
                  Ruta Calculada ({activeRoute.distanceKm} km • <span className="text-amber-300">{activeRoute.durationMin} min</span>)
                </span>
                <ChevronDown size={16} className="text-emerald-200 flex-shrink-0" />
              </div>
              <button
                onClick={onClearRoute}
                className="text-emerald-900 font-bold text-[11px] bg-white hover:bg-slate-100 px-2.5 py-1 rounded-xl shadow-xs transition cursor-pointer flex-shrink-0"
              >
                Limpiar
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 border border-emerald-400/40 rounded-3xl p-4 shadow-[0px_15px_40px_rgba(16,185,129,0.35)] text-white flex flex-col gap-3 backdrop-blur-md animate-slide-down">
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => setIsRouteCardExpanded(false)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
                    <Navigation size={16} />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-white">Ruta Calculada con Éxito</h4>
                      <ChevronUp size={16} className="text-emerald-200" />
                    </div>
                    <p className="text-[10px] text-emerald-100 font-medium">
                      {activeRoute.isOffline ? 'Ruta procesada offline (Haversine)' : 'Ruta OSRM Online'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClearRoute}
                  className="text-emerald-800 font-black text-xs bg-white hover:bg-slate-100 px-3 py-1 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Limpiar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/20 border border-white/30 p-2.5 rounded-2xl text-center backdrop-blur-xs">
                <div>
                  <p className="text-[10px] text-emerald-100 uppercase font-extrabold tracking-wider">Distancia Total</p>
                  <p className="text-base font-black text-white">{activeRoute.distanceKm} km</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-100 uppercase font-extrabold tracking-wider">Tiempo Estimado</p>
                  <p className="text-base font-black text-amber-300">{activeRoute.durationMin} min</p>
                </div>
              </div>

              {activeRoute.steps && activeRoute.steps.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="w-full flex items-center justify-between text-xs text-white py-1 font-bold cursor-pointer"
                  >
                    <span>Itinerario paso a paso ({activeRoute.steps.length} instrucciones)</span>
                    {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showSteps && (
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                      {activeRoute.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white/15 p-2 rounded-xl text-[11px] flex items-start justify-between border border-white/20"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-white font-medium">{step.instruction}</span>
                          </div>
                          <span className="text-amber-300 font-mono font-bold text-[10px] flex-shrink-0">
                            {step.distanceKm} km
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* DRAG BOUNDING CONTAINER (Constrained below Top Card and above Bottom Nav Bar) */}
      <div 
        ref={dragBoundsRef} 
        className="absolute inset-0 top-[155px] bottom-[16px] left-2 right-2 pointer-events-none z-40 overflow-visible"
      >
        {/* Draggable Floating Button Trigger Container (Fixed origin 48x48px, never shifts on expand) */}
        <motion.div 
          ref={triggerRef}
          drag
          dragConstraints={dragBoundsRef}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.08 }}
          className={`pointer-events-auto absolute bottom-1 z-50 touch-none ${
            isRight ? 'right-2' : 'left-2'
          }`}
        >
          {/* Main Floating Trigger Hamburger Circle (Fixed size 48x48px) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white shadow-2xl border-2 border-emerald-400/60 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-grab active:cursor-grabbing hover:opacity-95"
            title="Controles del Mapa (Arrastrar para mover)"
          >
            {isMenuOpen ? <X size={20} /> : <SlidersHorizontal size={20} />}
          </button>

          {/* Expandable Menu Panel (Absolute Popover so it NEVER shifts the trigger button) */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={`absolute ${getPopoverPositionClass()} bg-slate-900/95 border border-slate-700/90 backdrop-blur-xl p-2 rounded-3xl shadow-2xl z-50 ${
                  !isVertical 
                    ? 'max-w-[calc(100vw-75px)] overflow-x-auto no-scrollbar' 
                    : 'min-w-[170px]'
                }`}
              >
                <div className={`flex ${!isVertical ? 'flex-row items-center gap-1.5 flex-nowrap' : 'flex-col gap-2'}`}>
                  {/* 1. Recenter GPS Location Button */}
                  <button
                    onClick={() => {
                      onCenterUserLocation();
                      setIsMenuOpen(false);
                    }}
                    className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white border border-emerald-400/40 rounded-2xl shadow-md transition flex items-center gap-1.5 text-xs font-black active:scale-95 cursor-pointer whitespace-nowrap ${
                      !isVertical ? 'px-2.5 py-2 flex-shrink-0' : 'w-full p-2.5 justify-start'
                    }`}
                    title="Centrar en mi ubicación GPS"
                  >
                    <Compass size={16} className="text-white flex-shrink-0" />
                    <span className="text-[11px] font-extrabold">{!isVertical ? 'GPS' : 'Mi Posición'}</span>
                  </button>

                  {/* 2. Toggle Route Simulator / Search */}
                  <button
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                      setIsMenuOpen(false);
                    }}
                    className={`rounded-2xl shadow-md border text-xs font-black transition flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap ${
                      !isVertical ? 'px-2.5 py-2 flex-shrink-0' : 'w-full p-2.5 justify-start'
                    } ${
                      isExpanded 
                        ? 'bg-white text-emerald-800 border-white' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 hover:opacity-95'
                    }`}
                    title="Trazar y Calcular Ruta"
                  >
                    <RouteIcon size={15} className="flex-shrink-0" />
                    <span className="text-[11px] font-extrabold">Ruta</span>
                  </button>

                  {/* 3. Offline Region Manager Download */}
                  {onOpenRegionManager && (
                    <button
                      onClick={() => {
                        onOpenRegionManager();
                        setIsMenuOpen(false);
                      }}
                      className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white border border-emerald-400/40 rounded-2xl shadow-md transition flex items-center gap-1.5 text-xs font-black active:scale-95 cursor-pointer whitespace-nowrap ${
                        !isVertical ? 'px-2.5 py-2 flex-shrink-0' : 'w-full p-2.5 justify-start'
                      }`}
                      title="Descargar Mapas Offline"
                    >
                      <Download size={15} className="text-white flex-shrink-0" />
                      <span className="text-[11px] font-extrabold">Offline</span>
                    </button>
                  )}

                  {/* 4. Toggle Traffic (Online Mode) */}
                  {activeProvider === 'google' && (
                    <button
                      onClick={() => {
                        const next = !trafficEnabled;
                        setTrafficEnabled(next);
                        onToggleTraffic(next);
                        setIsMenuOpen(false);
                      }}
                      className={`rounded-2xl shadow-md border text-xs font-black transition flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap ${
                        !isVertical ? 'px-2.5 py-2 flex-shrink-0' : 'w-full p-2.5 justify-start'
                      } ${
                        trafficEnabled
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 hover:opacity-95'
                      }`}
                      title="Tráfico en Tiempo Real"
                    >
                      <Layers size={15} className="flex-shrink-0" />
                      <span className="text-[11px] font-extrabold">Tráfico</span>
                    </button>
                  )}

                  {/* 5. Provider Selector Toggle */}
                  <div className={`flex bg-slate-800 border border-slate-700 rounded-2xl p-1 shadow-md text-xs ${
                    !isVertical ? 'flex-shrink-0' : 'w-full'
                  }`}>
                    <button
                      onClick={() => {
                        onToggleAutoSwitch(false);
                        onToggleProvider('google');
                        setIsMenuOpen(false);
                      }}
                      disabled={!isOnline}
                      className={`px-2 py-1 rounded-xl font-black transition text-center cursor-pointer text-[10px] ${
                        activeProvider === 'google'
                          ? 'bg-white text-emerald-800 shadow-md'
                          : 'text-slate-300 hover:text-white disabled:opacity-40'
                      }`}
                    >
                      Google
                    </button>
                    <button
                      onClick={() => {
                        onToggleAutoSwitch(false);
                        onToggleProvider('osm_offline');
                        setIsMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded-xl font-black transition text-center cursor-pointer text-[10px] ${
                        activeProvider === 'osm_offline'
                          ? 'bg-white text-emerald-800 shadow-md'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      OSM
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
