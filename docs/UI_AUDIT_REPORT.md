# Hasil audit dan perbaikan UI

Tanggal: 1 November 2026. Rencana awal: [UI_AUDIT_PLAN.md](UI_AUDIT_PLAN.md).

## Hasil

Perbaikan mencakup 14 temuan pada beranda, perencana, dan peta toko. Identitas hijau, gading, emas, font, rute, serta alur utama dipertahankan. Tidak ada dependensi baru, perubahan rumus biaya, skema data, kontrak API, atau deployment.

Audit memakai `anti-slop-design`, `design-taste-frontend`, `web-design-guidelines`, dan `ponytail` dari `.agents/skills`. Temuan tambahan selama pengujian dicatat sebagai addendum pada rencana.

## Temuan dan penyelesaian

| ID | Perubahan | Bukti pemeriksaan |
|---|---|---|
| UI-01 | Navigasi beranda tetap terlihat di ponsel; header sangat sempit memakai grid. | Semua tautan terlihat pada lebar aktual 320px. |
| UI-02 | Skip link global dan target main pada kedua halaman. | Target `konten-utama` ada dan dapat menerima fokus. |
| UI-03 | Kondisi kosong, belum terhitung, subtotal sebagian, seluruh harga lengkap, dan seluruh bahan tersedia dibedakan. | Uji interaksi: kosong; 3 ikat × Rp12.000 = Rp36.000; seluruh bahan tersedia = Rp0 dengan penjelasan; tambah bahan tanpa harga = 1 dari 2 terhitung. |
| UI-04 | Toolbar dan kategori peta mengikuti alur dokumen; viewport `100dvh`, safe area, panel terbatas, kontrol lokasi di atas panel mobile. | Tidak ada overflow horizontal pada peta 320px; posisi bawah kontrol lokasi berada di atas awal panel hasil. |
| UI-05 | Impor memakai `<dialog>.showModal()`, latar inert, Escape native, dan pengembalian fokus. | Accessibility tree hanya menampilkan isi modal saat terbuka; Escape menutup modal dan fokus kembali ke tombol Kelola Data. Panel rincian mengabaikan Escape selama dialog modal terbuka. |
| UI-06 | Input perencana dan pencarian menjadi 16px; hierarki label dan bantuan diperjelas; tombol utama dan kontrol peta diperbesar. | Computed style input utama 16px; inspeksi visual form desktop dan ponsel. |
| UI-07 | Kolom harga mobile menargetkan `div` anak grid, memakai seluruh baris. | Jumlah dan satuan berdampingan; harga berada pada baris penuh di ponsel. |
| UI-08 | Hero menggunakan judul ringkas dan pintasan navigasi nyata; alur menggunakan ordered list datar. | Tidak ada pratinjau produk palsu atau elemen hero terpotong. |
| UI-09 | Keterangan pemrosesan AI dan jalur manual lebih jelas; spinner/status loading; error lokal menerima fokus; scroll menghormati reduced motion. | Catatan kosong menghasilkan error lokal dengan fokus pada `analysis-error`, tanpa request AI. Cabang reduced motion ditinjau pada source. |
| UI-10 | CTA menjelaskan referensi lokasi, status verifikasi, dan perlunya konfirmasi stok; hasil memakai istilah referensi lokasi; pencocokan bahan tidak diberi label stok tersedia. | Teks pada beranda, kartu, dan panel hasil sesuai fungsi peta. |
| UI-11 | Token tema gelap beranda mengikuti preferensi sistem. Workspace peta memakai permukaan terang yang sesuai tile eksternal. | Tema gelap dan token tema terang diperiksa secara visual, termasuk perencana. |
| UI-12 | Gaya pin, cluster, lokasi pengguna, dan marker terpilih ditambahkan dengan scope peta. | Pin berbentuk penanda 36×36px dengan ikon putih, cluster bulat menampilkan jumlah. Koordinat vendor tidak diubah. |
| UI-13 | Impor CSS peta dipindah dari komponen dinamis ke berkas route. | Stylesheet kini merupakan bagian route, sehingga chrome peta tidak menunggu inisialisasi Leaflet. |
| UI-14 | Warna kategori berasal dari satu sumber; teks bahan, bunga, dan buah digelapkan. | Rasio warna teks/latar masing-masing 5,55:1, 5,13:1, dan 5,24:1. Kategori lain 5,20:1 dan 4,75:1. |

