/**
 * Builds a WhatsApp deep link containing a payment URL.
 * Used as a fallback when the Web Share API is unavailable.
 */
export function buildWhatsAppLink(paymentUrl: string, note?: string): string {
  const body = note
    ? `${note}\n\n${paymentUrl}`
    : `Here is your payment link:\n\n${paymentUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(body)}`;
}

/**
 * Shares a Paystack payment link via the native OS share sheet (Web Share API)
 * with a WhatsApp deep link as fallback.
 *
 * Call this after a successful CREATE_INVOICE response.
 */
export async function sharePaymentLink(
  paymentUrl: string,
  note?: string
): Promise<void> {
  const text = note ?? "Here is your payment link";

  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: "Payment Request — V2V", text, url: paymentUrl });
    return;
  }

  // Fallback: open WhatsApp deep link in a new tab
  window.open(buildWhatsAppLink(paymentUrl, note), "_blank", "noopener,noreferrer");
}
