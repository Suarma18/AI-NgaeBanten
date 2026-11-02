"use client";

import { useState } from "react";
import { FileText, Flower2, TrendingUp, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { rupiah } from "../../lib/budget";
import { BALI_MARKET_BENCHMARKS, findMarketBenchmark } from "../../lib/market-prices";
import type { PlanState } from "./usePlan";

interface BudgetSidebarProps {
  plan: PlanState;
}

export default function BudgetSidebar({ plan }: BudgetSidebarProps) {
  const [showPriceWatch, setShowPriceWatch] = useState(false);
  const [autoFilledCount, setAutoFilledCount] = useState<number | null>(null);

  const hasItems = plan.items.length > 0;
  const hasPrices = plan.budget.pricedCount > 0;
  const awaitingPrices = !hasItems || (!hasPrices && plan.budget.totalCount > 0);

  // Count unpriced items that have market benchmarks
  const unpricedBenchmarkableCount = plan.items.filter((item) => {
    if (item.unitPrice && item.unitPrice > 0) return false;
    return !!findMarketBenchmark(item.name);
  }).length;

  const handleAutoFillMarketPrices = () => {
    let filled = 0;
    plan.items.forEach((item) => {
      if (!item.unitPrice || item.unitPrice <= 0) {
        const bench = findMarketBenchmark(item.name);
        if (bench) {
          const medianPrice = Math.round((bench.normalMin + bench.normalMax) / 2000) * 1000;
          plan.updateItem(item.id, { unitPrice: medianPrice });
          filled++;
        }
      }
    });
    setAutoFilledCount(filled);
    setTimeout(() => setAutoFilledCount(null), 4000);
  };

  return (
    <aside className="planner-aside" aria-label="Ringkasan estimasi anggaran">
      <div className="budget-card">
        <span className="budget-overline">PERKIRAAN ANGGARAN</span>
        <h3>Estimasi Belanja</h3>
        <p>Untuk bahan yang masih perlu dibeli, berdasarkan harga yang Anda isi.</p>

        <div className={`budget-amount ${awaitingPrices ? "budget-amount-empty" : ""}`}>
          {!hasItems ? "Belum ada bahan" : awaitingPrices ? "Belum terhitung" : rupiah(plan.budget.subtotal)}
        </div>
        <p className="budget-subtitle" role="status">
          {!hasItems
            ? "Tambahkan bahan untuk mulai menghitung."
            : plan.budget.totalCount === 0
            ? "Semua bahan sudah tersedia di rumah."
            : plan.budget.unpricedCount > 0
            ? `${plan.budget.pricedCount} dari ${plan.budget.totalCount} bahan belanja terhitung. Lengkapi jumlah dan harga untuk total keseluruhan.`
            : "Semua bahan belanja sudah masuk estimasi."}
        </p>

        {/* Quick Helper: Auto-fill prices from Bali Market Benchmarks */}
        {unpricedBenchmarkableCount > 0 && (
          <div className="budget-autofill-box">
            <button
              type="button"
              className="button-autofill-market"
              onClick={handleAutoFillMarketPrices}
              title="Isi otomatis harga bahan yang belum memiliki estimasi berdasarkan harga wajar pasar Denpasar"
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Isi {unpricedBenchmarkableCount} Bahan Sesuai Acuan Pasar</span>
            </button>
            {autoFilledCount !== null && (
              <span className="autofill-success-msg" role="status">
                <CheckCircle2 size={13} aria-hidden="true" /> {autoFilledCount} harga bahan terisi acuan pasar!
              </span>
            )}
          </div>
        )}

        <div className="budget-divider" />

        <div className="budget-detail">
          <span>Total item terdaftar</span>
          <strong>{plan.items.length}</strong>
        </div>
        <div className="budget-detail">
          <span>Sudah tersedia di rumah</span>
          <strong>{plan.budget.alreadyHaveCount}</strong>
        </div>
        <div className="budget-detail">
          <span>Jumlah / harga belum lengkap</span>
          <strong>{plan.budget.unpricedCount}</strong>
        </div>

        <button
          type="button"
          onClick={plan.exportText}
          disabled={plan.items.length === 0}
          className="button button-light budget-export"
        >
          <FileText size={17} aria-hidden="true" /> Simpan catatan (.txt)
        </button>
      </div>

      {/* =========================================================================
          INOVASI 5: PANTAUAN RENTANG HARGA WAJAR PASAR UPAKARA (BALI BANTEN PRICE WATCH)
          ========================================================================= */}
      <div className="market-watch-card">
        <button
          type="button"
          className="market-watch-toggle"
          onClick={() => setShowPriceWatch(!showPriceWatch)}
          aria-expanded={showPriceWatch}
        >
          <div className="market-watch-title-group">
            <span className="market-watch-icon" aria-hidden="true">
              <TrendingUp size={16} />
            </span>
            <div>
              <strong>Pantauan Harga Pasar Upakara</strong>
              <span className="market-watch-sub">Pasar Badung & Kumbasari</span>
            </div>
          </div>
          {showPriceWatch ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPriceWatch && (
          <div className="market-watch-content">
            <p className="market-watch-desc">
              Rentang harga wajar hari biasa vs potensi lonjakan saat menjelang rahinan besar (Purnama, Galungan, Kuningan).
            </p>

            <div className="market-watch-table">
              {BALI_MARKET_BENCHMARKS.slice(0, 6).map((bench) => (
                <div key={bench.id} className="market-watch-row">
                  <div className="watch-item-meta">
                    <strong>{bench.name}</strong>
                    <span className="watch-unit">per {bench.unit}</span>
                  </div>
                  <div className="watch-prices">
                    <span className="watch-normal-price">
                      Rp {(bench.normalMin / 1000).toFixed(0)}k - {(bench.normalMax / 1000).toFixed(0)}k
                    </span>
                    <span className="watch-surge-price" title="Estimasi saat puncak rahinan besar">
                      Raya: Rp {(bench.surgeMax / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="market-watch-footer-note">
              *Harga aktual dapat berubah tergantung pasokan cuaca dan waktu tawar di pasar tradisional.
            </p>
          </div>
        )}
      </div>

      <div className="aside-note">
        <span className="aside-note-icon" aria-hidden="true">
          <Flower2 size={18} />
        </span>
        <strong>Catatan Penting</strong>
        <p>
          Susunan dan jenis sarana upakara memiliki keragaman menurut desa kala patra serta tradisi keluarga. Selalu konsultasikan dengan serati atau tetua yang membimbing upakara Anda.
        </p>
      </div>
    </aside>
  );
}
