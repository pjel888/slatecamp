# Modal Standardization Audit and Migration Plan

Date: 2026-05-07
Repo: `/Users/philiplewis/slatecamp`
Branch observed at planning time: `fix/wiki-ui-block-placeholder-rendering`
Implementation branch validated: `feat/modal-standardization-kimi26`
Status observed at planning time: clean working tree.

## User directive

The navbar search popup is the visual standard:

- close button on the right
- title/header on the left
- optional footer
- one consistent shell/layout
- modal sizes can vary
- popup modals should use one modal UI component
- implementation should be delegated to Kimi 2.6 after plan approval

## Evidence inspected

Core primitives:

- `src/components/shared/Omnibar.tsx`
- `src/components/shared/floating-panel.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/sheet.tsx`

Local guidance:

- `.ai/00_system/slatecamp-authoritative-reference.md`
- `.hermes/checklists/ui-quality.md`
- `AGENTS.md`
- `DESIGN.md`

Generated inventory:

- `.ai/03_plans/modal-standardization-2026-05-07/modal-inventory.generated.json`

Inventory counts:

```json
{
  "Dialog/ConfirmDialog consumer": 20,
  "manual overlay/dialog-like": 31,
  "AlertDialog consumer": 2,
  "Popover consumer": 8,
  "named overlay-like file; inspect manually": 18,
  "FloatingPanel consumer": 2,
  "Sheet/mobile panel consumer": 4
}
```

Primitive counts:

```json
{
  "ConfirmDialog": 9,
  "AlertDialog": 3,
  "Dialog": 16,
  "DialogContent": 14,
  "DialogHeader": 14,
  "DialogFooter": 9,
  "Popover": 10,
  "FloatingPanel": 3,
  "CommandDialog": 2,
  "Sheet": 7,
  "SheetContent": 5,
  "AppDrawer": 1,
  "createPortal": 7,
  "DialogClose": 2
}
```

## Delegated model review

Consulted planning/review agents:

- Claude Code: recommended using the Omnibar/FloatingPanel layout as the modal shell, while keeping non-modal Sheet/Popover patterns out of scope.
- OpenCode: recommended a `ModalShell` wrapper that enforces the Omnibar layout and migrates dialog-shaped consumers first.
- CommandCode: recommended standardizing visually on `FloatingPanel`/Omnibar behavior, with mobile and alert-dialog risks called out.
- Kimi: argued for preserving Base UI Dialog accessibility under the hood and applying the Omnibar visual layout on top.

Final synthesis:

Use **one public SlateCamp popup modal component** with the Omnibar visual layout, but build it on the most accessible/focus-safe primitive. Do not blindly keep `FloatingPanel` as-is if it lacks focus trap, return-focus, scroll lock, `aria-labelledby`, and alert-dialog semantics.

## Recommendation

Create one canonical popup modal component:

- proposed path: `src/components/ui/modal.tsx`
- public import path: `@/components/ui/modal`
- visual standard: match the navbar search popup / current `FloatingPanel` shell
- accessibility base: prefer Base UI Dialog behavior from `src/components/ui/dialog.tsx`
- deprecation target: consumer use of `Dialog`, `ConfirmDialog`, `AlertDialog`, ad hoc `createPortal`, and manual `fixed inset-0` popup modals

This keeps Philip's visual standard while avoiding an accessibility regression.

## What remains separate

Do not force these into the popup modal standard unless a specific usage is actually a centered popup modal:

- `Sheet`: mobile nav, side panels, bottom sheets
- `Popover`: anchored non-modal disclosures
- pure loading overlays: non-interactive full-screen progress/loading screens
- R3F/canvas utility overlays: triage individually

The end state should be three overlay categories only:

1. `Modal` — popup/modal shell, Omnibar-style
2. `Sheet` — slide-in mobile/side panel pattern
3. `Popover` — anchored non-modal pattern

## Proposed API

