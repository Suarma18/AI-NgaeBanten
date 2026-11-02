# Rencana audit dan perbaikan UI

Tanggal: 1 November 2026. Dokumen dibuat sebelum perubahan kode UI.

## Tujuan dan lingkup

Mempermudah keluarga Bali memasukkan catatan, memeriksa bahan, memahami estimasi biaya, dan mencari toko. Mencakup beranda, perencana, dan `/peta-toko-banten`, termasuk desktop, ponsel, keyboard, serta kondisi kosong dan loading.

Tetap gunakan Next.js, CSS native, DM Sans, Plus Jakarta Sans, dan Lucide yang sudah terpasang. Pertahankan skema data, perhitungan biaya, API, dan data vendor. Tidak menambah dependensi atau melakukan deployment.

## Skill dan arah desain

- `.agents/skills/anti-slop-design/SKILL.md`: komposisi khas, hierarki jelas, dekorasi secukupnya.
- `.agents/skills/design-taste-frontend/SKILL.md`: audit sebelum redesign; diterapkan pada beranda pemasaran, bukan memaksakan pola landing page ke workspace peta.
- `.agents/skills/web-design-guidelines/SKILL.md`: label, keyboard, fokus, ukuran target, reduced motion, dan responsivitas.
- `.agents/skills/ponytail/SKILL.md`: perubahan terfokus, memakai komponen dan dependency existing.

Design read: layanan perencanaan keluarga Bali dengan bahasa visual editorial yang hangat. Hijau hutan sebagai tindakan utama, gading sebagai latar, emas sebagai aksen. Heading pemasaran lapang; form tetap praktis dan mudah dibaca. DESIGN_VARIANCE 5 / MOTION_INTENSITY 2 / VISUAL_DENSITY 4. Informasi teknis pengujian tidak ditempatkan di alur utama pengguna.

Pedoman audit aksesibilitas diambil dari [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) pada tanggal audit. Hasil pemeriksaan kode tidak otomatis membuktikan kepatuhan WCAG menyeluruh.

## Temuan awal berdasarkan kode

| ID | Prioritas | Bukti awal | Dampak dan tindakan |
|---|---|---|---|
| UI-01 | P1 | `app/globals.css:1390`, `.nav-links { display: none }` | Ponsel kehilangan navigasi langsung. Sediakan navigasi ringkas yang tetap terlihat. |
| UI-02 | P1 | `app/page.tsx:18`, `app/layout.tsx:34` | Tidak ada skip link. Tambahkan tautan ke konten utama pada kedua halaman. |
| UI-03 | P1 | `components/home/BudgetSidebar.tsx:19` | Rp0 ditampilkan ketika belum ada harga. Bedakan belum dihitung, subtotal sebagian, dan estimasi lengkap. |
| UI-04 | P1 | `components/banten-map/map.css:12`, `:1515`, `:1554` | Tinggi `100vh` dan panel bawah berpotensi menutup kontrol lokasi. Gunakan dvh, safe area, dan tempatkan kontrol di area peta yang bebas. |
| UI-05 | P1 | `components/banten-map/useDialog.ts:20` | Modal mengaku modal tetapi Tab belum dibatasi ke dialog. Pakai dialog native untuk impor agar fokus dan latar tertangani browser. |
| UI-06 | P2 | `app/globals.css:646`, `:1392`, `:1410` | Form 13px dan beberapa label 8–12px. Naikkan input ke 16px, perjelas teks bantuan dan target sentuh. |
| UI-07 | P2 | `app/globals.css:1423` | Selector grid mobile menargetkan label, padahal anak grid adalah div. Benarkan kolom harga. |
| UI-08 | P2 | `components/home/HeroSection.tsx:37`, `HowItWorksSection.tsx:49` | Hero memakai pratinjau produk palsu dan deretan kartu seragam. Ganti dengan pengantar editorial dan ringkasan alur semantik. |
| UI-09 | P2 | `components/home/PlanInputCards.tsx:29`, `:193` | Scroll paksa selalu smooth dan copy menyebut konfigurasi API di UI. Hormati reduced motion, jelaskan foto dikirim saat analisis, sediakan jalur manual. |
| UI-10 | P2 | `components/home/MapCtaSection.tsx:48`, `BantenMap.tsx:326` | Klaim verifikasi dan kata “tersedia” bisa dianggap stok nyata. Gunakan bahasa referensi lokasi dan minta pengguna memeriksa informasi toko. |
| UI-11 | P2 | `app/globals.css:1`, warna literal di CSS | Belum ada tema gelap. Tambahkan token tema beranda tanpa membuat tile eksternal kehilangan keterbacaan. |

