"use client";

import { useCallback, useState } from "react";
import type { ActionResult, InvoiceLanguage, LLMResponsePayload } from "@/types";

type ProcessVoiceActionInput = {
  transcript: string;
  parsedIntent?: LLMResponsePayload;
  language?: InvoiceLanguage;
};

type ProcessVoiceActionResult = {
  actionResult: ActionResult;
  intentPayload: LLMResponsePayload | null;
};

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

export function useVoiceAction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processVoiceAction = useCallback(
    async (input: ProcessVoiceActionInput): Promise<ProcessVoiceActionResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        const idempotencyKey = newIdempotencyKey();

        const res = await fetch("/api/voice/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            transcript: input.transcript,
            parsed_intent: input.parsedIntent,
            language: input.language,
          }),
        });

        const apiResult = await res.json();
        if (!apiResult.ok) {
          throw new Error(apiResult.error || "Processing failed");
        }

        const actionResult = apiResult.data as ActionResult;

        return { actionResult, intentPayload: input.parsedIntent ?? null };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { processVoiceAction, isProcessing, error, setError };
}
