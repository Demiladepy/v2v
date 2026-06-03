import type { LLMResponsePayload } from "@/types";

export type FinancialRouterResult = {
  accepted: true;
  intent: LLMResponsePayload["intent"];
  message: string;
};

/**
 * Day 1 stub: acknowledges validated intents without calling Paystack or Supabase.
 * Demilade wires real integrations in Phase 2.
 */
export function routeFinancialIntent(
  payload: LLMResponsePayload
): FinancialRouterResult {
  switch (payload.intent) {
    case "CREATE_INVOICE":
      return {
        accepted: true,
        intent: payload.intent,
        message: `Invoice for ${payload.client} (₦${payload.amount}) queued.`,
      };
    case "CHECK_BALANCE":
      return {
        accepted: true,
        intent: payload.intent,
        message: `Balance check for ${payload.account_type} queued.`,
      };
    case "RUN_NEGOTIATION":
      return {
        accepted: true,
        intent: payload.intent,
        message: `Negotiation with ${payload.counterparty} (₦${payload.requested_amount}) queued.`,
      };
    default: {
      const _exhaustive: never = payload;
      return _exhaustive;
    }
  }
}
