/**
 * Geospatial distance utilities using the Haversine formula
 * Calculates great-circle straight-line distance between two coordinates in kilometers.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates straight-line distance (Haversine formula) in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return Infinity;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_KM * c * 10) / 10; // Rounded to 1 decimal place
}

/**
 * Formats distance in km or meters for human-readable display.
 * Always explicitly labels that this is straight-line distance ("jarak lurus").
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || !Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `~${meters} m (jarak lurus)`;
  }

  return `~${distanceKm.toFixed(1)} km (jarak lurus)`;
}

