# Batch 010 Post-Publish Validation
Wed May  6 10:22:10 UTC 2026
## remote verification
# Apply Report

Batch: batch-010
Applied attempts: 41
Verified: 41
Failures: 0

- `974a7c85-c700-435b-80cc-8a2594a132a8` / lea-strc-001-05-core-concept / verified=True
- `4c706fb3-bd66-4bae-b4a6-2e8ed487031d` / lea-dsgn-010-02-core-concept / verified=True
- `3fe83b11-50d8-45ab-9530-936fb59fd974` / lea-plan-008-05-core-concept / verified=True
- `52d78a3d-6f0f-4d68-a8e3-39d02b78d68f` / lea-hist-002-04-core-concept / verified=True
- `abc56d0a-101e-4bef-9eda-e5412892652e` / lea-strc-010-02-core-concept / verified=True
- `f5374d6a-fc70-475e-83ce-7feb64056655` / lea-plan-005-01-what-you-need-to-know-for-the-lea / verified=True
- `5d49cedb-dc14-445a-b075-41fe56873081` / lea-plan-008-03-core-concept / verified=True
- `6d9a90b6-39bf-423b-9986-74b978939702` / lea-hist-014-01-core-concept / verified=True
- `fe7216ee-46ed-41b3-88ef-accb3f912a4c` / inca-architecture-ashlar-masonry / verified=True
- `f8d416c0-abfb-45be-a7ef-a9f98df06507` / chimneys-and-fireplaces / verified=True
- `c712ee78-2625-434c-bb18-fa7b0f477b33` / plastics-in-construction / verified=True
- `5f1e960c-b72a-483d-a04b-03860d27b07b` / the-bauhaus-and-international-style / verified=True
- `ae17af26-de0c-448e-a6d2-d64748f904fe` / post-modernism / verified=True
- `3a2cd639-0dd6-4c4b-ba34-cfafe6a8b046` / site-planning-accessible-routes-vs-open-space / verified=True
- `31fff533-f6b9-44dc-8d46-996e5413a587` / spanish-colonial-laws-of-the-indies / verified=True
- `2862e34d-02fd-4f95-a2a2-5119a355bdf8` / colonial-european-influence / verified=True
- `5a5eaf39-d265-427e-90dc-40bfeb763baf` / storage-of-x-ray-films / verified=True
- `265b961a-20fa-464e-a9c2-6a1398e1ab2e` / flora-and-fauna-in-site-development / verified=True
- `3a28da11-0053-4b2f-85a8-f675a3d10a43` / glass-and-glazing-area-limits / verified=True
- `ad9732f1-f733-4bc1-acb5-72b4bb53555d` / dangerous-and-ruinous-buildings / verified=True
- `aef59aa2-220e-47fc-9492-6b2bd98f9bea` / fire-resistive-construction-ratings / verified=True
- `7d26e59b-efc4-4ced-890b-6ec1dfee8254` / american-colonial-era / verified=True
- `850a66f9-db5d-4068-a763-0bc4c1d9872a` / minimum-parking-requirements / verified=True
- `e6c2a686-5b8c-477d-b5e4-d02bef987743` / pedestrian-protection-during-construction / verified=True
- `1a46c0de-3c18-45bc-874e-6dce4f13f5fe` / stages-and-platforms / verified=True
- `60c3b78a-e1c7-4c5e-880e-f9526d6c570d` / 21st-century-movements / verified=True
- `6e84b3e6-5dd9-4557-8202-5085d24a3708` / top-50-traps-2024-irr / verified=True
- `1262fe88-bb8f-4005-a9e8-0e8d6c03fe64` / ra-9442-pwd-privileges-and-incentives / verified=True
- `5fd2842e-ca3e-4e6d-bb87-65067d23a482` / north-american-indigenous-architecture / verified=True
- `4a8c01ab-5515-44f5-aaf7-c1274d8c8dce` / african-vernacular-earth-architecture / verified=True
- `a81062b3-5724-4bdc-8f70-dcfd9ef51e46` / microclimate-analysis / verified=True
- `f6fe1a69-b3c0-4c94-8341-9291c71c5006` / transport-nodes-escalators-walkways / verified=True
- `3ad2ad2a-e525-44c3-8edf-bf7036d9c31a` / rule-i-general-provisions / verified=True
- `691cf42d-0f6c-4686-b3d0-9a3bbd99da23` / ergonomics-in-furniture-design / verified=True
- `41447adf-185f-4a10-a0e9-16febe7b6168` / pre-colonial-vernacular / verified=True
- `4256d28b-076b-4c68-ad2d-9e27fdbcdf6b` / typology-checklists-and-plan-checking / verified=True
- `16ba355e-811c-4191-98c2-c7fac22ca59b` / location-on-property-and-exterior-walls / verified=True
- `36f5bf84-00c5-4534-a716-a05371ac8d23` / standard-human-body-dimensions / verified=True
- `578ca1ef-6eff-4810-b5dd-3b52c9bcb76b` / stairs-handrails-guardrails / verified=True
- `efb82628-9bf4-4bde-9561-8b784384c32c` / pre-columbian-mesoamerica / verified=True
- `fc84f5df-3b67-4891-bf56-596177e774fb` / mies-van-der-rohe / verified=True
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
warning: in the working copy of '.ai/content-audit-export/articles/public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9/candidate.md', CRLF will be replaced by LF the next time Git touches it
## scoped secret scan
warning: in the working copy of '.ai/content-audit-export/articles/public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9/candidate.md', CRLF will be replaced by LF the next time Git touches it
