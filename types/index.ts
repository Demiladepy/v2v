// ==========================================
// V2V Shared Types & Interfaces
// These ensure all agents agree on data structures.
// ==========================================

export type IntentType = "CREATE_INVOICE" | "CHECK_BALANCE" | "RUN_NEGOTIATION" | "UNKNOWN";

export interface CreateInvoicePayload {
  intent: "CREATE_INVOICE";
  client: string;
  amount: number;
  memo: string;
}

export interface CheckBalancePayload {
  intent: "CHECK_BALANCE";
  account_type: "high_yield_sub_account" | "primary" | string;
}

export interface RunNegotiationPayload {
  intent: "RUN_NEGOTIATION";
  counterparty: string;
  requested_amount: number;
}

export type LLMResponsePayload = 
  | CreateInvoicePayload 
  | CheckBalancePayload 
  | RunNegotiationPayload;

// ==========================================
// Frontend / UI State Types
// ==========================================
export type AppState = 
  | "IDLE" 
  | "RECORDING" 
  | "UPLOADING" 
  | "PARSING" 
  | "SUCCESS" 
  | "ERROR";

// ==========================================
// Database Ledger Type (Simulated Access Bank)
// ==========================================
export interface LedgerEntry {
  id: string;
  merchant_id: string;
  transaction_type: "CREDIT" | "DEBIT";
  amount: number;
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  created_at: string;
}
