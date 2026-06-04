import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns 200 OK with healthy status and request id", async () => {
    const response = await GET(
      new Request("http://localhost/api/health", {
        headers: { "x-request-id": "test-req-123" },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("test-req-123");
    expect(body).toEqual({
      ok: true,
      data: { status: "healthy", service: "v2v-api" },
    });
  });
});
