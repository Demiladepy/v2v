// ==========================================
// Paystack webhook event processing
// Settlement decisions use verified payload + stored reference only.
// ==========================================

import {
  getTransactionByReference,
  settleTransactionFromWebhook,
  failTransactionFromWebhook,
} from "@/lib/db/ledger";

export type PaystackWebhookEvent = {
  event: string;
  data: {
    id?: number;
    reference?: string;
    amount?: number;
    status?: string;
  };
};

export type WebhookProcessResult =
  | { action: "ignored_invalid_payload" }
  | { action: "ignored_unknown_reference" }
  | { action: "ignored_amount_mismatch" }
  | { action: "already_settled" }
  | { action: "duplicate_event" }
  | { action: "settled"; reference: string }
  | { action: "failed"; reference: string }
  | { action: "ignored_unhandled_event" };

function eventId(event: PaystackWebhookEvent): string {
  return String(event.data.id ?? event.data.reference ?? "unknown");
}

export async function processPaystackWebhookEvent(
  event: PaystackWebhookEvent
): Promise<WebhookProcessResult> {
  const reference = event.data.reference?.trim();

  if (!reference) {
    return { action: "ignored_invalid_payload" };
  }

  const transaction = await getTransactionByReference(reference);

  if (!transaction) {
    return { action: "ignored_unknown_reference" };
  }

  const id = eventId(event);

  if (event.event === "charge.success") {
    const eventAmountKobo = Number(event.data.amount);

    if (!Number.isFinite(eventAmountKobo)) {
      return { action: "ignored_invalid_payload" };
    }

    if (eventAmountKobo !== transaction.amount) {
      return { action: "ignored_amount_mismatch" };
    }

    const outcome = await settleTransactionFromWebhook(reference, id);

    switch (outcome) {
      case "settled":
        return { action: "settled", reference };
      case "already_settled":
        return { action: "already_settled" };
      case "duplicate_event":
        return { action: "duplicate_event" };
      default:
        return { action: "ignored_unknown_reference" };
    }
  }

  if (event.event === "charge.failed") {
    const outcome = await failTransactionFromWebhook(reference, id);

    switch (outcome) {
      case "failed":
        return { action: "failed", reference };
      case "already_settled":
        return { action: "already_settled" };
      case "duplicate_event":
        return { action: "duplicate_event" };
      default:
        return { action: "ignored_unknown_reference" };
    }
  }

  return { action: "ignored_unhandled_event" };
}
