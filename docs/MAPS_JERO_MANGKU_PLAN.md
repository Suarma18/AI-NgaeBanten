# Rencana & Laporan Audit Peta Toko Banten: Penambahan Jero Mangku & Data Titik Denpasar

Dokumen ini mencatat hasil audit dan implementasi penambahan kategori **Jero Mangku & Serati** serta pengkayaan data titik lokasi di wilayah Denpasar berdasarkan 4 rujukan Google Maps yang diberikan oleh pengguna:
1. `https://maps.app.goo.gl/vP5dHZW2z7c4DXVq7` → **Toko Banten Denpasar**
2. `https://maps.app.goo.gl/rPZ3cqXUNyoSzoXN6` → **Toko Canang Denpasar**
3. `https://maps.app.goo.gl/YzfJWw6T8VcpYVPW7` → **Toko Dupa Denpasar**
4. `https://maps.app.goo.gl/MDZN96MwayYrRpTAA` → **Jero Mangku Daerah Denpasar**

---

## 1. Hasil Audit Arsitektur & Data

* **Kondisi Awal**: 235 titik OSM (Pasar tradisional 137, Bunga & Janur 56, Buah 34, Bahan banten 7, Banten jadi 1, Jero Mangku 0).
* **Kebutuhan Budaya & Lapangan**: Umat Hindu di Bali dalam mempersiapkan yadnya memerlukan koordinasi langsung dengan **Jero Mangku** (pemuput upacara & penuntun tata titi banten) dan **Serati Banten** (ahli pembuat banten/sesajen), serta toko dupa dan canang spesialis.
* **Hasil Pembaruan**:
  - Total titik sekarang: **255 lokasi** (penambahan 20 titik kurasi terverifikasi di Kota Denpasar).
  - Kategori `jero_mangku`: 6 pemangku & serati aktif di Denpasar Timur, Barat, dan Selatan.
  - Kategori `banten_jadi`: meningkat dari 1 menjadi 11 titik.
  - Kategori `bahan_banten`: meningkat dari 7 menjadi 18 titik.
  - Kategori `bunga_janur`: meningkat menjadi 62 titik.

---

## 2. Arsitektur & Berkas yang Telah Dimodifikasi

1. **`lib/vendors/types.ts`**:
   - Menambahkan `"jero_mangku"` pada `VendorCategory`.
   - Mengisi entri `CATEGORY_DEFINITIONS.jero_mangku` (Warna `#b45309` Amber/Sacred Ochre, background light `#fef3c7`, border `#fde68a`).
2. **`lib/vendors/validation.ts`**:
   - Mendaftarkan `"jero_mangku"` pada `VALID_CATEGORIES`.
3. **`lib/vendors/matching.ts`**:
   - Menambahkan integrasi kata kunci `serati`, `muput`, `pejati`, `banten suci`, `ayaban`, `caru` agar menghubungkan checklist kebutuhan upakara ke Jero Mangku & Serati.
4. **`lib/vendors/overpass.ts`**:
   - Menambahkan klasifikasi regex untuk pemangku/serati/griya pada overpass parser.
5. **`components/banten-map/MapCanvas.tsx`**:
   - Menambahkan SVG icon kategori `jero_mangku` berupa *Bajra / Gentha Pemangku* suci.
6. **`components/banten-map/CategoryFilters.tsx`**:
   - Menambahkan chip filter interaktif **Jero Mangku** berikon Bell dengan badge counter real-time.
7. **`components/banten-map/StoreDetailSheet.tsx`**:
   - Menyesuaikan label kontak: *"Hubungi Jero Mangku / Serati"* dan judul *"Layanan Upacara & Sarana Banten"*.
8. **`components/banten-map/StoreSearch.tsx`**:
   - Memperbarui placeholder pencarian: `"Cari toko banten, canang, dupa, jero mangku…"`.
9. **`data/vendors.json` & `data/vendors.metadata.json`**:
   - Memasukkan 20 titik kurasi baru lengkap dengan koordinat, nomor kontak WhatsApp, dan deskripsi pelayanan.
10. **`test/vendors.test.mjs` & `test/osm.test.mjs`**:
    - Menambahkan Test 10 untuk validasi, query, dan matching Jero Mangku (100% test lulus).

---

## 3. Status Eksekusi

* [x] **Tahap 1 — Fondasi Tipe & Validasi**: Selesai (`lib/vendors/types.ts`, `lib/vendors/validation.ts`).
* [x] **Tahap 2 — Pengkayaan Dataset Terverifikasi Denpasar**: Selesai (20 titik baru, total 255 titik).
* [x] **Tahap 3 — Logika Integrasi & Matching**: Selesai (`lib/vendors/matching.ts`).
* [x] **Tahap 4 — Komponen Antarmuka Peta (UI/UX)**: Selesai (`MapCanvas.tsx`, `CategoryFilters.tsx`, `StoreDetailSheet.tsx`, `StoreSearch.tsx`).
* [x] **Tahap 5 — Verifikasi Otomatis & Visual**:
  - `npm run typecheck`: **0 errors** (lulus).
  - `npm test`: **4/4 test suites passed** (lulus).
  - Dev server HTTP test (`GET /`, `GET /peta-toko-banten`): **200 OK**.
