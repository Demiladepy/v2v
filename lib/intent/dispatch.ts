import type { ActionResult, NegotiationTurn } from "@/types";
import type { ParsedIntent } from "@/lib/validations/parsed-intent";
import { getBalance } from "@/lib/db/ledger";
import {
  createNegotiationSession,
  getOpenNegotiationSession,
  saveNegotiationSession,
} from "@/lib/db/negotiations";
import { getNegotiationAgent } from "@/lib/negotiation/agent";
import { routeFinancialIntent } from "@/lib/server/financial-router";

async function dispatchCreateInvoice(
  intent: Extract<ParsedIntent, { intent_type: "CREATE_INVOICE" }>,
  merchantId: string,
  idempotencyHeader?: string | null
): Promise<ActionResult> {
  const result = await routeFinancialIntent(
    {
      intent: "CREATE_INVOICE",
      client: intent.client,
      amount: intent.amount,
      memo: intent.memo,
    },
    merchantId,
    { idempotencyHeader }
  );

  return {
    intent_type: "CREATE_INVOICE",
    message: result.message,
    authorization_url: result.authorization_url ?? "",
    reference: result.reference ?? "",
  };
}

async function dispatchCheckBalance(
  intent: Extract<ParsedIntent, { intent_type: "CHECK_BALANCE" }>,
  merchantId: string
): Promise<ActionResult> {
  const balance = await getBalance(merchantId);

  return {
    intent_type: "CHECK_BALANCE",
    message: `Balance for ${intent.account_type}: ₦${balance.ngn.toLocaleString("en-NG")} (${balance.kobo} kobo settled).`,
    balance,
  };
}

async function dispatchRunNegotiation(
  intent: Extract<ParsedIntent, { intent_type: "RUN_NEGOTIATION" }>,
  merchantId: string,
  transcript: string
): Promise<ActionResult> {
  let session =
    (await getOpenNegotiationSession(merchantId, intent.counterparty)) ??
    (await createNegotiationSession(merchantId, {
      counterparty: intent.counterparty,
      target_amount: Math.round(intent.requested_amount * 1.5),
    }));

  const userTurn: NegotiationTurn = {
    role: "user",
    text: transcript,
    proposed_amount: intent.requested_amount,
    at: new Date().toISOString(),
  };

  session = {
    ...session,
    turns: [...session.turns, userTurn],
    context: {
      ...session.context,
      last_offer: intent.requested_amount,
    },
  };

  const agent = getNegotiationAgent();
  const agentResponse = await agent(session, {
    text: transcript,
    offer_amount: intent.requested_amount,
  });

  const agentTurn: NegotiationTurn = {
    role: "agent",
    text: agentResponse.reply,
    proposed_amount: agentResponse.proposedTerms.amount,
    at: new Date().toISOString(),
  };

  session = {
    ...session,
    status: agentResponse.status,
    turns: [...session.turns, agentTurn],
    context: {
      ...session.context,
      last_offer: agentResponse.proposedTerms.amount,
      ...(agentResponse.status === "agreed"
        ? { agreed_amount: agentResponse.proposedTerms.amount }
        : {}),
    },
  };

  session = await saveNegotiationSession(session);

  return {
    intent_type: "RUN_NEGOTIATION",
    message: agentResponse.reply,
    reply: agentResponse.reply,
    proposedTerms: agentResponse.proposedTerms,
    session,
  };
}

export async function dispatchIntent(
  parsed: ParsedIntent,
  merchantId: string,
  transcript: string,
  options?: { idempotencyHeader?: string | null }
): Promise<ActionResult> {
  switch (parsed.intent_type) {
    case "CREATE_INVOICE":
      return dispatchCreateInvoice(
        parsed,
        merchantId,
        options?.idempotencyHeader
      );
    case "CHECK_BALANCE":
      return dispatchCheckBalance(parsed, merchantId);
    case "RUN_NEGOTIATION":
      return dispatchRunNegotiation(parsed, merchantId, transcript);
    default: {
      const _exhaustive: never = parsed;
      return _exhaustive;
    }
  }
}
