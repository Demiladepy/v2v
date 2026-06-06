"use client";

import { Home, Wallet, Coffee, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type NavTab = "HOME" | "LEDGER" | "CAFE" | "PROFILE";

interface BottomNavProps {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "HOME", label: "Voice", icon: <Home className="w-5 h-5" /> },
    { id: "LEDGER", label: "Ledger", icon: <Wallet className="w-5 h-5" /> },
    { id: "CAFE", label: "Café One", icon: <Coffee className="w-5 h-5" /> },
    { id: "PROFILE", label: "Profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pb-safe pointer-events-none">
      <div className="flex items-center justify-between p-2 rounded-full bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-sh-lg pointer-events-auto min-w-[320px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center py-2 px-3 transition-colors duration-300 rounded-full",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-brand rounded-full shadow-sh"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-xs font-semibold whitespace-nowrap"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
