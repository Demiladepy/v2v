import { describe, expect, it } from "vitest";
import {
  normalizeLlmIntent,
  parseGroqIntentContent,
} from "@/lib/intent/parse-groq-intent";

describe("parseGroqIntentContent", () => {
  it("parses JSON wrapped in markdown fences", () => {
    const intent = parseGroqIntentContent(
      '```json\n{"intent":"CHECK_BALANCE","account_type":"primary"}\n```'
    );
    expect(intent).toEqual({
      intent: "CHECK_BALANCE",
      account_type: "primary",
    });
  });

  it("coerces string amounts for negotiation", () => {
    const intent = parseGroqIntentContent(
      '{"intent":"RUN_NEGOTIATION","counterparty":"Alao","requested_amount":"50000"}'
    );
    expect(intent).toEqual({
      intent: "RUN_NEGOTIATION",
      counterparty: "Alao",
      requested_amount: 50000,
    });
  });

  it("defaults missing balance account_type to primary", () => {
    const normalized = normalizeLlmIntent({
      intent: "CHECK_BALANCE",
      account_type: "",
    });
    expect(normalized).toEqual({
      intent: "CHECK_BALANCE",
      account_type: "primary",
    });
  });
});
