import type { Ingredient } from "../types.ts";
import type { Vendor, VendorFilter, VendorWithDistance } from "./types.ts";
import { VENDOR_CATEGORIES, CATEGORY_DEFINITIONS } from "./types.ts";
import { calculateHaversineDistance } from "./distance.ts";
import { evaluateChecklistMatch } from "./matching.ts";
import { sanitizeVendor } from "./validation.ts";
import { STORAGE_KEYS } from "../storage-keys.ts";
import baseVendorsJson from "../../data/vendors.json" with { type: "json" };

type LatLng = { lat: number; lng: number };

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Baseline vendors bundled with the application. */
export function getBaseVendors(): Vendor[] {
  return (baseVendorsJson as unknown[])
    .map(sanitizeVendor)
    .filter((v): v is Vendor => v !== null && !v.isSampleFixture);
}

/** Custom or imported vendors from localStorage (client-side only). */
export function getCustomVendors(): Vendor[] {
  const parsed = readJson(STORAGE_KEYS.customVendors);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(sanitizeVendor).filter((v): v is Vendor => v !== null);
}

export function saveCustomVendors(vendors: Vendor[]): boolean {
  return writeJson(STORAGE_KEYS.customVendors, vendors);
}

export function clearCustomVendors(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.customVendors);
  } catch {
    // Storage unavailable
  }
}

/** Base vendors merged with custom vendors (custom overrides base on matching ID). */
export function getAllVendors(): Vendor[] {
  const map = new Map<string, Vendor>();
  for (const v of getBaseVendors()) map.set(v.id, v);
  for (const v of getCustomVendors()) map.set(v.id, v);
  return Array.from(map.values());
}

/** The planner's shopping checklist stored by the home page. */
export function getActiveShoppingChecklist(): Ingredient[] {
  const data = readJson(STORAGE_KEYS.plan) as { items?: unknown } | null;
  return Array.isArray(data?.items) ? (data.items as Ingredient[]) : [];
}

export function getFavoriteVendorIds(): string[] {
  const parsed = readJson(STORAGE_KEYS.favoriteVendors);
  return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
}

export function toggleFavoriteVendor(id: string): string[] {
  const current = getFavoriteVendorIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeJson(STORAGE_KEYS.favoriteVendors, next);
  return next;
}

/** Ascending by distance; vendors without a distance go last. */
function compareDistance(a: VendorWithDistance, b: VendorWithDistance): number {
  const da = a.distanceKm;
  const db = b.distanceKm;
  if (da === undefined && db === undefined) return 0;
  if (da === undefined) return 1;
  if (db === undefined) return -1;
  return da - db;
}

const matchCountOf = (v: VendorWithDistance) => v.checklistMatch?.matchCount ?? 0;

function compareVendors(a: VendorWithDistance, b: VendorWithDistance, sortBy: VendorFilter["sortBy"]): number {
  switch (sortBy) {
    case "distance":
      return compareDistance(a, b);
    case "name":
      return a.name.localeCompare(b.name, "id");
    case "match_count":
      return matchCountOf(b) - matchCountOf(a) || compareDistance(a, b);
    default: {
      // Relevance: checklist matches, then verified, then distance
      const byMatch = matchCountOf(b) - matchCountOf(a);
      if (byMatch) return byMatch;
      if (a.verificationStatus !== b.verificationStatus) {
        return a.verificationStatus === "verified" ? -1 : 1;
      }
      return compareDistance(a, b);
    }
  }
}

function matchesQuery(vendor: Vendor, query: string): boolean {
  const text = [vendor.name, vendor.address, vendor.district, vendor.regency, vendor.description,
    ...vendor.products, ...vendor.categories.map((category) => CATEGORY_DEFINITIONS[category].shortLabel)]
    .filter(Boolean).join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => text.includes(word));
}

/** Filters, enriches (distance + checklist match) and sorts vendors. */
export function queryVendors(
  vendors: Vendor[],
  filter: VendorFilter,
  userLocation?: LatLng,
  checklist: Ingredient[] = []
): VendorWithDistance[] {
  const query = filter.searchQuery.toLowerCase().trim();
  const regency = filter.regency && filter.regency !== "all" ? filter.regency.toLowerCase() : null;

  const results: VendorWithDistance[] = [];

  for (const vendor of vendors) {
    if (vendor.isSampleFixture) continue;
    if (filter.onlyVerified && vendor.verificationStatus !== "verified") continue;
    if (regency && (vendor.regency || "").toLowerCase() !== regency) continue;
    if (query && !matchesQuery(vendor, query)) continue;

    const enriched: VendorWithDistance = { ...vendor };
    if (userLocation) {
      enriched.distanceKm = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        vendor.latitude,
        vendor.longitude
      );
    }
    if (checklist.length > 0) {
      enriched.checklistMatch = evaluateChecklistMatch(checklist, vendor);
    }

    if (filter.category === "checklist_match") {
      if (matchCountOf(enriched) === 0) continue;
    } else if (filter.category !== "all" && !vendor.categories.includes(filter.category)) {
      continue;
    }

    results.push(enriched);
  }

  return results.sort((a, b) => compareVendors(a, b, filter.sortBy));
}

/**
 * Counts per category badge, using every active filter except the category itself,
 * so each badge equals the number of cards shown when that category is selected.
 */
export function countVendorsByCategory(
  vendors: Vendor[],
  filter: VendorFilter,
  checklist: Ingredient[] = []
): Record<string, number> {
  const base = queryVendors(vendors, { ...filter, category: "all" }, undefined, checklist);
  const counts: Record<string, number> = { all: base.length };
  for (const cat of VENDOR_CATEGORIES) {
    counts[cat] = base.filter((v) => v.categories.includes(cat)).length;
  }
  if (checklist.length > 0) {
    counts.checklist_match = base.filter((v) => matchCountOf(v) > 0).length;
  }
  return counts;
}
