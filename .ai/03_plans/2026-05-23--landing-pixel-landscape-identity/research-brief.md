# SlateCamp landing pixel-landscape identity research brief

**Date:** 2026-05-23
**Status:** Research / no-code direction
**Scope:** SlateCamp public landing visual identity, especially first viewport and reusable brand atmosphere.
**Inputs inspected:** user-provided visual references, live local SlateCamp landing at `http://localhost:3001/`, `src/components/marketing/HeroSection.tsx`, `src/components/marketing/hero/AtlasFieldHero.tsx`, `DESIGN.md`, and existing 2026-05-07 landing direction docs.

---

## 1. Direct read of the user references

### Reference 1 — aerial field + drone HUD card

- Aerial agricultural/terrain image with strong field-row texture and diagonal land boundaries.
- Floating white rounded HUD card labeled like a drone/flight interface: `Aero X-01`, `1202 Speed`, `7m/s Wind`, `Altitude: 1202`.
- Radar/crosshair linework overlays the landscape.
- Palette: olive, moss, dark green, muted gold; extracted dominant colors around `#5C5625`, `#9D8C27`, `#43481D`, `#606B14`, `#2A3715`.
- Brand lesson: real landscape becomes technical when seen through measurement, scan, altitude, and navigation overlays.

### Reference 2 — green landscape collage/HUD

- Square-format image made of repeated chopped landscape panels.
- Deep green monochrome terrain/hill texture, segmented into vertical and rectangular slices.
- Thin yellow HUD marks: arrows, dots, crosshair, box target, `POINT`, `MAX`, `TEST DRIVE`, `MODE`, `pg.4`.
- Palette: compressed greens around `#165424`, `#114825`, `#22712A`, `#136129`.
- Brand lesson: the identity comes from **fragmented terrain + technical annotations**, not generic illustration.

### Reference 3 — editorial stripe poster

- Poster-like landscape background with large vertical stretched stripe blocks occupying the left/middle.
- White editorial type: `The pieces are coming together.`
- Top corner metadata: studio/name; bottom mark: `//design`.
- Palette: green stripes with light/dark bands; dominant around `#308450`, `#1A6D42`, `#195C3C`, `#609D6A`, `#8CB983`.
- Brand lesson: landscape can be abstracted into material strips, like scanned terrain, data bars, or construction sample cores.

### Reference 4 — dense cross-grid mosaic

- Full-frame pattern of small plus/cross/grid marks over a mottled green/blue/yellow field.
- Reads as textile, cross-stitch, halftone, cartographic layer, or pixel terrain.
- Palette: brighter vegetation/blue-green tones around `#3D9653`, `#209169`, `#5CA754`, `#49A85F`, `#1A744D`.
- Brand lesson: a repeated architectural mark can replace ordinary dots; the pattern can become a SlateCamp-specific texture.

### Reference 5 — landscape behind square perforated screen

- Real outdoor landscape visible through a regular grid of square blocks/perforations.
- Distant mountains and forest; the square overlay darkens/abstracts the view.
- The blocks are uniform, like a facade screen, pixel mask, survey grid, or solar/mesh field.
- Palette: cool sky/blue-gray plus forest greens: `#5F7984`, `#576241`, `#DCF0F9`, `#233823`, `#14221E`, `#A3BACF`.
- Brand lesson: strongest bridge to architecture: landscape + facade/screen/grid becomes both spatial and digital.

---

## 2. Pattern synthesis

The references are not cute pixel art. They are closer to:

- architectural screens and perforated facades;
- drone/site-survey HUDs;
- GIS/cartographic overlays;
- construction/landscape measurement systems;
- editorial collage made from real terrain;
- low-resolution masks, slices, and data fields.

The shared visual grammar is:

1. **Real place first:** field, hills, trees, sky, mountains, construction/site context.
2. **Abstraction second:** pixel blocks, slices, stretched stripes, cropped panels, scanline distortions.
3. **Technical proof third:** crosshairs, arrows, coordinates, dotted routes, labels, small uppercase metadata.
4. **Limited palette:** mostly green/slate/fog with one signal color.
5. **Editorial restraint:** large simple type over complex but controlled texture.

