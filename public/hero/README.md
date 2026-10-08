# Hero media

The marketing homepage's editorial band (`src/app/page.tsx`) layers a short,
silent, looping clip over a poster image. Six files, in two size tiers:

| file | dimensions | size | role |
|---|---|---|---|
| `hero-poster.jpg` | 1920×1080 | 116K | **the LCP element.** Frame 1 of the clip, so the video cross-fades up from the frame it is about to show. |
| `hero-poster-sm.jpg` | 960×540 | 56K | the same frame for narrow screens, chosen by `srcset`. |
| `hero-1080.webm` | 1920×1080 | 1.2M | wide tier, preferred. |
| `hero-1080.mp4` | 1920×1080 | 2.3M | wide tier, fallback for browsers without WebM. |
| `hero-720.webm` | 1280×720 | 692K | narrow tier, preferred. |
| `hero-720.mp4` | 1280×720 | 1.1M | narrow tier, fallback. |

`HeroVideoLayer` picks the tier by **device pixels**, not CSS pixels: a 390px
phone at DPR 3 needs 1170 real pixels while a 768px tablet at DPR 2 needs 1536,
so a CSS breakpoint would hand the phone the larger file and the tablet the
smaller one. Both files in a tier are the same resolution — when they were not,
a 1280 desktop silently received an 854-wide WebM.

## Why WebM is the preferred source, with hard numbers

Measured as SSIM against the master:

| encode | size | SSIM |
|---|---|---|
| x264 crf 27 (`hero-1080.mp4`) | 2.3M | 0.9637 |
| VP9 crf 42 | 1.5M | 0.9766 |
| **VP9 crf 45 (`hero-1080.webm`)** | **1.2M** | **0.9716** |
| VP9 crf 48 | 908K | 0.9645 |

VP9 at crf 48 matches H.264's quality at 40% of the size. crf 45 was chosen
instead: still inside budget, and measurably *better* than the MP4 fallback,
so the majority of visitors get the better file as well as the smaller one.

Do not guess at these. Re-measure with:

```bash
ffmpeg -nostats -i <encode> -i <master> -lavfi "[0:v][1:v]ssim=stats_file=-" -f null -
```

## Producing them from a raw master

The master this was built from is HEVC, which **Chrome will not play in MP4 on
most platforms** — re-encoding is correctness, not just compression. Put the
master at `public/hero/hero-raw.mp4` and run:

```bash
R=public/hero/hero-raw.mp4

ffmpeg -y -i $R -an -movflags +faststart -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -crf 27 -preset veryslow public/hero/hero-1080.mp4
ffmpeg -y -i $R -an -movflags +faststart -c:v libx264 -profile:v high \
  -pix_fmt yuv420p -crf 28 -preset veryslow -vf "scale=1280:-2" public/hero/hero-720.mp4

ffmpeg -y -i $R -an -c:v libvpx-vp9 -crf 45 -b:v 0 -row-mt 1 public/hero/hero-1080.webm
ffmpeg -y -i $R -an -c:v libvpx-vp9 -crf 45 -b:v 0 -row-mt 1 \
  -vf "scale=1280:-2" public/hero/hero-720.webm

ffmpeg -y -i $R -vframes 1 -q:v 6 public/hero/hero-poster.jpg
ffmpeg -y -i $R -vframes 1 -q:v 5 -vf "scale=960:-2" public/hero/hero-poster-sm.jpg
```

`-an` drops the audio stream rather than muting it: the element is muted
anyway, so a track would be pure weight. `+faststart` moves the moov atom to
the front so playback can begin before the whole file has landed.

Delete `hero-raw.mp4` afterwards — only the derived files are served.

## Budgets

Wide tier ≤2.5M mp4 / ≤1.2M webm, narrow ≤1.2M / ≤700K, posters ≤120K / ≤60K.
The clip is decoration layered on a hero that is already finished without it,
so if a re-encode cannot hit these, lower the quality rather than raise the
budget.

## Removing the media

Set `heroMedia` to `null` in `src/app/page.tsx`. The band falls back to
`bg-hero-mesh`, the hero type flips from light back to the page's dark ink, and
the band stops claiming a full screen. Nothing 404s and nothing breaks — the
media was only ever layered on top of a complete hero.

## Why these files are committed rather than fetched

`CLAUDE.md` records the rule the hard way: a build must not depend on a
third-party network call. `next/font/google` broke three consecutive production
deploys fetching font CSS at build time. Media served out of `public/` is part
of the deployment and cannot fail that way.
