"use client";

import type { VendorWithDistance } from "../../lib/vendors/types.ts";
import StoreCard from "./StoreCard.tsx";
import { Store, RefreshCw, CheckCircle2 } from "lucide-react";

interface StoreListProps {
  vendors: VendorWithDistance[];
  selectedVendorId: string | null;
  onSelectVendor: (vendor: VendorWithDistance) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  activeChecklistCount: number;
  mapsSearchUrl: string;
}

export default function StoreList({
  vendors,
  selectedVendorId,
  onSelectVendor,
  favorites,
  onToggleFavorite,
  onResetFilters,
  hasActiveFilters,
  activeChecklistCount,
  mapsSearchUrl
}: StoreListProps) {
  if (vendors.length === 0) {
    return (
      <div className="store-list-empty-state">
        <div className="empty-state-icon-wrap">
          <Store size={28} />
        </div>
        <h4>Belum ditemukan untuk pencarian ini</h4>
        <p>
          Coba wilayah atau kategori lain, nonaktifkan filter lapangan, lalu tekan Cari. Data sumber dapat belum lengkap.
        </p>
        {hasActiveFilters && (
          <button type="button" className="reset-filter-btn" onClick={onResetFilters}>
            <RefreshCw size={14} /> Atur Ulang Filter
          </button>
        )}
        <a className="store-source-link" href={mapsSearchUrl} target="_blank" rel="noopener noreferrer">Lanjutkan pencarian di Google Maps</a>
      </div>
    );
  }

  return (
    <div className="store-list-container" role="feed" aria-label="Daftar toko banten">
      {activeChecklistCount > 0 && (
        <div className="checklist-sync-indicator">
          <CheckCircle2 size={14} className="sync-icon" />
          <span>
            Terhubung dengan <strong>{activeChecklistCount} item kebutuhan</strong> di Perencana
          </span>
        </div>
      )}

      <div className="store-cards-stream">
        {vendors.map((vendor) => (
          <StoreCard
            key={vendor.id}
            vendor={vendor}
            isSelected={vendor.id === selectedVendorId}
            onSelect={onSelectVendor}
            isFavorite={favorites.includes(vendor.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}

