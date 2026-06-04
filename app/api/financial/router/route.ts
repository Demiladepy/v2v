import { created, badRequest } from "@/lib/api/response";
import { handleRoute } from "@/lib/api/handle-route";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { routeFinancialIntent } from "@/lib/server/financial-router";
import { parseLLMResponsePayload } from "@/lib/validations/intent";
import { getDefaultMerchantId } from "@/lib/server/merchant";

export async function POST(request: Request) {
  return handleRoute(
    request,
    "POST /api/financial/router",
    async (req) => {
      const body = await parseJsonBody(req);

      if (!body.success) {
        return badRequest(body.error);
      }

      const validated = parseLLMResponsePayload(body.data);

      if (!validated.success) {
        return badRequest(validated.error, validated.details);
      }

      const merchantId = getDefaultMerchantId();
      const result = await routeFinancialIntent(validated.data, merchantId, {
        idempotencyHeader: req.headers.get("Idempotency-Key"),
      });

      return created(result);
    },
    { rateLimit: "public", merchantId: getDefaultMerchantId() }
  );
}
