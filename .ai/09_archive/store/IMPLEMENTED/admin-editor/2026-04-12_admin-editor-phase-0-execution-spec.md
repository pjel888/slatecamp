# Admin Editor Phase 0 Execution Spec

## Scope completed in this run

1. Unified article creation contract added at the action layer via `saveArticleFull(...)`.
2. Canonical save path updated so taxonomy mapping is part of the active article save contract.
3. Draft preview generation/update moved onto admin-client access after explicit permission checks.
4. Preview role policy migration added for `admin_draft_previews`.
5. Targeted tests added for create/save/taxonomy/preview.

## Code landed

- `src/lib/actions/admin/content.ts`
  - added `saveArticleFull(...)`
  - create path now generates a real article row and unique slug
  - create path persists initial taxonomy mapping
- `src/components/admin/unified-editor/SaveAllBar.tsx`
  - save now stages article persistence before dependent new question/EI prompt creation
  - taxonomy is included in the canonical save payload
- `src/components/admin/unified-editor/UnifiedContentEditor.tsx`
  - tracks persisted article id/slug during the session
  - updates pending draft children after article creation
  - redirects to canonical `/admin/knowledge/[id]` after successful first save
- `src/lib/actions/preview-actions.ts`
  - uses admin client after `canManageContent()` checks
- `src/app/admin/preview/[previewId]/page.tsx`
  - uses `canManageContent()` and admin client for preview reads
- `supabase/migrations/20260412_fix_admin_draft_preview_policy.sql`
  - aligns preview policy with `has_admin_role()`

## Verification completed

- `bun test src/lib/actions/admin/content.test.ts`
- `bun test src/lib/actions/preview-actions.test.ts`
- `bun run type-check`

## Residual Phase 0 gaps

1. No browser-level e2e exists yet for `/admin/knowledge/new`; current proof is action-layer and save-contract tests.
2. Preview TTL/cleanup is still not implemented.
3. Route-level smoke verification still depends on manual confirmation.
4. Reviewer-safe surfaces and publish/readability gates were started in the next pass, but Phase 0 itself remains the create/taxonomy/preview foundation.
