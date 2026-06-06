import type { LLMResponsePayload } from "@/types";
import {
  createTransaction,
  getBalance,
} from "@/lib/db/ledger";
import { initializeTransaction } from "@/lib/paystack/client";
import {
  generatePaymentReference,
  getPaymentCallbackUrl,
  invoiceEmailFromClient,
} from "@/lib/paystack/reference";
import {
  buildIdempotencyKey,
  resolveIdempotencyKey,
  withIdempotency,
} from "@/lib/http/idempotency";
import { getDefaultMerchantId, nairaToKobo } from "@/lib/server/merchant";

export type FinancialRouterResult = {
  accepted: true;
  intent: LLMResponsePayload["intent"];
  message: string;
  authorization_url?: string;
  reference?: string;
};

/**
 * Routes validated LLM intents to the Supabase ledger.
 * Response shape is frozen (Day 1 contract); only implementations change.
 */
export type RouteFinancialOptions = {
  idempotencyHeader?: string | null;
};

async function executeCreateInvoice(
  payload: Extract<LLMResponsePayload, { intent: "CREATE_INVOICE" }>,
  merchantId: string
): Promise<FinancialRouterResult> {
  const reference = generatePaymentReference();

  await createTransaction({
    merchant_id: merchantId,
    intent_type: payload.intent,
    amount: nairaToKobo(payload.amount),
    reference,
    metadata: {
      client: payload.client,
      memo: payload.memo,
      amount_ngn: payload.amount,
      language: payload.language ?? "english",
    },
  });

  const checkout = await initializeTransaction({
    email: invoiceEmailFromClient(payload.client),
    amountNaira: payload.amount,
    reference,
    metadata: {
      client: payload.client,
      memo: payload.memo,
      merchant_id: merchantId,
      language: payload.language ?? "english",
    },
    callbackUrl: getPaymentCallbackUrl(),
  });

  return {
    accepted: true,
    intent: payload.intent,
    message: `Invoice for ${payload.client} (₦${payload.amount}) ready for payment.`,
    authorization_url: checkout.authorization_url,
    reference: checkout.reference,
  };
}

export async function routeFinancialIntent(
  payload: LLMResponsePayload,
  merchantId = getDefaultMerchantId(),
  options?: RouteFinancialOptions
): Promise<FinancialRouterResult> {
  switch (payload.intent) {
    case "CREATE_INVOICE": {
      const idempotencyHeader = options?.idempotencyHeader?.trim();

      // Only dedupe explicit retries (header). Same voice wording must still create new invoices.
      if (idempotencyHeader) {
        const idempotencyKey = resolveIdempotencyKey(
          idempotencyHeader,
          buildIdempotencyKey("create-invoice", { merchantId, key: idempotencyHeader })
        );

        const { body } = await withIdempotency(idempotencyKey, async () => ({
          status: 201,
          body: await executeCreateInvoice(payload, merchantId),
        }));

        return body;
      }

      return executeCreateInvoice(payload, merchantId);
    }
    case "CHECK_BALANCE": {
      const balance = await getBalance(merchantId);

      return {
        accepted: true,
        intent: payload.intent,
        message: `Balance for ${payload.account_type}: ₦${balance.ngn.toLocaleString("en-NG")} (${balance.kobo} kobo settled).`,
      };
    }
    case "RUN_NEGOTIATION": {
      await createTransaction({
        merchant_id: merchantId,
        intent_type: payload.intent,
        amount: nairaToKobo(payload.requested_amount),
        metadata: {
          counterparty: payload.counterparty,
          requested_amount_ngn: payload.requested_amount,
        },
      });

      return {
        accepted: true,
        intent: payload.intent,
        message: `Negotiation with ${payload.counterparty} (₦${payload.requested_amount}) queued.`,
      };
    }
    default: {
      const _exhaustive: never = payload;
      return _exhaustive;
    }
  }
}