## Verifikasi

- `npm run typecheck`: lulus.
- `npm test`: semua asersi budget dan vendor lulus. Node masih memberi peringatan existing `MODULE_TYPELESS_PACKAGE_JSON`; konfigurasi modul tidak diubah untuk pekerjaan UI ini.
- `npm run build`: lulus, termasuk kompilasi, pemeriksaan tipe, dan prerender halaman. Build awal sempat gagal pada parser ekstensi file `next/font`; respons font diperiksa melalui pemuat Next.js dan kegagalan tidak terulang. Font dan dependency tidak diganti.
- Browser: beranda/perencana dan peta diperiksa pada lebar aktual 320, 356, 434, dan sekitar 1367px. Perbedaan antara ukuran yang diminta ke alat dan ukuran aktual berasal dari skala browser; angka aktual dibaca dari viewport.
- Alur manual: tambah bahan, isi jumlah/satuan/harga, tandai bahan tersedia, subtotal sebagian, validasi kosong, dan pemulihan rencana setelah navigasi.
- Ekspor TXT: unduhan berhasil; isi diperiksa dan memuat Janur 3 ikat, Rp36.000, serta bahan kedua yang belum lengkap. Berkas uji berada di folder Downloads browser pengujian.
- Peta: pencarian tanpa hasil, reset filter, kategori Bunga & Janur (6 hasil), rincian Pasar Badung, Escape, modal impor, pengembalian fokus, serta lokasi kontrol diperiksa. Tile eksternal berhasil dimuat dalam sesi ini.
- Tema terang diperiksa dengan menonaktifkan sementara aturan dark pada source lokal untuk inspeksi token; aturan dikembalikan sebelum build. Tema gelap diperiksa dengan preferensi sistem browser. Tidak ada override pengujian tema yang ditinggalkan pada source akhir.

Uji interaksi menggunakan bahan sintetis di sesi browser pengujian. File data vendor dan kontrak penyimpanan aplikasi tidak diubah.

## Berkas utama

- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`: token, responsivitas, skip link, dan struktur halaman.
- `components/home/HeroSection.tsx`, `HowItWorksSection.tsx`, `SiteHeader.tsx`, `PlannerSection.tsx`: pengantar dan navigasi.
- `components/home/PlanInputCards.tsx`, `ChecklistCard.tsx`, `BudgetSidebar.tsx`, `MapCtaSection.tsx`: perencana, status, dan CTA peta.
- `components/banten-map/map.css`, `BantenMap.tsx`, `StoreSearch.tsx`, `StoreCard.tsx`, `DataImportModal.tsx`, `useDialog.ts`: workspace, copy, dan aksesibilitas peta.
- `app/peta-toko-banten/page.tsx`, `components/banten-map/MapCanvas.tsx`: pemuatan CSS route.
- `lib/vendors/types.ts`: warna kategori presentasi.

## Bukti visual

- [Beranda desktop, terang](ui-screenshots/home-desktop-light.jpg)
- [Beranda desktop, gelap](ui-screenshots/home-desktop-dark.jpg)
- [Perencana desktop, terang](ui-screenshots/planner-desktop-light.jpg)
- [Beranda ponsel, terang](ui-screenshots/home-mobile-light.jpg)
- [Beranda ponsel, gelap](ui-screenshots/home-mobile-dark.jpg)
- [Peta desktop](ui-screenshots/map-desktop.jpg)
- [Peta ponsel](ui-screenshots/map-mobile.jpg)

## Batas pemeriksaan

Belum menjalankan analisis AI sungguhan, geolokasi perangkat, pembaca layar, Lighthouse, atau pengujian perangkat fisik/lintas browser. Preferensi reduced motion ditinjau pada source, belum diemulasi di browser. Impor data vendor baru dan penghapusan data pengguna tidak dijalankan dalam audit UI. Hasil ini tidak menyatakan kelulusan WCAG menyeluruh, akurasi data toko, atau kesiapan produksi backend.

Referensi audit: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Dokumentasi font yang diperiksa saat diagnosis: [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts).
