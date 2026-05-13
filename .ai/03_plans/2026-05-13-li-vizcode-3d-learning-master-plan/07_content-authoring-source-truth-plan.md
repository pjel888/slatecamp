# 07 - Content Authoring and Source Truth Plan

## Objective

Make LI implementation evidence-led. A 3D model is only a teaching surface; official-source truth must come from source cards, locator evidence, parameter registers, formula tests where applicable, and reviewer sign-off.

## Source Truth Chain

Every source-sensitive hotspot should resolve through this chain:

1. Official source family.
2. Page/section/table locator.
3. Source card ID.
4. Hotspot ID.
5. Module config.
6. Runtime overlay.
7. QA screenshot.
8. Reviewer memo before public release.

If any link is missing, the UI must block the claim or label it clearly as pedagogical/visual.

## Content Authoring Workflow

1. Select module candidate from roadmap.
2. Confirm official source cards exist.
3. Define learning objectives.
4. Draft 6-8 hotspots.
5. Attach source card ID to each source-sensitive hotspot.
6. Classify hotspot type: info, quiz, comparison.
7. Write plain-language explanation.
8. Add dimension callout when relevant.
9. Add quiz rationale and source citation for quiz hotspots.
10. Add comparison rows and source card per row for comparison hotspots.
11. Validate against cognitive load budget.
12. Implement config.
13. Run formula/runtime tests where applicable.
14. Capture screenshots.
15. Reviewer sign-off before release.

## Hotspot Content Contract

Minimum fields:

- `id`
- `type`
- `position`
- `label`
- `title`
- `description`
- `sourceCardId` for source-sensitive claims
- `attachedLayerIds` when layer visibility matters

For quiz:

- question text,
- choices,
- correct option,
- rationale,
- code citation/source card,
- related info hotspot ID.

For comparison:

- comparison subject,
- rows for each code/state,
- requirement text,
- source card per row,
- interpretation note if needed.

## No-Go Rules

Do not implement or release a student-facing claim when any of these apply:

- source card is missing,
- locator quote/page/table is missing,
- source value conflicts with runtime label,
- formula/test seed is required but missing,
- third-party model/license is unclear,
- downloaded model is treated as legal/code source,
- GLB node names do not match required anchors,
- reviewer memo is missing for public release,
- GBC compliance is claimed without official GBC source card,
- competitor text/media is used as production truth.

## Module Source Readiness

| Module | Source readiness | Release caveat |
| --- | --- | --- |
| BP 344 ramp hotspots | Strongest first candidate; source-card drafts and formula seeds exist in truth handoff. | Public release still needs human/source review. |
| BP 344 toilet hotspots | Good candidate; source cards exist for grab bars, turning/accessories, lavatory/urinal. | Validate all dimensions and labels before release. |
| Egress stair hotspots | Good candidate; fire and BP 344 stair cards exist. | Cross-code comparison needs careful interpretation boundaries. |
| Building height comparison | Partial. | Needs verified source card completion before release. |
| Wall assembly | Not source-ready for code claims. | Can be conceptual if clearly labeled and sourced. |
| Foundation system | Not source-ready for code claims. | Needs NSCP/source evidence before claims. |
| Roof/GBC module | Source-risk exception. | Only building-science explainer until official GBC PDF/source cards exist. |

## Authoring Quality Bar

Each hotspot must pass:

- Coherence: it supports a learning objective.
- Feedback: it can explain correctness or meaning.
- LEA transfer: it helps answer a board-style question.
- Source: its claim is traceable.
- Cognitive load: it teaches one concept.
- UX: it can fit in the hotspot UI without text overflow.

## Source Card UI Requirements

Every hotspot with a legal/code claim should show:

- short source label,
- source card ID or title,
- section/table/page locator,
- interpretation boundary,
- correction/report action.

Deep source text can be behind a `View source card` action. It should not be dumped into the first hotspot panel.

## Correction Workflow Requirements

Future correction reports should capture:

- module ID,
- hotspot ID,
- source card ID,
- issue type,
- screenshot/context if available,
- student-entered note,
- app version/build metadata when available.
