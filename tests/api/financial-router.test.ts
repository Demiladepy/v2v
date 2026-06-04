import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/financial/router/route";
import { routeFinancialIntent } from "@/lib/server/financial-router";

vi.mock("@/lib/db/ledger", () => ({
  createTransaction: vi.fn().mockResolvedValue({
    id: "tx-mock",
    merchant_id: "default_merchant",
    intent_type: "CREATE_INVOICE",
    amount: 15000000,
    currency: "NGN",
    status: "pending",
    reference: "v2v_mock_ref",
    metadata: {},
    created_at: "2026-06-03T00:00:00.000Z",
    updated_at: "2026-06-03T00:00:00.000Z",
  }),
  getBalance: vi.fn().mockResolvedValue({
    kobo: 15000000,
    ngn: 150000,
    currency: "NGN",
  }),
  updateTransactionStatusByReference: vi.fn(),
}));

vi.mock("@/lib/paystack/client", () => ({
  initializeTransaction: vi.fn().mockResolvedValue({
    authorization_url: "https://checkout.paystack.com/test",
    reference: "v2v_mock_ref",
  }),
}));

import { createTransaction, getBalance } from "@/lib/db/ledger";
import { initializeTransaction } from "@/lib/paystack/client";

describe("routeFinancialIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queues CREATE_INVOICE intents", async () => {
    const result = await routeFinancialIntent({
      intent: "CREATE_INVOICE",
      client: "Cafe One",
      amount: 150000,
      memo: "Coffee supplies",
    });

    expect(result.accepted).toBe(true);
    expect(result.intent).toBe("CREATE_INVOICE");
    expect(createTransaction).toHaveBeenCalledOnce();
    expect(initializeTransaction).toHaveBeenCalledOnce();
    expect(result.authorization_url).toBe("https://checkout.paystack.com/test");
    expect(result.reference).toBe("v2v_mock_ref");
  });

  it("reads real balance for CHECK_BALANCE intents", async () => {
    const result = await routeFinancialIntent({
      intent: "CHECK_BALANCE",
      account_type: "high_yield_sub_account",
    });

    expect(result.accepted).toBe(true);
    expect(result.intent).toBe("CHECK_BALANCE");
    expect(getBalance).toHaveBeenCalledOnce();
    expect(result.message).toContain("150,000");
    expect(result.message).toContain("15000000 kobo settled");
  });
});

describe("POST /api/financial/router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 Created for valid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CHECK_BALANCE",
          account_type: "high_yield_sub_account",
        }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.intent).toBe("CHECK_BALANCE");
  });

  it("returns 400 Bad Request for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "not-json",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("returns 400 Bad Request for malformed payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "CREATE_INVOICE", amount: "nope" }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Validation failed");
  });
});
