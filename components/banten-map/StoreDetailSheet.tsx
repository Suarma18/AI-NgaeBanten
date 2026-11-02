"use client";

import type { VendorWithDistance } from "../../lib/vendors/types.ts";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types.ts";
import { formatDistance } from "../../lib/vendors/distance.ts";
import { buildTelUrl, buildWhatsAppUrl } from "../../lib/vendors/contact.ts";
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Share2
} from "lucide-react";
import { useState } from "react";
import { useDialog } from "./useDialog.ts";

interface StoreDetailSheetProps {
  vendor: VendorWithDistance | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export default function StoreDetailSheet({
  vendor,
  onClose,
  isFavorite,
  onToggleFavorite
}: StoreDetailSheetProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const sheetRef = useDialog<HTMLElement>(Boolean(vendor), onClose);

  if (!vendor) return null;

  const primaryCat = vendor.categories[0] || "pasar_tradisional";
  const catMeta = CATEGORY_DEFINITIONS[primaryCat];
  const distanceLabel = formatDistance(vendor.distanceKm);

  // Directions URL using actual coordinates
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`;

  // Contact links only when the recorded number is usable
  const waUrl = buildWhatsAppUrl(vendor.whatsapp);
  const telUrl = buildTelUrl(vendor.phone);

  const handleCopyShare = async () => {
    const text = `${vendor.name}\n${vendor.address}\nKoordinat: ${vendor.latitude}, ${vendor.longitude}\nPeta AI NgaeBanten`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <aside className="store-detail-sheet" aria-labelledby="store-detail-title" ref={sheetRef} tabIndex={-1}>
      <div className="detail-sheet-header">
        <div className="detail-sheet-top-row">
          <div className="detail-badges-group">
            <span
              className="store-category-badge"
              style={{
                backgroundColor: catMeta?.bgLight || "#ecfdf5",
                color: catMeta?.color || "#174e3b",
                borderColor: catMeta?.borderColor || "#a7f3d0"
              }}
            >
              {catMeta?.label || primaryCat}
            </span>

            {vendor.verificationStatus === "verified" ? (
              <span className="store-status-badge is-verified">
                <CheckCircle2 size={13} /> Terverifikasi Lapangan
              </span>
            ) : vendor.isSampleFixture ? (
              <span className="store-status-badge is-simulated">
                <AlertCircle size={13} /> Data Simulasi Uji
              </span>
            ) : (
              <span className="store-status-badge is-unverified">
                Belum Diverifikasi
              </span>
            )}
          </div>

          <div className="detail-header-actions">
            <button
              type="button"
              className={`favorite-bookmark-btn ${isFavorite ? "is-favorite" : ""}`}
              onClick={(e) => onToggleFavorite(vendor.id, e)}
              aria-label={isFavorite ? "Hapus dari simpanan" : "Simpan toko"}
            >
              <Bookmark size={17} fill={isFavorite ? "#9a733e" : "none"} />
            </button>

            <button
              type="button"
              className="detail-close-btn"
              onClick={onClose}
              aria-label="Tutup rincian toko"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <h2 id="store-detail-title" className="detail-store-name">
          {vendor.name}
        </h2>

        {vendor.description && (
          <p className="detail-store-description">{vendor.description}</p>
        )}
      </div>

      <div className="detail-sheet-body">
        {/* Distance & Checklist Match Banner */}
        {(distanceLabel || (vendor.checklistMatch && vendor.checklistMatch.matchCount > 0)) && (
          <div className="detail-insights-banner">
            {distanceLabel && (
              <div className="insight-row">
                <Navigation size={14} className="insight-icon" />
                <span>
                  Jarak dari lokasi Anda: <strong>{distanceLabel}</strong>
                </span>
              </div>
            )}

            {vendor.checklistMatch && vendor.checklistMatch.matchCount > 0 && (
              <div className="insight-row is-checklist">
                <CheckCircle2 size={14} className="insight-icon sparkle-color" />
                <span>
                  Perkiraan kategori cocok untuk <strong>{vendor.checklistMatch.matchCount} dari {vendor.checklistMatch.totalChecklistItems}</strong> kebutuhan Anda. Konfirmasikan bahan ke penjual.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Address and metadata */}
        <section className="detail-meta-section">
          <div className="meta-info-item">
            <MapPin size={16} className="item-icon" />
            <div>
              <strong>Alamat</strong>
              <p>{vendor.address}</p>
              {vendor.district && (
                <span className="sub-meta">
                  Kecamatan {vendor.district}, {vendor.regency || "Bali"}
                </span>
              )}
            </div>
          </div>

          {vendor.openingHours && (
            <div className="meta-info-item">
              <Clock size={16} className="item-icon" />
              <div>
                <strong>Jam Operasional Tercatat</strong>
                <p>{vendor.openingHours}</p>
              </div>
            </div>
          )}

          {vendor.verificationStatus === "verified" && vendor.verifiedAt && (
            <div className="meta-info-item">
              <CheckCircle2 size={16} className="item-icon green-icon" />
              <div>
                <strong>Status Verifikasi</strong>
                <p>
                  Terverifikasi pada {new Date(vendor.verifiedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
          )}
          {vendor.sourceUrl && (
            <div className="meta-info-item">
              <ExternalLink size={16} className="item-icon" aria-hidden="true" />
              <div>
                <strong>Sumber informasi</strong>
                <a className="store-source-link" href={vendor.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {vendor.source === "openstreetmap" ? "Lihat objek di OpenStreetMap" : "Lihat sumber lokasi"}
                </a>
                <p className="sub-meta">Diperbarui pada {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(vendor.updatedAt))}. Belum membuktikan stok atau verifikasi lapangan.</p>
              </div>
            </div>
          )}
        </section>

        {/* Products recorded */}
        {vendor.products && vendor.products.length > 0 && (
          <section className="detail-products-section">
            <h3 className="section-title">Produk & Sarana yang Tercatat</h3>
            <div className="detail-products-grid">
              {vendor.products.map((prod, idx) => (
                <span key={idx} className="detail-product-tag">
                  {prod}
                </span>
              ))}
            </div>
            <p className="detail-disclaimer-note">
              * Ketersediaan stok bahan harian dapat berubah sewaktu-waktu. Disarankan konfirmasi langsung ke pedagang.
            </p>
          </section>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="detail-sheet-footer">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="detail-action-btn is-primary"
        >
          <Navigation size={17} />
          <span>Lihat Rute di Maps</span>
          <ExternalLink size={14} className="ext-icon" />
        </a>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="detail-action-btn is-whatsapp"
          >
            <MessageCircle size={17} />
            <span>Hubungi WhatsApp</span>
          </a>
        )}

        {!waUrl && telUrl && (
          <a href={telUrl} className="detail-action-btn is-outline">
            <Phone size={17} />
            <span>Telepon Penjual</span>
          </a>
        )}

        <button
          type="button"
          className="detail-action-btn is-ghost"
          onClick={handleCopyShare}
        >
          <Share2 size={16} />
          <span aria-live="polite">
            {copyState === "copied" ? "Info tersalin" : copyState === "failed" ? "Gagal menyalin" : "Salin info toko"}
          </span>
        </button>
      </div>
    </aside>
  );
}

