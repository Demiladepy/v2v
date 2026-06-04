/**
 * Post-deploy smoke check.
 * Usage: npx tsx scripts/smoke.ts https://your-app.vercel.app
 */

const baseUrl = (process.argv[2] ?? process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

async function main() {
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthBody = await healthRes.json();

  console.log("GET /api/health", healthRes.status, healthBody);

  if (!healthRes.ok) {
    process.exit(1);
  }

  const balanceRes = await fetch(`${baseUrl}/api/voice/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcript: "Check my business balance",
      merchant_id: process.env.DEFAULT_MERCHANT_ID ?? "demo_merchant",
    }),
  });
  const balanceBody = await balanceRes.json();

  console.log("POST /api/voice/process (balance)", balanceRes.status, balanceBody);

  if (!balanceRes.ok) {
    process.exit(1);
  }

  console.log("smoke ok");
}

main().catch((err) => {
  console.error("smoke failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
