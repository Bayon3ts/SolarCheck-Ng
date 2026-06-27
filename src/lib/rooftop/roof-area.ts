export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates the real-world area of a polygon drawn on a map, in square meters.
 * Uses the spherical excess formula adapted for lat/lng to account for Earth's curvature.
 */
export function calculatePolygonAreaM2(points: LatLng[]): number {
  if (points.length < 3) return 0;

  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];

    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);
    const lng1 = toRad(p1.lng);
    const lng2 = toRad(p2.lng);

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
  return Math.round(area * 100) / 100;
}

/**
 * Roof clearance factor accounting for setbacks, fire access,
 * and standard Nigerian home assets like water tanks and overhead infrastructure.
 */
export const ROOF_USABILITY_FACTOR = 0.75;

export function calculateUsableRoofAreaM2(totalAreaM2: number): number {
  return Math.round(totalAreaM2 * ROOF_USABILITY_FACTOR * 100) / 100;
}
