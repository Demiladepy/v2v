import { isIntentParserError } from "@/lib/intent/parser";
import { logger } from "@/lib/logger";
import {
  badRequest,
  internalError,
  jsonResponse,
  unprocessableEntity,
} from "@/lib/api/response";
import type { RequestContext } from "@/lib/http/request-context";
import { attachRequestId } from "@/lib/http/request-context";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSec: number) {
    super(429, "Too many requests", { retry_after_sec: retryAfterSec });
    this.name = "RateLimitError";
  }
}

export function mapErrorToResponse(
  error: unknown,
  ctx: RequestContext
): Response {
  if (error instanceof AppError) {
    logger.warn("app_error", {
      requestId: ctx.requestId,
      route: ctx.route,
      status: error.statusCode,
      error: error.message,
    });

    return attachRequestId(
      jsonResponse(error.statusCode, {
        ok: false,
        error: error.message,
        details: error.details,
      }),
      ctx.requestId
    );
  }

  if (isIntentParserError(error)) {
    return attachRequestId(
      unprocessableEntity(error.message, error.details),
      ctx.requestId
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected error";

  logger.error("unhandled_error", {
    requestId: ctx.requestId,
    route: ctx.route,
    error: message,
  });

  return attachRequestId(internalError(), ctx.requestId);
}
