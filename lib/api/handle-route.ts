import { mapErrorToResponse } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import { assertRateLimit, type RateLimitTier } from "@/lib/http/rate-limit";
import {
  attachRequestId,
  resolveClientIp,
  resolveRequestId,
  type RequestContext,
} from "@/lib/http/request-context";

export type RouteHandler = (
  request: Request,
  ctx: RequestContext
) => Promise<Response>;

export async function handleRoute(
  request: Request,
  route: string,
  handler: RouteHandler,
  options?: { rateLimit?: RateLimitTier; merchantId?: string }
): Promise<Response> {
  const ctx: RequestContext = {
    requestId: resolveRequestId(request),
    route,
    ip: resolveClientIp(request),
    merchantId: options?.merchantId,
  };

  logger.info("request_start", {
    requestId: ctx.requestId,
    route: ctx.route,
    method: request.method,
    ip: ctx.ip,
    merchantId: ctx.merchantId,
  });

  try {
    if (options?.rateLimit) {
      assertRateLimit({
        tier: options.rateLimit,
        ip: ctx.ip,
        merchantId: options.merchantId,
      });
    }

    const response = await handler(request, ctx);
    const withId = attachRequestId(response, ctx.requestId);

    logger.info("request_complete", {
      requestId: ctx.requestId,
      route: ctx.route,
      status: withId.status,
    });

    return withId;
  } catch (error) {
    const mapped = mapErrorToResponse(error, ctx);

    logger.warn("request_failed", {
      requestId: ctx.requestId,
      route: ctx.route,
      status: mapped.status,
    });

    return mapped;
  }
}
