import { LatLng } from '../../models/mapTypes';
import { mapService } from '../../core/MapService';
import { COLOMBIA_LOGISTICS_PLACES } from '../search/SearchCatalog';
import { gpsService } from '../gps/GpsService';

interface SimulatedTruck {
  id: string;
  driverName: string;
  vehicle: string;
  plate: string;
  city: string;
  status: string;
  origin: LatLng;
  destination: LatLng;
  points: LatLng[];
  currentIndex: number;
  direction: 1 | -1;
  completedCycles: number;
  isLocal: boolean;
  isLongTrip: boolean;
  pauseRemainingTicks: number;
  currentStepStatus: string;
}

const DRIVER_CATALOG = [
  { name: 'Carlos Rodríguez', vehicle: 'Moto Carguero AKT 200', plate: 'WYZ-789', city: 'Medellín' },
  { name: 'Diana Morales', vehicle: 'Moto Carguero Ayco 250', plate: 'MNB-654', city: 'Bucaramanga' },
  { name: 'Santiago Ruiz', vehicle: 'Moto Carguero Sigma 200', plate: 'KJH-331', city: 'Cali' },
  { name: 'Andrés López', vehicle: 'Camioneta Pickup Hilux', plate: 'SQR-456', city: 'Bogotá' },
  { name: 'Mateo Ramírez', vehicle: 'Camioneta Nissan Frontier', plate: 'GHJ-902', city: 'Ibagué' },
  { name: 'Camilo Torres', vehicle: 'Camioneta Chevrolet D-Max', plate: 'PXT-441', city: 'Medellín' },
  { name: 'Mauricio Gómez', vehicle: 'Furgón Mediano Chevrolet', plate: 'KLO-123', city: 'Barranquilla' },
  { name: 'Felipe Zapata', vehicle: 'Furgón JAC KR-10', plate: 'ZXC-512', city: 'Cúcuta' },
  { name: 'Gonzalo Silva', vehicle: 'Furgón Hino 300 Express', plate: 'BGT-882', city: 'Bogotá' },
  { name: 'Jorge Vargas', vehicle: 'Turbo Light Foton', plate: 'PLM-321', city: 'Pereira' },
  { name: 'Oscar Beltrán', vehicle: 'Turbo Light JMC Carrying', plate: 'VFR-119', city: 'Cali' },
  { name: 'Javier Mendoza', vehicle: 'Camión Sencillo Hino 500', plate: 'TRX-889', city: 'Cali' },
  { name: 'Ricardo Ramos', vehicle: 'Camión Sencillo Chevrolet FTR', plate: 'LKP-603', city: 'Medellín' },
  { name: 'Hernán Castro', vehicle: 'Tractomula Kenworth T800', plate: 'VBN-774', city: 'Cartagena' },
  { name: 'Esteban Ortiz', vehicle: 'Tractomula International ProStar', plate: 'MNH-951', city: 'Bogotá' },
];

const STATUS_DESCRIPTIONS = [
  'En tránsito por vía principal',
  'En ruta logística de entrega',
  'En semáforo / Tráfico urbano',
  'Cargando mercancía (Centro Logístico)',
  'Descargando en destino final',
  'Disponible para fletes inmediatos',
];

// Compute distance in meters between two coordinates
function getDistanceInMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371000;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Resample street waypoints with custom step spacing (e.g. 35m for long smooth 10min trips)
function resampleWaypoints(rawPoints: LatLng[], stepMeters: number = 35): LatLng[] {
  if (rawPoints.length <= 1) return rawPoints;
  const result: LatLng[] = [rawPoints[0]];
  let prev = rawPoints[0];

  for (let i = 1; i < rawPoints.length; i++) {
    const curr = rawPoints[i];
    const dist = getDistanceInMeters(prev, curr);
    if (dist > stepMeters) {
      const steps = Math.ceil(dist / stepMeters);
      for (let s = 1; s <= steps; s++) {
        const ratio = s / steps;
        result.push({
          lat: prev.lat + (curr.lat - prev.lat) * ratio,
          lng: prev.lng + (curr.lng - prev.lng) * ratio,
        });
      }
    } else {
      result.push(curr);
    }
    prev = curr;
  }
  return result;
}

// Generate dense street points using OSRM driving API with fallback
async function fetchRealStreetRoute(origin: LatLng, destination: LatLng, isLongTrip: boolean = false): Promise<LatLng[]> {
  const stepSpacing = isLongTrip ? 30 : 45;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        const coords: [number, number][] = data.routes[0].geometry.coordinates;
        const streetPoints: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
        return resampleWaypoints(streetPoints, stepSpacing);
      }
    }
  } catch (err) {
    console.warn('OSRM route fetch fallback triggered', err);
  }

  // Fallback path with smooth curves if OSRM is offline
  const fallbackPoints: LatLng[] = [];
  const steps = isLongTrip ? 60 : 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curveOffset = Math.sin(t * Math.PI) * (isLongTrip ? 0.012 : 0.007);
    fallbackPoints.push({
      lat: origin.lat + (destination.lat - origin.lat) * t + curveOffset,
      lng: origin.lng + (destination.lng - origin.lng) * t - curveOffset * 0.4,
    });
  }
  return resampleWaypoints(fallbackPoints, stepSpacing);
}

