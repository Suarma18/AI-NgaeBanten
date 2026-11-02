import assert from "node:assert/strict";
import { categorizeItemPhase, groupItemsByTimeline, TIMELINE_PHASES } from "../lib/timeline.ts";

console.log("Running self-check test suite for Timeline Belanja Anti-Layu...");

// 1. Verify Phase Metadata exists and is complete
assert.ok(TIMELINE_PHASES.phase_dry, "phase_dry must be defined");
assert.ok(TIMELINE_PHASES.phase_produce, "phase_produce must be defined");
assert.ok(TIMELINE_PHASES.phase_fresh, "phase_fresh must be defined");
assert.equal(TIMELINE_PHASES.phase_fresh.timingBadge, "H-1 Sore s/d H-0 Subuh");

// 2. Test dry items categorization
assert.equal(categorizeItemPhase("Dupa Harum Cendana"), "phase_dry");
assert.equal(categorizeItemPhase("Beras Kuning 1 kg"), "phase_dry");
assert.equal(categorizeItemPhase("Klakat Bambu 10 pcs"), "phase_dry");
assert.equal(categorizeItemPhase("Kelapa Daksina"), "phase_dry");
assert.equal(categorizeItemPhase("Benang Tridatu"), "phase_dry");
assert.equal(categorizeItemPhase("Minyak kelapa"), "phase_dry");

// 3. Test produce / foliage / fruits categorization
assert.equal(categorizeItemPhase("Janur Busung Bali"), "phase_produce");
assert.equal(categorizeItemPhase("Slepan Kelapa Hijau"), "phase_produce");
assert.equal(categorizeItemPhase("Pisang Mas 2 lirang"), "phase_produce");
assert.equal(categorizeItemPhase("Apel Fuji & Jeruk"), "phase_produce");
assert.equal(categorizeItemPhase("Salak Bali 1 kg"), "phase_produce");
assert.equal(categorizeItemPhase("Daun pisang"), "phase_produce");

// 4. Test fresh items / flowers / banten matang categorization
assert.equal(categorizeItemPhase("Bunga Pacar Air Catur Warna"), "phase_fresh");
assert.equal(categorizeItemPhase("Bunga Sandat Harum"), "phase_fresh");
assert.equal(categorizeItemPhase("Bunga Cempaka Putih"), "phase_fresh");
assert.equal(categorizeItemPhase("Bunga Mitir Kuning"), "phase_fresh");
assert.equal(categorizeItemPhase("Canang Sari 50 tanding"), "phase_fresh");
assert.equal(categorizeItemPhase("Banten Pejati"), "phase_fresh");
assert.equal(categorizeItemPhase("Ayam Panggang Suci"), "phase_fresh");

// 5. Test grouping function
const mockItems = [
  { name: "Dupa 1 ikat" },
  { name: "Janur Busung 1 ikat" },
  { name: "Bunga Pacar Air 1 kg" },
  { name: "Pisang Mas 1 lirang" },
  { name: "Banten Pejati 3 tanding" },
  { name: "Kelapa Daksina 3 butir" },
];

const grouped = groupItemsByTimeline(mockItems);
assert.equal(grouped.totalCount, 6);
assert.equal(grouped.phase_dry.length, 2); // Dupa, Kelapa Daksina
assert.equal(grouped.phase_produce.length, 2); // Janur, Pisang Mas
assert.equal(grouped.phase_fresh.length, 2); // Bunga Pacar Air, Banten Pejati

console.log("All Timeline Belanja Anti-Layu tests passed successfully!");

