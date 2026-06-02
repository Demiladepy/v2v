# Timeline & Dependencies (3-Day Hackathon Sprint)

This document consolidates all individual roles into a unified timeline, highlighting blockers and execution order.

## Phase 1: Foundation (Day 1)
**Goal**: Get basic inputs/outputs working and schemas defined.
- **Adepitan**: Implement `MediaRecorder` audio capture module.
- **Eyitayo**: Set up Shadcn, define CSS variables, build the central recording button and state indicators.
- **Precious**: Authenticate Aethana AI STT, create the initial transcription gateway.
- **Demilade**: Set up Next.js server architecture and define database schema for merchant balances.

*Blockers/Dependencies*: 
- Precious needs Adepitan's audio buffer to test the STT API.
- Eyitayo needs to align with Demilade on how API states (loading, success) will be communicated to the UI.

## Phase 2: Core Integration (Day 2)
**Goal**: Connect the intelligence layer with the financial layer and UI.
- **Precious**: Implement the LLM JSON parser with strict schemas (`CREATE_INVOICE`, `CHECK_BALANCE`, `RUN_NEGOTIATION`). Integrate YarnGPT for TTS.
- **Demilade**: Integrate Paystack Sandbox for checkout links. Create the webhook listener for `charge.success` to update the Access Bank simulated ledger.
- **Eyitayo**: Build the mock financial dashboard and Café One UI, wiring them up to the backend state.
- **Adepitan**: Convert the app into a PWA (web manifests, service workers) and wire up native OS sharing (WhatsApp) for Paystack links.

*Blockers/Dependencies*:
- Demilade's financial router cannot function until Precious's LLM outputs reliable >92% accurate JSON schemas.
- Adepitan's WhatsApp share loop depends on Demilade successfully generating the Paystack links.

## Phase 3: Polish & Optimization (Day 3)
**Goal**: Sub-2.4s latency, premium UI, fault tolerance.
- **Adepitan**: Finalize mobile UX, handle interruptions (phone calls disrupting audio).
- **Eyitayo**: Polish the UI (animations, glassmorphism, ensuring NO hardcoded colors). Ensure zero UI lag during audio processing.
- **Precious**: Profile and optimize ML pipeline latency to ensure <2.4s execution time.
- **Demilade**: Implement fallback routing for external APIs and assist with end-to-end transactional testing.

*Critical Path*: If STT or LLM latency is too high, the entire user experience fails. Precious's optimizations are the ultimate blocker for project success.
