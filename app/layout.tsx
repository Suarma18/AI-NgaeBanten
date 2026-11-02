import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI NgaeBanten — Rencanakan Banten Lebih Tenang",
  description: "Asisten AI untuk merapikan catatan kebutuhan banten, menyusun checklist, menghitung anggaran, dan mencari tempat belanja.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${plusJakartaSans.variable}`}>
      <body>
        <a className="skip-link" href="#konten-utama">Lewati ke konten utama</a>
        {children}
      </body>
    </html>
  );
}

