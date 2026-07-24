import { useState } from 'react';
import { Truck, MapPin, Eye, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, Trip } from '../types';

interface ActivityProps {
  user: UserProfile;
  trips: Trip[];
  onNavigateToChat: () => void;
  onCancelTrip: (tripId: string) => void;
  onEditTrip?: (trip: Trip) => void;
  onResolveCounterOffer?: (tripId: string, accept: boolean) => void;
}

export default function Activity({ user, trips, onNavigateToChat, onCancelTrip, onEditTrip, onResolveCounterOffer }: ActivityProps) {
  const [filter, setFilter] = useState<'activos' | 'historial'>('activos');

  // Filter trips based on selection
  const filteredTrips = trips.filter((trip) => {
    if (filter === 'activos') {
      return trip.status === 'EN CAMINO' || trip.status === 'PENDIENTE';
    } else {
      return trip.status === 'COMPLETADO';
    }
  });

  return (
    <div className="bg-background min-h-screen pb-[88px] pt-20">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm flex items-center justify-between px-6 h-16">
        <button className="text-primary-container p-2 -ml-2 rounded-full hover:bg-surface-container transition-colors">
          <Truck size={24} fill="currentColor" />
        </button>
        <h1 className="text-xl font-black text-primary-container tracking-tight">CargoFlow</h1>
        <div className="w-9 h-9 rounded-full overflow-hidden border border-surface-container">
          <img
            alt="Profile Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbr_Tmwf_quiZEewMYi9pnva_unlJ7hkWZKvWCXD8j7F1nM2xZGJ_dWOqjzbyR_rtWI12sF26VSy8f6FzbS_9ULOdd7CePKg175BzGSIG9FlCqZYclEyZA2DYQ1N9NDTkg31_XYb8CZO6HaAyD3rmcH2God7g4E3lILm8rFgx16vGqWdy6k9xDM4RJt7sVRJSiuAcMdqR0u51DtO3MbLRQvMN8EyKPLHtXasdhdN-cRcOdjfI9ngSi"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between pt-4">
          <h2 className="text-2xl font-extrabold text-on-surface">Actividad</h2>
          <div className="flex space-x-2 bg-surface-container p-1 rounded-full border border-surface-container-high">
            <button
              onClick={() => setFilter('activos')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'activos'
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilter('historial')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'historial'
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {/* Trips List */}
        <div className="flex flex-col gap-4">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-surface-container p-6">
              <Truck size={48} className="mx-auto text-outline-variant mb-4" strokeWidth={1.2} />
              <p className="text-sm font-bold text-on-surface">No hay despachos en esta sección</p>
              <p className="text-xs text-outline mt-1">
                Crea un nuevo despacho pulsando en la barra de búsqueda en el mapa.
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isActive = trip.status === 'EN CAMINO' || trip.status === 'PENDIENTE';
              return (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] p-5 border border-surface-container flex flex-col gap-4 transition-all ${
                    !isActive ? 'opacity-75 hover:opacity-90' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`inline-block font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-sm mb-2 uppercase ${
                          trip.status === 'EN CAMINO'
                            ? 'bg-blue-100 text-primary-container'
                            : trip.status === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-surface-container-high text-on-surface'
                        }`}
                      >
                        {trip.status}
                      </span>
                      <p className="text-xs font-bold text-on-surface-variant">ID: {trip.id}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          trip.status === 'EN CAMINO' ? 'text-[#FF9800]' : 'text-on-surface'
                        }`}
                      >
                        ${trip.price.toLocaleString('es-CO')}
                      </p>
                      <p className="text-[11px] font-medium text-on-surface-variant">{trip.date}</p>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-primary-container' : 'bg-outline'}`} />
                      <div className="w-0.5 h-10 bg-outline-variant" />
                      <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#FF9800]' : 'bg-outline'}`} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between h-16 py-0.5">
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-tight">{trip.origin}</p>
                        {trip.originDetail && (
                          <p className="text-[11px] text-on-surface-variant font-medium">{trip.originDetail}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-tight">{trip.destination}</p>
                        {trip.destinationDetail && (
                          <p className="text-[11px] text-on-surface-variant font-medium">{trip.destinationDetail}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with details */}
                  <div className="pt-4 border-t border-surface-container-high flex justify-between items-center">
                    <div className="flex items-center gap-2 text-on-surface-variant font-medium text-xs">
                      <Truck size={14} className="text-outline" />
                      <span>{trip.vehicleType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trip.tag && (
                        <span className="bg-surface-container-low text-on-surface-variant font-bold text-[9px] tracking-widest px-2.5 py-1 rounded-sm">
                          {trip.tag}
                        </span>
                      )}
                      {isActive && (
                        <>
                          {(trip.status === 'PENDIENTE' && user.role === 'cliente') ? (
                            <div className="flex gap-2">
                              {onEditTrip && (
                                <button
                                  onClick={() => onEditTrip(trip)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                                >
                                  Editar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
                                    onCancelTrip(trip.id);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-error bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={onNavigateToChat}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-primary hover:bg-blue-100 transition-colors"
                              >
                                <MessageSquare size={16} />
                              </button>
                              <button
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-container hover:bg-primary transition-colors"
                              >
                                Rastrear
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Counter Offer UI */}
                  {trip.status === 'PENDIENTE' && trip.counterOffer && user.role === 'cliente' && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="text-xs text-amber-800 font-medium mb-2">
                        El conductor <span className="font-bold">{trip.counterOffer.conductorName}</span> propone llevar tu carga por:
                      </div>
                      <div className="text-lg font-black text-amber-700 mb-3">
                        ${trip.counterOffer.price.toLocaleString('es-CO')} COP
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onResolveCounterOffer?.(trip.id, false)}
                          className="flex-1 py-2 bg-white text-slate-600 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => onResolveCounterOffer?.(trip.id, true)}
                          className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 shadow-sm transition-colors"
                        >
                          Aceptar Oferta
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
