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
export async function routeFinancialIntent(
  payload: LLMResponsePayload,
  merchantId = getDefaultMerchantId()
): Promise<FinancialRouterResult> {
  switch (payload.intent) {
    case "CREATE_INVOICE": {
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
