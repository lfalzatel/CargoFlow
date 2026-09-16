import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, ChevronRight,
  User, Bell, Palette, Shield, Info, Truck,
  Phone, Mail, KeyRound, Car, FileText,
  Volume2, Smartphone, MessageSquare, Download,
  Share2, HelpCircle, Trash2, LogOut, Sun, Monitor,
  X, Check, ArrowLeft, AlertTriangle, Moon, Layers, Terminal, Zap,
  Sparkles, Star, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import {
  requestNotificationPermission,
  playNotificationSound,
} from '../services/notificationService';
import UserManagementModal from './UserManagementModal';
import { 
  SOUND_PROFILES, 
  getMenuUiSoundProfile, setMenuUiSoundProfile, playMenuUiSound,
  getGeneralUiSoundProfile, setGeneralUiSoundProfile, playGeneralUiSound,
  SoundProfileId 
} from '../lib/soundEffects';
import {
  playGamificationFanfare,
  playCoinClaimSound,
  speakVoiceConfirmation
} from '../lib/ui-sounds';

import { 
  getMapControlsConfig, 
  setMapControlsConfig, 
  MapControlsPosition, 
  MapControlsDirection 
} from '../maps/services/mapSettings';

// ── Types ────────────────────────────────────────────────────
interface SettingsProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onInstallApp: () => void;
  onShareApp: () => void;
  onTestGamificationModal?: (type: 'receiver' | 'sender') => void;
}

type SectionKey = 'cuenta' | 'notificaciones' | 'sonidos' | 'gamificacion' | 'vehiculo' | 'apariencia' | 'info' | 'privacidad' | 'gestion' | 'mapa';

