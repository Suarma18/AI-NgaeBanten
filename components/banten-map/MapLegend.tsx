"use client";

import { useState } from "react";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types.ts";
import type { VendorCategory } from "../../lib/vendors/types.ts";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = Object.keys(CATEGORY_DEFINITIONS) as VendorCategory[];

  return (
    <div className={`map-legend-card ${isExpanded ? "is-expanded" : "is-collapsed"}`}>
      <button
        type="button"
        className="legend-header-toggle"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-label="Buka atau tutup legenda kategori peta"
      >
        <span className="legend-title">
          <Info size={15} className="legend-info-icon" />
          <span>Legenda Kategori</span>
        </span>
        {isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>

      {isExpanded && (
        <div className="legend-body">
          <ul className="legend-list">
            {categories.map((catKey) => {
              const meta = CATEGORY_DEFINITIONS[catKey];
              return (
                <li key={catKey} className="legend-item">
                  <span
                    className="legend-color-dot"
                    style={{ backgroundColor: meta.color }}
                  />
                  <div className="legend-text">
                    <strong>{meta.shortLabel}</strong>
                    <p>{meta.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="legend-note">
            * Klik salah satu pin penanda di peta untuk melihat alamat, jam buka, dan rute navigasi.
          </div>
        </div>
      )}
    </div>
  );
}

