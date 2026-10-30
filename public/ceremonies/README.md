# Ceremony photographs

One photograph per rite, shown in the pinned ceremony conveyor on the homepage
(`src/components/marketing/ceremony-sequence.tsx`). 640x480 WebP, ~344KB for
all eight, lazy and far below the fold.

Generated with Higgsfield (`nano_banana_pro`), so they are owned assets rather
than hotlinks. That matters here: the demo site still carries 45 hotlinked
`images.unsplash.com` URLs, which is a third-party dependency at RUNTIME — when
it fails, those pages render imageless. These do not have that failure mode.

Each is shot in its own ceremony's colour, matching the tint that
`.ceremony-step:nth-child(n)` sets in `globals.css` and that the page wash runs
on the same eight beats:

| file | rite | tint |
|---|---|---|
| `mehendi.webp` | henna on the bride's hands | `#5a7247` henna green |
| `haldi.webp` | turmeric blessing | `#e0a526` turmeric |
| `sangeet.webp` | the music night | `#b4466f` stage rose |
| `nikkah.webp` | signing the contract | `#1f6b63` teal |
| `muhurtham.webp` | the rites at the sacred fire | `#b03a2e` kumkum red |
| `ceremony.webp` | a garden aisle | `#8e9bb0` slate blue |
| `reception.webp` | the candlelit dinner | `#2d3a63` navy |
| `walima.webp` | the groom's family's banquet | `#a9762f` amber |

Because the colour is already IN each photograph, the `.ceremony-field::after`
glaze over it is deliberately light (26%, gone by 62%). Heavier than that and
eight good photographs turn to mud.

## Replacing one

Keep the basename — `ceremony.image` in `ceremony-sequence.tsx` points at it —
and keep 4:3. The panel is at most 320x288 CSS, so 640x480 is 2x at the largest
size it is ever drawn. Anything larger is wasted bytes on a section that is
eight images deep.
