# Componentization Candidate Catalog

**Generated:** 2026-05-04
**Repository:** /Users/philiplewis/slatecamp
**Branch:** codebase-modernization-batch1-2
**Scope:** Catalog only — no implementation

---

## Candidate 1: SettingsCard (Configuration Card Pattern)

### Pattern Description
A structured card with: `border-border shadow-sm overflow-hidden` wrapper → header with `bg-muted/50 border-b border-border` → icon in `bg-primary/10 p-2 rounded-md` → `CardTitle` (text-base font-bold) + `CardDescription` (text-xs text-muted-foreground) → body content.

### Repeated Locations (7 instances)
| File | Variant |
|------|---------|
| `src/app/dashboard/settings/profile-card.tsx` | Full-featured with form sections |
| `src/app/dashboard/settings/discipline-card.tsx` | List selection pattern |
| `src/app/dashboard/settings/notifications-card.tsx` | Toggle switches in rows |
| `src/app/dashboard/settings/account-center-card.tsx` | Nested info cards |
| `src/app/dashboard/settings/account-mode-card.tsx` | Radio-style mode selector |
| `src/app/dashboard/settings/theme-card.tsx` | Simplified variant (no icon-header) |
| `src/app/dashboard/settings/logout-card.tsx` | Uses shadcn Card directly |

### Proposed Component Name
`SettingsCard` — a compound component with `SettingsCard.Header` (icon + title + description) and `SettingsCard.Body`.

### Benefit
- Eliminates ~50 lines of repeated header markup per card
- Consistent look across all 7 settings cards
- Single place to adjust border/shadow/spacing for the settings page

### Risk
- MEDIUM: Cards have different content patterns (forms, lists, toggles); the shared part is only the header shell
- Some cards (theme-card, logout-card) use simpler variants that may not fit a rigid compound pattern

### Blast Radius
- 7 files in `src/app/dashboard/settings/`
- Settings page (`page.tsx`) would need import updates
- Any other configuration-style cards in the app could adopt this pattern

---

## Candidate 2: Ad-hoc Loading Skeleton → RouteSkeleton

### Pattern Description
Loading states composed of inline `<Skeleton>` elements arranged in page-specific layouts. 104 total `loading.tsx` files exist; 86 use ad-hoc skeleton patterns; only ~19 use shared skeleton components (`DashboardPageSkeleton`, `CardSkeleton`, `StatCardSkeleton`, `TableRowSkeleton`).

### Repeated Locations
**86 files** with ad-hoc skeleton compositions across:
- `src/app/dashboard/*/loading.tsx` (area-c, analytics, assessment, quiz, etc.)
- `src/app/admin/*/loading.tsx` (3d-models, ai-audit, assets, knowledge, etc.)
- `src/app/developer/*/loading.tsx` (api-reference, architecture, status, tools)
- `src/app/tools/*/loading.tsx` (floor-tiles-calculator, lot-plotter, wall-paint-calculator)
- `src/app/(auth)/*/loading.tsx`
- `src/app/(protected)/ceo/*/loading.tsx`
- Public pages: pricing, about, contact, try

### Common Sub-patterns Identified
1. **PageHeaderSkeleton**: Heading + subtitle skeleton (appears in 40+ files)
2. **CardGridSkeleton**: Grid of skeleton cards (2, 3, or 4 columns)
3. **KpiRowSkeleton**: Row of metric skeleton cards (label + value)
4. **TableSkeleton**: Table rows with column count
5. **FormSkeleton**: Stack of input-like skeletons

### Proposed Component Name
`RouteSkeleton` — a compound skeleton system with presets:
- `RouteSkeleton.PageHeader` (title + description)
- `RouteSkeleton.CardGrid` (configurable columns, items)
- `RouteSkeleton.KpiRow` (configurable count)
- `RouteSkeleton.Table` (configurable rows, columns)
- `RouteSkeleton.Form` (configurable fields)

### Benefit
- Replaces 86 ad-hoc skeleton compositions with a declarative API
- Consistent loading UX across all routes
- Easier to maintain as design system evolves
- Reduces loading.tsx files from ~20 lines to ~5 lines each

### Risk
- HIGH: 86-file blast radius; need careful rollout
- Some loading states are intentionally page-specific (e.g., DashboardPageSkeleton mirrors exact layout); a generic system may be less precise
- May need escape hatch for highly specific skeletons

### Blast Radius
- 86 loading.tsx files across all route groups
- Existing shared skeletons (`DashboardPageSkeleton`, `CardSkeleton`, etc.) become internal implementations
- `src/components/ui/skeleton.tsx` — may need new export variants

---

## Candidate 3: ErrorPage (Route Error Boundary)

