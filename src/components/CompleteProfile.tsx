import React, { useState } from 'react';
import { ArrowLeft, Truck, CloudUpload, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CompleteProfileProps {
  initialName: string;
  onComplete: (data: {
    fullName: string;
    idNumber: string;
    plateNumber: string;
    vehicleType: 'furgon' | 'sencillo';
    documents: {
      cedula: boolean;
      licencia: boolean;
      soat: boolean;
      propiedad: boolean;
    };
  }) => void;
  onBack: () => void;
}

export default function CompleteProfile({ initialName, onComplete, onBack }: CompleteProfileProps) {
  const [fullName, setFullName] = useState(initialName || '');
  const [idNumber, setIdNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Furgón Mediano');
  
  // Interactive document uploads!
  const [docs, setDocs] = useState({
    cedula: false,
    licencia: false,
    soat: false,
    propiedad: false,
  });

  const toggleDoc = (docKey: keyof typeof docs) => {
    setDocs(prev => ({
      ...prev,
      [docKey]: !prev[docKey],
    }));
  };

  const isFormValid = fullName && idNumber && plateNumber && docs.cedula && docs.licencia && docs.soat && docs.propiedad;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete({
        fullName,
        idNumber,
        plateNumber: plateNumber.toUpperCase(),
        vehicleType,
        documents: docs,
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans antialiased pb-32">
      {/* Transactional Header */}
      <header className="bg-white sticky top-0 z-40 px-6 h-16 flex items-center justify-between border-b border-surface-container-highest">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-primary-container tracking-tight">CargoFlow</h1>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      {/* Progress Stepper */}
      <div className="bg-white px-6 py-4 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] relative z-30 border-b border-surface-container">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-container">Paso 1 de 3</span>
          <span className="text-xs font-semibold text-on-surface-variant">Info Personal y Vehículo</span>
        </div>
        <div className="flex gap-2 w-full h-1.5">
          <div className="flex-1 bg-primary-container rounded-full"></div>
          <div className="flex-1 bg-surface-container rounded-full"></div>
          <div className="flex-1 bg-surface-container rounded-full"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-on-surface mb-6">Completa tu perfil</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Personal Info Section */}
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-on-surface">Información Personal</h3>
            
            {/* Full Name Input */}
            <div className="relative">
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-white focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
                placeholder=" "
                required
              />
              <label
                htmlFor="fullName"
                className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Nombre Completo
              </label>
            </div>

            {/* ID Number Input */}
            <div className="relative">
              <input
                type="text"
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-white focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
                placeholder=" "
                required
              />
              <label
                htmlFor="idNumber"
                className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Número de Cédula
              </label>
            </div>
          </section>

          <hr className="border-surface-container" />

          {/* Vehicle Info Section */}
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-on-surface">Información del Vehículo</h3>
            
            {/* Vehicle Plate Input */}
            <div className="relative">
              <input
                type="text"
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="peer w-full h-[56px] px-4 pt-5 pb-2 border-2 border-outline-variant rounded-xl text-on-surface bg-white uppercase focus:outline-none focus:border-primary-container transition-all placeholder-transparent"
                placeholder=" "
                required
              />
              <label
                htmlFor="plateNumber"
                className="absolute left-4 top-4 text-outline text-sm transition-all duration-200 pointer-events-none origin-left 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base 
                peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary-container
                peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Placa del Vehículo
              </label>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="vehicleType" className="text-xs font-semibold text-on-surface-variant">Tipo de Vehículo</label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-[56px] px-4 bg-white border-2 border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary-container transition-all font-semibold"
              >
                <option value="Tractomula">Tractomula</option>
                <option value="Camión Sencillo">Camión Sencillo</option>
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
          </section>

          <hr className="border-surface-container" />

          {/* Documents Upload Section */}
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Documentación</h3>
              <p className="text-xs text-on-surface-variant mt-1">Sube fotos de tus documentos. Haz clic para simular la subida.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Document 1: Cedula */}
              <button
                type="button"
                onClick={() => toggleDoc('cedula')}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all relative overflow-hidden group ${
                  docs.cedula
                    ? 'border-green-500 bg-green-50/50 text-green-700'
                    : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low hover:border-primary-container'
                }`}
              >
                {docs.cedula ? (
                  <>
                    <CheckCircle className="text-green-500" size={28} fill="currentColor" stroke="white" />
                    <span className="text-xs font-bold text-center">Cédula<br />Cargada</span>
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-high rounded-full p-2 group-hover:bg-blue-50 group-hover:text-primary-container transition-colors">
                      <CloudUpload size={20} />
                    </div>
                    <span className="text-xs font-bold text-center">Cédula<br />Frontal/Reverso</span>
                  </>
                )}
              </button>

              {/* Document 2: Licencia */}
              <button
                type="button"
                onClick={() => toggleDoc('licencia')}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all relative overflow-hidden group ${
                  docs.licencia
                    ? 'border-green-500 bg-green-50/50 text-green-700'
                    : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low hover:border-primary-container'
                }`}
              >
                {docs.licencia ? (
                  <>
                    <CheckCircle className="text-green-500" size={28} fill="currentColor" stroke="white" />
                    <span className="text-xs font-bold text-center">Licencia de<br />Conducción Cargada</span>
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-high rounded-full p-2 group-hover:bg-blue-50 group-hover:text-primary-container transition-colors">
                      <CloudUpload size={20} />
                    </div>
                    <span className="text-xs font-bold text-center">Licencia de<br />Conducción</span>
                  </>
                )}
              </button>

              {/* Document 3: SOAT */}
              <button
                type="button"
                onClick={() => toggleDoc('soat')}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all relative overflow-hidden group ${
                  docs.soat
                    ? 'border-green-500 bg-green-50/50 text-green-700'
                    : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low hover:border-primary-container'
                }`}
              >
                {docs.soat ? (
                  <>
                    <CheckCircle className="text-green-500" size={28} fill="currentColor" stroke="white" />
                    <span className="text-xs font-bold text-center">SOAT<br />Vigente Cargado</span>
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-high rounded-full p-2 group-hover:bg-blue-50 group-hover:text-primary-container transition-colors">
                      <CloudUpload size={20} />
                    </div>
                    <span className="text-xs font-bold text-center">SOAT<br />Vigente</span>
                  </>
                )}
              </button>

              {/* Document 4: Tarjeta de Propiedad */}
              <button
                type="button"
                onClick={() => toggleDoc('propiedad')}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all relative overflow-hidden group ${
                  docs.propiedad
                    ? 'border-green-500 bg-green-50/50 text-green-700'
                    : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low hover:border-primary-container'
                }`}
              >
                {docs.propiedad ? (
                  <>
                    <CheckCircle className="text-green-500" size={28} fill="currentColor" stroke="white" />
                    <span className="text-xs font-bold text-center">Tarjeta Propiedad<br />Cargada</span>
                  </>
                ) : (
                  <>
                    <div className="bg-surface-container-high rounded-full p-2 group-hover:bg-blue-50 group-hover:text-primary-container transition-colors">
                      <CloudUpload size={20} />
                    </div>
                    <span className="text-xs font-bold text-center">Tarjeta de<br />Propiedad</span>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Fixed Bottom Action Button */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-container-highest p-6 pb-[env(safe-area-inset-bottom,24px)] z-40 max-w-2xl mx-auto flex justify-center">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full font-bold text-base rounded-xl h-[56px] flex items-center justify-center gap-2 transition-all shadow-[0px_4px_14px_rgba(30,94,255,0.15)] ${
                isFormValid
                  ? 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] cursor-pointer'
                  : 'bg-surface-variant text-outline opacity-60 cursor-not-allowed'
              }`}
            >
              Completar Registro
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
