"use client";

import { useState } from "react";
import { AppState, InvoiceLanguage, LLMResponsePayload } from "@/types";
import { AudioButton } from "@/components/AudioButton";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { CafeOneUI } from "@/components/CafeOneUI";
import { ProfileUI } from "@/components/ProfileUI";
import { CheckoutModule } from "@/components/CheckoutModule";
import { InvoiceLanguagePicker } from "@/components/InvoiceLanguagePicker";
import { resolveRecordingFileName } from "@/lib/audio/recording-file";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [activeTab, setActiveTab] = useState<NavTab>("HOME");
  const [intentData, setIntentData] = useState<LLMResponsePayload | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [invoiceLanguage, setInvoiceLanguage] = useState<InvoiceLanguage>("english");

  // Background floating orbs variants
  const floatVariants: Variants = {
    animate1: {
      y: [0, -30, 0],
      x: [0, 20, 0],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
    },
    animate2: {
      y: [0, 40, 0],
      x: [0, -30, 0],
      transition: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }
    }
  };

  const { startRecording, stopRecording, error: micError } = useAudioRecorder();

  const handleStartRecording = async () => {
    setIntentData(null);
    setCheckoutUrl(null);
    setActionError(null);
    const started = await startRecording();
    if (!started) {
      setAppState("ERROR");
      return;
    }
    setAppState("RECORDING");
  };

  const handleStopRecording = async () => {
    setAppState("UPLOADING");

    const blob = await stopRecording();

    if (!blob) {
      setActionError("No audio captured. Hold the button longer while speaking.");
      setAppState("ERROR");
      return;
    }

    setAppState("PARSING");
    
    try {
      const formData = new FormData();
      formData.append("file", blob, resolveRecordingFileName(blob.type));
      formData.append("language", invoiceLanguage);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeApiResult = await res.json();
      if (!transcribeApiResult.ok) {
        throw new Error(transcribeApiResult.error || "Transcription failed");
      }

      const parsed = transcribeApiResult.data as LLMResponsePayload;
      const payload: LLMResponsePayload =
        parsed.intent === "CREATE_INVOICE"
          ? { ...parsed, language: invoiceLanguage }
          : parsed;

      setIntentData(payload);

      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const routerRes = await fetch("/api/financial/router", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const apiResult = await routerRes.json();
      if (!apiResult.ok) {
        throw new Error(apiResult.error || "Processing failed");
      }

      const resultData = apiResult.data;
      if (resultData.authorization_url) {
        setCheckoutUrl(resultData.authorization_url);
      }

      setAppState("SUCCESS");
      // Switch to ledger if it's an invoice to show the checkout module
      if (payload.intent === "CREATE_INVOICE") {
        setTimeout(() => setActiveTab("LEDGER"), 1500);
      }
    } catch (err) {
      console.error(err);
      setActionError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setAppState("ERROR");
    } finally {
      setTimeout(() => setAppState("IDLE"), 2500);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center max-w-md mx-auto w-full min-h-dvh relative overflow-hidden bg-background">
      {/* Floating Background Elements */}
      <motion.div 
        variants={floatVariants}
        animate="animate1"
        className="absolute top-[10%] left-[-20%] w-80 h-80 bg-brand/5 blur-[100px] rounded-full pointer-events-none" 
      />
      <motion.div 
        variants={floatVariants}
        animate="animate2"
        className="absolute bottom-[20%] right-[-20%] w-80 h-80 bg-brand-light/5 blur-[100px] rounded-full pointer-events-none" 
      />

      {/* Dynamic Tab Content */}
      <div className="w-full h-full flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "HOME" && (
            <motion.div
              key="HOME"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full pb-32"
            >
              <div className="flex flex-col items-center space-y-4 mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-serif">V2V Voice</h1>
                <p className="text-muted-foreground text-sm font-medium font-sans">
                  Hold the button to record a command.
                </p>
              </div>

              {/* Contextual Suggestions */}
              <div className="mb-8">
                <InvoiceLanguagePicker
                  value={invoiceLanguage}
                  onChange={setInvoiceLanguage}
                  disabled={appState !== "IDLE" && appState !== "ERROR"}
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-sm">
                <span className="px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded-full border border-brand/20">
                  "Invoice John for ₦15,000"
                </span>
                <span className="px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded-full border border-brand/20">
                  "Check primary balance"
                </span>
                <span className="px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded-full border border-brand/20">
                  "Update my profile"
                </span>
              </div>

              <AudioButton
                state={appState}
                onPressStart={handleStartRecording}
                onPressStop={handleStopRecording}
              />

              {/* Status Message Overlay */}
              <AnimatePresence>
                {appState !== "IDLE" && appState !== "RECORDING" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-8 text-center px-4 h-12 flex items-center justify-center"
                  >
                    <p className="text-sm font-semibold text-muted-foreground font-sans bg-card/80 backdrop-blur-md py-2 px-4 rounded-full inline-block shadow-sm border border-border/50">
                      {appState === "UPLOADING" && "Uploading audio..."}
                      {appState === "PARSING" && "Extracting intent..."}
                      {appState === "SUCCESS" && "Transaction successful"}
                      {appState === "ERROR" && (actionError ?? "Processing failed. Try again.")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "LEDGER" && (
            <motion.div
              key="LEDGER"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 overflow-y-auto"
            >
              {intentData?.intent === "CREATE_INVOICE" && checkoutUrl ? (
                <div className="p-6">
                  <CheckoutModule intent={intentData as any} authorizationUrl={checkoutUrl} />
                </div>
              ) : (
                <FinancialDashboard />
              )}
            </motion.div>
          )}

          {activeTab === "CAFE" && (
            <motion.div
              key="CAFE"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 overflow-y-auto"
            >
              <CafeOneUI />
            </motion.div>
          )}

          {activeTab === "PROFILE" && (
            <motion.div
              key="PROFILE"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 overflow-y-auto"
            >
              <ProfileUI />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
