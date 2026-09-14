import { LatLng } from '../../models/mapTypes';
import { mapService } from '../../core/MapService';
import { COLOMBIA_LOGISTICS_PLACES } from '../search/SearchCatalog';

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
}

const DRIVER_CATALOG = [
  { name: 'Carlos Rodríguez', vehicle: 'Moto Carguero AKT 200', plate: 'WYZ-789', city: 'Medellín' },
  { name: 'Andrés López', vehicle: 'Camioneta Pickup Hilux', plate: 'SQR-456', city: 'Bogotá' },
  { name: 'Mauricio Gómez', vehicle: 'Furgón Mediano Chevrolet', plate: 'KLO-123', city: 'Barranquilla' },
  { name: 'Javier Mendoza', vehicle: 'Camión Sencillo Hino 500', plate: 'TRX-889', city: 'Cali' },
  { name: 'Diana Morales', vehicle: 'Moto Carguero Ayco 250', plate: 'MNB-654', city: 'Bucaramanga' },
  { name: 'Jorge Vargas', vehicle: 'Turbo Light Foton', plate: 'PLM-321', city: 'Pereira' },
  { name: 'Hernán Castro', vehicle: 'Tractomula Kenworth', plate: 'VBN-774', city: 'Cartagena' },
  { name: 'Mateo Ramírez', vehicle: 'Camioneta Nissan Frontier', plate: 'GHJ-902', city: 'Ibagué' },
  { name: 'Felipe Zapata', vehicle: 'Furgón JAC KR-10', plate: 'ZXC-512', city: 'Cúcuta' },
];

const STATUS_OPTIONS = [
  'En tránsito',
  'Cargando mercancía',
  'En ruta logística',
  'Descargando en destino',
  'Disponible para fletes',
];

// Helper to compute distance in meters between two lat/lng points
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

// Resample street coordinates so waypoints are smoothly spaced every ~40-70 meters
function resampleWaypoints(rawPoints: LatLng[], stepMeters: number = 50): LatLng[] {
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

// Fetch real driving route from OSRM along actual roads and streets
async function fetchRealStreetRoute(origin: LatLng, destination: LatLng): Promise<LatLng[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        const coords: [number, number][] = data.routes[0].geometry.coordinates;
        const streetPoints: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
        return resampleWaypoints(streetPoints, 50);
      }
    }
  } catch (err) {
    console.warn('OSRM street route fetch failed, using curved fallback path', err);
  }

  // Fallback path if OSRM request fails: generate curved sub-sampled road nodes
  const fallbackPoints: LatLng[] = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curveOffset = Math.sin(t * Math.PI) * 0.008;
    fallbackPoints.push({
      lat: origin.lat + (destination.lat - origin.lat) * t + curveOffset,
      lng: origin.lng + (destination.lng - origin.lng) * t - curveOffset * 0.5,
    });
  }
  return resampleWaypoints(fallbackPoints, 40);
}

class FleetSimulationService {
  private trucks: Map<string, SimulatedTruck> = new Map();
  private movementTimer: ReturnType<typeof setInterval> | null = null;
  private lifecycleTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start with 5 active diverse vehicles across major Colombian logistics hubs
    for (let i = 0; i < 5; i++) {
      await this.spawnTruck();
    }

    // Ticker 1: Step movement along street waypoints every 1.5s
    this.movementTimer = setInterval(() => {
      this.stepFleet();
    }, 1500);

