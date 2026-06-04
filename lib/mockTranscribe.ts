import { LLMResponsePayload } from "@/types";

/**
 * Simulates a call to the STT + LLM pipeline endpoint.
 * Waits for 1.5s (to simulate < 2.4s latency) and returns a strongly-typed intent.
 */
export async function mockTranscribeAPI(audioBlob: Blob): Promise<LLMResponsePayload> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Hardcoded to return a CREATE_INVOICE intent as agreed for testing the UI flow
  return {
    intent: "CREATE_INVOICE",
    client: "Café One",
    amount: 150000,
    memo: "Coffee supplies",
  };
}
