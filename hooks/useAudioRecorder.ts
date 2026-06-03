"use client";

import { useRef, useState, useCallback } from "react";

export type MicPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface UseAudioRecorderReturn {
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  permission: MicPermission;
  isRecording: boolean;
  error: string | null;
}

// iOS Safari uses audio/mp4; Chrome/Firefox prefer audio/webm;codecs=opus
function getSupportedMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [permission, setPermission] = useState<MicPermission>("prompt");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      setError("Microphone access is not supported on this browser.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });

      setPermission("granted");
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        stopResolveRef.current?.(blob);
        stopResolveRef.current = null;
      };

      // 100ms timeslices keep chunks small and enable streaming to backend later
      recorder.start(100);
      setIsRecording(true);
      return true;
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermission("denied");
          setError("Microphone permission denied. Enable it in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setError("No microphone found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Microphone is in use by another application.");
        } else {
          setError(`Microphone error: ${err.message}`);
        }
      } else {
        setError("Failed to start recording. Please try again.");
      }
      return false;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      stopResolveRef.current = resolve;
      recorder.stop();
    });
  }, []);

  return { startRecording, stopRecording, permission, isRecording, error };
}
