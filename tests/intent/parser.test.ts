import { describe, expect, it } from "vitest";
import { keywordIntentParser } from "@/lib/intent/parser";

describe("keywordIntentParser", () => {
  it("routes invoice keywords to CREATE_INVOICE", async () => {
    const result = await keywordIntentParser(
      "Invoice Cafe One ₦150000 for coffee supplies"
    );

    expect(result.intent_type).toBe("CREATE_INVOICE");
    expect(result.client).toBe("Cafe One");
    expect(result.amount).toBe(150000);
  });

  it("routes balance keywords to CHECK_BALANCE", async () => {
    const result = await keywordIntentParser(
      "Check my business savings balance"
    );

    expect(result.intent_type).toBe("CHECK_BALANCE");
    expect(result.account_type).toBe("high_yield_sub_account");
  });

  it("routes negotiate keywords to RUN_NEGOTIATION", async () => {
    const result = await keywordIntentParser(
      "Negotiate with supplier Alao for ₦50000"
    );

    expect(result.intent_type).toBe("RUN_NEGOTIATION");
    expect(result.counterparty).toBe("supplier Alao");
    expect(result.requested_amount).toBe(50000);
  });
});
