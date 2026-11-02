import boundaries from "../../data/bali-regions.json" with { type: "json" };
import type { BaliRegionId } from "./regions.ts";
import type { SearchBounds } from "./overpass.ts";

type Polygon = number[][][];
type Boundary = { id: Exclude<BaliRegionId, "all">; geometry: { type: string; coordinates: Polygon | Polygon[] } };

const regions = (boundaries.regions as Boundary[]).map((region) => {
  const polygons: Polygon[] = region.geometry.type === "Polygon" ? [region.geometry.coordinates as Polygon] : region.geometry.coordinates as Polygon[];
  const points = polygons.flatMap((polygon) => polygon[0]);
  const bounds: SearchBounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [lng, lat] of points) {
    bounds[0] = Math.min(bounds[0], lat); bounds[1] = Math.min(bounds[1], lng);
    bounds[2] = Math.max(bounds[2], lat); bounds[3] = Math.max(bounds[3], lng);
  }
  return { id: region.id, polygons, bounds };
});

function insideRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function regionForPoint(lat: number, lng: number): Exclude<BaliRegionId, "all"> | undefined {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return regions.find(({ polygons, bounds: [s, w, n, e] }) => lat >= s && lat <= n && lng >= w && lng <= e &&
    polygons.some((polygon) => insideRing(lat, lng, polygon[0]) && !polygon.slice(1).some((hole) => insideRing(lat, lng, hole))))?.id;
}

export function boundsForRegion(region: BaliRegionId): SearchBounds {
  const selected = regions.filter((entry) => region === "all" || entry.id === region);
  return selected.reduce<SearchBounds>((box, entry) => [
    Math.min(box[0], entry.bounds[0]), Math.min(box[1], entry.bounds[1]),
    Math.max(box[2], entry.bounds[2]), Math.max(box[3], entry.bounds[3])
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}
