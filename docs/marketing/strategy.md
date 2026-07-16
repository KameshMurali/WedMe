# ToNewBeginning — 90-Day Marketing Strategy

**Written:** July 14, 2026
**Constraints:** Global (all 5 currency markets) · Goal: waitlist + free signups · Budget ≤ $300/mo · Time ~10 hrs/week
**Launch offer deadline:** July 31, 2026 (30% off Forever, first 100 couples) — **17 days away**

---

## 1. Positioning

> **The wedding website builder for Indian & South Asian celebrations.**
> One beautiful site for the whole wedding — Mehendi to Reception — with per-event RSVPs, dress codes, guest photo uploads, and a wishes wall.

**Why this wins:** Zola, Joy, The Knot, and Minted treat a wedding as *one event on one day*. South Asian weddings are 3–5 events over a weekend, each with its own guest list, venue, dress code, and timing. ToNewBeginning is built around that reality — per-event RSVPs (`audience: ALL_GUESTS / FAMILY_ONLY / INVITE_ONLY`), dress code boards per function, and schedules across multiple days.

**One-line elevator pitch:** "No more juggling 10 WhatsApp groups — one site for every ceremony."

**Who we're for (in priority order within the global funnel):**
1. Engaged South Asian couples (India, UAE, US, UK, EU) planning multi-event weddings 3–12 months out
2. The couple's siblings/cousins — often the ones who actually build the site
3. Wedding planners managing multiple South Asian weddings (later: B2B channel)

---

## 2. Funnel Architecture

One global funnel, not five market campaigns. Currency localization already happens automatically on `/pricing` (geo-detected, user-switchable), so a single set of content serves every market.

```
Awareness            Consideration          Activation            Monetization
─────────            ─────────────          ──────────            ────────────
WhatsApp forwards    Demo site              Free Hello signup     Upgrade prompt
Instagram content →  /kammonbeginnings   →  builds real site   →  → waitlist capture
Reddit/FB posts      Pricing page           publishes draft       (founding couple)
Google Search ads
```

**The demo site is the salesperson.** Every piece of content links to `wed.tonewbeginning.com/kammonbeginnings` first, `/register` second. Seeing a finished wedding site converts better than any feature list.

**North-star metrics (check weekly in admin):**
| Metric | Where | 90-day target |
|---|---|---|
| Waitlist signups | Dashboard → Waitlist tab | 100 (founding couples) |
| Free registrations | User count in DB | 300 |
| Published sites | PublishSettings status | 75 (25% of signups) |
| Demo site page views | Analytics events | 5,000 |

---

## 3. Channel Plan (sized to 10 hrs/week)

### A. WhatsApp — primary distribution, $0
The audience lives here. Every family planning a wedding has 5+ active WhatsApp groups.
- Use the 3 message variants in `copy-kit.md` (general, short status, family-forward)
- Ask every early user to forward to one engaged friend — build this ask into the welcome email
- Post the status version on your own WhatsApp status weekly
- **Time: 30 min/week**

### B. Instagram — content engine, $200/mo boost budget
3 posts/week, batched in one sitting. Wedding content is inherently visual and shareable; the templates ARE the content.
- **Content mix (see calendar below):** template showcases (screen recordings of the 5 themes), feature explainers ("RSVP per event, finally"), planning pain-point memes, demo-site walkthroughs
- **Boosting:** $50/week on the best-performing post of the prior week. Targeting: engaged status + South Asian interest clusters (Bollywood, mehendi, sangeet, desi wedding) across IN/AE/US/UK/EU
- **Hashtag base:** #indianwedding #desiwedding #sangeet #mehendi #weddingwebsite #shaadi #nikkah #southasianwedding
- **Time: 3 hrs/week** (2 hrs batching Sunday, 1 hr engagement weekdays)

### C. Reddit & Facebook communities — trust building, $0
Value-first, never link-first. Answer planning questions; mention the tool only when directly relevant.
- Subreddits: r/IndianWeddings, r/weddingplanning, r/ABCDesis, r/DesiWeddings
- FB groups: search "Indian wedding planning [city]" — join 10 across Mumbai, Delhi, Dubai, London, NJ/Bay Area, Toronto
- Cadence: 2 helpful comments/answers per week, 1 soft mention per month per community max
- Post templates in `copy-kit.md`
- **Time: 1.5 hrs/week**

### D. Google Search — high-intent capture, $100/mo
Long-tail keywords where the big US players don't compete:
- "indian wedding website with rsvp"
- "sangeet invitation website"
- "mehendi rsvp online"
- "wedding website multiple events"
- "muslim wedding website nikah walima"
- Landing page: homepage (already positions "Indian celebrations" above the fold)
- **Time: 30 min/week** monitoring after 1 hr initial setup

