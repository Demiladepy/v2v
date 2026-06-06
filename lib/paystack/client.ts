// ==========================================
// Paystack API client (server-only)
// ==========================================

import { AppError } from "@/lib/api/errors";

const PAYSTACK_BASE_URL = "https://api.paystack.co";
export interface InitializeTransactionParams {
  email: string;
  amountNaira: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callbackUrl: string;
}

export interface InitializeTransactionResult {
  authorization_url: string;
  reference: string;
}

type FetchLike = typeof fetch;

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    throw new AppError(
      503,
      "Paystack is not configured. Set PAYSTACK_SECRET_KEY."
    );
  }  return key;
}

export async function initializeTransaction(
  params: InitializeTransactionParams,
  fetchFn: FetchLike = fetch
): Promise<InitializeTransactionResult> {
  const secretKey = getSecretKey();

  const response = await fetchFn(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNaira * 100),
      reference: params.reference,
      metadata: params.metadata ?? {},
      callback_url: params.callbackUrl,
    }),
  });

  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: {
      authorization_url?: string;
      reference?: string;
    };
  };

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new AppError(
      502,
      payload.message ?? `Paystack initialize failed (${response.status})`
    );
  }
  return {
    authorization_url: payload.data.authorization_url,
    reference: payload.data.reference ?? params.reference,
  };
}
