export const BALI_REGIONS = [
  { id: "all", label: "Seluruh Bali", center: [-8.38, 115.12], zoom: 9 },
  { id: "Denpasar", label: "Denpasar", center: [-8.66, 115.22], zoom: 12 },
  { id: "Badung", label: "Badung", center: [-8.53, 115.19], zoom: 11 },
  { id: "Gianyar", label: "Gianyar", center: [-8.47, 115.3], zoom: 11 },
  { id: "Tabanan", label: "Tabanan", center: [-8.43, 115.05], zoom: 11 },
  { id: "Jembrana", label: "Jembrana", center: [-8.31, 114.65], zoom: 11 },
  { id: "Buleleng", label: "Buleleng", center: [-8.18, 114.98], zoom: 10 },
  { id: "Bangli", label: "Bangli", center: [-8.31, 115.35], zoom: 11 },
  { id: "Klungkung", label: "Klungkung", center: [-8.66, 115.49], zoom: 10 },
  { id: "Karangasem", label: "Karangasem", center: [-8.37, 115.56], zoom: 11 }
] as const;

export type BaliRegionId = (typeof BALI_REGIONS)[number]["id"];

export function isBaliRegion(value: unknown): value is BaliRegionId {
  return BALI_REGIONS.some((region) => region.id === value);
}

export function getBaliRegion(value: string | undefined) {
  return BALI_REGIONS.find((region) => region.id === value) ?? BALI_REGIONS[0];
}
