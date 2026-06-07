const MIME_TO_EXTENSION: Record<string, string> = {
  "audio/webm": "webm",
  "audio/webm;codecs=opus": "webm",
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/ogg;codecs=opus": "ogg",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mpeg": "mp3",
};

export function resolveRecordingExtension(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (MIME_TO_EXTENSION[normalized]) {
    return MIME_TO_EXTENSION[normalized];
  }

  if (normalized.includes("mp4") || normalized.includes("m4a")) return "m4a";
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("wav")) return "wav";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";

  return "webm";
}

export function resolveRecordingFileName(mimeType: string): string {
  return `recording.${resolveRecordingExtension(mimeType)}`;
}

export function toGroqWhisperLanguage(language: string): string {
  switch (language.toLowerCase()) {
    case "yoruba":
      return "yo";
    case "arabic":
      return "ar";
    case "pidgin":
    case "english":
    default:
      return "en";
  }
}
