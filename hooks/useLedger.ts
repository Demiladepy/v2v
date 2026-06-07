"use client";

import { useState, useEffect, useCallback } from "react";
import { LedgerEntry } from "@/types";
import { fetchLedgerData } from "@/app/actions/ledger";

export function useLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLedgerData();
      setEntries(data.entries);
      setBalance(data.balance);
    } catch (err) {
      console.error("Failed to fetch ledger", err);
      setError(
        err instanceof Error ? err.message : "Failed to load ledger"
      );
      setEntries([]);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    entries,
    balance,
    isLoading,
    error,
    refresh: fetchLedger,
  };
}
