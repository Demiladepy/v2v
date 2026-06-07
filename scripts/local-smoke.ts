/**
 * Local API smoke tests — run while `npm run dev` is up.
 * Usage: npx tsx scripts/local-smoke.ts
 */

const localBaseUrl = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

type StepResult = { name: string; ok: boolean; detail: string };

async function runStep(
  name: string,
  fn: () => Promise<{ ok: boolean; detail: string }>
): Promise<StepResult> {
  try {
    const { ok, detail } = await fn();
    console.log(ok ? "✓" : "✗", name, "—", detail);
    return { name, ok, detail };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log("✗", name, "—", detail);
    return { name, ok: false, detail };
  }
}

async function main() {
  console.log(`Local smoke against ${localBaseUrl}\n`);

  const results: StepResult[] = [];

  results.push(
    await runStep("GET /api/health", async () => {
      const res = await fetch(`${localBaseUrl}/api/health`);
      const body = await res.json();
      return {
        ok: res.ok && body.ok === true,
        detail: `${res.status} ${JSON.stringify(body)}`,
      };
    })
  );

  results.push(
    await runStep("POST /api/transcribe", async () => {
      const blob = new Blob(["fake-audio"], { type: "audio/webm" });
      const form = new FormData();
      form.append("file", blob, "test.webm");
      form.append("language", "english");

      const res = await fetch(`${localBaseUrl}/api/transcribe`, {
        method: "POST",
        body: form,
      });
      const body = await res.json();
      const configured = res.ok && body.ok === true;
      const clearConfigError =
        res.status === 503 &&
        typeof body.error === "string" &&
        body.error.includes("Voice transcription is not configured");
      return {
        ok: configured || clearConfigError,
        detail: configured
          ? `${res.status} intent=${body.data?.intent}`
          : `${res.status} ${body.error ?? "unknown"}`,
      };
    })
  );

  results.push(
    await runStep("POST /api/financial/router (CHECK_BALANCE)", async () => {
      const res = await fetch(`${localBaseUrl}/api/financial/router`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "CHECK_BALANCE",
          account_type: "high_yield_sub_account",
        }),
      });
      const body = await res.json();
      const configured = res.ok && body.ok === true;
      const clearConfigError =
        !res.ok &&
        typeof body.error === "string" &&
        body.error.includes("Database is not configured");
      return {
        ok: configured || clearConfigError,
        detail: configured
          ? `${res.status} balance flow ok`
          : `${res.status} ${body.error ?? JSON.stringify(body)}`,
      };
    })
  );

  results.push(
    await runStep("Dashboard flow: transcribe → voice/process", async () => {
      const blob = new Blob(["fake-audio"], { type: "audio/webm" });
      const form = new FormData();
      form.append("file", blob, "test.webm");

      form.append("language", "english");

      const transcribeRes = await fetch(`${localBaseUrl}/api/transcribe`, {
        method: "POST",
        body: form,
      });
      const transcribeBody = await transcribeRes.json();
      if (!transcribeBody.ok) {
        const skipped =
          transcribeRes.status === 503 &&
          typeof transcribeBody.error === "string" &&
          transcribeBody.error.includes("Voice transcription is not configured");
        return {
          ok: skipped,
          detail: skipped
            ? "skipped — transcription keys not configured locally"
            : `transcribe failed: ${transcribeBody.error}`,
        };
      }

      const intent = transcribeBody.data.intent ?? transcribeBody.data;
      const transcript = transcribeBody.data.transcript ?? "";

      const processRes = await fetch(`${localBaseUrl}/api/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          parsed_intent: intent,
          language: "english",
        }),
      });
      const processBody = await processRes.json();

      if (processRes.ok && processBody.ok) {
        return {
          ok: true,
          detail: `voice action ok (${processBody.data?.reference ?? processBody.data?.intent_type ?? "ok"})`,
        };
      }

      const clearConfigError =
        typeof processBody.error === "string" &&
        (processBody.error.includes("Database is not configured") ||
          processBody.error.includes("Paystack is not configured"));

      return {
        ok: clearConfigError,
        detail: `${processRes.status} ${processBody.error ?? "unknown error"}`,
      };
    })
  );

  results.push(
    await runStep("POST /api/voice/process (balance stub)", async () => {
      const res = await fetch(`${localBaseUrl}/api/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "Check my business balance",
          merchant_id: "demo_merchant",
        }),
      });
      const body = await res.json();
      const configured = res.ok && body.ok === true;
      const clearConfigError =
        !res.ok &&
        typeof body.error === "string" &&
        body.error.includes("Database is not configured");
      return {
        ok: configured || clearConfigError,
        detail: configured
          ? `${res.status} voice balance ok`
          : `${res.status} ${body.error ?? JSON.stringify(body)}`,
      };
    })
  );

  const failed = results.filter((r) => !r.ok);
  console.log(
    failed.length === 0
      ? "\nAll local smoke steps passed."
      : `\n${failed.length} step(s) failed.`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
