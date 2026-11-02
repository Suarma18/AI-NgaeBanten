import assert from "node:assert/strict";
import { calculateHaversineDistance, formatDistance } from "../lib/vendors/distance.ts";
import { validateVendor, sanitizeVendor, isValidCoordinate } from "../lib/vendors/validation.ts";
import { itemMatchesVendor, evaluateChecklistMatch } from "../lib/vendors/matching.ts";
import { queryVendors, countVendorsByCategory, getBaseVendors } from "../lib/vendors/repository.ts";
import { BALI_REGIONS, isBaliRegion } from "../lib/vendors/regions.ts";
import { normalizePhone, buildWhatsAppUrl, buildTelUrl } from "../lib/vendors/contact.ts";

console.log("Running comprehensive tests for Banten Store Map & Vendors...");

// Test 1: Haversine distance calculation
{
  // Distance from Pasar Badung (-8.6582, 115.2131) to Pasar Renon (-8.6792, 115.2341)
  const dist = calculateHaversineDistance(-8.6582, 115.2131, -8.6792, 115.2341);
  assert.ok(dist > 3.0 && dist < 4.0, `Expected distance ~3.3km, got ${dist}`);
  assert.equal(formatDistance(3.3), "~3.3 km (jarak lurus)");
  assert.equal(formatDistance(0.45), "~450 m (jarak lurus)");
  assert.equal(calculateHaversineDistance(NaN, 0, 0, 0), Infinity);
}

// Test 2: Coordinate validation
{
  // Denpasar valid coords
  assert.equal(isValidCoordinate(-8.6705, 115.2126), true);
  // Jakarta (outside Bali)
  assert.equal(isValidCoordinate(-6.2088, 106.8456), false);
  // Invalid values
  assert.equal(isValidCoordinate("abc", 115), false);
  assert.equal(isValidCoordinate(null, null), false);
}

// Test 3: Vendor validation & sanitization
{
  const validRaw = {
    id: "test-vendor-1",
    name: "Toko Canang Bu Made",
    categories: ["bunga_janur"],
    products: ["Canang sari", "Janur"],
    latitude: -8.65,
    longitude: 115.21,
    address: "Jl. Gajah Mada No. 10",
    verificationStatus: "verified"
  };

  const validation = validateVendor(validRaw);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);

  const sanitized = sanitizeVendor(validRaw);
  assert.ok(sanitized);
  assert.equal(sanitized.name, "Toko Canang Bu Made");
  assert.equal(sanitized.slug, "toko-canang-bu-made");

  // Invalid vendor (missing required fields)
  const invalidRaw = {
    id: "",
    name: "",
    categories: ["invalid_cat"],
    latitude: 0,
    longitude: 0,
    address: "",
    verificationStatus: "other"
  };
  const invalidValidation = validateVendor(invalidRaw);
  assert.equal(invalidValidation.valid, false);
  assert.ok(invalidValidation.errors.length >= 4);
  assert.equal(sanitizeVendor(invalidRaw), null);
}

// Test 4: Checklist matching logic
{
  const testVendor = {
    id: "v-1",
    name: "Sentra Banten",
    slug: "sentra-banten",
    categories: ["banten_jadi", "bunga_janur"],
    products: ["Pejati siap saji", "Canang sari", "Janur Bali", "Bunga sandat"],
    latitude: -8.65,
    longitude: 115.21,
    address: "Jl. Test",
    verificationStatus: "verified",
    updatedAt: "2026-01-01"
  };

  assert.equal(itemMatchesVendor("pejati 3 buah", testVendor), true);
  assert.equal(itemMatchesVendor("janur 2 ikat", testVendor), true);
  assert.equal(itemMatchesVendor("kambing guling", testVendor), false);

  const checklist = [
    { id: "1", name: "Pejati", quantity: 3, unit: "buah", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: false, source: "manual" },
    { id: "2", name: "Janur", quantity: 2, unit: "ikat", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: false, source: "manual" },
    { id: "3", name: "Bunga Sandat", quantity: 1, unit: "ikat", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: false, source: "manual" },
    { id: "4", name: "Barang Lain Langka", quantity: 1, unit: "buah", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: false, source: "manual" },
    { id: "5", name: "Dupa", quantity: 1, unit: "bungkus", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: true, source: "manual" } // already have -> excluded
  ];

  const matchInfo = evaluateChecklistMatch(checklist, testVendor);
  assert.equal(matchInfo.totalChecklistItems, 4); // 5 total, but 1 is alreadyHave: true
  assert.equal(matchInfo.matchCount, 3);
  assert.equal(matchInfo.matchScore, 75); // 3 of 4 = 75%
}

