# Batch 014 Post-Publish Validation
Wed May  6 10:39:53 UTC 2026
## remote verification
# Apply Report

Batch: batch-014
Applied attempts: 28
Verified: 28
Failures: 0

- `3d1c062c-7fef-4972-9245-c4e404639c49` / lea-prac-svc-003-space-programming-process-deliverables-and-use-in-design / verified=True
- `9527e4a9-f8f1-4554-999e-0d46cc49bcd1` / lea-prac-law-007-lea-eligibility-requirements-academic-credentials-dae-and-moral-character / verified=True
- `2e78ff36-673b-4de5-b01d-9cdc6bf31589` / lea-prac-law-015-copyright-duration-transfer-moral-rights-and-infringement-remedies / verified=True
- `355981c3-3480-4441-991d-8d8e94cd20b5` / lea-prac-svc-016-post-construction-services-building-administration-and-operations-support / verified=True
- `7c0e2fa5-7f3d-419a-b592-50346ac7ab2f` / lea-plan-003-02-what-you-need-to-know-for-the-lea / verified=True
- `2660de04-9a95-4581-83c1-792b09b79d48` / lea-prac-svc-022-architectural-design-competitions-types-rules-and-the-architect-s-rights / verified=True
- `debf8513-f91a-4e0a-9f32-8fe4f677ed71` / lea-prac-svc-009-specialized-allied-architectural-services-scope-and-compensation / verified=True
- `42d02acc-4cd7-4e90-8011-b001fcb26ff0` / lea-prac-ctr-002-basic-services-vs-additional-services-what-is-included-and-what-costs-extra / verified=True
- `946e44ee-e4d7-452d-a00a-066bae0f273c` / lea-prac-cmp-007-mdpe-multipliers-overhead-profit-non-technical-factors-and-philippine-practice-ranges / verified=True
- `5967e69f-d295-4dd2-9eb7-b4f1a321db4d` / lea-prac-cmp-003-project-construction-cost-pcc-definition-inclusions-and-what-the-architect-s-fee-is-based-on / verified=True
- `341161bb-c24a-4d65-8f8b-79a3e1b01076` / lea-plan-005-03-what-you-need-to-know-for-the-lea / verified=True
- `a96d6eed-5b52-47de-b752-83459747b468` / lea-prac-ctr-001-standard-owner-architect-agreement-core-provisions-obligations-and-structure / verified=True
- `425c5476-12a0-476c-96e3-3f10c1530a9c` / lea-prac-cmp-011-reimbursable-expenses-what-is-reimbursable-what-is-absorbed-and-how-to-bill / verified=True
- `b58c3d7f-d8c1-434e-9c12-dc58b3645440` / overview-history-of-architecture / verified=True
- `6882bbf1-7941-4289-a6b1-89a19e4c3923` / overview-architectural-design / verified=True
- `bb2f1b8b-855d-4eeb-aeb3-8cf3874508d0` / mastery-structural-conceptualization / verified=True
- `d39f0b0e-1219-4f42-a570-e08a6134d544` / overview-building-utilities-mepf / verified=True
- `b194f38e-8129-4f87-b161-f9f4f7fc43b1` / mastery-planning-housing-urban-design / verified=True
- `183eb4f6-8e99-4c13-85f2-f5b01e1a082a` / mastery-building-utilities-mepf / verified=True
- `ce165155-2e81-4ed6-b14e-7d81dbdfa464` / mastery-architectural-design / verified=True
- `1f8c0257-0b12-45c0-936c-d821b927a6e9` / overview-structural-conceptualization / verified=True
- `0871298e-f789-4d5e-9c50-cdf2556e4903` / mastery-history-of-architecture / verified=True
- `0d7083b9-a1bc-428c-b9b9-e8d4afa0c83c` / overview-theory-of-architecture / verified=True
- `367ef654-f42a-4eed-861d-b00648f5dba4` / lea-prac-ctr-006-the-contractor-s-obligations-scope-compliance-standards-and-the-guarantee-period / verified=True
- `fa149775-5062-4e43-9acb-7e95ad2bf173` / overview-planning-housing-urban-design / verified=True
- `91294dec-6b87-4601-b9c1-a5b303447da4` / mastery-building-materials / verified=True
- `73673e43-58fb-4393-a78b-bbfb45c914fb` / mastery-theory-of-architecture / verified=True
- `6e9a4321-c9db-4720-ab19-288e7f28be48` / overview-building-materials / verified=True
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

## content validate
$ bun scripts/content-audit/validate-bundles.ts
✓ validate 567 article bundle(s): blockers=0 warnings=0
## diff check
## scoped secret scan
