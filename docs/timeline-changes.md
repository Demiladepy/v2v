# Timeline Changes Log

Append-only log of agent changes. Do not overwrite existing lines.

- 2026-06-03 — Demilade: Day 1 backend boilerplate — Next.js API routes (`/api/health`, `/api/financial/router`), Zod validation aligned with `types/index.ts`, shared API response envelope, Vitest suite, and `.env.example` template.

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
