// ==========================================
// V2V Shared Types & Interfaces
// These ensure all agents agree on data structures.
// ==========================================

export type IntentType = "CREATE_INVOICE" | "CHECK_BALANCE" | "RUN_NEGOTIATION" | "UNKNOWN";

export type InvoiceLanguage = "english" | "yoruba" | "pidgin";

export interface CreateInvoicePayload {
  intent: "CREATE_INVOICE";
  client: string;
  amount: number;
  memo: string;
  language?: InvoiceLanguage;
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

// ==========================================
// Voice → Action (Day 4)
// ==========================================
export interface NegotiationTurn {
  role: "user" | "agent";
  text: string;
  proposed_amount?: number;
  at: string;
}

export interface NegotiationSessionState {
  id: string;
  merchant_id: string;
  status: "open" | "agreed" | "failed";
  context: {
    counterparty: string;
    target_amount: number;
    last_offer?: number;
    agreed_amount?: number;
    [key: string]: unknown;
  };
  turns: NegotiationTurn[];
  created_at: string;
  updated_at: string;
}

export type ActionResult =
  | {
      intent_type: "CREATE_INVOICE";
      message: string;
      authorization_url: string;
      reference: string;
    }
  | {
      intent_type: "CHECK_BALANCE";
      message: string;
      balance: { kobo: number; ngn: number; currency: string };
    }
  | {
      intent_type: "RUN_NEGOTIATION";
      message: string;
      reply: string;
      proposedTerms: { amount: number; counterparty: string };
      session: NegotiationSessionState;
    };
