# 3D Lab layout/control unification Ralph snapshot

Task statement: complete the real 3D Lab unification so every active `/dashboard/3d-lab/:moduleId` route uses one shared shell and one shared camera/control system. Add static audits, Playwright consistency gates, report 41, then commit and push only scoped changes.

Desired outcome: Site Development Control, Stairs, calculators, and all 209 registry routes render through the same shell/status/header/sidebar/viewport/toolbar contract and expose the same PAN/Orbit/Zoom/Reset mappings through `ThreeDLabControlsProvider`.

Known facts/evidence:
- Current branch is `main`; HEAD at loop start is `34d5a6205319a8dee67d1922e014c772dafde298`.
- The main tree has unrelated dirty admin/CEO/entitlement files; these must not be staged.
- Main build is blocked by unrelated `/ceo/team/admin-roles` server action export errors; clean worktree build evidence is required for scoped verification.
- Static 3D layout/control audits have been added and run; status-bar visibility fix must be propagated to clean worktree before Playwright rerun.

Constraints:
- No secrets in logs/results.
- Use Bun.
- Keep all performance ledger evidence under `.ai/00_performance`.
- Commit messages must follow Lore protocol.
- Avoid touching unrelated dirty files.

Unknowns/open questions:
- Whether full 209 built Playwright consistency gates complete within time/memory limits.
- Standalone public `/calculators/*` layout unification may be outside `/dashboard/3d-lab` scope and should be documented as such.

Likely codebase touchpoints:
- `src/features/3d-lab/components/ModuleViewer.tsx`
- `src/features/3d-lab/components/shell/*`
- `src/features/3d-lab/components/rendering/SceneConfig.tsx`
- `src/features/3d-lab/components/controls/ThreeDLabControlsProvider.tsx`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/templates/CalculatorTemplate.tsx`
- `.ai/00_performance/playwright/3d-lab-production.spec.ts`
- `.ai/00_performance/scripts/3d-lab-layout-controls-audit.mjs`
