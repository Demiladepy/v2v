"use client";

import { useState } from "react";
import { MapPin, Users, Wifi, Coffee as CoffeeIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ActionResult, LLMResponsePayload } from "@/types";
import { useVoiceAction } from "@/hooks/useVoiceAction";

const WORKSPACES = [
  {
    id: "ws_1",
    name: "Creator Studio",
    location: "Lennox Mall, Lekki",
    price: 15000,
    unit: "per hour",
    capacity: 2,
    status: "Available" as const,
    image: "bg-gradient-to-br from-brand-light to-brand-dark",
  },
  {
    id: "ws_2",
    name: "Executive Meeting Room",
    location: "Yaba, Lagos",
    price: 50000,
    unit: "per day",
    capacity: 8,
    status: "Booked" as const,
    image: "bg-gradient-to-br from-black-muted to-black-faint",
  },
];

interface CafeOneUIProps {
  onBookingComplete?: (
    result: ActionResult,
    payload: LLMResponsePayload
  ) => void;
}

export function CafeOneUI({ onBookingComplete }: CafeOneUIProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const { processVoiceAction } = useVoiceAction();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleBook = async (workspace: (typeof WORKSPACES)[number]) => {
    if (workspace.status !== "Available") return;

    setBookingId(workspace.id);
    setBookingError(null);

    const payload: LLMResponsePayload = {
      intent: "CREATE_INVOICE",
      client: `Cafe One — ${workspace.name}`,
      amount: workspace.price,
      memo: `Workspace booking — ${workspace.name}, ${workspace.location}`,
    };

    try {
      const { actionResult } = await processVoiceAction({
        transcript: `Book ${workspace.name} at Cafe One`,
        parsedIntent: payload,
      });

      onBookingComplete?.(actionResult, payload);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Booking failed. Try again."
      );
    } finally {
      setBookingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-24 pt-2">
      <div className="space-y-1 px-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">Workspace</h2>
        <p className="text-xs text-muted-foreground font-medium font-sans">
          Book a room and settle instantly via Paystack checkout.
        </p>
        {bookingError && (
          <p className="text-xs text-destructive font-medium">{bookingError}</p>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 px-4"
      >
        {WORKSPACES.map((ws) => (
          <motion.div
            variants={itemVariants}
            key={ws.id}
            className="group relative overflow-hidden rounded-2xl bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={`h-28 w-full ${ws.image} relative transition-transform duration-700 group-hover:scale-105`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-3 left-3">
                <div
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md ${
                    ws.status === "Available"
                      ? "bg-success/90 text-white"
                      : "bg-black/60 text-white/90"
                  }`}
                >
                  {ws.status}
                </div>
              </div>
              <div className="absolute bottom-3 left-3 text-white flex items-center gap-1 text-[10px] font-semibold backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded">
                <MapPin className="w-3 h-3" /> {ws.location}
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-foreground leading-tight font-serif">
                  {ws.name}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground mb-3 font-sans">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand" /> {ws.capacity} pax
                </span>
                <span className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-brand" /> Fast
                </span>
                <span className="flex items-center gap-1">
                  <CoffeeIcon className="w-3.5 h-3.5 text-brand" /> Free
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[var(--glass-border)] font-sans">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">{formatCurrency(ws.price)}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{ws.unit}</span>
                </div>
                <button
                  type="button"
                  disabled={ws.status !== "Available" || bookingId === ws.id}
                  onClick={() => handleBook(ws)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90 transition-colors"
                >
                  {bookingId === ws.id ? "Booking..." : ws.status === "Available" ? "Book" : "Unavailable"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