### Pattern Description
`'use client'` → `useEffect` with `console.error` → centered flex column layout (`min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8`) → error icon (Warning/AlertTriangle) → title (font-display text-xl) → error message (max-w-sm text-sm text-muted-foreground) → retry button + back link.

### Repeated Locations (8 instances)
| File | Icon | Title Pattern | Back Link |
|------|------|---------------|-----------|
| `src/app/error.tsx` | none | "Something went wrong" | none |
| `src/app/(auth)/error.tsx` | none | "Authentication error" | Login |
| `src/app/admin/error.tsx` | Warning | "Something went wrong" | none |
| `src/app/developer/error.tsx` | Warning | "Something went wrong" | none |
| `src/app/dashboard/error.tsx` | none | "This section failed to load" | Dashboard |
| `src/app/dashboard/analytics/error.tsx` | AlertTriangle | "Something went wrong loading analytics" | none |
| `src/app/dashboard/wiki/error.tsx` | none | "Wiki failed to load" | Wiki home |
| `src/app/dashboard/3d-lab/error.tsx` | none | "The 3D Lab couldn't load" | Dashboard |

All 8 share: `useEffect` + `console.error`, centered layout, retry button. 5 of 8 include a back link.

### Proposed Component Name
`RouteError` — accepts props: `title`, `message`, `error`, `reset`, `backHref?`, `backLabel?`, `icon?`

### Benefit
- Single error boundary component instead of 8 near-identical implementations
- Consistent error UX across all route groups
- Easier to add error reporting instrumentation

### Risk
- LOW: Error pages are simple and rarely change
- Some have contextual icons/links; component must be flexible enough

### Blast Radius
- 8 error.tsx files across route groups
- `src/app/*/error.tsx` files become ~5-line wrappers

---

## Candidate 4: Quiz Session Shell (Parallel Implementations)

### Pattern Description
Full quiz session UI with: question display area, navigation (prev/next), timer, flagging, submit/exit modals, progress tracking.

### Repeated Locations
| File | Lines | Notes |
|------|-------|-------|
| `src/components/quiz-v2/BaseQuizShell.tsx` | 252 | Shared base for standard quiz modes |
| `src/components/quiz-v2/StandardQuizShell.tsx` | 239 | Wraps BaseQuizShell |
| `src/components/quiz-v2/SimulationShell.tsx` | 188 | Timed exam simulation |
| `src/components/quiz-v2/EnduranceShell.tsx` | 222 | Endurance mode |
| `src/app/dashboard/area-c/design-quiz/_components/DesignQuizSession.tsx` | 241 | Area C design quiz — separate implementation |
| `src/app/dashboard/dae-mode/_components/DAEQuizSession.tsx` | 198 | DAE mode quiz — separate implementation |
| `src/components/assessment/AssessmentQuiz.tsx` | 378 | Diagnostic assessment — separate implementation |

The quiz-v2 group (4 files, ~901 lines) is partially consolidated via BaseQuizShell. But DesignQuizSession, DAEQuizSession, and AssessmentQuiz (~817 lines) are independent parallel implementations.

### Proposed Component Name
Consolidate into the existing `BaseQuizShell` by extracting mode-specific behavior into strategy props/hooks. Alternatively: `QuizSessionProvider` + `useQuizSession` hook.

### Benefit
- 3 parallel quiz implementations (~817 lines) could share layout, navigation, timer, and modal logic
- Consistent quiz UX across all modes
- Bug fixes and accessibility improvements apply everywhere

### Risk
- HIGH: Quiz modes have fundamentally different interaction models (design problems show references, DAE has work context, assessment is linear with no skipping)
- Forcing unification could create a fragile abstraction
- Quiz is the most critical user-facing feature — regressions are high-cost

### Blast Radius
- 7 quiz session files across `components/quiz-v2/`, `app/dashboard/area-c/`, `app/dashboard/dae-mode/`, `components/assessment/`
- All quiz stores and types in `src/stores/`, `src/types/`
- Quiz routes in `src/app/dashboard/quiz/`, `src/app/quiz/`

---

## Candidate 5: ConfirmModal / ActionDialog

### Pattern Description
Modal dialog with: `Dialog`/`AlertDialog` wrapper → title → description text → destructive/warning action → cancel action → loading state on confirm.

### Repeated Locations
| File | Type |
|------|------|
| `src/components/quiz-v2/ExitConfirmModal.tsx` | Quiz exit confirmation |
| `src/components/quiz-v2/SubmitConfirmModal.tsx` | Quiz submit confirmation |
| `src/components/admin/DeleteArticleModal.tsx` | Article deletion |
| `src/components/ceo/RoleAssignmentModal.tsx` | Role change confirmation |
| `src/app/dashboard/pods/_components/CreatePodModal.tsx` | Pod creation form modal |

