import assert from "node:assert/strict";
import { calculateBudget, rupiah } from "../lib/budget.ts";

console.log("Running self-check test suite for budget calculation...");

// Test Case 1: Empty items list
{
  const result = calculateBudget([]);
  assert.equal(result.subtotal, 0);
  assert.equal(result.pricedCount, 0);
  assert.equal(result.totalCount, 0);
  assert.equal(result.unpricedCount, 0);
  assert.equal(result.alreadyHaveCount, 0);
}

// Test Case 2: Items with prices and alreadyHave flags
{
  const items = [
    { id: "1", name: "Pejati", quantity: 3, unit: "buah", note: "", needsConfirmation: false, confirmed: true, unitPrice: 35000, alreadyHave: false, source: "manual" },
    { id: "2", name: "Canang", quantity: 20, unit: "buah", note: "", needsConfirmation: false, confirmed: true, unitPrice: 2000, alreadyHave: false, source: "manual" },
    { id: "3", name: "Dupa", quantity: 1, unit: "bungkus", note: "", needsConfirmation: false, confirmed: true, unitPrice: 15000, alreadyHave: true, source: "manual" }, // already have -> excluded
    { id: "4", name: "Buah", quantity: null, unit: "porsi", note: "", needsConfirmation: true, confirmed: false, unitPrice: null, alreadyHave: false, source: "ai" } // unpriced
  ];

  const result = calculateBudget(items);
  // (3 * 35000) + (20 * 2000) = 105000 + 40000 = 145000
  assert.equal(result.subtotal, 145000);
  assert.equal(result.pricedCount, 2);
  assert.equal(result.alreadyHaveCount, 1);
  assert.equal(result.totalCount, 3);
  assert.equal(result.unpricedCount, 1);
}

// Test Case 3: Decimal quantity and floating point rounding protection
{
  const items = [
    { id: "1", name: "Bunga", quantity: 2.5, unit: "kg", note: "", needsConfirmation: false, confirmed: true, unitPrice: 15000, alreadyHave: false, source: "manual" }
  ];

  const result = calculateBudget(items);
  // 2.5 * 15000 = 37500 exactly
  assert.equal(result.subtotal, 37500);
}

// Test Case 4: Rupiah formatter output
{
  const formatted = rupiah(145000);
  assert.match(formatted, /145\.000/);
}

console.log("All budget self-check assertions passed successfully!");

