"use client";

import { useState } from "react";
import { AppState, LLMResponsePayload } from "@/types";
import { AudioButton } from "@/components/AudioButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { CafeOneUI } from "@/components/CafeOneUI";
import { mockTranscribeAPI } from "@/lib/mockTranscribe";
import { CheckoutModule } from "@/components/CheckoutModule";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [transcript, setTranscript] = useState<string>("");
  const [activeTab, setActiveTab] = useState<NavTab>("HOME");
  const [intentData, setIntentData] = useState<LLMResponsePayload | null>(null);

  const { startRecording, stopRecording, error: micError } = useAudioRecorder();

  const handleStartRecording = async () => {
    // Reset previous intent state
    setIntentData(null);
    setTranscript("");

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

    const blob = await stopRecording();

    if (!blob) {
      setAppState("ERROR");
      return;
    }

    setAppState("PARSING");
    
    try {
      // Mock hitting the /api/transcribe endpoint
      const result = await mockTranscribeAPI(blob);
      
      setIntentData(result);
      setAppState("SUCCESS");
      
      if (result.intent === "CREATE_INVOICE") {
        setTranscript(`Invoice ${result.client} ₦${result.amount.toLocaleString()} for ${result.memo}.`);
      } else {
        setTranscript("Intent parsed successfully.");
      }
      
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      
    } catch (err) {
      console.error(err);
      setAppState("ERROR");
    }
  };

  const statusLabel = () => {
    if (appState === "RECORDING") return "Release to Send";
    if (appState === "ERROR" && micError) return micError;
    return "Ready";
  };

  return (
    <main className="flex-1 flex flex-col items-center p-6 max-w-md mx-auto w-full min-h-dvh pb-24 pt-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-64 h-64 bg-info/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full space-y-2 z-10 pt-4 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground text-center">V2V</h1>
        <p className="text-muted-foreground text-center text-sm font-medium">
          Hold the button and speak your request.
        </p>
      </div>

      <div className="w-full flex-1 flex flex-col relative z-10">
        {activeTab === "HOME" && (
          <div className="flex-1 flex flex-col items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Live Action Feed & Checkout Module */}
            <div className="w-full flex flex-col gap-4">
              <Card className="w-full bg-card/60 backdrop-blur-xl border-border shadow-sh-md">
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
                    {appState === "SUCCESS" && intentData && (
                      <div className="text-success text-sm font-medium border border-success/30 bg-success/10 p-4 rounded-xl w-full shadow-sm">
                        <div className="text-xs text-success/70 uppercase tracking-wider mb-1 font-semibold">Intent: {intentData.intent}</div>
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

              {/* Dynamically render Checkout Module if intent is CREATE_INVOICE */}
              {appState === "SUCCESS" && intentData?.intent === "CREATE_INVOICE" && (
                <CheckoutModule intent={intentData} />
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-end w-full pb-8 mt-8">
              <AudioButton
                state={appState}
                onPressStart={handleStartRecording}
                onPressStop={handleStopRecording}
              />
              <p className="mt-8 text-xs text-muted-foreground font-medium uppercase tracking-widest text-center h-4 transition-all duration-200">
                {statusLabel()}
              </p>
              {(appState === "ERROR" || appState === "SUCCESS") && (
                <button
                  onClick={() => {
                    setAppState("IDLE");
                    setIntentData(null);
                  }}
                  className="mt-3 text-xs text-brand underline underline-offset-2"
                >
                  {appState === "SUCCESS" ? "New recording" : "Try again"}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "LEDGER" && <FinancialDashboard />}
        {activeTab === "CAFE" && <CafeOneUI />}
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
