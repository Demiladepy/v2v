"use client";

import { AppState } from "@/types";
import { Mic, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AudioButtonProps {
  state: AppState;
  onPressStart: () => void;
  onPressStop: () => void;
}

export function AudioButton({ state, onPressStart, onPressStop }: AudioButtonProps) {
  const isIdle = state === "IDLE";
  const isRecording = state === "RECORDING";
  const isProcessing = state === "UPLOADING" || state === "PARSING";
  const isSuccess = state === "SUCCESS";
  const isError = state === "ERROR";

  const getIcon = () => {
    if (isRecording) {
      // Waveform visualizer simulation
      return (
        <div className="flex items-center justify-center gap-1.5 h-10 w-10">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-primary-foreground rounded-full"
              initial={{ height: "40%" }}
              animate={{ height: ["40%", "100%", "30%", "80%", "40%"] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      );
    }
    if (isProcessing) return <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />;
    if (isSuccess) return <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />;
    if (isError) return <AlertCircle className="w-10 h-10 text-primary-foreground" />;
    return <Mic className="w-10 h-10 text-primary-foreground" />;
  };

  const getBgClass = () => {
    if (isRecording) return "bg-brand";
    if (isProcessing) return "bg-brand-dark";
    if (isSuccess) return "bg-success";
    if (isError) return "bg-destructive";
    return "bg-brand hover:bg-brand/90";
  };

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <AnimatePresence>
        {/* Processing Inner Glow */}
        {isProcessing && (
          <motion.div
            key="processing-glow"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
            className="absolute inset-0 rounded-full bg-brand pointer-events-none"
          />
        )}
      </AnimatePresence>

      <motion.button
        onPointerDown={isIdle ? onPressStart : undefined}
        onPointerUp={isRecording ? onPressStop : undefined}
        onPointerLeave={isRecording ? onPressStop : undefined}
        whileHover={isIdle ? { scale: 1.05 } : {}}
        whileTap={isIdle ? { scale: 0.95 } : {}}
        animate={{ scale: isRecording ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "relative z-10 flex items-center justify-center w-28 h-28 rounded-full shadow-lg transition-colors duration-300 ease-out",
          "touch-none select-none border-4 border-white/20",
          getBgClass()
        )}
        disabled={isProcessing || isSuccess || isError}
        aria-label="Hold to record audio"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center justify-center w-full h-full"
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
