// ==========================================
// V2V API Response Envelope
// All API routes use this shape so frontend / ML agents stay aligned.
// ==========================================

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiErrorBody = {
  ok: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export function jsonResponse<T>(
  status: number,
  body: ApiResponse<T>
): Response {
  return Response.json(body, { status });
}

export function ok<T>(data: T, status = 200): Response {
  return jsonResponse(status, { ok: true, data });
}

export function created<T>(data: T): Response {
  return ok(data, 201);
}

export function badRequest(error: string, details?: unknown): Response {
  return jsonResponse(400, { ok: false, error, details });
}

export function internalError(error = "Internal server error"): Response {
  return jsonResponse(500, { ok: false, error });
}
