import { describe, expect, it } from "vitest";
import { llmPayloadToParsedIntent } from "@/lib/intent/llm-to-parsed";

describe("llmPayloadToParsedIntent", () => {
  it("maps CREATE_INVOICE and applies language override", () => {
    const parsed = llmPayloadToParsedIntent(
      {
        intent: "CREATE_INVOICE",
        client: "John",
        amount: 15000,
        memo: "Services",
        language: "english",
      },
      "yoruba"
    );

    expect(parsed).toEqual({
      intent_type: "CREATE_INVOICE",
      client: "John",
      amount: 15000,
      memo: "Services",
      language: "yoruba",
    });
  });

  it("maps CHECK_BALANCE", () => {
    const parsed = llmPayloadToParsedIntent({
      intent: "CHECK_BALANCE",
      account_type: "primary",
    });

    expect(parsed).toEqual({
      intent_type: "CHECK_BALANCE",
      account_type: "primary",
    });
  });

  it("maps RUN_NEGOTIATION", () => {
    const parsed = llmPayloadToParsedIntent({
      intent: "RUN_NEGOTIATION",
      counterparty: "Alao",
      requested_amount: 50000,
    });

    expect(parsed).toEqual({
      intent_type: "RUN_NEGOTIATION",
      counterparty: "Alao",
      requested_amount: 50000,
    });
  });
});
