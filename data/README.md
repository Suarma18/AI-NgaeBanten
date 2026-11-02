# Data direktori peta

`vendors.json`, `vendors.metadata.json`, dan `bali-regions.json` berasal dari OpenStreetMap contributors dan didistribusikan sebagai data berlisensi ODbL-1.0.

- Lisensi dan atribusi: https://www.openstreetmap.org/copyright
- Lisensi lengkap: https://opendatacommons.org/licenses/odbl/1-0/
- Setiap lokasi dan batas administrasi memiliki `sourceUrl` menuju objek sumber OSM.
- Tanggal pengambilan dan timestamp basis data OSM tercatat pada metadata. Lokasi belum diverifikasi lapangan; tag komunitas dapat tidak lengkap atau keliru.
- Kolom kategori dihasilkan dari tag/nama sumber; kategori tidak menjamin penjualan bahan upakara, janur, atau stok tertentu.
- Snapshot saat ini memuat 1 lokasi kategori canang/banten jadi dan 7 kategori bahan/sarana. Tambahan toko perlu sumber independen atau konfirmasi pemilik dengan koordinat yang dapat diperiksa.
- Tiga lokasi simulasi lama berada di `test/fixtures/vendors-simulated.json`, tidak dipakai sebagai data publik.

Untuk memperbarui snapshot dari respons JSON Overpass nyata yang sudah diambil sesuai ketentuan instance:

```powershell
node scripts/import-osm-snapshot.mjs path/to/markets.json path/to/flowers.json path/to/fruit.json
```

Skrip juga menerima respons JSON endpoint pencarian aplikasi yang berlabel `source: openstreetmap`. Skrip memeriksa sumber data, koordinat dan poligon Bali, menyisihkan data tanpa nama, menyatukan duplikat berdasarkan ID OSM, serta menghasilkan metadata jumlah per wilayah/kategori. Skrip impor dan tes TypeScript langsung memerlukan Node dengan dukungan type stripping (disarankan Node 24 LTS). Timestamp basis data dicatat jika tersedia dari respons mentah.

