import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { PlaceSearchResult, LatLng } from '../../maps/models/mapTypes';
import { hybridSearchPlaces } from '../../maps/services/search/SearchCatalog';
import { gpsService } from '../../maps/services/gps/GpsService';

interface AddressAutocompleteInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string, position?: LatLng) => void;
  placeholder?: string;
  iconColor?: string;
  className?: string;
  required?: boolean;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Buscar dirección, terminal, ciudad...',
  iconColor = 'text-emerald-400',
  className = '',
  required = false,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (val.trim().length >= 2) {
      setIsLoading(true);
      const results = await hybridSearchPlaces(val);
      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (place: PlaceSearchResult) => {
    const displayValue = `${place.title}${place.address ? ` (${place.address.split(',')[0]})` : ''}`;
    setQuery(displayValue);
    onChange(displayValue, place.position);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleUseGPS = async () => {
    setIsLocating(true);
    try {
      const loc = await gpsService.requestInstantLocation();
      const addressName = await gpsService.reverseGeocode(loc);
      setQuery(addressName);
      onChange(addressName, loc);
      setIsOpen(false);
    } catch (err) {
      console.error('Error fetching GPS for autocomplete input:', err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-2.5 shadow-inner focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
        <MapPin className={`w-4 h-4 mr-2 flex-shrink-0 ${iconColor}`} />

        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-slate-400 font-medium"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-colors mr-1"
            title="Limpiar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isLocating}
          className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 rounded-xl flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
          title="Usar mi ubicación GPS actual"
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <Navigation className="w-3 h-3 text-emerald-400 fill-emerald-400/30" />
          )}
          <span>GPS</span>
        </button>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#0b172a] border border-slate-700/90 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/60 backdrop-blur-md">
          {isLoading ? (
            <div className="p-3 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Buscando lugares recomendados...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-500/15 transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform mt-0.5 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.address}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-3 text-xs text-slate-400 text-center">
              No se encontraron coincidencias exactas
            </div>
          )}
        </div>
      )}
    </div>
  );
};
