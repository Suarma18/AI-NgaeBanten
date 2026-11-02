"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Ingredient } from "../../lib/types.ts";
import type { Vendor, VendorFilter, VendorWithDistance } from "../../lib/vendors/types.ts";
import {
  getAllVendors,
  saveCustomVendors,
  clearCustomVendors,
  getActiveShoppingChecklist,
  getFavoriteVendorIds,
  toggleFavoriteVendor,
  queryVendors,
  countVendorsByCategory,
  getBaseVendors,
  getCustomVendors
} from "../../lib/vendors/repository.ts";
import { getBaliRegion, type BaliRegionId } from "../../lib/vendors/regions.ts";
import { sanitizeVendor } from "../../lib/vendors/validation.ts";
import snapshotMetadata from "../../data/vendors.metadata.json";
import StoreSearch from "./StoreSearch.tsx";
import CategoryFilters from "./CategoryFilters.tsx";
import StoreList from "./StoreList.tsx";
import StoreDetailSheet from "./StoreDetailSheet.tsx";
import MapLegend from "./MapLegend.tsx";
import LocationButton from "./LocationButton.tsx";
import DataImportModal from "./DataImportModal.tsx";
import {
  ArrowLeft,
  Store,
  Layers,
  Flower2,
  Database,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

// Client-only dynamic import of the Leaflet MapCanvas to prevent SSR window reference error
const MapCanvas = dynamic(() => import("./MapCanvas.tsx"), {
  ssr: false,
  loading: () => (
    <div className="map-loading-placeholder">
      <div className="map-loading-spinner" />
      <p>Memuat Peta Wilayah Bali...</p>
    </div>
  )
});

export default function BantenMap() {
  const snapshotNotice = `Data OSM per ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Makassar" }).format(new Date(snapshotMetadata.fetchedAt))} dan kurasi. Tekan Cari untuk memperbarui sumber.`;
  const [allVendors, setAllVendors] = useState<Vendor[]>(getBaseVendors);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isListOpen, setIsListOpen] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [sourceNotice, setSourceNotice] = useState(snapshotNotice);
  const [bounds, setBounds] = useState<[number, number, number, number]>();
  const [fitResultsVersion, setFitResultsVersion] = useState(0);
  const [visibleCount, setVisibleCount] = useState(20);
  const searchController = useRef<AbortController | null>(null);

  // Active shopping checklist from planner
  const [shoppingChecklist, setShoppingChecklist] = useState<Ingredient[]>([]);

  // Filter state
  const [filter, setFilter] = useState<VendorFilter>({
    category: "all",
    searchQuery: "",
    sortBy: "relevance",
    onlyVerified: false,
    regency: "all"
  });

  // Load initial data on mount (client-side only)
  useEffect(() => {
    setAllVendors(getAllVendors());
    setFavorites(getFavoriteVendorIds());
    const checklist = getActiveShoppingChecklist();
    setShoppingChecklist(checklist);

    // If shopping checklist has items, default category filter to 'all' but highlight checklist match
  }, []);

  useEffect(() => () => searchController.current?.abort(), []);
  useEffect(() => { setVisibleCount(20); }, [filter, allVendors]);

  const region = getBaliRegion(filter.regency);

  const changeRegion = (regionId: BaliRegionId) => {
    searchController.current?.abort();
    setSearchBusy(false);
    setSearchError("");
    setSelectedVendorId(null);
    setAllVendors(getAllVendors());
    setFilter((previous) => ({ ...previous, regency: regionId }));
    setSourceNotice(snapshotNotice);
  };

  const searchSources = async (query: string, inView = false) => {
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setSearchBusy(true);
    setSearchError("");
    setFilter((previous) => ({ ...previous, searchQuery: query }));
    const params = new URLSearchParams({ region: region.id });
    try {
      if (inView) {
        if (!bounds) throw new Error("Peta belum siap. Coba lagi setelah peta tampil.");
        params.set("bounds", bounds.join(","));
      }
      const response = await fetch(`/api/vendors/search?${params}`, { signal: controller.signal, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pencarian belum berhasil. Coba lagi nanti.");
      if (!Array.isArray(data.vendors)) throw new Error("Hasil pencarian tidak dapat dibaca.");
      if (controller.signal.aborted) return;
      const vendors = new Map<string, Vendor>();
      for (const value of data.vendors) {
        const vendor = sanitizeVendor(value);
        if (vendor && !vendor.isSampleFixture) vendors.set(vendor.id, vendor);
      }
      for (const vendor of getCustomVendors()) if (!vendor.isSampleFixture) vendors.set(vendor.id, vendor);
      setAllVendors([...vendors.values()]);
      setSelectedVendorId(null);
      if (!inView) setFitResultsVersion((previous) => previous + 1);
      const fetchedAt = new Date(data.fetchedAt);
      const dateLabel = Number.isFinite(fetchedAt.getTime()) ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Makassar" }).format(fetchedAt) : "sesi ini";
      setSourceNotice(`OSM diperbarui ${dateLabel}${data.limited ? "; hasil dibatasi, persempit area" : ""}. Konfirmasikan bahan ke penjual.`);
    } catch (error) {
      if (!controller.signal.aborted) setSearchError(error instanceof Error ? error.message : "Pencarian sementara tidak tersedia.");
    } finally {
      if (!controller.signal.aborted) setSearchBusy(false);
    }
  };

  // Auto-hide the location error; cleared on unmount or when a new error replaces it
  useEffect(() => {
    if (!locationError) return;
    const timer = setTimeout(() => setLocationError(""), 5000);
    return () => clearTimeout(timer);
  }, [locationError]);

  // Filtered & enriched vendors
  const filteredVendors = useMemo(() => {
    return queryVendors(
      allVendors,
      filter,
      userLocation || undefined,
      shoppingChecklist
    );
  }, [allVendors, filter, userLocation, shoppingChecklist]);

  // Selected vendor object
  const selectedVendor = useMemo(() => {
    if (!selectedVendorId) return null;
    return filteredVendors.find((v) => v.id === selectedVendorId) || null;
  }, [selectedVendorId, filteredVendors]);

  // Category counts for badges (respect every active filter except category)
  const categoryCounts = useMemo(
    () => countVendorsByCategory(allVendors, filter, shoppingChecklist),
    [allVendors, filter, shoppingChecklist]
  );

  // Handlers
  const handleSelectVendor = useCallback((vendor: VendorWithDistance | null) => {
    if (vendor) {
      setSelectedVendorId(vendor.id);
      setFlyToLocation({ lat: vendor.latitude, lng: vendor.longitude, zoom: 16 });
    } else {
      setSelectedVendorId(null);
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavoriteVendor(id);
    setFavorites(updated);
  }, []);

  // Request browser geolocation with permission handling
  const handleLocateUser = useCallback(() => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Peramban Anda tidak mendukung penentuan lokasi GPS.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
        setLocationLoading(false);
        setFlyToLocation({ lat: coords.lat, lng: coords.lng, zoom: 15 });

        // Auto change sort to distance
        setFilter((prev) => ({ ...prev, sortBy: "distance" }));
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Izin lokasi tidak diberikan. Anda tetap dapat memilih wilayah Bali.");
        } else {
          setLocationError("Gagal mendeteksi lokasi saat ini. Silakan coba lagi.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilter({
      category: "all",
      searchQuery: "",
      sortBy: "relevance",
      onlyVerified: false,
      regency: "all"
    });
    setSelectedVendorId(null);
    searchController.current?.abort();
    setSearchBusy(false);
    setSearchError("");
    setAllVendors(getAllVendors());
    setSourceNotice(snapshotNotice);
  }, []);

  // Custom data import handlers
  const handleImportSuccess = useCallback((imported: Vendor[]) => {
    saveCustomVendors(imported);
    setAllVendors(getAllVendors());
  }, []);

  const handleResetToBase = useCallback(() => {
    clearCustomVendors();
    setAllVendors(getBaseVendors());
  }, []);

  const hasActiveFilters =
    filter.category !== "all" ||
    Boolean(filter.searchQuery.trim()) ||
    filter.onlyVerified ||
    filter.regency !== "all" ||
    filter.sortBy !== "relevance";

  const activeChecklistItemsCount = useMemo(() => {
    return shoppingChecklist.filter((item) => !item.alreadyHave && item.name?.trim()).length;
  }, [shoppingChecklist]);

  return (
    <div className="banten-map-page-wrapper">
      {/* 1. TOP FLOATING NAVIGATION BAR */}
      <header className="banten-map-topbar">
        <div className="topbar-left">
          <Link href="/#beranda" className="topbar-back-btn" aria-label="Kembali ke Beranda">
            <ArrowLeft size={18} />
          </Link>
          <div className="topbar-branding">
            <Link href="/#beranda" className="topbar-logo-mark" aria-label="Beranda AI NgaeBanten">
              <Flower2 size={17} />
            </Link>
            <div>
              <h1 className="topbar-title">Peta Toko Banten</h1>
              <p className="topbar-subtitle">{region.label}</p>
            </div>
          </div>
        </div>

        <div className="topbar-center">
          <StoreSearch
            searchQuery={filter.searchQuery}
            onSearch={(query) => void searchSources(query)}
            regionId={region.id}
            onRegionChange={changeRegion}
            busy={searchBusy}
            resultCount={filteredVendors.length}
            sortBy={filter.sortBy}
            onSortChange={(s) => setFilter((prev) => ({ ...prev, sortBy: s }))}
            onlyVerified={filter.onlyVerified || false}
            onToggleVerified={(v) => setFilter((prev) => ({ ...prev, onlyVerified: v }))}
            hasLocation={Boolean(userLocation)}
            hasChecklist={activeChecklistItemsCount > 0}
          />
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="topbar-action-btn import-btn"
            onClick={() => setIsImportModalOpen(true)}
            title="Kelola & Impor Data Toko"
            aria-label="Kelola dan Impor Data Toko"
          >
            <Database size={16} />
            <span className="btn-label-desktop">Kelola Data</span>
          </button>

          <Link href="/#perencana" className="topbar-action-btn planner-btn" title="Buka Perencana Banten">
            <Layers size={16} />
            <span className="btn-label-desktop">Perencana</span>
          </Link>

          <button
            type="button"
            className={`topbar-action-btn toggle-list-btn ${isListOpen ? "is-open" : ""}`}
            onClick={() => setIsListOpen((prev) => !prev)}
            aria-label={isListOpen ? "Tutup panel daftar toko" : "Buka panel daftar toko"}
            title={isListOpen ? "Tutup panel daftar" : "Buka panel daftar"}
            aria-expanded={isListOpen}
            aria-controls="hasil-toko"
          >
            {isListOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            <span className="btn-label-desktop">Daftar</span>
          </button>
        </div>
      </header>

      {/* 2. FLOATING CATEGORY FILTER BAR */}
      <nav className="banten-map-category-bar" aria-label="Filter kategori toko">
        <CategoryFilters
          activeCategory={filter.category}
          onSelectCategory={(cat) => setFilter((prev) => ({ ...prev, category: cat }))}
          categoryCounts={categoryCounts}
          checklistCount={activeChecklistItemsCount}
        />
      </nav>

      {/* 3. MAIN MAP WORKSPACE */}
      <main className="banten-map-viewport" id="konten-utama" tabIndex={-1} aria-label="Peta dan hasil pencarian toko">
        {/* Leaflet Dynamic Canvas */}
        <MapCanvas
          vendors={filteredVendors}
          selectedVendorId={selectedVendorId}
          onSelectVendor={handleSelectVendor}
          userLocation={userLocation}
          flyToLocation={flyToLocation}
          regionId={region.id}
          onBoundsChange={setBounds}
          fitResultsVersion={fitResultsVersion}
        />

        <button type="button" className="button button-light map-area-search" disabled={searchBusy}
          onClick={() => void searchSources(filter.searchQuery, true)}>
          {searchBusy ? "Mencari…" : "Cari di area ini"}
        </button>

        {/* Floating Controls: Locate Me */}
        <div className="floating-locate-container">
          <LocationButton
            onLocate={handleLocateUser}
            isLoading={locationLoading}
            hasLocation={Boolean(userLocation)}
            errorMessage={locationError}
          />
        </div>

        {/* Floating Controls: Map Legend */}
        <div className="floating-legend-container">
          <MapLegend />
        </div>

        {/* 4. RESULTS SIDE PANEL (Desktop & Mobile Drawer) */}
        {isListOpen && (
          <aside className="banten-store-results-panel" id="hasil-toko" aria-label="Hasil pencarian toko banten">
            <div className="results-panel-header">
              <div className="results-panel-title">
                <Store size={18} className="panel-icon" />
                <div>
                  <strong aria-live="polite">{filteredVendors.length} hasil dimuat</strong>
                  <small>{region.label}</small>
                </div>
              </div>
              <button
                type="button"
                className="panel-close-btn"
                onClick={() => setIsListOpen(false)}
                aria-label="Tutup panel hasil"
              >
                ✕
              </button>
            </div>

            <div className="map-source-status">
              <p role="status">{searchBusy ? "Mengambil data OpenStreetMap…" : sourceNotice}</p>
              {searchError && <p role="alert" className="map-search-error">{searchError} Data yang sudah dimuat tetap ditampilkan.</p>}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">Data © OpenStreetMap contributors · ODbL</a>
            </div>

            <StoreList
              vendors={filteredVendors.slice(0, visibleCount)}
              selectedVendorId={selectedVendorId}
              onSelectVendor={handleSelectVendor}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              activeChecklistCount={activeChecklistItemsCount}
              mapsSearchUrl={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${filter.searchQuery || "toko banten"} ${region.id === "all" ? "Bali" : `${region.label} Bali`}`)}`}
            />
            {filteredVendors.length > visibleCount && (
              <button type="button" className="button button-outline map-load-more" onClick={() => setVisibleCount((count) => count + 20)}>
                Muat 20 hasil berikutnya ({visibleCount}/{filteredVendors.length})
              </button>
            )}
          </aside>
        )}

        {/* 5. STORE DETAIL CARD / BOTTOM SHEET */}
        {selectedVendor && (
          <StoreDetailSheet
            vendor={selectedVendor}
            onClose={() => setSelectedVendorId(null)}
            isFavorite={favorites.includes(selectedVendor.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* 6. DATA IMPORT / EXPORT MODAL */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        onResetToBase={handleResetToBase}
        currentVendors={allVendors}
      />
    </div>
  );
}

