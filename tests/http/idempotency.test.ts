import { beforeEach, describe, expect, it } from "vitest";
import {
  clearIdempotencyStoreForTests,
  withIdempotency,
} from "@/lib/http/idempotency";

describe("withIdempotency", () => {
  beforeEach(() => {
    clearIdempotencyStoreForTests();
  });

  it("replays cached result without executing twice", async () => {
    let runs = 0;

    const first = await withIdempotency("key-1", async () => {
      runs += 1;
      return { status: 201, body: { reference: "v2v_abc" } };
    });

    const second = await withIdempotency("key-1", async () => {
      runs += 1;
      return { status: 201, body: { reference: "v2v_should_not_run" } };
    });

    expect(runs).toBe(1);
    expect(first.body.reference).toBe("v2v_abc");
    expect(second.body.reference).toBe("v2v_abc");
    expect(second.replayed).toBe(true);
  });
});
