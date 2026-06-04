# Timeline Changes Log

Append-only log of agent changes. Do not overwrite existing lines.

- 2026-06-03 — Demilade: Day 1 backend boilerplate — Next.js API routes (`/api/health`, `/api/financial/router`), Zod validation aligned with `types/index.ts`, shared API response envelope, Vitest suite, and `.env.example` template.
- 2026-06-03 — Demilade: Day 2 Supabase persistence — `transactions` migration, server-only Supabase client, `lib/db/ledger.ts` repository, CHECK_BALANCE reads real aggregated balance, route handlers wired to Supabase (mocked in tests).
- 2026-06-03 — Demilade: Day 3 Paystack — initialize checkout for CREATE_INVOICE, webhook signature verification on raw body, idempotent settlement via reference + event id, Vitest coverage for valid/invalid/duplicate webhooks.

---

## 2026-06-02 — Adepitan (Mobile/Hardware) — Phase 1–3

### Phase 1: Audio Capture Module
- **Created** `hooks/useAudioRecorder.ts` — custom hook wrapping `MediaDevices.getUserMedia` + `MediaRecorder`.
  - Cross-browser MIME type selection: prefers `audio/webm;codecs=opus`, falls back to `audio/mp4` for iOS Safari.
  - Streams in 100ms timeslices for future backend streaming capability.
  - Typed permission states: `prompt | granted | denied | unsupported`.
  - Granular `DOMException` handling (`NotAllowedError`, `NotFoundError`, `NotReadableError`).
- **Updated** `app/page.tsx` — wired `useAudioRecorder` into `handleStartRecording` / `handleStopRecording`, replacing the dummy `setTimeout` flow. Real audio `Blob` is produced on stop; mock pipeline runs until Demilade's `/api/transcribe` is live. Added `ERROR` state display with "Try again" affordance.
- **Fixed** `min-h-[100dvh]` → `min-h-dvh` in `page.tsx` and `layout.tsx`.

### Phase 2: PWA Architecture
- **Created** `public/manifest.json` — standalone display, dark theme, SVG icon with `any` + `maskable` purpose.
- **Created** `public/icon.svg` — brand-blue `#4F8CF2` "V2V" wordmark on `#0F172A` rounded-rect background.
- **Created** `public/sw.js` — service worker: network-first for `/api/*`, cache-first for shell assets. Auto-activates with `skipWaiting` + `clients.claim`.
- **Created** `components/ServiceWorkerRegistrar.tsx` — zero-render client component; registers `sw.js` on mount.
- **Updated** `app/layout.tsx` — added `ServiceWorkerRegistrar` into the body; fixed `min-h-dvh`.

### Phase 3: Native Sharing
- **Created** `lib/share.ts` — `sharePaymentLink(url, note?)` tries Web Share API first, falls back to WhatsApp deep link (`wa.me/?text=...`). Ready to be called after a `CREATE_INVOICE` SUCCESS response.

---

## 2026-06-03 — Eyitayo (Frontend UI) — Phase 2
- **Created** `components/BottomNav.tsx` — mobile-first bottom navigation bar for tab switching.
- **Created** `hooks/useLedger.ts` — mock polling hook for ledger balance and transactions.
- **Created** `components/FinancialDashboard.tsx` — built mock operational balance and ledger feed UI using Shadcn cards and CSS variables.
- **Created** `components/CafeOneUI.tsx` — built lightweight mockup interface displaying workspace logistics.
- **Updated** `app/page.tsx` — restructured to conditionally render the Voice tab, Financial Dashboard, or Cafe One UI based on BottomNav state.

## 2026-06-03 — Eyitayo (Frontend UI) — Phase 3
- **Created** `lib/mockTranscribe.ts` — API mock function simulating Aethana AI + LLM processing latency and returning structured JSON.
- **Created** `components/CheckoutModule.tsx` — UI for rendering `CREATE_INVOICE` intent and wired it to Adepitan's WhatsApp sharing fallback.
- **Updated** `app/page.tsx` — connected the voice states directly with the mock ML output and conditionally rendered the CheckoutModule smoothly.

---

## 2026-06-03 — Eyitayo (Frontend UI) — UI Revamp
- **Updated** `app/layout.tsx` — switched default to light mode and updated `themeColor` to `#FDFBF7`.
- **Updated** `app/globals.css` — overhauled global palette to feature cream background (`#FDFBF7`), stark black text, and velvet red-brown primary accents (`#7A1F2D`).
- **Moved** `app/page.tsx` to `app/dashboard/page.tsx` — relocated the main application into a dedicated dashboard route.
- **Created** `app/page.tsx` — built a new mobile-first Landing Page highlighting the Voice-to-Value proposition with a CTA routing to the dashboard.
- **Updated** `components/AudioButton.tsx` — refined shadow artifacts and text colors for light mode contrast.
