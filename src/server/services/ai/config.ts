import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { env } from "@/lib/env";

// Feature flag: the whole AI drafting surface hangs off the presence of the
// key. No key ⇒ dashboard pages hide the buttons and the server action returns
// a friendly error — nothing ever throws at import time.
export const aiDraftingEnabled = Boolean(env.ANTHROPIC_API_KEY);

// Lazily instantiate the client (mirrors the getResend() pattern in
// email.ts) so a missing key never breaks module import in dev.
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("AI drafting is enabled, but ANTHROPIC_API_KEY is missing.");
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}