class FleetSimulationService {
  private trucks: Map<string, SimulatedTruck> = new Map();
  private movementTimer: ReturnType<typeof setInterval> | null = null;
  private lifecycleTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private isViewActive: boolean = false;
  private userLocation: LatLng = { lat: 6.2442, lng: -75.5812 }; // Default Medellín center
  private unsubscribeGps: (() => void) | null = null;

  public async start(): Promise<void> {
    this.isViewActive = true;

    // Subscribe to live user GPS location
    if (!this.unsubscribeGps) {
      this.unsubscribeGps = gpsService.subscribe((loc) => {
        if (loc && loc.lat && loc.lng) {
          this.userLocation = loc;
        }
      });
    }

    // Ensure background movement & lifecycle timers are running
    this.ensureTimersRunning();

    // First time initialization: spawn 11-12 trucks nationally (including at least 3-4 local to user)
    if (this.trucks.size === 0) {
      for (let i = 0; i < 11; i++) {
        await this.spawnTruck(i < 4); // First 4 are local to user's location
      }
    }

    // Immediately sync up-to-date real-time vehicle positions on map view
    this.syncAllMarkersToMap();
  }

  private ensureTimersRunning(): void {
    if (!this.isRunning) {
      this.isRunning = true;
    }

    if (!this.movementTimer) {
      this.movementTimer = setInterval(() => {
        this.stepFleet();
      }, 1800);
    }

    if (!this.lifecycleTimer) {
      this.lifecycleTimer = setInterval(() => {
        this.manageLifecycle();
      }, 25000);
    }
  }

  private syncAllMarkersToMap(): void {
    for (const truck of this.trucks.values()) {
      try {
        const currentPos = truck.points[truck.currentIndex] || truck.points[0];
        mapService.addMarker({
          id: truck.id,
          position: currentPos,
          title: `${truck.driverName} (${truck.plate})`,
          subtitle: `${truck.vehicle} • ${truck.currentStepStatus || truck.status}`,
          type: 'driver',
          vehicleType: truck.vehicle,
        });
      } catch (e) {
        // ignore if map container temporarily mounting
      }
    }
  }

