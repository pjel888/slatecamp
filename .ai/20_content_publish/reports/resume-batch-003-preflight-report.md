# Resume Batch 003 Preflight Report
Wed May  6 09:30:45 UTC 2026
## status
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
?? .ai/03_plans/sidebar-redesign-2026-05-06.md
?? .ai/03_plans/ui-componentization-audit-2026-05-06/
?? .ai/20_content_publish/reports/resume-batch-003-preflight-report.md
?? .ai/20_content_publish/scripts/run_article_batch.py
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-28-48-870Z-aa47eef0/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-28-49-071Z-fc03bc14/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-28-49-136Z-14573e5d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-29-37-155Z-6878dae5/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-29-37-303Z-c8026374/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-29-37-401Z-4dcc02cf/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-35-14-083Z-7034805e/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-38-27-603Z-0a6bd3dd/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T08-39-43-459Z-4be34454/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-22-915Z-1e59eb1d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-044Z-bab10588/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-125Z-b4562a31/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-200Z-295f891c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-338Z-cb17974d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-418Z-9e32c0c5/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-496Z-6f94619c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-594Z-075ecb75/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-678Z-fc2841e4/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-17-23-751Z-f0ec5301/
?? public/images/dashboard/Dock-Lake-BG-Image.png
?? src/components/sidebar/SidebarFooterNotice.tsx
## branch
redesign/quiz-mode-hub
## log
2570b9b6d Record batch 002 SlateCamp article content updates
d0fa0b9fb Clean batch 002 article diff whitespace
be3f7b9bd Publish next verified SlateCamp article batch
32f000cdc Publish verified SlateCamp content improvements
3b38d68cd Clean content production artifact whitespace
50c76c599 Improve SlateCamp article and question content
b6a5bb341 Resolve Supabase staging blocker for editorial pipeline
b18ebbcc2 Validate admin audit sync on non-production Supabase target
498a8f687 docs: normalize rebaseline evidence formatting
cbb2bb945 Add Supabase rebaseline and admin audit staging path
## env presence
{
  "process_env": {
    "SUPABASE_URL": false,
    "NEXT_PUBLIC_SUPABASE_URL": false,
    "SUPABASE_SERVICE_ROLE_KEY": false,
    "SUPABASE_SERVICE_KEY": false
  },
  "env_local_exists": true,
  "env_local_presence": {
    "SUPABASE_URL": false,
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "SUPABASE_SERVICE_KEY": false
  }
}
## type-check
$ bun scripts/type-check.ts
## lint
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

/Users/philiplewis/slatecamp/src/components/wiki/article/WikiLearningJourney.tsx
  33:3  warning  'subject' is defined but never used. Allowed unused args must match /^_/u     @typescript-eslint/no-unused-vars
  34:3  warning  'difficulty' is defined but never used. Allowed unused args must match /^_/u  @typescript-eslint/no-unused-vars
  35:3  warning  'readTime' is defined but never used. Allowed unused args must match /^_/u    @typescript-eslint/no-unused-vars

/Users/philiplewis/slatecamp/src/components/wiki/quiz/WikiQuizModal.tsx
  534:23  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

/Users/philiplewis/slatecamp/src/lib/actions/analytics-data.ts
  4:10  warning  'createClient' is defined but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

/Users/philiplewis/slatecamp/src/lib/wiki-markdown.ts
  211:9  warning  'knownSelfClosing' is assigned a value but never used. Allowed unused vars must match /^_/u      @typescript-eslint/no-unused-vars
  212:9  warning  'knownBlockComponents' is assigned a value but never used. Allowed unused vars must match /^_/u  @typescript-eslint/no-unused-vars

✖ 10 problems (0 errors, 10 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.

## content-audit validate
$ bun scripts/content-audit/validate-bundles.ts
✓ validate 567 article bundle(s): blockers=0 warnings=0
## diff-check
## secret scan
real_secret_matches 0
