# Preflight Report

## admin-payload-validator.txt

```
{
  "ok": true,
  "checks": 5
}

```

## article-proposal-validator.txt

```
error: Module not found "scripts/content-audit/validate-article-improvement-proposals.ts"

```

## git-diff-check.txt

```

```

## lint.txt

```
$ bun run check:storybook && eslint .
$ bun scripts/check-storybook.ts
Storybook guard OK: 100 story file(s) scanned; 0 placeholder marker file(s) still tracked.
Baseline files already cleaned or removed:
- src/components/shared/action-card.stories.tsx
- src/components/shared/app-drawer.stories.tsx
- src/components/shared/breadcrumb.stories.tsx
- src/components/shared/SlatecampLoader.stories.tsx
- src/components/shared/content-sidebar.stories.tsx
- src/components/shared/DashboardHeader.stories.tsx
- src/components/shared/DashboardPageSkeleton.stories.tsx
- src/components/shared/data-table.stories.tsx
- src/components/shared/difficulty-bar.stories.tsx
- src/components/shared/empty-state.stories.tsx
- src/components/shared/event-badge.stories.tsx
- src/components/shared/floating-panel.stories.tsx
- src/components/shared/InfoTooltip.stories.tsx
- src/components/shared/legal-citation-badge.stories.tsx
- src/components/shared/LogoutButton.stories.tsx
- src/components/shared/mode-button.stories.tsx
- src/components/shared/Navbar.stories.tsx
- src/components/shared/NavigationProgress.stories.tsx
- src/components/shared/Omnibar.stories.tsx
- src/components/shared/page-header.stories.tsx
- src/components/shared/PanelCollapseHandle.stories.tsx
- src/components/shared/question-card.stories.tsx
- src/components/shared/question-dot-navigator.stories.tsx
- src/components/shared/QuickStatsRow.stories.tsx
- src/components/shared/score-display.stories.tsx
- src/components/shared/section-header.stories.tsx
- src/components/shared/sidebar-nav.stories.tsx
- src/components/shared/SourceBadge.stories.tsx
- src/components/shared/stat-card.stories.tsx
- src/components/shared/student-view-watermark.stories.tsx
- src/components/shared/taxonomy-picker.stories.tsx
- src/components/shared/taxonomy-tree.stories.tsx
- src/components/shared/ThemeProvider.stories.tsx
- src/components/shared/ThemeToggle.stories.tsx
- src/components/shared/WikiSidePanel.stories.tsx
- src/components/ui/accordion.stories.tsx
- src/components/ui/alert-dialog.stories.tsx
- src/components/ui/avatar.stories.tsx
- src/components/ui/badge.stories.tsx
- src/components/ui/button.stories.tsx
- src/components/ui/calendar.stories.tsx
- src/components/ui/card.stories.tsx
- src/components/ui/checkbox.stories.tsx
- src/components/ui/close-button.stories.tsx
- src/components/ui/command.stories.tsx
- src/components/ui/dialog.stories.tsx
- src/components/ui/dropdown-menu.stories.tsx
- src/components/ui/eyebrow.stories.tsx
- src/components/ui/form-field.stories.tsx
- src/components/ui/input.stories.tsx
- src/components/ui/input-group.stories.tsx
- src/components/ui/label.stories.tsx
- src/components/ui/popover.stories.tsx
- src/components/ui/progress.stories.tsx
- src/components/ui/progress-bar.stories.tsx
- src/components/ui/radio-group.stories.tsx
- src/components/ui/resizable.stories.tsx
- src/components/ui/scroll-area.stories.tsx
- src/components/ui/select.stories.tsx
- src/components/ui/separator.stories.tsx
- src/components/ui/sheet.stories.tsx
- src/components/ui/skeleton.stories.tsx
- src/components/ui/slider.stories.tsx
- src/components/ui/spinner.stories.tsx
- src/components/ui/switch.stories.tsx
- src/components/ui/tabs.stories.tsx
- src/components/ui/textarea.stories.tsx
- src/components/ui/toast.stories.tsx
- src/components/ui/toaster.stories.tsx
- src/components/ui/toolbar.stories.tsx
- src/components/ui/tooltip.stories.tsx

/Users/philiplewis/slatecamp/coverage/block-navigation.js
  1:1  warning  Unused eslint-disable directive (no problems were reported)

/Users/philiplewis/slatecamp/src/app/dashboard/camptrails/[slug]/page.tsx
  16:7  warning  'INTENSITY_LABELS' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars
  44:9  warning  'totalSteps' is assigned a value but never used. Allowed unused vars must match /^_/u        @typescript-eslint/no-unused-vars

/Users/philiplewis/slatecamp/src/components/wiki/article/WikiLearningJo
```

## preflight-commands.txt

