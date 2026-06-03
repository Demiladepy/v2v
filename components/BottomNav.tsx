"use client";

import { Home, Wallet, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavTab = "HOME" | "LEDGER" | "CAFE";

interface BottomNavProps {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "HOME", label: "Voice", icon: <Home className="w-6 h-6" /> },
    { id: "LEDGER", label: "Ledger", icon: <Wallet className="w-6 h-6" /> },
    { id: "CAFE", label: "Café One", icon: <Coffee className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around w-full max-w-md mx-auto p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 px-1 transition-colors duration-200",
                isActive ? "text-brand" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isActive ? "bg-brand/10 scale-110" : "scale-100"
                )}
              >
                {tab.icon}
              </div>
              <span className={cn("text-[10px] mt-1 font-medium", isActive ? "font-bold" : "")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
