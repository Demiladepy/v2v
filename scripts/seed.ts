/**
 * Idempotent demo seed — safe to re-run.
 * Usage: npx tsx --env-file=.env.local scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const DEMO_MERCHANT_ID = process.env.DEFAULT_MERCHANT_ID?.trim() || "demo_merchant";

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const seeds = [
    {
      merchant_id: DEMO_MERCHANT_ID,
      intent_type: "CREATE_INVOICE",
      amount: 7500000,
      currency: "NGN",
      status: "settled",
      reference: "v2v_seed_settled_75k",
      metadata: { client: "Cafe One", memo: "Seeded settled sale" },
    },
    {
      merchant_id: DEMO_MERCHANT_ID,
      intent_type: "CREATE_INVOICE",
      amount: 2500000,
      currency: "NGN",
      status: "pending",
      reference: "v2v_seed_pending_25k",
      metadata: { client: "Supplier Alao", memo: "Seeded pending invoice" },
    },
  ];

  for (const row of seeds) {
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", row.reference)
      .maybeSingle();

    if (existing) {
      console.log(`skip (exists): ${row.reference}`);
      continue;
    }

    const { error } = await supabase.from("transactions").insert(row);

    if (error) {
      console.error(`failed ${row.reference}:`, error.message);
      process.exit(1);
    }

    console.log(`inserted: ${row.reference} (${row.status})`);
  }

  console.log(`seed complete for merchant_id=${DEMO_MERCHANT_ID}`);
}

main();
