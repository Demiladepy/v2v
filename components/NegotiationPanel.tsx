"use client";

import type { ActionResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface NegotiationPanelProps {
  result: Extract<ActionResult, { intent_type: "RUN_NEGOTIATION" }>;
}

export function NegotiationPanel({ result }: NegotiationPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full animate-in zoom-in-95 fade-in duration-300 mt-4 px-2">
      <Card className="bg-card/80 backdrop-blur-xl border-brand/30 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="w-4 h-4 text-brand" />
            Negotiation with {result.proposedTerms.counterparty}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          <div className="rounded-xl bg-muted/40 border border-border/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Agent reply
            </p>
            <p className="text-sm text-foreground">{result.reply}</p>
            <p className="text-sm font-bold text-brand mt-2">
              Proposed: {formatCurrency(result.proposedTerms.amount)}
            </p>
          </div>

          {result.session.turns.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.session.turns.map((turn, index) => (
                <div
                  key={`${turn.at}-${index}`}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    turn.role === "agent"
                      ? "bg-brand/10 text-foreground ml-4"
                      : "bg-muted/60 text-foreground mr-4"
                  }`}
                >
                  <span className="font-semibold capitalize">{turn.role}: </span>
                  {turn.text}
                  {turn.proposed_amount != null && (
                    <span className="block mt-1 font-bold">
                      {formatCurrency(turn.proposed_amount)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
