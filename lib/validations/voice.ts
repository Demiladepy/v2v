import { z } from "zod";

export const voiceProcessRequestSchema = z.object({
  transcript: z.string().trim().min(1, "transcript is required"),
  merchant_id: z.string().trim().min(1).optional(),
});

export type VoiceProcessRequest = z.infer<typeof voiceProcessRequestSchema>;
