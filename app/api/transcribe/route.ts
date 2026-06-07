import { ok, badRequest, jsonResponse } from "@/lib/api/response";
import { getAethexApiKey } from "@/lib/env/aethex-key";
import { transcribeAudio } from "@/lib/transcribe/providers";
import type { LLMResponsePayload } from "@/types";
import {
  getSttLanguageCode,
  isInvoiceLanguage,
} from "@/lib/constants/invoice-languages";

const GROQ_MODEL = "llama-3.1-8b-instant";

function resolveTranscribeLanguage(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && isInvoiceLanguage(value)) {
    return getSttLanguageCode(value);
  }

  return "english";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const sttLanguage = resolveTranscribeLanguage(formData.get("language"));

    if (!file) {
      return badRequest("Audio file is missing");
    }

    const aethexKey = getAethexApiKey();
    const groqKey = process.env.GROQ_API_KEY?.trim();

    if (!aethexKey || !groqKey) {
      return jsonResponse(503, {
        ok: false,
        error:
          "Voice transcription is not configured. Set AETHEX_API (or AETHEX_API_KEY) and GROQ_API_KEY on the server.",
      });
    }

    const transcriptText = await transcribeAudio(file, {
      aethexKey,
      groqKey,
      language: sttLanguage,
    });

    const llmRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a financial intent parser for Nigerian merchants.
Given a voice transcript, return ONLY valid JSON matching one of these:

{"intent": "CREATE_INVOICE", "client": "name", "amount": 150000, "memo": "reason"}
{"intent": "CHECK_BALANCE", "account_type": "high_yield_sub_account"}
{"intent": "RUN_NEGOTIATION", "counterparty": "name", "requested_amount": 50000}

Rules:
- amount must be a number. ₦150,000 = 150000, "fifty thousand" = 50000
- Extract client, amount, and memo from the transcript — never reuse example values
- Return ONLY the JSON. No explanation, no extra text.`,
          },
          {
            role: "user",
            content: transcriptText,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      throw new Error(`Groq LLM failed: ${errText}`);
    }

    const llmData = await llmRes.json();
    const content = llmData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Groq LLM");
    }

    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedIntent = JSON.parse(cleanContent) as LLMResponsePayload;

    return ok(parsedIntent);
  } catch (error: unknown) {
    console.error("Transcribe API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process audio";
    return badRequest(message);
  }
}
