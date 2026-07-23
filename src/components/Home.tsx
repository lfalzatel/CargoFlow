import React, { useState } from 'react';
import { Search, MapPin, History, Menu, Truck, Star, Info, X, Navigation, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Trip, UserProfile } from '../types';

interface HomeProps {
  user: UserProfile;
  onCreateShipment: (trip: Trip) => void;
  onNavigateToView: (view: 'home' | 'activity' | 'chat' | 'profile') => void;
  onLogout: () => void;
}

export default function Home({ user, onCreateShipment, onNavigateToView, onLogout }: HomeProps) {
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<{
    driverName: string;
    vehicle: string;
    plate: string;
    location: string;
    status: string;
  } | null>(null);

  // Form State for creating a custom shipment
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('Alimentos');
  const [tag, setTag] = useState<'REFRIGERADO' | 'FRÁGIL' | ''>('REFRIGERADO');
  const [vehicle, setVehicle] = useState('Tractomula');
  const [customPrice, setCustomPrice] = useState(1250000);

  // Pre-configured trucks to interact with on the map
  const trucksOnMap = [
    {
      id: 'truck-1',
      driverName: 'Carlos Rodríguez',
      vehicle: 'Kenworth T800',
      plate: 'WYZ-789',
      location: 'Suba, Bogotá',
      status: 'Cargando mercancía',
      top: '35%',
      left: '20%',
    },
    {
      id: 'truck-2',
      driverName: 'Andrés López',
      vehicle: 'Chevrolet NPR',
      plate: 'SQR-456',
      location: 'Usaquén, Bogotá',
      status: 'En tránsito a Medellín',
      top: '52%',
      left: '65%',
    },
    {
      id: 'truck-3',
      driverName: 'Mauricio Gómez',
      vehicle: 'Foton Super',
      plate: 'KLO-123',
      location: 'Barrios Unidos, Bogotá',
      status: 'Esperando documentos',
      top: '68%',
      left: '48%',
    },
  ];

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    const newTrip: Trip = {
      id: `#CF-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'EN CAMINO',
      price: customPrice,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      origin,
      originDetail: 'Terminal de Carga Principal',
      destination,
      destinationDetail: 'Entrega en Centro Ciudad',
      vehicleType: vehicle,
      tag: tag || undefined,
    };

    onCreateShipment(newTrip);
    setShowShipmentModal(false);
    onNavigateToView('activity'); // go to activity screen to see it
  };

  const handleQuickReorder = () => {
    // Quick reorder for Bogotá to Medellín
    const quickTrip: Trip = {
      id: `#CF-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'EN CAMINO',
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
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

      {/* Map Layer Container */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCQwz6XcyO5DjH3yVB6NJILr3-5cgY-k28ESfQNb8M5V-F79d-5ntLd-a76ITY9X4huVALhedGmILMq3OTYhcgMuosjwRc4xeQUoWbmeCW37uXJr3cp1KWuuclZigPjVyRFs2JN_pgyIQ4Twel2vYS149-O8eHPznuf5qp4eMFrOoUEdtmp4q6DNptBM5gA7_CYqIpwqKddz3tVb2yUrUKIIy2MqJw6sTO4gbSStqGVSZAagP9nPI4P')`,
          }}
        />

        {/* Overlay Darkener for high-key readability */}
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />

        {/* Interactive Vehicle Markers */}
        {trucksOnMap.map((trk) => (
          <div
            key={trk.id}
            style={{ top: trk.top, left: trk.left }}
            className="absolute z-10"
          >
            <button
              onClick={() => setSelectedTruck(trk)}
              className="relative group focus:outline-none"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="w-10 h-10 bg-white rounded-full shadow-[0px_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center border-2 border-primary-container hover:scale-110 active:scale-95 transition-all">
                <Truck size={18} className="text-primary-container" fill="currentColor" />
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Interactive Map Marker details sheet */}
      <AnimatePresence>
        {selectedTruck && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-64 left-4 right-4 z-20"
          >
            <div className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.15)] p-4 border border-surface-container relative">
              <button
                onClick={() => setSelectedTruck(null)}
                className="absolute top-3 right-3 p-1 hover:bg-surface-container rounded-full text-on-surface-variant"
              >
                <X size={16} />
              </button>

              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary-container flex-shrink-0">
                  <Truck size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface">{selectedTruck.driverName}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">
                    {selectedTruck.vehicle} • <span className="font-bold">{selectedTruck.plate}</span>
                  </p>
                  <p className="text-[11px] text-[#FF9800] bg-[#FF9800]/10 px-2 py-0.5 rounded-full inline-block mt-1.5 font-bold">
                    ● {selectedTruck.status}
                  </p>
                  <div className="flex gap-1 items-center mt-2 text-[10px] text-outline font-medium">
                    <MapPin size={12} />
                    <span>Última ubicación: {selectedTruck.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTruck(null);
                  onNavigateToView('chat');
                }}
                className="w-full mt-3 py-2 bg-primary-container hover:bg-primary text-white rounded-xl text-xs font-bold transition-all"
              >
                Escribir al Conductor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header Card - Custom for Role */}
      <div className="absolute top-20 left-4 right-4 z-20">
        {user.role === 'conductor' ? (
          /* DRIVER TOP CARD */
          <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-[#0A1220] text-white rounded-2xl p-4 shadow-[0px_10px_35px_rgba(0,0,0,0.3)] border border-slate-700/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  MODO CONDUCTOR • DISPONIBLE
                </span>
              </div>
              <span className="text-[11px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Placa: {user.plateNumber || 'WYZ-789'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Ganancias Hoy</span>
                <span className="text-xs font-black text-emerald-400">$1.250.000</span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Calificación</span>
                <span className="text-xs font-black text-amber-400">★ 4.9</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Entregas</span>
                <span className="text-xs font-black text-blue-400">12 Viajes</span>
              </div>
            </div>
          </div>
        ) : (
          /* CLIENT TOP CARD */
          <button
            onClick={() => setShowShipmentModal(true)}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-2xl shadow-[0px_10px_35px_rgba(16,185,129,0.3)] flex items-center justify-between p-4 cursor-pointer hover:opacity-95 transition-all border border-emerald-400/40 group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-inner">
                <Truck size={22} fill="currentColor" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="text-[11px] font-black text-emerald-200 uppercase tracking-widest">
                  PANEL CLIENTE • CREAR FLETE
                </span>
                <span className="text-sm font-extrabold text-white truncate">
                  ¿A dónde enviamos tu carga hoy?
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-white text-emerald-700 rounded-xl font-black text-xs shadow-md flex-shrink-0 group-hover:bg-slate-100 anim-float-bounce">
              Solicitar Flete
            </div>
          </button>
        )}
      </div>

      {/* Bottom Floating Content - Custom for Role */}
      <div className="absolute bottom-20 left-4 right-4 z-20">
        {user.role === 'conductor' ? (
          /* DRIVER BOTTOM CARD: OFERTA DE CARGA DISPONIBLE */
          <div className="bg-white rounded-2xl shadow-[0px_12px_40px_rgba(0,0,0,0.15)] p-5 border border-surface-container">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                OFERTA DE CARGA DISPONIBLE
              </span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                $1.250.000 COP
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="w-0.5 h-7 bg-slate-300 my-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>
              <div className="flex flex-col justify-between h-14">
                <span className="text-sm text-on-surface font-extrabold leading-tight">Bogotá, D.C. (Fontibón)</span>
                <span className="text-sm text-on-surface font-extrabold leading-tight">Medellín, ANT (Guayabal)</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('¡Has tomado la oferta de carga! Iniciando ruta hacia Bogotá...');
                onNavigateToView('activity');
              }}
              className="w-full h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Truck size={18} fill="currentColor" />
              Aceptar Carga & Tomar Flete
            </button>
          </div>
        ) : (
          /* CLIENT BOTTOM CARD: RASTREO DE ENVÍO EN CURSO */
          <div className="bg-white rounded-2xl shadow-[0px_12px_40px_rgba(0,0,0,0.12)] p-5 border border-surface-container">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-primary-container uppercase tracking-widest flex items-center gap-1.5">
                <History className="text-primary-container" size={16} />
                MI ENVÍO EN CURSO (#CF-8842)
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                ● EN CAMINO
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <div className="w-0.5 h-7 bg-slate-300 my-1" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>
              <div className="flex flex-col justify-between h-14">
                <span className="text-sm text-on-surface font-extrabold leading-tight">Origen: Bogotá, D.C.</span>
                <span className="text-sm text-on-surface font-extrabold leading-tight">Destino: Medellín, ANT</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickReorder}
                className="h-[46px] rounded-xl border-2 border-primary-container text-primary-container hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={15} />
                Reordenar
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
        )}
      </div>

      {/* CREATE SHIPMENT MODAL / VIEW */}
      <AnimatePresence>
        {showShipmentModal && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar border border-surface-container"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-on-surface">Nuevo Despacho</h3>
                <button
                  onClick={() => setShowShipmentModal(false)}
                  className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateShipmentSubmit} className="flex flex-col gap-4">
                {/* Origen */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Ciudad de Origen</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
                    <input
                      type="text"
                      placeholder="Ej. Bogotá, Cundinamarca"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-surface rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Destino */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Ciudad de Destino</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-container" size={16} />
                    <input
                      type="text"
                      placeholder="Ej. Medellín, Antioquia"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-surface rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Tipo de Carga */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Tipo de Mercancía</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container font-semibold"
                  >
                    <option value="Alimentos">Alimentos / Perecederos</option>
                    <option value="Tecnología">Electrónicos / Tecnología</option>
                    <option value="Medicinas">Medicamentos / Salud</option>
                    <option value="Materiales">Materiales de Construcción</option>
                    <option value="General">Carga General / Enseres</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Vehiculo */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Vehículo</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container font-semibold"
                    >
                      <option value="Tractomula">Tractomula</option>
                      <option value="Camión Sencillo">Camión Sencillo</option>
                      <option value="Furgón Mediano">Furgón Mediano</option>
                    </select>
                  </div>

                  {/* Especialidades */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Especialidad</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value as any)}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary-container font-semibold"
                    >
                      <option value="REFRIGERADO">REFRIGERADO</option>
                      <option value="FRÁGIL">FRÁGIL</option>
                      <option value="">Ninguna</option>
                    </select>
                  </div>
                </div>

                {/* Precio Deseado */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Flete Ofrecido (COP)</label>
                    <span className="text-sm font-extrabold text-primary-container">
                      ${customPrice.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300000"
                    max="3500000"
                    step="50000"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
                  />
                  <div className="flex justify-between text-[10px] text-outline font-medium mt-1">
                    <span>$300k</span>
                    <span>Medio</span>
                    <span>$3.5M</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-primary-container hover:bg-primary text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Truck size={18} fill="currentColor" />
                  Publicar Despacho
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
