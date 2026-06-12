/**
 * lib/maps/routing.ts
 * ───────────────────────────────────────────────────────────
 * Utilidades para optimización de rutas (OSRM Trip API) y
 * generación de deep links para navegación en Google Maps.
 * ───────────────────────────────────────────────────────────
 */

export type LatLng = { lat: number; lng: number };

export type RouteStep = {
  originalIndex: number;
  lat: number;
  lng: number;
};

export type OptimizedRouteResult = {
  ok: boolean;
  error?: string;
  /** El orden optimizado de los índices de entrada (excluyendo el origen si se empezó ahí) */
  optimizedOrder: number[];
  /** Las coordenadas geojson resueltas de la ruta completa para dibujar en el mapa */
  coordinates: [number, number][]; // [lat, lng]
  /** Distancia total en metros */
  distance: number;
  /** Duración estimada en segundos */
  duration: number;
};

/**
 * Llama a la API pública de OSRM para optimizar la ruta.
 * OSRM Trip resuelve el problema del viajante (TSP).
 *
 * @param origin - Coordenada de inicio (ej: ubicación del repartidor)
 * @param destinations - Lista de coordenadas de entregas
 * @returns La ruta optimizada
 */
export async function optimizeRoute(
  origin: LatLng,
  destinations: LatLng[]
): Promise<OptimizedRouteResult> {
  if (destinations.length === 0) {
    return {
      ok: true,
      optimizedOrder: [],
      coordinates: [],
      distance: 0,
      duration: 0,
    };
  }

  // Agrupamos origen + destinos en una sola lista de coordenadas.
  // El origen estará en el índice 0.
  const allCoords = [origin, ...destinations];
  const coordsString = allCoords.map((c) => `${c.lng},${c.lat}`).join(';');

  // OSRM Trip API:
  // source=first obliga a que la ruta inicie en el primer punto (origen).
  // roundtrip=false indica que no necesitamos regresar al origen al final.
  const url = `https://router.project-osrm.org/trip/v1/driving/${coordsString}?source=first&destination=any&roundtrip=false&geometries=geojson&overview=full`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok') {
      throw new Error(`OSRM API retornó un código de error: ${data.code}`);
    }

    const trip = data.trips?.[0];
    if (!trip) {
      throw new Error('No se encontró información de ruta en OSRM');
    }

    // OSRM devuelve un array "waypoints" que coincide 1:1 con el orden de entrada.
    // Cada elemento tiene "waypoint_index" (el orden en la ruta optimizada).
    const waypoints = data.waypoints as { waypoint_index: number }[];

    // Mapeamos los índices de destino originales al orden optimizado.
    // El origen siempre es el índice 0 en la entrada y debería ser waypoint_index 0 si source=first funcionó.
    const orderWithOrigin = waypoints
      .map((wp, inputIdx) => ({
        originalIndex: inputIdx,
        waypointIndex: wp.waypoint_index,
      }))
      .sort((a, b) => a.waypointIndex - b.waypointIndex);

    // Filtramos el origen (originalIndex 0) para obtener el orden optimizado de las paradas de entrega.
    // Los índices en optimizedOrder corresponden a la lista original "destinations" (por eso restamos 1).
    const optimizedOrder = orderWithOrigin
      .filter((item) => item.originalIndex > 0)
      .map((item) => item.originalIndex - 1);

    // OSRM geometries.coordinates vienen como [lng, lat], los convertimos a [lat, lng] para Leaflet
    const coordinates = (trip.geometry?.coordinates || []).map(
      (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
    );

    return {
      ok: true,
      optimizedOrder,
      coordinates,
      distance: trip.distance || 0,
      duration: trip.duration || 0,
    };
  } catch (error) {
    console.error('Error al optimizar ruta con OSRM:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Error desconocido al optimizar ruta',
      optimizedOrder: [],
      coordinates: [],
      distance: 0,
      duration: 0,
    };
  }
}

/**
 * Genera un enlace de deep link a Google Maps para navegar al destino.
 */
export function buildSingleNavLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

/**
 * Genera un enlace de deep link a Google Maps con múltiples paradas.
 * Útil para que el repartidor abra la ruta completa en su app externa.
 */
export function buildGoogleMapsNavLink(
  origin: LatLng | null,
  destinations: LatLng[]
): string {
  if (destinations.length === 0) return '#';

  const startCoord = origin ? `${origin.lat},${origin.lng}` : '';
  const lastDest = destinations[destinations.length - 1];
  const destCoord = `${lastDest.lat},${lastDest.lng}`;

  // Las paradas intermedias son todos los destinos menos el último.
  const waypoints = destinations.slice(0, -1);
  const waypointsParam = waypoints.map((w) => `${w.lat},${w.lng}`).join('|');

  let url = `https://www.google.com/maps/dir/?api=1&destination=${destCoord}`;

  if (startCoord) {
    url += `&origin=${startCoord}`;
  }
  if (waypointsParam) {
    url += `&waypoints=${waypointsParam}`;
  }

  url += '&travelmode=driving';
  return url;
}
