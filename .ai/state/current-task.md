# Current Task

**Last Updated:** 2026-04-06  
**Task ID:** storybook-overhaul  
**Status:** completed

---

## Active Task: Storybook Overhaul

**Completed Phase:** Phase 6 - Governance and CI  
**Next Phase:** None - Storybook Overhaul Complete

### Phase 6 Completed
- [x] Add a unified Storybook governance guard in `scripts/check-storybook.ts`
- [x] Wire `bun run check:storybook` into `storybook`, `build-storybook`, and `lint`
- [x] Add Storybook CI in `.github/workflows/storybook.yml`
- [x] Add a PR checklist in `.github/pull_request_template.md`
- [x] Update internal ownership docs so reusable component docs point to Storybook and operational or architecture docs point to `/developer`
- [x] Refresh the stale internal engineering docs in `.ai/docs/04-development/` and `.ai/docs/portal/`
- [x] Run `bun run check:storybook`
- [x] Run `bun run build-storybook`
- [x] Run `bun run build`
- [x] Verify the wiki route happy path remained intact for Phase 6

### Verified Facts
- Current live story count after Phase 6: `63`
- Current live placeholder story count after Phase 6: `0`
- Current feature story count after Phase 6: `3`
- `scripts/check-storybook.ts` now rejects both placeholder scaffold markers and story files that do not import a real component module
- `package.json` now exposes `bun run check:storybook`, keeps `bun run check:storybook-placeholders` as a compatibility alias, and runs the new guard before `storybook`, `build-storybook`, and `lint`
- `.github/workflows/storybook.yml` now installs dependencies, runs `bun run check:storybook`, and runs `bun run build-storybook` in CI
- `.github/pull_request_template.md` now requires Storybook updates when a public reusable component is added or materially changed
- Ownership guidance now lives in:
  - `src/storybook/docs/README.md`
  - `src/app/developer/AGENTS.md`
  - `.ai/docs/portal/004-developer.md`
- `bun run check:storybook` passed on 2026-04-06 after the governance layer landed
- `bun run build-storybook` passed on 2026-04-06 after the governance layer landed
- `bun run build` passed on 2026-04-06 after the governance layer landed
- The successful production build still included `/dashboard/wiki/[slug]`
- `git diff --name-only -- src/app/dashboard/wiki src/components/wiki` still returned only the four pre-existing Phase 4 widget alias files:
  - `src/components/wiki/widgets/bp344/RecallPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/DimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/BodyDimensionPractice.tsx`
  - `src/components/wiki/widgets/dsgn013/SpatialQualityPractice.tsx`

### Notes
- Remaining non-blocking Storybook warnings are unchanged in substance:
  - Storybook's upstream `eval` and chunk-size warnings
  - browser `crypto` externalization warnings from Vite
  - the existing `Lab3DWidget` dynamic-import-vars warning for `@/app/dashboard/3d-lab/_config/modules/${moduleId}`
- The completed Storybook plan artifacts now live under `.ai/archive/plans/storybook-overhaul-2026-04-06/`
- Pre-existing unrelated worktree changes in analytics, 3D lab, and other Storybook-overhaul files were left intact

### Blockers
None.

### Next Action
Carry the new governance forward by reviewing Storybook coverage by folder during sprint planning and adding stories whenever public reusable components change.

---

*This file represents the active task in focus. Update status after each completed phase.*
