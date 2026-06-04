import { created, badRequest } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { routeFinancialIntent } from "@/lib/server/financial-router";
import { parseLLMResponsePayload } from "@/lib/validations/intent";

export async function POST(request: Request) {
  const body = await parseJsonBody(request);

  if (!body.success) {
    return badRequest(body.error);
  }

  const validated = parseLLMResponsePayload(body.data);

  if (!validated.success) {
    return badRequest(validated.error, validated.details);
  }

  const result = await routeFinancialIntent(validated.data);
  return created(result);
}
