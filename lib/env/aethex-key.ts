/**
 * AethexAI STT key — supports Vercel naming variants.
 * @see https://developers.aethexai.com
 */
export function getAethexApiKey(): string | undefined {
  return (
    process.env.AETHEX_API?.trim() ||
    process.env.AETHEX_API_KEY?.trim() ||
    process.env.AETHANA_API_KEY?.trim() ||
    undefined
  );
}
