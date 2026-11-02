# Laporan Eksekusi Refactoring — AI NgaeBanten (Round 2)

Refactoring komprehensif telah selesai dieksekusi secara bertahap pada seluruh codebase AI NgaeBanten sesuai rencana di [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) dengan panduan 9 skills di `.agents/skills`.

---

## 1. Ringkasan Metrik Sebelum & Sesudah

| Aspek | Sebelum Refactoring | Sesudah Refactoring | Dampak |
|---|---|---|---|
| **Ukuran `app/page.tsx`** | 938 baris (monolitik) | **25 baris** | Terpecah ke 6 komponen mandiri di `components/home/` |
| **Marker Map Rebuild** | O(n) `clearLayers()` tiap klik | **O(1) update ikon & zIndex** | Peta tidak berkedip saat memilih toko |
| **Camera Animation** | 2 animasi `flyTo` bertabrakan | **1 sumber terpadu** | Gerakan kamera mulus; hormati `prefers-reduced-motion` |
| **Kunci `localStorage`** | String literal tersebar di 3 berkas | **1 konstanta di `lib/storage-keys.ts`** | Aman dari salah ketik (*single source of truth*) |
| **Penggunaan `any`** | 9 penggunaan `any` / `as any` | **0 `any`** | Tipe ketat di `repository.ts`, `MapCanvas`, `StoreSearch` |
| **Aksesibilitas Modal/Sheet** | Tidak bisa ditutup tombol `Escape` | **Hook `useDialog`** | Tutup via `Escape` & kelola fokus keyboard |
| **CSS `transition: all`** | 7 deklarasi `transition: all` | **0 deklarasi** | Transisi spesifik (`background-color`, `transform`, dll.) |
| **Peta Lama di Beranda** | Iframe OSM statis + dropdown kota | **Kartu CTA Peta Interaktif** | Mengarahkan pengguna langsung ke `/peta-toko-banten` |
| **Kode Tak Terpakai** | `data/cities.ts` (13 baris) | **Dihapus** | Kode bersih, tidak ada berkas mati (*dead code*) |
| **Branding Visual** | Ikon `Sparkles` dipakai sebagai logo | **Mark `Flower2` Balinese** | Menghilangkan estetika generik AI (*anti-slop*) |
| **Cakupan Tes Unit** | 6 blok pengujian | **9 blok pengujian** | Tambahan tes sort jarak, hitungan badge, normalisasi telepon |
| **Hasil Build Produksi** | Rentan bentrok chunk dev | **100% Sukses (`next build`)** | Ukuran JS homepage hanya 8.71 kB |

---

## 2. Rincian Eksekusi per Batch

### Batch 1: Penanganan Bug P0
- **A3 (Konsistensi Urutan Jarak)**: Pada `lib/vendors/repository.ts`, fungsi pembanding jarak kini mengembalikan `0` bila kedua vendor sama-sama tidak memiliki data koordinat/jarak, mencegah ketidakstabilan urutan antar mesin JavaScript browser.
- **A4 (Sinkronisasi Hitungan Badge Kategori)**: Menambahkan fungsi `countVendorsByCategory()`. Jumlah pada setiap badge kategori kini konsisten menyaring data berdasarkan filter aktif lainnya (seperti toggle `onlyVerified`), sehingga angka pada badge selalu cocok dengan kartu yang ditampilkan.
- **A5 (Normalisasi Kontak & Feedback Clipboard)**: Membuat helper `lib/vendors/contact.ts` (`normalizePhone`, `buildWhatsAppUrl`, `buildTelUrl`). Pada `StoreDetailSheet.tsx`, penyalinan info toko di-`await` dengan umpan balik visual (*"Info tersalin"* / *"Gagal menyalin"*).

### Batch 2: Refactoring Lib & Tipe Data
- Membuat `lib/storage-keys.ts` untuk menyimpan kunci penyimpanan peramban: `plan`, `customVendors`, dan `favoriteVendors`.
- Memvalidasi pembacaan ID toko favorit agar selalu menghasilkan `string[]`.
- Menghilangkan casting `as any` pada pengurutan `StoreSearch.tsx` dan penyaringan kategori di `lib/vendors/repository.ts`.

