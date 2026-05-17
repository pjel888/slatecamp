# Door Hinges and Architectural Hardware — Upgrade Gate Report

## Artifact

- Upgraded article: `.ai/03_plans/articles/door-hinges-and-architectural-hardware-upgraded.md`
- Web supplement leads: `.ai/03_plans/articles/door-hinges-and-architectural-hardware-web-supplement.md`
- Original draft retained: `.ai/03_plans/articles/door-hinges-and-architectural-hardware-draft.md`

## Metrics

- Lines: 437
- Words: 5,139
- Comparison tables: 3
- Inline quizzes: 2
- Callouts: 4
- Active Lab3DWidget embed: false. The widget call remains commented until `door-hinge-types` is registered.

## Gate Review

### 1. Source truth gate

Status: PASS FOR LOCAL DRAFT / HOLD FOR LIVE PUBLICATION.

- Local textbook/construction claims are supported by the USB source captures:
  - `salvan-door-hardware-b153.source-capture.md`
  - `bci-5e-door-hardware-b153.source-capture.md`
- The article clearly separates Salvan/Ching construction vocabulary from Philippine legal/code mandates.
- Web-derived additions are explicitly classified as supplementary vocabulary and not learner-authoritative until URL/page verification.

### 2. Depth gate

Status: PASS.

- Article expanded from 3,552 words to 5,139 words.
- Added performance/specification language, hardware schedules, accessibility/egress cautions, and more recognition terms.

### 3. Digestibility gate

Status: PASS.

- Added tables for hardware families, mounting conditions, and hinge recognition.
- Maintains short learner-facing paragraphs and exam traps.

### 4. Real-world application gate

Status: PASS.

- Cebu restaurant renovation scenario retained and expanded.
- Scenario includes different door conditions, coastal exposure, egress coordination, and specification reasoning.

### 5. Data-presentation gate

Status: PASS.

- Three `ComparisonTable` blocks added.
- Tables compare hardware families, hinge mounting conditions, and hinge recognition clues.

### 6. Assessment bridge gate

Status: PARTIAL PASS.

- Added two `InlineQuiz` checks.
- Added linked-question bridge outcomes.
- Still needs mapping to actual existing question IDs before Supabase publication.

## MDX Validation

Command:

```bash
bun .ai/tmp/check-hardware-article-mdx.ts
```

Result:

```json
{"ok":true}
```

## Remaining Work

1. Verify exact web URLs/pages for any supplementary web claim that should become learner-facing authority.
2. Create and register the `door-hinge-types` 3D Lab module.
3. Uncomment the `Lab3DWidget` embed only after the module exists and passes local render QA.
4. Convert the upgraded markdown into the final content-audit roundtrip location/candidate format if this is going to Supabase.
5. Map linked questions or create new question proposals aligned to the article objectives.
