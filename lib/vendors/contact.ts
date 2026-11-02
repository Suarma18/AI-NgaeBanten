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

