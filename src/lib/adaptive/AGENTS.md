<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# adaptive

## Purpose

The `adaptive` directory implements adaptive feedback generation (Patent Claims 22, 23, 24): coach-voiced behavioral observations based on confidence × correctness quadrants (mastery/overconfidence/fragile/blindspot), disengagement detection, and session behavioral summaries for admin review. Used to surface actionable insights to students and flag integrity concerns.

## Key Files

| File | Description |
|------|-------------|
| `generateCoachObservation.ts` | Main exports: `generateCoachObservation()` for student-facing feedback, `generateSessionSummary()` for admin, `shouldTriggerIntervention()` for disengagement |

## For AI Agents

### Working In This Directory

**Confidence × Correctness Matrix (Patent Claim 22):**
- High Confidence + Correct = Mastery (celebrate).
- High Confidence + Incorrect = Overconfidence (most dangerous; flag for review).
- Low Confidence + Correct = Fragile (knowledge is shaky; reinforce).
- Low Confidence + Incorrect = Blindspot (true gap; revisit).

**Coach Observation Generation:**
- Input: ≥5 item results with {questionId, topicName, isCorrect, confidence}.
- Output: One coach-voiced message (max 4 sentences) with recommendations per topic.
- Rules:
  - Never use the word "confidence" as a metric label (use "decisive" or "hesitant").
  - Always pair observation with actionable next step: celebrate, revisit, reinforce.
  - Only surface if signal strength ≥30% (avoid noise).
  - Never surface integrity flags (CAGE, anomalies) to student.
  - Frame hesitation as useful information, not weakness.
- Returns null if insufficient signal (<5 items or <30% classified).

**Session Behavioral Summary (Patent Claim 24):**
- Input: array of {questionId, indicators} for all items in session.
- Output: `SessionBehavioralSummary` for admin review.
- Computes:
  - Session consistency score: inverse of average hesitancy (0–1).
  - Session engagement score: inverse of average anomalous behavior (0–1).
  - Integrity flags: CAGE failures, temporal anomalies (>0.8 hesitancy), behavioral anomalies (>0.7 anomaly likelihood).
- Stored in `session_behavioral_summaries` table for auditing.

**Disengagement Detection (Patent Claim 23):**
- Triggers after 5+ consecutive low-engagement items.
- Low engagement = guessing OR (high anomaly AND low hesitancy) = possible AFT (automated form-filling).
- Max 1 intervention per session.
- Returns boolean: should trigger break suggestion or engagement nudge.

### Common Patterns

**Generating Coach Observation:**
```typescript
import { generateCoachObservation } from '@/lib/adaptive'

const items = [
  { questionId: 'q1', topicName: 'Setbacks', isCorrect: true, confidence: 'high' },
  { questionId: 'q2', topicName: 'FLAR', isCorrect: false, confidence: 'high' },
  { questionId: 'q3', topicName: 'Setbacks', isCorrect: true, confidence: 'moderate' },
  // ... more items
]

const observation = generateCoachObservation(items)
// {
//   message: "You were decisive on X items... On Y items, you moved quickly but...",
//   recommendations: [{ topicName: 'Setbacks', action: 'celebrate' }, ...],
//   signalStrength: 'strong'
// }
```

**Session Behavioral Summary:**
```typescript
import { generateSessionSummary } from '@/lib/adaptive'

const items = [
  { questionId: 'q1', indicators: { decisionConfidence: 'high', hesitancyIndex: 0.1, ... } },
  // ... more items
]

const summary = generateSessionSummary(items)
// {
//   sessionConsistencyScore: 0.85,
//   sessionEngagementScore: 0.92,
//   integrityFlags: { cageFailures: 0, temporalAnomalies: 1, behavioralAnomalies: 0 }
// }
```

**Disengagement Check:**
```typescript
import { shouldTriggerIntervention } from '@/lib/adaptive'

const recentIndicators = [...] // Last 10 cognitive state indicators
const shouldTrigger = shouldTriggerIntervention(recentIndicators, interventionAlreadyFired)

if (shouldTrigger) {
  // Show: "Take a break?" or "Let's focus on X for a moment"
}
```

## Dependencies

### Internal

- **Types:** `CognitiveStateIndicators`, `ConfidenceClassification`, `CoachObservation`, `SessionBehavioralSummary` from `@/types/patent`.
- **Inference:** Confidence classification via `@/lib/inference/classifyConfidence`.

### External

- **Zero external npm dependencies.** Pure TypeScript feedback engine.
- **Target runtime:** Node.js (Server Actions) or browser (real-time coaching).

---

**Last Updated:** 2026-04-02

**For patent details, see `.claude/docs/patents/adaptive-feedback.md` in the repository root.**
