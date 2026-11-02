import type { Ingredient } from "./types";
export function calculateBudget(items: Ingredient[]) {
  const toBuy = items.filter((item) => !item.alreadyHave);
  const calculable = toBuy.filter(
    (item) => item.quantity !== null && item.quantity > 0 && item.unitPrice !== null && item.unitPrice >= 0
  );
  return {
    subtotal: Math.round(
      calculable.reduce((total, item) => total + (item.quantity ?? 0) * (item.unitPrice ?? 0), 0)
    ),
    pricedCount: calculable.length,
    totalCount: toBuy.length,
    unpricedCount: toBuy.length - calculable.length,
    alreadyHaveCount: items.filter((item) => item.alreadyHave).length
  };
}
export function rupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR", maximumFractionDigits: 0}).format(n);
}
