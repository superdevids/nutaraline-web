/**
 * Public support channels. These are the only places the numbers/links live;
 * the contact button reads them so swapping in the real accounts is a one-line
 * change. Values are placeholders until the product owner supplies the real
 * ones — keep them searchable, never hardcode them in components.
 */
export const contactTelegramChannel = "nutaraline";

/** WhatsApp number in international format, digits only (no + or spaces). */
export const contactWhatsApp = "6280000000000";

export function telegramChannelUrl(handle = contactTelegramChannel): string {
  return `https://t.me/${handle.replace(/^@/, "")}`;
}

export function whatsAppUrl(phone = contactWhatsApp): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