For SlateCamp, this can become an ownable identity: **a Philippine architecture study atlas seen through site-survey, facade-screen, and field-note overlays.**

---

## 3. Current landing diagnosis

Current local hero at `http://localhost:3001/` already has several strong pieces:

- Large confident H1: `Know you’ll win.`
- Architecture-specific support copy naming PD 1096, RA 9514, BP 344.
- 3D lot/rule-check product proof.
- Faint scenic background and dotted atlas field.
- Feature-preview strip and hand-drawn annotation treatment.

But the current visual identity still reads partly as **polished education/SaaS with architecture-specific content** rather than an unmistakable SlateCamp brand world.

Main gaps:

1. The landscape layer is too faint to become a memorable brand asset.
2. The dotted atlas field is useful, but generic dots alone are not distinctive enough.
3. The product proof is relevant, but the first viewport has many small floating UI fragments competing for attention.
4. The page does not yet fully use the `Camp + Atlas + Architecture` metaphor as a visible terrain/map system.

---

## 4. Proposed brand direction

### Working name

**SlateCamp Site Atlas**

### One-sentence direction

Turn the landing page into a **site-survey atlas**: Philippine architecture review material, code rules, quizzes, weak topics, and 3D models appear as mapped overlays across pixel-cut landscape and architectural screen textures.

### Emotional goal

The page should feel like:

- a calm field guide;
- a site survey becoming understandable;
- a study map emerging from fog;
- architecture review as terrain you can navigate;
- serious, technical, Filipino architecture-specific, but not cold.

It should not feel like:

- generic SaaS dashboard;
- cute pixel game;
- construction-company website;
- stock-photo edtech;
- noisy GIS/CAD cockpit.

---

## 5. Visual system components

### A. Pixel landscape mask

Use a real or generated landscape/site/construction image as an atmospheric layer, then process it with:

- square perforation mask;
- blocky pixel reveal;
- irregular rectangular cutouts;
- vertical terrain-stripe sampling;
- low-res crop grid;
- scanline/halftone grain.

This should be subtle behind copy and more visible in product-proof areas.

### B. Architecture-native grid mark

Replace or supplement ordinary dotted fields with one branded mark family:

- square pixels;
- small crosses/plus signs;
- facade perforations;
- drafting registration marks;
- survey stakes/points;
- lot-grid cells.

Reference 4 suggests a cross-grid could become a memorable SlateCamp background texture if restrained.

### C. Site-survey annotations

Use thin technical linework, not decorative blobs:

- arrows;
- target boxes;
- lot/site boundaries;
- contour lines;
- coordinate ticks;
- route/path lines;
- `PD 1096`, `RA 9514`, `BP 344` as small map labels;
- subject-zone labels: `Planning`, `Egress`, `Accessibility`, `Fire`, `Setbacks`, `Utilities`.

### D. Editorial cutouts

Use clipped product/learning artifacts over the landscape:

- quiz question card as a field note;
- code/table excerpt as a pinned source sheet;
- 3D lot model as a transparent acetate overlay;
- weak-topic marker as a route pin;
- study next-step card as a checkpoint.

### E. Signal color discipline

Base palette:

- Slate / ink: existing `#1A2332` and dark blue-gray variants.
- Camp Cobalt: existing `#1B3FC4` for primary actions and selected states.
- Pine/field green: muted, not neon; use from references as atmosphere, not primary UI token.
- Camp Orange: existing `#E8853A` for annotation/route/checkpoint warmth.
- Fog/sky gray: soft light background and scrims.

Do not turn the app into a green theme. Use green mostly as image/texture atmosphere; keep SlateCamp tokens for UI control states.

---

## 6. Hero composition options

### Option 1 — Light Site Atlas evolution

Keep the current light hero but strengthen the brand field.

