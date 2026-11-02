"use client";

import { useEffect, useRef, useState } from "react";
import type { Vendor } from "../../lib/vendors/types.ts";
import { validateVendor, sanitizeVendor } from "../../lib/vendors/validation.ts";
import { X, Upload, Download, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedVendors: Vendor[]) => void;
  onResetToBase: () => void;
  currentVendors: Vendor[];
}

export default function DataImportModal({
  isOpen,
  onClose,
  onImportSuccess,
  onResetToBase,
  currentVendors
}: DataImportModalProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setJsonInput(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    setValidationErrors([]);
    setSuccessNotice("");

    if (!jsonInput.trim()) {
      setValidationErrors(["Mohon masukkan atau unggah data JSON terlebih dahulu."]);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const items = Array.isArray(parsed) ? parsed : parsed.vendors || [parsed];

      const validVendors: Vendor[] = [];
      const errors: string[] = [];

      items.forEach((item: unknown, idx: number) => {
        const check = validateVendor(item);
        if (!check.valid) {
          errors.push(`Baris ${idx + 1}: ${check.errors.join("; ")}`);
        } else {
          const sanitized = sanitizeVendor(item);
          if (sanitized) validVendors.push(sanitized);
        }
      });

      if (errors.length > 0 && validVendors.length === 0) {
        setValidationErrors(errors);
        return;
      }

      onImportSuccess(validVendors);
      setSuccessNotice(`Berhasil menambahkan ${validVendors.length} catatan vendor baru.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setValidationErrors(["Format JSON tidak valid. Pastikan tanda kurung dan petik sesuai aturan JSON."]);
    }
  };

  const handleExportJson = () => {
    const exported = {
      attribution: "OpenStreetMap contributors (ODbL-1.0); user-curated records retain their own source.",
      licenseUrl: "https://www.openstreetmap.org/copyright",
      exportedAt: new Date().toISOString(),
      vendors: currentVendors
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exported, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AI-NgaeBanten-vendors-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <dialog className="import-dialog" ref={dialogRef} aria-labelledby="import-modal-title" onCancel={onClose}>
      <div className="modal-content-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Upload size={18} className="modal-icon" />
            <h3 id="import-modal-title">Kelola & Impor Data Toko Banten</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Tutup jendela impor">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="data-integrity-notice">
            <AlertTriangle size={16} className="warn-icon" />
            <p>
              <strong>Komitmen Integritas Data:</strong> Dilarang memasukkan toko fiktif, koordinat karangan, atau nomor telepon palsu. Data yang dimasukkan disimpan secara lokal pada peramban Anda.
            </p>
          </div>

          <div className="modal-actions-row">
            <label className="file-upload-action-btn">
              <Upload size={15} />
              <span>Unggah File .JSON</span>
              <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="sr-only" />
            </label>

            <button type="button" className="secondary-action-btn" onClick={handleExportJson}>
              <Download size={15} /> Ekspor Data Saat Ini
            </button>

            <button
              type="button"
              className="secondary-action-btn danger-hover"
              onClick={() => {
                if (confirm("Kembalikan ke direktori bawaan OpenStreetMap? Data impor lokal akan dihapus.")) {
                  onResetToBase();
                  onClose();
                }
              }}
            >
              <RotateCcw size={15} /> Reset ke Data Bawaan
            </button>
          </div>

          <div className="json-input-section">
            <label htmlFor="raw-json-textarea">Atau Tempel JSON Toko:</label>
            <textarea
              id="raw-json-textarea"
              className="json-textarea"
              placeholder='[ { "id": "toko-1", "name": "Nama Toko", "categories": ["bunga_janur"], "latitude": -8.65, "longitude": 115.21, "address": "Jl. ...", "verificationStatus": "verified" } ]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>

          {validationErrors.length > 0 && (
            <div className="modal-error-box" role="alert">
              <strong>Terdapat kesalahan validasi:</strong>
              <ul>
                {validationErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {validationErrors.length > 5 && <li>...dan {validationErrors.length - 5} kesalahan lainnya.</li>}
              </ul>
            </div>
          )}

          {successNotice && (
            <div className="modal-success-box" role="status">
              <CheckCircle2 size={16} />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="button button-outline button-sm" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="button button-primary button-sm" onClick={handleProcessImport}>
            Simpan & Terapkan Data
          </button>
        </div>
      </div>
    </dialog>
  );
}

