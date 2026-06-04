# Timeline Changes Log

Append-only log of agent changes. Do not overwrite existing lines.

- 2026-06-03 — Demilade: Day 1 backend boilerplate — Next.js API routes (`/api/health`, `/api/financial/router`), Zod validation aligned with `types/index.ts`, shared API response envelope, Vitest suite, and `.env.example` template.
- 2026-06-03 — Demilade: Day 2 Supabase persistence — `transactions` migration, server-only Supabase client, `lib/db/ledger.ts` repository, CHECK_BALANCE reads real aggregated balance, route handlers wired to Supabase (mocked in tests).
- 2026-06-03 — Demilade: Day 3 Paystack — initialize checkout for CREATE_INVOICE, webhook signature verification on raw body, idempotent settlement via reference + event id, Vitest coverage for valid/invalid/duplicate webhooks.
