// ==========================================
// Server-only Supabase client (service role)
// Never import this module from client components.
// ==========================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "Supabase server client must not be imported in client bundles."
    );
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  assertServerOnly();

  if (cachedClient) {
    return cachedClient;
  }

  const url =
    process.env.SUPABASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

/** Test helper — reset cached singleton between Vitest cases. */
export function resetSupabaseServerClientForTests(): void {
  cachedClient = null;
}
