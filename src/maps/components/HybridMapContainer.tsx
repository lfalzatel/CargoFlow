import React, { useEffect, useRef, useState } from 'react';
import { mapService } from '../core/MapService';
import { LatLng, MapProviderType, PlaceSearchResult, RouteInfo } from '../models/mapTypes';
import { MapControls } from './MapControls';
import { MapStatusBadge } from './MapStatusBadge';
import { RegionDownloadModal } from './RegionDownloadModal';
import { OfflineNavigationGuide } from './OfflineNavigationGuide';
import { COLOMBIA_LOGISTICS_PLACES } from '../services/search/SearchCatalog';
import { Trip, UserRole } from '../../types';


interface HybridMapContainerProps {
  className?: string;
  initialHeight?: string;
  hideControls?: boolean;
  activeTrip?: Trip | null;
  userRole?: UserRole;
}

function resolveCoords(locationName?: string, fallback: LatLng = { lat: 6.2442, lng: -75.5812 }): LatLng {
  if (!locationName) return fallback;
  const lower = locationName.toLowerCase().trim();

  const place = COLOMBIA_LOGISTICS_PLACES.find(
    p => p.title.toLowerCase().includes(lower) || p.address.toLowerCase().includes(lower)
  );
  if (place) return place.position;

  if (lower.includes('marinilla')) return { lat: 6.1735, lng: -75.3385 };
  if (lower.includes('rionegro')) return { lat: 6.1534, lng: -75.3743 };
  if (lower.includes('bogot') || lower.includes('bog')) return { lat: 4.654, lng: -74.112 };
  if (lower.includes('cali')) return { lat: 3.4516, lng: -76.532 };
  if (lower.includes('barranquilla')) return { lat: 10.9685, lng: -74.7813 };
  if (lower.includes('bello')) return { lat: 6.335, lng: -75.556 };
  if (lower.includes('envigado')) return { lat: 6.168, lng: -75.592 };
  if (lower.includes('itag')) return { lat: 6.183, lng: -75.599 };
  if (lower.includes('centro') || lower.includes('medellin')) return { lat: 6.2442, lng: -75.5812 };

  let hash = 0;
  for (let i = 0; i < locationName.length; i++) {
    hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 80) / 1000);
  const lngOffset = (((Math.abs(hash) >> 2) % 80) / 1000);
  return { lat: 6.2442 + latOffset, lng: -75.5812 + lngOffset };
}

