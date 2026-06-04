import { ok } from "@/lib/api/response";
import { handleRoute } from "@/lib/api/handle-route";

export async function GET(request: Request) {
  return handleRoute(
    request,
    "GET /api/health",
    async () =>
      ok({
        status: "healthy",
        service: "v2v-api",
      }),
    { rateLimit: "health" }
  );
}