// Test 5: Querying & Filtering
{
  const mockVendors = [
    {
      id: "v-market",
      name: "Pasar Rakyat",
      slug: "pasar-rakyat",
      categories: ["pasar_tradisional", "bahan_banten"],
      products: ["Dupa", "Beras"],
      latitude: -8.66,
      longitude: 115.21,
      address: "Jl. Denpasar",
      regency: "Denpasar",
      verificationStatus: "verified",
      updatedAt: "2026-01-01"
    },
    {
      id: "v-flower",
      name: "Kios Bunga & Janur Segar",
      slug: "kios-bunga",
      categories: ["bunga_janur"],
      products: ["Janur", "Bunga cempaka"],
      latitude: -8.68,
      longitude: 115.22,
      address: "Jl. Sanur",
      regency: "Denpasar",
      verificationStatus: "unverified",
      updatedAt: "2026-01-01"
    }
  ];

  // Filter by category
  const flowerResults = queryVendors(mockVendors, {
    category: "bunga_janur",
    searchQuery: "",
    sortBy: "relevance"
  });
  assert.equal(flowerResults.length, 1);
  assert.equal(flowerResults[0].id, "v-flower");

  // Search by text "dupa"
  const searchResults = queryVendors(mockVendors, {
    category: "all",
    searchQuery: "dupa",
    sortBy: "relevance"
  });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, "v-market");

  // Filter by only verified
  const verifiedResults = queryVendors(mockVendors, {
    category: "all",
    searchQuery: "",
    onlyVerified: true,
    sortBy: "relevance"
  });
  assert.equal(verifiedResults.length, 1);
  assert.equal(verifiedResults[0].id, "v-market");

  // Distance sorting
  const distanceSorted = queryVendors(
    mockVendors,
    { category: "all", searchQuery: "", sortBy: "distance" },
    { lat: -8.66, lng: 115.21 } // Exact at v-market
  );
  assert.equal(distanceSorted[0].id, "v-market");
  assert.equal(distanceSorted[0].distanceKm, 0);
}

// Test 6: Empty datasets handling
{
  const emptyResults = queryVendors([], {
    category: "all",
    searchQuery: "tidak ada",
    sortBy: "relevance"
  });
  assert.equal(emptyResults.length, 0);

  const emptyMatch = evaluateChecklistMatch([], {
    id: "1",
    name: "Test",
    slug: "test",
    categories: ["banten_jadi"],
    products: [],
    latitude: -8.65,
    longitude: 115.21,
    address: "Jl. Test",
    verificationStatus: "unverified",
    updatedAt: "2026-01-01"
  });
  assert.equal(emptyMatch.matchCount, 0);
  assert.equal(emptyMatch.totalChecklistItems, 0);
}

// Test 7: Distance sort is consistent when distances are missing
{
  const a = { id: "a", name: "A", slug: "a", categories: ["banten_jadi"], products: [], latitude: -8.65, longitude: 115.21, address: "x", verificationStatus: "verified", updatedAt: "2026-01-01" };
  const b = { ...a, id: "b", name: "B", slug: "b" };
  const noLocation = queryVendors([a, b], { category: "all", searchQuery: "", sortBy: "distance" });
  assert.deepEqual(noLocation.map((v) => v.id), ["a", "b"]);
}

