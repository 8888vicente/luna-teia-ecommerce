/**
 * lib/maps/parseCoords.ts
 * ───────────────────────────────────────────────────────────
 * Extrae coordenadas (lat, lng) de enlaces de Google Maps.
 *
 * Formatos soportados:
 *   - https://maps.google.com/?q=31.6904,-106.4245
 *   - https://www.google.com/maps/place/.../@31.69,-106.42,...
 *   - https://www.google.com/maps?q=31.69,-106.42
 *   - Cualquier URL que contenga el patrón @lat,lng
 *
 * Los short links (maps.app.goo.gl) NO se resuelven en el
 * servidor porque requieren seguir redirects HTTP; para esos
 * se devuelve null y se delega al fallback de geocodificación.
 * ───────────────────────────────────────────────────────────
 */

export type Coords = { lat: number; lng: number };

/**
 * Valida que un par de coordenadas sea geográficamente razonable.
 * Latitud: -90 a 90, Longitud: -180 a 180.
 */
function isValidCoords(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Parsea un enlace de Google Maps y extrae las coordenadas lat/lng.
 *
 * @param url - URL de Google Maps (acepta varios formatos)
 * @returns Objeto con lat y lng, o null si no se pudieron extraer
 *
 * @example
 * parseGoogleMapsLink('https://maps.google.com/?q=31.6904,-106.4245')
 * // → { lat: 31.6904, lng: -106.4245 }
 *
 * @example
 * parseGoogleMapsLink('https://maps.app.goo.gl/abc123')
 * // → null  (short link no resolvible en servidor)
 */
export function parseGoogleMapsLink(url: string): Coords | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // ─── Short links de Google (no resolvibles sin HTTP redirect) ───
  if (
    trimmed.includes('maps.app.goo.gl') ||
    trimmed.includes('goo.gl/maps')
  ) {
    return null;
  }

  // ─── Estrategia 1: parámetro ?q=lat,lng ───
  // Cubre:
  //   https://maps.google.com/?q=31.6904,-106.4245
  //   https://www.google.com/maps?q=31.69,-106.42
  try {
    const parsed = new URL(trimmed);
    const qParam = parsed.searchParams.get('q');
    if (qParam) {
      const match = qParam.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoords(lat, lng)) {
          return { lat, lng };
        }
      }
    }
  } catch {
    // URL inválida, seguimos con otros métodos
  }

  // ─── Estrategia 2: patrón @lat,lng en la URL ───
  // Cubre:
  //   https://www.google.com/maps/place/.../@31.69,-106.42,15z
  //   https://www.google.com/maps/@31.69,-106.42,15z
  {
    const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (isValidCoords(lat, lng)) {
        return { lat, lng };
      }
    }
  }

  // ─── Estrategia 3: parámetro ll=lat,lng ───
  // Algunos links legacy usan &ll=
  try {
    const parsed = new URL(trimmed);
    const llParam = parsed.searchParams.get('ll');
    if (llParam) {
      const match = llParam.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoords(lat, lng)) {
          return { lat, lng };
        }
      }
    }
  } catch {
    // URL inválida
  }

  // ─── Estrategia 4: coordenadas sueltas en el path ───
  // Último recurso: buscar un par lat,lng en cualquier parte de la URL
  {
    const looseMatch = trimmed.match(/(-?\d{1,3}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/);
    if (looseMatch) {
      const lat = parseFloat(looseMatch[1]);
      const lng = parseFloat(looseMatch[2]);
      if (isValidCoords(lat, lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
}
