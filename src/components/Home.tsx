import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, Menu, Truck, Star, Info, X, Navigation, RefreshCw, CheckCircle2, Navigation2, Phone, Flag, PackageCheck, MapPinned, Compass, Map, Crosshair, Eye, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, UserProfile } from '../types';
import { HybridMapContainer } from '../maps/components/HybridMapContainer';
import { COLOMBIA_LOGISTICS_PLACES } from '../maps/services/search/SearchCatalog';
import { fleetSimulationService } from '../maps/services/fleet/FleetSimulationService';
import { MapPickerModal } from './MapPickerModal';
import { showAlert } from './AppAlertModal';

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

export interface VehicleCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  bgLight: string;
}

export const VEHICLES_CATALOG: VehicleCatalogItem[] = [
  {
    id: 'camion_sencillo',
    title: 'Camión Sencillo',
    subtitle: 'Capacidad 5 - 9 Ton. Carga general urbana e intermunicipal.',
    icon: '🚛',
    color: 'from-amber-500 to-orange-500',
    badge: 'Popular',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  {
    id: 'furgon_mediano',
    title: 'Furgón Mediano',
    subtitle: 'Capacidad 3.5 - 5 Ton. Mudanzas, paquetería y protección.',
    icon: '🚚',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Urbano',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  {
    id: 'tractomula',
    title: 'Tractomula',
    subtitle: 'Capacidad 32 - 35 Ton. 3 ejes / Gran tonelaje industrial.',
    icon: '🚜',
    color: 'from-emerald-500 to-teal-700',
    badge: 'Gran Pesado',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  {
    id: 'doble_troque',
    title: 'Doble Troque',
    subtitle: 'Capacidad 15 - 18 Ton. Carga pesada de gran volumen.',
    icon: '🚛',
    color: 'from-purple-500 to-indigo-700',
    badge: 'Industrial',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
  },
  {
    id: 'cuatro_manos',
    title: 'Cuatro Manos',
    subtitle: 'Capacidad 22 - 24 Ton. Doble eje delantero de alta carga.',
    icon: '🚛',
    color: 'from-rose-500 to-pink-600',
    badge: 'Alto Peso',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
  },
  {
    id: 'minimula',
    title: 'Minimula',
    subtitle: 'Capacidad 18 - 20 Ton. Semi-remolque compacto.',
    icon: '🚛',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Versátil',
    bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  },
  {
    id: 'refrigerado',
    title: 'Refrigerado',
    subtitle: 'Control de frío (-20°C a +15°C) alimentos y medicinas.',
    icon: '❄️',
    color: 'from-sky-400 to-blue-600',
    badge: 'Termo Frio',
    bgLight: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  {
    id: 'cama_baja',
    title: 'Cama Baja',
    subtitle: 'Transporte de maquinaria pesada y sobredimensionados.',
    icon: '🏗️',
    color: 'from-yellow-500 to-amber-600',
    badge: 'Maquinaria',
    bgLight: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
  {
    id: 'grua_planchon',
    title: 'Grúa Planchón',
    subtitle: 'Asistencia y transporte de autos, maquinaria o contenedores.',
    icon: '🏗️',
    color: 'from-orange-500 to-red-600',
    badge: 'Asistencia',
    bgLight: 'bg-orange-50 border-orange-200 text-orange-900',
  },
  {
    id: 'ninera',
    title: 'Niñera',
    subtitle: 'Transporte de flotillas y automóviles 0km.',
    icon: '🚗',
    color: 'from-violet-500 to-purple-600',
    badge: 'Flotilla Autos',
    bgLight: 'bg-violet-50 border-violet-200 text-violet-900',
  },
  {
    id: 'motocarguera',
    title: 'Motocarguera',
    subtitle: 'Capacidad 500 - 800 kg. Entregas súper rápidas.',
    icon: '🛵',
    color: 'from-lime-500 to-emerald-600',
    badge: 'Express',
    bgLight: 'bg-lime-50 border-lime-200 text-lime-900',
  },
  {
    id: 'volqueta',
    title: 'Volqueta',
    subtitle: 'Materiales de construcción, agregados, arena y tierra.',
    icon: '🚜',
    color: 'from-stone-500 to-stone-700',
    badge: 'Construcción',
    bgLight: 'bg-stone-100 border-stone-300 text-stone-900',
  },
  {
    id: 'jaula',
    title: 'Jaula',
    subtitle: 'Transporte de ganado, porcinos o carga ventilada.',
    icon: '📦',
    color: 'from-teal-500 to-emerald-600',
    badge: 'Ventilado',
    bgLight: 'bg-teal-50 border-teal-200 text-teal-900',
  },
  {
    id: 'camioneta',
    title: 'Camioneta (Pick-up)',
    subtitle: 'Capacidad 1 - 2 Ton. Acarreos ágiles y logística express.',
    icon: '🛻',
    color: 'from-blue-500 to-cyan-600',
    badge: 'Acarreos',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  {
    id: 'moto_coche',
    title: 'Moto con coche',
    subtitle: 'Capacidad 150 - 300 kg. Paquetes pequeños y micro-fletes.',
    icon: '🛺',
    color: 'from-yellow-400 to-amber-500',
    badge: 'Micro-Flete',
    bgLight: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  },
];

export interface SpecialtyCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  bgLight: string;
  value: string;
}

export const SPECIALTIES_CATALOG: SpecialtyCatalogItem[] = [
  {
    id: 'ninguna',
    title: 'Ninguna',
    subtitle: 'Sin requerimiento especial o condiciones particulares.',
    icon: '⚡',
    color: 'from-slate-400 to-slate-600',
    badge: 'Estándar',
    bgLight: 'bg-slate-50 border-slate-200 text-slate-900',
    value: '',
  },
  {
    id: 'refrigerado',
    title: 'REFRIGERADO',
    subtitle: 'Cadena de frío activa todo el trayecto.',
    icon: '❄️',
    color: 'from-cyan-400 to-blue-600',
    badge: 'Control Térmico',
    bgLight: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    value: 'REFRIGERADO',
  },
  {
    id: 'fragil',
    title: 'FRÁGIL',
    subtitle: 'Extremo cuidado, protección acolchada y amarre especial.',
    icon: '⚠️',
    color: 'from-amber-400 to-orange-600',
    badge: 'Alta Protección',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
    value: 'FRÁGIL',
  },
  {
    id: 'liquidos',
    title: 'LÍQUIDOS',
    subtitle: 'Tanques cisterna graduados o cubos IBC sellados.',
    icon: '💧',
    color: 'from-blue-400 to-indigo-600',
    badge: 'Cisterna / Tanque',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
    value: 'LÍQUIDOS',
  },
  {
    id: 'quimicos',
    title: 'QUÍMICOS',
    subtitle: 'Hazmat / Mercancías peligrosas con rotulado oficial.',
    icon: '🧪',
    color: 'from-emerald-400 to-teal-600',
    badge: 'Hazmat Peligroso',
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    value: 'QUÍMICOS',
  },
  {
    id: 'sobredimensionada',
    title: 'SOBREDIMENSIONADA',
    subtitle: 'Exceso de peso o dimensiones, requiere permiso o escolta.',
    icon: '🏗️',
    color: 'from-purple-400 to-pink-600',
    badge: 'Exceso Tamaño',
    bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
    value: 'SOBREDIMENSIONADA',
  },
  {
    id: 'valores',
    title: 'VALORES',
    subtitle: 'Mercancía de alto costo con rastreo satelital o escolta.',
    icon: '🔒',
    color: 'from-rose-400 to-red-600',
    badge: 'Máxima Seguridad',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
    value: 'VALORES',
  },
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
  const [vehicle, setVehicle] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'origin' | 'destination'>('origin');
  const [notes, setNotes] = useState('');
  const [customPrice, setCustomPrice] = useState(60000);
  const [showPriceConfirmModal, setShowPriceConfirmModal] = useState(false);
  const [isCounterOffering, setIsCounterOffering] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState(pendingTrip?.price || 1250000);
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'original';
    return localStorage.getItem('cf_theme') || 'original';
  });

  // Vehicle Selector state (for transport companies / multi-vehicle assignment)
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [actionToPerform, setActionToPerform] = useState<{ type: 'accept' | 'counter'; tripId: string; price?: number } | null>(null);

  // Sync active theme
  useEffect(() => {
    const handleThemeChange = (e?: any) => {
      const newTheme = e?.detail?.theme || localStorage.getItem('cf_theme') || 'original';
      setActiveTheme(newTheme);
    };
    handleThemeChange();
    window.addEventListener('cargoflow:theme-changed', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    return () => {
      window.removeEventListener('cargoflow:theme-changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // When editingTrip changes, load it into the form
  React.useEffect(() => {
    if (editingTrip) {
      setOrigin(editingTrip.origin);
      setDestination(editingTrip.destination);
      setVehicle(editingTrip.vehicleType);
      setTag(editingTrip.tag || '');
      setNotes(editingTrip.notes || '');
      setCustomPrice(editingTrip.price || 60000);
      setShowShipmentModal(true);
    }
  }, [editingTrip]);

  // Start real street-moving fleet simulation on Leaflet map
  useEffect(() => {
    fleetSimulationService.start();
    return () => fleetSimulationService.stop();
  }, []);

  const handleCreateShipmentSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!origin || !origin.trim() || !destination || !destination.trim()) {
      showAlert('Por favor indica Origen y Destino de la carga para continuar.', { title: 'Ubicación Requerida', variant: 'warning', icon: '📍' });
      setShipmentStep(1);
      return;
    }
    // Close wizard modal and open summary confirmation modal
    setShowShipmentModal(false);
    setShowPriceConfirmModal(true);
  };

  const executePublishShipment = () => {
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
      showAlert('¡Los datos del despacho han sido actualizados!', { title: 'Flete Actualizado', variant: 'success', icon: '✏️' });
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
      showAlert('¡Tu solicitud de flete ha sido publicada con éxito!', { title: '¡Flete Publicado!', variant: 'success', icon: '🚀' });
    }

    setShowPriceConfirmModal(false);
    setShowShipmentModal(false);
    setShipmentStep(1);
    setOrigin('');
    setDestination('');
    setVehicle('');
    setTag('');
    setNotes('');
    onNavigateToView('activity');
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
              window.dispatchEvent(new CustomEvent('cargoflow:toggle-confetti', {
                detail: {
                  title: 'Actualización exitosa.',
                  subtitle: newStatus ? 'Has activado el modo Disponible para recibir fletes' : 'Modo Inactivo activado',
                  statusText: newStatus ? '🟢 Modo Conectado / Disponible' : '⚪ Modo Inactivo',
                  activated: newStatus,
                }
              }));
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
        <HybridMapContainer className="w-full h-full rounded-none border-none shadow-none" initialHeight="h-full" activeTrip={activeTrip} userRole={user.role} />

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
          /* CLIENT FLOATING CTA BUTTON (UBER / RAPPI STYLE PILL) */
          <div className="flex justify-center w-full">
            <button
              onClick={() => setShowShipmentModal(true)}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-full px-5 py-3 shadow-[0px_12px_35px_rgba(16,185,129,0.45)] flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-emerald-300/50 group backdrop-blur-md anim-float-bounce"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0 font-bold shadow-inner">
                <Truck size={16} fill="currentColor" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-white">
                Solicitar Transporte
              </span>
              <Navigation size={15} className="text-emerald-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          </div>
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
                            showAlert('¡Tu contraoferta ha sido enviada al cliente!', { title: 'Contraoferta Enviada', variant: 'success', icon: '💰' });
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
          <motion.div
            key="shipment-wizard-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] backdrop-blur-md bg-black/60 flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 overflow-y-auto"
            onClick={() => setShowShipmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'original'
                  ? "bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-y-auto max-h-[90vh] no-scrollbar border-4 border-amber-400 my-auto relative z-10"
                  : activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-y-auto max-h-[90vh] no-scrollbar border-2 border-slate-800 my-auto relative z-10"
                  : "bg-white text-slate-900 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border-2 border-slate-200 my-auto relative z-10"
              }
            >
              {/* Header Decorative Accent Bar */}
              {activeTheme === 'original' ? (
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400" />
              ) : (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              )}

              {/* Header */}
              <div className={`flex justify-between items-start mb-4 pb-3 border-b ${
                activeTheme === 'noche' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-lg font-black flex items-center gap-2 ${
                    activeTheme === 'noche' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Truck size={20} className="text-emerald-500" fill="currentColor" />
                    <span>{editingTrip ? 'Editar Flete' : 'Nuevo Despacho'}</span>
                  </h3>
                  <p className={`text-xs font-black mt-0.5 ${
                    activeTheme === 'noche' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    ¿A dónde enviamos tu carga hoy?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className={`p-2 rounded-full transition-colors cursor-pointer border ${
                    activeTheme === 'noche'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 border-slate-200'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Step Navigation Bar */}
              <div className={`flex items-center gap-2 mb-5 p-1 rounded-2xl ${
                activeTheme === 'noche' ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={() => setShipmentStep(1)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shipmentStep === 1 
                      ? (activeTheme === 'noche' ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-700' : 'bg-white text-emerald-700 shadow-md border border-slate-200/80')
                      : (activeTheme === 'noche' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    shipmentStep === 1 ? 'bg-emerald-600 text-white' : (activeTheme === 'noche' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600')
                  }`}>1</span>
                  <span>Ruta y Carga</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!origin.trim() || !destination.trim()) {
                      showAlert('Por favor especifica Origen y Destino antes de continuar.', { title: 'Ubicación Requerida', variant: 'warning', icon: '📍' });
                      return;
                    }
                    setShipmentStep(2);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    shipmentStep === 2 
                      ? (activeTheme === 'noche' ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-700' : 'bg-white text-emerald-700 shadow-md border border-slate-200/80')
                      : (activeTheme === 'noche' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    shipmentStep === 2 ? 'bg-emerald-600 text-white' : (activeTheme === 'noche' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600')
                  }`}>2</span>
                  <span>Vehículo y Precio</span>
                </button>
              </div>

              <form onSubmit={handleCreateShipmentSubmit} className="flex flex-col gap-4">
                {/* ── STEP 1: RUTA Y CARGA ────────────────────────── */}
                {shipmentStep === 1 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    {/* ORIGEN DE LA CARGA */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <MapPin size={14} className="text-emerald-500" />
                          Origen de la Carga (Recogida)
                        </label>
                        <button
                          type="button"
                          onClick={handleGetGpsOrigin}
                          disabled={isLocatingGps}
                          className={`text-[11px] font-black border px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                            activeTheme === 'noche'
                              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                          }`}
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
                          className={`w-full h-11 px-3.5 rounded-2xl border-2 text-xs focus:outline-none focus:border-emerald-500 font-bold transition-all shadow-xs ${
                            activeTheme === 'noche'
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                          }`}
                          required
                        />
                      </div>

                      {/* Action Button: Seleccionar en Mapa */}
                      <button
                        type="button"
                        onClick={() => {
                          setMapPickerTarget('origin');
                          setShowMapPicker(true);
                        }}
                        className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-sm border-2 border-emerald-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-0.5"
                      >
                        <Map size={16} />
                        <span>🗺️ Seleccionar Ubicación de Origen en Mapa</span>
                      </button>
                    </div>

                    {/* DESTINO DE LA CARGA */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <MapPin size={14} className="text-blue-500" />
                          Destino de la Carga (Entrega)
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Escribe o selecciona dirección de destino"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className={`w-full h-11 px-3.5 rounded-2xl border-2 text-xs focus:outline-none focus:border-blue-500 font-bold transition-all shadow-xs ${
                            activeTheme === 'noche'
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:bg-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                          }`}
                          required
                        />
                      </div>

                      {/* Action Button: Seleccionar en Mapa */}
                      <button
                        type="button"
                        onClick={() => {
                          setMapPickerTarget('destination');
                          setShowMapPicker(true);
                        }}
                        className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-sm border-2 border-blue-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-0.5"
                      >
                        <Map size={16} />
                        <span>🗺️ Seleccionar Ubicación de Destino en Mapa</span>
                      </button>
                    </div>

                    {/* Tipo de Mercancía (Visual Custom Category Selector) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className={`text-xs font-black uppercase tracking-wider ${
                          activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Tipo de Mercancía
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCargoTypeModal(true)}
                          className="text-[11px] font-extrabold text-emerald-500 hover:underline cursor-pointer"
                        >
                          Ver 13 categorías ➔
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowCargoTypeModal(true)}
                        className={`w-full h-11 px-3.5 border rounded-2xl flex items-center justify-between font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                          activeTheme === 'noche'
                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base flex-shrink-0">
                            {CARGO_TYPES_CATALOG.find(c => c.title === cargoType)?.icon || '📦'}
                          </span>
                          <span className="truncate">{cargoType}</span>
                        </div>
                        <ChevronDown size={16} className={activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-400'} />
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
                                  : (activeTheme === 'noche' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200')
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
                          showAlert('Por favor indica Origen y Destino para continuar.', { title: 'Ubicación Requerida', variant: 'warning', icon: '📍' });
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
                      {/* Vehiculo Trigger Button */}
                      <div className="flex flex-col gap-1">
                        <label className={`text-xs font-bold uppercase tracking-wider ${
                          activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          Tipo Vehículo
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowVehicleModal(true)}
                          className={`w-full h-11 px-3 border-2 rounded-2xl flex items-center justify-between text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer group ${
                            vehicle
                              ? (activeTheme === 'noche' ? 'bg-amber-950/60 border-amber-600/80 text-amber-300' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-slate-800')
                              : (activeTheme === 'noche' ? 'bg-slate-800 border-slate-700 text-slate-300 border-dashed' : 'bg-slate-50 border-slate-200 text-slate-800 border-dashed')
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`text-base p-1 rounded-xl shadow-2xs group-hover:scale-110 transition-transform ${
                              activeTheme === 'noche' ? 'bg-slate-700' : 'bg-white'
                            }`}>
                              {vehicle
                                ? (VEHICLES_CATALOG.find(v => v.title === vehicle || vehicle.includes(v.title))?.icon || '🚚')
                                : '🚛'}
                            </span>
                            <span className={`truncate ${vehicle ? '' : 'text-slate-400 font-semibold'}`}>
                              {vehicle || 'Cualquier vehículo'}
                            </span>
                          </div>
                          <ChevronDown size={14} className="text-amber-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                        </button>
                        {vehicle && (
                          <button
                            type="button"
                            onClick={() => setVehicle('')}
                            className="text-[10px] text-slate-400 hover:text-slate-300 text-right font-semibold"
                          >
                            × Quitar selección
                          </button>
                        )}
                      </div>

                      {/* Especialidad Trigger Button */}
                      <div className="flex flex-col gap-1">
                        <label className={`text-xs font-bold uppercase tracking-wider ${
                          activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                        }`}>Especialidad</label>
                        <button
                          type="button"
                          onClick={() => setShowSpecialtyModal(true)}
                          className={`w-full h-11 px-3 border-2 rounded-2xl flex items-center justify-between text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer group ${
                            activeTheme === 'noche'
                              ? 'bg-blue-950/60 border-blue-700/80 text-blue-300 hover:bg-blue-900/60'
                              : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`text-base p-1 rounded-xl shadow-2xs group-hover:scale-110 transition-transform ${
                              activeTheme === 'noche' ? 'bg-slate-700' : 'bg-white'
                            }`}>
                              {SPECIALTIES_CATALOG.find(s => s.value === tag || (tag === '' && s.value === ''))?.icon || '⚡'}
                            </span>
                            <span className="truncate">{tag ? tag : 'Ninguna'}</span>
                          </div>
                          <ChevronDown size={14} className="text-blue-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                        </button>
                      </div>
                    </div>

                    {/* Precio Deseado (Flete Ofrecido - Inicia en 60.000, min 6.000, máx 3.000.000) */}
                    <div className={`flex flex-col gap-1.5 p-3 rounded-2xl shadow-sm border-2 ${
                      activeTheme === 'noche' ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50/60 border-emerald-300'
                    }`}>
                      <div className="flex justify-between items-center">
                        <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                          activeTheme === 'noche' ? 'text-emerald-400' : 'text-emerald-900'
                        }`}>
                          <span>💰 FLETE OFRECIDO</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            activeTheme === 'noche' ? 'bg-slate-900 text-emerald-400 border-emerald-700' : 'bg-white text-emerald-600 border-emerald-200'
                          }`}>COP</span>
                        </label>
                        <div className={`flex items-center gap-1 border-2 rounded-xl px-2.5 py-1 shadow-xs ${
                          activeTheme === 'noche' ? 'bg-slate-900 border-emerald-600' : 'bg-white border-emerald-400'
                        }`}>
                          <span className="text-xs font-black text-emerald-500">$</span>
                          <input 
                            type="number"
                            min="6000"
                            max="3000000"
                            step="5000"
                            value={customPrice}
                            onChange={(e) => setCustomPrice(Math.max(6000, Math.min(3000000, Number(e.target.value))))}
                            className={`w-24 bg-transparent text-xs font-black outline-none ${
                              activeTheme === 'noche' ? 'text-white' : 'text-emerald-900'
                            }`}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min="6000"
                        max="3000000"
                        step="5000"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Math.max(6000, Math.min(3000000, Number(e.target.value))))}
                        className="w-full h-2.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-1"
                      />
                      <div className={`flex justify-between text-[10px] font-black ${
                        activeTheme === 'noche' ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        <span>$6.000</span>
                        <span>Ofrecido: ${customPrice.toLocaleString('es-CO')}</span>
                        <span>$3M</span>
                      </div>
                    </div>

                    {/* Notas / Observaciones */}
                    <div className="flex flex-col gap-1">
                      <label className={`text-xs font-bold uppercase tracking-wider ${
                        activeTheme === 'noche' ? 'text-slate-300' : 'text-slate-700'
                      }`}>Notas u Observaciones (Opcional)</label>
                      <textarea
                        placeholder="Ej. Entregar en portería 3, frágil..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`w-full h-16 p-2.5 rounded-2xl border text-xs focus:outline-none focus:border-emerald-500 font-bold resize-none ${
                          activeTheme === 'noche'
                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* Step 2 Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShipmentStep(1)}
                        className={`px-4 py-3 font-bold text-xs rounded-2xl transition cursor-pointer ${
                          activeTheme === 'noche'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        ← Volver
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateShipmentSubmit}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFIRMATION & PRICE ADJUSTMENT MODAL ── */}
      <AnimatePresence>
        {showPriceConfirmModal && (
          <div 
            className="fixed inset-0 z-[450] backdrop-blur-md bg-black/75 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowPriceConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'original'
                  ? "bg-white w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden border-4 border-amber-400 flex flex-col items-center relative text-center my-auto"
                  : activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden border-2 border-slate-800 flex flex-col items-center relative text-center my-auto"
                  : "bg-white text-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden border-2 border-slate-200 flex flex-col items-center relative text-center my-auto"
              }
            >
              {/* Decorative Top Bar */}
              {activeTheme === 'original' ? (
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500" />
              ) : (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              )}
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPriceConfirmModal(false)}
                className={`absolute top-3.5 right-3.5 p-1.5 rounded-full transition-colors border cursor-pointer ${
                  activeTheme === 'noche'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 border-slate-200'
                }`}
              >
                <X size={18} />
              </button>

              {/* Header Badge */}
              {activeTheme === 'original' ? (
                <div className="w-full bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 rounded-2xl p-3 border-2 border-amber-300 mb-3 mt-2 flex flex-col items-center shadow-inner relative overflow-hidden">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white shadow-md flex items-center justify-center mb-1 animate-bounce-subtle">
                    <Truck size={28} className="text-white drop-shadow-md" fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-3 py-0.5 rounded-full shadow-xs">
                    🍄 CONFIRMAR PUBLICACIÓN
                  </span>
                </div>
              ) : (
                <div className="w-full rounded-2xl p-3 mb-1 mt-2 flex flex-col items-center relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1 shadow-md ${
                    activeTheme === 'noche' ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  }`}>
                    <Truck size={28} fill="currentColor" />
                  </div>
                </div>
              )}

              {/* Title */}
              <h3 className={`text-base font-black leading-tight mb-1 ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-900'}`}>
                ¿El precio ofrecido es correcto?
              </h3>
              <p className={`text-xs font-medium mb-3 ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'}`}>
                Verifica el resumen de tu despacho y ajusta el valor si lo deseas.
              </p>

              {/* Shipment Details Summary Box */}
              <div className={`w-full border-2 rounded-2xl p-3 mb-3 text-left space-y-1.5 text-xs ${
                activeTheme === 'noche' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1">
                  <span className={`font-bold ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'}`}>📍 Origen:</span>
                  <span className={`font-black truncate max-w-[180px] ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-800'}`}>{origin}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1">
                  <span className={`font-bold ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'}`}>🏁 Destino:</span>
                  <span className={`font-black truncate max-w-[180px] ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-800'}`}>{destination}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-1">
                  <span className={`font-bold ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'}`}>📦 Carga:</span>
                  <span className="font-black text-emerald-500">{cargoType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'}`}>🚚 Vehículo / Tag:</span>
                  <span className={`font-black ${activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-800'}`}>{vehicle || 'Cualquier'} {tag ? `• ${tag}` : ''}</span>
                </div>
              </div>

              {/* Interactive Price Modifier Box inside Modal */}
              <div className={`w-full border-2 rounded-2xl p-3 mb-4 text-center shadow-sm ${
                activeTheme === 'noche' ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-400'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                  activeTheme === 'noche' ? 'text-emerald-400' : 'text-emerald-800'
                }`}>
                  💰 VALOR DEL FLETE OFRECIDO
                </span>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setCustomPrice(prev => Math.max(6000, prev - 10000))}
                    className={`w-8 h-8 rounded-xl border font-black text-sm active:scale-95 shadow-xs flex items-center justify-center cursor-pointer ${
                      activeTheme === 'noche' ? 'bg-slate-700 border-slate-600 text-emerald-400 hover:bg-slate-600' : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title="- $10.000"
                  >
                    -
                  </button>
                  <div className={`flex items-center gap-1 border-2 rounded-xl px-3 py-1 shadow-inner ${
                    activeTheme === 'noche' ? 'bg-slate-900 border-emerald-600' : 'bg-white border-emerald-500'
                  }`}>
                    <span className="text-sm font-black text-emerald-500">$</span>
                    <input
                      type="number"
                      min="6000"
                      max="3000000"
                      step="5000"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Math.max(6000, Math.min(3000000, Number(e.target.value))))}
                      className={`w-28 text-base font-black bg-transparent text-center outline-none ${
                        activeTheme === 'noche' ? 'text-slate-100' : 'text-emerald-900'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomPrice(prev => Math.min(3000000, prev + 10000))}
                    className={`w-8 h-8 rounded-xl border font-black text-sm active:scale-95 shadow-xs flex items-center justify-center cursor-pointer ${
                      activeTheme === 'noche' ? 'bg-slate-700 border-slate-600 text-emerald-400 hover:bg-slate-600' : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title="+ $10.000"
                  >
                    +
                  </button>
                </div>

                <input
                  type="range"
                  min="6000"
                  max="3000000"
                  step="5000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Math.max(6000, Math.min(3000000, Number(e.target.value))))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-1"
                />
                
                <div className="flex justify-between text-[10px] font-black text-emerald-500 px-1">
                  <span>$6.000</span>
                  <span>$3M</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2">
                <button
                  type="button"
                  onClick={executePublishShipment}
                  className={`w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300 ${
                    activeTheme === 'original' ? 'shadow-[0_6px_0_#15803d] active:translate-y-1' : ''
                  }`}
                >
                  <Sparkles size={16} />
                  <span>🚀 Confirmar y Publicar Flete</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPriceConfirmModal(false);
                    setShowShipmentModal(true);
                  }}
                  className={`w-full py-2.5 font-bold text-xs rounded-2xl transition cursor-pointer border ${
                    activeTheme === 'noche' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                  }`}
                >
                  ← Cambiar Datos del Despacho
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CARGO TYPE SELECTION PICKER MODAL (13 Categories with Search) */}
      <AnimatePresence>
        {showCargoTypeModal && (
          <div 
            className="fixed inset-0 z-[400] backdrop-blur-md bg-black/70 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowCargoTypeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border my-auto ${
                activeTheme === 'noche'
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Header */}
              <div className={`flex justify-between items-center pb-3 border-b mb-3 ${
                activeTheme === 'noche' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${
                    activeTheme === 'noche' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span className="text-xl">📦</span>
                    <span>Seleccionar Tipo de Mercancía</span>
                  </h3>
                  <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${
                    activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    13 Categorías disponibles para tu flete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCargoTypeModal(false)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    activeTheme === 'noche' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Filter Bar */}
              <div className="relative mb-3">
                <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  placeholder="Buscar categoría (ej. refrigerado, trasteos, alimentos, cemento...)"
                  value={cargoTypeSearch}
                  onChange={(e) => setCargoTypeSearch(e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 rounded-2xl border text-xs font-bold focus:outline-none focus:border-emerald-500 transition-all shadow-xs ${
                    activeTheme === 'noche'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
                {cargoTypeSearch && (
                  <button
                    onClick={() => setCargoTypeSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categories Grid List */}
              <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-2 no-scrollbar flex-1">
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
                            ? (activeTheme === 'noche' ? 'bg-emerald-950/80 border-emerald-500 shadow-sm' : 'bg-emerald-50 border-emerald-500 shadow-sm')
                            : (activeTheme === 'noche' ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200')
                        }`}
                      >
                        <span className={`text-2xl p-2 rounded-2xl transition-colors flex-shrink-0 ${
                          activeTheme === 'noche' ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-slate-100 group-hover:bg-white'
                        }`}>
                          {cat.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-black truncate ${
                              isSelected
                                ? (activeTheme === 'noche' ? 'text-emerald-400' : 'text-emerald-800')
                                : (activeTheme === 'noche' ? 'text-slate-100' : 'text-slate-900')
                            }`}>
                              {cat.title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className={`text-[11px] font-medium leading-tight mt-0.5 line-clamp-2 ${
                            activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
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

      {/* 🎮 MARIO BROS STYLE VEHICLE SELECTION MODAL 🎮 */}
      <AnimatePresence>
        {showVehicleModal && (
          <div 
            className="fixed inset-0 z-[400] backdrop-blur-md bg-black/75 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowVehicleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col border-2 border-slate-800 my-auto relative"
                  : "bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] overflow-hidden max-h-[90vh] flex flex-col border-4 border-amber-400 my-auto relative"
              }
            >
              {/* Top Decorative Mario Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-red-500 to-emerald-400" />

              {/* Header */}
              <div className={`flex justify-between items-center pb-3 border-b-2 mb-3 mt-1 ${
                activeTheme === 'noche' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${
                    activeTheme === 'noche' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span className="text-2xl p-1 bg-amber-100 rounded-xl shadow-xs border border-amber-300">🎮</span>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-black">
                      Seleccionar Tipo de Vehículo
                    </span>
                  </h3>
                  <p className={`text-[11px] font-extrabold uppercase tracking-wider mt-0.5 ${
                    activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    15 Opciones de vehículos disponibles
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className={`p-2 rounded-full transition-colors cursor-pointer border ${
                    activeTheme === 'noche' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 border-slate-200'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Filter Bar */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 font-bold" />
                <input
                  type="text"
                  placeholder="Buscar vehículo (ej. tractomula, furgón, motocarguera...)"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 rounded-2xl border-2 text-xs font-black transition-all shadow-xs ${
                    activeTheme === 'noche'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-amber-500'
                      : 'bg-amber-50/40 border-amber-200 text-slate-800 focus:border-amber-500'
                  }`}
                />
                {vehicleSearch && (
                  <button
                    onClick={() => setVehicleSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-black"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Vehicles Grid List */}
              <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-2.5 no-scrollbar flex-1">
                {VEHICLES_CATALOG
                  .filter(v => 
                    v.title.toLowerCase().includes(vehicleSearch.toLowerCase()) || 
                    v.subtitle.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                    v.badge.toLowerCase().includes(vehicleSearch.toLowerCase())
                  )
                  .map((v) => {
                    const isSelected = vehicle === v.title;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehicle(v.title);
                          setShowVehicleModal(false);
                          setVehicleSearch('');
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer group relative overflow-hidden ${
                          isSelected
                            ? (activeTheme === 'noche' ? 'bg-amber-950/60 border-amber-500 shadow-md' : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-500 shadow-md scale-[1.01]')
                            : (activeTheme === 'noche' ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300')
                        }`}
                      >
                        {/* Vehicle Icon Badge */}
                        <div className={`p-3 rounded-2xl text-2xl bg-gradient-to-br ${v.color} text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0 flex items-center justify-center`}>
                          {v.icon}
                        </div>

                        {/* Text & Specs */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-black truncate ${
                              isSelected
                                ? (activeTheme === 'noche' ? 'text-amber-400' : 'text-amber-950')
                                : (activeTheme === 'noche' ? 'text-white' : 'text-slate-900')
                            }`}>
                              {v.title}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs ${
                                activeTheme === 'noche' ? 'bg-slate-700 text-amber-300 border-slate-600' : v.bgLight
                              }`}>
                                {v.badge}
                              </span>
                              {isSelected && (
                                <CheckCircle2 size={18} className="text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className={`text-[11px] font-bold leading-tight mt-1 line-clamp-2 ${
                            activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {v.subtitle}
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

      {/* 🍄 MARIO BROS STYLE SPECIALTY SELECTION MODAL 🍄 */}
      <AnimatePresence>
        {showSpecialtyModal && (
          <div 
            className="fixed inset-0 z-[400] backdrop-blur-md bg-black/75 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowSpecialtyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={
                activeTheme === 'noche'
                  ? "bg-slate-900 text-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.7)] overflow-hidden max-h-[90vh] flex flex-col border-2 border-slate-800 my-auto relative"
                  : "bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] overflow-hidden max-h-[90vh] flex flex-col border-4 border-blue-400 my-auto relative"
              }
            >
              {/* Top Decorative Mario Bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />

              {/* Header */}
              <div className={`flex justify-between items-center pb-3 border-b-2 mb-3 mt-1 ${
                activeTheme === 'noche' ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-base font-black flex items-center gap-2 ${
                    activeTheme === 'noche' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span className="text-2xl p-1 bg-blue-100 rounded-xl shadow-xs border border-blue-300">🍄</span>
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent font-black">
                      Seleccionar Especialidad
                    </span>
                  </h3>
                  <p className={`text-[11px] font-extrabold uppercase tracking-wider mt-0.5 ${
                    activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Condiciones especiales para la carga
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSpecialtyModal(false)}
                  className={`p-2 rounded-full transition-colors cursor-pointer border ${
                    activeTheme === 'noche' ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 border-slate-200'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Specialty List */}
              <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-2.5 no-scrollbar flex-1">
                {SPECIALTIES_CATALOG.map((s) => {
                  const isSelected = tag === s.value || (tag === '' && s.value === '');
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setTag(s.value);
                        setShowSpecialtyModal(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer group relative overflow-hidden ${
                        isSelected
                          ? (activeTheme === 'noche' ? 'bg-blue-950/60 border-blue-500 shadow-md' : 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 shadow-md scale-[1.01]')
                          : (activeTheme === 'noche' ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300')
                      }`}
                    >
                      {/* Icon Badge */}
                      <div className={`p-3 rounded-2xl text-2xl bg-gradient-to-br ${s.color} text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0 flex items-center justify-center`}>
                        {s.icon}
                      </div>

                      {/* Text Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-black truncate ${
                            isSelected
                              ? (activeTheme === 'noche' ? 'text-blue-400' : 'text-blue-950')
                              : (activeTheme === 'noche' ? 'text-white' : 'text-slate-900')
                          }`}>
                            {s.title}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs ${
                              activeTheme === 'noche' ? 'bg-slate-700 text-blue-300 border-slate-600' : s.bgLight
                            }`}>
                              {s.badge}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className={`text-[11px] font-bold leading-tight mt-1 line-clamp-2 ${
                          activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {s.subtitle}
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
              className={`rounded-3xl p-6 shadow-2xl max-w-sm w-full border flex flex-col gap-4 ${
                activeTheme === 'noche' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-base font-black ${activeTheme === 'noche' ? 'text-white' : 'text-[#0b224d]'}`}>Asignar Vehículo</h3>
                  <p className={`text-[10px] font-bold uppercase mt-0.5 ${activeTheme === 'noche' ? 'text-slate-400' : 'text-slate-400'}`}>Selecciona el camión para este viaje</p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowVehicleSelector(false);
                    setActionToPerform(null);
                  }} 
                  className={`p-1 rounded-full cursor-pointer ${
                    activeTheme === 'noche' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400'
                  }`}
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
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex justify-between items-center group cursor-pointer ${
                      activeTheme === 'noche'
                        ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100 hover:border-[#0b224d]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        activeTheme === 'noche' ? 'bg-slate-700 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-[#0b224d]/5 text-[#0b224d] group-hover:bg-[#0b224d] group-hover:text-white'
                      }`}>
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className={`text-xs font-black ${activeTheme === 'noche' ? 'text-white' : 'text-on-surface'}`}>{vh.type}</p>
                        {vh.model && <p className="text-[9px] text-slate-400 font-bold">Mod. {vh.model}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 border rounded-md tracking-wider transition-all ${
                      activeTheme === 'noche'
                        ? 'bg-slate-900 border-slate-700 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent'
                        : 'bg-white border-slate-200 text-[#0b224d] group-hover:bg-[#0b224d] group-hover:text-white group-hover:border-transparent'
                    }`}>
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
                className={`w-full py-2.5 font-bold rounded-xl text-xs transition-all cursor-pointer ${
                  activeTheme === 'noche' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-750'
                }`}
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
              <HybridMapContainer className="!rounded-none" initialHeight="h-full" hideControls={false} activeTrip={activeTrip} userRole={user.role} />
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
                        className="py-2.5 px-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[9.5px] leading-tight flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer animate-pulse"
                        title="Confirmar entrega realizada"
                      >
                        <CheckCircle2 size={13} className="flex-shrink-0" />
                        <span className="truncate">✓ Confirmar Entrega</span>
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

      {/* 🗺️ MARIO BROS STYLE MAP PICKER MODAL 🗺️ */}
      <MapPickerModal
        isOpen={showMapPicker}
        target={mapPickerTarget}
        initialAddress={mapPickerTarget === 'origin' ? origin : destination}
        onClose={() => setShowMapPicker(false)}
        onConfirmLocation={(address) => {
          if (mapPickerTarget === 'origin') {
            setOrigin(address);
          } else {
            setDestination(address);
          }
        }}
      />
    </div>
  );
}
