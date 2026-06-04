import { describe, expect, it } from "vitest";
import {
  getSupabaseServerClient,
  resetSupabaseServerClientForTests,
} from "@/lib/supabase/server";

describe("getSupabaseServerClient", () => {
  it("throws when required env vars are missing", () => {
    resetSupabaseServerClientForTests();
    const originalUrl = process.env.SUPABASE_URL;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseServerClient()).toThrow(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );

    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    resetSupabaseServerClientForTests();
  });
});
