// ==========================================
// Negotiation session persistence
// ==========================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NegotiationSessionState, NegotiationTurn } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type NegotiationStatus = "open" | "agreed" | "failed";

type SupabaseLike = Pick<SupabaseClient, "from">;

function resolveClient(client?: SupabaseLike): SupabaseLike {
  return client ?? getSupabaseServerClient();
}

function mapSession(row: Record<string, unknown>): NegotiationSessionState {
  return {
    id: String(row.id),
    merchant_id: String(row.merchant_id),
    status: row.status as NegotiationStatus,
    context: row.context as NegotiationSessionState["context"],
    turns: (row.turns as NegotiationTurn[]) ?? [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function createNegotiationSession(
  merchantId: string,
  context: NegotiationSessionState["context"],
  client?: SupabaseLike
): Promise<NegotiationSessionState> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("negotiation_sessions")
    .insert({
      merchant_id: merchantId,
      status: "open",
      context,
      turns: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`createNegotiationSession failed: ${error.message}`);
  }

  return mapSession(data as Record<string, unknown>);
}

export async function getOpenNegotiationSession(
  merchantId: string,
  counterparty: string,
  client?: SupabaseLike
): Promise<NegotiationSessionState | null> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("negotiation_sessions")
    .select()
    .eq("merchant_id", merchantId)
    .eq("status", "open");

  if (error) {
    throw new Error(`getOpenNegotiationSession failed: ${error.message}`);
  }

  const match = (data ?? []).find((row) => {
    const session = mapSession(row as Record<string, unknown>);
    return session.context.counterparty === counterparty;
  });

  return match ? mapSession(match as Record<string, unknown>) : null;
}

export async function saveNegotiationSession(
  session: NegotiationSessionState,
  client?: SupabaseLike
): Promise<NegotiationSessionState> {
  const supabase = resolveClient(client);

  const { data, error } = await supabase
    .from("negotiation_sessions")
    .update({
      status: session.status,
      context: session.context,
      turns: session.turns,
    })
    .eq("id", session.id)
    .select()
    .single();

  if (error) {
    throw new Error(`saveNegotiationSession failed: ${error.message}`);
  }

  return mapSession(data as Record<string, unknown>);
}