```tsx
<Modal open={open} onOpenChange={setOpen} size="md">
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Search</ModalTitle>
      <ModalClose />
    </ModalHeader>

    <ModalBody>
      {children}
    </ModalBody>

    <ModalFooter>
      {actions}
    </ModalFooter>
  </ModalContent>
</Modal>
```

Required props/features:

- `open`, `onOpenChange`
- `size`: `sm | md | lg | xl | full | custom`
- optional `width`, `height`, `maxHeight`
- optional `footer`
- optional `subtitle`
- optional `headerActions`
- optional `variant`: `default | destructive | command | bare`
- optional `role`: `dialog | alertdialog`
- optional `closeOnEscape`
- optional `closeOnInteractOutside`
- optional `draggable` for Omnibar parity
- optional `sidecar/sidebar` only if needed by Omnibar/search
- enforced header: left title, right close button
- enforced footer placement: bottom border, consistent spacing
- enforced body scrolling: body scrolls, header/footer stay fixed

Shortcut helpers:

- `ConfirmModal` replaces `ConfirmDialog`
- `AlertModal` or `ConfirmModal variant="destructive" role="alertdialog"` replaces `AlertDialog`
- `CommandModal` replaces `CommandDialog` only if command palette behavior can be preserved safely

## Migration phases

### Phase 0 — branch and baseline

Owner: Hermes/Codex coordinator

1. Create an isolated branch/worktree for implementation.
2. Confirm clean git state.
3. Run baseline checks:
   - `bun run type-check`
   - `bun run lint`
4. Capture current Omnibar screenshots/measurements at desktop and mobile widths.

Acceptance:

- baseline known before edits
- no unrelated files touched

### Phase 1 — canonical Modal primitive

Owner: Kimi 2.6 implementation agent

1. Add `src/components/ui/modal.tsx`.
2. Implement Omnibar-style shell:
   - header left title/subtitle
   - right close button
   - optional footer
   - consistent border radius/shadow/background
   - flexible sizing
3. Use Base UI Dialog semantics/focus handling where practical.
4. Add stories/examples if Storybook surface is active:
   - default
   - footer actions
   - destructive confirm
   - command/search style
   - tall scrolling content
   - mobile width

Acceptance:

- Modal visually matches search popup standard
- keyboard/focus behavior verified
- no consumer migrated yet except optional story/demo

### Phase 2 — migrate the reference modal first

Owner: Kimi 2.6 implementation agent

1. Migrate `src/components/shared/Omnibar.tsx` from `FloatingPanel` to `Modal` or update `FloatingPanel` into a compatibility wrapper around `Modal`.
2. Preserve current user-visible behavior:
   - same title/header layout
   - close button position
   - footer presence
   - size and top-center/center position
   - keyboard shortcut open/close behavior
3. Decide whether draggable behavior is kept. If retained, keep it as optional `draggable`, not the default.

Acceptance:

- navbar search popup is the canonical implementation, not a one-off
- visual standard unchanged or improved

### Phase 3 — migrate easy Dialog/ConfirmDialog consumers

Owner: Kimi 2.6 implementation agent

Start with small, low-risk modals:

- `src/app/admin/pipeline/_components/PipelineCard.tsx`
- `src/components/admin/ArticleQuestionImporter.tsx`
- `src/components/admin/AssetDetailView.tsx`
- `src/components/admin/BulkActionBar.tsx`
- `src/components/admin/DeleteArticleModal.tsx`
- `src/components/admin/QuestionEditor.tsx`
- `src/components/admin/SMEReviewQueue.tsx`
- `src/components/admin/TaxonomyEditor.tsx`
- `src/components/ceo/FinancialLedger.tsx`
- `src/components/ceo/RoleAssignmentModal.tsx`
- `src/components/notes/NotesShell.tsx`
- `src/components/quiz-v2/ExitConfirmModal.tsx`
- `src/components/quiz-v2/SubmitConfirmModal.tsx`
- `src/components/sidebar/MobileDrawer.tsx`
- `src/components/sidebar/Sidebar.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/components/trails/CatchUpView.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/dialog.stories.tsx`

