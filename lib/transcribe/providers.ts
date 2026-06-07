import {
  resolveRecordingFileName,
  toGroqWhisperLanguage,
} from "@/lib/audio/recording-file";

export async function transcribeWithAethex(
  file: Blob,
  apiKey: string,
  language: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const mimeType = file.type || "audio/webm";
  const fileName = resolveRecordingFileName(mimeType);

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType }), fileName);
  form.append("language", language);

  const response = await fetch("https://api.aethexai.com/api/v1/transcribe", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AethexAI transcription failed: ${errText}`);
  }

  const payload = (await response.json()) as { text?: string };
  if (!payload.text?.trim()) {
    throw new Error("AethexAI returned an empty transcript");
  }

  return payload.text.trim();
}

export async function transcribeWithGroqWhisper(
  file: Blob,
  apiKey: string,
  language: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const mimeType = file.type || "audio/webm";
  const fileName = resolveRecordingFileName(mimeType);

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType }), fileName);
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", toGroqWhisperLanguage(language));
  form.append("response_format", "json");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq Whisper failed: ${errText}`);
  }

  const payload = (await response.json()) as { text?: string };
  if (!payload.text?.trim()) {
    throw new Error("Groq Whisper returned an empty transcript");
  }

  return payload.text.trim();
}

export async function transcribeAudio(
  file: Blob,
  options: { aethexKey: string; groqKey: string; language: string }
): Promise<string> {
  try {
    return await transcribeWithAethex(file, options.aethexKey, options.language);
  } catch (aethexError) {
    console.warn("Aethex STT failed, falling back to Groq Whisper:", aethexError);
    return transcribeWithGroqWhisper(file, options.groqKey, options.language);
  }
}
