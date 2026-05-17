# Scope Reconciliation and Next Work Audit — 2026-05-17

**Status:** Read-only reconciliation report; no source remediation performed.  
**Repo:** `/Users/philiplewis/slatecamp`  
**Branch:** `fix/wiki-article-render-failure`  
**Audit time:** 2026-05-17 12:08 PST  
**Canonical destination:** `.ai/02_audits/` per `.ai/00_system/ai-folder-canonical-map.md`.

---

## Executive finding

The repository is not currently blocked by TypeScript. The immediate blocker is **scope drift in the working tree**: several unrelated product and infrastructure workstreams are mixed in one dirty branch.

This branch name implies a wiki-render fix, but the live dirty tree primarily contains analytics, pricing, 3D Lab lighting, door-hinge asset work, and project-governance changes. Continuing development before separating these workstreams risks producing a large, unstable, hard-to-review batch.

---

## Verification evidence

Commands run:

```bash
pwd
git branch --show-current
git status --short
bun run type-check
git diff --name-status
git ls-files --others --exclude-standard | sed 's#/[^/]*$#/#' | sort | uniq -c | sort -nr | head -40
test -f supabase/config.toml && echo present || echo missing
```

Results:

- `pwd`: `/Users/philiplewis/slatecamp`
- Branch: `fix/wiki-article-render-failure`
- `bun run type-check`: exit code `0`
- `supabase/config.toml`: `missing`
- `.ai/README.md` last updated/audited state remains centered on 2026-05-09 / 2026-05-15 organization history.
- `.ai/ROADMAP.md` still says active WIP is landing page refactoring, not the current analytics/pricing/3D Lab/door-hinge mix.
- `.ai/TASKS.md` still lists the P0 Supabase verification sequence and generic dirty-source review, but does not classify the current parallel workstreams.
- `.ai/10_state/current-state.md` is dated 2026-05-05 and still lists Supabase verification/type regeneration as production blockers.

---

## Dirty workstream classification

### 1. Analytics dashboard redesign — **continue candidate / highest local-product priority**

Evidence paths:

- `src/app/dashboard/analytics/page.tsx`
- `src/app/dashboard/analytics/advanced/page.tsx`
- `src/app/dashboard/analytics/layout.tsx`
- `src/app/dashboard/analytics/loading.tsx`
- `src/app/dashboard/analytics/_lib/` (untracked)
- `src/components/analytics/AnalyticsTabNav.tsx`
- `src/components/analytics/ExamCountdown.tsx`
- `src/components/analytics/ForgettingCurves.tsx`
- `src/components/analytics/MemoryHealthMap.tsx`
- `src/components/analytics/ProgressCard.tsx`
- `src/components/analytics/ProgressCardSection.tsx`
- `src/components/analytics/ReadinessTrajectory.tsx`
- `src/components/analytics/StaminaHeatmap.tsx`
- `src/components/analytics/StaminaHeatmapSection.tsx`
- `src/components/analytics/StudyStreakCalendar.tsx`
- `src/components/analytics/StudyStreakCalendarSection.tsx`
- `src/components/analytics/TimelineHeatmap.tsx`
- `src/components/analytics/TimelineHeatmapSection.tsx`
- `src/components/analytics/TopicIntelligenceCards.tsx`
- `src/components/analytics/TopicIntelligenceSection.tsx`
- `src/components/dashboard/SubjectMasteryCard.tsx`
- `src/components/dashboard/SubjectMasteryServer.tsx`
- `src/components/dashboard/SubjectRadarChart.tsx`
- `src/lib/analytics/tabs.ts` (untracked)
- `e2e/analytics-dashboard-tabs.spec.ts` (untracked)
- `.ai/03_plans/analytics-dashboard-redesign/` (untracked)

Observed scale: 26 status entries classified as analytics-related.

Risk:

- Learner-facing dashboard changes are broad and likely need visual/browser QA, component-level review, and E2E confirmation.
- Because analytics touches dashboard shared components, it can affect non-analytics dashboard surfaces.

Recommendation:

- If prioritizing local product progress, close this as the next focused batch.
- Before commit: inspect diff by file group, run `bun run type-check`, targeted analytics E2E if available, and browser visual QA for `/dashboard/analytics` and `/dashboard/analytics/advanced`.

Suggested disposition: **Continue after scope separation.**

---

### 2. Pricing / marketing updates — **separate product/public-surface batch**

Evidence paths:

- `src/app/pricing/page.tsx`
- `src/app/pricing/pricing-content.tsx`
- `src/components/marketing/MarketingFooter.tsx`
- `src/components/marketing/PricingCard.tsx`
- `src/components/marketing/PricingCard.stories.tsx`
- `src/lib/constants/pricing.ts`

Observed scale: 6 status entries classified as pricing/marketing-related.

