import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTransaction,
  getBalance,
  type TransactionRow,
} from "@/lib/db/ledger";

function buildMockClient(handlers: {
  insert?: () => { data: Record<string, unknown>; error: null | { message: string } };
  select?: () => { data: Array<{ amount: number }>; error: null | { message: string } };
}) {
  const insertChain = {
    select: () => ({
      single: async () => handlers.insert?.() ?? { data: null, error: { message: "no insert mock" } },
    }),
  };

  const selectChain = {
    eq: function (this: unknown) {
      return this;
    },
    then(resolve: (value: unknown) => void) {
      resolve(handlers.select?.() ?? { data: [], error: null });
    },
  };

  // Make eq chainable and awaitable
  const eqChain = {
    eq() {
      return eqChain;
    },
    async then(
      resolve: (value: { data: Array<{ amount: number }>; error: null }) => void
    ) {
      const result = handlers.select?.() ?? { data: [], error: null };
      if (result.error) {
        throw new Error(result.error.message);
      }
      resolve({ data: result.data, error: null });
    },
  };

  return {
    from: (table: string) => {
      if (table !== "transactions") {
        throw new Error(`Unexpected table: ${table}`);
      }
      return {
        insert: () => insertChain,
        select: () => eqChain,
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: "not mocked" } }),
            }),
          }),
        }),
      };
    },
  };
}

describe("createTransaction", () => {
  it("persists a pending transaction on happy path", async () => {
    const row: Record<string, unknown> = {
      id: "tx-1",
      merchant_id: "merchant_a",
      intent_type: "CREATE_INVOICE",
      amount: 15000000,
      currency: "NGN",
      status: "pending",
      reference: null,
      metadata: { client: "Cafe One" },
      created_at: "2026-06-03T00:00:00.000Z",
      updated_at: "2026-06-03T00:00:00.000Z",
    };

    const client = buildMockClient({
      insert: () => ({ data: row, error: null }),
    });

    const result = await createTransaction(
      {
        merchant_id: "merchant_a",
        intent_type: "CREATE_INVOICE",
        amount: 15000000,
        metadata: { client: "Cafe One" },
      },
      client
    );

    expect(result.id).toBe("tx-1");
    expect(result.status).toBe("pending");
    expect(result.amount).toBe(15000000);
  });
});

describe("getBalance", () => {
  it("aggregates settled amounts in kobo and NGN", async () => {
    const client = buildMockClient({
      select: () => ({
        data: [{ amount: 5000000 }, { amount: 2500000 }],
        error: null,
      }),
    });

    const balance = await getBalance("merchant_a", "NGN", client);

    expect(balance.kobo).toBe(7500000);
    expect(balance.ngn).toBe(75000);
    expect(balance.currency).toBe("NGN");
  });

  it("returns zero balance when no settled rows exist", async () => {
    const client = buildMockClient({
      select: () => ({ data: [], error: null }),
    });

    const balance = await getBalance("merchant_a", "NGN", client);

    expect(balance.kobo).toBe(0);
    expect(balance.ngn).toBe(0);
  });
});
