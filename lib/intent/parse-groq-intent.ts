import type { LLMResponsePayload } from "@/types";
import { parseLLMResponsePayload } from "@/lib/validations/intent";
import type { ParsedIntent } from "@/lib/validations/parsed-intent";

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[₦,\s]/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function extractJsonObject(text: string): string {
  const trimmed = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON intent found in model response");
  }

  return match[0];
}

export function normalizeLlmIntent(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const obj = { ...(raw as Record<string, unknown>) };

  if (obj.intent === "CREATE_INVOICE") {
    const amount = coerceNumber(obj.amount);
    if (amount != null) {
      obj.amount = amount;
    }
    if (!obj.client || String(obj.client).trim() === "") {
      obj.client = "Customer";
    }
    if (!obj.memo || String(obj.memo).trim() === "") {
      obj.memo = "Voice invoice";
    }
  }

  if (obj.intent === "CHECK_BALANCE") {
    if (!obj.account_type || String(obj.account_type).trim() === "") {
      obj.account_type = "primary";
    }
  }

  if (obj.intent === "RUN_NEGOTIATION") {
    const amount = coerceNumber(obj.requested_amount);
    if (amount != null) {
      obj.requested_amount = amount;
    }
    if (!obj.counterparty || String(obj.counterparty).trim() === "") {
      obj.counterparty = "Supplier";
    }
  }

  return obj;
}

export function parseGroqIntentContent(content: string): LLMResponsePayload {
  const jsonText = extractJsonObject(content);
  const raw = JSON.parse(jsonText) as unknown;
  const normalized = normalizeLlmIntent(raw);
  const validated = parseLLMResponsePayload(normalized);

  if (!validated.success) {
    throw new Error(validated.error);
  }

  return validated.data;
}

export function parsedIntentToLlmPayload(parsed: ParsedIntent): LLMResponsePayload {
  switch (parsed.intent_type) {
    case "CREATE_INVOICE":
      return {
        intent: "CREATE_INVOICE",
        client: parsed.client,
        amount: parsed.amount,
        memo: parsed.memo,
        language: parsed.language,
      };
    case "CHECK_BALANCE":
      return {
        intent: "CHECK_BALANCE",
        account_type: parsed.account_type,
      };
    case "RUN_NEGOTIATION":
      return {
        intent: "RUN_NEGOTIATION",
        counterparty: parsed.counterparty,
        requested_amount: parsed.requested_amount,
      };
    default: {
      const _exhaustive: never = parsed;
      return _exhaustive;
    }
  }
}
