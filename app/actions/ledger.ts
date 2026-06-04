"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/db/ledger";
import { getDefaultMerchantId } from "@/lib/server/merchant";
import type { LedgerEntry } from "@/types";

export async function fetchLedgerData() {
  const merchantId = getDefaultMerchantId();
  const supabase = getSupabaseServerClient();

  // Fetch the actual balance using Demilade's logic
  const balanceResult = await getBalance(merchantId);

  // Fetch the latest 10 transactions directly
  const { data: rows, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }

  // Map the Supabase rows to our Frontend LedgerEntry type
  const entries: LedgerEntry[] = (rows || []).map((row) => {
    let type: "CREDIT" | "DEBIT" = "CREDIT";
    if (row.intent_type === "RUN_NEGOTIATION") {
      type = "DEBIT";
    }

    // Determine status
    let status: LedgerEntry["status"] = "PENDING";
    if (row.status === "settled") status = "SUCCESS";
    if (row.status === "failed") status = "FAILED";

    // Extract a nice reference
    const meta = row.metadata as Record<string, any>;
    const refText = row.reference || meta?.memo || meta?.client || row.intent_type;

    return {
      id: String(row.id),
      merchant_id: String(row.merchant_id),
      transaction_type: type,
      amount: Number(row.amount) / 100, // convert kobo to NGN
      reference: refText,
      status,
      created_at: String(row.created_at),
    };
  });

  return {
    balance: balanceResult.ngn,
    entries,
  };
}
