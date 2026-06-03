import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/financial/router/route";
import { routeFinancialIntent } from "@/lib/server/financial-router";

describe("routeFinancialIntent", () => {
  it("queues CREATE_INVOICE intents", () => {
    const result = routeFinancialIntent({
      intent: "CREATE_INVOICE",
      client: "Cafe One",
      amount: 150000,
      memo: "Coffee supplies",
    });

    expect(result.accepted).toBe(true);
    expect(result.intent).toBe("CREATE_INVOICE");
  });
});

describe("POST /api/financial/router", () => {
  it("returns 201 Created for valid payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CHECK_BALANCE",
          account_type: "high_yield_sub_account",
        }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.intent).toBe("CHECK_BALANCE");
  });

  it("returns 400 Bad Request for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "not-json",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("returns 400 Bad Request for malformed payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/financial/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "CREATE_INVOICE", amount: "nope" }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Validation failed");
  });
});
