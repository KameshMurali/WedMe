# Hero media

The marketing homepage's editorial band (`src/app/page.tsx`) layers a short,
silent, looping clip over a poster image. It expects three files here:

| file | what it is |
|---|---|
| `hero-poster.jpg` | frame 1 of the clip. **This is the LCP element** — it is what the band paints first, and the video cross-fades up from it. |
| `hero-1080.mp4` | H.264, `+faststart`, no audio stream. |
| `hero-720.webm` | VP9 at 1280 wide, no audio stream. Browsers that take it get a meaningfully smaller file. |

Then flip `heroMedia` in `src/app/page.tsx` from `null` to those three paths.
It is `null` by default on purpose: pointing the band at files that are not
here yet would ship a homepage firing 404s on every visit, and the band renders
complete without them.

## Producing them from a raw clip

Drop the raw master in this directory as `hero-raw.mp4` and run:

```bash
ffmpeg -y -i public/hero/hero-raw.mp4 -an -movflags +faststart \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow \
  public/hero/hero-1080.mp4

ffmpeg -y -i public/hero/hero-raw.mp4 -an -c:v libvpx-vp9 -crf 36 -b:v 0 \
  -row-mt 1 -vf "scale=1280:-2" public/hero/hero-720.webm

ffmpeg -y -i public/hero/hero-raw.mp4 -vframes 1 -q:v 4 \
  public/hero/hero-poster.jpg
```

`-an` drops the audio stream entirely rather than muting it: the element is
muted anyway, so an audio track is pure weight. `+faststart` moves the moov
atom to the front so playback can begin before the whole file has landed.

Delete `hero-raw.mp4` afterwards — only the three derived files are served, and
the master would otherwise sit in the repository forever.

## Why these files are committed rather than fetched

`CLAUDE.md` records the rule the hard way: a build must not depend on a
third-party network call. `next/font/google` broke three consecutive production
deploys fetching font CSS at build time. Media served out of `public/` is part
of the deployment and cannot fail the same way.

## Budgets

Roughly: mp4 ≤ 2.5MB, webm ≤ 1.2MB, poster ≤ 120KB. The clip is decoration
layered on a hero that is already finished without it, so if a re-encode cannot
hit these, lower the quality rather than raising the budget.
