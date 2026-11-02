/**
 * Pantauan Rentang Harga Wajar Pasar Upakara (Bali Banten Price Watch)
 * Basis data acuan harga pasar upakara tradisional Bali (Pasar Badung, Kumbasari, Sanglah, Kreneng).
 */

export interface MarketPriceItem {
  id: string;
  name: string;
  keywords: string[];
  category: "Bunga Segar" | "Daun & Janur" | "Buah" | "Bahan Kering" | "Banten Jadi";
  unit: string;
  normalMin: number;
  normalMax: number;
  surgeMin: number;
  surgeMax: number;
  note: string;
}

export const BALI_MARKET_BENCHMARKS: MarketPriceItem[] = [
  {
    id: "janur_busung",
    name: "Janur Busung Bali",
    keywords: ["busung", "janur", "busung bali", "janur kuning", "janur putih"],
    category: "Daun & Janur",
    unit: "ikat",
    normalMin: 20000,
    normalMax: 35000,
    surgeMin: 45000,
    surgeMax: 80000,
    note: "Harga bergantung musim panen dan pasokan dari Jembrana/Lombok.",
  },
  {
    id: "bunga_pacar_air",
    name: "Bunga Pacar Air (Catur Warna)",
    keywords: ["pacar air", "pacar", "bunga pacar", "bunga merah", "bunga catur warna"],
    category: "Bunga Segar",
    unit: "kg",
    normalMin: 15000,
    normalMax: 25000,
    surgeMin: 40000,
    surgeMax: 75000,
    note: "Paling rentan melonjak tajam saat H-1 Galungan, Kuningan, atau Purnama Kapat.",
  },
  {
    id: "bunga_mitir",
    name: "Bunga Mitir / Marigold Kuning",
    keywords: ["mitir", "marigold", "bunga mitir", "bunga kuning"],
    category: "Bunga Segar",
    unit: "kg",
    normalMin: 18000,
    normalMax: 28000,
    surgeMin: 35000,
    surgeMax: 65000,
    note: "Berasal dari petani Tabanan & Baturiti. Cepat layu bila basah hujan.",
  },
  {
    id: "bunga_sandat",
    name: "Bunga Sandat / Kenanga",
    keywords: ["sandat", "kenanga", "bunga sandat"],
    category: "Bunga Segar",
    unit: "bungkus (±100 kuntum)",
    normalMin: 10000,
    normalMax: 15000,
    surgeMin: 20000,
    surgeMax: 35000,
    note: "Harum semerbak, biasa diisi pada canang sari bagian atas.",
  },
  {
    id: "bunga_cempaka",
    name: "Bunga Cempaka (Putih / Kuning)",
    keywords: ["cempaka", "bunga cempaka"],
    category: "Bunga Segar",
    unit: "bungkus",
    normalMin: 8000,
    normalMax: 12000,
    surgeMin: 15000,
    surgeMax: 25000,
    note: "Pilihan utama canang sari dan canang genten.",
  },
  {
    id: "canang_sari",
    name: "Canang Sari Jadi",
    keywords: ["canang", "canangsari", "canang sari", "canang ceper"],
    category: "Banten Jadi",
    unit: "10 pcs",
    normalMin: 10000,
    normalMax: 15000,
    surgeMin: 20000,
    surgeMax: 30000,
    note: "Satuan eceran rata-rata Rp 1.000 – Rp 1.500 per biji pada hari biasa.",
  },
  {
    id: "banten_pejati",
    name: "Banten Pejati Lengkap (Matang)",
    keywords: ["pejati", "banten pejati", "pajati"],
    category: "Banten Jadi",
    unit: "tanding",
    normalMin: 35000,
    normalMax: 50000,
    surgeMin: 55000,
    surgeMax: 80000,
    note: "Termasuk daksina, peras, penyeneng, tipat kelanan, sampian pesucian.",
  },
  {
    id: "kelapa_daksina",
    name: "Kelapa Daksina (Kelapa Tua Kupas)",
    keywords: ["kelapa", "kelapa daksina", "nyuh"],
    category: "Bahan Kering",
    unit: "butir",
    normalMin: 5000,
    normalMax: 8000,
    surgeMin: 8000,
    surgeMax: 12000,
    note: "Pilih kelapa yang bulat rata dan berbunyi air nyaring.",
  },
  {
    id: "dupa_harum",
    name: "Dupa Harum / Hio",
    keywords: ["dupa", "hio", "dupa harum", "dupa dupa"],
    category: "Bahan Kering",
    unit: "bungkus",
    normalMin: 15000,
    normalMax: 30000,
    surgeMin: 15000,
    surgeMax: 35000,
    note: "Harga relatif stabil sepanjang tahun; hemat bila beli pak besar.",
  },
  {
    id: "pisang_mas",
    name: "Pisang Mas / Pisang Banten",
    keywords: ["pisang", "biu", "pisang mas", "pisang raja"],
    category: "Buah",
    unit: "lirang",
    normalMin: 12000,
    normalMax: 20000,
    surgeMin: 22000,
    surgeMax: 40000,
    note: "Gunakan pisang yang mulus tidak memar.",
  },
];

/**
 * Finds benchmark price for a given ingredient name.
 */
export function findMarketBenchmark(itemName: string): MarketPriceItem | null {
  if (!itemName) return null;
  const normalized = itemName.toLowerCase().trim();

  // 1. Direct keywords match
  for (const item of BALI_MARKET_BENCHMARKS) {
    if (item.keywords.some((kw) => normalized.includes(kw))) {
      return item;
    }
  }

  return null;
}

export type PriceStatus = "not_set" | "under" | "fair_normal" | "fair_surge" | "high";

export interface PriceEvaluation {
  status: PriceStatus;
  statusLabel: string;
  badgeClass: string;
  benchmark: MarketPriceItem | null;
  fairRangeText: string;
}

/**
 * Evaluates whether an entered unit price is within normal or surge market range.
 */
export function evaluateItemPrice(itemName: string, enteredPrice: number | null): PriceEvaluation {
  const benchmark = findMarketBenchmark(itemName);

  if (!benchmark) {
    return {
      status: enteredPrice ? "fair_normal" : "not_set",
      statusLabel: enteredPrice ? "Harga Kustom" : "Belum diisi",
      badgeClass: "badge-neutral",
      benchmark: null,
      fairRangeText: "-",
    };
  }

  const fairRangeText = `Rp ${benchmark.normalMin.toLocaleString("id-ID")} - ${benchmark.normalMax.toLocaleString("id-ID")}`;

  if (!enteredPrice || enteredPrice <= 0) {
    return {
      status: "not_set",
      statusLabel: `Acuan: ${fairRangeText}`,
      badgeClass: "badge-neutral",
      benchmark,
      fairRangeText,
    };
  }

  if (enteredPrice < benchmark.normalMin) {
    return {
      status: "under",
      statusLabel: "Di Bawah Pasar",
      badgeClass: "badge-savings",
      benchmark,
      fairRangeText,
    };
  }

  if (enteredPrice <= benchmark.normalMax) {
    return {
      status: "fair_normal",
      statusLabel: "Wajar Hari Biasa",
      badgeClass: "badge-normal",
      benchmark,
      fairRangeText,
    };
  }

  if (enteredPrice <= benchmark.surgeMax) {
    return {
      status: "fair_surge",
      statusLabel: "Rentang Hari Raya",
      badgeClass: "badge-surge",
      benchmark,
      fairRangeText,
    };
  }

  return {
    status: "high",
    statusLabel: "Di Atas Rata-rata",
    badgeClass: "badge-high",
    benchmark,
    fairRangeText,
  };
}

