import Link from "next/link";
import { Map, ArrowRight, Store, CheckCircle2, Navigation } from "lucide-react";
import { CATEGORY_DEFINITIONS } from "../../lib/vendors/types";

export default function MapCtaSection() {
  return (
    <section className="map-section" id="peta">
      <div className="wrap map-layout">
        <div className="map-content">
          <span className="section-kicker">LOKASI & SARANA</span>
          <h2>
            Cari toko banten<br />
            <em>untuk kebutuhan Anda.</em>
          </h2>
          <p>
            Setelah daftar kebutuhan siap, temukan toko banten, sentra bunga dan janur, hingga pasar tradisional terdekat melalui peta interaktif khusus wilayah Bali.
          </p>

          <div className="map-cta-categories" aria-label="Kategori toko pada peta">
            {Object.values(CATEGORY_DEFINITIONS).map((cat) => (
              <span
                key={cat.label}
                className="map-cta-pill"
                style={{ color: cat.color, backgroundColor: cat.bgLight }}
              >
                {cat.label}
              </span>
            ))}
          </div>

          <div className="map-cta-action-wrap">
            <Link className="button button-primary button-lg" href="/peta-toko-banten">
              <Map size={19} aria-hidden="true" />
              <span>Jelajahi peta toko</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <p className="map-disclaimer">
            Peta berisi referensi lokasi di Bali. Periksa status verifikasi tiap lokasi dan hubungi penjual untuk memastikan stok serta jam buka.
          </p>
        </div>

        <div className="map-frame map-preview-card">
          <div className="map-header">
            <span>
              <Store size={16} aria-hidden="true" /> Peta Sentra & Toko Banten
            </span>
            <span className="map-status">Pratinjau ilustrasi</span>
          </div>

          <div className="map-preview-body">
            <div className="map-preview-radar" aria-hidden="true">
              <div className="radar-circle circle-3" />
              <div className="radar-circle circle-2" />
              <div className="radar-circle circle-1" />
              <div className="radar-pin center-pin" title="Titik Temu">
                <Navigation size={18} />
              </div>
              <div className="radar-pin pin-a" title="Pasar Badung">
                <Store size={14} />
              </div>
              <div className="radar-pin pin-b" title="Sentra Janur">
                <Store size={14} />
              </div>
              <div className="radar-pin pin-c" title="Banten Jadi">
                <Store size={14} />
              </div>
            </div>

            <div className="map-preview-highlights">
              <div className="preview-stat">
                <strong>Terhubung Otomatis</strong>
                <span>Mencocokkan item kebutuhan dari perencana</span>
              </div>
              <div className="preview-stat">
                <CheckCircle2 size={16} className="verified-icon" />
                <span>Rute langsung ke Google Maps & kontak pedagang</span>
              </div>
            </div>
          </div>

          <div className="map-foot">
            Dilengkapi estimasi jarak lurus, filter kategori sarana, dan pencarian cepat.
          </div>
        </div>
      </div>
    </section>
  );
}

