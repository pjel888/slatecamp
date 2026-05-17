# 06 — UI Component Strategy

Generated: `2026-05-09T05:14:46.925474+00:00`

## Current component surface

The local mirror contains **4251** UI blocks across **563** articles.

Most common components:

- `ExamTip`: 774
- `ArticleMedia`: 766
- `Tip`: 439
- `WikiMistakeCard`: 365
- `WikiMistakeList`: 291
- `Note`: 286
- `Warn`: 278
- `Callout`: 270
- `LawCallout`: 244
- `WikiExamTable`: 196
- `KeyValues`: 78
- `ComparisonTable`: 72
- `Example`: 68
- `ProcessFlow`: 40
- `Accordion`: 30
- `WikiCalloutBox`: 9
- `SubjectSnapshot`: 8
- `LeartBox`: 7
- `SPP206RefServices`: 5
- `details`: 5
- `WikiPartHeader`: 3
- `WikiReference`: 2
- `SPP207RefServices`: 2
- `Tabs`: 1
- `FormulaBlock`: 1
- `Warning`: 1
- `ConflictMatrix`: 1
- `RegulationFramework`: 1
- `AlertBox`: 1
- `RevealBlock`: 1
- `CalloutBox`: 1
- `WikiChangedPill`: 1
- `ElaborativeInterrogation`: 1
- `Mermaid`: 1
- `AuthorityContent`: 1

Parser status:

- Confidence counts: `{'high': 4240, 'low': 11}`.
- Parse status counts: `{'parsed': 4240, 'unknown_block': 11}`.
- Warnings: `- No closing tag found for ArticleMedia; preserved opening line as unknown custom block.: 10
- No closing tag found for Mermaid; preserved opening line as unknown custom block.: 1`.

## Component principle

Use components only when they teach. Do not add decorative components that increase roundtrip risk without improving learning.

Good use cases:

- `LawCallout`: exact law/code section, rule, or source-status warning.
- `WikiMistakeCard` / `WikiMistakeList`: exam traps, outdated standards, common wrong interpretations.
- `WikiExamTable`: section-to-rule comparisons, occupancy/rating matrices, SPP phase comparisons.
- `KeyValues`: memorization anchors for dimensions, dates, thresholds, roles.
- `ProcessFlow`: permit sequence, professional service phase, procurement sequence, egress decision flow.
- `ComparisonTable`: contrast similar concepts, e.g. BP 344 vs PD 1096, design-build variants, occupancy groups.
- `ExamTip` / `Tip` / `Note` / `Warn`: concise review guidance, not substitute for sourced prose.
- `ArticleMedia`: visual learning; must have meaningful alt/context and must not carry unsupported claims.

## Roundtrip rule for components

There are two valid component-editing modes. Choose deliberately and document which mode was used.

### Mode A — preserve existing placeholders

Existing `[SLATECAMP_UI_BLOCK:...]` placeholders in `normalized.md` must remain intact unless the block is intentionally changed through a governed edit. They map to `ui-blocks.json` and are resolved during compose.

Use this mode when editing prose around existing components.

### Mode B — add simple raw MDX components

For new simple components, raw MDX tags may be inserted directly into `normalized.md` only when all conditions are met:

1. The component is whitelisted in the wiki renderer.
2. The edit does not remove or rewrite existing `[SLATECAMP_UI_BLOCK:...]` placeholders.
3. `ui-blocks.json.normalized_content_hash` is recomputed when required by the bundle format.
4. `candidate.md` is regenerated through compose.
5. Compose/validate/dry-run prove no placeholder leakage, unknown component, or render-risk syntax.

Use the fuller `ui-blocks.json` placeholder workflow when a component needs stored block metadata, when preserving an existing block, or when batch governance requires explicit block records.

Full placeholder addition flow:

1. Add raw component block to `ui-blocks.json` with `component_name`, `raw`, `raw_hash`, props, and status.
2. Add matching `[SLATECAMP_UI_BLOCK:ui_NNNN component="X" status="preserved"]` placeholder in `normalized.md`.
3. Recompute `normalized_content_hash`.
4. Compose candidate.
5. Validate candidate contains rendered/raw component content, not leaked placeholder.

## Component audit tasks before scale

1. Resolve or quarantine the **11** low-confidence/unknown UI-block articles before broad edits.
2. Standardize prop conventions at component entry points, not by mutating content, when possible.
3. For high-risk legal/code components, require source locator in adjacent prose or component props.
4. Add component-use guidance to worker briefs so agents do not invent unsupported visual claims.
5. In pilot, limit new component additions to one or two component families to reduce validation surface.

## Recommended module/component patterns

### Legal/code standard

- Start with source-status prose.
- Use `LawCallout` for exact section/rule.
- Use `KeyValues` for dimensions.
- Use `WikiMistakeCard` for exam trap.
- Use linked MCQs for retrieval.

### Process or sequence topic

- Use `ProcessFlow` for steps.
- Use `Warn` for dependencies or common sequencing mistakes.
- Use `ComparisonTable` for alternative paths.

### History/theory topic

- Use prose first.
- Use `Example` for building/architect examples.
- Use `ComparisonTable` for movements/styles.
- Avoid legal-style certainty if the source is interpretive.

### Technical systems topic

- Use `KeyValues` for units/thresholds.
- Use `WikiExamTable` for standards and applications.
- Use `ExamTip` for selection logic.

## Component acceptance criteria

A component is acceptable only when:

- the surrounding prose remains understandable without it;
- it has source support for all factual claims;
- it survives compose/validate/dry-run;
- no placeholder leaks into candidate output;
- it improves exam recall or application.
