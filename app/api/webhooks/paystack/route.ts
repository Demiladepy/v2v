import { jsonResponse, badRequest } from "@/lib/api/response";
import { handleRoute } from "@/lib/api/handle-route";
import { AppError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { processPaystackWebhookEvent } from "@/lib/paystack/process-event";
import { verifyPaystackSignature } from "@/lib/paystack/verify-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPaystackSecretKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || null;
}

export async function POST(request: Request) {
  return handleRoute(
    request,
    "POST /api/webhooks/paystack",
    async (req, ctx) => {
      const secretKey = getPaystackSecretKey();

      if (!secretKey) {
        throw new AppError(500, "Paystack is not configured");
      }

      // RAW BODY — read once before JSON.parse (signature verification).
      const rawBody = await req.text();
      const signature = req.headers.get("x-paystack-signature");

      if (!verifyPaystackSignature(rawBody, signature, secretKey)) {
        logger.warn("paystack_signature_invalid", {
          requestId: ctx.requestId,
          route: ctx.route,
        });
        return jsonResponse(401, {
          ok: false,
          error: "Invalid Paystack signature",
        });
      }

      let event: unknown;

      try {
        event = JSON.parse(rawBody);
      } catch {
        return badRequest("Invalid webhook JSON");
      }

      const outcome = await processPaystackWebhookEvent(
        event as Parameters<typeof processPaystackWebhookEvent>[0]
      );

      logger.info("paystack_webhook_processed", {
        requestId: ctx.requestId,
        route: ctx.route,
        action: outcome.action,
      });

      return jsonResponse(200, {
        ok: true,
        data: { received: true, action: outcome.action },
      });
    },
    { rateLimit: "webhook" }
  );
}
