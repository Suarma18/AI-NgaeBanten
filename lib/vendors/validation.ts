import type { Vendor, VendorCategory } from "./types";

const VALID_CATEGORIES: Set<VendorCategory> = new Set([
  "banten_jadi",
  "bahan_banten",
  "bunga_janur",
  "buah_upakara",
  "pasar_tradisional",
  "jero_mangku"
]);

// Latitude & Longitude bounds for the Bali province region
const BALI_BOUNDS = {
  minLat: -9.1,
  maxLat: -7.9,
  minLng: 114.2,
  maxLng: 115.9
};

function safeSourceUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return (
    lat >= BALI_BOUNDS.minLat &&
    lat <= BALI_BOUNDS.maxLat &&
    lng >= BALI_BOUNDS.minLng &&
    lng <= BALI_BOUNDS.maxLng
  );
}

export function validateVendor(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data vendor harus berupa objek."] };
  }

  const v = data as Record<string, unknown>;

  if (typeof v.id !== "string" || !v.id.trim()) {
    errors.push("ID vendor harus berupa teks tidak kosong.");
  }

  if (typeof v.name !== "string" || !v.name.trim()) {
    errors.push("Nama toko / pasar harus diisi.");
  }

  if (!Array.isArray(v.categories) || v.categories.length === 0) {
    errors.push("Minimal pilih satu kategori vendor yang valid.");
  } else {
    const invalidCategories = v.categories.filter((cat) => !VALID_CATEGORIES.has(cat as VendorCategory));
    if (invalidCategories.length > 0) {
      errors.push(`Kategori tidak valid: ${invalidCategories.join(", ")}`);
    }
  }

  if (!isValidCoordinate(v.latitude, v.longitude)) {
    errors.push(
      `Koordinat tidak valid atau di luar wilayah Bali (Lat: ${BALI_BOUNDS.minLat} s.d ${BALI_BOUNDS.maxLat}, Lng: ${BALI_BOUNDS.minLng} s.d ${BALI_BOUNDS.maxLng}).`
    );
  }

  if (typeof v.address !== "string" || !v.address.trim()) {
    errors.push("Alamat fisik vendor wajib diisi.");
  }

  if (v.verificationStatus !== "verified" && v.verificationStatus !== "unverified") {
    errors.push("Status verifikasi harus 'verified' atau 'unverified'.");
  }

  if (v.products !== undefined && !Array.isArray(v.products)) {
    errors.push("Daftar produk harus berupa array teks.");
  }

  for (const field of ["updatedAt", "verifiedAt"]) {
    if (v[field] !== undefined && (typeof v[field] !== "string" || !Number.isFinite(Date.parse(v[field] as string)))) {
      errors.push(`Tanggal ${field} tidak valid.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function sanitizeVendor(raw: unknown): Vendor | null {
  const check = validateVendor(raw);
  if (!check.valid) return null;

  const v = raw as Record<string, unknown>;
  const categories = (v.categories as string[]).filter((c): c is VendorCategory =>
    VALID_CATEGORIES.has(c as VendorCategory)
  );

  return {
    id: String(v.id),
    name: String(v.name).trim(),
    slug: typeof v.slug === "string" && v.slug.trim() ? v.slug.trim() : String(v.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: typeof v.description === "string" ? v.description.trim() : undefined,
    categories,
    products: Array.isArray(v.products) ? v.products.map(String).map((p) => p.trim()).filter(Boolean) : [],
    latitude: Number(v.latitude),
    longitude: Number(v.longitude),
    address: String(v.address).trim(),
    district: typeof v.district === "string" ? v.district.trim() : undefined,
    regency: typeof v.regency === "string" ? v.regency.trim() || undefined : undefined,
    phone: typeof v.phone === "string" ? v.phone.trim() : undefined,
    whatsapp: typeof v.whatsapp === "string" ? v.whatsapp.trim() : undefined,
    openingHours: typeof v.openingHours === "string" ? v.openingHours.trim() : undefined,
    sourceUrl: safeSourceUrl(v.sourceUrl),
    source: v.source === "openstreetmap" ? "openstreetmap" : "curated",
    verificationStatus: v.verificationStatus === "verified" ? "verified" : "unverified",
    verifiedAt: typeof v.verifiedAt === "string" ? v.verifiedAt : undefined,
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
    isSampleFixture: Boolean(v.isSampleFixture)
  };
}

