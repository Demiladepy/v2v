import { describe, expect, it } from "vitest";
import {
  resolveRecordingExtension,
  resolveRecordingFileName,
  toGroqWhisperLanguage,
} from "@/lib/audio/recording-file";

describe("recording file helpers", () => {
  it("maps mobile mp4 recordings to m4a filenames", () => {
    expect(resolveRecordingExtension("audio/mp4")).toBe("m4a");
    expect(resolveRecordingFileName("audio/mp4")).toBe("recording.m4a");
  });

  it("maps webm recordings correctly", () => {
    expect(resolveRecordingFileName("audio/webm;codecs=opus")).toBe(
      "recording.webm"
    );
  });

  it("maps invoice languages to whisper codes", () => {
    expect(toGroqWhisperLanguage("english")).toBe("en");
    expect(toGroqWhisperLanguage("yoruba")).toBe("yo");
    expect(toGroqWhisperLanguage("arabic")).toBe("ar");
    expect(toGroqWhisperLanguage("pidgin")).toBe("en");
  });
});
