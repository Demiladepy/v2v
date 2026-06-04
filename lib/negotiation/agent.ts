// ==========================================
// Negotiation agent interface + deterministic stub
// ML seam: NEGOTIATION_AGENT_MODE=ml + ML_NEGOTIATION_AGENT_URL
// ==========================================

import type { NegotiationSessionState } from "@/types";

export type NegotiationUserTurn = {
  text: string;
  offer_amount: number;
};

export type NegotiationAgentResponse = {
  reply: string;
  proposedTerms: { amount: number; counterparty: string };
  status: "open" | "agreed" | "failed";
};

export type NegotiationAgent = (
  session: NegotiationSessionState,
  userTurn: NegotiationUserTurn
) => Promise<NegotiationAgentResponse>;

export const stubNegotiationAgent: NegotiationAgent = async (session, userTurn) => {
  const target = session.context.target_amount;
  const offer = userTurn.offer_amount;

  if (offer >= target) {
    return {
      reply: `Agreed at ₦${offer.toLocaleString("en-NG")}.`,
      proposedTerms: {
        amount: offer,
        counterparty: session.context.counterparty,
      },
      status: "agreed",
    };
  }

  const counter = Math.max(Math.round((offer + target) / 2), offer + 1);

  return {
    reply: `Counter offer: ₦${counter.toLocaleString("en-NG")}. Our target is ₦${target.toLocaleString("en-NG")}.`,
    proposedTerms: {
      amount: counter,
      counterparty: session.context.counterparty,
    },
    status: "open",
  };
};

async function mlNegotiationAgent(
  session: NegotiationSessionState,
  userTurn: NegotiationUserTurn
): Promise<NegotiationAgentResponse> {
  const url = process.env.ML_NEGOTIATION_AGENT_URL?.trim();

  if (!url) {
    throw new Error("ML_NEGOTIATION_AGENT_URL is not configured");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session, userTurn }),
  });

  if (!response.ok) {
    throw new Error(`ML negotiation agent returned ${response.status}`);
  }

  return (await response.json()) as NegotiationAgentResponse;
}

export function getNegotiationAgent(): NegotiationAgent {
  const mode =
    process.env.NEGOTIATION_AGENT_MODE?.trim().toLowerCase() ?? "stub";

  if (mode === "ml") {
    return mlNegotiationAgent;
  }

  return stubNegotiationAgent;
}
