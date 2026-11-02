"use client";

import { FileText, Flower2 } from "lucide-react";
import { rupiah } from "../../lib/budget";
import type { PlanState } from "./usePlan";

interface BudgetSidebarProps {
  plan: PlanState;
}

export default function BudgetSidebar({ plan }: BudgetSidebarProps) {
  const hasItems = plan.items.length > 0;
  const hasPrices = plan.budget.pricedCount > 0;
  const awaitingPrices = !hasItems || (!hasPrices && plan.budget.totalCount > 0);

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
          {!hasItems ? "Tambahkan bahan untuk mulai menghitung."
            : plan.budget.totalCount === 0 ? "Semua bahan sudah tersedia di rumah."
            : plan.budget.unpricedCount > 0 ? `${plan.budget.pricedCount} dari ${plan.budget.totalCount} bahan belanja terhitung. Lengkapi jumlah dan harga untuk total keseluruhan.`
            : "Semua bahan belanja sudah masuk estimasi."}
        </p>

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

