"use client";

import { useLedger } from "@/hooks/useLedger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";

export function FinancialDashboard() {
  const { entries, balance, isLoading } = useLedger();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Balance Card */}
      <Card className="bg-card/60 backdrop-blur-xl border-border shadow-sh-md overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] rounded-full pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Total Operational Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            ) : (
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                {formatCurrency(balance)}
              </h2>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ledger Feed */}
      <Card className="bg-card/60 backdrop-blur-xl border-border shadow-sh-md flex-1">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent transactions
            </div>
          ) : (
            <ul className="flex flex-col">
              {entries.map((entry, idx) => (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                    idx !== entries.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        entry.transaction_type === "CREDIT"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {entry.transaction_type === "CREDIT" ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {entry.reference}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-bold ${
                        entry.transaction_type === "CREDIT" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {entry.transaction_type === "CREDIT" ? "+" : "-"}
                      {formatCurrency(entry.amount)}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {entry.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