export const HybridMapContainer: React.FC<HybridMapContainerProps> = ({
  className = '',
  initialHeight = 'h-[500px]',
  hideControls = false,
  activeTrip = null,
  userRole
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  const [mapState, setMapState] = useState({
    activeProvider: mapService.getActiveProvider().type,
    providerName: mapService.getActiveProvider().name,
    isOnline: mapService.isOnline(),
    isAutoSwitch: true,
    userLocation: { lat: 6.2442, lng: -75.5812 },
    currentCamera: { center: { lat: 6.2442, lng: -75.5812 }, zoom: 13 },
    activeRoute: null as RouteInfo | null,
    clickedLocation: null as LatLng | null,
    error: null as string | null,
  });

  useEffect(() => {
    if (containerRef.current) {
      mapService.initialize(containerRef.current);
    }

    const unsubscribe = mapService.subscribe((state) => {
      setMapState(state);
    });

    const handleResize = () => {
      mapService.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
      mapService.destroy();
    };
  }, []);

  // ── Automated Phase Route & Live Vehicle Movement (Uber Style) ──
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'EN CAMINO') {
      mapService.setRoute(null);
      mapService.removeMarker('active_driver_marker');
      mapService.removeMarker('active_target_marker');
      return;
    }

    let isMounted = true;
    let intervalId: any = null;

    const isPhase1 = !activeTrip.clientConfirmedArrivalAtOrigin;
    const targetName = isPhase1 ? activeTrip.origin : activeTrip.destination;
    
    const targetCoords = isPhase1 
      ? resolveCoords(activeTrip.origin, { lat: 6.1735, lng: -75.3385 })
      : resolveCoords(activeTrip.destination, { lat: 6.1534, lng: -75.3743 });

    const driverStartCoords = isPhase1 
      ? resolveCoords('Medellin Centro', { lat: 6.2442, lng: -75.5812 })
      : resolveCoords(activeTrip.origin, { lat: 6.1735, lng: -75.3385 });

    // Set destination / pickup marker
    mapService.addMarker({
      id: 'active_target_marker',
      position: targetCoords,
      title: isPhase1 ? `📍 Cargue: ${activeTrip.origin}` : `🏁 Entrega: ${activeTrip.destination}`,
      subtitle: isPhase1 ? 'Punto de recolección de mercancía' : 'Punto de entrega final',
      type: isPhase1 ? 'origin' : 'destination'
    });

    // Calculate route polyline and start smooth vehicle movement
    mapService.calculateRoute(driverStartCoords, targetCoords).then(route => {
      if (!isMounted || !route || !route.points || route.points.length === 0) {
        return;
      }

      const path = route.points;
      let stepIndex = 0;

      // Initial vehicle marker
      const initialPos = path[0];
      mapService.addMarker({
        id: 'active_driver_marker',
        position: initialPos,
        title: `🚚 ${activeTrip.conductorName || 'Conductor CargoFlow'}`,
        subtitle: `Placa: ${activeTrip.conductorPlate || 'VVB60F'} | En ruta a ${targetName}`,
        type: 'driver'
      });

      // Fit map camera to enclose the route
      mapService.setCamera({
        center: {
          lat: (driverStartCoords.lat + targetCoords.lat) / 2,
          lng: (driverStartCoords.lng + targetCoords.lng) / 2
        },
        zoom: 12
      }, true);

      // Smooth step-by-step driver vehicle animation along route coordinates (Uber style)
      intervalId = setInterval(() => {
        if (!isMounted) return;
        stepIndex = (stepIndex + 1) % path.length;
        const currentPos = path[stepIndex];

        mapService.addMarker({
          id: 'active_driver_marker',
          position: currentPos,
          title: `🚚 ${activeTrip.conductorName || 'Conductor CargoFlow'}`,
          subtitle: `Placa: ${activeTrip.conductorPlate || 'VVB60F'} | Acercándose a ${targetName}`,
          type: 'driver'
        });
      }, 2000);
    });

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    activeTrip?.id,
    activeTrip?.status,
    activeTrip?.driverArrivedAtOrigin,
    activeTrip?.clientConfirmedArrivalAtOrigin,
    activeTrip?.tripStarted,
    activeTrip?.completionRequestedBy
  ]);

  const handleCenterUserLocation = () => {
    mapService.setCamera(
      {
        center: mapState.userLocation,
        zoom: 15,
      },
      true
    );
  };

  const handleSearch = async (query: string): Promise<PlaceSearchResult[]> => {
    return mapService.searchPlaces(query);
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    mapService.setCamera(
      {
        center: place.position,
        zoom: 15,
      },
      true
    );

    mapService.addMarker({
      id: `place_${place.id}`,
      position: place.position,
      title: place.title,
      subtitle: place.address,
      type: 'custom',
    });
  };

  const [isNavigationGuideOpen, setIsNavigationGuideOpen] = useState(false);

  const handleCalculateRoute = async (origin: LatLng, destination: LatLng): Promise<RouteInfo> => {
    const route = await mapService.calculateRoute(origin, destination);
    setIsNavigationGuideOpen(true);
    return route;
  };

  const handleClearRoute = () => {
    mapService.setRoute(null);
    setIsNavigationGuideOpen(false);
  };

  const handleToggleProvider = (providerType: MapProviderType) => {
    mapService.switchProvider(providerType);
  };

  const handleToggleAutoSwitch = (enabled: boolean) => {
    mapService.setAutoSwitch(enabled);
  };

  const handleToggleTraffic = (enabled: boolean) => {
    mapService.setTrafficEnabled(enabled);
  };

  return (
    <div
      className={`relative w-full ${initialHeight} rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-[#09152b] ${className}`}
    >
      {/* Map DOM Container */}
      <div ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />

      {/* Top Overlay: Network Status Badge (Shown only when offline to prevent header overlap) */}
      {!mapState.isOnline && (
        <div className="absolute top-32 left-4 right-4 z-10 pointer-events-none flex justify-center">
          <MapStatusBadge
            isOnline={mapState.isOnline}
            providerName={mapState.providerName}
            isAutoSwitch={mapState.isAutoSwitch}
            onOpenRegionManager={() => setIsRegionModalOpen(true)}
          />
        </div>
      )}

      {/* Offline Transport Navigation Guide */}
      {isNavigationGuideOpen && mapState.activeRoute && (
        <div className="absolute top-16 left-4 right-4 md:right-auto md:max-w-md z-20">
          <OfflineNavigationGuide
            route={mapState.activeRoute}
            isOnline={mapState.isOnline}
            onClose={() => setIsNavigationGuideOpen(false)}
          />
        </div>
      )}

      {/* Bottom Overlay: Search & Route Controls */}
      {!hideControls && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <MapControls
            activeProvider={mapState.activeProvider}
            isOnline={mapState.isOnline}
            isAutoSwitch={mapState.isAutoSwitch}
            activeRoute={mapState.activeRoute}
            onSearch={handleSearch}
            onSelectPlace={handleSelectPlace}
            onCalculateRoute={handleCalculateRoute}
            onClearRoute={handleClearRoute}
            onCenterUserLocation={handleCenterUserLocation}
            onToggleProvider={handleToggleProvider}
            onToggleAutoSwitch={handleToggleAutoSwitch}
            onToggleTraffic={handleToggleTraffic}
            userLocation={mapState.userLocation}
            onOpenRegionManager={() => setIsRegionModalOpen(true)}
            onToggleNavigationGuide={() => setIsNavigationGuideOpen(!isNavigationGuideOpen)}
            isNavigationGuideOpen={isNavigationGuideOpen}
          />
        </div>
      )}


      {/* Offline Regions Manager Modal */}
      <RegionDownloadModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
      />
    </div>
  );
};
