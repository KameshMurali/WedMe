# Product Backlog

## Tier 2 — AI-Assisted Content (revisit after Stripe)

Parked on 2026-07-15. Tier 1 (deterministic readiness score + pre-publish gate + workspace
feedback) shipped first; this layer generates the *content* those checks flag as missing.
Positioned as a **Forever-plan perk** — the plan already promises "AI-assisted content &
translations" in its highlights (`src/lib/pricing.ts`).

### Items

1. **AI story drafts** — couple answers 3 short questions (how you met, the proposal, what
   you love about each other); Claude drafts the story milestones. Entry point: the
   "Tell your story" readiness item when `storyCount === 0`.
2. **Auto-draft FAQs & tidbits from event data** — e.g. a `FAMILY_ONLY` Haldi generates a
   suggested FAQ ("Is the Haldi open to all guests?"); venue addresses generate travel
   tidbits. Entry point: content editor empty states.
3. **Tamil / Hindi translations** — guest-facing text translated per section, stored
   alongside the original. Big differentiator for mixed-language guest lists.
4. **Tone-matched rewrite** — "make this warmer / shorter / more formal" on any text field.

### Implementation notes

- Use the Claude API (`claude-sonnet-5` for drafts; consider `claude-haiku-4-5-20251001`
  for short rewrites). Server-side only — route through a server action; never expose the
  API key client-side. Add `ANTHROPIC_API_KEY` to `src/lib/env.ts`.
- Gate by plan: check workspace plan key via `src/server/services/plan.ts`.
- Rate-limit generation per workspace (reuse `RateLimitBucket`).
- Readiness items in `src/lib/readiness.ts` get an optional `aiAssist?: boolean` flag so the
  dashboard card can show a "Draft it for me" button next to eligible checks.

### Decision gate

Wire Stripe first (waitlist ≥ 60 per strategy doc). Then scope item 1 as the pilot — it has
the clearest UX and the highest wow-factor per token.

---

## Other parked items

- OG image for WhatsApp link previews (homepage metadata) — small, high leverage for the
  marketing push; see `docs/marketing/strategy.md` §6
- "Powered by ToNewBeginning" footer link on free-tier public sites (growth loop)
- Waitlist confirmation email ("you're founding couple #N")
- Referral hook in welcome email (post-Stripe)
- Public template gallery page at `/templates` (SEO + IG bio link)
