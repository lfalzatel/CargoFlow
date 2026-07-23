import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, CheckCircle, FileText, X } from 'lucide-react';
import { motion } from 'motion/react';

interface DeliveryEvidenceProps {
  tripId: string;
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export default function DeliveryEvidence({ tripId, onBack, onSubmitSuccess }: DeliveryEvidenceProps) {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [remisionUploaded, setRemisionUploaded] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = photoUploaded && remisionUploaded && receivedBy;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess();
    }, 1200);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-surface-container-highest px-4 h-16 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-on-surface">Evidencia de Entrega</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-primary-container/30 rounded-2xl p-4 flex items-center gap-3">
          <FileText className="text-primary-container flex-shrink-0" size={24} />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-container">Envío {tripId}</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Sube las fotos correspondientes para finalizar el viaje y habilitar el pago.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo 1: Cargo Delivery Photo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              1. Foto de la Carga Entregada
            </label>
            <div
              onClick={() => setPhotoUploaded(!photoUploaded)}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                photoUploaded
                  ? 'border-green-500 bg-green-50/50'
                  : 'border-outline-variant hover:border-primary-container bg-white'
              }`}
            >
              {photoUploaded ? (
                <div className="flex flex-col items-center text-green-600 space-y-2">
                  <CheckCircle size={40} />
                  <span className="text-xs font-bold">Foto adjunta con éxito</span>
                  <span className="text-[11px] text-outline">Toca para reemplazar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-outline space-y-2">
                  <Camera size={36} />
                  <span className="text-sm font-semibold text-on-surface">Tomar foto o subir archivo</span>
                  <span className="text-xs text-outline">Formato JPG, PNG (máx. 10MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Photo 2: Remisión Firmada (POD) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
              2. Remisión Firmada / Comprobante (POD)
            </label>
            <div
              onClick={() => setRemisionUploaded(!remisionUploaded)}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                remisionUploaded
                  ? 'border-green-500 bg-green-50/50'
                  : 'border-outline-variant hover:border-primary-container bg-white'
              }`}
            >
              {remisionUploaded ? (
                <div className="flex flex-col items-center text-green-600 space-y-2">
                  <CheckCircle size={40} />
                  <span className="text-xs font-bold">Remisión adjunta con éxito</span>
                  <span className="text-[11px] text-outline">Toca para reemplazar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-outline space-y-2">
                  <Upload size={36} />
                  <span className="text-sm font-semibold text-on-surface">Subir Remisión Firmada</span>
                  <span className="text-xs text-outline">Foto clara de la hoja de remisión</span>
                </div>
              )}
            </div>
          </div>

          {/* Receiver Info */}
          <div className="space-y-2">
            <label htmlFor="receivedBy" className="text-xs font-bold text-on-surface uppercase tracking-wider">
              3. Nombre de quien recibe
            </label>
            <input
              type="text"
              id="receivedBy"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              placeholder="Ej: Roberto Gómez (Jefe de Bodega)"
              className="w-full h-[52px] px-4 border-2 border-outline-variant rounded-xl text-on-surface bg-white focus:outline-none focus:border-primary-container transition-all"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Observaciones (Opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sin novedades en el descargue..."
              rows={3}
              className="w-full p-4 border-2 border-outline-variant rounded-xl text-on-surface bg-white focus:outline-none focus:border-primary-container transition-all resize-none text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full h-[56px] rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center transition-all ${
              isFormValid && !isSubmitting
                ? 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] shadow-md cursor-pointer'
                : 'bg-surface-variant text-outline cursor-not-allowed opacity-60'
            }`}
          >
            {isSubmitting ? 'Finalizando Entrega...' : 'Confirmar Entrega'}
          </button>
        </form>
      </main>
    </div>
  );
}
