import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, ChevronRight,
  User, Bell, Palette, Shield, Info, Truck,
  Phone, Mail, KeyRound, Car, FileText,
  Volume2, Smartphone, MessageSquare, Download,
  Share2, HelpCircle, Trash2, LogOut, Sun, Monitor,
  X, Check, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import {
  requestNotificationPermission,
  playNotificationSound,
} from '../services/notificationService';

// ── Types ────────────────────────────────────────────────────
interface SettingsProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onInstallApp: () => void;
  onShareApp: () => void;
}

type SectionKey = 'cuenta' | 'notificaciones' | 'vehiculo' | 'apariencia' | 'info' | 'privacidad';

// ── Toggle component ─────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
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
        <p className={`text-sm font-semibold leading-tight ${danger ? 'text-red-500' : 'text-slate-800'}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{subtitle}</p>
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
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <span
          className={`text-sm font-bold tracking-tight ${
            danger ? 'text-red-500' : 'text-slate-700'
          }`}
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={16} className={danger ? 'text-red-400' : 'text-slate-400'} />
        ) : (
          <ChevronDown size={16} className={danger ? 'text-red-400' : 'text-slate-400'} />
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
            <div className="mx-3 mb-3 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
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
  const themes = [
    { id: 'dia',   label: 'Día',       icon: <Sun size={22} /> },
    { id: 'cyber', label: 'Cyber',     icon: <Monitor size={22} /> },
  ];

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Palette size={20} className="text-[#0b224d]" />
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

        {/* Theme grid */}
        <div className="px-5 pb-4">
          <p className="text-xs font-bold text-slate-600 mb-3">Tema Visual Activo</p>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                  selected === t.id
                    ? 'border-[#0b224d] bg-blue-50 text-[#0b224d]'
                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                }`}
              >
                {t.icon}
                <span className={`text-xs font-bold ${selected === t.id ? 'text-[#0b224d]' : 'text-slate-600'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onSave(selected); onClose(); }}
            className="flex-1 py-3 rounded-2xl bg-[#0b224d] text-white text-sm font-bold flex items-center justify-center gap-1.5"
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
            {user.role === 'conductor' ? 'CONDUCTOR' : 'CLIENTE'}
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
                {user.role === 'conductor' ? 'Conductor' : 'Cliente'}
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
export default function Settings({ user, onBack, onLogout, onInstallApp, onShareApp }: SettingsProps) {
  // Accordion state
  const [openSection, setOpenSection] = useState<SectionKey | null>('cuenta');

  // Notification preferences (saved to localStorage)
  const [notifEnabled, setNotifEnabled]   = useState(() => localStorage.getItem('cf_notif_enabled')   !== 'false');
  const [notifPush, setNotifPush]         = useState(() => localStorage.getItem('cf_notif_push')       !== 'false');
  const [notifInApp, setNotifInApp]       = useState(() => localStorage.getItem('cf_notif_inapp')      !== 'false');
  const [notifSound, setNotifSound]       = useState(() => localStorage.getItem('cf_notif_sound')      !== 'false');
  const [notifTone, setNotifTone]         = useState(() => localStorage.getItem('cf_notif_tone')        || 'cyberpunk');

  // Theme
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('cf_theme') || 'dia');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggle = (section: SectionKey) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Persist notification settings
  const handleNotifToggle = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
    if (key === 'cf_notif_enabled' && value) {
      requestNotificationPermission();
    }
    if (key === 'cf_notif_sound' && value) {
      playNotificationSound('/sounds/550332__wax_vibe__cyberpunk-bass.wav');
    }
  };

  const TONES = ['cyberpunk', 'suave', 'campana'];

  return (
    <div className="flex flex-col h-full bg-slate-50">
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
      <div className="flex-1 overflow-y-auto pb-28">
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
                  {user.role === 'conductor' ? 'Conductor' : 'Cliente'}
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
              title="Efecto de Sonido"
              subtitle="Reproducir tono al recibir alertas"
              action={
                <Toggle
                  checked={notifSound}
                  onChange={(v) => { setNotifSound(v); handleNotifToggle('cf_notif_sound', v); }}
                />
              }
            />
            {/* Tone selector */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tono de Alerta
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => {
                      setNotifTone(tone);
                      localStorage.setItem('cf_notif_tone', tone);
                      playNotificationSound('/sounds/550332__wax_vibe__cyberpunk-bass.wav');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border capitalize ${
                      notifTone === tone
                        ? 'bg-[#0b224d] text-white border-[#0b224d]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </Section>

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
      </AnimatePresence>

      <AnimatePresence>
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
