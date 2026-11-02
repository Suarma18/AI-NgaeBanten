import assert from "node:assert/strict";
import {
  BANTEN_ANATOMY_GUIDES,
  matchAnatomyGuide,
} from "../lib/banten-anatomy.ts";

console.log("Running self-check test suite for Panduan Visual Anatomi Banten...");

// 1. Verify guides exist
assert.ok(BANTEN_ANATOMY_GUIDES.canang_sari, "Canang Sari guide should exist");
assert.ok(BANTEN_ANATOMY_GUIDES.pejati, "Pejati guide should exist");

// 2. Verify layers
const canang = BANTEN_ANATOMY_GUIDES.canang_sari;
assert.equal(canang.layers.length, 6, "Canang Sari should have 6 structured layers");
assert.equal(canang.rulesOfDirection?.length, 5, "Canang Sari should have 5 flower direction rules");
assert.ok(canang.layers.some(l => l.name.includes("Porosan")), "Must have Porosan Tri Murti layer");

const pejati = BANTEN_ANATOMY_GUIDES.pejati;
assert.equal(pejati.layers.length, 4, "Pejati should have 4 core pillars");
assert.ok(pejati.layers.some(l => l.name.includes("Daksina")), "Must have Daksina pillar");
assert.ok(pejati.layers.some(l => l.name.includes("Peras")), "Must have Peras pillar");
assert.ok(pejati.layers.some(l => l.name.includes("Penyeneng")), "Must have Penyeneng pillar");
assert.ok(pejati.layers.some(l => l.name.includes("Tipat Kelanan")), "Must have Tipat Kelanan pillar");

// 3. Test matcher
assert.equal(matchAnatomyGuide("Banten Pejati 3 tanding")?.id, "pejati");
assert.equal(matchAnatomyGuide("Canang Sari 50 biji")?.id, "canang_sari");
assert.equal(matchAnatomyGuide("Dupa Cendana"), null);

console.log("All Panduan Visual Anatomi Banten tests passed successfully!");