Migration pattern:

- `Dialog` -> `Modal`
- `DialogContent` -> `ModalContent`
- `DialogHeader` -> `ModalHeader`
- `DialogTitle` -> `ModalTitle`
- `DialogDescription` -> `ModalDescription` if retained
- `DialogFooter` -> `ModalFooter`
- `ConfirmDialog` -> `ConfirmModal`

Acceptance:

- no raw `Dialog` imports remain in migrated files
- footer/header layout consistent
- destructive confirmation still visually distinct

### Phase 4 — migrate AlertDialog wrappers

Owner: Kimi 2.6 implementation agent

Files:

- `src/app/developer/tools/test-data/test-data-client.tsx`
- `src/components/testing/hub/SessionsTable.tsx`

Acceptance:

- `role="alertdialog"` preserved where needed
- focus lands on safe/cancel action if destructive
- screen reader title/description still valid

### Phase 5 — manual popup overlays

Owner: Kimi 2.6 implementation agent, with Hermes review

Manual overlay/dialog-like files discovered:

- `src/app/dashboard/area-c/_components/DesignProblemSession.tsx`
- `src/app/dashboard/pods/_components/CreatePodModal.tsx`
- `src/app/dashboard/score-reveal/loading.tsx`
- `src/app/dashboard/welcome-pro/page.tsx`
- `src/components/assessment/AssessmentQuiz.tsx`
- `src/components/assessment/ScoreReveal.tsx`
- `src/components/ceo/FinancialEntryForm.tsx`
- `src/components/dev/dev-mode-overlay.tsx`
- `src/components/dev/dev-overlay.tsx`
- `src/components/quiz-v2/CalculatingResultsOverlay.tsx`
- `src/components/quiz-v2/MicroBreakOverlay.tsx`
- `src/components/quiz-v2/QuestionPalette.tsx`
- `src/components/quiz-v2/SocraticExplorer.tsx`
- `src/components/shared/GlobalLoadingOverlay.tsx`
- `src/components/shared/SlatecampLoader.tsx`
- `src/components/shared/WikiSidePanel.tsx`
- `src/components/shared/app-drawer.tsx`
- `src/components/shared/floating-panel.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/wiki/blocks/PrequestionGate.tsx`
- `src/components/wiki/quiz/WikiQuizButton.tsx`
- `src/components/wiki/quiz/WikiQuizModal.test.tsx`
- `src/components/wiki/quiz/WikiQuizModal.tsx`
- `src/components/wiki/shared/WikiRelatedPopover.tsx`
- `src/components/wiki/shared/WikiSourcesPopover.tsx`
- `src/features/3d-lab/DevControlsModule/dashboard/BottomSheet.tsx`
- `src/features/3d-lab/components/InfoPanel.tsx`
- `src/features/3d-lab/components/OnboardingFlow.tsx`
- `src/features/3d-lab/components/shell/CommandPalette.tsx`
- `src/features/3d-lab/components/stairway/ClickInspectPopover.tsx`

Triage each file into:

1. popup modal: migrate to `Modal`
2. loading overlay: keep or standardize separately, not a modal
3. side panel/sheet: keep as `Sheet`
4. canvas/dev utility overlay: defer unless user-facing

High-priority manual popup candidates:

- `src/app/dashboard/pods/_components/CreatePodModal.tsx`
- `src/components/ceo/FinancialEntryForm.tsx`
- `src/components/shared/WikiSidePanel.tsx`
- `src/components/shared/app-drawer.tsx` if it is acting as a modal drawer
- quiz confirmation/palette overlays after behavioral review

Acceptance:

- no ad hoc popup dialog uses `role="dialog"` plus manual `fixed inset-0` unless explicitly exempted
- exemptions documented in the plan/audit

### Phase 6 — command/search and special surfaces

Owner: Kimi 2.6 implementation agent, reviewed by Claude/OpenCode if available

