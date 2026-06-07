// ==========================================
// Parsed intent validation (parser output)
// ==========================================

import { z } from "zod";

const createInvoiceParsedSchema = z.object({
  intent_type: z.literal("CREATE_INVOICE"),
  client: z.string().trim().min(1),
  amount: z.number().positive(),
  memo: z.string().trim().min(1),
  language: z.enum(["english", "yoruba", "pidgin"]).optional(),
});

const checkBalanceParsedSchema = z.object({
  intent_type: z.literal("CHECK_BALANCE"),
  account_type: z.string().trim().min(1),
});

const runNegotiationParsedSchema = z.object({
  intent_type: z.literal("RUN_NEGOTIATION"),
  counterparty: z.string().trim().min(1),
  requested_amount: z.number().positive(),
});

export const parsedIntentSchema = z.discriminatedUnion("intent_type", [
  createInvoiceParsedSchema,
  checkBalanceParsedSchema,
  runNegotiationParsedSchema,
]);

export type ParsedIntent = z.infer<typeof parsedIntentSchema>;

export function validateParsedIntent(input: unknown):
  | { success: true; data: ParsedIntent }
  | { success: false; error: string; details: z.ZodFormattedError<unknown> } {
  const result = parsedIntentSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid parser output",
      details: result.error.format(),
    };
  }

  return { success: true, data: result.data };
}
