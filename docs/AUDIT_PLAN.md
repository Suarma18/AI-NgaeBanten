# Master Audit Plan: AI NgaeBanten (9-Skill Agent Framework)

> **Proyek:** AI NgaeBanten (MVP v0.1 — Bali DigiFest 2026 Innovation Challenge)  
> **Tujuan:** Audit menyeluruh (end-to-end) menggunakan 9 skills yang terdaftar di `.agents/skills` untuk memastikan kualitas kode, arsitektur, keamanan, keaslian estetika budaya Bali, copy tanpa AI-isms, interaktivitas taktil, dan kepatuhan standar web.  
> **Status:** Rencana Kerja Audit (Audit Plan & Methodology)

---

## 1. Konteks & Ruang Lingkup Audit

AI NgaeBanten adalah aplikasi web perencana kebutuhan banten berbasis Next.js (App Router, React 19, TypeScript) yang mengombinasikan ekstraksi multimodal vision (catatan/foto) dengan verifikasi manusia (*human-in-the-loop*), kalkulasi anggaran lokal, dan pencarian pedagang/sarana upakara via peta.

### Cakupan File Repositori yang Diaudit:
- **Frontend & Presentasi:** `app/page.tsx`, `app/globals.css`, `app/layout.tsx`
- **Backend / API Router:** `app/api/analyze/route.ts`
- **Business Logic & Domain Data:** `lib/budget.ts`, `lib/types.ts`, `data/cities.ts`, `data/vendors.example.json`
- **Konfigurasi & Dependensi:** `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`
- **Dokumentasi & Regulasi Lomba:** `PRD_KOMPETISI.md`, `README.md`, `PROMPT_CODEX.md`

---

## 2. Matriks 9 Skills dalam `.agents/skills`

Berikut pemetaan fokus dan kriteria evaluasi untuk masing-masing skill:

