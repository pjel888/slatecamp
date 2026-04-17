# Audit & Implementation Plan: Button Loading UI Refactor

## Objective
Refactor the global `Button` component to enhance loading feedback:
1.  Automatically handle a loading UI state for async `onClick` handlers.
2.  Set the button to `disabled` with matching visual styling upon click.
3.  Replace the internal content of the button with a loading spinner.
4.  Support an optional configuration to display loading text (e.g., "LOADING...") alongside or in place of the spinner.

## Audit of Existing Component (`src/components/ui/button.tsx`)
- **Current `Button`**:
  - Receives `loading` as a prop.
  - Replaces `leftIcon` with `Spinner` but keeps `children`.
  - Hides `rightIcon`.
  - Disables the button via `resolvedDisabled = loading || disabled`.
- **Current `PendingButton` / `SubmitButton`**:
  - Uses `pending` and `pendingLabel`.
  - `SubmitButton` uses `useFormStatus()` to automatically handle form submission state.

## Implementation Details

### 1. Update `ButtonProps`
- Add `loadingText?: React.ReactNode` to `ButtonProps`.

### 2. Manage Automatic Loading State
- Update the `Button` component to optionally manage its own loading state if `onClick` is an async function.
- If an async `onClick` is provided, the component should:
  - Set an internal `isAutoLoading` state to `true` when clicked.
  - Await the `onClick` promise.
  - Set `isAutoLoading` back to `false` when finished.
  - Combine `isAutoLoading` with the `loading` prop for the final `resolvedLoading` state.

### 3. Update Rendering Logic
- If `resolvedLoading` is `true`:
  - Replace entire internal content (icons + children) with `Spinner`.
  - If `loadingText` is provided, render it next to the `Spinner`.
  - Ensure the layout remains consistent (e.g., centered).

### 4. Ensure Visual Fidelity
- The `disabled` state is already applied when `loading` is true.
- Ensure the `pointer-events-none opacity-70` classes are correctly applied.

## Sub-tasks
- [x] Update `ButtonProps` interface. [STAGE 2]
- [x] Implement internal `isAutoLoading` state and update `onClick` logic. [STAGE 2]
- [x] Refactor render output to handle `loading` state per requirements. [STAGE 2]
- [x] Update `Button.stories.tsx` to reflect new behavior and test variants. [STAGE 2]
- [x] Verify existing usages of `Button` aren't broken. [STAGE 2]

## Verification Plan
- **Manual Verification**: Test the new `Button` variants in Storybook.
- **Storybook**: Add new stories for `SpinnerOnly`, `SpinnerWithText`, and `AsyncLoading`.
- **Unit Test**: (If applicable, though manual Storybook check is primary for UI).
- **Build & Lint**: Ensure `bun run lint` and `bun run type-check` pass.

## Success Criteria
- Clicking an async button automatically triggers the loading state.
- Button is disabled while loading.
- Content is replaced by Spinner (and optional text).
- Default button behavior remains intact for non-loading states.