- Increase landscape visibility modestly while protecting text with a scrim.
- Replace some dotted field with square/perforated/cross-grid masks.
- Make one diagonal/contour route line connect the hero proof elements.
- Give the 3D lot model a stronger role as the “site proof” object.
- Reduce generic floating-card feel by making cards look like field-note overlays.

Best if we want minimal disruption to current approved light direction.

### Option 2 — Split editorial atlas

Use the left copy column on a clean protected surface; the right side becomes a dense collage of pixel landscape + code/quiz/3D cutouts.

- Left: H1, support, CTA.
- Right/full background: pixel-cut landscape with architectural screen mask.
- Product proof appears as a clear vertical route: rule → visual → question → next topic.

Best if we want a more visibly branded first impression without going fully dark.

### Option 3 — Dark camp/site survey hero

Switch to a darker cinematic hero: charcoal/slate background, luminous green/blue terrain grid, warm orange annotation points.

- Stronger atmosphere and memorability.
- More premium/world-like, but higher risk for legibility and existing brand continuity.
- Requires stronger QA for contrast, reduced motion, and product proof readability.

Best for a larger visual reset only after a visual board is approved.

---

## 7. Recommended direction

Start with **Option 1.5: Light Site Atlas with stronger pixel-landscape identity**.

Reason:

- It respects the existing SlateCamp light atlas direction and current code structure.
- It directly answers the brand-identity gap.
- It avoids a risky full dark redesign.
- It lets us test the user's references as a system: square masks, cross-grid texture, terrain slices, and survey annotations.

Implementation should be preceded by a no-code visual board/mockup pass. Do not jump directly into production code.

---

## 8. Practical implementation ideas for a later code pass

No code changes in this research pass, but likely production touchpoints are:

- `src/components/marketing/HeroSection.tsx`
  - `HeroBackground`
  - halftone/pixel overlay layers
  - feature preview/product proof surface treatment
- `src/components/marketing/hero/AtlasFieldHero.tsx`
  - floating atlas field mark family and palette behavior
- `src/components/marketing/hero/HeroHousePreview.tsx`
  - site-survey styling, labels, route markers, and background relationship
- `src/app/globals.css` / `DESIGN.md`
  - only if new reusable texture/identity tokens become part of the design system

Potential asset pipeline:

1. Prepare 3–5 source images: landscape, campus/site, construction/site, terrain, blueprint/plan texture.
2. Generate derived masks in CSS/SVG/canvas, not fixed raster screenshots where possible.
3. Use CSS masks for square/perforation and irregular collage slices.
4. Keep animations transform/opacity-based, with `prefers-reduced-motion` fallback.
5. Use product-proof elements grounded in real SlateCamp behavior; do not invent fake UI states.

---

## 9. Acceptance criteria

A later implementation should pass these visual gates:

1. First viewport reads as SlateCamp-specific even if the logo is hidden.
2. Pixel/collage landscape feels architectural/site-survey, not gaming or stock texture.
3. Copy remains immediately legible at laptop and wide desktop viewports.
4. Product proof shows one clear story: rule/topic → visual explanation → practice/check → next study action.
5. No hero carded-dashboard regression: the page should not become a generic SaaS panel stack.
6. Existing legal/product boundaries remain intact: no official-source implication, no pass guarantee, no review-center replacement claim.
7. Motion is ambient, subtle, and disabled/reduced under reduced-motion settings.
8. Browser QA covers 1280, 1440, 1800/1920, 2560 widths plus mobile.

---

## 10. Immediate next action

Create 2–3 static visual boards before code:

1. **Board A — Light Site Atlas**: current hero evolved with square masks, field-survey annotations, and stronger landscape.
2. **Board B — Editorial Terrain Collage**: larger cutouts/stripes, product proof as field-note overlays.
3. **Board C — Dark Survey Camp**: stronger atmospheric/dark option for comparison only.

Pick one board, then turn it into a narrowly scoped implementation plan.
