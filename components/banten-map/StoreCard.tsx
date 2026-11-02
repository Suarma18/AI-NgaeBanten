"use client";

import type { VendorWithDistance } from "../../lib/vendors/types.ts";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types.ts";
import { formatDistance } from "../../lib/vendors/distance.ts";
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Bookmark,
  ChevronRight
} from "lucide-react";

interface StoreCardProps {
  vendor: VendorWithDistance;
  isSelected: boolean;
  onSelect: (vendor: VendorWithDistance) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export default function StoreCard({
  vendor,
  isSelected,
  onSelect,
  isFavorite,
  onToggleFavorite
}: StoreCardProps) {
  const primaryCat = vendor.categories[0] || "pasar_tradisional";
  const catMeta = CATEGORY_DEFINITIONS[primaryCat];
  const distanceLabel = formatDistance(vendor.distanceKm);

  return (
    <article
      className={`store-card ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect(vendor)}
    >
      <div className="store-card-header">
        <div className="store-card-badges">
          <span
            className="store-category-badge"
            style={{
              backgroundColor: catMeta?.bgLight || "#ecfdf5",
              color: catMeta?.color || "#174e3b",
              borderColor: catMeta?.borderColor || "#a7f3d0"
            }}
          >
            {catMeta?.shortLabel || primaryCat}
          </span>

          {vendor.verificationStatus === "verified" ? (
            <span className="store-status-badge is-verified" title="Lokasi dan keberadaan pedagang terverifikasi">
              <CheckCircle2 size={12} /> Terverifikasi
            </span>
          ) : vendor.isSampleFixture ? (
            <span className="store-status-badge is-simulated" title="Profil contoh untuk pengujian antarmuka">
              <AlertCircle size={12} /> Simulasi Uji
            </span>
          ) : (
            <span className="store-status-badge is-unverified" title="Belum diverifikasi langsung ke lapangan">
              Belum Diverifikasi
            </span>
          )}
        </div>

        <button
          type="button"
          className={`favorite-bookmark-btn ${isFavorite ? "is-favorite" : ""}`}
          onClick={(e) => onToggleFavorite(vendor.id, e)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Hapus ${vendor.name} dari simpanan` : `Simpan ${vendor.name}`}
        >
          <Bookmark size={16} fill={isFavorite ? "#9a733e" : "none"} />
        </button>
      </div>

      <h3 className="store-card-title">
        {/* The card is clickable for mouse users; this button is the keyboard/screen-reader target */}
        <button
          type="button"
          className="store-card-select-btn"
          aria-current={isSelected ? "true" : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(vendor);
          }}
        >
          {vendor.name}
        </button>
      </h3>

      <div className="store-card-meta">
        <span className="store-address-line">
          <MapPin size={14} className="meta-icon" />
          <span>{vendor.address}</span>
        </span>

        {distanceLabel && (
          <span className="store-distance-badge">
            <Navigation size={12} className="meta-icon" />
            <span>{distanceLabel}</span>
          </span>
        )}
      </div>

      {/* Checklist Match Highlight */}
      {vendor.checklistMatch && vendor.checklistMatch.matchCount > 0 && (
        <div className="checklist-match-callout">
          <div className="checklist-match-header">
            <CheckCircle2 size={13} className="sparkle-icon" />
            <strong>
              Perkiraan kategori cocok: {vendor.checklistMatch.matchCount} dari {vendor.checklistMatch.totalChecklistItems} kebutuhan
            </strong>
          </div>
          <p className="checklist-match-items">
            Bahan yang cocok: {vendor.checklistMatch.matchedItems.slice(0, 3).join(", ")}
            {vendor.checklistMatch.matchedItems.length > 3 ? "..." : ""}
          </p>
        </div>
      )}

      {/* Product tags snippet */}
      {vendor.products && vendor.products.length > 0 && (
        <div className="store-products-chips">
          {vendor.products.slice(0, 4).map((prod, i) => (
            <span key={i} className="product-chip">
              {prod}
            </span>
          ))}
          {vendor.products.length > 4 && (
            <span className="product-chip-more">+{vendor.products.length - 4} lainnya</span>
          )}
        </div>
      )}

      <div className="store-card-footer">
        <span className="store-source-label">{vendor.source === "openstreetmap" ? "Sumber: OpenStreetMap" : "Direktori kurasi"}</span>
        <span className="focus-map-action" aria-hidden="true">
          Tampilkan di peta <ChevronRight size={14} />
        </span>
      </div>
    </article>
  );
}

