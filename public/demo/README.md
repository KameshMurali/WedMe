# Demo site imagery

The photographs the seeded KamMonBeginnings demo renders from — hero, Open
Graph card, five story milestones, the event photo and the gallery. Generated
with Higgsfield and committed.

They replaced 45 hotlinks to `images.unsplash.com` across
`src/server/services/demo-site.ts` and `prisma/seed.ts`, which resolved to
eight distinct photos. That was a third-party dependency at RUNTIME — the same
class of mistake as the build-time font and database dependencies CLAUDE.md
documents, except that when this one fails the demo renders imageless, and the
demo is the strongest proof the product has.

| file | used for |
|---|---|
| `hero.webp` | the site hero, and gallery "A frame from our favourite season of life" |
| `og.webp` | the Open Graph card, and the gallery's lead image |
| `met.webp` | story milestone "How we met" (2019), and a gallery frame |
| `trip.webp` | story milestone "Our first trip" (2021) |
| `proposal.webp` | story milestone "The proposal" (2025), and a gallery frame |
| `details.webp` | story milestone "Engagement season" (2026), and a gallery frame |
| `journey.webp` | story milestone "The wedding journey" (2027) |
| `venue.webp` | every event's `imageUrl` — Mehendi, Haldi, Sangeet and the rest |

## Why nobody's face is in them

Five of the eight want a recognisable couple, and eight independent generations
would have produced five different-looking couples — worse than the stock
photos they replaced. So they are shot the way premium wedding sites actually
shoot mood imagery: from behind, in silhouette, hands, details, figures at a
distance. Consistent in photographic language without needing face consistency,
and no uncanny AI faces on a page selling a real couple's wedding.

Keep that if you replace one. Also keep the warm filmic treatment — these read
as one wedding's photo set, and a single sharply-lit stock-looking frame breaks
that.

## Alt text

The alt text in `demo-site.ts` describes these specific images and was rewritten
when they changed. If you swap a photograph, rewrite its alt text in the same
commit — it is read aloud, so an alt describing the previous image is simply
wrong.

## The hero clip

`hero.mp4` — 960x540, H.264 High, yuv420p, no audio track, 438K, 5.8s.

It is driven from `hero.webp`, which is its own opening frame, so the still and
the motion are the same scene and `<video poster>` cross-fades up from the frame
it is about to show. That is the rule `public/hero/README.md` sets for the
marketing hero, and it applies here for the same reason.

**It is a palindrome.** Frames run 1→36 then 35→2, so the slow push-in reverses
out instead of cutting back to the start. A push-in loops badly otherwise —
the jump is the first thing the eye catches on a hero that never stops playing.

Encoded per the recipe in `public/hero/README.md`: `-pix_fmt yuv420p` converts
the HEVC Main 10 master (`yuv420p10le`), `-an` drops the audio rather than
muting it, `+faststart` moves the moov atom so playback can begin before the
whole file lands.

One file rather than the marketing hero's two tiers and two codecs, because
`heroVideoUrl` is a single URL a couple pastes in — there is no `<source>` list
to fall back through, so it has to be the codec every browser takes.

Replacing it: keep it silent, keep it slow, and regenerate `hero.webp` from its
first frame in the same commit, or the poster will show a different moment than
the video opens on.