  private async spawnTruck(forceLocal: boolean = false): Promise<void> {
    const activeDriverNames = new Set(Array.from(this.trucks.values()).map(t => t.driverName));
    const availableDrivers = DRIVER_CATALOG.filter(d => !activeDriverNames.has(d.name));

    if (availableDrivers.length === 0) return;

    const driverSpec = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    const id = `truck-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Determine if this truck is assigned to a 10+ minute extended urban delivery route
    const currentLongTrips = Array.from(this.trucks.values()).filter(t => t.isLongTrip).length;
    const isLongTrip = forceLocal && currentLongTrips === 0;

    let origin: LatLng;
    let destination: LatLng;
    let cityName = driverSpec.city;

    if (forceLocal) {
      cityName = 'Zona Local';
      const angle1 = Math.random() * Math.PI * 2;
      const dist1 = 0.01 + Math.random() * 0.03;
      origin = {
        lat: this.userLocation.lat + Math.sin(angle1) * dist1,
        lng: this.userLocation.lng + Math.cos(angle1) * dist1,
      };

      const angle2 = angle1 + Math.PI * 0.7 + Math.random() * 0.6;
      const dist2 = 0.02 + Math.random() * 0.05;
      destination = {
        lat: this.userLocation.lat + Math.sin(angle2) * dist2,
        lng: this.userLocation.lng + Math.cos(angle2) * dist2,
      };
    } else {
      const place1 = COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];
      let place2 = COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];
      while (place2.id === place1.id) {
        place2 = COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];
      }
      origin = place1.position;
      destination = place2.position;
    }

    const initialStatus = STATUS_DESCRIPTIONS[Math.floor(Math.random() * STATUS_DESCRIPTIONS.length)];
    const routePoints = await fetchRealStreetRoute(origin, destination, isLongTrip);

    const truck: SimulatedTruck = {
      id,
      driverName: driverSpec.name,
      vehicle: driverSpec.vehicle,
      plate: driverSpec.plate,
      city: cityName,
      status: initialStatus,
      origin,
      destination,
      points: routePoints,
      currentIndex: 0,
      direction: 1,
      completedCycles: 0,
      isLocal: forceLocal,
      isLongTrip,
      pauseRemainingTicks: 0,
      currentStepStatus: initialStatus,
    };

    this.trucks.set(id, truck);

    if (this.isViewActive) {
      try {
        mapService.addMarker({
          id: truck.id,
          position: truck.points[0],
          title: `${truck.driverName} (${truck.plate})`,
          subtitle: `${truck.vehicle} • ${truck.city} (${truck.status})`,
          type: 'driver',
          vehicleType: truck.vehicle,
        });
      } catch (e) {
        // ignore
      }
    }
  }

  private despawnTruck(id: string): void {
    const truck = this.trucks.get(id);
    if (!truck) return;

    if (this.isViewActive) {
      try {
        mapService.removeMarker(id);
      } catch (e) {
        console.warn('despawnTruck error:', e);
      }
    }
    this.trucks.delete(id);
  }

  private stepFleet(): void {
    for (const [id, truck] of this.trucks.entries()) {
      if (truck.points.length <= 1) continue;

      // Handle semáforo / cargo loading pauses for long-trip vehicle to pace it to +10 minutes
      if (truck.pauseRemainingTicks > 0) {
        truck.pauseRemainingTicks -= 1;
        if (this.isViewActive) {
          try {
            mapService.addMarker({
              id: truck.id,
              position: truck.points[truck.currentIndex],
              title: `${truck.driverName} (${truck.plate})`,
              subtitle: `${truck.vehicle} • ${truck.currentStepStatus}`,
              type: 'driver',
              vehicleType: truck.vehicle,
            });
          } catch (e) {
            // ignore
          }
        }
        continue;
      }

      let nextIndex = truck.currentIndex + truck.direction;

      // Reverse or cycle direction at route ends
      if (nextIndex >= truck.points.length) {
        truck.direction = -1;
        nextIndex = truck.points.length - 2;
        truck.completedCycles += 1;
        if (truck.isLongTrip) {
          truck.pauseRemainingTicks = 20; // 36s cargo unload pause at destination
          truck.currentStepStatus = 'Descargando en destino final';
        }
      } else if (nextIndex < 0) {
        truck.direction = 1;
        nextIndex = 1;
        truck.completedCycles += 1;
        if (truck.isLongTrip) {
          truck.pauseRemainingTicks = 20; // 36s cargo load pause at origin
          truck.currentStepStatus = 'Cargando mercancía (Centro Logístico)';
        }
      }

      // Random semáforo / traffic light stop for long-trip vehicle (~every 45 steps)
      if (truck.isLongTrip && nextIndex % 45 === 0 && Math.random() > 0.3) {
        truck.pauseRemainingTicks = 12; // 21.6s traffic light pause
        truck.currentStepStatus = 'Detenido en semáforo / Tráfico urbano';
      } else {
        truck.currentStepStatus = 'En tránsito por vía principal';
      }

      truck.currentIndex = nextIndex;
      const currentPos = truck.points[nextIndex];

      if (this.isViewActive) {
        try {
          mapService.addMarker({
            id: truck.id,
            position: currentPos,
            title: `${truck.driverName} (${truck.plate})`,
            subtitle: `${truck.vehicle} • ${truck.currentStepStatus}`,
            type: 'driver',
            vehicleType: truck.vehicle,
          });
        } catch (e) {
          // ignore
        }
      }
    }
  }

  private manageLifecycle(): void {
    const localTrucksCount = Array.from(this.trucks.values()).filter(t => t.isLocal).length;
    const totalTrucksCount = this.trucks.size;

    if (localTrucksCount < 4) {
      this.spawnTruck(true);
    }

    if (totalTrucksCount < 11) {
      this.spawnTruck(false);
    }

    for (const [id, truck] of Array.from(this.trucks.entries())) {
      if (!truck.isLocal && truck.completedCycles >= 1 && totalTrucksCount > 10) {
        this.despawnTruck(id);
        break;
      }
    }
  }

  public stop(): void {
    this.isViewActive = false;
    // NOTE: Timers continue stepping in the background so vehicles advance along their routes
    // in real time even while the user is viewing other screens.
  }

  public destroy(): void {
    this.isViewActive = false;
    this.isRunning = false;
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.lifecycleTimer) {
      clearInterval(this.lifecycleTimer);
      this.lifecycleTimer = null;
    }
    if (this.unsubscribeGps) {
      this.unsubscribeGps();
      this.unsubscribeGps = null;
    }
    for (const id of this.trucks.keys()) {
      try {
        mapService.removeMarker(id);
      } catch (e) {
        // ignore
      }
    }
    this.trucks.clear();
  }
}

export const fleetSimulationService = new FleetSimulationService();