    // Ticker 2: Lifecycle management (every 30s)
    this.lifecycleTimer = setInterval(() => {
      this.manageLifecycle();
    }, 30000);
  }

  private async spawnTruck(): Promise<void> {
    // Pick an available driver from the catalog
    const activeDriverNames = new Set(Array.from(this.trucks.values()).map(t => t.driverName));
    const availableDrivers = DRIVER_CATALOG.filter(d => !activeDriverNames.has(d.name));

    if (availableDrivers.length === 0) return;

    const driverSpec = availableDrivers[Math.floor(Math.random() * availableDrivers.length)];
    const id = `truck-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Select realistic origin & destination places
    const cityPlaces = COLOMBIA_LOGISTICS_PLACES.filter(p =>
      p.address.toLowerCase().includes(driverSpec.city.toLowerCase().split(' ')[0]) ||
      p.title.toLowerCase().includes(driverSpec.city.toLowerCase().split(' ')[0])
    );

    let place1 = cityPlaces.length >= 2
      ? cityPlaces[Math.floor(Math.random() * cityPlaces.length)]
      : COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];

    let place2 = COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];
    while (place2.id === place1.id) {
      place2 = COLOMBIA_LOGISTICS_PLACES[Math.floor(Math.random() * COLOMBIA_LOGISTICS_PLACES.length)];
    }

    const origin = place1.position;
    const destination = place2.position;
    const status = STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)];

    // Fetch real street geometry for vehicle navigation
    const routePoints = await fetchRealStreetRoute(origin, destination);

    const truck: SimulatedTruck = {
      id,
      driverName: driverSpec.name,
      vehicle: driverSpec.vehicle,
      plate: driverSpec.plate,
      city: driverSpec.city,
      status,
      origin,
      destination,
      points: routePoints,
      currentIndex: 0,
      direction: 1,
      completedCycles: 0,
    };

    this.trucks.set(id, truck);

    // Add marker with vehicleType to map
    mapService.addMarker({
      id: truck.id,
      position: truck.points[0],
      title: `${truck.driverName} (${truck.plate})`,
      subtitle: `${truck.vehicle} • ${truck.city} (${truck.status})`,
      type: 'driver',
      vehicleType: truck.vehicle,
    });
  }

  private despawnTruck(id: string): void {
    const truck = this.trucks.get(id);
    if (!truck) return;

    try {
      mapService.removeMarker(id);
    } catch (e) {
      console.warn('despawnTruck: could not remove marker', id, e);
    }
    this.trucks.delete(id);
  }

  private stepFleet(): void {
    for (const [id, truck] of this.trucks.entries()) {
      if (truck.points.length <= 1) continue;

      let nextIndex = truck.currentIndex + truck.direction;

      // Reverse direction at route ends
      if (nextIndex >= truck.points.length) {
        truck.direction = -1;
        nextIndex = truck.points.length - 2;
        truck.completedCycles += 1;
      } else if (nextIndex < 0) {
        truck.direction = 1;
        nextIndex = 1;
        truck.completedCycles += 1;
      }

      truck.currentIndex = nextIndex;
      const currentPos = truck.points[nextIndex];

      try {
        mapService.addMarker({
          id: truck.id,
          position: currentPos,
          title: `${truck.driverName} (${truck.plate})`,
          subtitle: `${truck.vehicle} • ${truck.city} (${truck.status})`,
          type: 'driver',
          vehicleType: truck.vehicle,
        });
      } catch (e) {
        console.warn('stepFleet: could not update marker', truck.id, e);
      }
    }
  }

  private manageLifecycle(): void {
    // 1. Remove trucks that completed full round trips
    for (const [id, truck] of Array.from(this.trucks.entries())) {
      if (truck.completedCycles >= 1 && this.trucks.size > 4) {
        this.despawnTruck(id);
        break;
      }
    }

    // 2. Maintain target fleet size (5-6 active drivers)
    if (this.trucks.size < 6) {
      this.spawnTruck();
    }
  }

  public stop(): void {
    if (this.movementTimer) {
      clearInterval(this.movementTimer);
      this.movementTimer = null;
    }
    if (this.lifecycleTimer) {
      clearInterval(this.lifecycleTimer);
      this.lifecycleTimer = null;
    }

    for (const id of this.trucks.keys()) {
      try {
        mapService.removeMarker(id);
      } catch (e) {
        console.warn('stop: could not remove marker', id, e);
      }
    }
    this.trucks.clear();
    this.isRunning = false;
  }
}

export const fleetSimulationService = new FleetSimulationService();
