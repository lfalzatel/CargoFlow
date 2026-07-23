import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Download, 
  Share2, 
  Settings, 
  Plus, 
  LogOut, 
  Sun,
  Moon,
  Monitor,
  Check,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  linkedAccounts?: UserProfile[];
  onNavigateToView: (view: 'home' | 'activity' | 'chat' | 'profile') => void;
  onLogout: () => void;
  onAddAccount?: () => void;
  onSwitchAccount?: (acc: UserProfile) => void;
  unreadCount?: number;
}

export default function Header({ 
  user, 
  linkedAccounts = [], 
  onNavigateToView, 
  onLogout, 
  onAddAccount, 
  onSwitchAccount, 
  unreadCount = 3 
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTheme, setActiveTheme] = useState<'dia' | 'cyber' | 'kilo'>('dia');
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dynamic user avatar (Google profile photo if logged in with Google, or fallback avatar)
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
  const userAvatar = user.photoURL || defaultAvatar;

  // Capture PWA install prompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Share App - Exactly shares https://cargoflow-c387d.web.app/
  const handleShareApp = async () => {
    const shareUrl = 'https://cargoflow-c387d.web.app/';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CargoFlow Colombia',
          text: 'CargoFlow - La plataforma líder de transporte de carga en Colombia',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert(`¡Enlace copiado al portapapeles!\n${shareUrl}`);
    }
  };

  // Handle PWA Installation
  const handleInstallPwa = async () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      const choiceResult = await pwaInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        setPwaInstallPrompt(null);
      }
    } else {
      alert('Instrucciones para instalar CargoFlow:\n\n1. Presiona el botón Compartir o Menú en tu navegador\n2. Selecciona "Agregar a la pantalla de inicio"');
    }
  };

  const sampleNotifications = [
    {
      id: 'notif-1',
      title: '¡Nueva solicitud asignada!',
      desc: 'Ruta Bogotá -> Medellín (#CF-8842) cargada.',
      time: 'Hace 5 min',
      unread: true,
    },
    {
      id: 'notif-2',
      title: 'Pago Recibido',
      desc: 'Se abonaron $1.250.000 COP a tu saldo disponible.',
      time: 'Hace 1 hora',
      unread: true,
    },
    {
      id: 'notif-3',
      title: 'Documento Verificado',
      desc: 'Tu SOAT y Tarjeta de Propiedad fueron aprobados.',
      time: 'Ayer',
      unread: false,
    },
  ];

  const getFirstName = (name?: string) => {
    if (!name) return 'Usuario';
    return name.split(' ')[0];
  };

  return (
    <>
      {/* Dark backdrop overlay when menu or notifications are open */}
      <AnimatePresence>
        {(isMenuOpen || isNotificationsOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsMenuOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[90]"
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-surface-container h-16 px-4 md:px-8 flex items-center justify-between shadow-sm transition-all">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={() => onNavigateToView('home')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Truck size={22} fill="currentColor" />
          </div>
          <span className="font-headline-md text-xl font-extrabold text-primary-container tracking-tight">
            CargoFlow
          </span>
        </div>

        {/* Right Actions: WhatsApp Support, Notifications, Profile Capsule */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* WhatsApp Direct Support Button */}
          <a
            href="https://wa.me/573000000000?text=Hola,%20necesito%20soporte%20en%20CargoFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Soporte WhatsApp"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsMenuOpen(false);
              }}
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center transition-all relative active:scale-95"
              title="Notificaciones"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0px_10px_40px_rgba(0,0,0,0.12)] border border-surface-container overflow-hidden z-[100]"
                >
                  <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container-lowest">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-primary-container" />
                      <h3 className="font-bold text-sm text-on-surface">Notificaciones</h3>
                    </div>
                    <span className="text-[11px] font-bold bg-blue-50 text-primary-container px-2 py-0.5 rounded-full">
                      {unreadCount} Nuevas
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-surface-container-low">
                    {sampleNotifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 ${
                          n.unread ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.unread ? 'bg-primary-container' : 'bg-outline-variant'}`} />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-on-surface leading-snug">{n.title}</h4>
                          <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">{n.desc}</p>
                          <span className="text-[10px] text-outline font-medium mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-surface-container-low text-center border-t border-surface-container">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        onNavigateToView('activity');
                      }} 
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Ver todas las actividades
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Capsule Button (Google Avatar + Name + Role Badge + Chevron) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsNotificationsOpen(false);
              }}
              className={`flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full border transition-all duration-200 active:scale-95 ${
                isMenuOpen 
                  ? 'bg-blue-50 border-primary-container/40 shadow-sm' 
                  : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
              }`}
            >
              {/* User Profile Avatar from Google/Registration */}
              <img
                src={userAvatar}
                alt={user.name || 'Usuario'}
                className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
              />

              {/* Name & Role Badge */}
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  {getFirstName(user.name)}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded-full w-fit">
                  {user.role === 'conductor' ? 'CONDUCTOR' : 'CLIENTE'}
                </span>
              </div>

              {/* Chevron */}
              {isMenuOpen ? (
                <ChevronUp size={16} className="text-primary-container" />
              ) : (
                <ChevronDown size={16} className="text-outline" />
              )}
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 sm:w-84 bg-white rounded-3xl shadow-[0px_20px_60px_rgba(0,0,0,0.25)] border border-surface-container overflow-hidden z-[100] max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar"
                >
                  {/* Header User Card (Google Photo & Registration Email) */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50/60 via-blue-50/40 to-white border-b border-surface-container flex items-center gap-3.5">
                    <img
                      src={userAvatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 shadow-md flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-extrabold text-sm text-on-surface truncate">{user.name || 'Luis Fernando Alzate'}</h3>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5 font-medium">{user.email || 'lfalzatel@gmail.com'}</p>
                      <span className="mt-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full w-fit">
                        {user.role === 'conductor' ? 'CONDUCTOR' : 'CLIENTE'}
                      </span>
                    </div>
                  </div>

                  {/* Theme Selector Segmented Control (Día / Cyber / Kilo) */}
                  <div className="p-3 bg-surface-container-lowest border-b border-surface-container">
                    <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-2xl">
                      <button
                        onClick={() => setActiveTheme('dia')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          activeTheme === 'dia'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Sun size={16} className="mb-0.5" />
                        <span>Día</span>
                      </button>
                      <button
                        onClick={() => setActiveTheme('cyber')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          activeTheme === 'cyber'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Monitor size={16} className="mb-0.5" />
                        <span>Cyber</span>
                      </button>
                      <button
                        onClick={() => setActiveTheme('kilo')}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                          activeTheme === 'kilo'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <Moon size={16} className="mb-0.5" />
                        <span>Kilo</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Menu Options */}
                  <div className="p-2 space-y-0.5 border-b border-surface-container">
                    {/* MiPerfil */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateToView('profile');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low text-on-surface transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-low group-hover:bg-blue-50 text-on-surface-variant group-hover:text-primary-container flex items-center justify-center transition-colors">
                          <User size={18} />
                        </div>
                        <span className="text-xs font-bold">Mi perfil</span>
                      </div>
                    </button>

                    {/* Instalar App */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleInstallPwa();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 text-emerald-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                          <Download size={18} />
                        </div>
                        <span className="text-xs font-bold">Instalar app</span>
                      </div>
                      {installSuccess && <Check size={16} className="text-emerald-600" />}
                    </button>

                    {/* Compartir App */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleShareApp();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low text-on-surface transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-low group-hover:bg-blue-50 text-on-surface-variant group-hover:text-primary-container flex items-center justify-center transition-colors">
                          <Share2 size={18} />
                        </div>
                        <span className="text-xs font-bold">Compartir app</span>
                      </div>
                    </button>

                    {/* Notificaciones Toggle */}
                    <div className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low text-on-surface transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center">
                          <Bell size={18} />
                        </div>
                        <span className="text-xs font-bold">Notificaciones</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationsEnabled}
                          onChange={(e) => setNotificationsEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Configuración */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateToView('profile');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-low text-on-surface transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-low group-hover:bg-blue-50 text-on-surface-variant group-hover:text-primary-container flex items-center justify-center transition-colors">
                          <Settings size={18} />
                        </div>
                        <span className="text-xs font-bold">Configuración</span>
                      </div>
                    </button>
                  </div>

                  {/* OTRAS CUENTAS Section (Instagram-Style Quick Account Switcher) */}
                  <div className="p-3 bg-surface-container-lowest flex flex-col gap-1.5 pb-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-outline px-2 block mb-1">
                      OTRAS CUENTAS (CAMBIO RÁPIDO)
                    </span>

                    {/* Dynamic List of Linked Accounts */}
                    {linkedAccounts.length > 0 ? (
                      linkedAccounts.map((acc, idx) => (
                        <div
                          key={acc.email + idx}
                          onClick={() => {
                            setIsMenuOpen(false);
                            if (onSwitchAccount) onSwitchAccount(acc);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/80 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 group"
                          title="Haz clic para cambiar a esta cuenta"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={acc.photoURL || defaultAvatar}
                              alt={acc.name}
                              className="w-8 h-8 rounded-full object-cover border border-outline-variant shadow-xs flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-on-surface truncate group-hover:text-emerald-700">{acc.name}</span>
                              <span className="text-[11px] text-outline truncate">{acc.email}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex-shrink-0">
                            {acc.role === 'conductor' ? 'CONDUCTOR' : 'CLIENTE'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div 
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (onAddAccount) onAddAccount();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50 transition-colors cursor-pointer border border-dashed border-outline-variant"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                            alt="Luis Fernando (Cliente)"
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-on-surface truncate">Luis Fernando (Cliente)</span>
                            <span className="text-[11px] text-outline truncate">lfalzatel29@gmail.com</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          CLIENTE
                        </span>
                      </div>
                    )}

                    {/* Añadir Cuenta Button (Triggers Google Auth Account Chooser) */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onAddAccount) onAddAccount();
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container-low text-on-surface transition-colors mt-1"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Plus size={18} />
                      </div>
                      <span className="text-xs font-bold text-emerald-700">Añadir otra cuenta (Google)</span>
                    </button>

                    {/* Cerrar Sesión directly inside/under OTRAS CUENTAS */}
                    <div className="pt-2 mt-1 border-t border-surface-container">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors font-bold text-xs"
                      >
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
