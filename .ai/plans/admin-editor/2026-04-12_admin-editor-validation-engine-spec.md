# Admin Editor Validation Engine Spec

## Landed in this run

### Module added

- `src/lib/admin/editor-integrity/standard-question.ts`

## Current responsibilities

1. Normalize question option arrays to canonical `{ id, text }[]` shape.
2. Normalize `correct_option_id` to letter form (`A`-`D`).
3. Resolve primary article ownership for a topic.
4. Validate standard question linkage:
   - article is present
   - topic is present
   - linked article exists
   - article is readable enough for the current workflow stage
   - topic belongs to the linked article taxonomy mapping
5. Preserve scenario/exception question types as explicit non-standard items instead of collapsing them into the standard linkage contract.
   - the standard linkage validator now bypasses them instead of treating them as failed standard questions
6. Count standard questions separately from exception question types for review/publish gates.
7. Validate article save/approve/publish against the real wiki renderer contract via `compileWikiArticleWithRenderer(...)`.
8. Re-check `article_id` + `topic_id` consistency in publish and student-delivery paths, not just during admin writes.

## Current callers

- `src/lib/actions/admin/questions.ts`
- `src/lib/import/import-actions.ts`
- `src/lib/actions/admin/content.ts` for article-scoped import validation
- `src/lib/actions/admin/pipeline.ts` for publish-time ownership expectations and gating
- `src/lib/actions/wiki-quiz.ts` and `src/lib/actions/wiki/get-prequestions.ts` for student-facing delivery filtering
- `src/lib/actions/admin/question-queries.ts` for direct-ownership-first grouping/read behavior

## Current enforcement level

- Blocking on standard question create/update/import when article linkage is missing, invalid, or not tied to an `approved`/`published` article.
- Warning-only output exists in the validator result shape but is not yet surfaced in the editor UI.
- Save-time article MDX compile validation now blocks `saveArticleFull(...)`.
- Publish now blocks when:
  - article is not already `approved`
  - article MDX fails compile validation
  - directly linked standard question count with valid article/topic mappings is below 10
- Review approval now validates article compileability only. Coverage moved out of approval and remains a publish gate.
- Exception/scenario question types are now preserved as explicit non-standard items instead of being forced through standard linkage enforcement.
- Student-facing `wiki_review` and `prequestion` selection paths now filter out standard questions whose linked article is not published or whose `topic_id` is not mapped to that article owner.
- Canonical article editor reads now use direct article-owned question loading instead of topic-adjacent loading.
- Admin question-bank grouping now prefers `questions.article_id` and only falls back to topic-based grouping for exception-class items.

## Next expansion points

1. Surface warning categories in unified-editor UI instead of action-only rejection.
2. Add reviewer approval/state-transition integration through the same validator contract.
3. Expand delivery eligibility checks beyond article publication once backfill is stable.
4. Broaden validation to EI prompts and status-transition semantics.
