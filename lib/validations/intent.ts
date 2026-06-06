// ==========================================
// V2V Request Validation (Zod)
// Mirrors shapes in types/index.ts — do not invent alternate payloads.
// ==========================================

import { z } from "zod";
import type { LLMResponsePayload } from "@/types";

const createInvoiceSchema = z.object({
  intent: z.literal("CREATE_INVOICE"),
  client: z.string().trim().min(1, "client is required"),
  amount: z.number().positive("amount must be greater than zero"),
  memo: z.string().trim().min(1, "memo is required"),
  language: z.enum(["english", "yoruba", "pidgin"]).optional(),
});

const checkBalanceSchema = z.object({
  intent: z.literal("CHECK_BALANCE"),
  account_type: z.string().trim().min(1, "account_type is required"),
});

const runNegotiationSchema = z.object({
  intent: z.literal("RUN_NEGOTIATION"),
  counterparty: z.string().trim().min(1, "counterparty is required"),
  requested_amount: z
    .number()
    .positive("requested_amount must be greater than zero"),
});

export const llmResponsePayloadSchema = z.discriminatedUnion("intent", [
  createInvoiceSchema,
  checkBalanceSchema,
  runNegotiationSchema,
]);

export type ParsedLLMResponsePayload = z.infer<typeof llmResponsePayloadSchema>;

export function parseLLMResponsePayload(
  input: unknown
):
  | { success: true; data: LLMResponsePayload }
  | { success: false; error: string; details: z.ZodFormattedError<unknown> } {
  const result = llmResponsePayloadSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      details: result.error.format(),
    };
  }

  return { success: true, data: result.data };
}
