import { FileText, ScanText, Wallet, MapPin } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Masukkan Catatan",
    text: "Ketik teks atau pilih foto catatan sarana banten dari serati atau keluarga."
  },
  {
    icon: ScanText,
    title: "Ekstraksi AI",
    text: "Sistem mengidentifikasi nama item, kuantitas, dan bagian yang membutuhkan klarifikasi."
  },
  {
    icon: Wallet,
    title: "Atur Anggaran",
    text: "Tandai bahan yang sudah tersedia di rumah, lalu masukkan harga per satuan."
  },
  {
    icon: MapPin,
    title: "Cari Tempat Belanja",
    text: "Akses peta wilayah Bali untuk mempermudah pencarian toko banten terdekat."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="how-section" id="cara-kerja">
      <div className="wrap">
        <div className="section-heading">
          <span className="section-kicker">CARA KERJA</span>
          <h2>Dari catatan ke daftar belanja.</h2>
        </div>
        <ol className="how-grid">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <li className="how-card" key={step.title}>
                <span className="how-step">0{index + 1}</span>
                <span className="how-icon" aria-hidden="true">
                  <IconComponent size={24} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

