import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero wrap" id="beranda" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="eyebrow">DARI CATATAN KELUARGA, UNTUK KELUARGA</span>
        <h1 id="hero-title">Persiapan banten lebih <em>tertata.</em></h1>
        <p className="hero-description">
          Rapikan catatan dari serati atau keluarga menjadi daftar kebutuhan.
          Periksa bahannya, hitung anggaran, lalu temukan tempat belanja.
        </p>
        <div className="hero-actions">
          <a href="#perencana" className="button button-primary button-lg">
            Susun rencana <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href="#cara-kerja" className="hero-secondary-link">Pelajari caranya <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <p className="trust-line"><Check size={17} aria-hidden="true" /> Rincian upakara tetap mengikuti arahan serati dan keluarga.</p>
      </div>

      <aside className="hero-guide" aria-labelledby="guide-title">
        <span className="section-kicker">MULAI DARI SINI</span>
        <h2 id="guide-title">Satu catatan, bekal persiapan bersama.</h2>
        <p>Sudah punya daftar dari keluarga? Siapkan teks atau foto catatan Anda.</p>
        <ol className="hero-shortcuts">
          <li><a href="#perencana"><span className="shortcut-number">01</span><span>Tulis kebutuhan<small>Ketik catatan atau unggah fotonya</small></span><ArrowRight size={18} aria-hidden="true" /></a></li>
          <li><a href="#checklist"><span className="shortcut-number">02</span><span>Periksa daftar & biaya<small>Lengkapi bahan dan harga satuan</small></span><ArrowRight size={18} aria-hidden="true" /></a></li>
          <li><Link href="/peta-toko-banten"><span className="shortcut-number">03</span><span>Cari tempat belanja<small>Jelajahi referensi toko di Bali</small></span><ArrowRight size={18} aria-hidden="true" /></Link></li>
        </ol>
        <p className="guide-footnote">Bisa mulai dengan menambahkan bahan secara manual.</p>
      </aside>
    </section>
  );
}
