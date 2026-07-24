export type UserRole = 'cliente' | 'conductor' | 'admin';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  rating: number;
  balance: number; // in COP
  photoURL?: string;
  plateNumber?: string;
  vehicleType?: string;
  isComplete?: boolean;
  isAvailable?: boolean;
  documentsUploaded?: {
    cedula: boolean;
    licencia: boolean;
    soat: boolean;
    propiedad: boolean;
  };
}

export interface Trip {
  id: string;
  status: 'EN CAMINO' | 'COMPLETADO' | 'PENDIENTE';
  price: number; // in COP
  date: string;
  origin: string;
  originDetail?: string;
  destination: string;
  destinationDetail?: string;
  vehicleType: string;
  tag?: string; // e.g. "REFRIGERADO", "FRÁGIL"
  createdAt?: string;
  clienteId?: string;
  clienteName?: string;
  conductorId?: string;
  conductorName?: string;
  counterOffer?: {
    price: number;
    conductorId: string;
    conductorName: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'driver' | 'user' | 'system';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  isRead?: boolean;
}
