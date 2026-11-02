# Hasil implementasi peta dan data nyata OpenStreetMap Bali

Tanggal: 1 November 2026.

## Hasil utama

Peta memakai **Leaflet + tile standar OpenStreetMap**, sesuai keputusan terbaru pengguna pada 1 November 2026 yang menggantikan tile CARTO. Sumber lokasi memakai **OpenStreetMap + kurasi**; Google Maps dipakai sebagai tautan rute/pencarian keluar. Tidak memakai Google Places atau mengganti kanvas ke Google Map.

Tiga profil simulasi lama dipindahkan ke fixture tes. Direktori bawaan sekarang berisi **235 objek lokasi OpenStreetMap** yang lolos normalisasi, dedup ID, pemeriksaan nama, kategori relevan, dan poligon administrasi Bali. Semua memiliki sumber OSM dan status belum diverifikasi lapangan.

Sumber snapshot diambil 1 November 2026; timestamp basis OSM `2026-11-01T14:10:21Z`. Waktu pengambilan yang dicatat aplikasi `2026-11-01T14:12:07.807Z`. Metadata lengkap: `data/vendors.metadata.json`.

## Cakupan data awal

| Wilayah | Objek lokasi |
|---|---:|
| Badung | 70 |
| Bangli | 6 |
| Buleleng | 34 |
| Denpasar | 63 |
| Gianyar | 20 |
| Jembrana | 3 |
| Karangasem | 13 |
| Klungkung | 5 |
| Tabanan | 21 |
| **Total** | **235** |

Kategori: 1 banten jadi/canang, 7 bahan/sarana upakara, 56 bunga, 34 buah/sayur, dan 137 pasar. Kategori berasal dari tag/nama komunitas dan bukan inventori yang sudah dikonfirmasi.

Contoh yang mempunyai objek sumber:

