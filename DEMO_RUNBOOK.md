# V2V Demo Runbook

End-to-end demo for judges: voice → invoice → Paystack → settled balance.

## Prerequisites

1. Apply Supabase migrations `0001_transactions.sql` and `0002_negotiations.sql`.
2. Fill `.env.local` (see `.env.example`).
3. `npm run seed` (optional — preloads settled + pending rows for fallback).
4. `npm run dev` locally, or deploy to Vercel and run `npm run smoke -- https://your-app.vercel.app`.

Set Paystack webhook URL to:

```
{APP_BASE_URL}/api/webhooks/paystack
```

---

## Demo script (click-by-click)

### 1. Health check

```bash
curl -s http://localhost:3000/api/health
```

**Proves:** API is up. Response includes `x-request-id` header and `{ ok: true, data: { status: "healthy" } }`.

### 2. Voice → create invoice

```bash
curl -s -X POST http://localhost:3000/api/voice/process \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: demo-live-1" \
  -d "{\"transcript\":\"Invoice Cafe One ₦150000 for coffee supplies\",\"merchant_id\":\"demo_merchant\"}"
```

**Proves:**

- Keyword parser resolves `CREATE_INVOICE`.
- Pending transaction stored in Supabase (amount in kobo).
- Paystack initialize returns `authorization_url` + `reference`.

Open `authorization_url` in browser to show checkout (sandbox).

### 3. Simulate payment (Paystack test webhook)

In Paystack dashboard → Webhooks → send test `charge.success`, **or** curl with your secret:

```bash
# Replace REF from step 2 and sk_test_... from .env.local
curl -s -X POST http://localhost:3000/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: <hmac-sha512 of raw body>" \
  -d '{"event":"charge.success","data":{"id":1,"reference":"REF","amount":15000000,"status":"success"}}'
```

**Proves:** Signature verified on **raw body**; transaction `pending` → `settled`; idempotent replay returns 200 without double-settling.

### 4. Voice → check balance

```bash
curl -s -X POST http://localhost:3000/api/voice/process \
  -H "Content-Type: application/json" \
  -d "{\"transcript\":\"Check my business balance\",\"merchant_id\":\"demo_merchant\"}"
```

**Proves:** Settled ledger sum includes ₦150,000 (`15000000` kobo) plus any seeded rows.

---

## What each layer shows

| Step | Layer |
|------|-------|
| Voice endpoint | Parser stub + dispatcher + unified `ActionResult` envelope |
| Invoice | Paystack initialize + pending Supabase row |
| Webhook | HMAC verify + reference match + amount match |
| Balance | Real `getBalance` aggregation |

---

## 3-line fallback if Paystack sandbox is flaky

1. Run `npm run seed` — inserts `v2v_seed_settled_75k` (₦75,000 settled) for `demo_merchant`.
2. Skip checkout; run step 4 balance curl — shows non-zero balance from seeded data.
3. Say: *"Live Paystack is configured; we're showing ledger truth from settled rows while sandbox webhook retries."*

---

## Automated demo path (CI)

```bash
npm test
```

Integration test `tests/integration/demo-path.test.ts` runs the full flow with mocked Supabase + Paystack (no network).

---

## Still mocked (hackathon scope)

- **Intent parser:** keyword stub (`INTENT_PARSER_MODE=stub`). Precious swaps via `ML_INTENT_PARSER_URL`.
- **Negotiation agent:** rule-based stub. ML via `ML_NEGOTIATION_AGENT_URL`.
- **Rate limit / idempotency stores:** in-memory (swap to Upstash/Redis for production).
- **Integration test:** in-memory ledger, not live Supabase.
