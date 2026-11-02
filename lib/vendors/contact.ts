/**
 * Normalizes an Indonesian phone number to international digits (e.g. "0812-3456" -> "628123456").
 * Returns null when the input does not look like a usable phone number.
 */
export function normalizePhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits.length >= 9 && digits.length <= 15 ? digits : null;
}

export function buildWhatsAppUrl(raw: string | undefined | null): string | null {
  const digits = normalizePhone(raw);
  return digits ? `https://wa.me/${digits}` : null;
}

export function buildTelUrl(raw: string | undefined | null): string | null {
  const digits = normalizePhone(raw);
  return digits ? `tel:+${digits}` : null;
}

export type WhatsAppTemplateType = "order" | "consultation" | "inquiry";

export interface WhatsAppTemplateParams {
  phone: string | undefined | null;
  vendorName: string;
  isJeroMangku: boolean;
  templateType: WhatsAppTemplateType;
  checklist?: Array<{ name: string; quantity?: number | null; unit?: string | null }>;
}

export function buildWhatsAppTemplateUrl(params: WhatsAppTemplateParams): string | null {
  const digits = normalizePhone(params.phone);
  if (!digits) return null;

  const validItems = (params.checklist || [])
    .filter(item => item.name && item.name.trim().length > 0)
    .slice(0, 6)
    .map(item => {
      const qty = item.quantity ? ` (${item.quantity} ${item.unit || "buah"})`.trim() : "";
      return `• ${item.name}${qty}`;
    });

  const itemsText = validItems.length > 0
    ? `\n\nCatatan kebutuhan saking AI NgaeBanten:\n${validItems.join("\n")}`
    : "";

  let message = "";
  if (params.isJeroMangku) {
    if (params.templateType === "consultation") {
      message = `Om Swastyastu Jero Mangku.\nTiang jagi nunas bimbingan/konsultasi dudonan karya upacara miwah pemuput karya ring genah tiang.${itemsText}\n\nSapunapi kenten kasedian galah Jero Mangku? Matur suksma.`;
    } else {
      message = `Om Swastyastu Jero Mangku / Ibu Serati.\nTiang jagi nunas tulung/pesan sarana upakara:${itemsText}\n\nSapunapi kenten persediaan ring griya/toko Jero Mangku? Matur suksma.`;
    }
  } else {
    message = `Halo ${params.vendorName}, tiang ingin menanyakan ketersediaan bahan upakara:${itemsText}\n\nApakah saat ini stok tersedia? Terima kasih.`;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
