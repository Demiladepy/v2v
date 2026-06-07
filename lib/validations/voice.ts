import { z } from "zod";
import { llmResponsePayloadSchema } from "@/lib/validations/intent";

export const voiceProcessRequestSchema = z.object({
  transcript: z.string().trim().min(1, "transcript is required"),
  merchant_id: z.string().trim().min(1).optional(),
  parsed_intent: llmResponsePayloadSchema.optional(),
  language: z.enum(["english", "yoruba", "pidgin"]).optional(),
});

export type VoiceProcessRequest = z.infer<typeof voiceProcessRequestSchema>;
