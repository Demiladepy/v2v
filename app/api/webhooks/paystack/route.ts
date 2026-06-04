import { jsonResponse } from "@/lib/api/response";
import { processPaystackWebhookEvent } from "@/lib/paystack/process-event";
import { verifyPaystackSignature } from "@/lib/paystack/verify-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPaystackSecretKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || null;
}

export async function POST(req: Request) {
  const secretKey = getPaystackSecretKey();

  if (!secretKey) {
    return jsonResponse(500, {
      ok: false,
      error: "Paystack is not configured",
    });
  }

  // RAW BODY — must be read before JSON.parse for signature verification.
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature, secretKey)) {
    return jsonResponse(401, {
      ok: false,
      error: "Invalid Paystack signature",
    });
  }

  let event: unknown;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: "Invalid webhook JSON",
    });
  }

  await processPaystackWebhookEvent(
    event as Parameters<typeof processPaystackWebhookEvent>[0]
  );

  return jsonResponse(200, {
    ok: true,
    data: { received: true },
  });
}
