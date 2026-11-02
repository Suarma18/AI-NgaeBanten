"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { VendorCategory, VendorWithDistance } from "../../lib/vendors/types.ts";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types.ts";
import { getBaliRegion, type BaliRegionId } from "../../lib/vendors/regions.ts";

interface MapCanvasProps {
  vendors: VendorWithDistance[];
  selectedVendorId: string | null;
  onSelectVendor: (vendor: VendorWithDistance | null) => void;
  userLocation: { lat: number; lng: number } | null;
  flyToLocation: { lat: number; lng: number; zoom?: number } | null;
  regionId: BaliRegionId;
  onBoundsChange: (bounds: [number, number, number, number]) => void;
  fitResultsVersion: number;
}

// SVG Icons for Category Markers (32x32 viewBox)
function getCategoryIconSvg(category: VendorCategory): string {
  switch (category) {
    case "banten_jadi":
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-4-4-9-1-10 3-1 4 4 1 10Zm0 0c4-2 9-4 10-1 1 3-4 4-10 1Zm0 0c2 4 4 9 1 10-3 1-4-4-1-10Zm0 0c-4 2-9 4-10 1-1-3 4-4 10-1Z"/><circle cx="12" cy="12" r="2"/></svg>`;
    case "bahan_banten":
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
    case "bunga_janur":
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
    case "buah_upakara":
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>`;
    case "pasar_tradisional":
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`;
    default:
      return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="6"/></svg>`;
  }
}

function createVendorDivIcon(vendor: VendorWithDistance, isSelected: boolean): L.DivIcon {
  const primaryCategory = vendor.categories[0] || "pasar_tradisional";
  const catMeta = CATEGORY_DEFINITIONS[primaryCategory];
  const color = catMeta?.color || "#174e3b";
  const iconSvg = getCategoryIconSvg(primaryCategory);

  const html = `
    <div class="banten-pin-body" style="background-color: ${color};">
      <div class="banten-pin-icon-wrap">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    className: `banten-custom-pin ${isSelected ? "is-active" : ""}`,
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

function createUserLocationDivIcon(): L.DivIcon {
  return L.divIcon({
    className: "user-location-pin",
    html: `
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}


const BALI_VIEW: L.LatLngBoundsExpression = [[-8.9, 114.4], [-8.02, 115.75]];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  return L.divIcon({
    className: "banten-cluster-icon",
    html: `<div class="banten-cluster-inner"><span>${cluster.getChildCount()}</span><small>Toko</small></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
}

export default function MapCanvas({
  vendors,
  selectedVendorId,
  onSelectVendor,
  userLocation,
  flyToLocation,
  regionId,
  onBoundsChange,
  fitResultsVersion
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef(new Map<string, { marker: L.Marker; vendor: VendorWithDistance }>());
  const selectedRef = useRef<string | null>(selectedVendorId);
  const onSelectRef = useRef(onSelectVendor);
  onSelectRef.current = onSelectVendor;
  const [ready, setReady] = useState(false);
  const vendorsRef = useRef(vendors);
  vendorsRef.current = vendors;
  const onBoundsRef = useRef(onBoundsChange);
  onBoundsRef.current = onBoundsChange;

  // 1. Create the map once, then load the clustering plugin (it needs a global `L`)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    let cancelled = false;

    const map = L.map(container, { center: [-8.38, 115.12], zoom: 9, zoomControl: false });
    map.fitBounds(BALI_VIEW, { padding: [24, 24], animate: false });
    L.control.zoom({ position: "topright" }).addTo(map);

    const cartoKey = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY;
    const tileUrl = cartoKey
      ? `https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?key=${cartoKey}`
      : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);
    map.on("click", () => onSelectRef.current(null));
    const reportBounds = () => {
      const bounds = map.getBounds();
      onBoundsRef.current([bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()]);
    };
    map.on("moveend", reportBounds);
    reportBounds();
    mapRef.current = map;

    // Keep Leaflet's size in sync with its container (panels, viewport, bottom sheet)
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    if (typeof window !== "undefined") {
      (window as unknown as { L: typeof L }).L = L;
    }
    (globalThis as unknown as { L: typeof L }).L = L;

    import("leaflet.markercluster")
      .then(() => {
        if (typeof L.markerClusterGroup === "function") {
          return L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 50,
            iconCreateFunction: createClusterIcon
          });
        }
        return L.featureGroup();
      })
      .catch(() => L.featureGroup()) // Clustering is an enhancement; plain markers still work
      .then((layer) => {
        if (cancelled) return;
        map.addLayer(layer);
        layerRef.current = layer;
        setReady(true);
      });

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      userMarkerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // 2. Rebuild markers only when the vendor list changes
  useEffect(() => {
    const layer = layerRef.current;
    if (!ready || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();

    const markers = vendors.map((vendor) => {
      const isSelected = vendor.id === selectedRef.current;
      const marker = L.marker([vendor.latitude, vendor.longitude], {
        icon: createVendorDivIcon(vendor, isSelected),
        title: vendor.name,
        alt: vendor.name,
        zIndexOffset: isSelected ? 1000 : 0
      });
      marker.on("click", () => onSelectRef.current(vendor));
      markersRef.current.set(vendor.id, { marker, vendor });
      return marker;
    });

    if ("addLayers" in layer) (layer as L.MarkerClusterGroup).addLayers(markers);
    else markers.forEach((m) => layer.addLayer(m));
  }, [vendors, ready]);

  // 3. Selection change: restyle only the previous and the new marker
  useEffect(() => {
    const restyle = (id: string | null, isSelected: boolean) => {
      const entry = id ? markersRef.current.get(id) : undefined;
      if (!entry) return;
      entry.marker.setIcon(createVendorDivIcon(entry.vendor, isSelected));
      entry.marker.setZIndexOffset(isSelected ? 1000 : 0);
    };
    restyle(selectedRef.current, false);
    restyle(selectedVendorId, true);
    selectedRef.current = selectedVendorId;
  }, [selectedVendorId, ready]);

  // 4. User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserLocationDivIcon(),
        zIndexOffset: 2000,
        interactive: false,
        keyboard: false
      }).addTo(map);
    }
  }, [userLocation]);

  // 5. Single source of camera movement; instant when the user prefers reduced motion
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToLocation) return;
    const target: L.LatLngTuple = [flyToLocation.lat, flyToLocation.lng];
    const zoom = flyToLocation.zoom ?? 15;
    if (prefersReducedMotion()) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: 0.8 });
  }, [flyToLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const region = getBaliRegion(regionId);
    if (regionId === "all") map.fitBounds(BALI_VIEW, { padding: [24, 24], animate: false });
    else map.setView([region.center[0], region.center[1]], region.zoom, { animate: false });
  }, [regionId]);

  useEffect(() => {
    const map = mapRef.current;
    const currentVendors = vendorsRef.current;
    if (!map || !fitResultsVersion || !currentVendors.length) return;
    map.fitBounds(L.latLngBounds(currentVendors.map((vendor) => [vendor.latitude, vendor.longitude])), {
      padding: [40, 40], maxZoom: 15, animate: false
    });
    // A completed search controls framing; selecting or filtering a card does not reset the camera.
  }, [fitResultsVersion]);

  return (
    <div
      className="map-canvas-container"
      ref={containerRef}
      role="region"
      aria-label="Peta lokasi toko banten"
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    />
  );
}
