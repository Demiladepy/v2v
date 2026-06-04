import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/voice/process/route";

vi.mock("@/lib/intent/parser", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/intent/parser")>();
  return {
    ...actual,
    parseTranscript: vi.fn(),
  };
});

vi.mock("@/lib/intent/dispatch", () => ({
  dispatchIntent: vi.fn(),
}));

import { parseTranscript } from "@/lib/intent/parser";
import { dispatchIntent } from "@/lib/intent/dispatch";

describe("POST /api/voice/process", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the standard envelope for a valid transcript", async () => {
    vi.mocked(parseTranscript).mockResolvedValue({
      intent_type: "CHECK_BALANCE",
      account_type: "primary",
    });
    vi.mocked(dispatchIntent).mockResolvedValue({
      intent_type: "CHECK_BALANCE",
      message: "Balance for primary: ₦25,000 (2500000 kobo settled).",
      balance: { kobo: 2500000, ngn: 25000, currency: "NGN" },
    });

    const response = await POST(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "Check my business balance",
        }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.intent_type).toBe("CHECK_BALANCE");
  });

  it("returns 400 for an empty transcript", async () => {
    const response = await POST(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: "   " }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(parseTranscript).not.toHaveBeenCalled();
  });

  it("returns 422 when the parser cannot resolve an intent", async () => {
    vi.mocked(parseTranscript).mockRejectedValue({
      code: "UNRECOGNIZED_INTENT",
      message: "No matching intent found in transcript",
    });

    const response = await POST(
      new Request("http://localhost/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: "Hello there" }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(dispatchIntent).not.toHaveBeenCalled();
  });
});
