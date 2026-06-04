import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/webhooks/paystack/route";

vi.mock("@/lib/db/ledger", () => ({
  getTransactionByReference: vi.fn(),
  settleTransactionFromWebhook: vi.fn(),
  failTransactionFromWebhook: vi.fn(),
}));

import {
  getTransactionByReference,
  settleTransactionFromWebhook,
} from "@/lib/db/ledger";

const SECRET = "sk_test_webhook_secret";

function signBody(rawBody: string, secret = SECRET): string {
  return createHmac("sha512", secret).update(rawBody).digest("hex");
}

function buildChargeSuccessEvent(reference = "v2v_ref_123", amount = 15000000) {
  return {
    event: "charge.success",
    data: {
      id: 998877,
      reference,
      amount,
      status: "success",
    },
  };
}

describe("POST /api/webhooks/paystack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = SECRET;
  });

  it("settles a transaction when the signature is valid", async () => {
    const event = buildChargeSuccessEvent();
    const rawBody = JSON.stringify(event);

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
    vi.mocked(settleTransactionFromWebhook).mockResolvedValue("settled");

    const response = await POST(
      new Request("http://localhost/api/webhooks/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signBody(rawBody),
        },
        body: rawBody,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(settleTransactionFromWebhook).toHaveBeenCalledOnce();
    expect(settleTransactionFromWebhook).toHaveBeenCalledWith(
      "v2v_ref_123",
      "998877"
    );
  });

  it("returns 401 and does not settle when the signature is invalid", async () => {
    const rawBody = JSON.stringify(buildChargeSuccessEvent());

    const response = await POST(
      new Request("http://localhost/api/webhooks/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": "tampered_signature",
        },
        body: rawBody,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(settleTransactionFromWebhook).not.toHaveBeenCalled();
    expect(getTransactionByReference).not.toHaveBeenCalled();
  });

  it("does not double-settle when the same event is replayed", async () => {
    const event = buildChargeSuccessEvent();
    const rawBody = JSON.stringify(event);

    vi.mocked(getTransactionByReference).mockResolvedValue({
      id: "tx-1",
      merchant_id: "default_merchant",
      intent_type: "CREATE_INVOICE",
      amount: 15000000,
      currency: "NGN",
      status: "settled",
      reference: "v2v_ref_123",
      metadata: { processed_event_ids: ["998877"] },
      created_at: "2026-06-03T00:00:00.000Z",
      updated_at: "2026-06-03T00:00:00.000Z",
    });
    vi.mocked(settleTransactionFromWebhook).mockResolvedValue("duplicate_event");

    const response = await POST(
      new Request("http://localhost/api/webhooks/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signBody(rawBody),
        },
        body: rawBody,
      })
    );

    expect(response.status).toBe(200);
    expect(settleTransactionFromWebhook).toHaveBeenCalledOnce();
  });
});
