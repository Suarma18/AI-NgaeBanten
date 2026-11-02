import assert from "node:assert/strict";
import {
  BALI_MARKET_BENCHMARKS,
  findMarketBenchmark,
  evaluateItemPrice,
} from "../lib/market-prices.ts";

console.log("Running self-check test suite for Bali Banten Market Prices...");

// 1. Verify benchmarks
assert.ok(BALI_MARKET_BENCHMARKS.length >= 10, "Should have at least 10 key benchmark items");

// 2. Test benchmark lookup
const pejatiBench = findMarketBenchmark("Banten Pejati 3 tanding");
assert.ok(pejatiBench, "Pejati benchmark should be found");
assert.equal(pejatiBench.id, "banten_pejati");
assert.equal(pejatiBench.normalMin, 35000);

const pacarBench = findMarketBenchmark("Bunga pacar air");
assert.ok(pacarBench, "Pacar air benchmark should be found");
assert.equal(pacarBench.category, "Bunga Segar");

// 3. Test price evaluation
const evalUnder = evaluateItemPrice("Pejati", 25000);
assert.equal(evalUnder.status, "under");

const evalNormal = evaluateItemPrice("Pejati", 45000);
assert.equal(evalNormal.status, "fair_normal");
assert.equal(evalNormal.statusLabel, "Wajar Hari Biasa");

const evalSurge = evaluateItemPrice("Pejati", 65000);
assert.equal(evalSurge.status, "fair_surge");
assert.equal(evalSurge.statusLabel, "Rentang Hari Raya");

const evalHigh = evaluateItemPrice("Pejati", 120000);
assert.equal(evalHigh.status, "high");

console.log("All Bali Banten Market Prices tests passed successfully!");