### Batch 3: Optimalisasi MapCanvas
- Pada `MapCanvas.tsx`, pembuatan marker kini hanya dipicu bila daftar `vendors` berubah. Perubahan `selectedVendorId` hanya memperbarui marker lama dan baru melalui `marker.setIcon()` dan `marker.setZIndexOffset()`.
- Menghilangkan panggilan `map.flyTo()` di dalam event click marker untuk mencegah tabrakan dengan handler utama di `BantenMap.tsx`.
- Menambahkan pemeriksaan `prefers-reduced-motion`: jika pengguna mengaktifkan mode kurangi animasi di sistem operasi mereka, peta berpindah seketika menggunakan `map.setView()` tanpa efek geser berlebihan.
- Menggunakan `ResizeObserver` agar Leaflet secara otomatis memperbarui ukurannya (`map.invalidateSize()`) saat panel hasil pencarian dibuka/tutup.

### Batch 4: Aksesibilitas & Mikro-Interaksi
- Membuat hook `useDialog.ts` untuk menangani keyboard `Escape`, pemindahan fokus ke elemen dialog saat terbuka, dan pengembalian fokus ke elemen pemanggil saat ditutup pada `StoreDetailSheet` dan `DataImportModal`.
- Memperbaiki semantik kartu toko di `StoreCard.tsx`: kartu tetap dapat diklik mouse, sementara tombol judul toko (`store-card-select-btn`) menjadi target fokus keyboard dengan outline yang jelas.
- Mengganti seluruh 7 deklarasi `transition: all` di `map.css` dengan properti eksplisit untuk kinerja rendering GPU yang lebih ringan.
- Timer pesan galat geolokasi di `BantenMap.tsx` kini dibersihkan secara aman saat komponen di-unmount.

### Batch 5: Modularisasi Halaman Beranda (`app/page.tsx`)
Struktur monolitik 938 baris dipecah menjadi modul-modul terfokus di dalam `components/home/`:
1. `usePlan.ts`: Hook kustom untuk seluruh logika state rencana, analisis AI/mock, impor foto, dan sinkronisasi `localStorage`.
2. `SiteHeader.tsx`: Top strip pengingat nilai yadnya dan navigasi utama.
3. `HeroSection.tsx`: Judul utama, mandala Balinese art, dan ajakan bertindak awal.
4. `HowItWorksSection.tsx`: 4 langkah alur persiapan banten.
5. `PlanInputCards.tsx`: Input nama rencana dan area catatan kebutuhan/unggah foto.
6. `ChecklistCard.tsx`: Tabel daftar bahan/sarana upakara, skeleton loading, dan konfirmasi.
7. `BudgetSidebar.tsx`: Estimasi anggaran belanja dan ekspor catatan (.txt).
8. `PlannerSection.tsx`: Pembungkus layout perencana.
9. `MapCtaSection.tsx`: Menggantikan section iframe OSM lama dengan kartu pratinjau CTA modern yang mengarahkan pengguna ke `/peta-toko-banten`.
10. `SiteFooter.tsx`: Footer penutup dan atribusi Bali DigiFest 2026.
11. Menghapus berkas `data/cities.ts` yang sudah tidak dibutuhkan.

### Batch 6: Pembersihan Visual & Pola Generik AI (*Anti-Slop*)
- Mengganti ikon `Sparkles` pada logo peta atas dengan simbol bunga Balinese `Flower2`, senada dengan identitas visual di beranda.
- Mengganti ikon kilau pada pencocokan kebutuhan di kartu toko, detail sheet, dan filter chip dengan `CheckCircle2` yang lebih merefleksikan verifikasi daftar belanja nyata.
- Menghapus ornamen bintang `✦` yang berlebihan pada strip navigasi atas.
- Mengisolasi override gaya Leaflet di `map.css` dengan selektor ber-cakupan (`.banten-map-page-wrapper`, `.banten-map-viewport`) guna mencegah kebocoran CSS ke halaman lain.

### Batch 7: Verifikasi Akhir
- **Typecheck**: `tsc --noEmit` lolos dengan **0 error**.
- **Unit Test**: `npm test` lulus **100%** (semua asersi budget & vendor lolos).
- **Production Build**: `next build` berhasil mengompilasi seluruh rute statis dan dinamis.
- **Server Dev**: Berjalan aktif di `http://localhost:3000` dengan respons status **200 OK** pada `/` dan `/peta-toko-banten`.

