import { describe, expect, it } from "vitest";
import { invoiceEmailFromClient } from "@/lib/paystack/reference";

describe("invoiceEmailFromClient", () => {
  it("uses a Paystack-acceptable domain (not .local)", () => {
    const email = invoiceEmailFromClient("Cafe One");
    expect(email).toBe("cafe-one@checkout.v2vprotocol.com");
    expect(email).not.toContain(".local");
  });

  it("falls back to customer when client is empty", () => {
    expect(invoiceEmailFromClient("   ")).toBe(
      "customer@checkout.v2vprotocol.com"
    );
  });
});
