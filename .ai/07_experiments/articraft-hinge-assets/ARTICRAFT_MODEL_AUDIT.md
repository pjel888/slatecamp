# Articraft-derived hinge GLB audit

Date: 2026-05-16

## Verdict

Do **not** use the first-pass Articraft-derived GLB set as the production hinge article models.

The generated assets technically load, but several are not accurate enough for ALE/architecture teaching. They are useful as experiments/provenance, not as article-facing learning aids.

## Serious accuracy issues

- **Butt hinge**: generally recognizable, but smaller/darker than the procedural version.
- **Loose-pin hinge**: top pin cue is visible but still reads like a generic butt hinge unless labelled.
- **Ball-bearing hinge**: bearing collars/washers are too ambiguous; does not clearly teach bearing placement.
- **Spring hinge**: barrel ribs read as generic bands, not a believable torsion spring/self-closing mechanism.
- **Pivot hinge**: too diagrammatic and not enough like top/bottom pivot hardware in architectural door context.
- **Continuous hinge**: closest acceptable variant, but too small and lacks strong long piano-hinge readability at article scale.
- **Concealed hinge**: acceptable direction but cup/arm proportions are still toy-like; needs better cabinet cup + linkage anatomy.
- **Parliament hinge**: inaccurate; reads like spread plates more than a wide-throw offset parliament hinge.
- **Strap hinge**: inaccurate/too abstract; reads like a bracket/arm rather than face-fixed strap or T hinge hardware.

## Decision

The article component was reverted to the stronger procedural R3F models. The GLBs remain in `public/models/wiki/door-hinges/` and `.ai/07_experiments/articraft-hinge-assets/` only as experimental artifacts until a stricter Articraft pass is done.

## Next Articraft pass requirements

Each generated model must pass recognition without labels and should be curated against architectural hinge references before integration. Do not wire new GLBs into `DoorHinge3D.tsx` until all nine pass visual QA.
