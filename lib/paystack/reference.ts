import { randomBytes } from "crypto";

export function generatePaymentReference(): string {
  return `v2v_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export function invoiceEmailFromClient(client: string): string {
  const slug = client
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return `${slug || "customer"}@v2v.local`;
}

export function getPaymentCallbackUrl(): string {
  const base = process.env.APP_BASE_URL?.trim() || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/payment/complete`;
}
