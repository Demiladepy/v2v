import { ok, badRequest, jsonResponse } from "@/lib/api/response";
import { CreateInvoicePayload, LLMResponsePayload } from "@/types";

const MOCK_INTENT: CreateInvoicePayload = {
  intent: "CREATE_INVOICE",
  client: "Cafe One",
  amount: 15000,
  memo: "Late night coffee supply",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return badRequest("Audio file is missing");
    }

    const AETHANA_KEY = process.env.AETHANA_API_KEY;
    const GROQ_KEY = process.env.GROQ_API_KEY;

    // Graceful fallback for missing keys during dev/hackathon
    if (!AETHANA_KEY || !GROQ_KEY) {
      console.warn("Missing AETHANA_API_KEY or GROQ_API_KEY. Using mock intent fallback.");
      // Simulate latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return ok(MOCK_INTENT);
    }

    // Step 1: Transcribe audio using Aethana AI
    const transcribeFormData = new FormData();
    transcribeFormData.append("file", file);
    transcribeFormData.append("language", "english");

    const transcribeRes = await fetch("https://api.aethexai.com/api/v1/transcribe", {
      method: "POST",
      headers: {
        "X-API-Key": AETHANA_KEY,
      },
      body: transcribeFormData,
    });

    if (!transcribeRes.ok) {
      const errText = await transcribeRes.text();
      throw new Error(`Aethana AI Transcription failed: ${errText}`);
    }

    const transcribeData = await transcribeRes.json();
    const transcriptText = transcribeData.text;

    if (!transcriptText) {
      throw new Error("No text returned from transcription service");
    }

    // Step 2: Parse intent using Groq LLM
    const llmRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Using a fast, standard Groq model instead of the placeholder
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

    // Attempt to parse JSON. Sometimes LLMs output markdown fences like ```json
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedIntent = JSON.parse(cleanContent) as LLMResponsePayload;

    return ok(parsedIntent);
  } catch (error: any) {
    console.error("Transcribe API Error:", error);
    return badRequest(error.message || "Failed to process audio");
  }
}
