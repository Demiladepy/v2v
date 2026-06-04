import { beforeEach, describe, expect, it, vi } from "vitest";
import { processPaystackWebhookEvent } from "@/lib/paystack/process-event";

vi.mock("@/lib/db/ledger", () => ({
  getTransactionByReference: vi.fn(),
  settleTransactionFromWebhook: vi.fn(),
  failTransactionFromWebhook: vi.fn(),
}));

import {
  getTransactionByReference,
  settleTransactionFromWebhook,
} from "@/lib/db/ledger";

describe("processPaystackWebhookEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects settlement when verified amount does not match stored kobo", async () => {
    vi.mocked(getTransactionByReference).mockResolvedValue({
      id: "tx-1",
      merchant_id: "default_merchant",
      intent_type: "CREATE_INVOICE",
      amount: 15000000,
      currency: "NGN",
      status: "pending",
      reference: "v2v_ref_123",
      metadata: {},
      created_at: "2026-06-03T00:00:00.000Z",
      updated_at: "2026-06-03T00:00:00.000Z",
    });

    const result = await processPaystackWebhookEvent({
      event: "charge.success",
      data: {
        id: 1,
        reference: "v2v_ref_123",
        amount: 999,
        status: "success",
      },
    });

    expect(result.action).toBe("ignored_amount_mismatch");
    expect(settleTransactionFromWebhook).not.toHaveBeenCalled();
  });
});
