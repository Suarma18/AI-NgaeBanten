/**
 * Panduan Visual Anatomi Banten & Metanding
 * Referensi susunan layer dan makna filosofis upakara Hindu Bali untuk generasi muda.
 */

export interface BantenLayer {
  layerNumber: number;
  name: string;
  balineseTerm: string;
  symbolism: string;
  ingredients: string[];
  tipsForYouth: string;
  direction?: "Timur (Iswara)" | "Selatan (Brahma)" | "Barat (Mahadewa)" | "Utara (Wisnu)" | "Tengah (Siwa)";
}

export interface BantenAnatomyGuide {
  id: "canang_sari" | "pejati";
  name: string;
  subtitle: string;
  summary: string;
  mantraOrPrinciple: string;
  layers: BantenLayer[];
  commonMistakes: string[];
  rulesOfDirection?: Array<{
    direction: string;
    deity: string;
    flowerColor: string;
    meaning: string;
  }>;
}

export const BANTEN_ANATOMY_GUIDES: Record<string, BantenAnatomyGuide> = {
  canang_sari: {
    id: "canang_sari",
    name: "Anatomi Canang Sari",
    subtitle: "Susunan Layer dari Dasar ke Puncak & Penataan Bunga Panca Warna",
    summary: "Canang sari adalah sarana persembahan harian paling mendasar dalam yadnya Hindu Bali. Kata 'Canang' berasal dari bahasa Jawa Kuno 'Ca' (indah) dan 'Nang' (tujuan/memohon), sedangkan 'Sari' bermakna inti atau ketulusan jiwa.",
    mantraOrPrinciple: "Patram puspam phalam toyam — Daun, bunga, buah, dan air yang dipersembahkan dengan penuh ketulusan.",
    layers: [
      {
        layerNumber: 1,
        name: "Ceper (Wadah Dasar)",
        balineseTerm: "Ceper / Tamas Janur",
        symbolism: "Alas segi empat melambangkan Panca Maha Bhuta (lima elemen penyusun alam semesta: tanah, air, api, udara, ether).",
        ingredients: ["Janur busung dirangkai semat bambu membentuk bujur sangkar"],
        tipsForYouth: "Pastikan semat bambu kuat agar ceper tidak melengkung saat diangkat.",
      },
      {
        layerNumber: 2,
        name: "Taledan (Alas Daun)",
        balineseTerm: "Taledan Don Pisang",
        symbolism: "Kesucian alas yadnya, memisahkan persembahan dari kontak kotor permukaan duniawi.",
        ingredients: ["Daun pisang segar dipotong rapi sesuai ukuran ceper"],
        tipsForYouth: "Pilih daun pisang muda (jangan yang kuning layu) dan lap bersih sebelum dipasang.",
      },
      {
        layerNumber: 3,
        name: "Porosan Tri Murti (Inti Banten)",
        balineseTerm: "Porosan Silih Asih",
        symbolism: "Porosan adalah jantung canang sari. Pertemuan Daun Sirih (Wisnu/Pelihara), Buah Pinang (Brahma/Pencipta), dan Pamor/Kapur Sirih (Siwa/Pelebur).",
        ingredients: ["Daun sirih hijau/hitam", "Buah pinang/ceki", "Kapur sirih putih"],
        tipsForYouth: "Tanpa porosan, canang tidak sah (hanya sekadar wadah bunga). Letakkan tepat di tengah ceper.",
      },
      {
        layerNumber: 4,
        name: "Urasari / Sampian Sari",
        balineseTerm: "Sampian Sari Ngringgit",
        symbolism: "Rangkaian janur bundar mekar melambangkan roda Cakra kehidupan dan keindahan ciptaan Ida Sang Hyang Widhi Wasa.",
        ingredients: ["Janur busung kuning/putih di-ngringgit halus"],
        tipsForYouth: "Gunakan janur yang sudah dibasahi kain lembab (H-2) agar tidak patah saat ditekuk membentuk ornamen.",
      },
      {
        layerNumber: 5,
        name: "Bunga Panca Warna (Catur Warna)",
        balineseTerm: "Kembang Pengider Buana",
        symbolism: "Menghormati manifestasi Tuhan di 5 penjuru mata angin (Panca Dewata).",
        ingredients: ["Bunga Putih (Timur)", "Bunga Merah (Selatan)", "Bunga Kuning (Barat)", "Bunga Biru/Ungu (Utara)", "Kembang Rampe (Tengah)"],
        tipsForYouth: "Susun rapi searah jarum jam (Pradaksina) sesuai arah mata angin.",
      },
      {
        layerNumber: 6,
        name: "Minyak Wangi & Sesari",
        balineseTerm: "Miyik-miyikan & Uang Kepeng / Sesari",
        symbolism: "Keharuman budhi pekerti luhur dan keikhlasan berkorban (Dana Punya).",
        ingredients: ["Minyak wangi bunga", "Uang logam kepeng / rupiah"],
        tipsForYouth: "Teteskan minyak wangi secukupnya di kembang rampe tengah agar menyebarkan keharuman sejuk.",
      },
    ],
    rulesOfDirection: [
      { direction: "Timur", deity: "Sang Hyang Iswara", flowerColor: "Putih (Kamboja / Cempaka Putih)", meaning: "Kesucian pikiran & kebijaksanaan mulia" },
      { direction: "Selatan", deity: "Bhatara Brahma", flowerColor: "Merah (Pacar Air Merah / Mawar)", meaning: "Semangat hidup, keberanian & keteguhan tekad" },
      { direction: "Barat", deity: "Bhatara Mahadewa", flowerColor: "Kuning (Bunga Mitir / Marigold / Cempaka Kuning)", meaning: "Kemakmuran, welas asih & sinar pencerahan" },
      { direction: "Utara", deity: "Bhatara Wisnu", flowerColor: "Hitam / Biru / Ungu (Pacar Ungu / Telang)", meaning: "Kesejukan hati, kesetiaan & kedamaian jiwa" },
      { direction: "Tengah", deity: "Sang Hyang Siwa", flowerColor: "Kembang Rampe Daun Pandan Harum", meaning: "Pelebur segala noda dan pelebur kebodohan" },
    ],
    commonMistakes: [
      "Lupa menaruh Porosan Tri Murti (ini adalah kesalahan paling sering pemula).",
      "Menaruh bunga merah di arah timur atau bunga putih di arah selatan (terbalik arah pengider).",
      "Bunga basah kuyup ditaruh terlalu awal sehingga jamuran sebelum rahinan tiba.",
    ],
  },
  pejati: {
    id: "pejati",
    name: "Anatomi Banten Pejati",
    subtitle: "Empat Pilar Upakara Penyaksi: Daksina, Peras, Penyeneng & Tipat Kelanan",
    summary: "Banten Pejati berasal dari kata 'Jati' yang artinya sungguh-sungguh atau menyatakan ketulusan hati. Pejati berfungsi sebagai banten penyaksi (persaksian upacara ke hadapan Hyang Widhi dan Bhatara Surya) dalam segala upacara yadnya.",
    mantraOrPrinciple: "Om awighnam astu namo siddham — Semoga tidak ada rintangan dan segala kebaikan terwujud secara sempurna.",
    layers: [
      {
        layerNumber: 1,
        name: "Banten Daksina (Pilar Utama)",
        balineseTerm: "Daksina Guru / Lingga Upakara",
        symbolism: "Perwujudan Ida Sang Hyang Guru (Siwa). Menggunakan kelapa tua, beras, telur bebek, pangi, gegantusan, pesucian.",
        ingredients: ["Wakul/Bedogan daksina", "Kelapa tua kupas", "Beras kuning", "Telur bebek", "Pangi & buah pala"],
        tipsForYouth: "Pilih kelapa daksina yang bulat mulus dan berbunyi air nyaring. Pastikan posisi mata kelapa menghadap ke atas.",
      },
      {
        layerNumber: 2,
        name: "Banten Peras (Pilar Legalitas Yadnya)",
        balineseTerm: "Peras Prasiddha",
        symbolism: "Berasal dari kata 'Prasiddha' artinya sah, berhasil, dan sukses. Merupakan permohonan agar seluruh dudonan upakara disahkan oleh Ida Sang Hyang Widhi.",
        ingredients: ["Kojong peras", "Nasi tumpeng kembar", "Raka-raka buah", "Sampian peras", "Kulit sesayut"],
        tipsForYouth: "Tumpeng peras harus berdiri kokoh dan tidak miring melambangkan keteguhan iman.",
      },
      {
        layerNumber: 3,
        name: "Banten Penyeneng / Tehenan",
        balineseTerm: "Penyeneng Peneguh Jiwa",
        symbolism: "Berasal dari kata 'Seneng' (bahagia dan tenang). Simbol pembersihan raga dan keteguhan batin agar orang yang beryadnya selalu damai jiwanya.",
        ingredients: ["Wadah janur berisi 3 rongga (beras, benang tridatu, uang kepeng)", "Daun plawa", "Minyak wangi"],
        tipsForYouth: "Gunakan benang tridatu (merah, putih, hitam) yang rapi tanpa kusut.",
      },
      {
        layerNumber: 4,
        name: "Tipat Kelanan (Enam Tipat Penakluk Nafsu)",
        balineseTerm: "Tipat Nem / Kelanan",
        symbolism: "Enam buah tipat nasi melambangkan pengendalian Sad Ripu (enam sifat kejahatan dalam diri: hawa nafsu, amarah, keserakahan, mabuk kepayang, kebingungan, dan iri hati).",
        ingredients: ["6 buah tipat beras matang", "Buah pisang mas", "Kue jajan pasang"],
        tipsForYouth: "Anyaman tipat harus rapat agar beras tidak tumpah saat direbus matang.",
      },
    ],
    commonMistakes: [
      "Mengganti telur bebek dengan telur ayam broiler (secara dresta umum digunakan telur bebek atau ayam kampung suci).",
      "Kelapa daksina berkondisi kotor atau batoknya pecah saat dikupas.",
      "Menata pejati tanpa sampian pesucian dan canang burat wangi di atasnya.",
    ],
  },
};

/**
 * Checks if a plan item matches an anatomy guide.
 */
export function matchAnatomyGuide(itemName: string): BantenAnatomyGuide | null {
  if (!itemName) return null;
  const lower = itemName.toLowerCase();

  if (lower.includes("pejati") || lower.includes("pajati")) {
    return BANTEN_ANATOMY_GUIDES.pejati;
  }
  if (lower.includes("canang") || lower.includes("canangsari")) {
    return BANTEN_ANATOMY_GUIDES.canang_sari;
  }

  return null;
}