### E. SEO groundwork — compounding asset, $0
5 article briefs (write 1 every 2 weeks, ~800 words each):
1. "How to collect RSVPs for a multi-event Indian wedding (without 10 spreadsheets)"
2. "Sangeet, Mehendi, Haldi: explaining your ceremonies to non-desi guests" (links to demo tidbits section)
3. "Wedding website checklist for South Asian couples: 12 things guests actually look for"
4. "How to share dress codes for each wedding function (with examples)"
5. "Wedding photo sharing: getting guest photos after each ceremony"
- **Time: 2 hrs/week** (alternating: write one week, distribute the next)

### F. Micro-influencer seeding — $0–50/mo experiments
DM 5 nano wedding-content creators (2k–20k followers, engaged themselves or wedding adjacent) per month. Offer: free **Forever** plan for their own wedding in exchange for one honest story/reel. Cost is $0 cash; product cost only.
- **Time: 30 min/week**

### Weekly rhythm (total ≈ 9.5 hrs)
| Day | Block | Time |
|---|---|---|
| Sunday | Batch 3 IG posts + schedule | 2h |
| Mon–Fri | IG engagement (10 min/day) | 1h |
| Tuesday | Reddit/FB community presence | 1.5h |
| Wednesday | SEO article (write or distribute) | 2h |
| Thursday | Influencer DMs + WhatsApp pushes | 1h |
| Friday | Boost best post, check Google Ads, record metrics | 1h |
| Saturday | Reply to signups personally (founder touch) | 1h |

### Budget ($300/mo ceiling)
| Item | Monthly |
|---|---|
| Instagram boosts ($50/wk) | $200 |
| Google Search ads | $100 |
| **Total** | **$300** |

---

## 4. Campaign #1: "Founding 100" (July 14–31)

The launch offer (30% off Forever) expires July 31 — this is the first campaign's built-in urgency.

- **Message:** "The first 100 couples get Forever — lifetime hosting, concierge setup — at 30% off. ₹5,599 / $69 / £55 / €62 / AED 251, once, forever."
- **Mechanics:** all channels point to `/pricing` where the offer pill + waitlist capture already exist
- **Cadence:** WhatsApp push week 1, IG countdown posts at 10 / 5 / 2 / 1 days left (copy in `copy-kit.md`), boost the day-5 post
- **After July 31:** either extend with a new date in `launchOffer.endsAt` (`src/lib/pricing.ts`) or let it lapse and move to evergreen messaging — scarcity only works if it's real, so lapse is recommended if traction is decent

---

## 5. 90-Day Arc

| Phase | Weeks | Focus |
|---|---|---|
| **Ignite** | 1–3 (to Jul 31) | Founding 100 campaign, WhatsApp blitz, IG account launch, ads live |
| **Learn** | 4–8 | Double down on best channel by CAC-per-signup; publish articles 1–3; influencer seeds |
| **Compound** | 9–13 | SEO articles 4–5, testimonial content from real couples, referral ask in product emails, decide Stripe timing based on waitlist size |

**Decision gate (week 8):** if waitlist ≥ 60, wire Stripe and email the waitlist a real founding-couple checkout link. The waitlist email list is the first revenue event.

---

## 6. Product Conversion Levers (recommendations — no code changes yet)

Found while auditing the codebase; each is a small change with outsized marketing impact:

1. **OG image for WhatsApp link previews** — the homepage has no dedicated OG image. Every WhatsApp forward renders a preview card; a beautiful one materially lifts click-through. (Add `openGraph.images` to root layout metadata.)
2. **"Powered by ToNewBeginning" footer link on free-tier public sites** — every guest of every free wedding becomes an impression. This is the classic viral loop (Linktree, Typeform). The footer in `site-shell.tsx` currently has no platform link.
3. **Referral hook in the welcome email** — "know another couple getting married? Give them a month of Together" (once Stripe exists).
4. **Public template gallery page** (`/templates`) — SEO target for "wedding website templates indian" and a shareable link for IG bio.
5. **Waitlist confirmation email** — currently signups go into the DB silently; a warm confirmation email ("you're founding couple #37") deepens commitment and is forwardable.

---

## 7. What NOT to do (discipline list)

- No paid ads beyond $300 until CAC per free signup is known
- No Pinterest/TikTok/YouTube yet — each is a real channel but none fits inside 10 hrs/week alongside the above; revisit at week 13
- No wedding fair/expo spend — high cost, wrong stage
- No per-market localized campaigns — the product localizes currency automatically; content stays in English (the diaspora's planning language) until data says otherwise
