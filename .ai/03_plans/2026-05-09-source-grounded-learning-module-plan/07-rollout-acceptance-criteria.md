# 07 — Rollout and Acceptance Criteria

Generated: `2026-05-09T05:14:46.925474+00:00`

## Recommended rollout cadence

### Week 0 / Phase 0: planning-to-execution readiness

- Confirm branch/worktree isolation.
- Validate local mirror and source packs.
- Generate source coverage matrix.
- Choose pilot articles.

### Phase 1: source-led pilot

Pilot size: 8 articles + linked question subset.

Suggested pilot mix:

- PD 1096: 2 high-question articles.
- BP 344: 2 accessibility articles.
- RA 9514: 1 fire-code article.
- RA 9266/SPP: 1 professional-practice article.
- History/theory: 1 non-legal article.
- Utilities/materials/structures: 1 technical article.

### Phase 2: legal/code expansion

Batch size: 10 articles per source family; 25–50 questions per reviewed batch.

Order:

1. PD 1096 / NBCP.
2. BP 344.
3. RA 9514.
4. RA 9266 / UAP SPP.
5. Planning/procurement/liability laws.

### Phase 3: non-law technical modules

Materials, utilities, structures, environmental systems, and construction technology.

### Phase 4: history/theory/design modules

Secondary-source governance, movement comparisons, architect/building examples, and visual memorization aids.

## Phase 0 source coverage matrix artifact

Before full article/question editing, generate a matrix with at minimum:

- article ID, slug, title, taxonomy;
- linked question IDs and count;
- source family and source status;
- approved source pack/raw file/official URL path;
- locator availability;
- source-pack integrity status;
- conflict class;
- legal/code risk level;
- UI block risk level;
- edit eligibility.

Only `READY_SOURCE_PACK_VERIFIED` or an explicitly reviewed exception should enter publish-oriented editing.

## Acceptance criteria — article

An article is publish-ready only when:

- all changed prose is in `normalized.md`;
- `candidate.md` is generated, not hand-written;
- component placeholders are preserved/repaired;
- source ledger has no unsupported legal/code claims;
- all legal/code dimensions have exact locators;
- article objectives align with linked questions;
- common traps are explicit;
- tone is board-review clear and Philippine-context appropriate;
- local compose/diff/validate pass;
- dry-run push is clean.

## Acceptance criteria — question

A question is publish-ready only when:

- proposed edit is in `question-edits/<question_id>.json`;
- baseline hash matches current exported question;
- stem has one clear problem;
- exactly one best answer exists;
- distractors are plausible and not trick-only;
- rationale teaches correct and incorrect options;
- legal/code rationale has source locator;
- answer-key changes receive independent and human/SME review;
- local validators pass;
- dry-run push is clean.

## Acceptance criteria — source pack / source ledger

- Pack/index validation passes.
- Raw/official/version conflicts are visible.
- Source locator is precise enough for reviewer verification.
- OCR-derived text is checked against raw/source when numeric or legal.
- Security-gated sources are labeled blocked, not absent.

## Batch review memo format

```md
# Batch Review Memo — <batch id>

## Scope
- Articles:
- Questions:
- Source families:

## Source evidence
- Source packs used:
- Raw files used:
- Official URLs checked:
- Conflicts/open issues:

## Changes
- Article improvements:
- Question improvements:
- Component changes:

## Validation
- Commands run:
- Reports:
- Failures/fixes:

## Risk decision
- Publishable:
- Hold:
- Needs SME:
```

## Stop conditions

Stop a batch and quarantine affected items if:

- source conflict changes the correct answer;
- two authoritative sources disagree and no governance decision exists;
- validator flags candidate hash/component mismatch;
- dry-run proposes unscoped/broad updates;
- answer-key change lacks locator/review;
- raw placeholders appear in candidate output.

## Recommended next action after this planning pack

Do not begin full editing yet. The safest next execution step is a **Phase 0 source coverage matrix plus source-pack integrity audit** that maps all 567 article folders and 7,159 linked questions to source family/status/priority and blocks any source pack whose metadata, locator, and chunk text disagree.