| No | Skill | Domain / Fokus | Kriteria Utama yang Diaudit |
|---|---|---|---|
| 1 | `anti-slop-design` | Estetika & Identitas Visual | Menghapus klise visual AI (*purple gradients*, font generic Inter, *uniform rounded corners*, kartu 3-kolom kaku). Memperkuat aksen orisinal khas Bali (*natural earth, palm leaf green, ritual gold, woven textures*). |
| 2 | `caveman` | Kepadatan Informasi & Zero Fluff | Menghapus seremonial kosong, basa-basi berlebih, dan *filler tokens* pada UI strings, helper text, error messages, serta dokumentasi. Prinsip: *Answer first, no fluff, payload verbatim*. |
| 3 | `design-taste-frontend` | Craftsmanship & Anti-Slop Frontend | Evaluasi *Design Read*, kalibrasi 3 Dials (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`), audit tipografi, arsitektur CSS token/variabel, dan *pre-flight checks*. |
| 4 | `humanizer` | Copywriting & Eliminasi AI-isms | Mendeteksi formula klise AI: pola *Not X but Y* ("AI bantu merapikan, Anda tetap menentukan"), *one-line closers*, *forced triads*, *staged openers*, klaim berlebihan, dan pemilihan istilah budaya Bali yang alami. |
| 5 | `micro-interactions` | Taktil & Umpan Balik Gerak | Model Dan Saffer 4-Part (*Trigger → Rules → Feedback → Loops/Modes*), 8-point decision framework, animasi skeleton/shimmer, transisi checklist, fluid physics, serta dukungan `prefers-reduced-motion`. |
| 6 | `ponytail` | Disiplin Solusi Minimalis & YAGNI | Menghapus kompleksitas dini, kode berlebih (*dead code*), memastikan perubahan terkecil yang menyelesaikan masalah secara tuntas tanpa lapisan abstraksi yang tidak perlu. |
| 7 | `ponytail-audit` | Robustness, Security, Scale & Lean | Audit menyeluruh seluruh repo: *edge cases* input/kalkulasi, keamanan API (rate limiting, data leak, payload size), penanganan kegagalan jaringan, penghematan baris kode (*lean*), dan daftar temuan berperingkat (*Must / Should / Nice to have*). |
| 8 | `ponytail-review` | Code-Level Quality & Safety | Tinjauan mendalam per baris kode pada *runtime flow*: deserialisasi `localStorage`, konversi angka `safeNumber`, mutasi state checklist, sanitasi data URL gambar base64, dan penanganan konkurensi. |
| 9 | `web-design-guidelines` | Standar Web & Aksesibilitas (WCAG) | Kepatuhan *Web Interface Guidelines* (Vercel): kontras warna teks dan elemen UI, asosiasi label form `<label for="...">`, ukuran target sentuh (*tap target ≥ 44px*), navigasi keyboard (*focus-visible*), dan semantik HTML. |

---

## 3. Rencana Eksekusi Audit (Fase demi Fase)

### Fase 1: Rekayasa Kode, Keamanan & Ketahanan (`ponytail-audit`, `ponytail-review`, `ponytail`)
1. **Security & API Boundary Check:**
   - Analisis `POST /api/analyze`: ketiadaan rate limiter, mitigasi token exhaustion, pencegahan ReDoS pada regex base64, validasi payload `image_url`.
   - Penyimpanan `localStorage`: risiko kuota browser (5-10MB) jika ada payload tak terduga, migrasi skema versi data lokal.
2. **Logic & Edge Cases:**
   - `lib/budget.ts`: perilaku kalkulasi floating point, penanganan angka negatif, harga 0, atau kuantitas desimal tak lazim.
   - `app/page.tsx`: sanitasi input nama rencana, panjang teks, penanganan kegagalan fetch dengan timeout yang jelas.
3. **Lean Code Audit:**
   - Memeriksa apakah `app/page.tsx` (207 baris, monolitik) perlu modularisasi bersih tanpa over-engineering (YAGNI).
   - Menghapus redundansi tipe dan dependensi yang tidak terpakai.

### Fase 2: Estetika Visual & Identitas Budaya (`anti-slop-design`, `design-taste-frontend`)
1. **Deteksi AI-Slop Visual:**
   - Menilai tipografi: penggunaan font `DM Sans` + `Plus Jakarta Sans` via `@import` CSS (render blocking).
   - Menilai komposisi tata letak: mandala generik di hero section, card dengan bayangan seragam, dan tata letak 4 kartu langkah yang kaku.
2. **Kalibrasi 3 Dials & Design Read:**
   - Menetapkan profil: *Balinese Cultural Planning Utility for Families*, dengan estetika hangat, organik, teratur, dan terpercaya.
   - Konfigurasi: `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 5`, `VISUAL_DENSITY: 4`.
   - Restrukturisasi CSS token: merapikan CSS variables di `globals.css` yang saat ini mencampur hex hardcoded dengan variabel global.

### Fase 3: Interaksi Mikro & Umpan Balik Taktil (`micro-interactions`)
1. **Audit Siklus 4-Part Dan Saffer:**
   - *File picker / upload*: umpan balik saat drag, drop, atau pembatalan foto; ketiadaan skeleton loader saat gambar sedang diproses.
   - *Tombol Analisis AI*: animasi loading state (`busy`), status tombol non-aktif, dan progress visual.
   - *Checklist Management*: transisi penambahan item baru, penghapusan item (exit animation), dan penandaan *checkbox* (*already have* vs *confirmed*).
2. **Physics & Motion Tokens:**
   - Pengecekan spring curves dan durasi transisi (150ms-300ms).
   - Penambahan aturan `@media (prefers-reduced-motion: reduce)` agar animasi ramah bagi pengguna sensitif gerak.

### Fase 4: Bahasa, Copywriting & Kejujuran Budaya (`humanizer`, `caveman`)
1. **Pembersihan AI Writing Tells:**
   - Mengaudit frasa *Not X but Y*:
     - `"AI bantu merapikan, Anda tetap menentukan"`
     - `"Fokus pada persiapan, bukan menentukan benar-salahnya suatu upakara"`
     - `"AI membantu menyusun daftar, bukan mengarang susunan banten"`
     - `"Subtotal sementara, bukan total pasti"`
   - Mengaudit *staged openers & one-line closers*:
     - `"Tumbuh dari tradisi, terbantu teknologi"`
     - `"Persiapan jadi lebih sederhana"`
   - Menghapus inkonsistensi nada: kata santai `"bro"` di baris 96 (`"Masukkan catatan atau unggah foto dulu, bro."`) yang tidak selaras dengan konteks upakara yadnya keluarga Bali.
2. **Prinsip Caveman (Keringkasan Berdensitas Tinggi):**
   - Menghilangkan *filler text* pada helper pesan tanpa mengurangi akurasi disclaimer ritual.

### Fase 5: Aksesibilitas & Standar Web (`web-design-guidelines`)
1. **A11y & Kepatuhan WCAG 2.1 AA:**
   - Hubungan label formulir: input jumlah, satuan, dan harga pada checklist item (baris 193) memiliki `<label>` bersarang tanpa asosiasi `id`/`htmlFor` yang eksplisit.
   - Kontras warna: evaluasi rasio kontras teks sekunder (`#7a897c`, `#849085`, `#9aa59b`) terhadap latar belakang krem `#fbfaf5` (minimal rasio 4.5:1 untuk teks normal).
   - Target sentuh (*Tap Targets*): tombol hapus item (ikon trash) dan checkbox pada layar sentuh ponsel (target area minimal 44x44px).
   - Aksesibilitas Keyboard: indikator fokus (`:focus-visible`), navigasi tab pada formulir perencana, dan trap fokus pada iframe OpenStreetMap.
2. **Kinerja & Web Performance:**
   - Mengganti `@import url('https://fonts.googleapis.com/...')` di `globals.css` dengan `next/font/google` di `layout.tsx` untuk zero layout shift (CLS) dan eliminasi blocking request.

---

## 4. Format Laporan Hasil Audit (Deliverables)

Setelah dokumen plan ini disetujui, eksekusi audit akan menghasilkan:
1. **Laporan Audit Terpadu (Consolidated Audit Report):**
   - Ringkasan Eksekutif & Skor Kesiapan (*Readiness Score* untuk Bali DigiFest 2026).
   - Daftar temuan per kategori skill dengan format standar: *File/Line*, *Problem*, *Fix*, dan *Impact/Risk*.
   - Tabel prioritas perbaikan: **Must Fix (P0)**, **Should Fix (P1)**, dan **Nice to Have (P2)**.
2. **Dokumentasi Patch Code:**
   - Draf rekomendasi perbaikan kode untuk issue P0 & P1.

