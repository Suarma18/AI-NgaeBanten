export type VendorCategory =
  | "banten_jadi"
  | "bahan_banten"
  | "bunga_janur"
  | "buah_upakara"
  | "pasar_tradisional"
  | "jero_mangku";

export type VerificationStatus = "verified" | "unverified";

export type Vendor = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categories: VendorCategory[];
  products: string[];
  latitude: number;
  longitude: number;
  address: string;
  district?: string;
  regency?: string;
  phone?: string;
  whatsapp?: string;
  openingHours?: string;
  sourceUrl?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  updatedAt: string;
  isSampleFixture?: boolean;
  source?: "openstreetmap" | "curated";
};

export type CategoryMeta = {
  id: VendorCategory;
  label: string;
  shortLabel: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
};

export const CATEGORY_DEFINITIONS: Record<VendorCategory, CategoryMeta> = {
  banten_jadi: {
    id: "banten_jadi",
    label: "Banten Jadi & Paket",
    shortLabel: "Banten Jadi",
    color: "#7c3aed",
    bgLight: "#f5f3ff",
    borderColor: "#ddd6fe",
    description: "Paket pejati, canang sari, banten ayaban, dan sesajen siap pakai"
  },
  bahan_banten: {
    id: "bahan_banten",
    label: "Bahan & Sarana Upakara",
    shortLabel: "Bahan Banten",
    color: "#14734d",
    bgLight: "#ecfdf5",
    borderColor: "#a7f3d0",
    description: "Kelapa, daksina, beras kuning, dupa, porosan, dan sarana mentah"
  },
  bunga_janur: {
    id: "bunga_janur",
    label: "Bunga & Janur Segar",
    shortLabel: "Bunga & Janur",
    color: "#946016",
    bgLight: "#fffbeb",
    borderColor: "#fde68a",
    description: "Janur muda, slepan, bunga pacar air, sandat, cempaka, mitir"
  },
  buah_upakara: {
    id: "buah_upakara",
    label: "Buah-buahan Upakara",
    shortLabel: "Buah Upakara",
    color: "#b6420c",
    bgLight: "#fff7ed",
    borderColor: "#ffedd5",
    description: "Pisang mas, apel, jeruk, salak, mangga untuk pelengkap banten"
  },
  pasar_tradisional: {
    id: "pasar_tradisional",
    label: "Pasar Tradisional & Sentra",
    shortLabel: "Pasar Tradisional",
    color: "#2563eb",
    bgLight: "#eff6ff",
    borderColor: "#bfdbfe",
    description: "Pusat pasar rakyat dan pasar desa dengan banyak penjual sarana upakara"
  },
  jero_mangku: {
    id: "jero_mangku",
    label: "Jero Mangku & Serati",
    shortLabel: "Jero Mangku",
    color: "#b45309",
    bgLight: "#fef3c7",
    borderColor: "#fde68a",
    description: "Pelayanan pemangku, serati banten, konsultasi rangkaian yadnya, dan pemuput upacara"
  }
};

export const VENDOR_CATEGORIES = Object.keys(CATEGORY_DEFINITIONS) as VendorCategory[];

export function isVendorCategory(value: unknown): value is VendorCategory {
  return typeof value === "string" && value in CATEGORY_DEFINITIONS;
}

export type VendorSortBy = "relevance" | "distance" | "name" | "match_count";

export const VENDOR_SORT_OPTIONS: VendorSortBy[] = ["relevance", "distance", "name", "match_count"];

export type VendorFilter = {
  category: VendorCategory | "all" | "checklist_match";
  searchQuery: string;
  regency?: string;
  sortBy: VendorSortBy;
  onlyVerified?: boolean;
};

export type ChecklistMatchInfo = {
  matchedItems: string[];
  matchCount: number;
  totalChecklistItems: number;
  matchScore: number;
};

export type VendorWithDistance = Vendor & {
  distanceKm?: number;
  checklistMatch?: ChecklistMatchInfo;
};

