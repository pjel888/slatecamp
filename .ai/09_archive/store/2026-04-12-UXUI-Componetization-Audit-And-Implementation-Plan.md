# UX/UI Componentization Audit and Implementation Plan (2026-04-12)

## 1. Audit Scope
This audit covers the entire SlateCamp repository, specifically focusing on UI patterns, component modularity, and Storybook coverage across all application surfaces, including admin, dashboard, wiki, quiz-v2, and landing pages.

## 2. Executive Summary
The SlateCamp codebase possesses a robust primitive layer (`src/components/ui`) with high Storybook coverage. However, a significant "middle-layer gap" exists where complex composite components and feature-specific UI are often re-implemented in route files or lack any visual documentation. Critical features like `quiz-v2` and `dashboard` analytics have near-zero Storybook representation despite their high visual complexity. This plan identifies 12+ new modularization targets and 25+ critical Storybook gaps to be addressed in a prioritized three-phase roadmap.

## 3. Audit Method
- **Structural Mapping:** Analyzed the directory structure to identify functional boundaries.
- **Storybook Inventory:** Cross-referenced all `*.tsx` components against existing `*.stories.tsx` files.
- **Pattern Matching:** Used `grep` and manual code review to identify repeated JSX blocks, inline styles, and redundant logic in `src/app` routes.
- **Component Anatomy Review:** Evaluated local components in `_components` folders for reusability and API quality.
- **State Audit:** Checked for consistency in loading, empty, and error state implementations across features.

## 4. Repo Surface Reviewed
- `src/app/**/*`: All route files (Admin, Dashboard, Wiki, Tools, Auth).
- `src/components/ui`: Base primitives.
- `src/components/shared`: Cross-feature composites.
- `src/components/{dashboard,admin,wiki,quiz-v2,assessment,score}`: Feature-specific components.
- `src/features/*`: Modular features (3D Lab, Wall Configurator).
- `src/storybook`: Global scenes and configuration.

## 5. Existing Shared Component Inventory
| Category | Location | Health | Storybook Status |
| :--- | :--- | :--- | :--- |
| **Primitives** | `src/components/ui` | Excellent | 95% Coverage |
| **Composites** | `src/components/shared` | Good but fragmented | 40% Coverage |
| **Layouts** | `src/components/layouts` | Minimal | Missing Stories |
| **Dashboard** | `src/components/dashboard` | High Complexity | 0% Coverage |
| **Admin** | `src/components/admin` | Medium Complexity | 0% Coverage |
| **Wiki Blocks** | `src/components/wiki/blocks` | Modular | 60% Coverage |
| **Quiz-V2** | `src/components/quiz-v2` | Critical/High Complexity | 0% Coverage |

## 6. Storybook Coverage Summary
- **Total Components Identified:** ~150+
- **Total Story Files Found:** 92
- **Coverage Highlights:** All shadcn/ui primitives have robust stories.
- **Major Gaps:**
    - Entire `dashboard` feature (Heatmaps, Mastery Cards, Activity Feeds).
    - Entire `quiz-v2` feature (Shells, Inputs, Feedback Panels).
    - Entire `score` feature (Readiness rings, context cards).
    - High-value `shared` components: `Omnibar`, `Navbar`, `AppDrawer`, `ContentSidebar`.
- **Stale Coverage:** `src/storybook/scenes` contains some design system stories that diverged from latest Tailwind 4 tokens.

## 7. Severity-Ranked Findings
1. **Critical:** `quiz-v2` feature (the core product value) has zero Storybook coverage, making it high-risk for visual regressions during refactors.
2. **High:** Heavy repetition of `Suspense` + `ErrorBoundary` + `ChartSkeleton` in `src/app/dashboard/analytics/page.tsx`.
3. **High:** Local components `DeltaBadge` and `MemberAvatar` in `src/app/dashboard/pods/_components/PodView.tsx` are duplicated or ignored elsewhere.
4. **Medium:** Redundant empty state components (`ChartEmptyState` vs `EmptyState`).
5. **Medium:** Inconsistent `Card` + `SectionHeader` implementations across Admin and Dashboard layouts.

## 8. Detailed Findings Table

| ID | Severity | Category | Affected Files | Current Pattern | Issue Summary | Recommended Target | Storybook Action | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| F-001 | High | Route Repetition | `src/app/dashboard/analytics/page.tsx` | Repeated `Suspense` + `ErrorBoundary` wrappers | Massive boilerplate for every chart section. | `AnalyticsChartContainer` | Add story with loading/error states | P0 |
| F-002 | High | Missing Componentization | `src/app/dashboard/pods/_components/PodView.tsx` | Local `DeltaBadge` and `MemberAvatar` | Reusable UI trapped in a feature subfolder. | Promote to `src/components/shared` | Add stories for variants | P0 |
| F-003 | Critical | Storybook Gap | `src/components/quiz-v2/**/*` | No stories for core quiz engine components | Visual complexity is high, coverage is zero. | N/A (Existing components) | Create stories for `BaseQuizShell`, `FeedbackPanel` | P0 |
| F-004 | Medium | Duplicate Component | `src/components/analytics/ChartEmptyState.tsx`, `src/components/shared/empty-state.tsx` | Two different empty state components | Redundant logic and inconsistent styling. | Unify into `EmptyState` | Update existing story | P1 |
| F-005 | Medium | Composition Opportunity | `src/app/admin/knowledge/analytics/page.tsx` | Inline `Card` + `CardContent` + `SectionHeader` | Standard pattern but manually implemented with inline styles. | `DashboardMetricCard` | Add story for "Metric Section" | P1 |
| F-006 | High | Storybook Gap | `src/components/shared/Omnibar.tsx`, `Navbar.tsx`, `AppDrawer.tsx` | High-value shell components missing stories | Critical for testing layout consistency. | N/A (Existing components) | Create comprehensive stories | P0 |
| F-007 | Medium | Design System Violation | `src/app/admin/page.tsx` | Manual bar chart for "Content by Subject" | Repeats logic from `QuestionsAnalyticsPage` with different colors. | `SubjectDistributionBar` | Add story for all subject variants | P2 |
| F-008 | Low | API Weakness | `src/components/shared/DashboardPageSkeleton.tsx` | Massive, brittle manual skeleton | Difficult to maintain as dashboard layout changes. | `SkeletonGrid` / `SkeletonCard` | Add story for skeleton layouts | P2 |

