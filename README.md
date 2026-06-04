# V2V — Voice-to-Value Autonomous Merchant Protocol

Next.js PWA + API backend for voice-driven invoices, balance checks, and B2B negotiations (Paystack + Supabase).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys
# Run supabase/migrations/*.sql in Supabase SQL editor
npm run seed                 # optional demo data
npm run dev
npm test
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | Liveness |
| `/api/financial/router` | POST | Direct LLM JSON intents |
| `/api/voice/process` | POST | Transcript → intent → action |
| `/api/webhooks/paystack` | POST | Verified settlement webhooks |

All responses use `{ ok, data | error }` and include `x-request-id`.

## Scripts

```bash
npm run dev          # local Next.js
npm test             # Vitest (unit + integration)
npm run seed         # idempotent Supabase demo rows
npm run smoke -- https://your-deployment.vercel.app
```

## Deploy (Vercel)

1. Import the GitHub repo in [Vercel](https://vercel.com/new).
2. Set **Environment Variables** (Production + Preview):

| Variable | Required | Notes |
|----------|----------|-------|
| `SUPABASE_URL` | Yes | Project URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only — never expose to client |
| `SUPABASE_ANON_KEY` | Optional | Future client reads |
| `PAYSTACK_SECRET_KEY` | Yes | `sk_test_…` or live secret |
| `PAYSTACK_PUBLIC_KEY` | Yes | Checkout / client |
| `APP_BASE_URL` | Yes | e.g. `https://v2v.vercel.app` |
| `DEFAULT_MERCHANT_ID` | Optional | Defaults to `default_merchant` |
| `INTENT_PARSER_MODE` | Optional | `stub` (default) or `ml` |
| `ML_INTENT_PARSER_URL` | If `ml` | Precious ML parser endpoint |
| `NEGOTIATION_AGENT_MODE` | Optional | `stub` or `ml` |
| `ML_NEGOTIATION_AGENT_URL` | If `ml` | Negotiation agent endpoint |
| `AETHANA_API_KEY` | Optional | Precious STT |
| `OPENAI_API_KEY` | Optional | Whisper / LLM fallback |
| `YARNGPT_API_KEY` | Optional | TTS |

3. Deploy. Confirm **`app/api/webhooks/paystack/route.ts`** stays on **Node.js runtime** (required for raw body + HMAC).

4. In **Paystack Dashboard → Webhooks**, set:

   ```
   https://<your-vercel-domain>/api/webhooks/paystack
   ```

5. Run migrations on Supabase production DB (`0001_transactions.sql`, `0002_negotiations.sql`).

6. Post-deploy smoke:

   ```bash
   npm run smoke -- https://<your-vercel-domain>
   ```

See **DEMO_RUNBOOK.md** for judge-facing demo steps.

## Team docs

- `init.md` — hackathon priorities
- `AGENTS.md` — coding rules
- `docs/demilade.md` — backend ownership
- `docs/timeline-changes.md` — change log

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
