import { ok, badRequest } from "@/lib/api/response";
import { handleRoute } from "@/lib/api/handle-route";
import { mapErrorToResponse } from "@/lib/api/errors";
import { dispatchIntent } from "@/lib/intent/dispatch";
import { validateLlmToParsed } from "@/lib/intent/llm-to-parsed";
import { parseTranscript } from "@/lib/intent/parser";
import { getDefaultMerchantId } from "@/lib/server/merchant";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { voiceProcessRequestSchema } from "@/lib/validations/voice";

export async function POST(request: Request) {
  const merchantId = getDefaultMerchantId();

  return handleRoute(
    request,
    "POST /api/voice/process",
    async (req, ctx) => {
      const body = await parseJsonBody(req);

      if (!body.success) {
        return badRequest(body.error);
      }

      const validated = voiceProcessRequestSchema.safeParse(body.data);

      if (!validated.success) {
        return badRequest("Validation failed", validated.error.format());
      }

      const resolvedMerchant =
        validated.data.merchant_id?.trim() || merchantId;
      ctx.merchantId = resolvedMerchant;

      try {
        const parsed = validated.data.parsed_intent
          ? (() => {
              const mapped = validateLlmToParsed(
                validated.data.parsed_intent,
                validated.data.language
              );
              if (!mapped.success) {
                throw {
                  code: "INVALID_PARSER_OUTPUT",
                  message: mapped.error,
                  details: mapped.details,
                };
              }
              return mapped.data;
            })()
          : await parseTranscript(validated.data.transcript);

        const result = await dispatchIntent(
          parsed,
          resolvedMerchant,
          validated.data.transcript,
          { idempotencyHeader: req.headers.get("Idempotency-Key") }
        );

        return ok(result);
      } catch (error) {
        return mapErrorToResponse(error, ctx);
      }
    },
    { rateLimit: "public", merchantId }
  );
}
