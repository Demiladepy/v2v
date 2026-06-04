import { ok, badRequest, unprocessableEntity } from "@/lib/api/response";
import { dispatchIntent } from "@/lib/intent/dispatch";
import {
  isIntentParserError,
  parseTranscript,
} from "@/lib/intent/parser";
import { getDefaultMerchantId } from "@/lib/server/merchant";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { voiceProcessRequestSchema } from "@/lib/validations/voice";

export async function POST(request: Request) {
  const body = await parseJsonBody(request);

  if (!body.success) {
    return badRequest(body.error);
  }

  const validated = voiceProcessRequestSchema.safeParse(body.data);

  if (!validated.success) {
    return badRequest("Validation failed", validated.error.format());
  }

  const merchantId =
    validated.data.merchant_id?.trim() || getDefaultMerchantId();

  try {
    const parsed = await parseTranscript(validated.data.transcript);
    const result = await dispatchIntent(
      parsed,
      merchantId,
      validated.data.transcript
    );

    return ok(result);
  } catch (error) {
    if (isIntentParserError(error)) {
      return unprocessableEntity(error.message, error.details);
    }

    const message =
      error instanceof Error ? error.message : "Action dispatch failed";

    return unprocessableEntity(message);
  }
}
