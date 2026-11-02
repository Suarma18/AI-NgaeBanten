import type { Ingredient } from "../types";
import type { ChecklistMatchInfo, Vendor } from "./types";

/**
 * Keyword synonym and category map for Balinese ritual materials
 */
const PRODUCT_CATEGORY_KEYWORDS: Record<string, string[]> = {
  pejati: ["pejati", "daksina", "peras", "banten jadi", "banten"],
  canang: ["canang", "canang sari", "ceper", "porosan", "sampian"],
  daksina: ["daksina", "kelapa daksina", "telur bebek", "beras kuning"],
  janur: ["janur", "busung", "slepan", "ibung", "tali bambu"],
  bunga: ["bunga", "bunga sandat", "cempaka", "pacar air", "mitir", "gumitir", "bunga segar"],
  dupa: ["dupa", "aroma", "hio", "pasupati"],
  buah: ["buah", "pisang", "pisang mas", "apel", "jeruk", "salak", "mangga", "pir"],
  kelapa: ["kelapa", "kelapa gading", "kelapa daksina", "bungkak"],
  beras: ["beras", "ketan", "injin", "benang"],
  minyak: ["minyak kelapa", "minyak wangi"],
  klakat: ["klakat", "ancak", "sokasi", "besek"]
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a checklist item matches a vendor's catalog or known product tags.
 */
export function itemMatchesVendor(itemName: string, vendor: Vendor): boolean {
  const normItem = normalizeText(itemName);
  if (!normItem) return false;

  // 1. Direct match with vendor products array
  for (const product of vendor.products) {
    const normProduct = normalizeText(product);
    if (
      normProduct.includes(normItem) ||
      normItem.includes(normProduct)
    ) {
      return true;
    }
  }

  // Category matches are suggestions to confirm with the seller, not inventory.
  for (const [key, synonyms] of Object.entries(PRODUCT_CATEGORY_KEYWORDS)) {
    const itemHasKey =
      normItem.includes(key) || synonyms.some((syn) => normItem.includes(syn));

    if (itemHasKey) {
      // Check if vendor categories match this keyword type
      if (
        (key === "pejati" && vendor.categories.includes("banten_jadi")) ||
        (key === "canang" && (vendor.categories.includes("banten_jadi") || vendor.categories.includes("bunga_janur"))) ||
        (key === "janur" && vendor.categories.includes("bunga_janur")) ||
        (key === "bunga" && vendor.categories.includes("bunga_janur")) ||
        (key === "buah" && vendor.categories.includes("buah_upakara")) ||
        ((key === "dupa" || key === "daksina" || key === "kelapa" || key === "beras") &&
          vendor.categories.includes("bahan_banten"))
      ) {
        return true;
      }

      // Check if any vendor product mentions the keyword or synonym
      const vendorProductsText = vendor.products.map(normalizeText).join(" ");
      if (
        vendorProductsText.includes(key) ||
        synonyms.some((syn) => vendorProductsText.includes(syn))
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Evaluates a vendor against the active shopping checklist (items not yet owned).
 */
export function evaluateChecklistMatch(
  checklist: Ingredient[],
  vendor: Vendor
): ChecklistMatchInfo {
  // Only consider items that the user still needs to buy (alreadyHave === false) and have a valid name
  const neededItems = checklist.filter(
    (item) => !item.alreadyHave && item.name.trim().length > 0
  );

  if (neededItems.length === 0) {
    return {
      matchedItems: [],
      matchCount: 0,
      totalChecklistItems: 0,
      matchScore: 0
    };
  }

  const matchedItems: string[] = [];

  for (const item of neededItems) {
    if (itemMatchesVendor(item.name, vendor)) {
      matchedItems.push(item.name.trim());
    }
  }

  const matchCount = matchedItems.length;
  const matchScore = Math.round((matchCount / neededItems.length) * 100);

  return {
    matchedItems,
    matchCount,
    totalChecklistItems: neededItems.length,
    matchScore
  };
}

