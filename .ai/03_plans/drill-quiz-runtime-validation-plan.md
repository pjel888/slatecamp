# Drill / Quiz Runtime Validation Plan

## 1. Objective
Establish a repeatable manual smoke-test sequence to verify the stability of the Drill / Quiz flow after changes.

## 2. Test Sequence

### Step 1: Hub and Setup
- Navigate to `/dashboard/drills`.
- Verify readiness score ring and session history load.
- Select "Camp" mode. Verify setup page options match `MODE_PRESETS`.
- Slide to start.

### Step 2: Active Session
- Answer 3 questions correctly.
- Verify "Gated Delay" is active on the Next button.
- Answer 1 question incorrectly. Verify rationale and wiki link appear.
- Flag a question. Open Question Palette and verify flag status.
- Trigger "Micro Break" (if testing a high-count mode).

### Step 3: Persistence and Failure
- Refresh the page during an active session. Verify progress is restored from `localStorage`.
- Toggle airplane mode (or simulate 404). Answer a question. Verify "Offline" banner appears.
- Re-enable connection. Verify background sync.

### Step 4: Finalization and Results
- Complete the last question.
- Verify `CalculatingResultsOverlay` appears.
- Verify Score Reveal and Subject Breakdown load correctly.

### Step 5: Review
- Enter Review mode.
- Filter by "Incorrect".
- Verify annotations on options match the user's choice.

## 3. Approval Points
- UI must not "flicker" during transitions.
- No console errors should appear during the entire sequence.
- Readiness Score in Hub must reflect the impact of the completed session.
