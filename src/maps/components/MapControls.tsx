import React, { useState } from 'react';
import { LatLng, MapProviderType, PlaceSearchResult, RouteInfo } from '../models/mapTypes';
import { AddressAutocompleteInput } from '../../components/common/AddressAutocompleteInput';
import { Navigation, Compass, Layers, TrafficCone, ShieldCheck } from 'lucide-react';

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
  onToggleNavigationGuide?: () => void;
  isNavigationGuideOpen?: boolean;
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
  onToggleNavigationGuide,
  isNavigationGuideOpen,
}) => {
  const [originText, setOriginText] = useState('Mi Ubicación GPS');
  const [originPos, setOriginPos] = useState<LatLng>(userLocation);
  const [destText, setDestText] = useState('');
  const [destPos, setDestPos] = useState<LatLng | null>(null);

  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleTraceRoute = async () => {
    const start = originPos || userLocation;
    let end = destPos;

    if (!end && destText.trim()) {
      const results = await onSearch(destText);
      if (results.length > 0) {
        end = results[0].position;
      }
    }

    if (!end) {
      end = { lat: 6.273, lng: -75.568 };
      setDestText('Terminal del Norte, Medellín');
    }

    await onCalculateRoute(start, end);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md pointer-events-auto">
      {/* Route & Search Panel */}
      <div className="bg-[#09152b]/95 border border-white/10 rounded-3xl shadow-2xl p-4 text-white flex flex-col gap-3 backdrop-blur-md">
        {/* Origin Field with Autocomplete */}
        <AddressAutocompleteInput
          label="Origen de Carga"
          value={originText}
          onChange={(text, pos) => {
            setOriginText(text);
            if (pos) setOriginPos(pos);
          }}
          placeholder="Origen (Dirección, Terminal, Ciudad...)"
          iconColor="text-emerald-400"
        />

        {/* Destination Field with Autocomplete */}
        <AddressAutocompleteInput
          label="Destino del Transporte"
          value={destText}
          onChange={(text, pos) => {
            setDestText(text);
            if (pos) {
              setDestPos(pos);
              onSelectPlace({
                id: `dest_${Date.now()}`,
                title: text,
                address: text,
                position: pos,
              });
            }
          }}
          placeholder="Destino (e.g. Terminal Norte, Bogotá, Cali, Puerto...)"
          iconColor="text-rose-400"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleTraceRoute}
            className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Trazar y Calcular Ruta</span>
          </button>
        </div>
      </div>

      {/* Active Route Details Card */}
      {activeRoute && (
        <div className="bg-[#09152b]/95 border border-emerald-500/40 rounded-3xl p-4 shadow-2xl text-white flex flex-col gap-3 backdrop-blur-md animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">Ruta de Transporte Lista</h4>
                <p className="text-[10px] text-slate-400">
                  {activeRoute.isOffline ? 'Modo Offline' : 'Ruta OSRM Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onToggleNavigationGuide && (
                <button
                  onClick={onToggleNavigationGuide}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl transition ${
                    isNavigationGuideOpen
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  Guía Conductores
                </button>
              )}
              <button
                onClick={onClearRoute}
                className="text-slate-400 hover:text-white text-xs bg-white/10 px-2.5 py-1 rounded-xl"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Distancia Total</p>
              <p className="text-base font-black text-white">{activeRoute.distanceKm} km</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tiempo Estimado</p>
              <p className="text-base font-black text-emerald-400">{activeRoute.durationMin} min</p>
            </div>
          </div>

          {activeRoute.steps && activeRoute.steps.length > 0 && (
            <div>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white py-1 font-medium"
              >
                <span>Itinerario paso a paso ({activeRoute.steps.length} instrucciones)</span>
                <span className="material-symbols-outlined text-sm">
                  {showSteps ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showSteps && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                  {activeRoute.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-2 rounded-xl text-[11px] flex items-start justify-between border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-200">{step.instruction}</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold text-[10px] flex-shrink-0">
                        {step.distanceKm} km
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Toolbar Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Recenter GPS Location Button */}
        <button
          onClick={onCenterUserLocation}
          className="bg-[#09152b]/95 hover:bg-[#09152b] text-white border border-white/10 rounded-2xl p-2.5 shadow-xl transition flex items-center gap-1.5 text-xs font-medium active:scale-95"
          title="Centrar en mi ubicación GPS instantánea"
        >
          <span className="material-symbols-outlined text-emerald-400 text-lg">my_location</span>
          <span className="hidden sm:inline">Mi Posición GPS</span>
        </button>

        {/* Toggle Traffic (Online Mode) */}
        {activeProvider === 'google' && (
          <button
            onClick={() => {
              const next = !trafficEnabled;
              setTrafficEnabled(next);
              onToggleTraffic(next);
            }}
            className={`rounded-2xl p-2.5 shadow-xl border text-xs font-medium transition flex items-center gap-1 active:scale-95 ${
              trafficEnabled
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-[#09152b]/95 text-slate-300 border-white/10 hover:text-white'
            }`}
            title="Tráfico en Tiempo Real"
          >
            <TrafficCone className="w-4 h-4" />
            <span className="hidden sm:inline">Tráfico</span>
          </button>
        )}

        {/* Provider Selector Menu */}
        <div className="flex bg-[#09152b]/95 border border-white/10 rounded-2xl p-1 shadow-xl text-xs">
          <button
            onClick={() => {
              onToggleAutoSwitch(false);
              onToggleProvider('google');
            }}
            disabled={!isOnline}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeProvider === 'google'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => {
              onToggleAutoSwitch(false);
              onToggleProvider('osm_offline');
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeProvider === 'osm_offline'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OSM Offline
          </button>
        </div>
      </div>
    </div>
  );
};
