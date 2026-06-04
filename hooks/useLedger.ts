"use client";

import { useState, useEffect } from "react";
import { LedgerEntry } from "@/types";
import { fetchLedgerData } from "@/app/actions/ledger";

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLedgerData();
      setEntries(data.entries);
      setBalance(data.balance);
    } catch (err) {
      console.error("Failed to fetch ledger", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return {
    entries,
    balance,
    isLoading,
    refresh: fetchLedger,
  };
}