// Test 8: Category badge counts respect the verified filter
{
  const verified = { id: "v1", name: "V", slug: "v", categories: ["bunga_janur", "pasar_tradisional"], products: ["Janur"], latitude: -8.65, longitude: 115.21, address: "x", verificationStatus: "verified", updatedAt: "2026-01-01" };
  const unverified = { ...verified, id: "u1", slug: "u", categories: ["bunga_janur"], verificationStatus: "unverified" };
  const counts = countVendorsByCategory([verified, unverified], { category: "bunga_janur", searchQuery: "", sortBy: "relevance", onlyVerified: true });
  assert.equal(counts.all, 1);
  assert.equal(counts.bunga_janur, 1);
  assert.equal(counts.pasar_tradisional, 1);
  assert.equal(counts.banten_jadi, 0);
  assert.equal(counts.checklist_match, undefined);

  const checklist = [{ id: "1", name: "Janur", quantity: 1, unit: "ikat", note: "", needsConfirmation: false, confirmed: true, unitPrice: null, alreadyHave: false, source: "manual" }];
  const withChecklist = countVendorsByCategory([verified, unverified], { category: "all", searchQuery: "", sortBy: "relevance" }, checklist);
  assert.equal(withChecklist.checklist_match, 2);
}

// Test 9: Phone normalization for contact links
{
  assert.equal(normalizePhone("0812-3456-7890"), "6281234567890");
  assert.equal(normalizePhone("+62 812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("812 3456 7890"), "6281234567890");
  assert.equal(normalizePhone("123"), null);
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone(undefined), null);
  assert.equal(buildWhatsAppUrl("0812-3456-7890"), "https://wa.me/6281234567890");
  assert.equal(buildTelUrl("(0361) 222-333"), "tel:+62361222333");
  assert.equal(buildTelUrl("abc"), null);
}

// Public data excludes fixtures, and an unknown region is not silently Denpasar.
{
  const vendors = getBaseVendors();
  assert.ok(vendors.every((vendor) => !vendor.isSampleFixture));
  assert.ok(vendors.every((vendor) => vendor.verificationStatus === "unverified" || vendor.sourceUrl));
  const unknown = sanitizeVendor({ ...vendors[0], id: "unknown-region", regency: undefined });
  assert.ok(unknown);
  assert.equal(unknown.regency, undefined);
  const filter = { category: "all", searchQuery: "", sortBy: "relevance" };
  assert.equal(queryVendors([unknown], { ...filter, regency: "Denpasar" }).length, 0);
  assert.equal(queryVendors([{ ...unknown, isSampleFixture: true }], filter).length, 0);
  assert.equal(BALI_REGIONS.length, 10);
  assert.equal(isBaliRegion("Klungkung"), true);
  assert.equal(isBaliRegion("Jakarta"), false);
}

// Test 10: Jero Mangku & Serati category validation, querying & matching
{
  const jeroMangkuVendor = {
    id: "jm-alit-1",
    name: "Jero Mangku Alit",
    slug: "jero-mangku-alit",
    categories: ["jero_mangku", "banten_jadi"],
    products: ["Muput piodalan", "Konsultasi banten pejati", "Tirta"],
    latitude: -8.6315,
    longitude: 115.2440,
    address: "Jl. Trenggana No. 24, Denpasar",
    regency: "Denpasar",
    phone: "081239112244",
    verificationStatus: "verified",
    updatedAt: "2026-11-02"
  };

  const validation = validateVendor(jeroMangkuVendor);
  assert.equal(validation.valid, true);

  const results = queryVendors([jeroMangkuVendor], {
    category: "jero_mangku",
    searchQuery: "",
    sortBy: "relevance"
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "jm-alit-1");

  // Serati & Pejati matching
  assert.equal(itemMatchesVendor("pejati 3 buah", jeroMangkuVendor), true);
  assert.equal(itemMatchesVendor("muput upacara otonan", jeroMangkuVendor), true);
  assert.equal(itemMatchesVendor("buku pelajaran", jeroMangkuVendor), false);
}

console.log("All Banten Store Map unit tests passed successfully!");