// ── Toggle component ─────────────────────────────────────────
function Toggle({ checked, onChange, label = 'Configuración guardada', target = 'general' }: { checked: boolean; onChange: (v: boolean) => void; label?: string; target?: string }) {
  return (
    <button
      onClick={() => {
        const nextVal = !checked;
        onChange(nextVal);
        window.dispatchEvent(new CustomEvent('cargoflow:toggle-confetti', {
          detail: {
            target,
            title: 'Actualización exitosa.',
            subtitle: label,
            statusText: nextVal ? '🟢 Activado Correctamente' : '⚪ Desactivado Correctamente',
            activated: nextVal,
          }
        }));
      }}
      className={`relative inline-flex items-center w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
        checked ? 'bg-[#0b224d]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── "Pronto" badge ────────────────────────────────────────────
function ProntoBadge() {
  return (
    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0">
      PRONTO
    </span>
  );
}

// ── Section Row ───────────────────────────────────────────────
function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  action,
  danger = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        danger ? 'opacity-90' : disabled ? 'opacity-50' : ''
      }`}
    >
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
        style={{ color: iconColor }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${danger ? 'text-red-500' : 'text-on-surface'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Accordion Section ─────────────────────────────────────────
function Section({
  title,
  open,
  onToggle,
  children,
  danger = false,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="border-b border-surface-container last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 text-left cursor-pointer"
      >
        <span
          className={`text-sm font-bold tracking-tight ${
            danger ? 'text-red-500' : 'text-on-surface'
          }`}
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className={danger ? 'text-red-400' : 'text-on-surface-variant'} />
        ) : (
          <ChevronDown size={16} className={danger ? 'text-red-400' : 'text-on-surface-variant'} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 rounded-2xl border border-surface-container bg-surface-container-low shadow-sm overflow-hidden divide-y divide-surface-container">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Theme Picker Modal ────────────────────────────────────────
function ThemeModal({
  active,
  onClose,
  onSave,
}: {
  active: string;
  onClose: () => void;
  onSave: (t: string) => void;
}) {
  const [selected, setSelected] = useState(active);
  const [quickList, setQuickList] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cf_theme_quick_list');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return ['dia', 'noche', 'original']; // default
  });

  const themes = [
    { id: 'original', label: 'Gamer (Mario)', icon: <span className="text-xl">🍄</span> },
    { id: 'dia',      label: 'Modo Día',     icon: <Sun size={22} /> },
    { id: 'noche',    label: 'Modo Noche',   icon: <Moon size={22} /> },
    { id: 'glass',    label: 'Glass',        icon: <Layers size={22} /> },
    { id: 'cyber',    label: 'Cyber',        icon: <Terminal size={22} /> },
  ];

  const fullLabels: Record<string, string> = {
    original: 'Modo Gamer (Mario Bros)',
    dia: 'Modo Día (Limpio Corporativo)',
    noche: 'Modo Noche (Oscuro Elegante)',
    glass: 'Glassmorphism Transparente',
    cyber: 'Cyberpunk Neón'
  };

  const toggleQuickTheme = (id: string) => {
    setQuickList(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // min 1
        return prev.filter(t => t !== id);
      } else {
        if (prev.length >= 3) return prev; // max 3
        return [...prev, id];
      }
    });
  };

  const handleSave = () => {
    localStorage.setItem('cf_theme_quick_list', JSON.stringify(quickList));
    localStorage.setItem('cf_theme', selected);
    window.dispatchEvent(new CustomEvent('cargoflow:theme-changed', { detail: { theme: selected } }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'cf_theme', newValue: selected }));
    onSave(selected);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Palette size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Gestión de Temas</h3>
              <p className="text-[11px] text-slate-400">Personaliza la apariencia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content area scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <p className="text-xs font-bold text-slate-600 mb-3">Tema Visual Activo</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all gap-2 ${
                  selected === t.id
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600'
                    : 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-300'
                }`}
              >
                {t.icon}
                <span className={`text-xs font-bold ${selected === t.id ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-slate-800">Modos en Menú<br/>Desplegable</p>
            <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">
              {quickList.length} seleccionados (Mín 1, Máx 3)
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Toca los temas en el orden que quieres que aparezcan en el menú rápido.
          </p>

          <div className="space-y-2">
            {themes.map((t) => {
              const idx = quickList.indexOf(t.id);
              const isSelected = idx !== -1;
              return (
                <button
                  key={`quick-${t.id}`}
                  onClick={() => toggleQuickTheme(t.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {t.icon}
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                      {fullLabels[t.id]}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-5 pb-5 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-1/3 py-3 rounded-2xl text-slate-500 text-sm font-semibold hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
          >
            <Check size={14} />
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────
function ProfileModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <ArrowLeft size={13} />
            </button>
            <h3 className="font-bold text-slate-800 text-sm">Perfil del Usuario</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X size={13} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center pt-3 pb-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#0b224d]/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
          )}
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-[#0b224d] text-white">
            {user.role.toUpperCase()}
          </span>
          <h2 className="mt-2 font-bold text-slate-800 text-base text-center px-4">{user.name}</h2>
          <p className="text-xs text-slate-400">{user.email}</p>
          {user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}
        </div>

        {/* Info cards */}
        <div className="px-4 pb-2 space-y-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3">
            <Mail size={15} className="text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3">
              <Phone size={15} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Teléfono</p>
                <p className="text-sm font-semibold text-slate-700">{user.phone}</p>
              </div>
            </div>
          )}
          {/* Rol */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Rol del Sistema</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Nivel de acceso</span>
              <span className="text-sm font-bold text-[#0b224d] px-3 py-1 bg-blue-50 rounded-xl border border-blue-100">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
          {/* Vehículo (conductor only) */}
          {user.role === 'conductor' && user.plateNumber && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Estadísticas del Vehículo</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Placa</p>
                  <p className="text-sm font-bold text-[#0b224d]">{user.plateNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Tipo</p>
                  <p className="text-sm font-bold text-[#0b224d] capitalize">{user.vehicleType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Calificación</p>
                  <p className="text-sm font-bold text-amber-500">★ {user.rating}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Balance</p>
                  <p className="text-sm font-bold text-emerald-600">
                    ${(user.balance || 0).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close */}
        <div className="px-4 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Settings Page ────────────────────────────────────────
export default function Settings({ user, onBack, onLogout, onInstallApp, onShareApp, onTestGamificationModal }: SettingsProps) {
  // Accordion state (null = all sections collapsed by default)
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  // Notification preferences (saved to localStorage)
  const [notifEnabled, setNotifEnabled]   = useState(() => localStorage.getItem('cf_notif_enabled')   !== 'false');
  const [notifPush, setNotifPush]         = useState(() => localStorage.getItem('cf_notif_push')       !== 'false');
  const [notifInApp, setNotifInApp]       = useState(() => localStorage.getItem('cf_notif_inapp')      !== 'false');
  const [notifSound, setNotifSound]       = useState(() => localStorage.getItem('cf_notif_sound')      !== 'false');
  const [notifTone, setNotifTone]         = useState(() => localStorage.getItem('cf_notif_tone')        || 'notif1');

  React.useEffect(() => {
    const handleSync = () => {
      try {
        setNotifEnabled(localStorage.getItem('cf_notif_enabled') !== 'false');
      } catch (e) {}
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('cargoflow:notif-settings-changed', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cargoflow:notif-settings-changed', handleSync);
    };
  }, []);

  // System sounds preferences
  const [sysSoundEnabled, setSysSoundEnabled] = useState(() => localStorage.getItem('cf_sys_sound') !== 'false');
  const [sysToneLogin, setSysToneLogin]       = useState(() => localStorage.getItem('cf_sys_tone_login') || 'cyberpunk');
  const [sysToneLogout, setSysToneLogout]     = useState(() => localStorage.getItem('cf_sys_tone_logout') || 'boomstick');

  // Synthesized UI sound profiles
  const [selectedMenuSound, setSelectedMenuSound] = useState<SoundProfileId>(() => getMenuUiSoundProfile());
  const [selectedGeneralSound, setSelectedGeneralSound] = useState<SoundProfileId>(() => getGeneralUiSoundProfile());

  // Gamification 3D and TTS voice preferences
  const [gamificationAnimEnabled, setGamificationAnimEnabled] = useState(() => localStorage.getItem('cf_gamification_anim_enabled') !== 'false');
  const [voiceGamificationEnabled, setVoiceGamificationEnabled] = useState(() => localStorage.getItem('cf_voice_gamification_enabled') !== 'false');
  const [voiceTogglesEnabled, setVoiceTogglesEnabled] = useState(() => localStorage.getItem('cf_voice_toggles_enabled') !== 'false');

  const handleSelectMenuSound = (id: SoundProfileId) => {
    setSelectedMenuSound(id);
    setMenuUiSoundProfile(id);
    playMenuUiSound(id);
  };

  const handleSelectGeneralSound = (id: SoundProfileId) => {
    setSelectedGeneralSound(id);
    setGeneralUiSoundProfile(id);
    playGeneralUiSound(id);
  };

  // Map Controls position & direction preferences
  const [mapControlsPos, setMapControlsPos] = useState<MapControlsPosition>(() => getMapControlsConfig().position);
  const [mapControlsDir, setMapControlsDir] = useState<MapControlsDirection>(() => getMapControlsConfig().direction);

  const handleMapPosChange = (pos: MapControlsPosition) => {
    setMapControlsPos(pos);
    setMapControlsConfig({ position: pos });
  };

  const handleMapDirChange = (dir: MapControlsDirection) => {
    setMapControlsDir(dir);
    setMapControlsConfig({ direction: dir });
  };

  // Theme
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('cf_theme') || 'dia');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Profile and User management modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);

  const toggle = (section: SectionKey) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Persist notification settings and immediately propagate to App.tsx listener
  const handleNotifToggle = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
    // Dispatch events so other parts of the app react immediately
    try {
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: String(value) }));
      window.dispatchEvent(new CustomEvent('cargoflow:notif-settings-changed', { detail: { key, value } }));
    } catch { /* ignore */ }
    if (key === 'cf_notif_enabled' && value) {
      requestNotificationPermission();
    }
  };

  const NOTIF_TONES = [
    { id: 'notif1', file: 'notification.mp3', label: 'Estándar' },
    { id: 'notif2', file: 'notification-sound.mp3', label: 'Campana' }
  ];

  const SYSTEM_TONES = [
    { id: 'cyberpunk', file: '550332__wax_vibe__cyberpunk-bass.wav', label: 'Cyberpunk' },
    { id: 'rover', file: '565373__the_runner_01__rover-landing.wav', label: 'Rover' },
    { id: 'boomstick', file: '73577__cyberpunk64bit__boomstick.mp3', label: 'Boom' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 pt-20">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex-none bg-white border-b border-slate-100 px-4 pt-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
          CENTRO DE CONTROL
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuración</h1>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-28">
        <div className="bg-white mt-3 mx-3 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

          {/* ── 1. Cuenta y Perfil ─────────────────────────── */}
          <Section title="Cuenta y Perfil" open={openSection === 'cuenta'} onToggle={() => toggle('cuenta')}>
            {/* Mi perfil */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full text-left"
            >
              <SettingRow
                icon={<User size={16} />}
                iconBg="bg-blue-50"
                iconColor="#1d4ed8"
                title="Mi perfil"
                subtitle="Ver foto, nombre, email y teléfono"
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            </button>

            {/* Cambiar contraseña */}
            <SettingRow
              icon={<KeyRound size={16} />}
              iconBg="bg-slate-100"
              iconColor="#94a3b8"
              title="Cambiar contraseña"
              subtitle="Enviar email de recuperación"
              disabled
              action={<ProntoBadge />}
            />

            {/* Rol */}
            <SettingRow
              icon={<Shield size={16} />}
              iconBg="bg-purple-50"
              iconColor="#7c3aed"
              title="Rol de la cuenta"
              subtitle="Nivel de acceso actual"
              action={
                <span className="text-xs font-bold text-[#0b224d] px-2.5 py-1 bg-blue-50 rounded-xl border border-blue-100">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              }
            />

            {/* Vehículo (conductor only) */}
            {user.role === 'conductor' && (
              <SettingRow
                icon={<Truck size={16} />}
                iconBg="bg-emerald-50"
                iconColor="#059669"
                title="Información del vehículo"
                subtitle={user.plateNumber ? `Placa: ${user.plateNumber} • ${user.vehicleType || 'N/A'}` : 'No configurado'}
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            )}
          </Section>

          {/* ── 2. Notificaciones ──────────────────────────── */}
          <Section title="Notificaciones" open={openSection === 'notificaciones'} onToggle={() => toggle('notificaciones')}>
            <SettingRow
              icon={<Bell size={16} />}
              iconBg="bg-amber-50"
              iconColor="#d97706"
              title="Activar Notificaciones"
              subtitle="Permitir alertas locales"
              action={
                <Toggle
                  checked={notifEnabled}
                  target="notification"
                  onChange={(v) => { setNotifEnabled(v); handleNotifToggle('cf_notif_enabled', v); }}
                />
              }
            />
            <SettingRow
              icon={<Smartphone size={16} />}
              iconBg="bg-amber-50"
              iconColor="#d97706"
              title="Notificación Push"
              subtitle="Segundo plano / app cerrada"
              action={
                <Toggle
                  checked={notifPush}
                  onChange={(v) => { setNotifPush(v); handleNotifToggle('cf_notif_push', v); }}
                />
              }
            />
            <SettingRow
              icon={<MessageSquare size={16} />}
              iconBg="bg-amber-50"
              iconColor="#d97706"
              title="Notificación In-App"
              subtitle="Mensajes toast en pantalla"
              action={
                <Toggle
                  checked={notifInApp}
                  onChange={(v) => { setNotifInApp(v); handleNotifToggle('cf_notif_inapp', v); }}
                />
              }
            />
            <SettingRow
              icon={<Volume2 size={16} />}
              iconBg="bg-amber-50"
              iconColor="#d97706"
              title="Sonidos de Notificación"
              subtitle="Tono al recibir alertas"
              action={
                <Toggle
                  checked={notifSound}
                  onChange={(v) => { 
                    setNotifSound(v); 
                    handleNotifToggle('cf_notif_sound', v); 
                    if (v) playNotificationSound(`/sounds/${NOTIF_TONES.find(t=>t.id===notifTone)?.file || 'notification.mp3'}`);
                  }}
                />
              }
            />
            {/* Tone selector for Notifications */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tono de Alerta
              </p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {NOTIF_TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      setNotifTone(tone.id);
                      localStorage.setItem('cf_notif_tone', tone.id);
                      localStorage.setItem('cf_notif_tone_file', tone.file);
                      if (notifSound) playNotificationSound(`/sounds/${tone.file}`);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border capitalize ${
                      notifTone === tone.id
                        ? 'bg-[#0b224d] text-white border-[#0b224d]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <SettingRow
              icon={<Volume2 size={16} />}
              iconBg="bg-blue-50"
              iconColor="#1d4ed8"
              title="Sonidos de Sistema"
              subtitle="Inicio y cierre de sesión"
              action={
                <Toggle
                  checked={sysSoundEnabled}
                  onChange={(v) => { 
                    setSysSoundEnabled(v); 
                    localStorage.setItem('cf_sys_sound', String(v));
                    if (v) playNotificationSound('/sounds/550332__wax_vibe__cyberpunk-bass.wav');
                  }}
                />
              }
            />
            {/* Tone selector for System - Login */}
            <div className="px-4 py-3 border-b border-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tono de Inicio de Sesión
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {SYSTEM_TONES.map((tone) => (
                  <button
                    key={`login-${tone.id}`}
                    onClick={() => {
                      setSysToneLogin(tone.id);
                      localStorage.setItem('cf_sys_tone_login', tone.id);
                      localStorage.setItem('cf_sys_tone_file_login', tone.file);
                      if (sysSoundEnabled) playNotificationSound(`/sounds/${tone.file}`);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border capitalize ${
                      sysToneLogin === tone.id
                        ? 'bg-[#0b224d] text-white border-[#0b224d]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone selector for System - Logout */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tono de Cierre de Sesión
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {SYSTEM_TONES.map((tone) => (
                  <button
                    key={`logout-${tone.id}`}
                    onClick={() => {
                      setSysToneLogout(tone.id);
                      localStorage.setItem('cf_sys_tone_logout', tone.id);
                      localStorage.setItem('cf_sys_tone_file_logout', tone.file);
                      if (sysSoundEnabled) playNotificationSound(`/sounds/${tone.file}`);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border capitalize ${
                      sysToneLogout === tone.id
                        ? 'bg-[#0b224d] text-white border-[#0b224d]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── 2.1. Sonidos de Interfaz (Sintetizados) ──────── */}
          <Section title="Sonidos de Interfaz (Sintetizados Web Audio)" open={openSection === 'sonidos'} onToggle={() => toggle('sonidos')}>
            {/* Control 1: Menú Inferior */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <span>📱</span> Menú Inferior
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {SOUND_PROFILES.find(p => p.id === selectedMenuSound)?.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedMenuSound}
                  onChange={(e) => handleSelectMenuSound(e.target.value as SoundProfileId)}
                  className="p-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b224d]"
                >
                  {SOUND_PROFILES.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playMenuUiSound(selectedMenuSound)}
                  title="Probar sonido"
                  className="px-2.5 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-xs font-bold flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Control 2: Botones e Interfaz General */}
            <div className="p-4 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <span>🔘</span> Botones y Acciones General
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {SOUND_PROFILES.find(p => p.id === selectedGeneralSound)?.desc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedGeneralSound}
                  onChange={(e) => handleSelectGeneralSound(e.target.value as SoundProfileId)}
                  className="p-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0b224d]"
                >
                  {SOUND_PROFILES.map(p => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playGeneralUiSound(selectedGeneralSound)}
                  title="Probar sonido"
                  className="px-2.5 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-xs font-bold flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
            </div>
          </Section>

          {/* ── 2.4 Gamificación y Efectos 3D (Mario Bros / Temu) ───────────────── */}
          <Section title="Gamificación y Efectos 3D" open={openSection === 'gamificacion'} onToggle={() => toggle('gamificacion')}>
            {/* Control Toggles */}
            <SettingRow
              icon={<Sparkles size={16} />}
              iconBg="bg-amber-50"
              iconColor="#d97706"
              title="Animaciones 3D y Confeti"
              subtitle="Efectos visuales de recompensas y lluvia de confeti"
              action={
                <Toggle
                  checked={gamificationAnimEnabled}
                  label="Animaciones 3D y Confeti"
                  target="anim_toggle"
                  onChange={(v) => {
                    setGamificationAnimEnabled(v);
                    localStorage.setItem('cf_gamification_anim_enabled', String(v));
                  }}
                />
              }
            />

            <SettingRow
              icon={<Volume2 size={16} />}
              iconBg="bg-purple-50"
              iconColor="#9333ea"
              title="Voces de Gamificación y Calificación"
              subtitle="Lectura por voz nativa en español al recibir o dar estrellas"
              action={
                <Toggle
                  checked={voiceGamificationEnabled}
                  label="Voces de Gamificación y Calificación"
                  onChange={(v) => {
                    setVoiceGamificationEnabled(v);
                    localStorage.setItem('cf_voice_gamification_enabled', String(v));
                  }}
                />
              }
            />

            <SettingRow
              icon={<Volume2 size={16} />}
              iconBg="bg-indigo-50"
              iconColor="#4f46e5"
              title="Voces de Estado y Toggles"
              subtitle="Lectura por voz corta (Activado / Desactivado) al cambiar opciones"
              action={
                <Toggle
                  checked={voiceTogglesEnabled}
                  label="Voces de Estado y Toggles"
                  onChange={(v) => {
                    setVoiceTogglesEnabled(v);
                    localStorage.setItem('cf_voice_toggles_enabled', String(v));
                  }}
                />
              }
            />

            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-b border-t border-amber-200/50">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Sparkles size={16} className="text-amber-600" />
                Probador de Recompensas & Animaciones 3D
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Prueba las animaciones tridimensionales estilo Mario Bros / Temu con físicas de partículas parabólicas, audio nativo y voz TTS.
              </p>
            </div>

            {/* Test Receiver Animation */}
            <div className="p-3.5 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  🏆
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Animación Ganar Estrellas (Receptor)</p>
                  <p className="text-[10px] text-slate-400">Modal 3D + Partículas + Voz + Vuelo a Header</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onTestGamificationModal) {
                    onTestGamificationModal('receiver');
                  } else {
                    playGamificationFanfare();
                    speakVoiceConfirmation('¡Felicidades! Has ganado 5 estrellas de calificación.');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Probar 3D
              </button>
            </div>

            {/* Test Sender Animation */}
            <div className="p-3.5 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  ⭐
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Animación Calificación Enviada (Emisor)</p>
                  <p className="text-[10px] text-slate-400">Feedback positivo al enviar estrellas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onTestGamificationModal) {
                    onTestGamificationModal('sender');
                  } else {
                    playGamificationFanfare();
                    speakVoiceConfirmation('¡Gracias por calificar la experiencia!');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Probar Feedback
              </button>
            </div>

            {/* Test Pure Fanfare Audio */}
            <div className="p-3.5 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  🎵
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Fanfarria Triunfal (Web Audio API)</p>
                  <p className="text-[10px] text-slate-400">Secuencia armónica de 4 notas sintetizadas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => playGamificationFanfare()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                ▶ Escuchar
              </button>
            </div>

            {/* Test Mario Bros Coin Sound */}
            <div className="p-3.5 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-xs">
                  🪙
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Chime de Monedas (Estilo Mario Bros)</p>
                  <p className="text-[10px] text-slate-400">Efecto Si5 -&gt; Mi6 al reclamar recompensa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => playCoinClaimSound()}
                className="px-3 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                ▶ Escuchar
              </button>
            </div>

            {/* Test Voice TTS */}
            <div className="p-3.5 border-b border-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                  🗣️
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Confirmación de Voz Nativa (TTS)</p>
                  <p className="text-[10px] text-slate-400">Voz nativa en español de Colombia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => speakVoiceConfirmation('¡Felicidades! Has ganado 5 estrellas de calificación en CargoFlow.')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                ▶ Probar Voz
              </button>
            </div>

            {/* Test Confetti Rain Overlay (Matching screenshot) */}
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-xs">
                  ✨
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Lluvia de Confeti (Toggle / Estado)</p>
                  <p className="text-[10px] text-slate-400">Partículas cayendo hasta hacer clic para continuar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('cargoflow:toggle-confetti', {
                    detail: {
                      title: 'Actualización exitosa.',
                      subtitle: 'Has cambiado el estado del toggle correctamente',
                      statusText: '🌟 Estado Actualizado Exitosamente',
                      activated: true,
                    }
                  }));
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Probar Lluvia
              </button>
            </div>
          </Section>

          {/* ── 2.5 Gestión (Only for Admin) ───────────────── */}
          {user.role === 'admin' && (
            <Section title="Gestión" open={openSection === 'gestion'} onToggle={() => toggle('gestion')}>
              <button
                onClick={() => setShowUserManagementModal(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors border-b border-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Shield size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Gestión de Usuarios</p>
                    <p className="text-xs text-slate-400">Ver historial y cambiar roles</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            </Section>
          )}

          {/* ── 3. Apariencia ──────────────────────────────── */}
          <Section title="Apariencia" open={openSection === 'apariencia'} onToggle={() => toggle('apariencia')}>
            <button className="w-full text-left" onClick={() => setShowThemeModal(true)}>
              <SettingRow
                icon={<Palette size={16} />}
                iconBg="bg-pink-50"
                iconColor="#ec4899"
                title="Temas"
                subtitle={`Tema activo: ${activeTheme === 'dia' ? 'Día' : 'Cyber'}`}
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            </button>
            <SettingRow
              icon={<FileText size={16} />}
              iconBg="bg-slate-100"
              iconColor="#94a3b8"
              title="Tamaño de texto"
              subtitle="Compacto / Normal / Grande"
              disabled
              action={<ProntoBadge />}
            />
          </Section>

          {/* ── 3.5. Controles del Mapa ─────────────────────── */}
          <Section title="Controles del Mapa" open={openSection === 'mapa'} onToggle={() => toggle('mapa')}>
            {/* Ubicación del botón flotante */}
            <div className="px-4 py-3.5 border-b border-slate-50">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
                <span>📍</span> Ubicación del Menú Flotante
              </p>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Lado de la pantalla donde se sitúa el botón del mapa
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMapPosChange('right')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    mapControlsPos === 'right'
                      ? 'bg-[#0b224d] text-white border-[#0b224d] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>Lado Derecho</span>
                  {mapControlsPos === 'right' && <Check size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleMapPosChange('left')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    mapControlsPos === 'left'
                      ? 'bg-[#0b224d] text-white border-[#0b224d] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>Lado Izquierdo</span>
                  {mapControlsPos === 'left' && <Check size={14} />}
                </button>
              </div>
            </div>

            {/* Dirección de despliegue */}
            <div className="px-4 py-3.5">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
                <span>↕️</span> Dirección de Despliegue
              </p>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Orientación del menú al presionar el botón flotante
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMapDirChange('vertical')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    mapControlsDir === 'vertical'
                      ? 'bg-[#0b224d] text-white border-[#0b224d] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>Vertical (Columna)</span>
                  {mapControlsDir === 'vertical' && <Check size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleMapDirChange('horizontal')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    mapControlsDir === 'horizontal'
                      ? 'bg-[#0b224d] text-white border-[#0b224d] shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>Horizontal (Fila)</span>
                  {mapControlsDir === 'horizontal' && <Check size={14} />}
                </button>
              </div>
            </div>
          </Section>

          {/* ── 4. Información y Soporte ───────────────────── */}
          <Section title="Información y Soporte" open={openSection === 'info'} onToggle={() => toggle('info')}>
            <a
              href="https://wa.me/573000000000?text=Hola,%20necesito%20soporte%20en%20CargoFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <SettingRow
                icon={<HelpCircle size={16} />}
                iconBg="bg-emerald-50"
                iconColor="#059669"
                title="Centro de Ayuda"
                subtitle="Soporte vía WhatsApp"
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            </a>
            <button className="w-full text-left" onClick={onInstallApp}>
              <SettingRow
                icon={<Download size={16} />}
                iconBg="bg-blue-50"
                iconColor="#1d4ed8"
                title="Instalar App"
                subtitle="Añadir a pantalla de inicio"
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            </button>
            <button className="w-full text-left" onClick={onShareApp}>
              <SettingRow
                icon={<Share2 size={16} />}
                iconBg="bg-blue-50"
                iconColor="#1d4ed8"
                title="Compartir App"
                subtitle="Enviar enlace de CargoFlow"
                action={<ChevronRight size={15} className="text-slate-300" />}
              />
            </button>
            <SettingRow
              icon={<Car size={16} />}
              iconBg="bg-slate-100"
              iconColor="#64748b"
              title="Versión"
              subtitle="CargoFlow PWA"
              action={<span className="text-xs font-bold text-slate-400">v1.0.0</span>}
            />
          </Section>

          {/* ── 5. Datos y Privacidad ──────────────────────── */}
          <Section
            title="Datos y Privacidad"
            open={openSection === 'privacidad'}
            onToggle={() => toggle('privacidad')}
            danger
          >
            <SettingRow
              icon={<Download size={16} />}
              iconBg="bg-slate-100"
              iconColor="#64748b"
              title="Exportar mis datos"
              subtitle="Descargar CSV o JSON"
              disabled
              action={<ProntoBadge />}
            />
            <SettingRow
              icon={<Trash2 size={16} />}
              iconBg="bg-orange-50"
              iconColor="#ea580c"
              title="Eliminar todos los datos"
              subtitle="Borrar historial pero mantener cuenta"
              disabled
              action={<ProntoBadge />}
            />
            <SettingRow
              icon={<AlertTriangle size={16} />}
              iconBg="bg-red-50"
              iconColor="#dc2626"
              title="Eliminar cuenta"
              subtitle="Acción irreversible"
              danger
              disabled
              action={<ProntoBadge />}
            />
          </Section>
        </div>

        {/* ── Cerrar Sesión ─────────────────────────────────── */}
        <div className="mx-3 mt-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center">
              <LogOut size={16} className="text-red-500" />
            </div>
            <span className="font-semibold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
        )}
        {showUserManagementModal && (
          <UserManagementModal onClose={() => setShowUserManagementModal(false)} />
        )}
        {showThemeModal && (
          <ThemeModal
            active={activeTheme}
            onClose={() => setShowThemeModal(false)}
            onSave={(t) => {
              setActiveTheme(t);
              localStorage.setItem('cf_theme', t);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
