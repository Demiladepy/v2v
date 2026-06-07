import type { InvoiceLanguage, LLMResponsePayload } from "@/types";
import type { ParsedIntent } from "@/lib/validations/parsed-intent";
import { validateParsedIntent } from "@/lib/validations/parsed-intent";

export function llmPayloadToParsedIntent(
  payload: LLMResponsePayload,
  language?: InvoiceLanguage
): ParsedIntent {
  switch (payload.intent) {
    case "CREATE_INVOICE":
      return {
        intent_type: "CREATE_INVOICE",
        client: payload.client,
        amount: payload.amount,
        memo: payload.memo,
        language: language ?? payload.language ?? "english",
      };
    case "CHECK_BALANCE":
      return {
        intent_type: "CHECK_BALANCE",
        account_type: payload.account_type,
      };
    case "RUN_NEGOTIATION":
      return {
        intent_type: "RUN_NEGOTIATION",
        counterparty: payload.counterparty,
        requested_amount: payload.requested_amount,
      };
    default: {
      const _exhaustive: never = payload;
      return _exhaustive;
    }
  }
}

export function validateLlmToParsed(
  payload: LLMResponsePayload,
  language?: InvoiceLanguage
):
  | { success: true; data: ParsedIntent }
  | { success: false; error: string; details: unknown } {
  const parsed = llmPayloadToParsedIntent(payload, language);
  return validateParsedIntent(parsed);
}
