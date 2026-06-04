const DEFAULT_MERCHANT_ID = "default_merchant";

export function getDefaultMerchantId(): string {
  return process.env.DEFAULT_MERCHANT_ID?.trim() || DEFAULT_MERCHANT_ID;
}

/** Converts NGN whole units (from LLM payloads) to kobo for storage. */
export function nairaToKobo(amountNgn: number): number {
  return Math.round(amountNgn * 100);
}
