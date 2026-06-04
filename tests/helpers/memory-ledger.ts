import type {
  TransactionRow,
  TransactionStatus,
  CreateTransactionInput,
} from "@/lib/db/ledger";

const transactions: TransactionRow[] = [];

function now() {
  return new Date().toISOString();
}

export function resetMemoryLedger(): void {
  transactions.length = 0;
}

export function getMemoryTransactions(): TransactionRow[] {
  return [...transactions];
}

export async function memoryCreateTransaction(
  input: CreateTransactionInput
): Promise<TransactionRow> {
  const row: TransactionRow = {
    id: `tx-${transactions.length + 1}`,
    merchant_id: input.merchant_id,
    intent_type: input.intent_type,
    amount: input.amount,
    currency: input.currency ?? "NGN",
    status: "pending",
    reference: input.reference ?? null,
    metadata: input.metadata ?? {},
    created_at: now(),
    updated_at: now(),
  };
  transactions.push(row);
  return row;
}

export async function memoryGetBalance(merchantId: string) {
  const kobo = transactions
    .filter(
      (t) =>
        t.merchant_id === merchantId &&
        t.status === "settled" &&
        t.currency === "NGN"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return { kobo, ngn: kobo / 100, currency: "NGN" };
}

export async function memoryGetTransactionByReference(reference: string) {
  return transactions.find((t) => t.reference === reference) ?? null;
}

export async function memorySettleTransactionFromWebhook(
  reference: string,
  eventId: string
) {
  const tx = transactions.find((t) => t.reference === reference);
  if (!tx) return "not_found" as const;

  const processed = (tx.metadata.processed_event_ids as string[]) ?? [];
  if (processed.includes(eventId)) return "duplicate_event" as const;
  if (tx.status === "settled") return "already_settled" as const;

  tx.status = "settled";
  tx.metadata = { ...tx.metadata, processed_event_ids: [...processed, eventId] };
  tx.updated_at = now();
  return "settled" as const;
}

export async function memoryFailTransactionFromWebhook(
  reference: string,
  eventId: string
) {
  const tx = transactions.find((t) => t.reference === reference);
  if (!tx) return "not_found" as const;
  if (tx.status === "settled") return "already_settled" as const;

  tx.status = "failed";
  tx.updated_at = now();
  return "failed" as const;
}

export async function memoryUpdateTransactionStatusByReference(
  reference: string,
  status: TransactionStatus
) {
  const tx = transactions.find((t) => t.reference === reference);
  if (!tx) throw new Error("not found");
  tx.status = status;
  tx.updated_at = now();
  return tx;
}
