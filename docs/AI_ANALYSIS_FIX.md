# Perbaikan kegagalan analisis AI

Tanggal: 1 November 2026.

## Penyebab yang terverifikasi

- `POST /api/analyze` dengan catatan uji mengembalikan HTTP 502 dan pesan umum “Layanan AI sedang tidak tersedia.”
- Pemeriksaan autentikasi langsung ke endpoint model OpenAI mengembalikan HTTP 401 dengan kode `expired_secret_key`.
- `OPENAI_API_KEY` sudah diisi, tetapi key tersebut kedaluwarsa. Model yang dikonfigurasi tetap `gpt-4.1-mini`. Mengganti model atau peta tidak menyelesaikan kegagalan autentikasi ini.

Pemeriksaan tidak mencatat key, pesan mentah provider, foto, atau catatan pengguna. Lihat [panduan error resmi OpenAI](https://developers.openai.com/api/docs/guides/error-codes) untuk penanganan autentikasi 401.

## Perubahan

- API memberi pesan spesifik untuk key kedaluwarsa atau tidak valid dengan HTTP 503. Pesan meminta pengguna menghubungi pengelola dan menyebut input manual yang tetap tersedia.
- Key yang belum diisi menghasilkan pesan konfigurasi HTTP 503, bukan ekstraksi sampel yang tidak berasal dari catatan pengguna.
- Respons error konfigurasi memakai `Cache-Control: no-store`.
- Kegagalan provider dicatat di server sebagai status HTTP dan request ID saja.
- Tes regresi menjalankan handler asli dengan respons provider tiruan untuk key kedaluwarsa, respons 401 non-JSON, key kosong, input kosong, dan ekstraksi sukses. Tes juga memastikan pesan mentah dan key tidak bocor melalui respons atau log.

## Memulihkan akses AI

1. Pengelola membuat key yang valid melalui [pengaturan API OpenAI](https://platform.openai.com/api-keys).
2. Ganti nilai `OPENAI_API_KEY` di `.env.local` secara lokal. Jangan mengirim key ke chat.
3. Restart proses Next.js agar konfigurasi baru dimuat. Untuk hosting, perbarui environment variable server dan restart/redeploy.
4. Coba analisis catatan singkat, misalnya `Canang 2 buah`, lalu periksa hasilnya.

Key lama tidak dihapus atau diganti otomatis. Keberhasilan ekstraksi langsung ke provider belum dapat diverifikasi sebelum tersedia key yang valid; tes respons sukses memakai provider tiruan.

## Validasi

- `npm test`: lolos seluruh suite kalkulasi, direktori toko, OSM, dan handler analisis.
- `npm run typecheck`: lolos.
- `npm run build`: lolos.
- Preview produksi lokal: permintaan analisis dengan key yang masih kedaluwarsa mengembalikan HTTP 503, `Cache-Control: no-store`, dan pesan spesifik key kedaluwarsa.
