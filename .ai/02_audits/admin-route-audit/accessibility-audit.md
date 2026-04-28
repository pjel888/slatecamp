# Accessibility Audit

**Last Updated:** 2026-04-27
**Target:** WCAG 2.2 AA

## Summary

The `/admin` surface has **partial accessibility coverage**. Strengths include semantic table markup, skip links, and command palette keyboard navigation. Weaknesses include missing `aria-live` regions, inconsistent form labeling, lack of ARIA tree semantics, and mobile overflow issues.

## Strengths

| Pattern | Location | Evidence |
|---------|----------|----------|
| Skip to main content link | `PortalLayout` | `src/components/portal/PortalLayout.tsx` |
| Sidebar uses `aria-expanded`, `aria-current="page"` | `PortalSidebar` | `src/components/portal/PortalSidebar.tsx` |
| Table headers use `scope="col"` | `AdminRoleManager`, `AuditLogViewer` | `src/components/admin/settings/AdminRoleManager.tsx`, `src/components/admin/AuditLogViewer.tsx` |
| Revoke buttons have descriptive `aria-label` | `AdminRoleManager` | `src/components/admin/settings/AdminRoleManager.tsx` |
| Command palette supports arrow/enter/escape | `CommandPalette` | `src/components/portal/CommandPalette.tsx` |
| Dialog uses Radix `Dialog` primitive | Multiple modals | `src/components/ui/dialog.tsx` |
| Labels use actual `<label>` elements | `QuestionEditor` | `src/components/admin/QuestionEditor.tsx` |

## Weaknesses

### Semantic HTML and Headings

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| Taxonomy tree lacks `role="tree"`, `aria-level`, `aria-setsize`, `aria-posinset` | `TaxonomyEditor` | 1.3.1 | Medium | `src/components/admin/TaxonomyEditor.tsx` |
| `AssetList` search input has no `<label>` (placeholder-only) | `AssetList` | 1.3.1, 3.3.2 | Medium | `src/components/admin/AssetList.tsx` |
| `QuestionQualityBadges` uses color alone (`text-emerald` vs `text-destructive`) | `QuestionQualityBadges` | 1.4.1 | Low | `src/components/admin/QuestionQualityBadges.tsx` |
| `AuditLogViewer` expandable rows lack `aria-expanded` | `AuditLogViewer` | 4.1.2 | Medium | `src/components/admin/AuditLogViewer.tsx` |

### Keyboard Navigation and Focus

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| No focus management after delete/import/save actions | Multiple | 2.4.3 | Medium | `src/components/admin/QuestionImporter.tsx`, `src/components/admin/unified-editor/SaveAllBar.tsx` |
| `QuestionQuickPreview` close button is plain `<button>` with no visible focus ring | `QuestionQuickPreview` | 2.4.7 | Low | `src/components/admin/QuestionQuickPreview.tsx` |
| `MobileNav` trigger lacks `aria-label` | `MobileNav` | 2.4.4 | Low | `src/components/portal/MobileNav.tsx` |

### Forms and Inputs

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `RoleSelect` hidden `<input>` may not be announced by screen readers | `RoleSelect` | 4.1.2 | Low | `src/components/admin/settings/RoleSelect.tsx` |
| `AssetUploader` some labels are plain text, not `<label>` | `AssetUploader` | 3.3.2 | Low | `src/components/admin/AssetUploader.tsx` |
| `QuestionImporter` template download buttons lack `type="button"` | `QuestionImporter` | 3.2.2 | Low | `src/components/admin/QuestionImporter.tsx` |

### Live Regions and Status

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| No `aria-live` regions for async updates (save, import, publish) | `SaveAllBar`, `QuestionImporter`, `PipelineClient` | 4.1.3 | Medium | `src/components/admin/unified-editor/SaveAllBar.tsx`, `src/components/admin/QuestionImporter.tsx` |
| `SMEReviewQueue` error banner lacks `aria-live` | `SMEReviewQueue` | 4.1.3 | Low | `src/components/admin/SMEReviewQueue.tsx` |
| `Toaster` lacks `aria-label` | `AdminShell` | 4.1.2 | Low | `src/app/admin/_components/AdminShell.tsx` |

### Color and Contrast

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `QuestionQualityBadges` uses color alone for status | `QuestionQualityBadges` | 1.4.1 | Low | `src/components/admin/QuestionQualityBadges.tsx` |
| Admin role badge colors may not meet contrast requirements (needs verification) | `AdminRoleBadge` | 1.4.3 | Unknown | `src/app/admin/_components/AdminRoleBadge.tsx` |

### Responsive and Zoom

| Issue | Location | WCAG | Severity | Evidence |
|-------|----------|------|----------|----------|
| `QuestionsTableClient` fixed 300px sidebar causes horizontal overflow | `QuestionsTableClient` | 1.4.10 | High | `src/components/admin/QuestionsTableClient.tsx` |
| `TaxonomyEditor` horizontal indentation may overflow on mobile | `TaxonomyEditor` | 1.4.10 | Low | `src/components/admin/TaxonomyEditor.tsx` |

## Recommended Fixes

### Critical
1. **Add `role="tree"` and ARIA attributes to TaxonomyEditor** — manual test with screen reader.
2. **Fix QuestionsTableClient overflow** — add horizontal scroll or collapsible sidebar.

### High
3. **Add `<label>` to AssetList search input**.
4. **Add `aria-expanded` to AuditLogViewer rows**.
5. **Add `aria-live="polite"` to SaveAllBar status banners**.

### Medium
6. **Add `aria-label` to QuestionQualityBadges**.
7. **Add `aria-label` to MobileNav trigger**.
8. **Add `aria-label` to Toaster**.
9. **Ensure focus management after modal closes**.

### Low
10. **Add `type="button"` to QuestionImporter download buttons**.
11. **Verify role badge contrast ratios**.

## Test Methods

| Test | Method | Coverage |
|------|--------|----------|
| Keyboard-only navigation | Manual | All admin routes |
| Screen reader flow (NVDA/VoiceOver) | Manual | Taxonomy editor, question editor, tables |
| axe-core automated scan | Automated | All admin pages |
| Color contrast check | Automated + manual | Badges, buttons, text on backgrounds |
| Zoom to 200% | Manual | All admin pages |
| Mobile viewport test | Manual | Questions table, unified editor |

## Evidence

- Components: `src/components/admin/`
- Portal components: `src/components/portal/`
- UI primitives: `src/components/ui/`
