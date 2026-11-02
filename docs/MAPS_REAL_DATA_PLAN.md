# Rencana data nyata dan peta dasar OpenStreetMap Bali

Tanggal: 1 November 2026.

## Keputusan yang disetujui

Pengguna memilih **OpenStreetMap + kurasi toko, dengan tautan rute ke Google Maps**. Pada pembaruan 1 November 2026, pengguna juga mengganti keputusan awal CARTO menjadi **gambar dasar standar OpenStreetMap**. Keputusan terbaru ini menggantikan konfigurasi tile CARTO; sumber toko dan alur pencarian tetap berlaku.

- Kanvas: Leaflet dengan tile standar OpenStreetMap, zoom maksimal 19, dan atribusi tertaut ke lisensi OSM.
- Data lokasi: OpenStreetMap melalui Overpass dan direktori kurasi pengguna.
- Batas kabupaten/kota: geometri administrasi OpenStreetMap melalui Nominatim.
- Rute: tautan keluar ke Google Maps menggunakan koordinat lokasi, tanpa mengambil konten Places.
- Google Places API dan migrasi ke Google Map tidak termasuk implementasi ini.

Referensi keputusan: [kebijakan Places API](https://developers.google.com/maps/documentation/places/web-service/policies). Untuk sumber yang dipilih, ikuti [lisensi ODbL dan atribusi OSM](https://www.openstreetmap.org/copyright).

## Tujuan

Mengeluarkan tiga lokasi simulasi dari hasil publik, menampilkan data nyata yang memiliki sumber, dan menyediakan pencarian pada seluruh sembilan kabupaten/kota Bali. Cakupan wilayah tidak berarti semua toko sudah tercatat atau produk telah dikonfirmasi.

Audit awal menemukan 9 lokasi bawaan yang seluruhnya berada di Denpasar, termasuk 3 simulasi. Enam lokasi lain memiliki label verified tanpa bukti sumber yang dapat ditelusuri. Tampilan awal dikunci ke Denpasar dan pencarian hanya menyaring JSON lokal.

## Data awal yang dapat digunakan

Data awal setelah pembaruan sumber langsung dan validasi menghasilkan 235 objek lokasi bernama: 1 kategori banten jadi/canang, 7 bahan/sarana upakara, 56 bunga, 34 buah/sayur, dan 137 pasar. Setiap lokasi menyertakan ID objek OSM, tautan sumber, tanggal pengambilan, koordinat dari sumber, serta status belum diverifikasi lapangan.

Kategori banten/sarana masih terbatas. Tambahan data kurasi harus mempunyai sumber yang dapat diperiksa. Jangan mengisi produk, harga, stok, alamat jalan, WhatsApp, atau koordinat yang tidak diberikan sumber.

## Alur pencarian

1. Halaman memuat snapshot OSM bertanggal dan impor kurasi browser agar direktori awal dapat dipakai tanpa bergantung pada ketersediaan layanan publik.
2. Pilihan wilayah menyaring snapshot dan memindahkan kamera. Wilayah tidak diketahui tidak dianggap Denpasar.
3. Form Cari menerapkan kata kunci dan meminta pembaruan sumber wilayah melalui `/api/vendors/search`.
4. Cari di area ini membatasi request pada viewport yang beririsan dengan wilayah pilihan.
5. Server mengambil data OSM dengan query yang dibangun sendiri, batas hasil, timeout, pembatas frekuensi, dan cache singkat.
6. Koordinat hasil diperiksa terhadap poligon administrasi Bali, bukan hanya bounding box; titik di luar provinsi disisihkan.
7. Hasil didedup berdasarkan jenis objek dan ID OSM. Kartu ditampilkan 20 per tahap; marker mencakup seluruh hasil yang sudah dimuat.
8. Kegagalan layanan ditampilkan jelas dan tidak menghapus data yang sudah dimuat. Tidak ada fallback toko simulasi.
9. Hasil kosong menyediakan tautan pencarian Google Maps. Hasil Google tidak disalin ke marker peta.

## Wilayah

Seluruh Bali, Denpasar, Badung, Gianyar, Tabanan, Jembrana, Buleleng, Bangli, Klungkung, dan Karangasem. Geometri Klungkung mencakup kepulauan Nusa Penida. Geometri bersumber dari relasi OSM; ini bukan penetapan batas hukum atau verifikasi survei lapangan.

## Struktur implementasi

| Berkas | Peran |
|---|---|
| `data/vendors.json`, `vendors.metadata.json` | Snapshot lokasi OSM dan metadata cakupan. |
| `data/bali-regions.json` | Sumber dan geometri administrasi sembilan wilayah. |
| `lib/vendors/geography.ts` | Pemeriksaan titik dalam Polygon/MultiPolygon beserta holes. Hanya digunakan pada server dan skrip impor. |
| `lib/vendors/regions.ts` | Pilihan wilayah serta acuan kamera yang ringan untuk browser. |
| `lib/vendors/overpass.ts` | Query OSM, validasi bounds, normalisasi dan dedup respons. |
| `lib/vendors/overpass-client.ts` | Transport server, timeout, cache, satu request upstream aktif, dan pembatas frekuensi. |
| `app/api/vendors/search/route.ts` | Endpoint pencarian wilayah/viewport tervalidasi. |
| `scripts/import-osm-snapshot.mjs` | Impor respons Overpass nyata secara tervalidasi dan pembuatan metadata. |
| `test/fixtures/vendors-simulated.json` | Tiga record simulasi lama, khusus fixture tes. |
| Komponen `banten-map` existing | Toolbar wilayah, hasil bertahap, provenance, rincian, favorit, tile OpenStreetMap, dan status pencarian. |

Tidak menambahkan database, provider switcher, ketergantungan Google Maps, atau dependency frontend baru. Detail sudah terdapat pada tags OSM sehingga endpoint detail terpisah tidak diperlukan pada MVP.

## Integritas dan penyimpanan

- Snapshot OSM dan turunannya disertai atribusi serta ketentuan ODbL; konten kode aplikasi dibedakan dari lisensi data.
- Impor pengguna tetap tersimpan di browser dan tidak dihapus diam-diam. Record simulasi disembunyikan dari hasil publik.
- Favorit memakai ID stabil, termasuk `osm-node-*`, `osm-way-*`, atau `osm-relation-*`.
- Status sumber OSM berbeda dari verifikasi lapangan. Tanggal pengambilan berbeda dari bukti usaha masih beroperasi.
- Kecocokan kategori adalah saran untuk dikonfirmasi, bukan jaminan inventori; pasar tidak dianggap cocok dengan setiap bahan.
- Telepon tidak otomatis diubah menjadi WhatsApp. Tautan sumber hanya menerima HTTP/HTTPS dan tanggal impor harus valid.
- GeoJSON administrasi tidak dikirim sebagai bagian bundle browser; pemeriksaan wilayah dilakukan saat normalisasi pada server/skrip.

## Konfigurasi dan ketahanan

Tile menggunakan `https://tile.openstreetmap.org/{z}/{x}/{y}.png` tanpa API key. Cache HTTP dan Referer browser dipertahankan, tanpa prefetch massal atau fitur offline. Ikuti [kebijakan tile OSM](https://operations.osmfoundation.org/policies/tiles/); layanan publik tidak memiliki SLA dan membutuhkan penyedia khusus saat trafik meningkat. Konfigurasi CARTO tidak lagi dipakai.

Variabel server `OVERPASS_API_URL` menunjuk instance Overpass yang dipilih dan sesuai pemakaian. Instance default berasal dari daftar publik dokumentasi Overpass; ketersediaannya tidak memiliki jaminan aplikasi.

Pencarian tidak dikirim setiap karakter atau setiap gerakan peta. Respons sukses disimpan maksimal 10 menit pada cache proses dengan batas 12 entri; request identik yang berbarengan berbagi satu panggilan. Request lain ditolak sementara saat ada panggilan upstream aktif atau interval minimal belum lewat. Ini pembatas proses tunggal, belum pembatas terpusat lintas instance.

Query maksimal 600 objek, timeout 30 detik, hasil terlalu besar/parsial ditolak, dan status HTTP upstream dipetakan ke pesan pengguna. Kuota/instance khusus diperlukan bila penggunaan publik tumbuh. Contoh env memakai placeholder; kredensial asli tidak dicantumkan dalam dokumen.

## Tahapan

1. Pisahkan fixture dan bersihkan klaim verifikasi tanpa bukti pada data bawaan.
2. Ambil sumber OSM nyata serta batas administrasi, normalisasi, dedup, dan buat snapshot bertanggal.
3. Hubungkan endpoint pembaruan dan penanganan kegagalan layanan.
4. Tambahkan pilihan wilayah, cakupan awal Bali, pencarian area, sumber, serta muat hasil bertahap.
5. Uji parser, geografi, cache/konkurensi, validasi, lalu uji UI desktop/ponsel dan build produksi.
6. Catat jumlah sumber aktual dan keterbatasan pada `MAPS_REAL_DATA_REPORT.md`.

## Kriteria penerimaan

- Tiga lokasi simulasi tidak tampil di direktori publik.
- Semua sembilan wilayah memiliki data snapshot yang benar-benar bersumber dari OSM.
- Kamera awal mencakup Bali, filter wilayah dan kategori bekerja, tidak terjadi overflow ponsel.
- OpenStreetMap menjadi sumber tile dan atribusi tertaut OSM terlihat.
- Tautan sumber dan rute bekerja tanpa membuat WhatsApp atau produk fiktif.
- Respons gagal, hasil kosong, timeout, query di luar Bali, dan request bersamaan ditangani.
- Kegagalan pembaruan tidak menghapus snapshot atau menggantinya dengan demo.
- Typecheck, tes budget/vendor/OSM, dan build dijalankan; hasil serta batas pemeriksaan dilaporkan secara jujur.

