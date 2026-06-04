// ==========================================
// In-memory token-bucket rate limiter (demo).
// Replace store with Upstash Redis for production scale.
// ==========================================

import { RateLimitError } from "@/lib/api/errors";

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();

const LIMITS = {
  public: { capacity: 30, refillPerSec: 0.5, windowLabel: "30/min per key" },
  webhook: { capacity: 120, refillPerSec: 2, windowLabel: "120/min per ip" },
  health: { capacity: 120, refillPerSec: 2, windowLabel: "120/min per ip" },
} as const;

export type RateLimitTier = keyof typeof LIMITS;

function takeToken(key: string, tier: RateLimitTier): boolean {
  const config = LIMITS[tier];
  const now = Date.now();
  const bucket = buckets.get(key) ?? {
    tokens: config.capacity,
    lastRefill: now,
  };

  const elapsedSec = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(
    config.capacity,
    bucket.tokens + elapsedSec * config.refillPerSec
  );
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

export function assertRateLimit(input: {
  tier: RateLimitTier;
  ip: string;
  merchantId?: string;
}): void {
  const ipKey = `${input.tier}:ip:${input.ip}`;
  if (!takeToken(ipKey, input.tier)) {
    throw new RateLimitError(60);
  }

  if (input.merchantId && input.tier === "public") {
    const merchantKey = `${input.tier}:merchant:${input.merchantId}`;
    if (!takeToken(merchantKey, input.tier)) {
      throw new RateLimitError(60);
    }
  }
}

/** Test helper */
export function clearRateLimitStoreForTests(): void {
  buckets.clear();
}
