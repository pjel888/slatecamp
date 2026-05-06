# Batch 003 Post-Publish Validation
Wed May  6 09:33:11 UTC 2026
## remote verification
# Apply Report

Batch: batch-003
Applied attempts: 30
Verified: 30
Failures: 0

- `f2c105fd-51fc-4b48-b53a-77242dbb91b0` / uap-spp-doc-standards-of-professional-practice-for-philippine-architects / verified=True
- `f7861b5b-0833-4cd3-a634-0dfb9f53891c` / spp-doc-209-architectural-consulting-services-pacs / verified=True
- `e37575ae-c640-4ddc-911a-7553f338b981` / lea-prac-svc-025-core-concept / verified=True
- `1d37a355-c8bf-4d5e-a41b-07a9817a4427` / lea-util-004-04-when-fire-alarm-systems-are-mandatory-ra-9514-irr / verified=True
- `1277bf71-f3cc-4d29-86a8-8cadca0133f9` / lea-prac-svc-015-full-time-supervision-vs-construction-management-vs-spp-202-administration / verified=True
- `6604a199-6687-435d-aeb1-ffdc46be7d23` / lea-prac-eth-001-core-concept / verified=True
- `265185c0-c1ac-4f40-8db0-bde23084f634` / lea-prac-eth-010-introduction / verified=True
- `687e0da7-4e39-454f-b3f8-a95308678556` / building-permit-process / verified=True
- `02a5ba32-0443-4162-837d-326783ed77a2` / lea-prac-law-001-ra-9266-overview-history-legislative-intent-and-key-definitions / verified=True
- `c534d94f-967a-48bb-babf-419fa6d35ec7` / spp-doc-204-a-fulltime-supervision-services / verified=True
- `0b116082-5275-4d0f-bb23-ce5b74339001` / lea-prac-svc-004-spp-doc-202-overview-the-six-phase-framework-and-its-design-logic / verified=True
- `3a00f9dd-5b51-4ce3-9004-5ef0eec99a26` / lea-prac-svc-008-phases-4-and-5-bidding-assistance-and-construction-administration-under-spp-202 / verified=True
- `9a800f21-b26e-4e3e-94c8-2f4127eccd42` / spp-doc-203-specialized-architectural-services / verified=True
- `fba5f537-2da9-4fb3-b6eb-696d1937a92a` / spp-doc-208-architectural-design-competition-adc / verified=True
- `16bb270e-6887-4bbe-a62e-eace6c4d3fdb` / spp-doc-201-pre-design-services / verified=True
- `f5ed9c09-3191-4cd4-b1b0-9e6364212c36` / spp-doc-204-b-construction-management-services / verified=True
- `f74f79a0-1477-481f-9050-fa43d82f18bd` / spp-doc-206-comprehensive-architectural-services / verified=True
- `3e530aa4-6004-4664-a241-9634a725bd5c` / lea-prac-svc-010-core-concept / verified=True
- `24b0a3db-e6bc-45d0-a9a1-d83009112efb` / spp-doc-202-regular-design-services / verified=True
- `b3d5ae5b-09a9-426c-9feb-00932e5555aa` / lea-prac-svc-005-phase-1-schematic-design-deliverables-decisions-and-fee-earnedschematic-design-is-the-second-phase-under-spp-2022-following-project-definition-this-phase-translates-the-project-defini / verified=True
- `875396fa-1704-47b7-abb5-29f49c75fc78` / spp-doc-205-post-construction-services / verified=True
- `f76bad6c-4bdf-4d2c-bdfb-a3381c42e320` / spp-doc-207-design-build-services / verified=True
- `bceaa05b-1eaa-4369-a29c-fbd8aef6937b` / lea-prac-eth-006-obligations-to-fellow-architects-non-poaching-non-interference-and-professional-courtesy / verified=True
- `7a7a042f-4e5c-4a7b-90d1-93895e551c6d` / lea-prac-ctr-013-professional-indemnity-insurance-for-architects-what-it-covers-and-why-it-matters / verified=True
- `2ec8e3f1-4aa7-443f-8ca1-a77638b2a713` / lea-prac-svc-011-core-concept / verified=True
- `9ce707aa-5e91-4f79-a5a6-8bcdf582fa57` / lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card / verified=True
- `31d08115-b5ff-4b0e-b33e-522e25800da4` / lea-prac-svc-014-construction-management-services-scope-and-professional-authority / verified=True
- `303f8a75-b42b-4405-8c39-082b4d7b6322` / lea-prac-frm-021-quantity-surveying-and-cost-estimation-the-architect-s-role-vs-the-qs-professional-s-role / verified=True
- `3d710cad-8857-4d44-891c-1b1a010de2cd` / overview-professional-practice / verified=True
- `68dc5ecb-7b3f-4394-a7b7-770336b3ce98` / lea-util-001-06-core-concept / verified=True
## content validate
$ bun scripts/content-audit/validate-bundles.ts
✓ validate 567 article bundle(s): blockers=0 warnings=0
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

## diff-check
## secret scan
real_secret_matches 0
