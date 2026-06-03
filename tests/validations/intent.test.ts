import { describe, expect, it } from "vitest";
import { parseLLMResponsePayload } from "@/lib/validations/intent";

describe("parseLLMResponsePayload", () => {
  it("accepts CREATE_INVOICE payloads", () => {
    const result = parseLLMResponsePayload({
      intent: "CREATE_INVOICE",
      client: "Cafe One",
      amount: 150000,
      memo: "Coffee supplies",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intent).toBe("CREATE_INVOICE");
    }
  });

  it("rejects payloads with missing fields", () => {
    const result = parseLLMResponsePayload({
      intent: "CREATE_INVOICE",
      client: "",
      amount: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejects unknown intent strings", () => {
    const result = parseLLMResponsePayload({
      intent: "SEND_MONEY",
      amount: 100,
    });

    expect(result.success).toBe(false);
  });
});
