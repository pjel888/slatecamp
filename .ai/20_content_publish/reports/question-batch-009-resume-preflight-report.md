# Question Batch 009 Resume Preflight Report

```text

 M src/components/dashboard/HeroCommandBar.tsx
 M src/components/landing/LandingPageContent.tsx
 M src/components/landing/LandingPageFallback.tsx
 M src/components/layouts/SharedPageLayout.tsx
 M src/components/marketing/HeroHeadline.tsx
 M src/components/marketing/HeroSection.tsx
 M src/components/marketing/MarketingFooter.tsx
 M src/components/marketing/MarketingNav.tsx
 M src/components/marketing/PricingCard.tsx
 M src/components/quiz-v2/CalculatingResultsOverlay.tsx
 M src/components/quiz-v2/MicroBreakOverlay.tsx
 M src/components/quiz-v2/QuestionPalette.tsx
 M src/components/quiz-v2/SocraticExplorer.tsx
 M src/components/shared/DashboardHeader.tsx
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
?? .ai/content-audit-export/articles/allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c/question-edits/38075322-c38c-402b-98ad-058e9aa5efce.push-report.json
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-665Z-15a988b4/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-753Z-18a35491/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-810Z-af4ccd42/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-866Z-1bc4bc5e/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-925Z-9229b104/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-55-982Z-07d04651/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-040Z-81dbf61f/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-098Z-6287bc53/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-156Z-65b31db6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-211Z-c562a85f/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-267Z-c6afdd85/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-325Z-59c417ff/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-381Z-9848a959/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-436Z-ea88805c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-492Z-290d18c6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-551Z-1a582c2b/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-607Z-876f65e4/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-663Z-1489c149/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-721Z-60ca1431/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-777Z-4e4b7157/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-833Z-7eead8bd/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-892Z-cfb19d4c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-56-950Z-7ba22a1a/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-006Z-da78bf4a/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-062Z-78435da5/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-120Z-dff35043/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-179Z-264eee59/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-236Z-5680268c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-293Z-1468b9cd/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-349Z-d2d6e112/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-405Z-4013b6b6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-463Z-d2446bc3/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-522Z-8c601e7a/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-578Z-6c01d0e6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-636Z-852b9bae/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-694Z-24e3778b/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-751Z-2d3f46fb/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-807Z-4050fb2a/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-865Z-c764a8a8/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-922Z-6eabd49f/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-57-981Z-aafccf71/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-038Z-9d5e09a8/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-094Z-3ce34ddb/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-152Z-e47a58c9/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-210Z-ba491fc3/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-267Z-9381dfbf/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-325Z-7c28860c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-381Z-ba9fcf58/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-438Z-6a8b828c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T09-57-58-496Z-d7a0040c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-11-747Z-884b2a34/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-11-863Z-161dd475/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-11-921Z-5f426f2c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-11-977Z-261daf12/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-033Z-b5bb204f/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-094Z-861aa219/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-149Z-bce97afe/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-205Z-ef5d632c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-261Z-fa2f93c7/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-319Z-27fb0ff7/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-373Z-ad058652/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-429Z-96e16198/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-486Z-d35f6ccb/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-542Z-f33ad2bc/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-598Z-9494f377/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-655Z-d9eefdbf/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-711Z-5838a74d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-769Z-e05a1e4b/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-825Z-f688ac26/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-881Z-06bfba07/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-937Z-911348ed/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-12-992Z-0ac07d7e/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-048Z-5c1e88f9/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-104Z-18773ca0/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-172Z-dd273b17/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-230Z-25d59ef6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-286Z-f48d516c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-341Z-1d3ea9ed/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-397Z-3dd66f72/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-452Z-de9fbab2/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-507Z-f14ddf42/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-563Z-2557bd71/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-618Z-fd96a5f2/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-673Z-61823926/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-732Z-cc18ecc3/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-788Z-9535b0a7/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-844Z-328c5c31/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-904Z-f879c815/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-13-961Z-616e5ea0/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-019Z-53dd387e/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-077Z-10804781/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-132Z-661ee850/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-190Z-01808c8b/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-245Z-88f8ce5d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-301Z-9bded256/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-355Z-4b412676/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-411Z-175e880c/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-467Z-3af317ef/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-521Z-1895f0e5/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-14-577Z-de07a740/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-101Z-dd75b240/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-184Z-bc0311ea/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-241Z-e0fd8210/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-296Z-9975c106/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-352Z-cd148c5b/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-407Z-050dabe1/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-463Z-c052cb20/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-519Z-1016bee6/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-575Z-66678c8d/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-629Z-33f1545f/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-685Z-b68752b1/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-741Z-72d62997/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-796Z-3394b447/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-857Z-07ad5fca/
?? .ai/content-audit-export/runs/content-roundtrip-2026-05-06T10-02-26-916Z-77b0cced/
## branch
redesign/quiz-mode-hub
## log
bcc4db0b5 Update SlateCamp question remediation handoff after batch 008
62c55af03 Publish verified SlateCamp question batch 008
b41d990c6 Publish verified SlateCamp question batch 007
823319d2d Publish verified SlateCamp question batch 006
75020203a Publish verified SlateCamp question batch 005
ab2430404 Update SlateCamp question remediation handoff
1dfab34c9 Publish verified SlateCamp question batch 004
9d2276ca4 Publish verified SlateCamp question batch 003
dc62b9a91 Quarantine SlateCamp question batch 002 review failures
8c7f1e0b5 Publish verified SlateCamp question batch 001
## env presence
SUPABASE_URL=missing
NEXT_PUBLIC_SUPABASE_URL=missing
SUPABASE_SERVICE_ROLE_KEY=missing
SUPABASE_SERVICE_KEY=missing
## validations
$ bun scripts/type-check.ts
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

$ bun scripts/content-audit/validate-bundles.ts
✓ validate 567 article bundle(s): blockers=0 warnings=0
{
  "ok": true,
  "checks": 6,
  "outputs": 10
}
{
  "ok": true,
  "checks": 8,
  "outputs": 50
}
## scoped secret scan

```

Remote publish credentials: missing. Local candidate generation continued; remote apply blocked.
