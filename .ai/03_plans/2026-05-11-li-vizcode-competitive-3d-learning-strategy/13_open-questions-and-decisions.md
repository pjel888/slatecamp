# 13 — Open Questions & Decisions

## Competitive Strategy Decisions

| # | Question | Area | Recommended Default | Blocks MVP? | Owner | Notes |
|---|----------|------|---------------------|-------------|-------|-------|
| Q1 | Should LI use a single `'learning'` template type with config-driven sub-modes, or separate template types per sub-mode? | Architecture | Single `'learning'` type with `supportedModes` field | Yes | Engineering | Avoids template type explosion. One module can offer multiple sub-modes. |
| Q2 | Which 3 modules for MVP? | Content | `bp344-ramp-layers`, `bp344-toilet-room`, `egress-stair-core` | Yes | Product | Covers 3 highest-frequency ALE exam topics. 2 code families. |
| Q3 | Should Source View be free or paid? | Pricing | Source View free as preview; all other sub-modes paid | No | Product | Competes with VizCode's free Code Library. Drives Pro conversion. |
| Q4 | Should the Coverage View be learner-facing or admin-only? | Product | Learner-facing with simple statuses; admin-only with detailed statuses | No | Product | Helps learners discover modules. Internal gaps hidden behind admin. |
| Q5 | Should LI have a separate entitlement from PI? | Entitlement | No — same `threeDLabFull` key | Yes | Product | Simpler. LI and PI are both "3D Lab Pro" features. |
| Q6 | How should sub-modes be navigated? | UX | Horizontal tab bar below header | Yes | Design | Familiar pattern. Mobile: horizontal scroll or dropdown. |
| Q7 | Should the first LI module be existing PI module content repackaged, or entirely new? | Content | New content, not repackaged | No | Content | PI and LI serve different purposes. Repackaging would confuse both modes' value. |
| Q8 | How many LI modules needed to feel competitive with VizCode? | Strategy | Phase 1: 3 (matches coverage start). Phase 2: 7 (competitive). Phase 4: 50+ (dominant) | No | Product | 3 is enough to ship. 7 covers all P0 scene templates. |
| Q9 | Should LI include the existing calculator templates (flooring, paint, etc.)? | Product | No — calculators are PI (parametric) | No | Product | Calculators have input/output panels, not layer exploration. |
| Q10 | Should LI modules have thumbnails like PI modules? | Design | Yes — static screenshot of 3D scene | No | Design | Dashboard cards need visual preview. Auto-generate or manual screenshot. |

## Architecture Decisions

| # | Question | Recommended | Blocks? |
|---|----------|-------------|---------|
| Q11 | Should sub-mode scene files be separate or combined in one renderer? | Separate files per sub-mode, imported dynamically | Yes |
| Q12 | Should the module store hold all sub-mode state or separate stores? | Single module store with namespaced keys (`mode:compare:*`) | Yes |
| Q13 | Should the Coverage View be a new route or a query parameter on existing route? | Query parameter: `/dashboard/3d-lab?view=coverage` | No |
| Q14 | Should LI support the existing `ViewportShellContent` interface? | Yes — LI content fits same slots (canvasContent, rightSidebarContent, etc.) | Yes |
| Q15 | Should sub-mode tabs be in the ViewportHeader or a separate bar? | Separate compact bar below header (~36px) | No |

## Content Decisions

| # | Question | Recommended | Blocks? |
|---|----------|-------------|---------|
| Q16 | How many layers per LI module? | 4-8 layers per module | No (guideline) |
| Q17 | Should all 6 sub-modes be available for every module? | No — modules declare `supportedModes` | Yes |
| Q18 | Should Mistake Hunt violations be config-driven or procedurally generated? | Config-driven for MVP; procedural generation possible later | Yes |
| Q19 | Should Board Drill questions be embedded in module config or linked from quiz bank? | Linked from quiz bank (stable question IDs) | Yes |
| Q20 | Who writes source cards? | Content team with SME review; engineering provides the format | No |

## Design Decisions

| # | Question | Recommended | Blocks? |
|---|----------|-------------|---------|
| Q21 | "Learning" badge color? | Emerald/green (`bg-emerald-500/5 text-emerald-600 border-emerald-500/10`) | Yes |
| Q22 | "Learning" badge icon? | `GraduationCap` from Phosphor | Yes |
| Q23 | Sub-mode tab icons? | Phosphor: `Cube` (Focus), `ArrowsLeftRight` (Compare), `MagnifyingGlass` (Mistake), `Exam` (Drill), `FileText` (Source) | No |
| Q24 | Right sidebar title for LI? | "Layers" (Focus), "Compare" (Compare), "Mistake Hunt" (Mistake), "Board Drill" (Drill), "Source Card" (Source) | No |
| Q25 | Mobile sub-mode navigation? | Horizontal scroll tabs or dropdown selector | No |

## Prioritization Decisions

| # | Question | Recommended | Blocks? |
|---|----------|-------------|---------|
| Q26 | Which phase gets the Coverage View? | Phase 2 (after 7 modules; enough content to make it useful) | No |
| Q27 | When does Quiz integration happen? | Phase 3 (Board Drill + Repair Path need it) | No |
| Q28 | When should free Source View launch? | Phase 4 (after content production is stable) | No |
| Q29 | Should existing PI modules ever be converted to LI? | No — they serve different learner jobs | No |
| Q30 | What's the priority order for the 20 scene templates? | See document 04 (P0 → P1 → P2) | No |

## Unresolved (Need Decision)

| # | Question | Why Unresolved | Impact |
|---|----------|---------------|--------|
| Q31 | Should LI modules have a separate "new" indicator on the dashboard? | Design detail; can decide later | Low |
| Q32 | Should LI module configs live in same folders as PI configs? | Organizational preference; recommended yes (same category folders) | Low |
| Q33 | Should the Repair Path show a progress indicator? | UX detail; can iterate post-MVP | Low |
| Q34 | Should there be a "Complete" state for LI modules (all sub-modes explored)? | Gamification consideration; not MVP | Low |
| Q35 | Should LI analytics be tracked separately from PI? | Data infrastructure question; track `source_type: '3d_lab'` with `mode: 'LI'` field | Low |

## Decisions That Can Be Deferred

| Decision | Defer To | Why |
|----------|----------|-----|
| Exact Compare View split-viewport vs toggle implementation | Phase 2 | Start with toggle (simpler); evaluate split after user feedback |
| Mistake Hunt scoring/gamification | Phase 2 | MVP is functional but not scored |
| Free Source View launch | Phase 4 | Only needed when there's enough content to make preview valuable |
| Mobile sub-mode tab UX | Post-Phase 2 | Mobile LI usage may be low initially |
| Coverage View admin features | Phase 3 | Learner-facing view first |
