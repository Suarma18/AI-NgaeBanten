"use client";

import type { VendorCategory } from "../../lib/vendors/types.ts";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types.ts";
import { CheckCircle2, ShoppingBag, Layers, Flower2, Apple, Store, Bell } from "lucide-react";

interface CategoryFiltersProps {
  activeCategory: VendorCategory | "all" | "checklist_match";
  onSelectCategory: (category: VendorCategory | "all" | "checklist_match") => void;
  categoryCounts: Record<string, number>;
  checklistCount: number;
}

export default function CategoryFilters({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  checklistCount
}: CategoryFiltersProps) {
  const categories: Array<{
    id: VendorCategory | "all" | "checklist_match";
    label: string;
    icon: React.ReactNode;
    count: number;
    badgeColor?: string;
  }> = [
    {
      id: "all",
      label: "Semua Kategori",
      icon: <Store size={15} />,
      count: categoryCounts.all || 0
    },
    ...(checklistCount > 0
      ? [
          {
            id: "checklist_match" as const,
            label: "Sesuai Kebutuhan",
            icon: <CheckCircle2 size={15} />,
            count: categoryCounts.checklist_match || 0,
            badgeColor: "#174e3b"
          }
        ]
      : []),
    {
      id: "banten_jadi",
      label: CATEGORY_DEFINITIONS.banten_jadi.shortLabel,
      icon: <ShoppingBag size={15} />,
      count: categoryCounts.banten_jadi || 0
    },
    {
      id: "bahan_banten",
      label: CATEGORY_DEFINITIONS.bahan_banten.shortLabel,
      icon: <Layers size={15} />,
      count: categoryCounts.bahan_banten || 0
    },
    {
      id: "bunga_janur",
      label: CATEGORY_DEFINITIONS.bunga_janur.shortLabel,
      icon: <Flower2 size={15} />,
      count: categoryCounts.bunga_janur || 0
    },
    {
      id: "buah_upakara",
      label: CATEGORY_DEFINITIONS.buah_upakara.shortLabel,
      icon: <Apple size={15} />,
      count: categoryCounts.buah_upakara || 0
    },
    {
      id: "pasar_tradisional",
      label: CATEGORY_DEFINITIONS.pasar_tradisional.shortLabel,
      icon: <Store size={15} />,
      count: categoryCounts.pasar_tradisional || 0
    },
    {
      id: "jero_mangku",
      label: CATEGORY_DEFINITIONS.jero_mangku.shortLabel,
      icon: <Bell size={15} />,
      count: categoryCounts.jero_mangku || 0
    }
  ];

  return (
    <div className="filter-chips-wrapper" role="toolbar" aria-label="Filter kategori toko">
      <div className="filter-chips-scroll">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const isChecklist = cat.id === "checklist_match";

          return (
            <button
              key={cat.id}
              type="button"
              className={`filter-chip ${isActive ? "is-active" : ""} ${isChecklist ? "is-checklist-chip" : ""}`}
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isActive}
            >
              <span className="filter-chip-icon">{cat.icon}</span>
              <span className="filter-chip-label">{cat.label}</span>
              <span className="filter-chip-count">{cat.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

