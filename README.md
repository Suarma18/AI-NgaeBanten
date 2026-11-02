# AI NgaeBanten — MVP v0.1

Asisten perencanaan pembuatan banten berbasis web. Fokus awal: **catatan kebutuhan dari keluarga/serati → AI ekstraksi item → konfirmasi pengguna → checklist dan perhitungan biaya → pencarian toko eksternal**.

> Status: prototipe lokal. Peta dasar OpenStreetMap memakai direktori nyata OpenStreetMap dengan 235 lokasi pada 9 kabupaten/kota Bali; pembaruan langsung melalui Overpass sudah diuji. Belum dideploy dan belum diuji pada perangkat fisik/lintas browser. Bukan panduan ritual resmi.

## Menjalankan lokal

1. Instal Node.js 24 LTS dan npm (tes serta skrip impor memakai dukungan TypeScript langsung).
2. Jalankan `npm install`.
3. Salin `.env.example` ke `.env.local`.
4. Isi `OPENAI_API_KEY` milik sendiri. Jangan menaruh key di browser, repository, atau file screenshot.
5. Jalankan `npm run dev` lalu buka `http://localhost:3000`.
6. Jalankan `npm run typecheck` dan `npm run build` sebelum deployment.

### Setup pada Windows PowerShell

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

### Jika analisis AI gagal

