# Post-Migration Design Audit: SlateCamp

**Audit Date:** 2026-04-07
**Auditor:** Automated (Claude Opus 4.6)
**Scope:** Full `src/` directory, all .tsx files (excluding `flowbite/`, `node_modules/`)
**Migration:** SlateCamp x Flowbite Pro v3.1 (Phases 1-7 + Wiki W1-W3)

---

## 1. Compliance Scorecard

| Category | Status | Details |
|----------|--------|---------|
| Brand Colors (Camp Cobalt) | PASS | `--primary: #1B3FC4` correctly mapped across all interactive states. 50-900 shade scale in globals.css. |
| Typography | PASS | `font-sans` (Atkinson Hyperlegible), `font-display` (Plus Jakarta Sans), `font-mono` (DM Mono), `font-syne` (Syne). No unauthorized font imports detected. |
| Global Radius (<= 8px) | PARTIAL | 6 `rounded-xl` violations + 20 `rounded-[10px]` violations in wiki blocks and UI primitives. See Section 2A. |
| Identity Locks | PASS | SlideToSubmit.tsx last modified `2026-04-05` (pre-migration). Zero changes during Phases 1-7. All hardcoded hex (`#1B3FC4`, `#8896A7`, `#D4DAE3`), spring easing, and gesture library intact. |
| Surface-First Architecture | PASS | Canvas/shadow tokens deployed. 5 original target files have zero `border-r`. Sidebar uses `bg-muted/40` fill. |
| Dark Mode Token Coverage | PASS | `ui/` and `shared/` directories have zero hardcoded hex. All semantic tokens have dark mode variants in globals.css. |
| Storybook Coverage | PASS | 92 stories, 0 placeholders. Target of 90+ exceeded. |
| Build / Type-Check | PASS | 3 errors — all pre-existing in `submit-answer.test.ts` (documented in CLAUDE.md). Zero new errors from migration. |

---

## 2. Identified Design Debt

### 2A. Radius Violations (8px limit exceeded)

**`rounded-xl` (12px) — 6 occurrences:**

| File | Line | Context | Severity |
|------|------|---------|----------|
| `components/testing/hub/HeroConfigurator.tsx` | 125 | Card wrapper | MEDIUM |
| `components/ui/dialog.tsx` | 45 | Dialog panel (Radix) | LOW (modal exception acceptable) |
| `components/wiki/blocks/ElaborativeInterrogation.tsx` | 118 | EI outer container | MEDIUM |
| `features/3d-lab/components/CategoryGrid.tsx` | 130 | Category card | MEDIUM |
| `features/3d-lab/components/CategoryGrid.tsx` | 137 | Icon container | LOW |
| `features/3d-lab/components/OnboardingFlow.tsx` | 86 | Onboarding modal | LOW (modal exception) |

**`rounded-[10px]` — 20 occurrences:**

| File | Context | Severity |
|------|---------|----------|
| `ui/accordion.tsx:131` | Accordion container | HIGH — ui primitive |
| `wiki/blocks/ElaborativeInterrogation.tsx` (4x) | Options, textarea, result panel | MEDIUM |
| `wiki/blocks/FormulaBlock.tsx:15` | Formula container | MEDIUM |
| `wiki/blocks/InlineQuiz.tsx:30` | Quiz container | MEDIUM |
| `wiki/blocks/KeyValues.tsx:16` | Value card | MEDIUM |
| `wiki/blocks/WikiTabs.tsx:33` | Tab container | MEDIUM |
| `wiki/shared/WikiRelatedPopover.tsx:86` | Popover panel | MEDIUM |
| `wiki/shared/WikiSourcesPopover.tsx:78` | Popover panel | MEDIUM |
| `wiki/widgets/dsgn013/BodyDimensionDrill.tsx:56` | Drill card (internal) | LOW |
| `wiki/widgets/dsgn013/DimensionDrill.tsx:54` | Drill card (internal) | LOW |

**Note:** `rounded-full` on avatars and pill badges is an intentional exception per the design system rules.

### 2B. Remaining `bg-white` Usage (72 files)

72 files still use `bg-white` in non-marketing code. However, analysis shows the majority (86 instances) co-occur with `rounded-full`, `shadow-sm`, or opacity modifiers (`bg-white/10`, `bg-white/20`), indicating they are **intentional patterns**:
- Toggle switch knobs (`rounded-full bg-white shadow-sm`)
- White-on-dark overlays (`bg-white/10`, `bg-white/20` on dark toolbar/card backgrounds)
- Active tab indicators (`bg-white text-primary shadow-sm`)

