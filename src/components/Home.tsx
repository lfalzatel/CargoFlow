import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, Menu, Truck, Star, Info, X, Navigation, RefreshCw, CheckCircle2, Navigation2, Phone, Flag, PackageCheck, MapPinned, Compass, Map, Crosshair, Eye, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, UserProfile } from '../types';
import { HybridMapContainer } from '../maps/components/HybridMapContainer';
import { COLOMBIA_LOGISTICS_PLACES } from '../maps/services/search/SearchCatalog';
import { fleetSimulationService } from '../maps/services/fleet/FleetSimulationService';

export interface CargoTypeItem {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
}

export const CARGO_TYPES_CATALOG: CargoTypeItem[] = [
  { id: 'general', title: 'Carga General / Enseres', icon: '📦', subtitle: 'Cajas, mercancía empaquetada o paquetería estándar' },
  { id: 'mudanzas', title: 'Mudanzas y Trasteos', icon: '🛋️', subtitle: 'Muebles, electrodomésticos, enseres de hogar u oficina' },
  { id: 'express', title: 'Express / Domicilio Moto', icon: '⚡', subtitle: 'Paquetes pequeños, sobres y mercancía urgente' },
  { id: 'alimentos', title: 'Alimentos y Perecederos', icon: '🍎', subtitle: 'Frutas, verduras, carnes y víveres a temperatura ambiente' },
  { id: 'refrigerados', title: 'Refrigerados y Congelados', icon: '🧊', subtitle: 'Lácteos, cárnicos y medicina a temperatura controlada' },
  { id: 'construccion', title: 'Materiales de Construcción', icon: '🧱', subtitle: 'Cemento, varilla, ladrillo, arena, escombros, tuberías' },
  { id: 'tecnologia', title: 'Tecnología y Delicados', icon: '💻', subtitle: 'Electrodomésticos, televisores, equipos de cómputo' },
  { id: 'salud', title: 'Medicamentos y Salud', icon: '💊', subtitle: 'Insumos médicos, fármacos, productos farmacológicos' },
  { id: 'quimicos', title: 'Mercancía Peligrosa / Químicos', icon: '⚠️', subtitle: 'Combustibles, aceites, pinturas, solventes e insumos' },
  { id: 'liquidos', title: 'Líquidos y A Granel', icon: '💧', subtitle: 'Agua, tanques cisternas, granos, silos a granel' },
  { id: 'maquinaria', title: 'Maquinaria y Repuestos Pesados', icon: '🚜', subtitle: 'Equipos industriales, piezas pesadas, motores, planchón' },
  { id: 'ganado', title: 'Ganado y Animales Vivos', icon: '🐄', subtitle: 'Ganado bovino, porcino, caballos en vehículos adaptados' },
  { id: 'valores', title: 'Carga de Valor / Especial', icon: '💎', subtitle: 'Mercancía de alto costo, frágil o con protocolo especial' },
];