Jika muncul pesan API key kedaluwarsa atau tidak valid, buat key pengganti di [pengaturan API OpenAI](https://platform.openai.com/api-keys), perbarui `OPENAI_API_KEY` di `.env.local`, lalu restart server Next.js. Jangan kirim key melalui chat atau menyimpannya di dokumentasi. Pada hosting, perbarui environment variable server dan restart/redeploy aplikasi. Error autentikasi tidak pulih dengan menekan tombol analisis berulang kali.

Tanpa key, API mengembalikan pesan konfigurasi dengan status 503; tidak mengembalikan hasil ekstraksi contoh. Pengguna tetap dapat memasukkan bahan secara manual. Log server hanya mencatat status HTTP dan request ID untuk kegagalan provider, tanpa isi catatan, foto, key, atau pesan mentah provider.

## Fitur yang sudah ditulis dalam source code

- Input teks/foto (JPG/PNG/WebP), validasi ukuran maksimal 2,5MB.
- Endpoint `POST /api/analyze` untuk melakukan permintaan **OpenAI Responses API** menggunakan input vision dan **Structured Outputs**. Butuh API key dan konektivitas; tidak ada hasil AI mock otomatis.
- Memisahkan item tidak pasti dan pertanyaan klarifikasi tanpa mengarang jumlah ataupun harga.
- Review/koreksi item, tambah/hapus manual, tandai bahan yang sudah ada dan sudah dicek.
- Kalkulasi deterministik subtotal belanja hanya untuk item dengan harga dan jumlah yang tersedia.
- Penyimpanan lokal di browser untuk **teks dan checklist** (foto tidak disimpan di localStorage).
- Ekspor daftar sebagai `.txt`.
- Peta Leaflet dengan tile standar **OpenStreetMap**, direktori OSM bertanggal, filter 9 wilayah, pencarian sumber/viewport, serta tautan rute ke Google Maps. **Tidak ada toko simulasi pada hasil publik atau klaim stok real-time**.

### Data nyata peta

Snapshot awal memuat 235 objek lokasi OSM: 1 kategori banten jadi/canang, 7 bahan/sarana upakara, 56 bunga, 34 buah/sayur, dan 137 pasar. Semua belum diverifikasi lapangan dan memiliki tautan sumber; kategori diturunkan dari nama/tag komunitas, bukan jaminan ketersediaan bahan.

Pilih wilayah untuk menelusuri snapshot, lalu tekan **Cari** atau **Cari di area ini** untuk meminta pembaruan. `OVERPASS_API_URL` dapat diarahkan ke instance yang sesuai kebutuhan hosting. Respons sukses dicache 10 menit dalam proses dengan maksimum 12 entri; satu panggilan upstream aktif dan interval minimal 3 detik membatasi beban. Kegagalan sumber ditampilkan tanpa menghilangkan data yang sudah dimuat. Hasil dibatasi 600 objek dan kartu dimuat bertahap 20 per halaman.

Data OSM memakai ODbL dengan atribusi. Detail sumber, cara memperbarui snapshot, dan cakupannya ada di [data/README.md](data/README.md), [rencana](docs/MAPS_REAL_DATA_PLAN.md), serta [laporan implementasi](docs/MAPS_REAL_DATA_REPORT.md). Data kurasi pengguna tetap berada di browser. Tidak memakai Google Places API; Google Maps digunakan sebagai tautan keluar.

Gambar dasar memakai `https://tile.openstreetmap.org/{z}/{x}/{y}.png` tanpa API key, dengan zoom maksimal 19 dan atribusi OSM yang terlihat. Browser memakai cache HTTP bawaan; aplikasi tidak mengunduh area untuk penggunaan offline. Server tile publik memiliki kapasitas terbatas dan tanpa SLA; ikuti [kebijakan tile OSM](https://operations.osmfoundation.org/policies/tiles/) dan gunakan penyedia tile khusus saat kebutuhan trafik meningkat.

## Keterbatasan penting

1. Hasil model perlu diperiksa narasumber/keluarga; AI bukan serati atau otoritas adat.
2. Harga pengguna bukan harga pasar terverifikasi. Tidak ada daftar harga otomatis.
3. Lokasi dan tag bersumber dari kontribusi komunitas OSM; dapat salah, tidak lengkap, atau sudah berubah. Tanggal pengambilan bukan bukti usaha masih beroperasi. Hubungi penjual untuk memastikan stok dan jam buka.
4. Direktori memakai snapshot dan impor lokal; belum ada autentikasi, database kurasi terpusat, atau admin bersama.
5. Belum ada rate limit terpusat atau hardening produksi. **Jangan deploy publik tanpa rate limiting, batas biaya API, abuse protection dan audit keamanan**.
6. Belum ada benchmark akurasi model dan penggunaan Bahasa Bali; perlu evaluasi domain dan dataset uji.
7. Foto diproses di server dan diteruskan ke penyedia AI ketika pengguna menekan analisis; API request mengatur `store:false`. Tinjau kebijakan retensi penyedia dan kebijakan privasi sebelum peluncuran publik.
8. Tile OpenStreetMap, font saat build, dan pembaruan Overpass memerlukan koneksi. Direktori snapshot tetap tersedia ketika pembaruan sumber gagal; layanan publik OSM/Overpass tidak menjamin ketersediaan produksi.
9. Kesamaan nama dengan karya 'NgaeBanten Simulator' memerlukan verifikasi identitas/merek sebelum rilis.

## Data flow

Browser -> `/api/analyze` -> OpenAI Responses API -> JSON tervalidasi -> formulir review -> kalkulasi lokal -> file TXT / link pencarian toko.

### Data yang tidak dikirim otomatis

Foto hanya dikirim ketika pengguna menekan tombol analisis. Browser menyimpan catatan serta checklist di localStorage, sehingga jangan memasukkan data pribadi atau rahasia. Pengguna dapat menghapus dengan tombol **Hapus rencana**.

## Evaluasi lomba (target, belum hasil)

- 20 catatan bahan, termasuk 5 tulisan tangan, untuk evaluasi ekstraksi nama/jumlah/satuan.
- 5 warga penguji untuk membandingkan penyusunan checklist dengan cara manual.
- 1 narasumber yang mengerti upakara untuk review terminologi dan workflow.
- 5 toko lokal untuk mengevaluasi kategori barang, jika kelak membangun direktori terverifikasi.

Catat kesalahan ekstraksi, kasus unit ambigu, informasi yang dikarang, hasil kalkulasi, dan waktu penyelesaian.

## Teknologi

- Next.js App Router, React, TypeScript, CSS responsif
- OpenAI Responses API dengan input gambar dan JSON schema
- Leaflet, marker clustering, tile OpenStreetMap, dan data OpenStreetMap/Overpass; tautan rute Google Maps terpisah
- Browser localStorage (sementara, tanpa Supabase)

## Pengembangan berikutnya

- Dataset referensi banten dan kamus istilah Bali dengan narasumber yang memberi izin.
- Katalog bahan dan harga berkala yang mencantumkan tanggal serta sumber.
- Direktori toko terverifikasi + pin nyata pada peta.
- Database Supabase + autentikasi opsional jika kebutuhan pengguna mendukungnya.
- Evals otomatis, pembatasan API, moderasi input dan logging privasi.

## AI & Technology Disclosure singkat

- AI dalam produk: OpenAI multimodal model (dikonfigurasi dengan `OPENAI_MODEL`) untuk mengekstrak teks dan struktur item dari catatan/foto; pengolahan biaya dilakukan tanpa AI.
- AI untuk coding: spesifikasi dan draft source code dibantu ChatGPT (harus diungkapkan di submission); peserta bertanggung jawab review dan pengujian.
- Data eksternal: OpenStreetMap untuk tile peta, direktori, dan batas administrasi; Google Maps untuk rute/pencarian melalui tautan keluar.
- Komponen existing: belum ada proyek pengguna yang diimpor.
- Materi & data ritual: belum ditambahkan, menunggu validasi.
- Lisensi: pastikan kompatibilitas lisensi semua dependency dan penggunaan aset sebelum komersialisasi.

## Lisensi dan atribusi

OpenStreetMap contributors — https://www.openstreetmap.org/copyright

## Perhatian submission

MVP final wajib bisa diakses dan dijalankan oleh juri, memiliki README, `.env.example`, commit hash, proposal PDF maksimal lima halaman isi dan AI & Technology Disclosure. Source ini saja **belum memenuhi** syarat submission sampai benar-benar diinstal, diuji, dikonfigurasi, dan di-deploy.

