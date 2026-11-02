"use client";

import { useRef } from "react";
import { FileText, Camera, Upload, ArrowRight, ScanText, LoaderCircle } from "lucide-react";
import type { PlanState } from "./usePlan";
import { PLAN_LIMITS } from "./usePlan";

const SAMPLE_NOTE = `Catatan dari keluarga (contoh untuk uji ekstraksi kebutuhan):
Pejati 3 buah
Canang 20 buah
Bunga sandat 2 ikat
Janur 3 ikat
Dupa 1 bungkus
Buah — rincian buah pelengkap belum pasti`;

interface PlanInputCardsProps {
  plan: PlanState;
  onAnalysisSuccess?: () => void;
}

export default function PlanInputCards({ plan, onAnalysisSuccess }: PlanInputCardsProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    const success = await plan.analyze();
    if (success) {
      onAnalysisSuccess?.();
      requestAnimationFrame(() => {
        const checklist = document.getElementById("checklist");
        checklist?.focus({ preventScroll: true });
        checklist?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      });
    } else {
      document.getElementById("analysis-error")?.focus();
    }
  };

  return (
    <>
      {/* Card 1: Nama Rencana */}
      <section className="surface-card">
        <div className="card-heading">
          <span className="icon-circle" aria-hidden="true">
            <FileText size={20} />
          </span>
          <div>
            <h3>Nama rencana</h3>
            <p>Beri nama sesuai persiapan keluarga Anda.</p>
          </div>
        </div>
        <label className="input-label" htmlFor="plan-title">
          Nama rencana
        </label>
        <input
          id="plan-title"
          name="plan-title"
          autoComplete="off"
          aria-describedby="plan-title-help"
          className="field"
          value={plan.planName}
          maxLength={PLAN_LIMITS.MAX_PLAN_NAME}
          onChange={(e) => plan.setPlanName(e.target.value)}
        />
        <p className="helper" id="plan-title-help">Contoh: Otonan anak, odalan di sanggah, atau pawiwahan.</p>
      </section>

      {/* Card 2: Catatan Kebutuhan */}
      <section className="surface-card">
        <div className="card-heading">
          <span className="icon-circle" aria-hidden="true">
            <Camera size={20} />
          </span>
          <div>
            <h3>Catatan kebutuhan</h3>
            <p>Dapat berupa teks tertulis atau foto kertas catatan.</p>
          </div>
        </div>

        <label className="input-label" htmlFor="notes">
          Catatan bahan atau banten
        </label>
        <textarea
          id="notes"
          name="notes"
          autoComplete="off"
          aria-describedby="notes-help"
          className="field notes-field"
          placeholder="Contoh: Pejati 3 buah, bunga sandat 2 ikat, janur 3 ikat…"
          value={plan.notes}
          onChange={(e) => plan.setNotes(e.target.value)}
          maxLength={PLAN_LIMITS.MAX_NOTES}
        />

        <div className="input-below">
          <span>{plan.notes.length}/{PLAN_LIMITS.MAX_NOTES} karakter</span>
          <button
            type="button"
            onClick={() => plan.setNotes(SAMPLE_NOTE)}
            className="text-button"
          >
            Isi contoh catatan
          </button>
        </div>

        <input
          id="photo-upload-input"
          aria-label="Unggah foto catatan kebutuhan"
          className="sr-only"
          ref={uploadRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => void plan.selectImage(e.target.files?.[0])}
        />

        <button
          type="button"
          className={`file-picker ${plan.image ? "file-picker-selected" : ""}`}
          onClick={() => uploadRef.current?.click()}
          aria-label="Pilih foto catatan kebutuhan"
        >
          <span className="file-picker-icon" aria-hidden="true">
            <Upload size={22} />
          </span>
          <span>
            <strong>{plan.imageName || "Pilih foto catatan (opsional)"}</strong>
            <small>JPG, PNG, atau WebP · maksimal 2,5 MB</small>
          </span>
          <span className="file-picker-arrow" aria-hidden="true">+</span>
        </button>

        {plan.image && (
          <div className="image-preview">
            <img src={plan.image} alt="Pratinjau foto catatan yang dipilih" width={120} height={95} />
            <button
              type="button"
              onClick={() => {
                plan.clearImage();
                if (uploadRef.current) uploadRef.current.value = "";
              }}
            >
              Hapus foto
            </button>
          </div>
        )}

        <p className="helper privacy-note" id="notes-help">
          Catatan dan foto dikirim untuk diproses AI saat Anda menekan tombol di bawah. Hindari menyertakan nomor telepon atau alamat pribadi.
        </p>

        {plan.error && (
          <div className="alert alert-error" role="alert" id="analysis-error" tabIndex={-1}>
            {plan.error}
          </div>
        )}

        <button
          type="button"
          className="button button-primary analyze-button"
          disabled={plan.busy}
          aria-busy={plan.busy}
          onClick={handleAnalyze}
        >
          {plan.busy ? <LoaderCircle className="spin-icon" size={18} aria-hidden="true" /> : <ScanText size={18} aria-hidden="true" />}
          {plan.busy ? "Sedang menata catatan…" : "Tata catatan dengan AI"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <p className="helper centered">
          Anda juga bisa <a href="#checklist">menambah bahan secara manual</a> tanpa analisis AI.
        </p>
      </section>
    </>
  );
}

