import { Flower2 } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true">
            <Flower2 size={20} />
          </span>
          <strong>AI NgaeBanten</strong>
        </div>
        <div className="footer-copy">
          Membantu merencanakan, tetap menghormati tradisi upakara yadnya di Bali.
          <span>Inovasi Perencanaan Banten · Bali DigiFest 2026.</span>
        </div>
      </div>
    </footer>
  );
}

