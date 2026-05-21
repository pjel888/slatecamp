# Article 3D Generation Toolchain Plan

Date: 2026-05-21
Status: active planning reference; no production code modified
Owner: SlateCamp 3D/content pipeline
Related research: Hermes session study of `earthtojake/text-to-cad`, Pixal3D, Hyper3D/Rodin, and Microsoft TRELLIS.2

## Goal

Make SlateCamp faster at producing article-embedded 3D visuals without weakening legal/code accuracy.

This plan adds a standing rule to future article and 3D Lab planning: use exact CAD for source-backed dimensions, and use AI-generated 3D assets only as reviewed visual aids.

## Non-goals

- Do not treat any generated mesh as legal/code source truth.
- Do not publish AI-generated assets without provenance and browser QA.
- Do not upload private/copyright-sensitive source imagery to third-party APIs without explicit approval.
- Do not require GPU-heavy local AI pipelines before the first article pilot.
- Do not build a new top-level navigation surface for this. Article embeds and existing 3D Lab surfaces remain the product entry points.

## Canonical tool lanes

### Lane A — exact/code geometry

Primary tool: `earthtojake/text-to-cad`

Use when the 3D asset visualizes a rule, dimension, clearance, section, formula, or code envelope.

Best for:
- BP 344 ramps, approach clearances, turning spaces
- stair riser/tread/landing diagrams
- parking stalls and accessible parking envelopes
- PD 1096 eaves/setback/height diagrams
- simple massing, sections, and geometric explainers

Required outputs:
- source script or checked prompt-backed Python file
- `.step` source geometry for audit
- `.glb` web asset for article embed
- `inspect.json` or equivalent geometry facts for bounds/dimensions
- screenshot/contact sheet for review
- manifest/provenance record

Quality gate:
- Every code-relevant value must match a source card, locator, formula/test seed, and reviewer gate before learner-facing use.

### Lane B — AI visual candidates

Candidate tools:
- Hyper3D/Rodin — fastest practical text/image-to-GLB API lane if subscription/API terms are acceptable.
- Pixal3D — open image-to-GLB candidate generator; GPU-heavy; good for object visuals after dependency/license review.
- Microsoft TRELLIS.2 — MIT/open image-to-3D and PBR texturing pipeline; future Linux + NVIDIA GPU lane, not Mac-local.

Use when the asset is an illustration, prop, or visual memory aid, not a source of legal/code dimensions.

Best for:
- fixtures
- hardware
- furniture
- construction objects
- conceptual article props
- textured objects for engagement and recall

Required outputs:
- input prompt and/or source image path
- tool/model name and date
- generation settings/seed when available
- generated `.glb`
- optimized final `.glb`
- screenshot/contact sheet
- license/terms note
- known limitations note

Quality gate:
- Article copy and caption must frame the object as illustrative if there is any risk that students may read it as code-authoritative.

### Lane C — Blender cleanup and normalization

Use Blender as the common cleanup stage for both exact CAD and AI-generated assets.

Checklist:
- normalize scale, origin, orientation, and camera-facing direction
- remove stray geometry
- reduce excessive polygon count
- compress/resize textures
- simplify material names
- export final web `.glb`
- preserve `.blend` only when manual edits are meaningful

## Asset folder contract

For every article-embedded 3D asset, create or mirror this logical package near the article asset manifest:

```text
asset-id/
  manifest.json
  source.py                  # exact CAD lane only, if applicable
  params.json                # exact CAD lane only, if applicable
  model.step                 # exact CAD lane audit geometry, if applicable
  model.raw.glb              # generated/imported candidate
  model.optimized.glb        # publish candidate
  inspect.json               # exact geometry facts or validation notes
  snapshot.png               # browser/render QA image
  provenance.md              # prompt/image/tool/license/manual-edit notes
```

Minimum `manifest.json` fields:

```json
{
  "assetId": "string",
  "articleId": "string or null",
  "purpose": "exact-code-geometry | visual-illustration | hybrid",
  "sourceTruthStatus": "source-backed | illustrative-only | pending-review",
  "generationTool": "text-to-cad | rodin | pixal3d | trellis2 | blender | manual",
  "inputPromptOrImage": "path or summary",
  "legalCodeReferences": [],
  "outputs": {
    "step": "path or null",
    "glb": "path",
    "snapshot": "path"
  },
  "qa": {
    "browserRendered": false,
    "consoleClean": false,
    "mobileFallbackChecked": false,
    "reviewer": null,
    "date": null
  },
  "limitations": []
}
```

## Article embed rule

Preferred MDX/API direction:

```mdx
<Article3DModel
  assetId="..."
  caption="Illustrative model only; dimensions are explained in the article text."
/>
```

Rules:
- Keep board-exam-relevant explanation in article text, source cards, formula blocks, or captions.
- Do not place legal/code explanation only inside a canvas.
- Use a fallback image/text path for students whose device cannot render WebGL.
- Keep article canvases lightweight. Escalate to 3D Lab only when the learning interaction needs a full module.

## First pilot sequence

### Pilot 1 — exact geometry article visual

Target candidate: BP 344 ramp or clearance explainer.

Acceptance criteria:
- text-to-cad source script exists
- STEP and GLB generated
- inspect facts verify dimensions
- raw source locator/formula test confirms code-relevant values
- browser snapshot captured
- article embed plan written before Supabase publish

### Pilot 2 — visual object article aid

Target candidate: door hinge, lever hardware, lavatory, wheelchair, or other non-authoritative article prop.

Acceptance criteria:
- generated with Rodin/Pixal3D/TRELLIS.2 or authored in Blender
- provenance captured
- GLB optimized
- caption identifies illustrative role if needed
- browser QA snapshot captured

### Pilot 3 — hybrid article + 3D Lab handoff

Target candidate: a lightweight article embed that deep-links to a richer 3D Lab module when interaction is needed.

Acceptance criteria:
- article embed stays lightweight
- 3D Lab module remains source-gated
- legal/code truth stays in source cards and formula tests
- shared asset manifest records both article and 3D Lab usage

## Integration points to remember

- `.ai/03_plans/README.md` lists this package as an active planning entrypoint.
- `.ai/03_plans/3d-modules/README.md` cross-links this package for shared 3D asset-generation lanes.
- The SlateCamp Hermes skill `slatecamp-3d-content-pipeline` stores the reusable workflow and research summary.
- Future article improvement batches should consider this lane when a 3D visual would improve comprehension, especially for spatial code topics.
- Future 3D Lab modules should prefer text-to-cad for exact geometry before hand-authored mesh shortcuts.

## Decision lock

1. `text-to-cad` is the default for exact code-rule geometry.
2. Hyper3D/Rodin, Pixal3D, and TRELLIS.2 are candidate visual generators only.
3. Blender remains the cleanup/normalization bridge.
4. GLB is the default web delivery format.
5. STEP is preserved when geometry is meant to be auditable.
6. Provenance and QA are required before publishing.
7. Generated visuals never override raw sources, source cards, formula tests, or SME/review gates.
