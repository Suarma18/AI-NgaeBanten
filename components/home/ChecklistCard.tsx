"use client";

import { useState } from "react";
import {
  Check,
  ShoppingBag,
  Trash2,
  Plus,
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  Sparkles,
  Info,
  ShieldCheck,
  Layers,
} from "lucide-react";
import type { PlanState } from "./usePlan";
import {
  groupItemsByTimeline,
  TIMELINE_PHASES,
  categorizeItemPhase,
  type TimelinePhase,
} from "../../lib/timeline";
import { evaluateItemPrice } from "../../lib/market-prices";
import { matchAnatomyGuide } from "../../lib/banten-anatomy";
import BantenAnatomyModal from "./BantenAnatomyModal";

function safeNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

interface ChecklistCardProps {
  plan: PlanState;
}

export default function ChecklistCard({ plan }: ChecklistCardProps) {
  const [viewMode, setViewMode] = useState<"all" | "timeline">("all");
  const [selectedAnatomyGuide, setSelectedAnatomyGuide] = useState<"canang_sari" | "pejati" | null>(null);

  const handleReset = () => {
    if (!confirm("Hapus seluruh rencana dan catatan yang tersimpan di perangkat ini?")) return;
    plan.reset();
  };

  const groupedTimeline = groupItemsByTimeline(plan.items);

  const openAnatomy = (guideId: "canang_sari" | "pejati") => {
    setSelectedAnatomyGuide(guideId);
  };

  return (
    <section className="surface-card" id="checklist" tabIndex={-1} aria-labelledby="checklist-title">
      <div className="card-heading">
        <span className="icon-circle" aria-hidden="true">
          <Check size={20} />
        </span>
        <div style={{ flex: 1 }}>
          <h3 id="checklist-title">Daftar bahan & sarana</h3>
          <p>Periksa kembali setiap item dan sesuaikan kebutuhan keluarga.</p>
        </div>
      </div>

      {plan.notice && (
        <div className="alert alert-success" role="status">
          {plan.notice}
        </div>
      )}

      {/* SKELETON LOADING INDICATOR */}
      {plan.busy && (
        <div className="skeleton-loading-box" role="status">
          <span className="sr-only">Sedang memproses catatan…</span>
          <div className="skeleton-item" />
          <div className="skeleton-item" />
          <div className="skeleton-item" />
        </div>
      )}

      {plan.summary && (
        <div className="summary-box">
          <strong>Ringkasan Ekstraksi:</strong>
          <p>{plan.summary}</p>
        </div>
      )}

      {plan.questions.length > 0 && (
        <div className="question-box">
          <strong>Hal yang perlu dipastikan kembali:</strong>
          <ul>
            {plan.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TABS VIEW SWITCHER (Semua Bahan vs Timeline Anti-Layu) */}
      {plan.items.length > 0 && (
        <div className="checklist-tabs-container">
          <div className="checklist-tabs-bar" role="tablist" aria-label="Mode tampilan daftar bahan">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "all"}
              className={`checklist-tab-pill ${viewMode === "all" ? "is-active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              <Layers size={15} aria-hidden="true" />
              <span>Semua Bahan ({plan.items.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "timeline"}
              className={`checklist-tab-pill is-timeline ${viewMode === "timeline" ? "is-active" : ""}`}
              onClick={() => setViewMode("timeline")}
            >
              <Clock size={15} aria-hidden="true" />
              <span>Timeline Belanja Anti-Layu</span>
              <span className="tab-hot-badge">Anti-Layu</span>
            </button>
          </div>
        </div>
      )}

      {!plan.busy && plan.items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <ShoppingBag size={28} />
          </span>
          <strong>Belum ada daftar kebutuhan</strong>
          <p>Mulai dengan menata catatan di atas atau tambahkan item manual di bawah.</p>
        </div>
      ) : viewMode === "timeline" ? (
        /* =========================================================================
           TIMELINE BELANJA "ANTI-LAYU" VIEW (H-3, H-2, H-1/H-0)
           ========================================================================= */
        <div className="timeline-view-wrapper">
          <div className="timeline-intro-banner">
            <div className="timeline-intro-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <strong>Panduan Belanja Terjadwal Menjelang Rahinan</strong>
              <p>
                Bunga segar mudah layu dan janur mengering jika dibeli terlalu awal. Ikuti 3 etape belanja
                tradisional Serati Bali di bawah ini agar sarana upakara tetap segar saat dihaturkan.
              </p>
            </div>
          </div>

          {(["phase_dry", "phase_produce", "phase_fresh"] as TimelinePhase[]).map((phaseKey) => {
            const meta = TIMELINE_PHASES[phaseKey];
            const phaseItems = groupedTimeline[phaseKey];

            return (
              <div key={phaseKey} className={`timeline-phase-card phase-${phaseKey}`}>
                <div className="timeline-phase-header">
                  <div className="timeline-phase-title-row">
                    <span className="phase-timing-badge" style={{ backgroundColor: meta.bgHex, color: meta.colorHex, borderColor: meta.borderHex }}>
                      <Calendar size={13} aria-hidden="true" />
                      {meta.timingBadge}
                    </span>
                    <span className="phase-role-tag">{meta.traditionalRole}</span>
                  </div>
                  <h4 className="phase-name">{meta.title}</h4>
                  <p className="phase-sub">{meta.subtitle}</p>

                  <div className="phase-tip-box">
                    <span className="phase-tip-icon">💡</span>
                    <div>
                      <strong>Tips Serati: </strong>
                      <span>{meta.culturalTip}</span>
                      <div className="phase-storage-note">
                        <em>Penyimpanan: {meta.storageTip}</em>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="phase-items-list">
                  {phaseItems.length === 0 ? (
                    <div className="phase-empty-notice">
                      Tidak ada bahan pada fase ini.
                    </div>
                  ) : (
                    phaseItems.map((item) => {
                      const priceEval = evaluateItemPrice(item.name, item.unitPrice);
                      const anatomyGuide = matchAnatomyGuide(item.name);

                      return (
                        <div key={item.id} className={`timeline-item-row ${item.alreadyHave ? "is-have" : ""}`}>
                          <div className="timeline-item-check">
                            <label className="checkbox-container">
                              <input
                                type="checkbox"
                                checked={item.alreadyHave}
                                onChange={(e) => plan.updateItem(item.id, { alreadyHave: e.target.checked })}
                              />
                              <span className="checkmark" />
                            </label>
                          </div>

                          <div className="timeline-item-main">
                            <div className="timeline-item-name-line">
                              <span className={`item-title-text ${item.alreadyHave ? "text-strikethrough" : ""}`}>
                                {item.name || "(Item tanpa nama)"}
                              </span>
                              {item.alreadyHave && (
                                <span className="have-tag">Ada di rumah</span>
                              )}
                              {anatomyGuide && (
                                <button
                                  type="button"
                                  className="anatomy-badge-trigger"
                                  onClick={() => openAnatomy(anatomyGuide.id)}
                                  title={`Buka anatomi & susunan layer ${anatomyGuide.name}`}
                                >
                                  <BookOpen size={12} aria-hidden="true" />
                                  <span>Lihat Anatomi</span>
                                </button>
                              )}
                            </div>

                            <div className="timeline-item-meta-line">
                              <span className="meta-qty">
                                {item.quantity ? `${item.quantity} ${item.unit || "item"}` : "Jumlah disesuaikan"}
                              </span>
                              {item.unitPrice && (
                                <span className="meta-price">
                                  @ Rp {item.unitPrice.toLocaleString("id-ID")}
                                </span>
                              )}
                              {priceEval.benchmark && (
                                <span className={`price-status-pill ${priceEval.badgeClass}`}>
                                  {priceEval.statusLabel}
                                </span>
                              )}
                            </div>

                            {item.note && (
                              <p className="timeline-item-note">
                                <em>Catatan: {item.note}</em>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick anchor to banten store map with contextual hint */}
                <div className="phase-footer-action">
                  <a
                    href="#banten-map"
                    className="phase-map-anchor"
                    title={`Cari toko banten kategori ${meta.title} di sekitar Denpasar`}
                  >
                    <MapPin size={14} aria-hidden="true" />
                    <span>Cari pedagang {meta.title.toLowerCase()} terdekat di Maps</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================================
           ALL ITEMS (DEFAULT EDITABLE VIEW)
           ========================================================================= */
        <div className="item-list">
          {plan.items.map((item, idx) => {
            const priceEval = evaluateItemPrice(item.name, item.unitPrice);
            const anatomyGuide = matchAnatomyGuide(item.name);
            const itemPhase = categorizeItemPhase(item.name, item.note);
            const phaseMeta = TIMELINE_PHASES[itemPhase];

            return (
              <article className="item-card" key={item.id}>
                <div className="item-card-top">
                  <span className="item-index">{String(idx + 1).padStart(2, "0")}</span>
                  <label className="input-label" htmlFor={`item-name-${item.id}`}>
                    Nama bahan / banten
                  </label>
                  <span
                    className="item-phase-badge"
                    style={{ backgroundColor: phaseMeta.bgHex, color: phaseMeta.colorHex, borderColor: phaseMeta.borderHex }}
                    title={phaseMeta.culturalTip}
                  >
                    {phaseMeta.timingBadge}
                  </span>
                  {anatomyGuide && (
                    <button
                      type="button"
                      className="anatomy-badge-trigger"
                      onClick={() => openAnatomy(anatomyGuide.id)}
                      title={`Buka anatomi layer ${anatomyGuide.name}`}
                    >
                      <BookOpen size={12} aria-hidden="true" />
                      <span>Anatomi Banten</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => plan.removeItem(item.id)}
                    aria-label={`Hapus ${item.name ? item.name : "item nomor " + (idx + 1)}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>

                <input
                  id={`item-name-${item.id}`}
                  className="field item-name"
                  value={item.name}
                  placeholder="Contoh: Pejati, Canang, Bunga Sandat"
                  onChange={(e) => plan.updateItem(item.id, { name: e.target.value })}
                />

                <div className="item-inputs">
                  <div>
                    <label htmlFor={`item-qty-${item.id}`}>Jumlah</label>
                    <input
                      id={`item-qty-${item.id}`}
                      type="number"
                      min="0"
                      step="any"
                      className="field"
                      value={item.quantity ?? ""}
                      placeholder="?"
                      onChange={(e) => plan.updateItem(item.id, { quantity: safeNumber(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label htmlFor={`item-unit-${item.id}`}>Satuan</label>
                    <input
                      id={`item-unit-${item.id}`}
                      className="field"
                      value={item.unit}
                      placeholder="buah/ikat"
                      onChange={(e) => plan.updateItem(item.id, { unit: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="price-label-row">
                      <label htmlFor={`item-price-${item.id}`}>Harga satuan (Rp)</label>
                      {priceEval.benchmark && (
                        <span className="price-benchmark-hint" title={priceEval.benchmark.note}>
                          Acuan: {priceEval.fairRangeText}
                        </span>
                      )}
                    </div>
                    <input
                      id={`item-price-${item.id}`}
                      type="number"
                      min="0"
                      step="100"
                      className="field"
                      placeholder="Belum ada"
                      value={item.unitPrice ?? ""}
                      onChange={(e) => plan.updateItem(item.id, { unitPrice: safeNumber(e.target.value) })}
                    />
                    {item.unitPrice ? (
                      <div className="item-price-eval-tag">
                        <span className={`price-status-pill ${priceEval.badgeClass}`}>
                          {priceEval.statusLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <label htmlFor={`item-note-${item.id}`} className="input-label item-note-label">
                  Catatan tambahan
                </label>
                <input
                  id={`item-note-${item.id}`}
                  className="field"
                  value={item.note}
                  placeholder="Opsional (misal: warna bunga tertentu, ukuran khusus)"
                  onChange={(e) => plan.updateItem(item.id, { note: e.target.value })}
                />

                <div className="item-flags">
                  <label htmlFor={`item-have-${item.id}`} className="check-control">
                    <input
                      id={`item-have-${item.id}`}
                      type="checkbox"
                      checked={item.alreadyHave}
                      onChange={(e) => plan.updateItem(item.id, { alreadyHave: e.target.checked })}
                    />
                    <span>Sudah ada di rumah</span>
                  </label>

                  <label htmlFor={`item-conf-${item.id}`} className="check-control">
                    <input
                      id={`item-conf-${item.id}`}
                      type="checkbox"
                      checked={item.confirmed}
                      onChange={(e) => plan.updateItem(item.id, { confirmed: e.target.checked })}
                    />
                    <span>Sudah diperiksa</span>
                  </label>

                  {item.needsConfirmation && !item.confirmed && (
                    <span className="needs-badge">Perlu dikonfirmasi</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="item-actions">
        <button type="button" className="button button-outline" onClick={plan.addItem}>
          <Plus size={16} aria-hidden="true" /> Tambah item manual
        </button>
        {plan.items.length > 0 && (
          <button type="button" className="button button-ghost" onClick={handleReset}>
            Hapus rencana
          </button>
        )}
      </div>

      {/* ANATOMY MODAL POPUP */}
      {selectedAnatomyGuide && (
        <BantenAnatomyModal
          guideId={selectedAnatomyGuide}
          isOpen={true}
          onClose={() => setSelectedAnatomyGuide(null)}
        />
      )}
    </section>
  );
}
