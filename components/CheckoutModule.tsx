"use client";

import { CreateInvoicePayload } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvoiceLanguageLabel } from "@/lib/constants/invoice-languages";
import { sharePaymentLink } from "@/lib/share";
import { Send, FileText, CheckCircle2 } from "lucide-react";

interface CheckoutModuleProps {
  intent: CreateInvoicePayload;
  authorizationUrl: string;
}

export function CheckoutModule({ intent, authorizationUrl }: CheckoutModuleProps) {
  const languageLabel = getInvoiceLanguageLabel(intent.language ?? "english");

  const handleShare = async () => {
    await sharePaymentLink(
      authorizationUrl,
      `Invoice for ${intent.client} - ${intent.memo} (${languageLabel})`
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full animate-in zoom-in-95 fade-in duration-300">
      <Card className="bg-card/80 backdrop-blur-xl border-brand/30 shadow-[0_8px_32px_rgba(37,99,235,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-light via-brand to-brand-dark" />
        
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-success font-semibold tracking-tight">
            <CheckCircle2 className="w-5 h-5" />
            Invoice Generated
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <FileText className="w-4 h-4" /> Billed To
              </span>
              <span className="font-semibold text-foreground text-right">{intent.client}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Amount</span>
              <span className="font-bold text-lg text-brand">{formatCurrency(intent.amount)}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">Memo</span>
              <span className="text-sm text-foreground text-right">{intent.memo}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">Language</span>
              <span className="text-sm text-foreground text-right">{languageLabel}</span>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-3 px-4 bg-brand hover:bg-brand/90 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sh-md hover:shadow-sh-lg"
          >
            <Send className="w-4 h-4" />
            Share Payment Link
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
