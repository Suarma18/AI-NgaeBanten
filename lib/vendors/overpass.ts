import type { Vendor, VendorCategory } from "./types.ts";
import type { BaliRegionId } from "./regions.ts";
import { isValidCoordinate } from "./validation.ts";
import { boundsForRegion, regionForPoint } from "./geography.ts";

export type SearchBounds = [south: number, west: number, north: number, east: number];
export const MAX_OSM_RESULTS = 600;

export function parseSearchBounds(value: unknown): SearchBounds | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("Area pencarian tidak valid.");
  const parts = value.split(",").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) throw new Error("Area pencarian tidak valid.");
  const [south, west, north, east] = parts;
  if (south >= north || west >= east) throw new Error("Area pencarian tidak valid.");
  const bounds: SearchBounds = [Math.max(-9.1, south), Math.max(114.2, west), Math.min(-7.9, north), Math.min(115.9, east)];
  if (bounds[0] >= bounds[2] || bounds[1] >= bounds[3]) throw new Error("Pilih area peta di wilayah Bali.");
  return bounds;
}

export function buildOverpassQuery(region: BaliRegionId, bounds?: SearchBounds): string {
  const regionBox = boundsForRegion(region);
  const area = bounds ? [Math.max(bounds[0], regionBox[0]), Math.max(bounds[1], regionBox[1]), Math.min(bounds[2], regionBox[2]), Math.min(bounds[3], regionBox[3])] : regionBox;
  if (area[0] >= area[2] || area[1] >= area[3]) throw new RangeError("Area peta berada di luar wilayah yang dipilih.");
  const box = `(${area.map((coordinate) => coordinate.toFixed(6)).join(",")})`;
  return `[out:json][timeout:25];(
    nwr${box}["amenity"="marketplace"];
    nwr${box}["shop"~"^(florist|greengrocer)$"];
    nwr${box}["shop"]["religion"="hindu"];
    nwr${box}["shop"]["name"~"banten|canang|janur|upakara|sesajen|dupa|bunga|buah",i];
  );out center tags ${MAX_OSM_RESULTS};`;
}

function categoriesFor(tags: Record<string, string>): VendorCategory[] {
  const name = (tags.name || "").toLowerCase();
  // Exclude non-ritual services, western gift florists, bouquet studios, jewelry, and non-upakara flower shops
  if (
    ["laundry", "dry_cleaning", "party", "clothes", "hairdresser", "beauty", "car", "motorcycle", "electronics", "computer", "furniture"].includes(tags.shop) ||
    /florist|bouquet|flower\s*(shop|studio|gallery|power)|blossoms|botanica|orchid|garden\s*plants|gardena|gardenia|heliconia|silver\s*arjuna|cening\s*alpaka/i.test(name) ||
    name === "istana"
  ) {
    return [];
  }
  const categories = new Set<VendorCategory>();
  if (tags.amenity === "marketplace") categories.add("pasar_tradisional");
  // Only accept ritual-relevant flowers/janur (reject general western florists)
  if (!/florist|bouquet|flower\s*(shop|studio)/i.test(name) && (/janur|slepan|busung|canang|warung\s*bunga|taman\s*bunga/.test(name) || (/bunga/.test(name) && tags.religion === "hindu"))) {
    categories.add("bunga_janur");
  }
  if (tags.shop === "greengrocer" || /buah/.test(name)) categories.add("buah_upakara");
  if (/banten|canang|pejati/.test(name)) categories.add("banten_jadi");
  if (/upakara|sesajen|dupa/.test(name) || tags.religion === "hindu") categories.add("bahan_banten");
  if (/jero\s*mangku|pemangku|serati|griya/.test(name)) categories.add("jero_mangku");
  return [...categories];
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function parseOverpassResponse(raw: unknown, region: BaliRegionId, fetchedAt: string): { vendors: Vendor[]; limited: boolean } {
  const data = record(raw);
  if (!data || !Array.isArray(data.elements)) throw new Error("Respons OpenStreetMap tidak valid.");
  if (data.remark) throw new Error("Pencarian OpenStreetMap belum selesai. Persempit wilayah dan coba lagi.");
  const vendors = new Map<string, Vendor>();
  for (const value of data.elements.slice(0, MAX_OSM_RESULTS)) {
    const element = record(value);
    const rawTags = record(element?.tags);
    if (!element || !rawTags || !["node", "way", "relation"].includes(String(element.type)) || !Number.isSafeInteger(element.id) || Number(element.id) <= 0) continue;
    const tags = Object.fromEntries(Object.entries(rawTags).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    if (!tags.name?.trim() || (tags.religion && tags.religion !== "hindu" && /religio/.test(tags.shop || ""))) continue;
    const center = record(element.center);
    const lat = element.lat ?? center?.lat;
    const lng = element.lon ?? center?.lon;
    if (!isValidCoordinate(lat, lng)) continue;
    const categories = categoriesFor(tags);
    if (!categories.length) continue;
    const id = `osm-${element.type}-${element.id}`;
    const actualRegion = regionForPoint(Number(lat), Number(lng));
    if (!actualRegion || (region !== "all" && actualRegion !== region)) continue;
    const address = tags["addr:full"] || [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", ");
    vendors.set(id, {
      id, name: tags.name.trim().slice(0, 200), slug: id, categories, products: [],
      latitude: Number(lat), longitude: Number(lng),
      address: address || "Alamat jalan belum tercatat di OpenStreetMap; lihat titik pada peta.",
      district: tags["addr:district"],
      regency: actualRegion,
      phone: tags["contact:phone"] || tags.phone,
      whatsapp: tags["contact:whatsapp"], openingHours: tags.opening_hours,
      source: "openstreetmap", sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      verificationStatus: "unverified", updatedAt: fetchedAt, isSampleFixture: false
    });
  }
  return { vendors: [...vendors.values()], limited: data.elements.length >= MAX_OSM_RESULTS };
}
