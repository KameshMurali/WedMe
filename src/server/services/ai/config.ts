import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { env } from "@/lib/env";

// Feature flag: the whole AI drafting surface hangs off the presence of the
// key. No key ⇒ dashboard pages hide the buttons and the server action returns
// a friendly error — nothing ever throws at import time.
export const aiDraftingEnabled = Boolean(env.ANTHROPIC_API_KEY);

// Burst abuse guard (per user, per minute) — deliberately hardcoded; the
// owner-tunable knob is the daily cap (env.AI_DRAFT_DAILY_LIMIT).
export const AI_DRAFT_BURST_LIMIT = 8;
export const AI_DRAFT_BURST_WINDOW_MS = 60_000;
export const AI_DRAFT_DAILY_WINDOW_MS = 86_400_000;
export const AI_DRAFT_DAILY_ACTION = "ai_draft_daily";
export const AI_DRAFT_BURST_ACTION = "ai_draft_burst";

// Lazily instantiate the client (mirrors the getResend() pattern in
// email.ts) so a missing key never breaks module import in dev.
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error("AI drafting is enabled, but ANTHROPIC_API_KEY is missing.");
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      // The SDK default is 2, so every unit of quota a user spends could become
      // three billed upstream requests, and the 15s timeout in draft.ts applies
      // per attempt rather than to the call as a whole. One retry absorbs a
      // genuine blip; beyond that the user can press the button again, which
      // costs them quota rather than costing us silently.
      maxRetries: 1,
    });
  }
  return anthropicClient;
}
