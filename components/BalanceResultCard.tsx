"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface BalanceResultCardProps {
  message: string;
  balance: { kobo: number; ngn: number; currency: string };
}

export function BalanceResultCard({ message, balance }: BalanceResultCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full animate-in zoom-in-95 fade-in duration-300 p-6 pb-0">
      <Card className="bg-card/80 backdrop-blur-xl border-brand/30 shadow-[0_8px_32px_rgba(37,99,235,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-light via-brand to-brand-dark" />

        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground font-semibold tracking-tight">
            <Wallet className="w-5 h-5 text-brand" />
            Balance Check
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <p className="text-3xl font-bold text-foreground font-serif">
            {formatCurrency(balance.ngn)}
          </p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