Nomor baris di atas adalah posisi sebelum implementasi. Laporan lama tidak dipakai sebagai bukti pengujian baru. Folder kerja tidak memiliki metadata Git, sehingga perubahan akan dicatat lewat daftar berkas dan validasi.

## Urutan implementasi

1. Simpan rencana ini, lalu lengkapi audit visual bila browser lokal dapat diakses.
2. Rapikan beranda: hero editorial, alur ringkas, navigasi ponsel, skip link.
3. Perbaiki perencana: keterbacaan, label bantuan, feedback loading, status kelengkapan anggaran, layout ponsel.
4. Perbaiki peta: toolbar responsif, target sentuh, viewport dan safe area, dialog impor native, copy lokasi.
5. Jalankan pemeriksaan TypeScript, tes existing, build produksi, dan smoke test UI. Catat yang benar-benar lolos serta batas pemeriksaannya di `docs/UI_AUDIT_REPORT.md`.

Tambahan dari pengujian visual: UI-12 (P1), `MapCanvas.tsx:46` menghasilkan kelas `.banten-pin-body`, `.banten-cluster-inner`, dan `.user-location-dot` yang tidak mempunyai aturan di `map.css`. DOM menunjukkan marker 36×21px, radius 0, dan warna ikon gelap. Tambahkan gaya scoped untuk pin, cluster, lokasi pengguna, dan status terpilih; tidak mengubah koordinat atau perilaku pencarian.

UI-13 (P2): halaman peta sempat tampil tanpa styling saat reload karena seluruh CSS diimpor dari `MapCanvas` yang dimuat dinamis dengan `ssr: false`. Pindahkan impor CSS ke berkas route agar stylesheet dimuat bersama halaman.

UI-14 (P1): warna teks kategori bahan, bunga, dan buah pada latar terang menghasilkan rasio kontras 3,58:1, 3,07:1, dan 3,35:1. Gelapkan warna teks bersama di `lib/vendors/types.ts` dan gunakan sumber warna yang sama pada CTA beranda.

## Kriteria selesai

- Navigasi cara kerja, perencana, dan peta dapat diakses pada ponsel.
- Input terbaca, label terkait dengan field, fokus keyboard terlihat, modal dapat ditutup Escape dan fokus tidak keluar.
- Harga kosong tidak menampilkan total seolah sudah lengkap; estimasi sebagian diberi konteks.
- Tidak ada overflow horizontal dari CTA atau kolom input pada layar sempit.
- Kontrol lokasi tidak berada di balik panel hasil peta, animasi menghormati reduced motion.
- Tidak ada perubahan kontrak API, kunci localStorage, atau rumus biaya.
- `npm run typecheck`, `npm test`, dan `npm run build` dijalankan; keterbatasan browser, API sungguhan, dan tile peta eksternal ditulis secara jujur.

## Matriks verifikasi

Desktop 1366×900; ponsel 390×844 dan 320×740 bila alat mendukung. Periksa kosong, input manual, bahan sudah tersedia, harga belum lengkap, ekspor, navigasi ke peta, pencarian tanpa hasil, kategori, buka/tutup panel dan modal. Tema gelap dan reduced motion diperiksa melalui dukungan browser yang tersedia; tidak mengklaim hasil bila hanya ditinjau dari source.
