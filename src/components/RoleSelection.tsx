import { useState } from 'react';
import { Package, Car, CheckCircle2, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  onNavigateToLogin: () => void;
}

export default function RoleSelection({ onRoleSelect, onNavigateToLogin }: RoleSelectionProps) {
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selected) {
      onRoleSelect(selected);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased">
      {/* Top Brand Area */}
      <header className="w-full flex justify-between items-center py-6 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <Truck className="text-primary-container" size={28} fill="currentColor" />
          <span className="text-2xl font-extrabold text-primary-container tracking-tight">CargoFlow</span>
        </div>
        <button 
          onClick={onNavigateToLogin}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Iniciar sesión
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 w-full max-w-3xl mx-auto">
        <div className="text-center mb-8 w-full">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight"
          >
            ¿Cómo usarás CargoFlow?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-outline"
          >
            Selecciona tu perfil para personalizar tu experiencia.
          </motion.p>
        </div>

        {/* Role Selection Grid */}
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          {/* Card 1: Client */}
          <button
            onClick={() => setSelected('cliente')}
            className={`flex-1 border-2 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-container/30 ${
              selected === 'cliente'
                ? 'border-primary-container bg-blue-50/50 shadow-[0px_8px_30px_rgba(30,94,255,0.12)] scale-[1.02]'
                : 'border-outline-variant bg-surface-container-lowest hover:shadow-lg hover:border-outline shadow-[0px_4px_20px_rgba(0,0,0,0.03)]'
            }`}
            type="button"
          >
            <div className={`mb-6 p-4 rounded-full transition-transform ${
              selected === 'cliente' ? 'text-primary-container scale-110' : 'text-outline'
            }`}>
              <Package size={56} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Soy cliente</h2>
            <p className="text-sm text-outline mt-2 text-center max-w-[200px]">
              Quiero enviar carga y rastrear mis despachos.
            </p>
            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
              selected === 'cliente' ? 'opacity-100' : 'opacity-0'
            }`}>
              <CheckCircle2 className="text-primary-container" fill="currentColor" size={24} stroke="white" />
            </div>
          </button>

          {/* Card 2: Driver */}
          <button
            onClick={() => setSelected('conductor')}
            className={`flex-1 border-2 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-container/30 ${
              selected === 'conductor'
                ? 'border-primary-container bg-blue-50/50 shadow-[0px_8px_30px_rgba(30,94,255,0.12)] scale-[1.02]'
                : 'border-outline-variant bg-surface-container-lowest hover:shadow-lg hover:border-outline shadow-[0px_4px_20px_rgba(0,0,0,0.03)]'
            }`}
            type="button"
          >
            <div className={`mb-6 p-4 rounded-full transition-transform ${
              selected === 'conductor' ? 'text-primary-container scale-110' : 'text-outline'
            }`}>
              <Car size={56} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Soy conductor</h2>
            <p className="text-sm text-outline mt-2 text-center max-w-[200px]">
              Quiero encontrar cargas y gestionar mis viajes.
            </p>
            {/* Selection Indicator */}
            <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
              selected === 'conductor' ? 'opacity-100' : 'opacity-0'
            }`}>
              <CheckCircle2 className="text-primary-container" fill="currentColor" size={24} stroke="white" />
            </div>
          </button>
        </div>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="w-full bg-white p-6 pb-8 flex justify-center shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 border-t border-surface-container-low">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`w-full max-w-md h-[56px] rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center transition-all duration-300 ${
            selected
              ? 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] shadow-md cursor-pointer'
              : 'bg-surface-variant text-outline cursor-not-allowed opacity-60'
          }`}
          id="continueBtn"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
