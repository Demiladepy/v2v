"use client";

import { useLedger } from "@/hooks/useLedger";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export function FinancialDashboard() {
  const { entries, balance, isLoading } = useLedger();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full flex flex-col gap-4 pb-24 pt-2">
      {/* Balance Section */}
      <div className="px-4 py-4 relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 blur-[60px] rounded-full pointer-events-none" />
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 font-sans">
          Total Operational Balance
        </h3>
        <div className="flex items-center justify-between min-h-[40px]">
          {isLoading ? (
            <div className="h-10 w-32 bg-muted/60 rounded-lg animate-pulse" />
          ) : (
            <motion.h2 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold tracking-tight text-foreground font-serif"
            >
              {formatCurrency(balance || 0)}
            </motion.h2>
          )}
        </div>
      </div>

      {/* Ledger Feed */}
      <div className="flex-1 bg-[var(--glass-bg)] backdrop-blur-2xl rounded-t-3xl border border-[var(--glass-border)] shadow-sh-md p-4 min-h-[50vh]">
        <div className="pb-4 pt-2 flex justify-between items-center sticky top-0 bg-transparent z-10">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest font-sans">
            Recent Transactions
          </h3>
        </div>
        
        <div className="pt-2">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-4 rounded-full bg-muted/60 animate-pulse w-9 h-9" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-muted/60 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-muted/60 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground italic font-sans">
              No recent transactions
            </div>
          ) : (
            <motion.ul 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2 font-sans"
            >
              {entries.map((entry) => (
                <motion.li
                  variants={itemVariants}
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group border border-transparent hover:border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-105 ${
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
                      <span className="text-sm font-semibold text-foreground leading-tight">
                        {entry.reference}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
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
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-1">
                      {entry.status}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
}
