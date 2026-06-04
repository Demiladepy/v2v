// ==========================================
// Ledger repository (Supabase transactions table)
// Amounts are stored in kobo; balance sums settled rows only.
// ==========================================

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type TransactionIntentType =
  | "CREATE_INVOICE"
  | "CHECK_BALANCE"
  | "RUN_NEGOTIATION";

export type TransactionStatus = "pending" | "settled" | "failed";

export interface TransactionRow {
  id: string;
  merchant_id: string;
  intent_type: TransactionIntentType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  merchant_id: string;
  intent_type: TransactionIntentType;
  amount: number;
  currency?: string;
  reference?: string | null;
  metadata?: Record<string, unknown>;
}

export interface BalanceResult {
  kobo: number;
  ngn: number;
  currency: string;
}

type SupabaseLike = Pick<SupabaseClient, "from">;

function resolveClient(client?: SupabaseLike): SupabaseLike {
  return client ?? getSupabaseServerClient();
}

function mapRow(row: Record<string, unknown>): TransactionRow {
  return {
    id: String(row.id),
    merchant_id: String(row.merchant_id),
    intent_type: row.intent_type as TransactionIntentType,
    amount: Number(row.amount),
    currency: String(row.currency),
    status: row.status as TransactionStatus,
    reference: row.reference == null ? null : String(row.reference),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function createTransaction(
  input: CreateTransactionInput,
  client?: SupabaseLike
): Promise<TransactionRow> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      merchant_id: input.merchant_id,
      intent_type: input.intent_type,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      reference: input.reference ?? null,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`createTransaction failed: ${error.message}`);
  }

  return mapRow(data as Record<string, unknown>);
}

export async function updateTransactionStatusByReference(
  reference: string,
  status: TransactionStatus,
  client?: SupabaseLike
): Promise<TransactionRow> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("reference", reference)
    .select()
    .single();

  if (error) {
    throw new Error(
      `updateTransactionStatusByReference failed: ${error.message}`
    );
  }

  return mapRow(data as Record<string, unknown>);
}

export async function getTransactionByReference(
  reference: string,
  client?: SupabaseLike
): Promise<TransactionRow | null> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("transactions")
    .select()
    .eq("reference", reference)
    .maybeSingle();

  if (error) {
    throw new Error(`getTransactionByReference failed: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapRow(data as Record<string, unknown>);
}

function getProcessedEventIds(metadata: Record<string, unknown>): string[] {
  const ids = metadata.processed_event_ids;
  return Array.isArray(ids) ? ids.map(String) : [];
}

export type WebhookUpdateOutcome =
  | "settled"
  | "failed"
  | "already_settled"
  | "duplicate_event"
  | "not_found";

export async function settleTransactionFromWebhook(
  reference: string,
  eventId: string,
  client?: SupabaseLike
): Promise<WebhookUpdateOutcome> {
  const transaction = await getTransactionByReference(reference, client);

  if (!transaction) {
    return "not_found";
  }

  const processedIds = getProcessedEventIds(transaction.metadata);

  if (processedIds.includes(eventId)) {
    return "duplicate_event";
  }

  if (transaction.status === "settled") {
    return "already_settled";
  }

  const supabase = resolveClient(client);
  const { error } = await supabase
    .from("transactions")
    .update({
      status: "settled",
      metadata: {
        ...transaction.metadata,
        processed_event_ids: [...processedIds, eventId],
      },
    })
    .eq("reference", reference)
    .eq("status", "pending");

  if (error) {
    throw new Error(`settleTransactionFromWebhook failed: ${error.message}`);
  }

  return "settled";
}

export async function failTransactionFromWebhook(
  reference: string,
  eventId: string,
  client?: SupabaseLike
): Promise<WebhookUpdateOutcome> {
  const transaction = await getTransactionByReference(reference, client);

  if (!transaction) {
    return "not_found";
  }

  const processedIds = getProcessedEventIds(transaction.metadata);

  if (processedIds.includes(eventId)) {
    return "duplicate_event";
  }

  if (transaction.status === "settled") {
    return "already_settled";
  }

  if (transaction.status === "failed") {
    return "duplicate_event";
  }

  const supabase = resolveClient(client);
  const { error } = await supabase
    .from("transactions")
    .update({
      status: "failed",
      metadata: {
        ...transaction.metadata,
        processed_event_ids: [...processedIds, eventId],
      },
    })
    .eq("reference", reference)
    .in("status", ["pending", "failed"]);

  if (error) {
    throw new Error(`failTransactionFromWebhook failed: ${error.message}`);
  }

  return "failed";
}

export async function getBalance(
  merchantId: string,
  currency = "NGN",
  client?: SupabaseLike
): Promise<BalanceResult> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("merchant_id", merchantId)
    .eq("currency", currency)
    .eq("status", "settled");

  if (error) {
    throw new Error(`getBalance failed: ${error.message}`);
  }

  const kobo = (data ?? []).reduce(
    (sum, row) => sum + Number((row as { amount: number }).amount),
    0
  );

  return {
    kobo,
    ngn: kobo / 100,
    currency,
  };
}
