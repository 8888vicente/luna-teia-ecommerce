/**
 * lib/maps/geocode.ts
 * ───────────────────────────────────────────────────────────
 * Geocodificación de direcciones usando Nominatim (OpenStreetMap).
 * Se utiliza como fallback gratuito cuando el pedido no tiene
 * un link de Google Maps válido o si queremos estimar coordenadas.
 *
 * ⚠️ POLÍTICA DE USO DE NOMINATIM:
 *   - Requiere un User-Agent identificable y descriptivo.
 *   - Límite absoluto de 1 petición por segundo.
 * ───────────────────────────────────────────────────────────
 */

import type { LatLng } from './routing';

/**
 * Espera el tiempo especificado. Auxiliar para respetar rate limits.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Geocodifica una dirección usando Nominatim de OpenStreetMap.
 *
 * @param address - Dirección del cliente (calle, número, colonia)
 * @param city - Ciudad de operación (Cd. Juárez, Saltillo, etc.)
 * @returns Lat/lng resuelto, o null si no se encontró
 */
export async function geocodeAddress(
  address: string,
  city: string
): Promise<LatLng | null> {
  if (!address) return null;

  // Limpiamos y preparamos la query de búsqueda
  const cleanAddress = address
    .replace(/[#\-\/]/g, ' ') // Quitar caracteres que puedan confundir al parser
    .trim();

  const query = `${cleanAddress}, ${city}, Mexico`;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&addressdetails=0`;

  try {
    const response = await fetch(url, {
      headers: {
        // Obligatorio según las políticas de uso de Nominatim
        'User-Agent': 'LunaTeiaCRM/1.0 (contacto@lunateia.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    // Si no encontró con la dirección completa, intentamos un fallback simplificado
    // quitando detalles específicos como el número de casa o departamento si fuera posible,
    // o simplemente buscando la colonia y ciudad.
    const parts = cleanAddress.split(',');
    if (parts.length > 1) {
      const fallbackQuery = `${parts[parts.length - 1].trim()}, ${city}, Mexico`;
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        fallbackQuery
      )}&format=json&limit=1`;

      // Esperamos 1.1 segundos antes del reintento para respetar la política de 1 req/seg
      await sleep(1100);

      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'LunaTeiaCRM/1.0 (contacto@lunateia.com)',
        },
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          const lat = parseFloat(fallbackData[0].lat);
          const lng = parseFloat(fallbackData[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error de geocodificación para "${query}":`, error);
    return null;
  }
}
