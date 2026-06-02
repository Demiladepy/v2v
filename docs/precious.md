# Role: Precious
## ML & Data Engineer (Intelligence & Pipeline)

**Core Focus**: Audio ingestion gateways, LLM system instructions, JSON function-calling validation, and YarnGPT voice generation.

### Features Owned:
1. **STT Gateway**: Connecting browser audio to Aethana AI (Primary) and Whisper (Fallback).
2. **LLM Reasoner**: Structuring plain text into strict JSON intent mappings (`CREATE_INVOICE`, `CHECK_BALANCE`, `RUN_NEGOTIATION`).
3. **TTS Integration**: Connecting YarnGPT API for natural localized voice confirmations.
4. **Latency Optimization**: Pipeline profiling to ensure end-to-end latency < 2.4 seconds.

### Execution Plan:
- **Phase 1**: Establish the transcription gateway. Route raw client audio buffers to the Primary STT (Aethana AI).
- **Phase 2**: Program structured LLM Reasoner prompts using precise JSON function-calling frames. Run rigorous edge-case testing to hit the 92% numeric valuation accuracy threshold. Integrate YarnGPT API for audio responses.
- **Phase 3**: Execute pipeline profiling to squeeze execution latencies well under the 2.4-second limit.
