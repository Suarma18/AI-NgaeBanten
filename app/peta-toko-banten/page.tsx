import type { Metadata } from "next";
import BantenMap from "../../components/banten-map/BantenMap.tsx";
import "../../components/banten-map/map.css";

export const metadata: Metadata = {
  title: "Peta Toko Banten & Bahan Upakara — AI NgaeBanten",
  description:
    "Peta interaktif penemuan toko banten jadi, sentra janur, bunga segar, buah upakara, dan pasar tradisional di Denpasar serta wilayah Bali, terintegrasi dengan checklist kebutuhan Anda."
};

export default function PetaTokoBantenPage() {
  return <BantenMap />;
}

