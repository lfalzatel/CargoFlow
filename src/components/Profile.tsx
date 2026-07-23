import React, { useState } from 'react';
import { Edit2, Star, Plus, CreditCard, HelpCircle, Settings, LogOut, Check, X, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdateProfile: (name: string, vehiclePlate?: string) => void;
  onDeposit: (amount: number) => void;
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export default function Profile({ user, onUpdateProfile, onDeposit, onLogout, onNavigateToSettings }: ProfileProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('200000');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPlate, setEditPlate] = useState(user.plateNumber || '');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      onDeposit(amt);
      setShowDepositModal(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim()) {
      onUpdateProfile(editName, editPlate);
      setShowEditModal(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-[88px] pt-20 font-sans antialiased">
      <main className="px-6 max-w-lg mx-auto flex flex-col gap-6">
        
        {/* Profile Header Section */}
        <section className="flex flex-col items-center justify-center pt-6 pb-4">
          <div className="relative">
            {user.photoURL && user.photoURL.startsWith('http') && !user.photoURL.includes('unsplash') ? (
              <img
                className="w-24 h-24 rounded-full object-cover shadow-[0px_4px_20px_rgba(0,0,0,0.08)] ring-4 ring-white"
                alt={user.name || 'Foto de Perfil'}
                src={user.photoURL}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md ring-4 ring-white uppercase">
                {(user.name || 'Usuario').split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            <button 
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-0 right-0 bg-primary-container text-white rounded-full p-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <Edit2 size={12} strokeWidth={2.5} />
            </button>
          </div>

          <h1 className="mt-4 text-xl font-extrabold text-on-surface tracking-tight">{user.name}</h1>
          
          <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-surface-container-high rounded-full border border-surface-container-highest">
            <span className="text-xs font-bold text-on-surface-variant capitalize">
              {user.role === 'conductor' ? 'Conductor Verificado' : 'Cliente VIP'}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <Star size={12} className="text-amber-500" fill="currentColor" />
            <span className="text-xs font-bold text-on-surface">{user.rating}</span>
          </div>

          <button 
            onClick={() => setShowEditModal(true)}
            className="mt-5 px-6 py-2.5 rounded-xl border-2 border-primary-container text-primary-container hover:bg-primary-container hover:text-white font-bold text-xs active:scale-95 transition-all w-full sm:w-auto cursor-pointer flex items-center justify-center gap-1.5"
          >
            Editar Perfil
          </button>
        </section>

        {/* Wallet / Billetera Bento Card */}
        <section className="mb-2">
          <div className="bg-primary-container text-white rounded-2xl p-6 shadow-[0px_8px_30px_rgba(30,94,255,0.12)] relative overflow-hidden">
            {/* Decorative blurs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wider mb-1">
                  Saldo Disponible
                </p>
                <p className="text-3xl font-black tracking-tight">
                  $ {user.balance.toLocaleString('es-CO')} <span className="text-sm font-semibold text-blue-100 opacity-90 ml-1">COP</span>
                </p>
              </div>
              <button 
                onClick={() => setShowDepositModal(true)}
                className="bg-white text-primary-container rounded-full p-2.5 hover:bg-surface-container-low transition-colors shadow-sm focus:outline-none active:scale-95 cursor-pointer"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </section>

        {/* Driver Details (If conductor role) */}
        {user.role === 'conductor' && user.plateNumber && (
          <section className="bg-white rounded-2xl p-5 border border-surface-container shadow-[0px_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Detalle de Vehículo</h3>
            <div className="flex justify-between items-center bg-surface p-3.5 rounded-xl border border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-primary-container p-2 rounded-lg">
                  <Truck size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-on-surface">
                    {user.vehicleType === 'furgon' ? 'Vehículo Furgón' : 'Camión Sencillo'}
                  </p>
                  <p className="text-[11px] text-outline font-medium">SOAT, Licencia y Cédula Verificados</p>
                </div>
              </div>
              <span className="text-sm font-black px-3 py-1 bg-white border border-outline-variant rounded-md tracking-wider uppercase">
                {user.plateNumber}
              </span>
            </div>
          </section>
        )}

        {/* Navigation Grid */}
        <section className="flex flex-col gap-2">
          {/* Payment Methods */}
          <button 
            onClick={() => alert('Métodos de Pago: Visa **** 5678, Bancolombia, Efectivo.')}
            className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-surface-container hover:bg-surface-container-low transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <CreditCard size={18} />
              </div>
              <span className="text-sm font-bold text-on-surface">Métodos de Pago</span>
            </div>
            <span className="text-outline-variant group-hover:text-primary transition-transform group-hover:translate-x-0.5">▶</span>
          </button>

          {/* Help Center */}
          <button 
            onClick={() => alert('Centro de Ayuda CargoFlow. Soporte 24/7 vía Chat.')}
            className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-surface-container hover:bg-surface-container-low transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <HelpCircle size={18} />
              </div>
              <span className="text-sm font-bold text-on-surface">Centro de Ayuda</span>
            </div>
            <span className="text-outline-variant group-hover:text-primary transition-transform group-hover:translate-x-0.5">▶</span>
          </button>

          {/* Settings */}
          <button 
            onClick={() => alert('Ajustes del perfil: Notificaciones de viaje, Idioma Español, Modo Claro.')}
            className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-surface-container hover:bg-surface-container-low transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-white transition-colors">
                <Settings size={18} />
              </div>
              <span className="text-sm font-bold text-on-surface">Ajustes</span>
            </div>
            <span className="text-outline-variant group-hover:text-primary transition-transform group-hover:translate-x-0.5">▶</span>
          </button>
        </section>

        {/* Logout Section */}
        <section className="mt-4">
          <button 
            onClick={onLogout}
            className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.02)] border border-surface-container hover:bg-red-50 text-red-600 hover:border-red-200 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <LogOut size={18} />
              </div>
              <span className="text-sm font-extrabold">Cerrar Sesión</span>
            </div>
          </button>
        </section>

      </main>

      {/* DEPOSIT WALLET MODAL */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-surface-container"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-on-surface">Recargar Billetera</h3>
                <button onClick={() => setShowDepositModal(false)} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Monto a Depositar (COP)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm font-extrabold focus:outline-none focus:border-primary-container"
                    placeholder="200000"
                    min="10000"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['50000', '100000', '500000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(val)}
                      className="py-1.5 px-3 bg-surface border border-outline-variant hover:border-primary-container rounded-lg text-xs font-bold text-on-surface transition-colors"
                    >
                      +${parseFloat(val).toLocaleString('es-CO')}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full h-11 bg-[#1E5EFF] text-white font-bold rounded-xl mt-2 flex items-center justify-center shadow-md hover:bg-primary transition-all cursor-pointer"
                >
                  Confirmar Recarga
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-surface-container"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-on-surface">Editar Perfil</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nombre Completo</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm font-semibold focus:outline-none focus:border-primary-container"
                    required
                  />
                </div>

                {user.role === 'conductor' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Placa de Vehículo</label>
                    <input
                      type="text"
                      value={editPlate}
                      onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                      className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant text-sm font-bold uppercase focus:outline-none focus:border-primary-container animate-pulse-once"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-11 bg-[#1E5EFF] text-white font-bold rounded-xl mt-2 flex items-center justify-center shadow-md hover:bg-primary transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
