"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateBudget, rupiah } from "../../lib/budget";
import type { AnalysisResponse, Ingredient } from "../../lib/types";
import { STORAGE_KEYS } from "../../lib/storage-keys";

const MAX_NOTES = 5000;
const MAX_PLAN_NAME = 120;
const MAX_ITEMS = 75;
const MAX_IMAGE_BYTES = 2_500_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const emptyItem = (): Ingredient => ({
  id: newId(),
  name: "",
  quantity: null,
  unit: "",
  note: "",
  needsConfirmation: false,
  confirmed: false,
  unitPrice: null,
  alreadyHave: false,
  source: "manual"
});

function buildPlanText(planName: string, items: Ingredient[], budget: ReturnType<typeof calculateBudget>): string {
  const lines = [
    `AI NgaeBanten — ${planName}`,
    "",
    "DAFTAR KEBUTUHAN BAHAN / SARANA UPAKARA",
    ...items.map((it, idx) => {
      const quantity = it.quantity === null ? "jumlah belum pasti" : `${it.quantity} ${it.unit}`;
      const total =
        it.unitPrice !== null && it.quantity !== null ? rupiah(it.unitPrice * it.quantity) : "harga belum terisi";
      const status = it.alreadyHave ? "SUDAH TERSEDIA" : total;
      const confirm = it.needsConfirmation && !it.confirmed ? " — PERLU DIKONFIRMASI" : "";
      const note = it.note ? ` — Catatan: ${it.note}` : "";
      return `${idx + 1}. ${it.name || "(belum diisi)"} — ${quantity} — ${status}${confirm}${note}`;
    }),
    "",
    `Subtotal kebutuhan yang perlu dibeli: ${rupiah(budget.subtotal)}`,
    `Item belum terisi harga: ${budget.unpricedCount}`,
    "Catatan: Rincian ini adalah alat bantu perencanaan keluarga, bukan ketetapan upakara resmi."
  ];
  return lines.join("\n");
}

/** All planner state, persisted to localStorage so the store map can read the checklist. */
export function usePlan() {
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [items, setItems] = useState<Ingredient[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [planName, setPlanName] = useState("Persiapan banten keluarga");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const budget = useMemo(() => calculateBudget(items), [items]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.plan);
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.notes === "string") setNotes(data.notes.slice(0, MAX_NOTES));
        if (typeof data.planName === "string") setPlanName(data.planName.slice(0, MAX_PLAN_NAME));
        if (Array.isArray(data.items)) setItems(data.items.slice(0, MAX_ITEMS));
      }
    } catch {
      // Storage unavailable or corrupted: start empty
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify({ notes, planName, items }));
    } catch {
      // Storage full or unavailable
    }
  }, [notes, planName, items, hydrated]);

  const updateItem = (id: string, changes: Partial<Ingredient>) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const selectImage = (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Gunakan foto dengan format JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Ukuran foto maksimal 2,5 MB. Kompres dulu sebelum mengunggah.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result ?? ""));
      setImageName(file.name);
    };
    reader.onerror = () => setError("Foto catatan gagal dibaca. Silakan pilih kembali.");
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage("");
    setImageName("");
  };

  async function analyze(): Promise<boolean> {
    setError("");
    setNotice("");
    if (!notes.trim() && !image) {
      setError("Isi catatan atau unggah foto daftar kebutuhan terlebih dahulu.");
      return false;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes, imageDataUrl: image })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menganalisis catatan.");
      const parsed = data as AnalysisResponse;
      const mapped: Ingredient[] = parsed.items.map((item) => ({
        ...emptyItem(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        note: item.note,
        needsConfirmation: item.needs_confirmation,
        source: "ai"
      }));
      setItems(mapped);
      setSummary(parsed.summary);
      setQuestions(parsed.questions);
      setNotice(`${mapped.length} item kebutuhan sudah ditata. Periksa lalu lengkapi harganya.`);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analisis tidak berhasil.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const exportText = () => {
    const blob = new Blob([buildPlanText(planName, items, budget)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-NgaeBanten-${planName.replace(/\s+/g, "-")}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const reset = () => {
    setItems([]);
    setQuestions([]);
    setSummary("");
    setNotes("");
    clearImage();
    setError("");
    setNotice("");
    try {
      localStorage.removeItem(STORAGE_KEYS.plan);
    } catch {
      // Storage unavailable
    }
  };

  return {
    notes, setNotes, image, imageName, selectImage, clearImage,
    items, updateItem, removeItem, addItem,
    questions, summary, planName, setPlanName,
    busy, error, notice, budget,
    analyze, exportText, reset
  };
}

export type PlanState = ReturnType<typeof usePlan>;

export const PLAN_LIMITS = { MAX_NOTES, MAX_PLAN_NAME };