```
## git status
 M .ai/00_performance/results/dev_server_memory_profile_built-app.json
 M .ai/00_performance/results/dev_server_memory_profile_dev-server.json
 M e2e/visual-login.spec.ts-snapshots/login-page-chromium-darwin.png
 M src/app/dashboard/pods/_components/CreatePodModal.tsx
 M src/app/globals.css
 M src/app/layout.tsx
 M src/app/pricing/pricing-content.tsx
 M src/components/ceo/FinancialEntryForm.tsx
 M src/components/dashboard/ActivityHeatmap.tsx
 M src/components/dashboard/DashboardContentFrame.tsx
 M src/components/dashboard/HeroCommandBar.tsx
 M src/components/landing/LandingPageContent.tsx
 M src/components/landing/LandingPageFallback.tsx
 M src/components/marketing/HeroHeadline.tsx
 M src/components/marketing/HeroSection.tsx
 M src/components/marketing/MarketingFooter.tsx
 M src/components/marketing/MarketingNav.tsx
 M src/components/marketing/PricingCard.tsx
 M src/components/quiz-v2/CalculatingResultsOverlay.tsx
 M src/components/quiz-v2/MicroBreakOverlay.tsx
 M src/components/quiz-v2/QuestionPalette.tsx
 M src/components/quiz-v2/SocraticExplorer.tsx
 M src/components/shared/WikiSidePanel.tsx
 M src/components/shared/app-drawer.tsx
 M src/components/shared/floating-panel.tsx
 M src/components/sidebar/MobileDrawer.tsx
 M src/components/sidebar/Sidebar.tsx
 M src/components/sidebar/SidebarFooter.tsx
 M src/components/sidebar/SidebarHeader.tsx
 M src/components/ui/dialog.tsx
 M src/components/wiki/blocks/PrequestionGate.tsx
 M src/components/wiki/quiz/WikiQuizButton.tsx
 M src/components/wiki/quiz/WikiQuizModal.test.tsx
 M src/components/wiki/quiz/WikiQuizModal.tsx
 M src/features/3d-lab/DevControlsModule/dashboard/BottomSheet.tsx
 M src/features/3d-lab/components/OnboardingFlow.tsx
?? .ai/02_audits/2026-05-05-landing-page-audit.md
?? .ai/03_plans/content-editorial-pipeline-2026-05-05/content-production-autopilot/
?? .ai/03_plans/sidebar-redesign-2026-05-06.md
?? public/images/dashboard/Dock-Lake-BG-Image.png
?? src/components/sidebar/SidebarFooterNotice.tsx
## branch
redesign/quiz-mode-hub
## log
b6a5bb341 Resolve Supabase staging blocker for editorial pipeline
b18ebbcc2 Validate admin audit sync on non-production Supabase target
498a8f687 docs: normalize rebaseline evidence formatting
cbb2bb945 Add Supabase rebaseline and admin audit staging path
7baa76bcb docs: record final autopilot continuation commit
da1001b0c Continue editorial pipeline implementation after Supabase safety stop
8874bf163 Harden controlled apply and rollback pipeline
aa13f23db Harden source pack and embedding dry-run pipeline
27b52d4f5 Expand question improvement proposal pipeline
b34c7b12e Expand source-grounded article proposal pipeline
## package scripts content-audit
content-audit:admin-audit-rebaseline-migration = bun scripts/content-audit/build-admin-audit-rebaseline-migration.ts
content-audit:admin-audit-rebaseline-validate = bun scripts/content-audit/validate-admin-audit-rebaseline-migration.ts
content-audit:admin-local-fixtures = bun scripts/content-audit/build-admin-audit-local-fixtures.ts
content-audit:admin-local-fixtures-validate = bun scripts/content-audit/validate-admin-audit-local-fixtures.ts
content-audit:admin-local-review-payload = bun scripts/content-audit/build-admin-local-review-payload.ts
content-audit:admin-local-review-payload-validate = bun scripts/content-audit/validate-admin-local-review-payload.ts
content-audit:admin-log = bun scripts/content-audit/sync-run-log-to-admin-audit.ts
content-audit:admin-payload-validate = bun scripts/content-audit/validate-admin-source-payload.ts
content-audit:admin-schema-probe = bun scripts/content-audit/validate-admin-ai-audit-schema.ts
content-audit:admin-shadow-migration = bun scripts/content-audit/build-admin-audit-shadow-migration.ts
content-audit:admin-shadow-migration-validate = bun scripts/content-audit/validate-admin-audit-shadow-migration.ts
content-audit:admin-shadow-schema-validate = bun scripts/content-audit/validate-admin-audit-shadow-schema.ts
content-audit:admin-sour
```

## question-proposal-validator.txt

```
error: Module not found "scripts/content-audit/validate-question-improvement-proposals.ts"

```

## source-pack-validator.txt

```
error: Module not found "scripts/content-audit/validate-source-pack-readiness.ts"

```

## type-check.txt

```
$ bun scripts/type-check.ts

```
