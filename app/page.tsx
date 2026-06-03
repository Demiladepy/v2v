"use client";

import { useState } from "react";
import { AppState } from "@/types";
import { AudioButton } from "@/components/AudioButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [transcript, setTranscript] = useState<string>("");

  const { startRecording, stopRecording, error: micError } = useAudioRecorder();

  const handleStartRecording = async () => {
    const started = await startRecording();
    if (!started) {
      setAppState("ERROR");
      return;
    }
    setAppState("RECORDING");
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleStopRecording = async () => {
    setAppState("UPLOADING");
    setTranscript("");

    const blob = await stopRecording();

    if (!blob) {
      setAppState("ERROR");
      return;
    }

    // blob is ready for Demilade's /api/transcribe endpoint.
    // Mocking the STT → LLM pipeline until that route is live.
    setAppState("PARSING");
    setTimeout(() => {
      setAppState("SUCCESS");
      setTranscript("Invoice Café One ₦150,000 for the new batch of coffee supplies.");
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setTimeout(() => setAppState("IDLE"), 4000);
    }, 1800);
  };

  const statusLabel = () => {
    if (appState === "RECORDING") return "Release to Send";
    if (appState === "ERROR" && micError) return micError;
    return "Ready";
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-6 max-w-md mx-auto w-full min-h-dvh pb-12 pt-12 relative overflow-hidden">

      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-info/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full space-y-2 z-10 pt-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground text-center">V2V</h1>
        <p className="text-muted-foreground text-center text-sm font-medium">
          Hold the button and speak your request.
        </p>
      </div>

      {/* Live Action Feed */}
      <Card className="w-full bg-card/60 backdrop-blur-xl border-border shadow-sh-md z-10">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
            <span>Live Action Feed</span>
            {appState !== "IDLE" && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="min-h-[100px] flex items-center justify-center transition-all duration-300">
            {appState === "IDLE" && (
              <p className="text-muted-foreground/60 italic text-sm">Awaiting voice command...</p>
            )}
            {appState === "RECORDING" && (
              <p className="text-destructive font-medium animate-pulse text-lg">Listening...</p>
            )}
            {appState === "UPLOADING" && (
              <p className="text-brand-light font-medium text-lg">Uploading chunk...</p>
            )}
            {appState === "PARSING" && (
              <p className="text-brand font-medium text-lg">Extracting intent...</p>
            )}
            {appState === "SUCCESS" && (
              <div className="text-success text-sm font-medium border border-success/30 bg-success/10 p-4 rounded-xl w-full shadow-sm">
                <div className="text-xs text-success/70 uppercase tracking-wider mb-1 font-semibold">Intent: CREATE_INVOICE</div>
                &quot;{transcript}&quot;
              </div>
            )}
            {appState === "ERROR" && (
              <div className="text-destructive text-sm font-medium border border-destructive/30 bg-destructive/10 p-4 rounded-xl w-full shadow-sm">
                <div className="text-xs text-destructive/70 uppercase tracking-wider mb-1 font-semibold">Error</div>
                {micError ?? "Something went wrong. Please try again."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col items-center justify-end w-full pb-8 z-10">
        <AudioButton
          state={appState}
          onPressStart={handleStartRecording}
          onPressStop={handleStopRecording}
        />
        <p className="mt-8 text-xs text-muted-foreground font-medium uppercase tracking-widest text-center h-4 transition-all duration-200">
          {statusLabel()}
        </p>
        {appState === "ERROR" && (
          <button
            onClick={() => setAppState("IDLE")}
            className="mt-3 text-xs text-brand underline underline-offset-2"
          >
            Try again
          </button>
        )}
      </div>

    </main>
  );
}
