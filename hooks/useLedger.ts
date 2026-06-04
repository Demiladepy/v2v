"use client";

import { useState, useEffect } from "react";
import { LedgerEntry } from "@/types";

// Mock initial data
const MOCK_ENTRIES: LedgerEntry[] = [
  {
    id: "tx_1",
    merchant_id: "m_1",
    transaction_type: "CREDIT",
    amount: 150000,
    reference: "Coffee supplies - Cafe One",
    status: "SUCCESS",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: "tx_2",
    merchant_id: "m_1",
    transaction_type: "DEBIT",
    amount: 25000,
    reference: "Logistics - Alao",
    status: "SUCCESS",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "tx_3",
    merchant_id: "m_1",
    transaction_type: "CREDIT",
    amount: 80000,
    reference: "Daily sales settlement",
    status: "SUCCESS",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLedger = async () => {
    setIsLoading(true);
    // Simulate network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 800));
    setEntries(MOCK_ENTRIES);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const balance = entries.reduce((acc, entry) => {
    if (entry.status !== "SUCCESS") return acc;
    return entry.transaction_type === "CREDIT" ? acc + entry.amount : acc - entry.amount;
  }, 0);

  return {
    entries,
    balance,
    isLoading,
    refresh: fetchLedger,
  };
}
