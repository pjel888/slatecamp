# Drill / Quiz Network and Schema Audit

## 1. Request / Response Inventory

| Action | Request Schema | Response Type | Risk |
|--------|----------------|---------------|------|
| `startSession` | `startSessionInputSchema` | `StartSessionResult` | Mode key drift |
| `submitAnswer` | `submitAnswerInputSchema` | `SubmitAnswerResult` | Loose CAGE types |
| `endSession` | `endSessionInputSchema` | `EndSessionResult` | Payload size / Timeout |
| `getReviewData`| `z.object({ sessionId })` | `ReviewDataResult` | Large data fetch |

## 2. Schema Alignment Findings

### Finding: Loose CAGE Contract (Behavioral Data)
- **Problem**: `signalTrace` is `z.array(z.unknown())`.
- **Root Cause**: Lack of defined schema for touch events (x, y, pressure, timestamp) and sensor data.
- **Impact**: Behavioral inference models are trained on specific data structures; data drift here leads to "Invalid Attestation" failures that are hard to debug.
- **Evidence**: `src/lib/actions/quiz-v2/schemas.ts`.

### Finding: Mode Key Fragmentation (Three-Way Split)
- **Problem**: Modes are named differently across layers:
  1. UI/Routing: `focus-review`
  2. Internal Logic: `focused`
  3. Database/Library: `blindspot`
- **Impact**: Increased developer friction and high risk of "Undefined Mode" errors when adding new features or modes.
- **Evidence**: `DB_TEST_MODE_BY_APP_MODE` in `start-session.ts` and `generate-queue.ts`.

## 3. Error Shape Consistency
Errors are generally structured as:
```json
{ "success": false, "error": "CODE", "message": "Reason" }
```
This is consistent across the `quiz-v2` action set, but "Gated" errors (e.g., Tier required) carry additional metadata that should be standardized.

## 4. Verdict
Network contracts are functional but **architecturally messy** due to naming fragmentation and **operationally risky** due to loose behavioral typing.