## 9. Proposed Componentization Targets

### `AnalyticsChartContainer`
- **Proposed Name:** `AnalyticsChartContainer`
- **Location:** `src/components/shared/AnalyticsChartContainer.tsx`
- **Purpose:** Standardize chart loading, error, and empty states.
- **Source:** Extract logic from `src/app/dashboard/analytics/page.tsx`.
- **Expected Props:** `title`, `eyebrow`, `children`, `skeletonType`, `fallbackHeight`.

### `DashboardMetricCard` (Composite)
- **Proposed Name:** `DashboardMetricCard`
- **Location:** `src/components/shared/DashboardMetricCard.tsx`
- **Purpose:** Standardized container for metrics and charts with consistent padding and headers.
- **Source:** `src/app/admin/page.tsx`, `src/app/dashboard/page.tsx`.
- **Expected Props:** `SectionHeaderProps`, `children`, `padding` (default `p-4`).

### `SubjectDistributionBar`
- **Proposed Name:** `SubjectDistributionBar`
- **Location:** `src/components/shared/SubjectDistributionBar.tsx`
- **Purpose:** Unified bar visualization for subject metrics.
- **Source:** `src/app/admin/page.tsx`, `src/app/admin/knowledge/analytics/page.tsx`.

## 10. Proposed Storybook Additions and Repairs

### High-Priority Additions
- **`src/components/shared/Omnibar.stories.tsx`**: Must cover search states, command results, and shortcut tooltips.
- **`src/components/quiz-v2/BaseQuizShell.stories.tsx`**: Must cover all modes (Standard, Endurance, Simulation).
- **`src/components/score/ReadinessScoreRing.stories.tsx`**: Must cover percentage arcs, color thresholds, and animation states.
- **`src/components/shared/event-badge.stories.tsx`**: Documentation for all audit log event types.

### Repairs
- **`src/storybook/scenes/DesignSystem/Typography.stories.tsx`**: Update to reflect latest Tailwind 4 fluid typography settings.
- **`src/components/shared/data-table.stories.tsx`**: Add "Mobile/Responsive" variant story.

## 11. Implementation Roadmap

### Phase 1: Foundation Consolidation (P0)
- Extract `DeltaBadge` and `MemberAvatar` to `shared`.
- Unify `ChartEmptyState` and `EmptyState`.
- Add stories for `Omnibar`, `Navbar`, and `AppDrawer`.
- **Goal:** Clean up the shared layer and document the shell.

### Phase 2: Pattern Standardization (P1)
- Implement `AnalyticsChartContainer` and refactor analytics pages.
- Implement `DashboardMetricCard` and refactor dashboard/admin pages.
- Standardize skeleton patterns in `shared`.
- **Goal:** Eliminate route-level repetition.

### Phase 3: Feature Documentation (P2)
- Add story coverage for `quiz-v2` and `score` modules.
- Add story coverage for `admin` CMS components.
- **Goal:** 100% visual documentation for complex product features.

## 12. Recommended Refactor Sequence
1. **Refactor 1:** Extract `DeltaBadge` -> Update all instances -> Add Story.
2. **Refactor 2:** Create `AnalyticsChartContainer` -> Migrate 1 chart in `analytics/page.tsx` -> Verify -> Migrate all.
3. **Refactor 3:** Create `DashboardMetricCard` -> Migrate Admin Dashboard -> Migrate User Dashboard.
4. **Refactor 4:** Bulk create missing stories for `shared` components.

## 13. Risks and Guardrails
- **Risk:** Breaking chart responsiveness during container abstraction.
    - **Guardrail:** Use `ResizeObserver` patterns already established in `ActivityHeatmap`.
- **Risk:** Storybook fragmentation (stories for components that aren't truly modular).
    - **Guardrail:** Only add stories for components intended for reuse or complex product-facing features.
- **Risk:** Type safety during "Promotion" of local components.
    - **Guardrail:** Run `bun run type-check` after every promotion.

## 14. Acceptance Criteria
- [ ] All modular components in `src/components/shared` have Storybook coverage.
- [ ] `src/app/dashboard/analytics/page.tsx` uses `AnalyticsChartContainer` for all charts.
- [ ] No duplicated `DeltaBadge` logic exists in the repo.
- [ ] `quiz-v2` core shells are represented in Storybook.
- [ ] All stories pass visual regression (manual check) and linting.

## 15. Appendix: Candidate Index
- `src/app/dashboard/pods/_components/DeltaBadge.tsx` -> `src/components/shared/DeltaBadge.tsx`
- `src/app/dashboard/pods/_components/MemberAvatar.tsx` -> `src/components/shared/MemberAvatar.tsx`
- `src/app/admin/knowledge/analytics/page.tsx` (CoverageRow) -> `src/components/shared/CoverageProgress.tsx`
- `src/app/dashboard/settings/discipline-card.tsx` (Internal Card structure) -> `src/components/settings/SettingsCard.tsx`
