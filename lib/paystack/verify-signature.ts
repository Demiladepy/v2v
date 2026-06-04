import { createHmac, timingSafeEqual } from "crypto";

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expected = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signatureHeader, "utf8")
    );
  } catch {
    return false;
  }
}