### Proposed Component Name
`ConfirmActionModal` — accepts: `title`, `description`, `confirmLabel`, `confirmVariant` (destructive/default), `onConfirm`, `onCancel`, `loading`, `children?` (for extra content like forms).

### Benefit
- Eliminates repeated Dialog/AlertDialog boilerplate
- Consistent confirmation UX (keyboard shortcuts, focus trapping, loading states)
- Single place to enforce accessibility patterns

### Risk
- LOW: Modals are well-understood patterns with clear props
- CreatePodModal includes a form — need to support content slot

### Blast Radius
- 5 modal files across admin, quiz, ceo, pods
- `src/components/ui/dialog.tsx` and `alert-dialog.tsx` (shadcn primitives remain)

---

## Candidate 6: PricingTierGrid (Pricing/Plan Display)

### Pattern Description
Grid of tier cards with: tier name, price, features list with checkmarks, limitations with X marks, highlighted CTA button, "highlighted" tier variant with ring/border.

### Repeated Locations
| File | Usage |
|------|-------|
| `src/components/marketing/PricingCard.tsx` | Individual pricing card (already a shared component) |
| `src/app/pricing/pricing-content.tsx` | Pricing page using PricingCard in tabs (3 tier groups) |
| `src/app/dashboard/upgrade/page.tsx` | Feature comparison table (different layout, same data shape) |

The PricingCard component is already well-abstracted. The upgrade page uses a different comparison table layout for the same tier data.

### Proposed Component Name
`PricingTierGrid` — wraps PricingCard in a responsive grid with optional tab navigation between tier groups.

### Benefit
- Pricing page and upgrade page share tier data structure
- Consistent tier presentation across marketing and paywall surfaces

### Risk
- LOW: Already well-factored; this is an incremental improvement
- Upgrade page uses a comparison table, not cards — may need both layouts

### Blast Radius
- 3 files in `src/components/marketing/`, `src/app/pricing/`, `src/app/dashboard/upgrade/`

---

## Candidate 7: DashboardWidgetCard (Server/Client/Skeleton Triplet)

### Pattern Description
Dashboard widget following the pattern: Server component fetches data → Client component renders → Skeleton component for Suspense fallback. All wrapped in `Suspense` in the dashboard page.

### Repeated Locations (in `src/components/dashboard/`)
| Server | Client/Skeleton |
|--------|-----------------|
| `HeroCommandBarServer.tsx` | `HeroCommandBar.tsx` (contains skeleton inline) |
| `SubjectMasteryServer.tsx` | `SubjectMasterySkeleton.tsx` |
| `StreakRibbonServer.tsx` | `StreakRibbonSkeleton.tsx` |
| `ReviewCalendarServer.tsx` | `ReviewCalendarSkeleton.tsx` |
| `BloomTrackerServer.tsx` | `BloomTrackerSkeleton.tsx` |
| `ActivityFeedServer.tsx` | `ImprovedActivityFeedSkeleton` (inline) |
| `DailyWikiServer.tsx` | (no skeleton — uses `null` fallback) |

7 server components follow the same fetch→render pattern with Suspense boundaries. The dashboard page (`src/app/dashboard/page.tsx`) has 12 `<Suspense>` blocks.

### Proposed Component Name
`DashboardWidget` — a pattern (not necessarily a component) using a factory or HOC: `createDashboardWidget({ server, skeleton, suspenseKey })`.

### Benefit
- Standardizes the widget contract: server fetch → Suspense → client render
- Reduces boilerplate in the dashboard page
- Makes adding new widgets predictable

### Risk
- MEDIUM: Widgets have different data dependencies and shapes; a factory pattern may be too rigid
- Some widgets have no skeleton (use `null` fallback)
- The dashboard page layout is carefully tuned — abstraction could reduce layout control

### Blast Radius
- 7 widget files in `src/components/dashboard/`
- Dashboard page in `src/app/dashboard/page.tsx`
- Any future dashboard widgets

---

## Candidate 8: EmptyState (Already Partially Consolidated)

### Pattern Description
Centered placeholder with icon, title, description, optional action button. Used when data is unavailable or zero.

### Current State
| File | Status |
|------|--------|
| `src/components/shared/empty-state.tsx` | **Unified EmptyState** (slot-based, `variant="default"|"card"`) |
| `src/components/analytics/ChartEmptyState.tsx` | Shim wrapping EmptyState (deprecated comment in file) |
| `src/components/calculators/CanvasEmptyState.tsx` | Separate implementation (3D canvas placeholder) |
| `src/features/3d-lab/components/templates/SceneEmptyState.tsx` | Separate (3D scene) |
| `src/features/3d-lab/components/shell/LabEmptyState.tsx` | Separate (lab browser) |

