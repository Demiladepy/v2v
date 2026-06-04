import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearIdempotencyStoreForTests } from "@/lib/http/idempotency";
import { clearRateLimitStoreForTests } from "@/lib/http/rate-limit";

vi.mock("@/lib/db/ledger", async () => {
  const mem = await import("../helpers/memory-ledger");
  return {
    createTransaction: mem.memoryCreateTransaction,
    getBalance: mem.memoryGetBalance,
    getTransactionByReference: mem.memoryGetTransactionByReference,
    settleTransactionFromWebhook: mem.memorySettleTransactionFromWebhook,
    failTransactionFromWebhook: mem.memoryFailTransactionFromWebhook,
    updateTransactionStatusByReference: mem.memoryUpdateTransactionStatusByReference,
  };
});

import {
  resetMemoryLedger,
  getMemoryTransactions,
} from "../helpers/memory-ledger";

vi.mock("@/lib/db/negotiations", () => ({
  getOpenNegotiationSession: vi.fn().mockResolvedValue(null),
  createNegotiationSession: vi.fn(),
  saveNegotiationSession: vi.fn(),
}));

vi.mock("@/lib/paystack/client", () => ({
  initializeTransaction: vi.fn().mockImplementation(async ({ reference }) => ({
    authorization_url: `https://checkout.paystack.com/${reference}`,
    reference,
  })),
}));

process.env.PAYSTACK_SECRET_KEY = "sk_test_demo_integration";

import { POST as voiceProcess } from "@/app/api/voice/process/route";
import { POST as paystackWebhook } from "@/app/api/webhooks/paystack/route";

function signPaystackBody(rawBody: string): string {
  return createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");
}

describe("integration: demo happy path", () => {
  beforeEach(() => {
    resetMemoryLedger();
    clearIdempotencyStoreForTests();
    clearRateLimitStoreForTests();
    vi.clearAllMocks();
  });

  it("voice invoice -> pending tx + checkout -> webhook settle -> balance", async () => {
    const invoiceRes = await voiceProcess(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "demo-invoice-1",
          "x-forwarded-for": "10.0.0.1",
        },
        body: JSON.stringify({
          transcript: "Invoice Cafe One ₦150000 for coffee supplies",
          merchant_id: "demo_merchant",
        }),
      })
    );
    const invoiceBody = await invoiceRes.json();

    expect(invoiceRes.status).toBe(200);
    expect(invoiceRes.headers.get("x-request-id")).toBeTruthy();
    expect(invoiceBody.ok).toBe(true);
    expect(invoiceBody.data.intent_type).toBe("CREATE_INVOICE");
    expect(invoiceBody.data.authorization_url).toContain("checkout.paystack.com");
    expect(invoiceBody.data.reference).toMatch(/^v2v_/);

    const reference = invoiceBody.data.reference as string;
    const pending = getMemoryTransactions().find((t) => t.reference === reference);
    expect(pending?.status).toBe("pending");
    expect(pending?.amount).toBe(15000000);

    const webhookEvent = {
      event: "charge.success",
      data: {
        id: 424242,
        reference,
        amount: 15000000,
        status: "success",
      },
    };
    const rawBody = JSON.stringify(webhookEvent);

    const webhookRes = await paystackWebhook(
      new Request("http://localhost/api/webhooks/paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": signPaystackBody(rawBody),
        },
        body: rawBody,
      })
    );

    expect(webhookRes.status).toBe(200);
    expect((await webhookRes.json()).ok).toBe(true);

    const settled = getMemoryTransactions().find((t) => t.reference === reference);
    expect(settled?.status).toBe("settled");

    const balanceRes = await voiceProcess(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.2",
        },
        body: JSON.stringify({
          transcript: "Check my business balance",
          merchant_id: "demo_merchant",
        }),
      })
    );
    const balanceBody = await balanceRes.json();

    expect(balanceRes.status).toBe(200);
    expect(balanceBody.data.intent_type).toBe("CHECK_BALANCE");
    expect(balanceBody.data.balance.kobo).toBe(15000000);
    expect(balanceBody.data.balance.ngn).toBe(150000);
  });

  it("idempotent invoice replay does not duplicate transactions", async () => {
    const body = JSON.stringify({
      transcript: "Invoice Cafe One ₦150000 for coffee supplies",
      merchant_id: "demo_merchant",
    });
    const headers = {
      "Content-Type": "application/json",
      "Idempotency-Key": "demo-invoice-dup",
      "x-forwarded-for": "10.0.0.3",
    };

    await voiceProcess(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers,
        body,
      })
    );
    await voiceProcess(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers,
        body,
      })
    );

    const invoiceTxs = getMemoryTransactions().filter(
      (t) => t.intent_type === "CREATE_INVOICE"
    );
    expect(invoiceTxs).toHaveLength(1);
  });
});
