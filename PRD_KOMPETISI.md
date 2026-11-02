# PRD — AI NgaeBanten MVP v0.1

**Nama kerja:** AI NgaeBanten  
**Tagline:** Ngae Banten Lebih Terencana, Yadnya Lebih Tenang  
**Kategori:** Bali Smart Society / Business & MSME Digitalization  
**Target:** AI Web Innovation Challenge — Bali DigiFest 2026  
**Status:** Draft produk; belum tervalidasi ke pengguna atau narasumber  

## 1. Masalah dan hipotesis

Sejumlah keluarga di Bali menggunakan catatan kebutuhan banten dari keluarga atau serati. Ketika catatan berupa tulisan tangan atau teks bebas, menyusun checklist, menandai barang yang telah dimiliki, dan menghitung biaya dapat memerlukan pekerjaan manual. Masalah dan frekuensinya masih perlu diwawancarai kepada calon pengguna.

**Hipotesis terukur:** AI berbasis ekstraksi multimodal dapat membantu pengguna mengubah catatan mereka menjadi checklist yang akurat dalam waktu lebih singkat dibandingkan penyalinan manual, tanpa mengarang bahan maupun jumlah.

## 2. Target pengguna

- Pengguna primer: keluarga Bali yang menyiapkan kebutuhan banten dari daftar yang sudah disepakati.
- Pengguna sekunder: anggota keluarga muda yang ingin membantu pencatatan dan belanja.
- Penjual banten/bahan: mitra data potensial pada tahap pengembangan, bukan pengguna utama MVP.

## 3. Nilai utama

**Catatan kebutuhan → AI membaca → pengguna memeriksa → perhitungan biaya → cari penjual.**

Tidak ada klaim penentuan banten yang wajib, makna ritual, ketepatan adat, maupun ketentuan desa tertentu.

## 4. Fungsi MVP & acceptance criteria

| ID | Fitur | Acceptance criteria |
| --- | --- | --- |
| F01 | Input catatan | Menerima teks ≤5.000 karakter atau foto JPG/PNG/WebP ≤2,5MB. |
| F02 | AI ekstraksi | Memproses input melalui API server dan mengembalikan nama item, jumlah, satuan, catatan, penanda ketidakpastian. |
| F03 | Koreksi | Pengguna dapat mengedit nama, jumlah, satuan, catatan, dan menambah/menghapus item. |
| F04 | Checklist | Pengguna dapat menandai item sudah tersedia dan sudah diperiksa. |
| F05 | Anggaran | Subtotal deterministic hanya menghitung item dengan jumlah dan harga terisi serta belum dimiliki. Item tak pasti ditampilkan terpisah. |
| F06 | Peta pencarian | Menampilkan wilayah yang dipilih di OpenStreetMap dan membuka pencarian toko pada Google Maps. Tidak menjanjikan hasil/stock internal. |
| F07 | Ekspor & privasi | Mengunduh ringkasan TXT; foto tidak tersimpan dalam localStorage. |
| F08 | Error handling | Menampilkan pesan ketika API key belum tersedia, input tidak didukung, atau AI gagal. |

## 5. AI implementation

- Model: configurable, rekomendasi baseline `gpt-4.1-mini` yang mendukung vision input dan JSON schema.
- Input: catatan teks dan/atau foto.
- Output: structured JSON `[summary, items, questions]`.
- Prompt: *extract-only*, tanpa improvisasi komposisi banten atau harga.
- Validasi: JSON schema strict + validation manual setelah API merespons.
- Human-in-the-loop: setiap item dapat dikoreksi dan dikonfirmasi.
- Kalkulasi harga tidak memakai prediksi generatif.
- Foto input dianggap informasi, bukan instruksi model (mitigasi prompt injection pada dokumen).

## 6. UX flow

Beranda → Buat rencana → Input catatan teks/foto → Analisis AI → Pertanyaan klarifikasi dan checklist → Tambah harga dan item yang sudah ada → Ekspor rencana → Cari toko di maps.

## 7. Arsitektur

Next.js (client) → Next.js `/api/analyze` (validasi dan API key server) → OpenAI Responses API → JSON Schema → Checklist dan budget lokal. Maps: iframe OSM + external Google Maps search. Penyimpanan sementara: `localStorage`. Supabase dan vendor directory **belum** diintegrasikan.

## 8. Privasi, etika, budaya

- Jangan mengunggah data pribadi dalam catatan.
- Foto dikirim ke penyedia AI hanya saat pengguna menekan analisis.
- Hasil AI bukan sumber ketentuan ritual; tetap membutuhkan verifikasi keluarga/serati.
- Nama, jumlah, atau satuan yang tidak terbaca harus ditandai *belum pasti*.
- Toko dan harga tidak boleh diklaim terverifikasi sebelum ada bukti.
- API key hanya pada server. Perlu proteksi rate limit sebelum deployment publik.

## 9. Desain evaluasi

Uji 20 catatan (teks dan foto, meliputi tulisan tangan yang diizinkan), masing-masing dengan daftar item acuan yang dikoreksi manusia. Ukur precision/recall nama item, ketepatan jumlah/satuan, jumlah klaim tanpa sumber, persentase ketidakpastian yang terdeteksi, dan waktu penyusunan checklist. Uji manfaat dengan setidaknya 5 orang yang pernah menyiapkan daftar banten.

## 10. Eksklusi MVP

Rekomendasi ritual otomatis, marketplace, pembayaran, prediksi stok, prediksi harga, kalender wariga, direktori toko penuh, dan integrasi WhatsApp otomatis.

## 11. Persyaratan kompetisi

Tahap 1 mensyaratkan proposal PDF maksimal lima halaman isi di luar cover/lampiran, repository GitHub, URL MVP aktif, dan AI & Technology Disclosure. Source project perlu diuji, dikonfigurasi dan di-deploy sebelum dikumpulkan. Juri dapat menguji input baru dan meminta penjelasan kode pemanggilan AI.

## 12. Posisi kompetitor

Terdapat produk panduan/checklist banten dan riset dengan istilah NgaeBanten. Perlu audit nama, fitur, dan izin sumber. Pembeda yang akan diuji bukan adanya checklist atau peta saja, melainkan ekstraksi catatan tak terstruktur yang dapat diaudit dan dikoreksi manusia.
