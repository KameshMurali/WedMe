# Template previews

One 16:9 WebP per design, shown by the homepage grid (`src/app/page.tsx`) and
the `/templates` index. ~230KB for all sixteen.

## Regenerating

These are captured from the live `/templates/{key}` pages, so they go stale
whenever a design changes. To redo them:

```bash
npx next build          # a FRESH build
npx next start -p 3400  # exactly ONE server
node --experimental-strip-types shots.mjs
```

Both of those conditions matter, and neither is pedantry.

**A fresh build.** A `next build` replaces `.next/static` wholesale and mints
new chunk hashes. A `next start` already serving from that directory keeps
handing out HTML that points at stylesheets which no longer exist, so pages
render completely unstyled while still answering HTTP 200. The first run of
this script produced sixteen unstyled screenshots that way — Times serif, blue
underlined links, ornaments as grey blobs — and nothing automated caught it,
because the files existed and the `<img>` tags loaded. `shots.mjs` now asserts
that `--primary` resolved before it will shoot, so that failure is loud.

**One server.** Same reason: a second build for a second port is what replaced
the first server's assets.

## Framing

Each shot is the hero section only. The marketing band above it is page
scaffolding, and the site header is `position: sticky` — it cannot be scrolled
past, and it looks near-identical across all sixteen, so including it spent 40%
of every thumbnail on the part that does not distinguish them.

The frame is sized per design rather than cropped to a fixed box. The couple's
names land 277px down on `minimal-luxury` and 854px down on `kolam-blush`,
because the ornament designs carry a monogram arch above the names. So the
script measures the height each composition needs and widens the viewport until
that height is 16:9. The layout is centred in `max-w-7xl`, so a wider viewport
adds margin instead of reflowing the design.

## Why files at all

The previews used to be CSS gradients — sixteen colour swatches standing in for
sixteen designs, which is the least persuasive possible representation of the
product's clearest differentiator. The gradient survives as each `<img>`'s
background, so it is still what a reader sees while the file loads or if one
404s.
