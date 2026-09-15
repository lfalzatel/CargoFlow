import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Crosshair, CheckCircle2 } from 'lucide-react';
import L from 'leaflet';
import { COLOMBIA_LOGISTICS_PLACES } from '../maps/services/search/SearchCatalog';

interface MapPickerModalProps {
  isOpen: boolean;
  target: 'origin' | 'destination';
  initialAddress?: string;
  onClose: () => void;
  onConfirmLocation: (address: string, coords?: { lat: number; lng: number }) => void;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  target,
  initialAddress = '',
  onClose,
  onConfirmLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const isOrigin = target === 'origin';
  const themeColor = isOrigin ? 'border-emerald-400' : 'border-blue-400';
  const themeBg = isOrigin ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-indigo-600';
  const pinIconEmoji = isOrigin ? '📍' : '🏁';
  const titleText = isOrigin ? 'Origen (Punto de Recogida)' : 'Destino (Punto de Entrega)';

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: 6.2442, lng: -75.5812 });
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || (isOrigin ? 'Medellín, Antioquia' : 'Bogotá, D.C.'));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof COLOMBIA_LOGISTICS_PLACES>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const mainAddress = parts.slice(0, 3).join(',').trim();
          setSelectedAddress(mainAddress || data.display_name);
          setIsGeocoding(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding fallback:', err);
    }
    // Fallback address text
    setSelectedAddress(`Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setIsGeocoding(false);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Default center: Medellín (or user initial)
    const initialLat = 6.2442;
    const initialLng = -75.5812;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Icon for Leaflet Marker
      const customIcon = L.divIcon({
        className: 'custom-picker-pin',
        html: `<div style="font-size: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translate(-50%, -100%); line-height: 1;">${pinIconEmoji}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      markerInstanceRef.current = marker;
      mapInstanceRef.current = map;

      // Handle map drag / move to update coordinates & address
      const handlePositionChange = (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng });
        reverseGeocode(lat, lng);
      };

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handlePositionChange(pos.lat, pos.lng);
      });

      // Recalculate container size on mount
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    } else {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Center map on user's current GPS
  const handleUseCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setSelectedCoords({ lat, lng });
        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        }
      });
    }
  };

  // Search places catalog or geocode search input
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const matches = COLOMBIA_LOGISTICS_PLACES.filter(
      p => p.title.toLowerCase().includes(q.toLowerCase()) || p.address.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(matches);
  };

  const handleSelectSearchResult = (place: typeof COLOMBIA_LOGISTICS_PLACES[0]) => {
    setSelectedAddress(place.title);
    setSelectedCoords({ lat: place.coords.lat, lng: place.coords.lng });
    setSearchQuery('');
    setSearchResults([]);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([place.coords.lat, place.coords.lng], 16);
      markerInstanceRef.current.setLatLng([place.coords.lat, place.coords.lng]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[500] backdrop-blur-md bg-black/75 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white w-full max-w-lg rounded-3xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.35)] overflow-hidden max-h-[90vh] flex flex-col border-4 ${themeColor} my-auto relative`}
        >
          {/* Top Decorative Bar */}
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${themeBg}`} />

          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100 mb-3 mt-1">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl p-1 bg-slate-100 rounded-xl shadow-xs border border-slate-200">🗺️</span>
                <span className={`bg-gradient-to-r ${themeBg} bg-clip-text text-transparent font-black`}>
                  {titleText}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                Arrastra el marcador o toca en el mapa para ubicar
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer border border-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Address Search Bar */}
          <div className="relative mb-3 z-20">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
            <input
              type="text"
              placeholder="Buscar dirección, lugar o punto (ej. El Poblado, Terminal Carga...)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs font-black text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black"
              >
                Limpiar
              </button>
            )}

            {/* Auto-suggest dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border-2 border-slate-200 rounded-2xl shadow-xl max-h-44 overflow-y-auto z-30 p-1 flex flex-col gap-1">
                {searchResults.map((p) => (
                  <button
                    key={`search-${p.id}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(p)}
                    className="w-full text-left p-2 hover:bg-emerald-50 rounded-xl transition-colors flex flex-col cursor-pointer border border-transparent hover:border-emerald-200"
                  >
                    <span className="text-xs font-black text-slate-800">{p.title}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{p.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl border-2 border-slate-200 overflow-hidden shadow-inner flex-1 mb-3">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* GPS Snap Button Floating on Map */}
            <button
              type="button"
              onClick={handleUseCurrentGps}
              className="absolute bottom-3 right-3 z-[400] bg-white text-slate-800 hover:bg-slate-50 font-black text-xs px-3 py-2 rounded-2xl shadow-lg border-2 border-slate-200 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Crosshair size={14} className="text-emerald-600 animate-pulse" />
              <span>Mi Ubicación GPS</span>
            </button>
          </div>

          {/* Selected Address Display Card */}
          <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl mb-3 flex items-start gap-2.5">
            <span className="text-2xl flex-shrink-0 mt-0.5">{pinIconEmoji}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                {isGeocoding ? 'Ubicando dirección...' : 'Ubicación Seleccionada:'}
              </span>
              <p className="text-xs font-black text-slate-900 truncate mt-0.5">
                {selectedAddress}
              </p>
              <span className="text-[10px] font-bold text-slate-400">
                Coords: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => {
              onConfirmLocation(selectedAddress, selectedCoords);
              onClose();
            }}
            className={`w-full h-12 bg-gradient-to-r ${themeBg} hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2`}
          >
            <CheckCircle2 size={18} />
            <span>Confirmar Ubicación de {isOrigin ? 'Origen' : 'Destino'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
