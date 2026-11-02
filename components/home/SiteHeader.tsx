"use client";

import Link from "next/link";
import { Flower2, ArrowRight } from "lucide-react";

export default function SiteHeader() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#beranda" aria-label="AI NgaeBanten ke beranda">
          <span className="brand-mark" aria-hidden="true">
            <Flower2 size={22} />
          </span>
          <span translate="no">
            <strong>AI NgaeBanten</strong>
            <small>Asisten Perencanaan Banten</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#perencana">Perencana</a>
          <Link href="/peta-toko-banten" className="nav-map-link">
            Peta Toko Banten
          </Link>
        </nav>

        <a className="button button-sm button-primary" href="#perencana">
          Mulai Rencana <ArrowRight size={16} aria-hidden="true" />
        </a>
      </header>
    </>
  );
}

