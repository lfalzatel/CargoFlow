import { GpsLocationLog, LatLng } from '../../models/mapTypes';
import { offlineStorage } from '../storage/OfflineMapStorage';

export type LocationUpdateListener = (location: LatLng) => void;

export class GpsService {
  private watchId: number | null = null;
  private currentLocation: LatLng = {
    lat: 6.2442, // Medellín default center
    lng: -75.5812,
  };
  private listeners: Set<LocationUpdateListener> = new Set();
  private isTrackingEnabled: boolean = true;
  private simulationIntervalId: any = null;

  constructor() {
    this.startGpsTracking();
  }

  public startGpsTracking(): void {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLoc: LatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            timestamp: position.timestamp,
          };
          this.handleNewLocation(newLoc);
        },
        (error) => {
          console.warn('GPS hardware error or permission denied:', error.message);
          this.startSimulatedGps();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    } else {
      this.startSimulatedGps();
    }
  }

  private startSimulatedGps(): void {
    if (this.simulationIntervalId) return;

    // Simulate realistic vehicle movement around Medellín / Antioquia corridor
    let step = 0;
    this.simulationIntervalId = setInterval(() => {
      step += 0.0003;
      const simulatedLoc: LatLng = {
        lat: 6.2442 + Math.sin(step) * 0.005,
        lng: -75.5812 + Math.cos(step) * 0.005,
        speed: 45 + Math.random() * 10,
        heading: (step * 57.29) % 360,
        accuracy: 5,
        timestamp: Date.now(),
      };
      this.handleNewLocation(simulatedLoc);
    }, 4000);
  }

  private handleNewLocation(location: LatLng): void {
    this.currentLocation = location;
    this.notifyListeners(location);

    if (this.isTrackingEnabled) {
      this.logLocationToStorage(location);
    }
  }

  private async logLocationToStorage(location: LatLng): Promise<void> {
    const now = new Date();
    const logItem: GpsLocationLog = {
      id: `gps_${now.getTime()}_${Math.random().toString(36).substr(2, 5)}`,
      lat: location.lat,
      lng: location.lng,
      speed: location.speed ?? null,
      accuracy: location.accuracy ?? null,
      heading: location.heading ?? null,
      timestamp: location.timestamp || now.getTime(),
      dateIso: now.toISOString(),
      synced: false,
    };

    try {
      await offlineStorage.saveGpsLog(logItem);
    } catch (err) {
      console.error('Error logging GPS coordinate to storage:', err);
    }
  }

  private notifyListeners(location: LatLng): void {
    this.listeners.forEach((listener) => {
      try {
        listener(location);
      } catch (err) {
        console.error('Error in LocationUpdateListener:', err);
      }
    });
  }

  public requestInstantLocation(): Promise<LatLng> {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc: LatLng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              altitude: position.coords.altitude || undefined,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed || 0,
              heading: position.coords.heading || 0,
              timestamp: position.timestamp,
            };
            this.handleNewLocation(loc);
            resolve(loc);
          },
          (error) => {
            console.warn('Instant geolocation request failed, returning current location:', error.message);
            resolve(this.currentLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      } else {
        resolve(this.currentLocation);
      }
    });
  }

  public async reverseGeocode(pos: LatLng): Promise<string> {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.display_name) {
            const parts = data.display_name.split(',');
            const city = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : '');
            return city;
          }
        }
      } catch (e) {
        console.warn('Reverse geocode fetch failed:', e);
      }
    }
    return `Ubicación GPS (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
  }

  public getCurrentLocation(): LatLng {
    return this.currentLocation;
  }

  public subscribe(listener: LocationUpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentLocation);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setTrackingEnabled(enabled: boolean): void {
    this.isTrackingEnabled = enabled;
  }

  public destroy(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
    }
  }
}

export const gpsService = new GpsService();