interface HomeProps {
  user: UserProfile;
  trips?: Trip[];
  usersList?: UserProfile[];
  pendingTrip?: Trip;
  editingTrip?: Trip | null;
  onCloseEditing?: () => void;
  onCreateShipment: (trip: Trip) => void;
  onEditShipment?: (trip: Trip) => void;
  onAcceptTrip?: (tripId: string, assignedPlate?: string, assignedType?: string) => void;
  onCounterOfferTrip?: (tripId: string, price: number, assignedPlate?: string, assignedType?: string) => void;
  onDriverArrivedAtOrigin?: (trip: Trip) => void;
  onClientConfirmArrivalAtOrigin?: (trip: Trip) => void;
  onStartTrip?: (trip: Trip) => void;
  onRequestCompletion?: (trip: Trip) => void;
  onConfirmCompletion?: (trip: Trip) => void;
  onRejectCompletion?: (trip: Trip) => void;
  onNavigateToView: (view: 'home' | 'activity' | 'chat' | 'dashboard' | 'profile' | 'settings') => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export default function Home({ 
  user, 
  trips = [],
  usersList = [],
  pendingTrip, 
  editingTrip,
  onCloseEditing,
  onCreateShipment, 
  onEditShipment,
  onAcceptTrip,
  onCounterOfferTrip,
  onDriverArrivedAtOrigin,
  onClientConfirmArrivalAtOrigin,
  onStartTrip,
  onRequestCompletion,
  onConfirmCompletion,
  onRejectCompletion,
  onNavigateToView, 
  onUpdateProfile, 
  onLogout 
}: HomeProps) {
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // ── Navigation Mode state ────────────────────────────────────────
  const [showAcceptAnimation, setShowAcceptAnimation] = useState(false);
  const [acceptedTripData, setAcceptedTripData] = useState<Trip | null>(null);
  const [tripPhase, setTripPhase] = useState<'cargue' | 'descargue'>('cargue');
  const [showRatingReminder, setShowRatingReminder] = useState(false);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect active trip (EN CAMINO) for conductor OR client
  const activeTrip = (trips || []).find(t => 
    t.status === 'EN CAMINO' && 
    (user.role === 'conductor' ? t.conductorId === user.email : t.clienteId === user.email)
  ) ?? null;

  // Sync trip phase with driverArrivedAtOrigin status
  useEffect(() => {
    if (activeTrip) {
      setTripPhase(activeTrip.driverArrivedAtOrigin ? 'descargue' : 'cargue');
    }
  }, [activeTrip?.id, activeTrip?.driverArrivedAtOrigin]);

  // Cleanup animation timer on unmount
  useEffect(() => () => { if (animTimerRef.current) clearTimeout(animTimerRef.current); }, []);

  const renderAvatar = (photoURL?: string, name?: string, sizeClass = "w-7 h-7 text-[10px]") => {
    if (photoURL && typeof photoURL === 'string' && photoURL.startsWith('http') && photoURL.length > 10) {
      return (
        <img
          src={photoURL}
          alt={name || 'Usuario'}
          className={`${sizeClass} rounded-full object-cover border border-white shadow-xs flex-shrink-0`}
        />
      );
    }
    const initials = (name || 'Usuario').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white font-extrabold flex items-center justify-center border border-white shadow-xs flex-shrink-0 uppercase`}>
        {initials}
      </div>
    );
  };



  // Form State for creating a custom shipment
  const [shipmentStep, setShipmentStep] = useState<1 | 2>(1);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [showOriginCatalog, setShowOriginCatalog] = useState(false);
  const [showDestCatalog, setShowDestCatalog] = useState(false);

  const handleGetGpsOrigin = () => {
    if ('geolocation' in navigator) {
      setIsLocatingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocatingGps(false);
          setOrigin(`Ubicación GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          setIsLocatingGps(false);
          setOrigin('Mi Ubicación GPS (Medellín, Antioquia)');
        },
        { timeout: 5000 }
      );
    } else {
      setOrigin('Mi Ubicación GPS (Medellín, Antioquia)');
    }
  };
  const [cargoType, setCargoType] = useState('Carga General / Enseres');
  const [showCargoTypeModal, setShowCargoTypeModal] = useState(false);
  const [cargoTypeSearch, setCargoTypeSearch] = useState('');
  const [tag, setTag] = useState<string>('');
  const [vehicle, setVehicle] = useState('Camión Sencillo');
  const [notes, setNotes] = useState('');
  const [customPrice, setCustomPrice] = useState(1250000);
  const [isCounterOffering, setIsCounterOffering] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState(pendingTrip?.price || 1250000);

  // Vehicle Selector state (for transport companies / multi-vehicle assignment)
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [actionToPerform, setActionToPerform] = useState<{ type: 'accept' | 'counter'; tripId: string; price?: number } | null>(null);

  // When editingTrip changes, load it into the form
  React.useEffect(() => {
    if (editingTrip) {
      setOrigin(editingTrip.origin);
      setDestination(editingTrip.destination);
      setVehicle(editingTrip.vehicleType);
      setTag(editingTrip.tag || '');
      setNotes(editingTrip.notes || '');
      setCustomPrice(editingTrip.price);
      setShowShipmentModal(true);
    }
  }, [editingTrip]);

  // Start real street-moving fleet simulation on Leaflet map
  useEffect(() => {
    fleetSimulationService.start();
    return () => fleetSimulationService.stop();
  }, []);

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    if (editingTrip && onEditShipment) {
      const updatedTrip: Trip = {
        ...editingTrip,
        price: customPrice,
        origin,
        destination,
        vehicleType: vehicle,
        ...(tag ? { tag } : {}),
        ...(notes ? { notes } : {}),
      };
      onEditShipment(updatedTrip);
      if (onCloseEditing) onCloseEditing();
    } else {
      const newTrip: Trip = {
        id: `#CF-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'PENDIENTE',
        price: customPrice,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        origin,
        originDetail: 'Terminal de Carga Principal',
        destination,
        destinationDetail: 'Entrega en Centro Ciudad',
        vehicleType: vehicle,
        ...(tag ? { tag } : {}),
        ...(notes ? { notes } : {}),
      };
      onCreateShipment(newTrip);
    }

    setShowShipmentModal(false);
    onNavigateToView('activity'); // go to activity screen to see it
  };

  const handleQuickReorder = () => {
    // Quick reorder for Bogotá to Medellín
    const quickTrip: Trip = {
      id: `#CF-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDIENTE',
      price: 1250000,
      date: 'Hoy, 14:30',
      origin: 'Bogotá, D.C.',
      originDetail: 'Centro Logístico Fontibón',
      destination: 'Medellín, ANT',
      destinationDetail: 'Zona Industrial Guayabal',
      vehicleType: 'Tractomula',
      tag: 'REFRIGERADO',
    };

    onCreateShipment(quickTrip);
    onNavigateToView('activity');
  };

  // ── Real conductor stats ──────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const driverCompletedTrips = trips.filter(t => t.conductorId === user.email && t.status === 'COMPLETADO');
  const todayEarnings = driverCompletedTrips
    .filter(t => t.completedAt && new Date(t.completedAt).toDateString() === todayStr)
    .reduce((s, t) => s + (t.price || 0) + ((t.clienteRating?.tip) || 0), 0);
  const totalDriverCompleted = driverCompletedTrips.length;
  const driverRating = user.rating > 0 ? user.rating.toFixed(1) : totalDriverCompleted > 0 ? '5.0' : '—';
  const activePlate = (user.vehicles && user.vehicles.length > 0)
    ? user.vehicles[0].plate
    : (user.plateNumber || '—');
  const isAvailable = user.isAvailable ?? true;

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Drawer Sidebar Menu */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="absolute inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute top-0 bottom-0 left-0 w-72 bg-white z-50 shadow-2xl flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Truck className="text-primary-container" size={28} fill="currentColor" />
                  <span className="text-xl font-black text-primary-container">CargoFlow</span>
                </div>
                <button onClick={() => setShowDrawer(false)} className="p-1 hover:bg-surface-container rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl mb-6">
                <img
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                  alt={user.name || 'Usuario'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-on-surface text-sm truncate">{user.name || 'Usuario CargoFlow'}</h3>
                  <p className="text-xs text-on-surface-variant truncate font-medium">{user.email || 'cliente@cargoflow.co'}</p>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full block w-fit mt-0.5">
                    {user.role === 'conductor' ? 'CONDUCTOR' : 'CLIENTE'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    onNavigateToView('home');
                  }}
                  className="flex items-center gap-3 p-3 text-left hover:bg-surface-container rounded-xl font-semibold text-sm text-primary-container bg-blue-50/50"
                >
                  <Navigation size={18} />
                  <span>Mapa de Carga</span>
                </button>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    onNavigateToView('activity');
                  }}
                  className="flex items-center gap-3 p-3 text-left hover:bg-surface-container rounded-xl font-semibold text-sm text-on-surface-variant"
                >
                  <History size={18} />
                  <span>Mis Despachos</span>
                </button>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    onNavigateToView('chat');
                  }}
                  className="flex items-center gap-3 p-3 text-left hover:bg-surface-container rounded-xl font-semibold text-sm text-on-surface-variant"
                >
                  <Truck size={18} />
                  <span>Soporte / Chat</span>
                </button>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    onNavigateToView('profile');
                  }}
                  className="flex items-center gap-3 p-3 text-left hover:bg-surface-container rounded-xl font-semibold text-sm text-on-surface-variant"
                >
                  <Star size={18} />
                  <span>Mi Perfil</span>
                </button>
              </div>

              <div className="mt-auto pt-6 border-t border-surface-container-high">
                <button
                  onClick={onLogout}
                  className="w-full py-3 bg-red-50 text-error hover:bg-red-100 rounded-xl font-bold text-sm transition-all"
                >
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TopAppBar */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md shadow-sm flex items-center justify-between px-6 h-16">
        <button
          onClick={() => setShowDrawer(true)}
          className="text-on-surface-variant hover:opacity-80 active:scale-95 transition-transform flex items-center justify-center p-2 rounded-full focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-black text-primary-container tracking-tight">CargoFlow</h1>
        <button
          onClick={() => onNavigateToView('profile')}
          className="hover:opacity-80 active:scale-95 transition-transform rounded-full overflow-hidden w-9 h-9 border-2 border-primary-container/20 focus:outline-none"
        >
          <img
            alt={user.name || 'User Profile'}
            className="w-full h-full object-cover"
            src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
          />
        </button>
      </header>

      {/* Floating Availability Toggle for Conductors */}
      {user.role === 'conductor' && (
        <div className="absolute top-20 right-4 z-20 flex flex-col items-end animate-fade-in-up">
          <button
            onClick={() => {
              const newStatus = !(user.isAvailable ?? true);
              if (onUpdateProfile) {
                onUpdateProfile({ isAvailable: newStatus });
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all active:scale-95 ${
              (user.isAvailable ?? true) 
                ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/20' 
                : 'bg-white/90 text-slate-500 border-slate-200 shadow-black/10'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              (user.isAvailable ?? true) ? 'bg-white animate-pulse' : 'bg-slate-400'
            }`} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {(user.isAvailable ?? true) ? 'Activo' : 'Inactivo'}
            </span>
          </button>
        </div>
      )}

      {/* Left-Aligned Compact Status Badge for Conductors when no pending trip */}
      {user.role === 'conductor' && !pendingTrip && (
        <div className="absolute top-20 left-4 z-20 max-w-[240px] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-2.5 px-3 border border-slate-200/80 animate-pulse flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-primary-container flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
              <Search size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <h4 className="font-extrabold text-xs text-slate-800 leading-tight truncate">Buscando cargas...</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-tight truncate">Sin fletes cercanos ahora.</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Layer Container */}
      <div className="absolute inset-0 z-0">
        <HybridMapContainer className="w-full h-full rounded-none border-none shadow-none" initialHeight="h-full" />

      </div>

      {/* Floating Header Card - Custom for Role */}
      <div className="absolute top-20 left-4 right-4 z-20">
        {user.role === 'conductor' ? (
          /* DRIVER TOP CARD: SLEEK FLOATING BAR (UBER / RAPPI STYLE) */
          <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-2xl p-3 px-4 shadow-[0px_10px_35px_rgba(16,185,129,0.3)] border border-emerald-400/40 flex items-center justify-between gap-2 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isAvailable ? 'bg-emerald-300 animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-[11px] font-black uppercase truncate ${isAvailable ? 'text-emerald-200' : 'text-slate-200'}`}>
                {isAvailable ? 'CONECTADO' : 'INACTIVO'} • <span className="text-white font-extrabold">{activePlate}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 text-xs font-black">
              <span className="text-white bg-white/20 border border-white/30 px-2.5 py-1 rounded-full text-[11px]">
                {todayEarnings > 0 ? '$' + todayEarnings.toLocaleString('es-CO') : '$0'}
              </span>
              <span className="text-amber-300 bg-black/20 border border-white/20 px-2 py-1 rounded-full text-[11px] flex items-center gap-0.5">
                ★ {driverRating}
              </span>
            </div>
          </div>
        ) : (
          /* CLIENT TOP CARD */
          <button
            onClick={() => setShowShipmentModal(true)}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-2xl shadow-[0px_10px_35px_rgba(16,185,129,0.3)] flex items-center justify-between p-3.5 cursor-pointer hover:opacity-95 transition-all border border-emerald-400/40 group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-inner">
                <Truck size={22} fill="currentColor" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">
                  PANEL CLIENTE
                </span>
                <span className="text-xs font-black text-white">
                  Publicar Solicitud de Carga
                </span>
              </div>
            </div>
            <div className="px-3 py-2 bg-white text-emerald-700 rounded-xl font-black text-xs shadow-md flex-shrink-0 group-hover:bg-slate-100 anim-float-bounce flex items-center gap-1.5">
              <span>Solicitar Flete</span>
              <Navigation size={13} />
            </div>
          </button>
        )}
      </div>

      {/* Bottom Floating Content - Custom for Role */}
      <div className="absolute bottom-20 left-4 right-4 z-20">
        {user.role === 'conductor' ? (
          /* DRIVER BOTTOM CARD: OFERTA DE CARGA DISPONIBLE */
          pendingTrip ? (
            <div className="bg-white rounded-2xl shadow-[0px_12px_40px_rgba(0,0,0,0.15)] p-5 border border-surface-container animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  OFERTA DE CARGA DISPONIBLE
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  ${pendingTrip.price.toLocaleString('es-CO')} COP
                </span>
              </div>

              {/* Client Requester Info */}
              <div className="flex items-center gap-2.5 mb-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                {pendingTrip.clientePhotoURL && pendingTrip.clientePhotoURL.startsWith('http') && !pendingTrip.clientePhotoURL.includes('unsplash') ? (
                  <img src={pendingTrip.clientePhotoURL} alt={pendingTrip.clienteName || 'Cliente'} className="w-8 h-8 rounded-full object-cover border border-white shadow-xs" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white font-extrabold flex items-center justify-center border border-white shadow-xs text-[10px] uppercase">
                    {(pendingTrip.clienteName || 'Cliente').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cliente Solicitante</span>
                  <span className="text-xs font-bold text-slate-700">{pendingTrip.clienteName || 'Cliente CargoFlow'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="w-0.5 h-7 bg-slate-300 my-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                </div>
                <div className="flex flex-col justify-between h-14">
                  <span className="text-sm text-on-surface font-extrabold leading-tight">{pendingTrip.origin}</span>
                  <span className="text-sm text-on-surface font-extrabold leading-tight">{pendingTrip.destination}</span>
                </div>
              </div>

              {/* Tag & Notes inside Driver Card */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-medium text-[11px]">
                    <Truck size={12} className="text-outline" />
                    <span>{pendingTrip.vehicleType}</span>
                  </div>
                  {pendingTrip.tag && (
                    <span className="bg-surface-container-low text-on-surface-variant font-bold text-[9px] tracking-widest px-2 py-0.5 rounded-sm">
                      {pendingTrip.tag}
                    </span>
                  )}
                </div>
                {pendingTrip.notes && (
                  <div className="p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider mb-0.5">Notas</p>
                    <p className="text-[11px] text-amber-800 font-medium leading-tight">{pendingTrip.notes}</p>
                  </div>
                )}
              </div>

              {isCounterOffering ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500">$</span>
                    <input 
                      type="number"
                      value={counterOfferPrice}
                      onChange={(e) => setCounterOfferPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-black text-slate-800 text-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsCounterOffering(false)}
                      className="flex-1 h-[45px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs flex items-center justify-center transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (onCounterOfferTrip && pendingTrip) {
                          if (user.vehicles && user.vehicles.length > 1) {
                            setActionToPerform({ type: 'counter', tripId: pendingTrip.id, price: counterOfferPrice });
                            setShowVehicleSelector(true);
                          } else {
                            const plate = user.plateNumber || (user.vehicles?.[0]?.plate) || '';
                            const vtype = user.vehicleType || (user.vehicles?.[0]?.type) || '';
                            onCounterOfferTrip(pendingTrip.id, counterOfferPrice, plate, vtype);
                            alert('¡Tu contraoferta ha sido enviada al cliente!');
                            setIsCounterOffering(false);
                            onNavigateToView('activity');
                          }
                        }
                      }}
                      className="flex-1 h-[45px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shadow-lg transition-all"
                    >
                      Enviar Oferta
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      if (onAcceptTrip && pendingTrip) {
                        if (user.vehicles && user.vehicles.length > 1) {
                          setActionToPerform({ type: 'accept', tripId: pendingTrip.id });
                          setShowVehicleSelector(true);
                        } else {
                          const plate = user.plateNumber || (user.vehicles?.[0]?.plate) || '';
                          const vtype = user.vehicleType || (user.vehicles?.[0]?.type) || '';
                          // Show acceptance animation instead of alert
                          setAcceptedTripData(pendingTrip);
                          setShowAcceptAnimation(true);
                          onAcceptTrip(pendingTrip.id, plate, vtype);
                          animTimerRef.current = setTimeout(() => setShowAcceptAnimation(false), 2200);
                        }
                      }
                    }}
                    className="w-full h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Truck size={18} fill="currentColor" />
                    Aceptar Carga & Tomar Flete
                  </button>
                  
                  {!pendingTrip.counterOffer && (
                    <button
                      onClick={() => setIsCounterOffering(true)}
                      className="w-full h-[40px] rounded-xl bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Proponer otro valor
                    </button>
                  )}
                  {pendingTrip.counterOffer && pendingTrip.counterOffer.conductorId === user.email && (
                    <div className="text-center text-xs font-bold text-amber-600 mt-1 bg-amber-50 p-2 rounded-lg">
                      Esperando respuesta del cliente a tu oferta de ${pendingTrip.counterOffer.price.toLocaleString('es-CO')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null
        ) : (
          /* CLIENT BOTTOM CARD: RASTREO DE ENVÍO EN CURSO */
          (() => {
            const clientActiveTrip = (trips || []).find(t => 
              t.clienteId && user.email && t.clienteId.trim().toLowerCase() === user.email.trim().toLowerCase() && 
              (t.status === 'EN CAMINO' || t.status === 'PENDIENTE')
            );

            if (!clientActiveTrip) {
              return null;
            }

            return (
              <div className="bg-white rounded-2xl shadow-[0px_12px_40px_rgba(0,0,0,0.12)] p-5 border border-surface-container">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-primary-container uppercase tracking-widest flex items-center gap-1.5">
                    <History className="text-primary-container" size={16} />
                    MI ENVÍO EN CURSO (#{clientActiveTrip.id})
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    clientActiveTrip.status === 'EN CAMINO' ? 'text-blue-700 bg-blue-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                    ● {clientActiveTrip.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div className="w-0.5 h-7 bg-slate-300 my-1" />
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex flex-col justify-between h-14 min-w-0 flex-1">
                    <span className="text-sm text-on-surface font-extrabold leading-tight truncate">Origen: {clientActiveTrip.origin}</span>
                    <span className="text-sm text-on-surface font-extrabold leading-tight truncate">Destino: {clientActiveTrip.destination}</span>
                  </div>
                </div>

                 {clientActiveTrip.conductorName && (() => {
                  const conductorUser = usersList.find(u => u.email === clientActiveTrip.conductorId);
                  const displayPhoto = conductorUser?.photoURL || clientActiveTrip.conductorPhotoURL;
                  const displayName = conductorUser?.name || clientActiveTrip.conductorName;

                  return (
                    <div className="mb-3 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                      {renderAvatar(displayPhoto, displayName, "w-8 h-8 text-[10px]")}
                      <div className="flex flex-col text-xs min-w-0 flex-1">
                        <span className="font-bold text-slate-700 truncate">{displayName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{clientActiveTrip.conductorVehicleType || clientActiveTrip.vehicleType} • {clientActiveTrip.conductorPlate || 'Placa asignada'}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigateToView('activity')}
                    className="h-[46px] rounded-xl border-2 border-primary-container text-primary-container hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={15} />
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => onNavigateToView('chat')}
                    className="h-[46px] rounded-xl bg-primary-container text-white hover:bg-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Truck size={15} fill="currentColor" />
                    Contactar Conductor
                  </button>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* CREATE SHIPMENT MODAL / VIEW (2-Step Wizard UI) */}
      <AnimatePresence>
        {showShipmentModal && (
          <div 
            className="fixed inset-0 z-[300] backdrop-blur-md bg-black/60 flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 overflow-y-auto"
            onClick={() => setShowShipmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border border-slate-200 my-auto relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Truck size={20} className="text-emerald-600" fill="currentColor" />
                    <span>{editingTrip ? 'Editar Flete' : 'Nuevo Despacho'}</span>
                  </h3>
                  <p className="text-xs font-black text-emerald-600 mt-0.5">
                    ¿A dónde enviamos tu carga hoy?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Navigation Bar */}
              <div className="flex items-center gap-2 mb-5 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setShipmentStep(1)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shipmentStep === 1 
                      ? 'bg-white text-emerald-700 shadow-md border border-slate-200/80' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    shipmentStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>1</span>
                  <span>Ruta y Carga</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!origin.trim() || !destination.trim()) {
                      alert('Por favor especifica Origen y Destino antes de continuar.');
                      return;
                    }
                    setShipmentStep(2);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shipmentStep === 2 
                      ? 'bg-white text-emerald-700 shadow-md border border-slate-200/80' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    shipmentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>2</span>
                  <span>Vehículo y Precio</span>
                </button>
              </div>

              <form onSubmit={handleCreateShipmentSubmit} className="flex flex-col gap-4">
                {/* ── STEP 1: RUTA Y CARGA ────────────────────────── */}
                {shipmentStep === 1 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    {/* ORIGEN */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={14} className="text-emerald-600" />
                          Origen de la Carga
                        </label>
                        <button
                          type="button"
                          onClick={handleGetGpsOrigin}
                          disabled={isLocatingGps}
                          className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <Crosshair size={12} className={isLocatingGps ? 'animate-spin' : ''} />
                          <span>{isLocatingGps ? 'Ubicando...' : '🎯 Usar GPS'}</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Escribe o selecciona dirección de origen"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="w-full h-11 pl-3.5 pr-10 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white font-bold text-slate-800 transition-all shadow-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowOriginCatalog(!showOriginCatalog);
                            setShowDestCatalog(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Ver puntos logísticos de origen"
                        >
                          <Map size={18} />
                        </button>
                      </div>

                      {/* Quick Chips for Origen */}
                      <div className="flex gap-1 flex-wrap">
                        {['Medellín, ANT', 'Bogotá, D.C.', 'Rionegro, ANT', 'Itagüí, ANT'].map((loc) => (
                          <button
                            key={`orig-${loc}`}
                            type="button"
                            onClick={() => setOrigin(loc)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              origin === loc 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            📍 {loc}
                          </button>
                        ))}
                      </div>

                      {/* Origin Catalog */}
                      <AnimatePresence>
                        {showOriginCatalog && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-700 shadow-xl overflow-hidden flex flex-col gap-1 mt-1"
                          >
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mb-1">Catálogo Puntos de Carga</p>
                            <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-1">
                              {COLOMBIA_LOGISTICS_PLACES.map((place) => (
                                <button
                                  key={`orig-cat-${place.id}`}
                                  type="button"
                                  onClick={() => {
                                    setOrigin(place.title);
                                    setShowOriginCatalog(false);
                                  }}
                                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl transition-colors flex flex-col cursor-pointer"
                                >
                                  <span className="text-xs font-bold text-white">{place.title}</span>
                                  <span className="text-[10px] text-slate-400 truncate">{place.address}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* DESTINO */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={14} className="text-blue-600" />
                          Destino de la Carga
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDestCatalog(!showDestCatalog);
                            setShowOriginCatalog(false);
                          }}
                          className="text-[11px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        >
                          <Map size={12} />
                          <span>🗺️ Puntos Entrega</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Escribe o selecciona dirección de destino"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full h-11 pl-3.5 pr-10 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-slate-800 transition-all shadow-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowDestCatalog(!showDestCatalog);
                            setShowOriginCatalog(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Ver puntos logísticos de destino"
                        >
                          <Map size={18} />
                        </button>
                      </div>

                      {/* Quick Chips for Destino */}
                      <div className="flex gap-1 flex-wrap">
                        {['Medellín, ANT', 'Bogotá, D.C.', 'Cali, VAL', 'Barranquilla, ATL'].map((loc) => (
                          <button
                            key={`dest-${loc}`}
                            type="button"
                            onClick={() => setDestination(loc)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              destination === loc 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            🏁 {loc}
                          </button>
                        ))}
                      </div>

                      {/* Destination Catalog */}
                      <AnimatePresence>
                        {showDestCatalog && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-700 shadow-xl overflow-hidden flex flex-col gap-1 mt-1"
                          >
                            <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-1">Catálogo Puntos de Entrega</p>
                            <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-1">
                              {COLOMBIA_LOGISTICS_PLACES.map((place) => (
                                <button
                                  key={`dest-cat-${place.id}`}
                                  type="button"
                                  onClick={() => {
                                    setDestination(place.title);
                                    setShowDestCatalog(false);
                                  }}
                                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl transition-colors flex flex-col cursor-pointer"
                                >
                                  <span className="text-xs font-bold text-white">{place.title}</span>
                                  <span className="text-[10px] text-slate-400 truncate">{place.address}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Tipo de Mercancía (Visual Custom Category Selector) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          Tipo de Mercancía
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCargoTypeModal(true)}
                          className="text-[11px] font-extrabold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Ver 13 categorías ➔
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCargoTypeModal(true)}
                        className="w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between font-bold text-xs text-slate-800 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base flex-shrink-0">
                            {CARGO_TYPES_CATALOG.find(c => c.title === cargoType)?.icon || '📦'}
                          </span>
                          <span className="truncate">{cargoType}</span>
                        </div>
                        <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                      </button>

                      {/* Quick Chips */}
                      <div className="flex gap-1 flex-wrap">
                        {['Carga General / Enseres', 'Mudanzas y Trasteos', 'Alimentos y Perecederos', 'Express / Domicilio Moto', 'Materiales de Construcción'].map((catTitle) => {
                          const catObj = CARGO_TYPES_CATALOG.find(c => c.title === catTitle);
                          return (
                            <button
                              key={`chip-${catTitle}`}
                              type="button"
                              onClick={() => setCargoType(catTitle)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                                cargoType === catTitle
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {catObj?.icon} {catTitle.split('/')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 1 Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!origin.trim() || !destination.trim()) {
                          alert('Por favor indica Origen y Destino para continuar.');
                          return;
                        }
                        setShipmentStep(2);
                      }}
                      className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Siguiente: Vehículo y Precio ➔</span>
                    </button>
                  </div>
                )}

                {/* ── STEP 2: VEHÍCULO Y TARIFA ─────────────────────── */}
                {shipmentStep === 2 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Vehiculo */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tipo Vehículo</label>
                        <select
                          value={vehicle}
                          onChange={(e) => setVehicle(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                        >
                          <option value="Camión Sencillo">Camión Sencillo</option>
                          <option value="Tractomula">Tractomula</option>
                          <option value="Furgón Mediano">Furgón Mediano</option>
                          <option value="Doble Troque">Doble Troque</option>
                          <option value="Cuatro Manos">Cuatro Manos</option>
                          <option value="Minimula">Minimula</option>
                          <option value="Refrigerado">Refrigerado</option>
                          <option value="Cama Baja">Cama Baja</option>
                          <option value="Grúa Planchón">Grúa Planchón</option>
                          <option value="Niñera">Niñera</option>
                          <option value="Motocarguera">Motocarguera</option>
                          <option value="Volqueta">Volqueta</option>
                          <option value="Jaula">Jaula</option>
                          <option value="Camioneta">Camioneta (Pick-up)</option>
                          <option value="Moto con coche">Moto con coche</option>
                        </select>
                      </div>

                      {/* Especialidades */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Especialidad</label>
                        <select
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                        >
                          <option value="">Ninguna</option>
                          <option value="REFRIGERADO">REFRIGERADO</option>
                          <option value="FRÁGIL">FRÁGIL</option>
                          <option value="LÍQUIDOS">LÍQUIDOS</option>
                          <option value="QUÍMICOS">QUÍMICOS</option>
                          <option value="SOBREDIMENSIONADA">SOBREDIMENSIONADA</option>
                          <option value="VALORES">VALORES</option>
                        </select>
                      </div>
                    </div>

                    {/* Precio Deseado */}
                    <div className="flex flex-col gap-1.5 bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-2xl">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-emerald-900 uppercase tracking-wider">Flete Ofrecido (COP)</label>
                        <div className="flex items-center gap-1 bg-white border border-emerald-300 rounded-xl px-2 py-1 shadow-xs">
                          <span className="text-xs font-black text-emerald-700">$</span>
                          <input 
                            type="number"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(Number(e.target.value))}
                            className="w-24 bg-transparent text-xs font-black text-emerald-900 outline-none"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="5000000"
                        step="50000"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                      />
                      <div className="flex justify-between text-[10px] text-emerald-700 font-bold">
                        <span>$100k</span>
                        <span>Sugerido: ${customPrice.toLocaleString('es-CO')}</span>
                        <span>$5M</span>
                      </div>
                    </div>

                    {/* Notas / Observaciones */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notas u Observaciones (Opcional)</label>
                      <textarea
                        placeholder="Ej. Entregar en portería 3, frágil..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-16 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-bold text-slate-800 resize-none"
                      />
                    </div>

                    {/* Step 2 Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShipmentStep(1)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                      >
                        ← Volver
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {editingTrip ? (
                          <>Guardar Cambios</>
                        ) : (
                          <>
                            <Truck size={16} fill="currentColor" />
                            <span>🚀 Publicar Solicitud</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CARGO TYPE SELECTION PICKER MODAL (13 Categories with Search) */}
      <AnimatePresence>
        {showCargoTypeModal && (
          <div 
            className="fixed inset-0 z-[400] backdrop-blur-md bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
            onClick={() => setShowCargoTypeModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-slate-200"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span className="text-xl">📦</span>
                    <span>Seleccionar Tipo de Mercancía</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    13 Categorías disponibles para tu flete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCargoTypeModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Filter Bar */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar categoría (ej. refrigerado, trasteos, alimentos, cemento...)"
                  value={cargoTypeSearch}
                  onChange={(e) => setCargoTypeSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 transition-all shadow-xs"
                />
                {cargoTypeSearch && (
                  <button
                    onClick={() => setCargoTypeSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categories Grid List */}
              <div className="overflow-y-auto max-h-[60vh] pr-1 space-y-2 no-scrollbar">
                {CARGO_TYPES_CATALOG
                  .filter(cat => 
                    cat.title.toLowerCase().includes(cargoTypeSearch.toLowerCase()) || 
                    cat.subtitle.toLowerCase().includes(cargoTypeSearch.toLowerCase())
                  )
                  .map((cat) => {
                    const isSelected = cargoType === cat.title;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCargoType(cat.title);
                          setShowCargoTypeModal(false);
                          setCargoTypeSearch('');
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-2xl p-2 rounded-2xl bg-slate-100 group-hover:bg-white transition-colors flex-shrink-0">
                          {cat.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-black truncate ${isSelected ? 'text-emerald-800' : 'text-slate-900'}`}>
                              {cat.title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 line-clamp-2">
                            {cat.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VEHICLE SELECTION MODAL FOR TRIP ASSIGNMENT */}
      <AnimatePresence>
        {showVehicleSelector && actionToPerform && (
          <div className="fixed inset-0 bg-black/60 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-[#0b224d]">Asignar Vehículo</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Selecciona el camión para este viaje</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowVehicleSelector(false);
                    setActionToPerform(null);
                  }} 
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                {(user.vehicles || []).map((vh) => (
                  <button
                    key={vh.id}
                    type="button"
                    onClick={() => {
                      if (actionToPerform.type === 'accept') {
                        if (onAcceptTrip) {
                          onAcceptTrip(actionToPerform.tripId, vh.plate, vh.type);
                        }
                        if (pendingTrip) {
                          setAcceptedTripData(pendingTrip);
                          setShowAcceptAnimation(true);
                          animTimerRef.current = setTimeout(() => setShowAcceptAnimation(false), 2200);
                        }
                      } else {
                        if (onCounterOfferTrip && actionToPerform.price) {
                          onCounterOfferTrip(actionToPerform.tripId, actionToPerform.price, vh.plate, vh.type);
                        }
                      }
                      setShowVehicleSelector(false);
                      setActionToPerform(null);
                    }}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 hover:border-[#0b224d]/30 text-left transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0b224d]/5 text-[#0b224d] rounded-lg group-hover:bg-[#0b224d] group-hover:text-white transition-colors">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-on-surface">{vh.type}</p>
                        {vh.model && <p className="text-[9px] text-slate-400 font-bold">Mod. {vh.model}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-black bg-white px-2.5 py-1 border border-slate-200 rounded-md tracking-wider text-[#0b224d] group-hover:bg-[#0b224d] group-hover:text-white group-hover:border-transparent transition-all">
                      {vh.plate}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowVehicleSelector(false);
                  setActionToPerform(null);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ACCEPTANCE ANIMATION OVERLAY ───────────────────────────── */}
      <AnimatePresence>
        {showAcceptAnimation && acceptedTripData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#09152b] via-[#0b224d] to-[#041029] select-none"
          >
            {/* Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px]" />

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.1 }}
              className="flex flex-col items-center gap-5 relative z-10"
            >
              {/* Truck icon with check */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center">
                  <Truck size={48} className="text-white" fill="currentColor" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', damping: 15 }}
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <CheckCircle2 size={20} className="text-white" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-1">¡Servicio Aceptado!</p>
                <h2 className="text-white text-2xl font-black tracking-tight">${acceptedTripData.price.toLocaleString('es-CO')}</h2>
                <p className="text-slate-400 text-xs font-semibold mt-2">
                  {acceptedTripData.origin} → {acceptedTripData.destination}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.8, duration: 1.2, repeat: Infinity }}
                className="text-slate-400 text-[11px] font-bold uppercase tracking-widest"
              >
                Calculando ruta...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ACTIVE NAVIGATION MODE (conductor with EN CAMINO trip) ─── */}
      <AnimatePresence>
        {activeTrip && !showAcceptAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex flex-col bg-[#09152b]"
          >
            {/* Map fullscreen con controles flotantes del mapa activados */}
            <div className="absolute inset-0 z-0">
              <HybridMapContainer className="!rounded-none" initialHeight="h-full" hideControls={false} />
            </div>

            {/* Top minimal header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-safe pt-3 pb-3 bg-gradient-to-b from-[#09152b]/90 to-transparent">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-white" fill="currentColor" />
                <span className="text-white font-black text-sm tracking-tight">CargoFlow</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Rate reminder badge */}
                {showRatingReminder && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => onNavigateToView('activity')}
                    className="flex items-center gap-1.5 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg cursor-pointer"
                  >
                    <Star size={11} fill="currentColor" />
                    Calificar viaje
                  </motion.button>
                )}
                <button
                  onClick={() => onNavigateToView('chat')}
                  className="w-9 h-9 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 cursor-pointer"
                >
                  <Phone size={16} />
                </button>
              </div>
            </div>

            {/* Trip info card — top floating unificado con botones en la misma línea */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-16 left-3 right-3 z-30"
            >
              <div className={`rounded-3xl p-3.5 shadow-2xl border backdrop-blur-md flex flex-col gap-2.5 ${
                (!activeTrip.driverArrivedAtOrigin || (activeTrip.driverArrivedAtOrigin && !activeTrip.clientConfirmedArrivalAtOrigin))
                  ? 'bg-[#09152b]/95 border-blue-500/30 text-white'
                  : 'bg-emerald-950/95 border-emerald-400/30 text-white'
              }`}>
                {/* Upper summary row */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    (!activeTrip.driverArrivedAtOrigin || (activeTrip.driverArrivedAtOrigin && !activeTrip.clientConfirmedArrivalAtOrigin))
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {user.role === 'conductor' ? (
                      !activeTrip.clientConfirmedArrivalAtOrigin ? <MapPinned size={20} /> : <Flag size={20} />
                    ) : (
                      activeTrip.driverArrivedAtOrigin ? <MapPinned size={20} /> : <Truck size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${
                      (!activeTrip.driverArrivedAtOrigin || (activeTrip.driverArrivedAtOrigin && !activeTrip.clientConfirmedArrivalAtOrigin))
                        ? 'text-blue-400'
                        : 'text-emerald-400'
                    }`}>
                      {user.role === 'conductor' ? (
                        !activeTrip.driverArrivedAtOrigin
                          ? '📦 FASE 1 — IR AL CARGUE'
                          : !activeTrip.clientConfirmedArrivalAtOrigin
                          ? '📍 FASE 1 — EN CARGUE (ESPERANDO CLIENTE)'
                          : !activeTrip.tripStarted && !activeTrip.completionRequestedBy
                          ? '🚚 FASE 2 — CARGUE CONFIRMADO'
                          : !activeTrip.completionRequestedBy
                          ? '🏁 FASE 3 — EN TRAYECTO A DESTINO'
                          : '🏁 FASE 3 — ENTREGA SOLICITADA'
                      ) : (
                        !activeTrip.driverArrivedAtOrigin
                          ? '🚚 FASE 1 — CONDUCTOR EN CAMINO'
                          : !activeTrip.clientConfirmedArrivalAtOrigin
                          ? '📍 FASE 1 — CONDUCTOR EN PUNTO DE CARGUE'
                          : activeTrip.completionRequestedBy
                          ? '🏁 FASE 3 — CONFIRMAR ENTREGA EN DESTINO'
                          : '🚚 FASE 2 — VEHÍCULO EN TRAYECTO'
                      )}
                    </p>
                    <p className="text-white font-black text-sm truncate">
                      {user.role === 'conductor' ? (
                        !activeTrip.clientConfirmedArrivalAtOrigin 
                          ? activeTrip.origin 
                          : activeTrip.destination
                      ) : (
                        activeTrip.completionRequestedBy
                          ? `Entrega notificada en ${activeTrip.destination}`
                          : activeTrip.clientConfirmedArrivalAtOrigin
                          ? `En camino hacia ${activeTrip.destination}`
                          : activeTrip.driverArrivedAtOrigin 
                          ? `${activeTrip.conductorName || 'El conductor'} ha llegado a ${activeTrip.origin}` 
                          : `${activeTrip.conductorName || 'El conductor'} va en camino a ${activeTrip.origin}`
                      )}
                    </p>
                    <p className="text-slate-400 text-[10px] font-medium truncate">
                      #{activeTrip.id} • {activeTrip.vehicleType}
                      {user.role === 'cliente' && activeTrip.conductorPlate && ` • Placa: ${activeTrip.conductorPlate}`}
                      {activeTrip.tag && ` • ${activeTrip.tag}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-black text-sm">${activeTrip.price.toLocaleString('es-CO')}</p>
                    <p className="text-slate-400 text-[9px] font-bold">COP</p>
                  </div>
                </div>

                {/* Botones para CONDUCTOR vs CLIENTE */}
                {user.role === 'conductor' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    {!activeTrip.driverArrivedAtOrigin ? (
                      <button
                        onClick={async () => {
                          if (onDriverArrivedAtOrigin) {
                            onDriverArrivedAtOrigin(activeTrip);
                          }
                        }}
                        className="py-2.5 px-2 rounded-2xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-black text-[11px] flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer truncate"
                      >
                        <PackageCheck size={16} className="flex-shrink-0" />
                        <span className="truncate">Llegué al Cargue ✓</span>
                      </button>
                    ) : !activeTrip.clientConfirmedArrivalAtOrigin ? (
                      <button
                        disabled
                        className="py-2.5 px-2 rounded-2xl bg-amber-500/80 text-white font-black text-[10px] flex items-center justify-center gap-1.5 opacity-95 cursor-default truncate"
                      >
                        <span className="truncate">⏳ Esperando cliente...</span>
                      </button>
                    ) : !activeTrip.tripStarted && !activeTrip.completionRequestedBy ? (
                      <button
                        onClick={() => {
                          if (onStartTrip) {
                            onStartTrip(activeTrip);
                          }
                        }}
                        className="py-2.5 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[11px] flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer truncate"
                      >
                        <Truck size={16} className="flex-shrink-0" />
                        <span className="truncate">🚀 Iniciar Viaje</span>
                      </button>
                    ) : (
                      <button
                        disabled={Boolean(activeTrip?.completionRequestedBy)}
                        onClick={() => {
                          if (activeTrip && onRequestCompletion && !activeTrip.completionRequestedBy) {
                            onRequestCompletion(activeTrip);
                          }
                          onNavigateToView('activity');
                          setShowRatingReminder(true);
                          setTimeout(() => setShowRatingReminder(false), 30000);
                        }}
                        className={`py-2.5 px-2 rounded-2xl font-black text-[11px] flex items-center justify-center gap-1.5 shadow-lg transition-all truncate ${
                          activeTrip?.completionRequestedBy
                            ? 'bg-emerald-600/80 text-white cursor-default opacity-90'
                            : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white cursor-pointer'
                        }`}
                      >
                        <Flag size={16} className="flex-shrink-0" />
                        <span className="truncate">
                          {activeTrip?.completionRequestedBy
                            ? '⏳ Esperando confirmación...'
                            : 'Finalizar Entrega'}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigateToView('activity')}
                      className="py-2.5 px-2 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 font-black text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer truncate"
                    >
                      <Eye size={15} className="flex-shrink-0" />
                      <span className="truncate">Ver detalle del viaje</span>
                    </button>
                  </div>
                ) : (
                  /* 3 BOTONES EN LA MISMA LÍNEA PARA EL CLIENTE (JULIAN) */
                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
                    {activeTrip.completionRequestedBy ? (
                      <button
                        onClick={() => activeTrip && onConfirmCompletion?.(activeTrip)}
                        className="py-2.5 px-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[10px] flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer truncate animate-pulse"
                      >
                        <CheckCircle2 size={13} className="flex-shrink-0" />
                        <span className="truncate">Confirmar Entrega</span>
                      </button>
                    ) : activeTrip.clientConfirmedArrivalAtOrigin ? (
                      <button
                        disabled
                        className="py-2.5 px-1.5 rounded-2xl bg-emerald-600/90 text-white font-black text-[10px] flex items-center justify-center gap-1 cursor-default opacity-90 truncate"
                      >
                        <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-200" />
                        <span className="truncate">Llegada OK ✓</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => activeTrip && onClientConfirmArrivalAtOrigin?.(activeTrip)}
                        className="py-2.5 px-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[10px] flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer truncate"
                      >
                        <CheckCircle2 size={13} className="flex-shrink-0" />
                        <span className="truncate">Confirmar Llegada</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigateToView('chat')}
                      className="py-2.5 px-1.5 rounded-2xl bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-black text-[10px] flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer truncate"
                    >
                      <MessageSquare size={13} className="flex-shrink-0" />
                      <span className="truncate">Contactar</span>
                    </button>

                    <button
                      onClick={() => onNavigateToView('activity')}
                      className="py-2.5 px-1.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white border border-white/20 font-black text-[10px] flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer truncate"
                    >
                      <Eye size={13} className="flex-shrink-0" />
                      <span className="truncate">Ver Detalle</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
