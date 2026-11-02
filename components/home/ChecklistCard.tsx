"use client";

import { Check, ShoppingBag, Trash2, Plus } from "lucide-react";
import type { PlanState } from "./usePlan";

function safeNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

interface ChecklistCardProps {
  plan: PlanState;
}

export default function ChecklistCard({ plan }: ChecklistCardProps) {
  const handleReset = () => {
    if (!confirm("Hapus seluruh rencana dan catatan yang tersimpan di perangkat ini?")) return;
    plan.reset();
  };

  return (
    <section className="surface-card" id="checklist" tabIndex={-1} aria-labelledby="checklist-title">
      <div className="card-heading">
        <span className="icon-circle" aria-hidden="true">
          <Check size={20} />
        </span>
        <div>
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

      {!plan.busy && plan.items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            <ShoppingBag size={28} />
          </span>
          <strong>Belum ada daftar kebutuhan</strong>
          <p>Mulai dengan menata catatan di atas atau tambahkan item manual di bawah.</p>
        </div>
      ) : (
        <div className="item-list">
          {plan.items.map((item, idx) => (
            <article className="item-card" key={item.id}>
              <div className="item-card-top">
                <span className="item-index">{String(idx + 1).padStart(2, "0")}</span>
                <label className="input-label" htmlFor={`item-name-${item.id}`}>
                  Nama bahan / banten
                </label>
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
                  <label htmlFor={`item-price-${item.id}`}>Harga satuan (Rp)</label>
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
          ))}
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
    </section>
  );
}

