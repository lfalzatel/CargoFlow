import React, { useState } from 'react';
import { Star, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface RatingProps {
  driverName?: string;
  tripId?: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function Rating({ driverName = 'Carlos Rodríguez', tripId = '#CF-8842', onClose, onSubmit }: RatingProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>(['Puntual', 'Cuidado de la Carga']);
  const [submitted, setSubmitted] = useState(false);

  const availableTags = ['Puntual', 'Cuidado de la Carga', 'Buena comunicación', 'Amable', 'Conducción segura'];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(rating, comment);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-surface-container flex flex-col items-center text-center space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-outline hover:text-on-surface rounded-full hover:bg-surface-container-low transition-colors"
        >
          <X size={20} />
        </button>

        {/* Profile Avatar */}
        <div className="relative mt-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaVqRCs3Sd6gJvISf50cSCmx0gy6bYEvm1R0IzY4p64VNvfe1-3MIdU67GvSNK95J1--2vNcWvxnrIq8iCD-iHT1D8hQ7XtZaehyM01PAqzIOpnvfjJaYX0RRdOKnv96PNPbSoA0WCXp4x_h7jmJ4ihCCgJ8Z8drczuCJb_JVBDIY5LL_WCnZNTNXviCXjNodS3ym6pf7GR5ZWc7nUdVM8cc7a6Zs2qvDNwDS_1XEoVjtbFFt-4bF8"
            alt={driverName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
            <Check size={14} strokeWidth={3} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-on-surface">¿Cómo fue tu servicio?</h2>
          <p className="text-xs text-on-surface-variant mt-1">Califica tu viaje {tripId} con {driverName}</p>
        </div>

        {/* Star Rating Selection */}
        <div className="flex gap-2 justify-center my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-transform"
            >
              <Star
                size={36}
                fill={star <= rating ? '#FFB800' : 'transparent'}
                stroke={star <= rating ? '#FFB800' : '#c3c5d9'}
              />
            </button>
          ))}
        </div>

        {/* Quick Tag Badges */}
        <div className="flex flex-wrap gap-2 justify-center max-w-xs">
          {availableTags.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-primary-container border border-primary-container/40'
                    : 'bg-surface-container-low text-on-surface-variant border border-transparent hover:bg-surface-container'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Comment Input */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe un comentario opcional sobre el servicio..."
          rows={3}
          className="w-full p-3 border-2 border-outline-variant rounded-xl text-sm bg-background text-on-surface focus:outline-none focus:border-primary-container transition-all resize-none"
        />

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="w-full h-[52px] bg-primary-container text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-primary transition-all active:scale-[0.98] cursor-pointer"
        >
          {submitted ? '¡Gracias por calificar!' : 'Enviar Calificación'}
        </button>
      </motion.div>
    </div>
  );
}
