# Existing Plan Disposition

## Examined folders

### 1. `content-audit-editor-protocol/`

**Finding:** This folder was an active rollout tracker for the editor protocol. Its durable spec owner is already `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/`.

**Key evidence from README:**
- The plan stated that its scope was documentation and operating protocol only.
- It explicitly excluded AI fact-checking, automatic rewriting, admin UI workflows, and new Supabase mutations.
- Most checklist rows were complete, with only the dry-run editorial pilot still queued.

**Disposition:** Archived under `preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/`.

**Reason:** The durable protocol remains in `.ai/06_specs/deep/05-reference/`; the active rollout tracker is superseded by this comprehensive implementation plan.

### 2. `slatecamp-ai-audit-admin-ui-docs/`

**Finding:** This folder planned the first `/admin/ai-audit` dashboard. The route now exists in `src/app/admin/ai-audit/` with dashboard, article, question, finding, proposal, run, and detail pages.

**Key evidence from README:**
- The pack was explicitly UI/workflow infrastructure only.
- It excluded AI model APIs, automated fact-checking, article rewriting, question rewriting, and source retrieval/RAG.
- It described the foundation where future AI results would be logged and reviewed.

**Disposition:** Archived under `preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/`.

**Reason:** The admin audit UI foundation exists. Future work should now be planned as integration of the editorial pipeline into that surface, not as the original admin UI MVP.

## Preservation rule

The folders were moved, not deleted. They remain available as historical inputs and decision records.

## New active folder

The new active plan folder is:

`.ai/03_plans/content-editorial-pipeline-2026-05-05/`
