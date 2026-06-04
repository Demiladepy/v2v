// ==========================================
// In-memory idempotency (demo). Swap store for Redis/Upstash later.
// ==========================================

type StoredResult<T> = {
  status: number;
  body: T;
  createdAt: number;
};

const store = new Map<string, StoredResult<unknown>>();
const TTL_MS = 24 * 60 * 60 * 1000;

function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) {
      store.delete(key);
    }
  }
}

export function buildIdempotencyKey(
  scope: string,
  parts: Record<string, string | number>
): string {
  const serialized = Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return `${scope}:${serialized}`;
}

export function resolveIdempotencyKey(
  headerValue: string | null,
  fallbackKey: string
): string {
  const trimmed = headerValue?.trim();
  return trimmed ? `header:${trimmed}` : fallbackKey;
}

export async function withIdempotency<T>(
  key: string,
  execute: () => Promise<{ status: number; body: T }>
): Promise<{ status: number; body: T; replayed: boolean }> {
  pruneExpired();

  const existing = store.get(key) as StoredResult<T> | undefined;
  if (existing) {
    return { status: existing.status, body: existing.body, replayed: true };
  }

  const result = await execute();
  store.set(key, { ...result, createdAt: Date.now() });
  return { ...result, replayed: false };
}

/** Test helper */
export function clearIdempotencyStoreForTests(): void {
  store.clear();
}
