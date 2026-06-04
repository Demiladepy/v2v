// ==========================================
// Intent parser interface + stub implementation
// ML seam: INTENT_PARSER_MODE=ml + ML_INTENT_PARSER_URL
// ==========================================

import {
  validateParsedIntent,
  type ParsedIntent,
} from "@/lib/validations/parsed-intent";

export type IntentParser = (transcript: string) => Promise<ParsedIntent>;

export type IntentParserError = {
  code: "UNRECOGNIZED_INTENT" | "ML_PARSER_FAILED" | "INVALID_PARSER_OUTPUT";
  message: string;
  details?: unknown;
};

function extractAmount(text: string): number | null {
  const nairaMatch = text.match(/(?:₦|ngn|naira)\s*([\d,]+)/i);
  if (nairaMatch) {
    return Number(nairaMatch[1].replace(/,/g, ""));
  }

  const plainMatch = text.match(/\b([\d,]{2,})\b/);
  if (plainMatch) {
    return Number(plainMatch[1].replace(/,/g, ""));
  }

  return null;
}

function extractClient(text: string): string | null {
  const invoiceMatch = text.match(
    /\binvoice\s+([A-Za-z0-9][A-Za-z0-9\s'-]{1,40}?)(?:\s+(?:₦|ngn|for|\d)|$)/i
  );
  if (invoiceMatch) {
    return invoiceMatch[1].trim();
  }

  const forMatch = text.match(/\bfor\s+([A-Za-z0-9][A-Za-z0-9\s'-]{1,40})/i);
  if (forMatch) {
    return forMatch[1].trim();
  }

  return null;
}

function extractCounterparty(text: string): string | null {
  const withMatch = text.match(
    /\bwith\s+([A-Za-z0-9][A-Za-z0-9\s'-]{1,40}?)(?:\s+for\b|\s+₦|\s+\d|$)/i
  );
  if (withMatch) {
    return withMatch[1].trim();
  }

  const supplierMatch = text.match(
    /supplier\s+([A-Za-z0-9][A-Za-z0-9\s'-]{1,40})/i
  );
  if (supplierMatch) {
    return supplierMatch[1].trim();
  }

  return null;
}

export const keywordIntentParser: IntentParser = async (transcript) => {
  const text = transcript.toLowerCase();

  if (text.includes("invoice") || text.includes("bill")) {
    const amount = extractAmount(transcript);
    if (!amount) {
      throw {
        code: "UNRECOGNIZED_INTENT",
        message: "Could not extract invoice amount from transcript",
      } satisfies IntentParserError;
    }

    return {
      intent_type: "CREATE_INVOICE",
      client: extractClient(transcript) ?? "Customer",
      amount,
      memo: transcript.trim(),
    };
  }

  if (text.includes("balance") || text.includes("how much")) {
    const account_type = text.includes("savings")
      ? "high_yield_sub_account"
      : "primary";

    return {
      intent_type: "CHECK_BALANCE",
      account_type,
    };
  }

  if (text.includes("negotiate")) {
    const amount = extractAmount(transcript);
    if (!amount) {
      throw {
        code: "UNRECOGNIZED_INTENT",
        message: "Could not extract negotiation amount from transcript",
      } satisfies IntentParserError;
    }

    return {
      intent_type: "RUN_NEGOTIATION",
      counterparty: extractCounterparty(transcript) ?? "Supplier",
      requested_amount: amount,
    };
  }

  throw {
    code: "UNRECOGNIZED_INTENT",
    message: "No matching intent found in transcript",
  } satisfies IntentParserError;
};

async function mlIntentParser(transcript: string): Promise<ParsedIntent> {
  const url = process.env.ML_INTENT_PARSER_URL?.trim();

  if (!url) {
    throw {
      code: "ML_PARSER_FAILED",
      message: "ML_INTENT_PARSER_URL is not configured",
    } satisfies IntentParserError;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!response.ok) {
    throw {
      code: "ML_PARSER_FAILED",
      message: `ML intent parser returned ${response.status}`,
    } satisfies IntentParserError;
  }

  const payload: unknown = await response.json();
  const validated = validateParsedIntent(payload);

  if (!validated.success) {
    throw {
      code: "INVALID_PARSER_OUTPUT",
      message: validated.error,
      details: validated.details,
    } satisfies IntentParserError;
  }

  return validated.data;
}

export function getIntentParser(): IntentParser {
  const mode = process.env.INTENT_PARSER_MODE?.trim().toLowerCase() ?? "stub";

  if (mode === "ml") {
    return mlIntentParser;
  }

  return keywordIntentParser;
}

export async function parseTranscript(
  transcript: string
): Promise<ParsedIntent> {
  const parser = getIntentParser();
  const parsed = await parser(transcript);
  const validated = validateParsedIntent(parsed);

  if (!validated.success) {
    throw {
      code: "INVALID_PARSER_OUTPUT",
      message: validated.error,
      details: validated.details,
    } satisfies IntentParserError;
  }

  return validated.data;
}

export function isIntentParserError(error: unknown): error is IntentParserError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
