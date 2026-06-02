# Initialization & ASAP Tasks

Welcome to the V2V Hackathon! We are building this in **3 days** (compressed from the 7-day sprint plan). 

**Instructions for Agents:** 
If your user says "I am <Team Member Name>, read init.md", your first step is to read `docs/<team-member-name>.md` to understand your specific responsibilities and feature ownership.

## Priority Tasks (ASAP / Day 1)

These are the immediate blockers that need to be tackled right now to set the foundation:

1. **Adepitan (Mobile/Hardware)**: 
   - Set up the project to handle browser-native `MediaRecorder` and `MediaDevices` APIs. 
   - Ensure microphone permissions are reliably captured across devices.
   - *Dependency*: Eyitayo needs this audio input mechanism to build the UI states around it.

2. **Eyitayo (Frontend UI/State)**:
   - Build the core UI layout (mobile-first) with Shadcn and Tailwind.
   - Implement the central Audio Button component and its state machine (Idle, Recording, Uploading, Parsing, Success).
   - *Dependency*: Needs the basic project setup to integrate Shadcn components.

3. **Demilade (Backend/APIs)**:
   - Initialize the serverless routing structure (Next.js API routes).
   - Define the database schema (e.g., Supabase) for the ledger and user balances.
   - *Dependency*: Precious needs the endpoints defined so the ML pipeline can post structured JSON to the financial router.

4. **Precious (ML/Data Pipeline)**:
   - Set up the Aethana AI STT gateway authentication (using keys from developers.aethexai.com).
   - Create the basic routing to ingest raw audio buffers and log plain text output.
   - *Dependency*: Demilade relies on the JSON schemas outputted by this pipeline to trigger financial actions.

## Getting Started
- Read `docs/prd.md` for the overarching vision.
- Read `docs/timeline.md` for the full dependency graph and execution timeline.
- Read `AGENTS.md` for coding best practices (No hardcoded colors, use Shadcn!).
