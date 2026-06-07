import { describe, expect, it, afterEach } from "vitest";
import { getAethexApiKey } from "@/lib/env/aethex-key";

describe("getAethexApiKey", () => {
  const original = {
    AETHEX_API: process.env.AETHEX_API,
    AETHEX_API_KEY: process.env.AETHEX_API_KEY,
    AETHANA_API_KEY: process.env.AETHANA_API_KEY,
  };

  afterEach(() => {
    process.env.AETHEX_API = original.AETHEX_API;
    process.env.AETHEX_API_KEY = original.AETHEX_API_KEY;
    process.env.AETHANA_API_KEY = original.AETHANA_API_KEY;
  });

  it("reads AETHEX_API first", () => {
    process.env.AETHEX_API = "aethex-from-vercel";
    delete process.env.AETHEX_API_KEY;
    delete process.env.AETHANA_API_KEY;

    expect(getAethexApiKey()).toBe("aethex-from-vercel");
  });

  it("falls back to legacy AETHANA_API_KEY", () => {
    delete process.env.AETHEX_API;
    delete process.env.AETHEX_API_KEY;
    process.env.AETHANA_API_KEY = "legacy-key";

    expect(getAethexApiKey()).toBe("legacy-key");
  });
});
