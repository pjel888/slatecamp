# 00 — Executive Plan

Generated: `2026-05-09T05:14:46.925474+00:00`

## Bottom line

SlateCamp has enough local infrastructure to run a serious article/question improvement program, but the program must be **source-first**, not rewrite-first.

Current local corpus inspected in this planning pass:

- Articles: **567** local article folders.
- Linked questions: **7159** total, **7159** unique question IDs.
- Question format: **mcq** for all currently linked questions inspected.
- UI blocks: **4251** preserved custom blocks across **563** articles.
- Source metadata: **1110** `sources.json` rows, but **247** articles have empty source rows.
- Production governed source packs: **7** packs / **12** chunks under `.ai/16_source_packs/`.

This plan should be treated as a **governed editorial production system**, not as a bulk AI rewrite.

## Governing principle

Every article and question must answer two independent questions before edit or publication:

1. **Learning value:** Does this help a Philippine LEA candidate understand, retain, and apply the concept?
2. **Truth value:** Can every legal/code/dimensional claim be traced to an official or approved source with locator evidence?

If the answer to either is no, the item is not publish-ready.

## Work sequence

### Phase 0 — Freeze, inventory, and risk-map

Purpose: establish a clean, auditable local working basis before any content edits.

Actions:

1. Record current git branch and dirty-state count.
2. If a fresh Supabase mirror is needed, move the current `.ai/content-audit-export` to a timestamped backup outside the repo before pulling.
3. Run local validation:
   - `bun run content-audit:validate -- --summary`
   - `bun run content-audit:source-packs-validate`
4. Generate a content risk map from article folders:
   - legal/code subjects first;
   - articles with many linked questions;
   - articles with empty `sources.json`;
   - articles with low-confidence/unknown UI blocks;
   - articles whose linked questions have missing rationales or nonstandard option counts.

Exit criteria:

- Inventory counts match this plan or differences are explained.
- No content edits are mixed into planning commits.
- Known dirty state is not accidentally treated as the current task's work.

### Phase 1 — Source coverage map

Purpose: decide which content can be safely upgraded now and which content needs source work first.

For each article/question cluster, assign a source status:

- `READY_SOURCE_PACK`: approved source pack exists with locator support.
- `LOCAL_RAW_NEEDS_RECONCILIATION`: local 001 PDF exists but needs official/hash/version check.
- `OFFICIAL_WEB_NEEDED`: local source absent or provenance unclear; official web source must be found.
- `SECONDARY_ONLY`: textbook/history/theory source; usable with limits, not for legal/code claims.
- `BLOCKED_UNVERIFIED`: no defensible source path.

Priority source families:

1. PD 1096 / NBCP IRR.
2. BP 344 2024 Revised IRR and legacy BP 344 materials.
3. RA 9514 / Fire Code RIRR.
4. RA 9266 / Architecture Act IRR.
5. UAP SPP documents / professional practice contracts.
6. RA 9184, Civil Code Article 1723, CIAP, DHSUD/HLURB planning references.
7. Utilities/materials/structural/history/theory textbooks and manuals.

Exit criteria:

- Every pilot article has a source map.
- Every legal/code claim category has a source status before drafting.
- Unverified dimensions are not carried forward as facts.

### Phase 2 — Learning-module model and rubric

Purpose: turn each article into a compact exam-prep module rather than a generic encyclopedia page.

Required article module structure:

1. **Exam task framing:** what the board candidate must be able to answer.
2. **Learning objectives:** 2–5 measurable objectives aligned to questions.
3. **Source status:** official/source-pack status and version warning where relevant.
4. **Core explanation:** plain-language architecture concept with exact legal/code wording only where source-backed.
5. **Application pattern:** how the concept appears in LEA questions, drawings, tables, or scenario prompts.
6. **Common traps:** misconception cards, conflict rules, outdated-code warnings.
7. **Practice bridge:** mapped linked questions and retrieval prompts.
8. **References:** source family, section/rule/page/locator, hash/source-pack ID when available.

Required question improvement structure:

1. Focused question prompt with one defensible best answer.
2. Four options unless the platform explicitly supports otherwise.
3. Plausible distractors tied to common misconceptions.
4. Rationale explaining why the key is correct and why each distractor is wrong.
5. Source locator for any legal/code/dimensional assertion.
6. Difficulty and topic alignment consistent with article objectives.

Exit criteria:

- Pilot module rubric passes before scale-up.
- Questions test application, not just recall, when the source/topic supports it.

### Phase 3 — Pilot before scale

Pilot set recommendation:

- 2 PD 1096 articles with high question counts.
- 2 BP 344 articles with source-pack/conflict risk.
- 1 RA 9514 article.
- 1 RA 9266/SPP professional-practice article.
- 1 non-legal history/theory article to test secondary-source handling.
- 1 utilities/materials/structures article to test technical but non-statutory claims.

Pilot outputs:

- `normalized.md` edits only.
- `question-edits/<question_id>.json` files only.
- Source claim ledger per article.
- Component plan per article.
- Diff reports and local validation.

Exit criteria:

- 100% of pilot legal/code claims have locator-backed evidence or are removed/marked pending.
- No answer-key changes unless separately source-reviewed.
- No raw `[SLATECAMP_UI_BLOCK:...]` placeholders reach published content.

### Phase 4 — Batch production

Batch order:

1. High-risk law/code clusters with approved source packs.
2. High-question-count articles.
3. Articles with empty or weak `sources.json` after source reconciliation.
4. Non-law technical modules.
5. History/theory/design modules.

Default batch size:

- 10 articles per source family for editorial drafting.
- 25–50 question edits per safety-reviewed publish batch.
- Smaller batches for answer-key changes or new component insertions.

### Phase 5 — Review, dry-run, publish only after approval

No Supabase mutation until Philip explicitly authorizes a publish/apply step.

Required review stack:

1. Deterministic local validators.
2. Source ledger review.
3. Independent model review of article and questions.
4. Human/SME review for HIGH legal/code/policy claims and answer-key changes.
5. Dry-run push.
6. Apply only by exact article ID or exact question ID list.
7. Remote verification.

## Major risks

- **Source drift:** local raw PDF may not match current official agency PDF.
- **Conversion drift:** OCR/markdown extraction may differ from raw PDF.
- **Component corruption:** raw UI placeholders in Supabase are a production content defect.
- **Question key risk:** changing answer keys without source and independent review is high risk.
- **Overwriting dirty state:** current repo state is already heavily modified; isolate plan implementation from unrelated work.
- **False authority:** 003 canonical graph pages are useful for navigation, but legal/code truth still needs raw/official/approved source backing.

## Definition of done for this plan's future implementation

A content batch is done only when:

- all changed files are listed;
- every changed article validates locally;
- every changed question validates locally;
- source ledger has no unsupported legal/code claims;
- dry-run output is clean;
- apply scope is exact and reviewed;
- remote verification passes; and
- unresolved risks are explicitly logged.
