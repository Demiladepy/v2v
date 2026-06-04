"use client";

import { AppState } from "@/types";
import { Mic, Square, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (isRecording) return <Square className="w-10 h-10 text-primary-foreground fill-primary-foreground" />;
    if (isProcessing) return <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />;
    if (isSuccess) return <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />;
    if (isError) return <AlertCircle className="w-10 h-10 text-primary-foreground" />;
    return <Mic className="w-10 h-10 text-primary-foreground" />;
  };

  const getBgClass = () => {
    if (isRecording) return "bg-destructive";
    if (isProcessing) return "bg-brand-dark";
    if (isSuccess) return "bg-success";
    if (isError) return "bg-destructive";
    return "bg-brand hover:bg-brand/90";
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Ripple Effect for Recording */}
      {isRecording && (
        <div 
          className="absolute inset-0 rounded-full bg-destructive/30 animate-ping pointer-events-none" 
          style={{ transform: "scale(1.5)", animationDuration: '1.5s' }} 
        />
      )}
      
      {/* Inner Glow Effect for Parsing */}
      {isProcessing && (
        <div 
          className="absolute inset-0 rounded-full bg-brand/40 animate-pulse pointer-events-none" 
          style={{ transform: "scale(1.2)" }} 
        />
      )}
      
      <button
        onPointerDown={isIdle ? onPressStart : undefined}
        onPointerUp={isRecording ? onPressStop : undefined}
        onPointerLeave={isRecording ? onPressStop : undefined}
        className={cn(
          "relative z-10 flex items-center justify-center w-28 h-28 rounded-full shadow-sh-lg transition-all duration-300 ease-out",
          "active:scale-95 touch-none select-none",
          getBgClass()
        )}
        disabled={isProcessing || isSuccess || isError}
        aria-label="Hold to record audio"
      >
        {getIcon()}
      </button>
    </div>
  );
}
