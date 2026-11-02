/**
 * Timeline Belanja Anti-Layu & Perencanaan Rahinan Upakara
 * Mengelompokkan sarana banten berdasarkan daya tahan dan tahapan persiapan tradisional Bali.
 */

export type TimelinePhase = "phase_dry" | "phase_produce" | "phase_fresh";

export interface TimelinePhaseMeta {
  id: TimelinePhase;
  key: string;
  title: string;
  subtitle: string;
  timingBadge: string;
  urgencyLevel: "low" | "medium" | "high";
  colorHex: string;
  bgHex: string;
  borderHex: string;
  traditionalRole: string;
  culturalTip: string;
  storageTip: string;
  recommendedCategoryFilter: string;
}

export const TIMELINE_PHASES: Record<TimelinePhase, TimelinePhaseMeta> = {
  phase_dry: {
    id: "phase_dry",
    key: "phase_dry",
    title: "Bahan Kering & Perlengkapan",
    subtitle: "Dupa, Beras, Klakat, Kelapa Daksina, Benang Tridatu, Piring/Ceper",
    timingBadge: "H-3 atau Lebih Awal",
    urgencyLevel: "low",
    colorHex: "#92400e",
    bgHex: "#fffbeb",
    borderHex: "#fde68a",
    traditionalRole: "Persiapan Dasar (Pondasi Yadnya)",
    culturalTip: "Beli dan cicil lebih awal. Mengamankan bahan kering menghindarkan Anda dari antrean padat dan lonjakan harga di pasar menjelang hari raya.",
    storageTip: "Simpan di tempat bersih, tertutup, dan kering terhindar dari kelembaban dan jangkauan semut.",
    recommendedCategoryFilter: "bahan_banten",
  },
  phase_produce: {
    id: "phase_produce",
    key: "phase_produce",
    title: "Janur Busung, Daun & Buah-buahan",
    subtitle: "Busung Putih/Kuning, Slepan Hijau, Pisang Mas, Apel, Jeruk, Salak",
    timingBadge: "H-2 Sebelum Rahinan",
    urgencyLevel: "medium",
    colorHex: "#166534",
    bgHex: "#f0fdf4",
    borderHex: "#bbf7d0",
    traditionalRole: "Jejaitan & Ngringgit (Merangkai Wadah Banten)",
    culturalTip: "Waktu ideal belanja janur dan buah adalah H-2 pagi. Ini memberi cukup waktu keluarga untuk ngringgit sampian, kojong, dan taledan dengan santai.",
    storageTip: "Percikkan sedikit air tirtha/air bersih pada janur lalu bungkus kain lembab agar tetap lentur saat dirangkai dan tidak patah.",
    recommendedCategoryFilter: "buah",
  },
  phase_fresh: {
    id: "phase_fresh",
    key: "phase_fresh",
    title: "Bunga Segar & Banten Matang (Anti-Layu)",
    subtitle: "Bunga Pacar Air, Sandat, Cempaka, Mitir, Canang Sari, Pejati Jadi",
    timingBadge: "H-1 Sore s/d H-0 Subuh",
    urgencyLevel: "high",
    colorHex: "#b91c1c",
    bgHex: "#fef2f2",
    borderHex: "#fecaca",
    traditionalRole: "Metanding Puncak & Penyerahan Yadnya",
    culturalTip: "Bunga adalah simbol kesucian dan aroma harum persembahan (Satwika). Belanja pada sore H-1 atau subuh H-0 menjamin bunga segar merekah saat dihaturkan.",
    storageTip: "Hamparkan bunga di tampah bambu beralas daun pisang di ruangan sejuk berangin. Jangan ditumpuk tebal atau diikat plastik kedap udara.",
    recommendedCategoryFilter: "bunga_janur",
  },
};

// Regex matches for Balinese ritual goods categorization
const FRESH_KEYWORDS = /\b(bunga|kembang|pacar\s*air|mitir|marigold|cempaka|sandat|kenanga|kamboja|jepun|canang|canangsari|pejati|tumpeng|nasi|porosan|matang|daging|ayam|bebek|lawar|urutan|sate|sate\s*lilit|jajan\s*basah|jajan\s*kukus|pisang\s*goreng|bubur)\b/i;

const PRODUCE_KEYWORDS = /\b(janur|busung|slepan|daun\s*pisang|pisang|apel|jeruk|salak|mangga|semangka|pepaya|tebu|kelapa\s*muda|ketan|tepung|ubi|biu)\b/i;

const DRY_KEYWORDS = /\b(dupa|hio|beras|klakat|kelapa\s*(tua|daksina)?|kelapa|pangi|telur|bebek|ayam\s*hidup|minyak|benang|tridatu|ceper|tamas|kain|wastra|sesari|kue\s*kering|tetimpug|jajan\s*begina|jajan\s*uli|kue|piring|anyaman|bambu)\b/i;

/**
 * Categorizes an item name and note into a ritual timeline preparation phase.
 */
export function categorizeItemPhase(name: string, note?: string): TimelinePhase {
  const combined = `${name || ""} ${note || ""}`.trim().toLowerCase();

  // 1. Fresh takes precedence if explicit fresh flowers or banten matang mentioned
  if (FRESH_KEYWORDS.test(combined)) {
    return "phase_fresh";
  }

  // 2. Janur, foliage, and fresh fruits (need prep H-2)
  if (PRODUCE_KEYWORDS.test(combined)) {
    return "phase_produce";
  }

  // 3. Dry items, durable ritual tools, incense
  if (DRY_KEYWORDS.test(combined)) {
    return "phase_dry";
  }

  // Default heuristic fallback:
  // If mentions "buah" -> produce, if mentions "banten" without "matang" -> fresh or produce
  if (combined.includes("buah")) return "phase_produce";
  if (combined.includes("banten")) return "phase_fresh";

  // General default is produce (H-2)
  return "phase_produce";
}

export interface GroupedTimelineItems<T> {
  phase_dry: T[];
  phase_produce: T[];
  phase_fresh: T[];
  totalCount: number;
}

/**
 * Groups a collection of plan items into the 3 ritual timeline phases.
 */
export function groupItemsByTimeline<T extends { name: string; note?: string }>(
  items: T[]
): GroupedTimelineItems<T> {
  const grouped: GroupedTimelineItems<T> = {
    phase_dry: [],
    phase_produce: [],
    phase_fresh: [],
    totalCount: items.length,
  };

  for (const item of items) {
    const phase = categorizeItemPhase(item.name, item.note);
    grouped[phase].push(item);
  }

  return grouped;
}