Risk:

- Public pricing copy and cards can create product/legal expectations about paid features, launch scope, or deferred payment behavior.
- This must stay aligned with the documented payment-free/live-AI-free launch stance unless Philip explicitly changes launch scope.

Recommendation:

- Do not bundle with analytics or 3D Lab work.
- Before commit: review copy for legal-safe educational-resource positioning and deferred-payment boundaries; run Storybook or visual checks for pricing cards where practical.

Suggested disposition: **Park or commit separately after copy/legal review.**

---

### 3. 3D Lab lighting-room simulator — **separate feature/planning batch**

Evidence paths:

- `.ai/03_plans/3d-modules/3d-module-master-matrix.csv`
- `.ai/03_plans/3d-modules/README.md`
- `.ai/03_plans/3d-modules/lighting-room-simulator/` (untracked)
- `src/features/3d-lab/config/dashboard-visibility.ts`
- `src/features/3d-lab/config/registry/cat-06.ts`
- `src/features/3d-lab/hooks/useTemplateContent.tsx`
- `src/features/3d-lab/components/templates/LightingRoomPanels.tsx` (untracked)
- `src/features/3d-lab/components/templates/LightingRoomScene.tsx` (untracked)
- `src/features/3d-lab/config/modules/06-electrical/lighting-computation.ts` (untracked)
- `src/features/3d-lab/config/modules/06-electrical/lighting-computation.test.ts` (untracked)
- `src/features/3d-lab/config/modules/06-electrical/lighting-room-simulator.ts` (untracked)

Observed scale: 9 direct status entries, plus untracked planning directory contents.

Risk:

- 3D Lab modules require source-gated truthfulness rules; lighting/computation cannot be treated as legal/code truth without source cards and formula tests.
- Dashboard visibility changes can expose a module before source/compliance readiness is closed.

Recommendation:

- Keep separate from analytics and pricing.
- Before commit: verify source-card posture, formula tests, dashboard visibility status, and 3D Lab route QA.

Suggested disposition: **Park unless this is the selected next feature.**

---

### 4. Door hinge article / 3D assets — **asset-heavy content/visual batch**

Evidence paths:

- `src/components/wiki/blocks/DoorHinge3D.tsx`
- `src/components/wiki/blocks/ElaborativeInterrogation.tsx`
- `.ai/03_plans/articles/door-hinges-3d-asset-research.md`
- `.ai/03_plans/articles/door-hinges-3d-asset-research.json`
- `.ai/03_plans/articles/door-hinges-article-preview.png`
- `.ai/03_plans/articles/door-hinges-model-workbench.png`
- `.ai/03_plans/articles/door-hinges-model-workbench-after-pin-fix.png`
- `.ai/03_plans/articles/door-hinges-preview-route-screenshot.png`
- `.ai/03_plans/articles/articraft-hinge-glb-contact-sheet-2026-05-16.jpg`
- `.ai/03_plans/articles/articraft-hinge-glb-screenshots/`
- `.ai/07_experiments/articraft-hinge-assets/`
- `.ai/07_experiments/supplier-hinge-assets/`
- `public/models/wiki/door-hinges/`

Observed scale: 63 status entries classified as door-hinge/article/asset-related, including many image/model artifacts.

Risk:

- Large binary/model/image artifacts can bloat the commit and obscure code changes.
- Supplier/downloaded 3D assets require provenance checks and must not be treated as legal/code truth.
- Wiki block changes can affect article rendering outside the hinge article.

Recommendation:

- Separate code changes from generated screenshots/contact sheets and model assets.
- Keep provenance notes with assets.
- Before commit: verify wiki renderer behavior and asset loading path; include only intended public assets.

Suggested disposition: **Park or isolate into an asset/content branch.**

---

### 5. Wiki article render/prose fixes — **branch-name intent but minimal current dirty evidence**

Evidence paths from recent commits:

- `9da39e0a5 fix(wiki): force article prose to full rail width`
- `511b62225 fix(wiki): remove prose paragraph width cap`
- `71887dd00 fix(wiki): align article prose with learning module`

Current dirty evidence:

- No obvious uncommitted files directly matching the recent prose-width fix set were present in the `git status --short` classification.
- `src/components/wiki/blocks/DoorHinge3D.tsx` and `src/components/wiki/blocks/ElaborativeInterrogation.tsx` are dirty, but these appear tied to the door-hinge/article workstream rather than the prose-width branch objective.

Risk:

- The active branch name can mislead reviewers into assuming the dirty tree is a narrow wiki-render fix.

Recommendation:

- Treat the committed wiki prose work as already separate unless new diff evidence proves otherwise.
- Do not add analytics/pricing/3D Lab changes to a wiki-render branch commit.

