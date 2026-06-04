import { describe, expect, it } from "vitest";
import { stubNegotiationAgent } from "@/lib/negotiation/agent";
import type { NegotiationSessionState } from "@/types";

const baseSession: NegotiationSessionState = {
  id: "session-1",
  merchant_id: "default_merchant",
  status: "open",
  context: {
    counterparty: "Alao",
    target_amount: 50000,
  },
  turns: [],
  created_at: "2026-06-03T00:00:00.000Z",
  updated_at: "2026-06-03T00:00:00.000Z",
};

describe("stubNegotiationAgent", () => {
  it("agrees when the offer meets the target", async () => {
    const response = await stubNegotiationAgent(baseSession, {
      text: "We can pay 50000",
      offer_amount: 50000,
    });

    expect(response.status).toBe("agreed");
    expect(response.proposedTerms.amount).toBe(50000);
  });

  it("counters when the offer is below the target", async () => {
    const response = await stubNegotiationAgent(baseSession, {
      text: "We can pay 30000",
      offer_amount: 30000,
    });

    expect(response.status).toBe("open");
    expect(response.proposedTerms.amount).toBeGreaterThan(30000);
    expect(response.reply).toContain("Counter offer");
  });
});