### Proposed Action
- Deprecate `ChartEmptyState` in favor of direct `EmptyState` usage
- Consider whether Canvas/Scene/Lab empty states can use EmptyState or truly need 3D-specific rendering

### Benefit
- Already 80% consolidated; finish the migration
- All non-3D empty states use the same component

### Risk
- LOW: ChartEmptyState is already a shim; just need to update consumers

### Blast Radius
- 5 files; numerous analytics components that import ChartEmptyState

---

## Candidate 9: FormField (Label + Input + Save Button Pattern)

### Pattern Description
Form section with: `<label>` → `<Input>` → `<Button type="submit" loading={...}>` Save `</Button>`, wrapped in `<form onSubmit={...}>`. Uses `useState` for field value, `useState` for loading, try/finally for async submission with toast feedback.

### Repeated Locations
| File | Number of form sections |
|------|------------------------|
| `src/app/dashboard/settings/profile-card.tsx` | 3 (name, avatar, exam date) + 1 setup form |
| `src/app/(auth)/onboarding/_components/OnboardingForm.tsx` | Multiple fields |
| `src/app/(auth)/onboarding/comp-exam/_components/ScoreEntryForm.tsx` | Score entry |
| `src/app/(auth)/login/login-form.tsx` | Login fields |
| `src/app/(auth)/register/register-form.tsx` | Registration fields |
| `src/app/(auth)/forgot-password/page.tsx` | Email field |
| `src/app/auth/reset-password/page.tsx` | Password fields |

### Proposed Component Name
`FormField` — encapsulates: label, description, input, error message, save button with loading state. Uses a render prop or children pattern for the input.

### Benefit
- Consistent form UX (loading states, error display, success toasts)
- Reduces repeated `useState` + `try/finally` + `toast` boilerplate
- Accessible label/input association enforced by component

### Risk
- MEDIUM: Forms have different validation, different input types, different submission patterns
- Abstracting too much creates a leaky abstraction
- Better as a pattern guide than a rigid component

### Blast Radius
- 7+ form files across auth, onboarding, settings
- Toast system (`src/lib/hooks/use-toast`)

---

## Candidate 10: AnalyticsChartSection (Chart Card Wrapper)

### Pattern Description
`AnalyticsChartContainer` wrapping a section component, arranged in responsive grid layouts with consistent `fallbackHeight` and `skeletonType` props.

### Repeated Locations
- `src/app/dashboard/analytics/page.tsx` — 25+ section instances
- `src/app/dashboard/analytics/advanced/page.tsx` — similar grid pattern
- Various CEO analytics pages

### Proposed Component Name
Already well-consolidated via `AnalyticsChartContainer`. The opportunity is in standardizing the grid layout composition (two-column, asymmetric, full-width patterns).

### Benefit
- Grid layout mixins for common chart arrangements
- Easier to add new analytics sections without re-deriving grid classes

### Risk
- LOW: AnalyticsChartContainer is already shared; this is about layout helpers

### Blast Radius
- `src/components/shared/analytics-chart-container.tsx`
- Analytics and CEO analytics pages

---

## Summary Table

| # | Candidate | Instances | Files Affected | Risk | Priority |
|---|-----------|-----------|----------------|------|----------|
| 1 | SettingsCard | 7 | 8 | MEDIUM | HIGH |
| 2 | RouteSkeleton | 86 | 86+ | HIGH | HIGH |
| 3 | RouteError | 8 | 8 | LOW | HIGH |
| 4 | QuizSessionShell | 7 | 7 | HIGH | MEDIUM |
| 5 | ConfirmActionModal | 5 | 5 | LOW | MEDIUM |
| 6 | PricingTierGrid | 3 | 3 | LOW | LOW |
| 7 | DashboardWidgetCard | 7 | 8 | MEDIUM | MEDIUM |
| 8 | EmptyState (finish) | 5 | varies | LOW | MEDIUM |
| 9 | FormField | 7+ | 7+ | MEDIUM | LOW |
| 10 | AnalyticsChartSection | 25+ | 3 | LOW | LOW |

**Quick Wins (Low Risk, High Impact):**
- Candidate 3 (RouteError) — 8 files, simple abstraction
- Candidate 5 (ConfirmActionModal) — 5 files, well-understood pattern
- Candidate 8 (EmptyState migration) — already 80% done

**High Value but Careful:**
- Candidate 1 (SettingsCard) — 7 files, visible consistency win
- Candidate 2 (RouteSkeleton) — 86 files, biggest impact but needs phased rollout

**Defer or Reconsider:**
- Candidate 4 (QuizSessionShell) — HIGH risk, quiz is critical path
- Candidate 9 (FormField) — may create leaky abstraction