Suggested disposition: **Keep committed wiki-render work separate; do not mix new work into this branch without rebranching or careful staging.**

---

### 6. `.ai` planning/performance artifacts — **needs semantic review before commit**

Evidence paths:

- `.ai/00_performance/results/dev_server_memory_profile_dev-server.json`
- `.ai/03_plans/3d-modules/3d-module-master-matrix.csv`
- `.ai/03_plans/3d-modules/README.md`
- `.ai/03_plans/3d-modules/lighting-room-simulator/`
- `.ai/03_plans/analytics-dashboard-redesign/`
- `.ai/03_plans/articles/*`
- `.ai/07_experiments/articraft-hinge-assets/`
- `.ai/07_experiments/supplier-hinge-assets/`

Risk:

- `.ai` has canonical placement rules and several generated/experiment areas. These files should not be committed blindly just because they exist.
- Some screenshots/contact sheets are evidence artifacts; some may be disposable experiment outputs.

Recommendation:

- Commit only `.ai` artifacts that directly support the selected workstream.
- For the rest, park in a clearly named branch/worktree or leave untracked until reviewed.

Suggested disposition: **Selective commit only after workstream decision.**

---

### 7. Repo guidance docs — **separate governance/doc batch**

Evidence paths:

- `AGENTS.md`
- `CLAUDE.md`

Risk:

- Root agent governance affects every future agent. These changes should not ride along with analytics, pricing, 3D Lab, or asset work unless directly required.

Recommendation:

- Review and commit as a small governance-only batch if still desired.

Suggested disposition: **Park or commit separately after semantic review.**

---

## `.ai` state drift

Current `.ai` state docs are behind live activity:

- `.ai/ROADMAP.md` line 12 still identifies landing page refactoring as the main active WIP.
- `.ai/TASKS.md` lines 13–21 still list Supabase verification and generic dirty source review, but not the current analytics/pricing/3D Lab/door-hinge split.
- `.ai/10_state/current-state.md` is dated 2026-05-05 and still accurately records Supabase verification as a production blocker, but it does not reflect the current parallel UX/product workstreams.

This is not a structural failure of `.ai`; it is a **state-refresh gap** caused by multiple active workstreams moving faster than the state docs.

Recommended update after scope separation:

- Update `.ai/10_state/current-state.md` with a short 2026-05-17 addendum.
- Update `.ai/TASKS.md` to replace generic dirty-source review with explicit workstream closeout tasks.
- Update `.ai/ROADMAP.md` only if Philip chooses analytics/polish over Supabase P0 as the immediate lane.

---

## Production readiness vs local product progress

### If prioritizing production readiness

The documented P0 remains unchanged:

1. Restore/create a safe Supabase verification target.
2. Add/restore `supabase/config.toml`.
3. Replay migrations on verified local/staging target.
4. Verify AI audit access-control migration.
5. Regenerate `src/types/supabase.ts`.
6. Re-run full validation.

Evidence:

- `supabase/config.toml`: missing.
- `.ai/10_state/current-state.md` lines 54–66 still list Supabase verification/type reconciliation blockers.
- `.ai/ROADMAP.md` lines 35–49 still lists Supabase verification/release governance as immediate P0.

Disposition: **Real launch-readiness P0.**

### If prioritizing local product progress

The strongest next local-product candidate is analytics dashboard redesign because it is broad, learner-facing, and already has code/test/planning artifacts in the dirty tree.

Disposition: **Best next polish closeout.**

---

## Recommended next sequence

1. **Freeze new feature work until dirty scope is separated.**
2. **Choose the immediate lane:**
   - Launch readiness: Supabase verification/config restoration.
   - Product polish: Analytics Dashboard Redesign closeout.
3. **Create separate commit/branch batches by workstream:**
   - Wiki render/prose committed history only; do not mix new dirty work.
   - Analytics dashboard redesign.
   - Pricing/marketing.
   - 3D Lab lighting-room simulator.
   - Door hinge article/assets.
   - Root guidance docs.
   - `.ai` support artifacts tied to each batch.
4. **For each selected batch:**
   - Inspect actual diff.
   - Run targeted validation.
   - Stage exact intended paths only.
   - Commit with a workstream-specific message.
5. **Then update `.ai` state docs** to reflect the selected lane and remaining parked work.

---

## Final recommendation

Do not start a new unrelated task from this state.

Recommended immediate action:

- **If launch-readiness is the priority:** start the Supabase P0 verification/config restoration lane.
- **If learner-facing product progress is the priority:** close out the Analytics Dashboard Redesign as the next isolated batch, then park or separately review pricing, 3D Lab, and door-hinge assets.

This audit recommends **Analytics Dashboard Redesign closeout** as the best local-product continuation, but **Supabase verification/config restoration** remains the actual production-readiness P0.