- [Canang Sari Store](https://www.openstreetmap.org/node/13437165319), Badung.
- [Linggarsari Upakara Jimbaran](https://www.openstreetmap.org/way/563221997), Badung.
- [Dupa Wangi Gayathri](https://www.openstreetmap.org/node/3233751486), Denpasar.
- [Toko Dupa Kawi Gopala](https://www.openstreetmap.org/node/11813331098), Denpasar.

Pengambilan awal menghasilkan snapshot parsial 212, kemudian pembaruan aplikasi berhasil memuat 240 objek. Pemeriksaan tag menyisihkan 5 objek dengan kategori usaha yang bertentangan, seperti laundry/party/furniture yang kebetulan bernama “Bunga” atau bertag tidak konsisten. Snapshot akhir 235. Jumlah ini bukan jumlah seluruh toko unik atau seluruh penjual banten di Bali.

## Perubahan yang diterapkan

- Tampilan awal mencakup Bali; dropdown mencakup seluruh 9 kabupaten/kota.
- Filter wilayah menggunakan hasil pemeriksaan koordinat terhadap Polygon/MultiPolygon OSM. Titik di Jawa yang masih masuk bounding box lebar Bali disisihkan. Geometri kepulauan Klungkung ikut diperiksa.
- Form Cari melakukan pembaruan sumber secara eksplisit. Cari di area ini membatasi request ke viewport yang beririsan dengan wilayah pilihan.
- Endpoint `GET /api/vendors/search` memvalidasi wilayah/bounds; query dibangun dari pilihan yang diketahui, bukan query Overpass bebas dari browser.
- Cache sukses maksimal 10 menit/12 entri per proses; request identik yang bersamaan berbagi panggilan; request lain ditolak sementara saat upstream aktif atau interval minimal belum lewat.
- Batas 600 objek, timeout 30 detik, penolakan hasil parsial/terlalu besar, dan pesan gagal tanpa menghapus direktori yang sudah tampil.
- Kartu dimuat 20 per tahap. Semua hasil direktori tetap dapat digambarkan sebagai marker/clustering.
- Sumber OSM, tanggal pengambilan, status pemeriksaan, serta lisensi terlihat pada UI. Rincian tidak membuat alamat, produk, harga, atau jam buka yang tidak tersedia.
- Telepon tidak otomatis dijadikan WhatsApp. Pencocokan kebutuhan diberi konteks perkiraan kategori; pasar tidak lagi dianggap cocok dengan semua bahan.
- Impor lokal dan favorit dipertahankan. Simulasi tidak ditampilkan oleh query publik. Ekspor menambahkan atribusi dan tautan lisensi OSM.
- `.env.example` menggunakan placeholder, bukan nilai kredensial. `.env.local` tidak diubah.
- Tidak menambah dependency aplikasi atau database. Geometri administrasi tetap pada server/skrip, tidak masuk chunk browser yang diperiksa.

## Pengujian

Tabel berikut mencatat pengujian implementasi data awal saat tile masih CARTO. Bukti screenshot awal juga memakai CARTO. Pemeriksaan pergantian gambar dasar dicatat terpisah di bawah.

| Pemeriksaan | Hasil |
|---|---|
| `npm test` | Lulus: budget, vendor, geografi/parser OSM, dedup, salah kategori, cache, konkurensi, kegagalan jaringan, 429, respons rusak, batas ukuran. |
| `npm run typecheck` | Lulus. |
| `npm run build` | Lulus; route peta statis, endpoint pencarian dinamis. First Load JS peta tercatat 135 kB pada build ini. |
| Pengambilan data nyata | Berhasil dari Overpass yang didokumentasikan OSM, melalui instance VK Maps. |
| Pembaruan melalui aplikasi | `GET /api/vendors/search?region=all` menghasilkan HTTP 200 dan 240 hasil sebelum penyaringan kategori diperketat. Waktu respons yang tercatat 24.406 ms; pengulangan dari cache 33 ms. Ini observasi sesi pengujian, bukan benchmark. |
| Validasi endpoint | Wilayah Jakarta dan bounds di luar Bali ditolak HTTP 400. |
| Ketersediaan layanan | Beberapa instance/query menghasilkan 406/502/503/504 atau timeout; diperlakukan sebagai kegagalan sumber, tanpa toko simulasi. |
| Filter UI sembilan wilayah | Jumlah berubah sesuai data snapshot; dropdown, judul wilayah, kartu, dan marker mengikuti pilihan. |
| Kartu bertahap | Tombol muat berikutnya menambah kartu dari 20 menjadi 40. |
| Verifikasi lapangan | Filter lapangan menghasilkan 0 untuk snapshot OSM; tidak membuat klaim verified. |
| Ponsel | Lebar aktual 320px tanpa overflow horizontal; detail Canang Sari Store, tautan sumber, dan rute diperiksa. |
| Sumber dan rute | Sumber mengarah ke objek OSM; rute mengarah ke Google Maps dengan koordinat OSM. |
| Lisensi dan bundle | Atribusi CARTO/OSM terlihat; sumber geometri administrasi tidak ditemukan dalam chunk browser yang diperiksa. |

Node masih memberi peringatan existing `MODULE_TYPELESS_PACKAGE_JSON` saat tes TypeScript langsung. Konfigurasi modul tidak diubah karena tes dan build tetap berhasil.

## Dokumen dan bukti

- [Rencana yang disesuaikan](MAPS_REAL_DATA_PLAN.md)
- [Panduan fitur peta](PETA_TOKO_BANTEN.md)
- [Sumber, lisensi, dan pembaruan data](../data/README.md)
- [Peta desktop](ui-screenshots/maps-real-data-desktop.jpg)
- [Rincian toko pada ponsel](ui-screenshots/maps-real-data-mobile.jpg)

## Batas yang masih berlaku

Data OSM dapat tidak lengkap, salah tag, memiliki objek berbeda untuk usaha yang sama, atau belum mencatat usaha baru. Dedup berdasarkan ID objek tidak membuktikan dua objek bernama sama merupakan dua usaha berbeda. Alamat/kontak sebagian lokasi belum tersedia. Konfirmasi produk, jam, dan stok tetap perlu dilakukan ke penjual; ini bukan verifikasi lapangan.

Layanan Overpass publik tidak memiliki jaminan ketersediaan aplikasi. Cache dan pembatas request masih per proses, sehingga deployment banyak instance membutuhkan kontrol bersama atau layanan sumber yang sesuai. Batas hasil 600 berarti pencarian perlu dipersempit bila sumber mengembalikan hasil sebanyak batas itu.

Belum dilakukan survei fisik, pengujian perangkat fisik/lintas browser, permintaan izin GPS, atau deployment publik. Pengujian pembaruan langsung berhasil untuk cakupan Bali; tidak mengirim ulang sembilan query live hanya untuk mengulang pemeriksaan cakupan yang sudah tersedia pada snapshot.

Referensi sumber: [Overpass API dan daftar instance](https://wiki.openstreetmap.org/wiki/Overpass_API), [lisensi dan atribusi OSM](https://www.openstreetmap.org/copyright).

## Pembaruan gambar dasar ke OpenStreetMap

- `MapCanvas.tsx` memuat tile dari `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, tanpa key atau request ke CARTO.
- Zoom maksimal 19; atribusi `© OpenStreetMap contributors` memiliki tautan lisensi.
- Variabel CARTO dihapus dari `.env.example`; `.env.local` tidak diubah.
- Tidak ada perubahan data toko, filter, cluster, favorit, kurasi, pencarian Overpass, atau tautan rute.
- Menggunakan cache HTTP dan Referer browser bawaan, tanpa fitur unduh massal/offline. Batas layanan publik mengikuti [kebijakan tile OSM](https://operations.osmfoundation.org/policies/tiles/).
- Validasi pembaruan: `npm test`, `npm run typecheck`, dan `npm run build` lolos. Preview produksi lokal dimuat ulang; tile standar OSM, cluster lokasi, jumlah 235, dan atribusi tertaut OSM terlihat.
- Bukti terbaru: [gambar dasar OpenStreetMap pada browser](ui-screenshots/maps-osm-basemap-desktop.png). Tidak mengulang pengujian GPS, lintas browser, perangkat fisik, atau pembaruan live Overpass karena alur tersebut tidak diubah.
