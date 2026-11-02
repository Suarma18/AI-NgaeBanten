# Peta Toko Banten

Route: `/peta-toko-banten`. Status terbaru dan hasil pengujian: [MAPS_REAL_DATA_REPORT.md](MAPS_REAL_DATA_REPORT.md). Rencana yang disesuaikan dengan pilihan pengguna: [MAPS_REAL_DATA_PLAN.md](MAPS_REAL_DATA_PLAN.md).

## Sumber dan cakupan

- Leaflet memakai tile standar OpenStreetMap (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`), zoom maksimal 19, tanpa API key. Atribusi tertaut ke lisensi OSM dan tetap terlihat pada peta.
- Snapshot 235 objek lokasi OpenStreetMap pada sembilan kabupaten/kota Bali, dengan tautan sumber dan tanggal pengambilan.
- Filter kabupaten, kategori, kata kunci, dan perkiraan kecocokan kategori bahan.
- Tombol Cari memperbarui data dari Overpass; Cari di area ini memakai viewport. Query tidak dikirim setiap karakter atau setiap pergeseran kamera.
- Kartu dimuat 20 per tahap; seluruh hasil yang sudah dimuat di direktori tetap memiliki marker/clustering.
- Rincian berisi alamat/jam/kontak yang benar-benar diberikan sumber. Tidak menyimpulkan WhatsApp dari nomor telepon.
- Google Maps dipakai sebagai tautan rute atau pencarian eksternal, bukan sumber konten marker.

## Transparansi

Semua snapshot OSM belum diverifikasi lapangan. Kategori dari tag/nama sumber bukan bukti penjual mempunyai janur, bunga upakara, paket banten tertentu, atau stok saat ini. Alamat yang tidak ada dinyatakan belum tercatat. Tiga profil simulasi lama hanya berada pada fixture tes.

Data OSM dan turunannya berlisensi ODbL-1.0; lihat [atribusi dan sumber data](../data/README.md). Metadata jumlah per wilayah/kategori berada di `data/vendors.metadata.json`.

## Kurasi lokal

Kelola Data menerima array JSON vendor atau objek `{ "vendors": [...] }`. Setiap record perlu ID, nama, kategori, koordinat Bali, alamat, dan status pemeriksaan. Cantumkan sumber serta tanggal pemeriksaan untuk informasi yang dikurasi. Jangan menandai verified sebelum ada bukti pemeriksaan yang mendukungnya.

Data impor disimpan di browser. Record bertanda simulasi tidak tampil pada hasil publik. Ekspor menyertakan atribusi OSM; mengembalikan data bawaan tetap meminta konfirmasi penghapusan impor lokal.

## Pemeriksaan

```powershell
npm test
npm run typecheck
npm run build
```

Layanan publik Overpass dapat gagal atau membatasi request. Aplikasi menampilkan pesan kegagalan dan mempertahankan data yang sudah dimuat. Cache dan pembatas frekuensi masih per proses; hosting dengan banyak instance memerlukan kontrol beban bersama atau instance sumber khusus.

Tile publik OSM mengikuti [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/): cache HTTP browser dan Referer bawaan dipertahankan, tanpa unduhan massal atau fitur offline. Layanan ini tidak memiliki SLA; untuk trafik yang meningkat gunakan penyedia tile yang sesuai.
