"use client";

import { useEffect, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { VendorSortBy } from "../../lib/vendors/types.ts";
import { VENDOR_SORT_OPTIONS } from "../../lib/vendors/types.ts";
import { BALI_REGIONS, isBaliRegion, type BaliRegionId } from "../../lib/vendors/regions.ts";

interface StoreSearchProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  regionId: BaliRegionId;
  onRegionChange: (region: BaliRegionId) => void;
  busy: boolean;
  resultCount: number;
  sortBy: VendorSortBy;
  onSortChange: (sort: VendorSortBy) => void;
  onlyVerified: boolean;
  onToggleVerified: (verified: boolean) => void;
  hasLocation: boolean;
  hasChecklist: boolean;
}

export default function StoreSearch({ searchQuery, onSearch, regionId, onRegionChange, busy, resultCount,
  sortBy, onSortChange, onlyVerified, onToggleVerified, hasLocation, hasChecklist }: StoreSearchProps) {
  const [localText, setLocalText] = useState(searchQuery);
  useEffect(() => { setLocalText(searchQuery); }, [searchQuery]);

  return (
    <form className="search-bar-container" role="search" onSubmit={(event) => { event.preventDefault(); onSearch(localText.trim()); }}>
      <div className="map-search-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} aria-hidden="true" />
          <input type="search" name="store-search" autoComplete="off" className="search-input"
            placeholder="Nama toko, bahan, atau pasar…" maxLength={100}
            value={localText} onChange={(event) => setLocalText(event.target.value)} aria-label="Cari toko banten atau produk upakara" />
          {localText && <button type="button" className="search-clear-button" aria-label="Hapus kata kunci pencarian" onClick={() => setLocalText("")}><X size={16} aria-hidden="true" /></button>}
        </div>
        <button type="submit" className="button button-primary map-search-submit" disabled={busy}>
          {busy ? "Mencari…" : "Cari"}
        </button>
      </div>
      <div className="search-extra-controls">
        <label className="sr-only" htmlFor="store-region">Wilayah pencarian</label>
        <select id="store-region" name="region" className="sort-select region-select" value={regionId}
          onChange={(event) => { if (isBaliRegion(event.target.value)) onRegionChange(event.target.value); }}>
          {BALI_REGIONS.map((region) => <option key={region.id} value={region.id}>{region.label}</option>)}
        </select>
        <div className="sort-select-wrapper">
          <SlidersHorizontal size={14} className="sort-icon" aria-hidden="true" />
          <select className="sort-select" value={sortBy} aria-label="Urutkan daftar toko" onChange={(event) => {
            const value = event.target.value as VendorSortBy;
            if (VENDOR_SORT_OPTIONS.includes(value)) onSortChange(value);
          }}>
            <option value="relevance">Urutkan: Relevan</option>
            {hasChecklist && <option value="match_count">Kategori Paling Cocok</option>}
            {hasLocation && <option value="distance">Jarak Terdekat</option>}
            <option value="name">Nama (A-Z)</option>
          </select>
        </div>
        <label className="verified-toggle-control" title="Hanya lokasi yang telah diperiksa langsung">
          <input type="checkbox" checked={onlyVerified} onChange={(event) => onToggleVerified(event.target.checked)} />
          <span>Dicek lapangan</span>
        </label>
        <span className="result-pill-badge">{resultCount} lokasi</span>
      </div>
    </form>
  );
}