Special cases:

- `src/components/portal/CommandPalette.tsx`
- `src/features/3d-lab/components/shell/CommandPalette.tsx`
- quiz-v2 overlays
- 3D lab overlays

Acceptance:

- keyboard navigation not broken
- focus restoration preserved
- R3F/canvas surfaces do not lose pointer/focus behavior

### Phase 7 — deprecate old primitives

Owner: Kimi 2.6 implementation agent, final review by Hermes/Codex

Only after consumers are migrated:

1. Remove or stop exporting `ConfirmDialog` from `src/components/ui/dialog.tsx`.
2. Replace `src/components/ui/alert-dialog.tsx` with compatibility exports or remove it if imports are gone.
3. Replace `CommandDialog` with `CommandModal` if safe.
4. Delete `FloatingPanel` only if Omnibar/QuickCapture no longer need it and no unique behavior remains.
5. Add an agent/dev instruction: new popup modals must import `@/components/ui/modal` only.

Acceptance:

- `rg '@/components/ui/dialog|@/components/ui/alert-dialog|FloatingPanel|role="dialog"|aria-modal' src` shows only intentional primitive/exemptions

## High-risk files/surfaces

- `src/components/shared/Omnibar.tsx`: must remain the visual standard.
- `src/components/shared/floating-panel.tsx`: current standard visually, but may lack full a11y/focus handling.
- `src/components/ui/dialog.tsx`: many consumers; should not be deleted before compatibility is proven.
- `src/components/ui/command.tsx`: keyboard navigation/focus-sensitive.
- `src/components/quiz-v2/*Overlay.tsx`, `ExitConfirmModal.tsx`, `SubmitConfirmModal.tsx`: student-facing and flow-critical.
- `src/features/3d-lab/**`: canvas/focus/pointer interaction risk.
- `src/components/shared/app-drawer.tsx`: custom portal with dialog semantics.
- `Sheet` consumers: do not migrate blindly; side panels are not popup modals.

## Validation checklist

Run after each migration phase:

```bash
bun run type-check
bun run lint
```

Visual/browser QA:

- navbar search modal
- at least one confirm modal
- one admin form modal
- one long-content modal with footer
- one mobile viewport modal
- one destructive/alert modal
- one quiz modal after quiz phase

Accessibility QA:

- Escape closes when allowed
- close button is reachable by keyboard
- focus is trapped inside modal
- focus returns to trigger on close
- `aria-labelledby` points to title
- `aria-describedby` used when description exists
- destructive modal uses `role="alertdialog"` where appropriate
- body scroll lock does not break mobile

Search gates:

```bash
rg "@/components/ui/dialog|@/components/ui/alert-dialog|@/components/shared/floating-panel|role="dialog"|aria-modal|fixed inset-0" src
```

## Definition of done

- one public popup modal component: `@/components/ui/modal`
- navbar search popup uses the canonical component
- popup modals share the same header/footer/close layout
- modal sizes vary only through supported props/variants
- `Dialog`, `AlertDialog`, `ConfirmDialog`, and ad hoc popup overlays are gone from consumers or documented as temporary compatibility wrappers
- `Sheet` and `Popover` are preserved only for their correct non-popup use cases
- type-check and lint pass
- browser QA confirms no visual regressions on search, admin, quiz, and mobile surfaces

## Implementation delegation

Implementation owner: Kimi 2.6.

Suggested Kimi 2.6 prompt:

```text
Implement the SlateCamp modal standardization plan in .ai/03_plans/modal-standardization-2026-05-07/README.md. Work in an isolated branch/worktree. Build the canonical @/components/ui/modal component first, using the Omnibar/FloatingPanel visual standard and Base UI Dialog accessibility semantics. Migrate Omnibar first, then low-risk Dialog/ConfirmDialog consumers. Do not migrate Sheet/Popover blindly. Run bun run type-check and bun run lint after each phase. Return changed files, checks, visual QA notes, and risks.
```
