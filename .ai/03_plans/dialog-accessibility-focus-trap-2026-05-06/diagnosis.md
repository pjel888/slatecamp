# Diagnosis

## Root cause

The failure was an outdated/flaky E2E assertion, not a component accessibility defect.

Evidence:
- `AlertDialog` is a thin wrapper over `Dialog` / Base UI Dialog.
- Base UI Dialog Root defaults to `modal=true`, which includes focus trapping.
- The failure screenshot showed the dialog still open and `Cancel` active, meaning focus had settled inside the dialog.
- The failing assertion checked `document.activeElement?.closest(...)` synchronously after pressing Tab and returned a DOM node from `page.evaluate` instead of a serializable boolean/string.
- Base UI focus guards can briefly move focus through guard elements while wrapping, so the assertion needed to wait for focus to settle.

## Correct behavior

For this AlertDialog fixture:
- The dialog opens from the `Generate Sessions` trigger.
- Keyboard Tab stays within the dialog controls.
- Shift+Tab stays within the dialog controls.
- The focusable dialog controls are `Cancel` and `Generate`.
- Escape closes the dialog.

## Fix location

Changed only:
- `e2e/dialog-accessibility.spec.ts`

No change was made to:
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/dialog.tsx`
- `src/app/developer/tools/test-data/test-data-client.tsx`

## Why this is correct

The test now verifies user-observable accessibility behavior: after Tab/Tab/Shift+Tab, focus settles on one of the expected dialog controls and remains inside `[data-slot="dialog-content"]`. It no longer depends on a brittle synchronous implementation detail.
