import { randomBytes } from "crypto";

export function generatePaymentReference(): string {
  return `v2v_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export function invoiceEmailFromClient(client: string): string {
  const slug = client
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  // Paystack rejects .local addresses — use a normal-looking checkout email.
  const localPart = slug || "customer";
  const domain =
    process.env.PAYSTACK_CHECKOUT_EMAIL_DOMAIN?.trim() || "checkout.v2vprotocol.com";

  return `${localPart}@${domain}`;
}

export function getPaymentCallbackUrl(): string {
  const base = process.env.APP_BASE_URL?.trim() || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/payment/complete`;
}
