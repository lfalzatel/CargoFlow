import { PlaceSearchResult } from '../../models/mapTypes';

export const COLOMBIA_LOGISTICS_PLACES: PlaceSearchResult[] = [
  // Antioquia / Medellín
  {
    id: 'med_centro',
    title: 'Medellín - Centro Logístico',
    address: 'Calle 44 #52-16, Medellín, Antioquia',
    position: { lat: 6.2442, lng: -75.5812 },
  },
  {
    id: 'med_ter_norte',
    title: 'Terminal de Transportes del Norte (Medellín)',
    address: 'Carrera 64 #78-58, Medellín, Antioquia',
    position: { lat: 6.273, lng: -75.568 },
  },
  {
    id: 'med_ter_sur',
    title: 'Terminal de Transportes del Sur (Medellín)',
    address: 'Carrera 65 #8B-91, Medellín, Antioquia',
    position: { lat: 6.212, lng: -75.587 },
  },
  {
    id: 'rio_mde_airport',
    title: 'Aeropuerto Internacional José María Córdova (Rionegro)',
    address: 'Vía Aeropuerto, Rionegro, Antioquia',
    position: { lat: 6.1645, lng: -75.4231 },
  },
  {
    id: 'envigado_ind',
    title: 'Zona Industrial Envigado',
    address: 'Carrera 48 #48 Sur, Envigado, Antioquia',
    position: { lat: 6.168, lng: -75.592 },
  },
  {
    id: 'itagui_central',
    title: 'Central Mayorista de Antioquia (Itagüí)',
    address: 'Calle 85 #48-01, Itagüí, Antioquia',
    position: { lat: 6.183, lng: -75.599 },
  },
  {
    id: 'bello_norte',
    title: 'Bello - Autopista Norte',
    address: 'Autopista Norte #22-10, Bello, Antioquia',
    position: { lat: 6.335, lng: -75.556 },
  },

  // Bogotá & Cundinamarca
  {
    id: 'bog_salitre',
    title: 'Terminal de Transportes Salitre (Bogotá)',
    address: 'Diagonal 23 #69-60, Bogotá D.C.',
    position: { lat: 4.654, lng: -74.112 },
  },
  {
    id: 'bog_eldorado',
    title: 'Aeropuerto Internacional El Dorado (Terminal Carga)',
    address: 'Avenida El Dorado #103-09, Bogotá D.C.',
    position: { lat: 4.701, lng: -74.146 },
  },
  {
    id: 'bog_fontibon',
    title: 'Zona Franca Bogotá (Fontibón)',
    address: 'Carrera 106 #15A-25, Bogotá D.C.',
    position: { lat: 4.678, lng: -74.153 },
  },
  {
    id: 'bog_suba',
    title: 'Suba - Centro Logístico Norte',
    address: 'Calle 170 #92-30, Bogotá D.C.',
    position: { lat: 4.756, lng: -74.088 },
  },
  {
    id: 'soacha_sur',
    title: 'Soacha - Autopista Sur',
    address: 'Autopista Sur #12-40, Soacha, Cundinamarca',
    position: { lat: 4.582, lng: -74.218 },
  },
  {
    id: 'chia_sabana',
    title: 'Chía - Variante Cundinamarca',
    address: 'Vía Chía - Cajicá, Cundinamarca',
    position: { lat: 4.861, lng: -74.053 },
  },
  {
    id: 'tocancipa_ind',
    title: 'Parque Industrial Tocancipá',
    address: 'Vía Bogotá - Tunja, Tocancipá, Cundinamarca',
    position: { lat: 4.965, lng: -73.912 },
  },

  // Valle del Cauca & Buenaventura
  {
    id: 'cali_ter_mibo',
    title: 'Terminal de Transportes de Cali',
    address: 'Calle 30N #2AN-29, Cali, Valle del Cauca',
    position: { lat: 3.463, lng: -76.526 },
  },
  {
    id: 'yumbo_ind',
    title: 'Zona Industrial Yumbo',
    address: 'Carrera 32 #10-15, Yumbo, Valle del Cauca',
    position: { lat: 3.532, lng: -76.512 },
  },
  {
    id: 'buenaventura_puerto',
    title: 'Puerto Marítimo de Buenaventura',
    address: 'Sociedad Portuaria de Buenaventura, Valle del Cauca',
    position: { lat: 3.882, lng: -77.031 },
  },
  {
    id: 'palmira_clo',
    title: 'Aeropuerto Internacional Alfonso Bonilla Aragón (Cali/Palmira)',
    address: 'Palmira, Valle del Cauca',
    position: { lat: 3.543, lng: -76.381 },
  },

  // Costa Caribe (Barranquilla, Cartagena, Santa Marta, Montería, Valledupar)
  {
    id: 'baq_puerto',
    title: 'Puerto de Barranquilla (Sociedad Portuaria)',
    address: 'Calle 1 #38-10, Barranquilla, Atlántico',
    position: { lat: 10.978, lng: -74.773 },
  },
  {
    id: 'ctg_contecar',
    title: 'Terminal de Contenedores Contecar (Cartagena)',
    address: 'Mamonal Km 2, Cartagena, Bolívar',
    position: { lat: 10.364, lng: -75.508 },
  },
  {
    id: 'smr_puerto',
    title: 'Puerto de Santa Marta',
    address: 'Carrera 1 #10A-12, Santa Marta, Magdalena',
    position: { lat: 11.244, lng: -74.218 },
  },
  {
    id: 'monteria_centro',
    title: 'Montería - Terminal de Transporte',
    address: 'Calle 41 #23-45, Montería, Córdoba',
    position: { lat: 8.757, lng: -75.881 },
  },
  {
    id: 'valledupar_centro',
    title: 'Valledupar - Zona Comercial y Carga',
    address: 'Avenida Salguero, Valledupar, Cesar',
    position: { lat: 10.463, lng: -73.253 },
  },

  // Santanderes, Eje Cafetero & Llanos
  {
    id: 'bga_centro',
    title: 'Bucaramanga - Central de Abastos',
    address: 'Km 3 Vía Palonegro, Bucaramanga, Santander',
    position: { lat: 7.118, lng: -73.125 },
  },
  {
    id: 'pei_airport',
    title: 'Pereira - Aeropuerto Internacional Matecaña',
    address: 'Vía Aeropuerto, Pereira, Risaralda',
    position: { lat: 4.814, lng: -75.738 },
  },
  {
    id: 'armenia_centro',
    title: 'Armenia - Central Mayorista Mercar',
    address: 'Vía Montenegro, Armenia, Quindío',
    position: { lat: 4.533, lng: -75.681 },
  },
  {
    id: 'mzles_centro',
    title: 'Manizales - Zona Industrial Maltería',
    address: 'Vía al Magdalena, Manizales, Caldas',
    position: { lat: 5.052, lng: -75.441 },
  },
  {
    id: 'ibg_centro',
    title: 'Ibagué - Parque Industrial el Papayo',
    address: 'Mirolindo, Ibagué, Tolima',
    position: { lat: 4.421, lng: -75.195 },
  },
  {
    id: 'cuc_puente',
    title: 'Cúcuta - Centro Logístico Fronterizo',
    address: 'Vía Tienditas, Cúcuta, Norte de Santander',
    position: { lat: 7.893, lng: -72.508 },
  },
  {
    id: 'vavicencio_centro',
    title: 'Villavicencio - Terminal del Llano',
    address: 'Anillo Vial Km 1, Villavicencio, Meta',
    position: { lat: 4.142, lng: -73.626 },
  },
  {
    id: 'pasto_centro',
    title: 'Pasto - Centro Logístico Sur',
    address: 'Panamericana Sur, Pasto, Nariño',
    position: { lat: 1.213, lng: -77.281 },
  },
  {
    id: 'neiva_centro',
    title: 'Neiva - Parque Industrial Sur',
    address: 'Zona Industrial, Neiva, Huila',
    position: { lat: 2.927, lng: -75.281 },
  },
  {
    id: 'tunja_centro',
    title: 'Tunja - Terminal de Transportes',
    address: 'Variante Tunja, Tunja, Boyacá',
    position: { lat: 5.532, lng: -73.361 },
  }
];

export function searchCatalogPlaces(query: string): PlaceSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/);

  return COLOMBIA_LOGISTICS_PLACES.filter((place) => {
    const fullText = `${place.title} ${place.address}`.toLowerCase();
    return tokens.every((token) => fullText.includes(token));
  });
}

export async function hybridSearchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const localResults = searchCatalogPlaces(query);
  const q = query.trim();
  if (!q || q.length < 2) return localResults;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return localResults;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&countrycodes=co&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const onlineResults: PlaceSearchResult[] = data.map((item: any) => ({
        id: `nom_${item.place_id}`,
        title: item.display_name.split(',')[0] || item.display_name,
        address: item.display_name,
        position: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      }));

      // Merge online and local results without duplicates
      const ids = new Set(onlineResults.map((r) => r.id));
      const filteredLocal = localResults.filter((r) => !ids.has(r.id));
      return [...onlineResults, ...filteredLocal];
    }
  } catch (err) {
    console.warn('Online geocoding search fallback to offline catalog:', err);
  }

  return localResults;
}