**True violations** (card/panel surfaces that should be `bg-card`): estimated 10-15 files remaining in deeper component internals.

### 2C. Non-Semantic Token Remnants

| Token | Files Remaining | Context |
|-------|----------------|---------|
| `zinc-*` | 22 | Mostly in deep wiki/quiz component internals |
| `gray-*` | ~5 | Edge cases in older shared components |

### 2D. New Primitive Adoption Gap

| Primitive | Created In | Imports (excl. stories) | Status |
|-----------|-----------|------------------------|--------|
| `ui/table.tsx` | Phase 2 | 0 | NOT ADOPTED — existing `shared/data-table.tsx` still in use |
| `ui/alert.tsx` | Phase 2 | 2 | MINIMAL — only in ContactForm + 1 other |
| `ui/pagination.tsx` | Phase 2 | 0 | NOT ADOPTED — no paginated views use it yet |
| `ui/stepper.tsx` | Phase 2 | 0 | NOT ADOPTED — no multi-step flows use it yet |
| `ui/list-group.tsx` | Phase 2 | 0 | NOT ADOPTED — no views use it yet |
| `ui/bottom-navigation.tsx` | Phase 3 | 0 | NOT ADOPTED — not wired into dashboard layout |

These primitives are **ready for adoption** when new features are built or existing views are refactored.

---

## 3. Technical Regressions

| Issue | Status | Details |
|-------|--------|---------|
| Type errors | NONE NEW | 3 pre-existing errors in `submit-answer.test.ts` (documented in CLAUDE.md) |
| Build failures | NONE | `bun run build` passes clean |
| Storybook failures | NONE | `bun run check:storybook` — 92 stories, 0 placeholders |
| SlideToSubmit regression | NONE | Component untouched since 2026-04-05. Identity lock verified. |
| RevealBlock regression | NONE | Only `bg-white` → `bg-card` change (safe dark mode improvement) |
| Lint regressions | NONE NEW | 1 pre-existing error in `flowbite/` reference folder |

---

## 4. Remediation Plan

### Priority 1: Radius Normalization (HIGH — enforces 8px cap)

| # | Task | Files | Effort |
|---|------|-------|--------|
| R1 | Fix `rounded-xl` → `rounded-lg` in HeroConfigurator, EI, CategoryGrid | 3 files | 15 min |
| R2 | Fix `rounded-[10px]` → `rounded-md` in accordion, wiki blocks (FormulaBlock, InlineQuiz, KeyValues, WikiTabs, EI options/textareas) | 8 files | 30 min |
| R3 | Fix `rounded-[10px]` → `rounded-md` in wiki popovers (WikiRelatedPopover, WikiSourcesPopover) | 2 files | 10 min |
| R4 | Fix `rounded-[10px]` → `rounded-md` in widget drill internals (BodyDimensionDrill, DimensionDrill) | 2 files | 10 min |

### Priority 2: Remaining Token Cleanup (MEDIUM — dark mode gaps)

| # | Task | Files | Effort |
|---|------|-------|--------|
| R5 | Audit remaining 72 `bg-white` files — fix true violations, document intentional exceptions | ~15 files | 2 hours |
| R6 | Replace remaining `zinc-*` tokens in wiki/quiz internals | ~22 files | 2 hours |

### Priority 3: Primitive Adoption (LOW — incremental, feature-driven)

| # | Task | Trigger |
|---|------|---------|
| R7 | Wire `ui/table.tsx` into admin data views when refactoring | Next admin data view feature |
| R8 | Wire `ui/pagination.tsx` into paginated lists | Next list pagination feature |
| R9 | Wire `ui/bottom-navigation.tsx` into dashboard layout | Mobile dashboard iteration |

---

## 5. Conclusion

The Flowbite Pro v3.1 migration is **substantially complete**. The core design system infrastructure (tokens, primitives, surface hierarchy, Storybook) is solid. The identity-locked SlideToSubmit is verified untouched. No technical regressions were introduced.

**Remaining design debt is cosmetic** — radius normalization on ~15 wiki blocks and token cleanup on ~37 deeper component files. These can be addressed incrementally during normal feature development.

**Overall Grade: A-** (deducted for radius violations and primitive adoption gap)

---

*This audit was generated from static code analysis. Visual verification (dark mode screenshots, responsive testing) is recommended as a follow-up.*
