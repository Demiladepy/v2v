import { beforeEach, describe, expect, it, vi } from "vitest";
import { dispatchIntent } from "@/lib/intent/dispatch";

vi.mock("@/lib/server/financial-router", () => ({
  routeFinancialIntent: vi.fn().mockResolvedValue({
    accepted: true,
    intent: "CREATE_INVOICE",
    message: "Invoice ready.",
    authorization_url: "https://checkout.paystack.com/test",
    reference: "v2v_ref_test",
  }),
}));

vi.mock("@/lib/db/ledger", () => ({
  getBalance: vi.fn().mockResolvedValue({
    kobo: 2500000,
    ngn: 25000,
    currency: "NGN",
  }),
}));

const sessionState = {
  id: "session-1",
  merchant_id: "default_merchant",
  status: "open" as const,
  context: {
    counterparty: "Alao",
    target_amount: 50000,
    last_offer: 40000,
  },
  turns: [
    {
      role: "user" as const,
      text: "Negotiate with Alao for 30000",
      proposed_amount: 30000,
      at: "2026-06-03T00:00:00.000Z",
    },
    {
      role: "agent" as const,
      text: "Counter offer: ₦40,000.",
      proposed_amount: 40000,
      at: "2026-06-03T00:00:01.000Z",
    },
  ],
  created_at: "2026-06-03T00:00:00.000Z",
  updated_at: "2026-06-03T00:00:01.000Z",
};

vi.mock("@/lib/db/negotiations", () => ({
  getOpenNegotiationSession: vi.fn().mockResolvedValue(null),
  createNegotiationSession: vi.fn().mockImplementation(async (_merchantId, context) => ({
    id: "session-1",
    merchant_id: "default_merchant",
    status: "open",
    context,
    turns: [],
    created_at: "2026-06-03T00:00:00.000Z",
    updated_at: "2026-06-03T00:00:00.000Z",
  })),
  saveNegotiationSession: vi.fn().mockImplementation(async () => sessionState),
}));

import { routeFinancialIntent } from "@/lib/server/financial-router";
import { getBalance } from "@/lib/db/ledger";
import {
  createNegotiationSession,
  saveNegotiationSession,
} from "@/lib/db/negotiations";

describe("dispatchIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the invoice flow for CREATE_INVOICE", async () => {
    const result = await dispatchIntent(
      {
        intent_type: "CREATE_INVOICE",
        client: "Cafe One",
        amount: 150000,
        memo: "Coffee supplies",
      },
      "default_merchant",
      "Invoice Cafe One"
    );

    expect(routeFinancialIntent).toHaveBeenCalledOnce();
    expect(result.intent_type).toBe("CREATE_INVOICE");
    if (result.intent_type === "CREATE_INVOICE") {
      expect(result.authorization_url).toBe("https://checkout.paystack.com/test");
    }
  });

  it("forwards invoice language to routeFinancialIntent", async () => {
    await dispatchIntent(
      {
        intent_type: "CREATE_INVOICE",
        client: "John",
        amount: 15000,
        memo: "Design work",
        language: "pidgin",
      },
      "default_merchant",
      "Invoice John"
    );

    expect(routeFinancialIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: "CREATE_INVOICE",
        language: "pidgin",
      }),
      "default_merchant",
      expect.any(Object)
    );
  });

  it("calls getBalance for CHECK_BALANCE", async () => {
    const result = await dispatchIntent(
      {
        intent_type: "CHECK_BALANCE",
        account_type: "primary",
      },
      "default_merchant",
      "Check balance"
    );

    expect(getBalance).toHaveBeenCalledOnce();
    expect(result.intent_type).toBe("CHECK_BALANCE");
    if (result.intent_type === "CHECK_BALANCE") {
      expect(result.balance.ngn).toBe(25000);
    }
  });

  it("persists a negotiation turn and returns session state", async () => {
    const result = await dispatchIntent(
      {
        intent_type: "RUN_NEGOTIATION",
        counterparty: "Alao",
        requested_amount: 30000,
      },
      "default_merchant",
      "Negotiate with Alao for 30000"
    );

    expect(createNegotiationSession).toHaveBeenCalledOnce();
    expect(saveNegotiationSession).toHaveBeenCalledOnce();
    expect(result.intent_type).toBe("RUN_NEGOTIATION");
    if (result.intent_type === "RUN_NEGOTIATION") {
      expect(result.session.turns.length).toBeGreaterThan(0);
      expect(result.reply).toContain("Counter offer");
    }
  });
});
