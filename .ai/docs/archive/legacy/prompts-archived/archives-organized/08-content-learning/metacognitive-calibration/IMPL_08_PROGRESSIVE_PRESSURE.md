# IMPL_08: Progressive Pressure Ladder & Exam-Day Simulation Protocol

**Priority:** P2  
**Effort:** ~3 days  
**Research basis:** Stress inoculation training from sports psychology. Graduated exposure reduces performance anxiety.

---

## The Pressure Ladder

Currently SlateCamp jumps from Camp Mode (no timer, immediate feedback) to Storm Mode (full timer, no feedback). This cliff creates anxiety. The pressure ladder introduces intermediate levels.

### Pressure Levels

| Level | Timer | Per-Question Limit | Score Visible | Feedback | Unlock Condition |
|---|---|---|---|---|---|
| 0 — Learning | None | None | No | Immediate | Default |
| 1 — Awareness | Visible (count-up) | None | Session total | Immediate | Readiness Score ≥ 40 |
| 2 — Pacing | Visible (countdown) | Soft warning at 2× avg | Session total | End of session | Readiness Score ≥ 55 |
| 3 — Exam | Visible (countdown) | Hard skip at 3× avg | Hidden until end | After 24hr delay | Readiness Score ≥ 65 |

### Implementation

**File:** `src/lib/quiz/pressure-config.ts`

```typescript
export const PRESSURE_LEVELS = {
  0: {
    name: 'Learning',
    timer: 'none',
    perQuestionLimit: null,
    scoreVisible: false,
    feedbackTiming: 'immediate',
  },
  1: {
    name: 'Awareness',
    timer: 'count_up',
    perQuestionLimit: null,
    scoreVisible: true,
    feedbackTiming: 'immediate',
  },
  2: {
    name: 'Pacing',
    timer: 'countdown',
    perQuestionLimit: 'soft_warning', // Nudge at 2× median time
    scoreVisible: true,
    feedbackTiming: 'end_of_session',
  },
  3: {
    name: 'Exam',
    timer: 'countdown',
    perQuestionLimit: 'hard_skip', // Auto-advance at 3× median time
    scoreVisible: false,
    feedbackTiming: 'delayed_24h',
  },
} as const;
```

Store in `QuizSessionConfig`:
```typescript
interface QuizSessionConfig {
  // ... existing
  pressure_level: 0 | 1 | 2 | 3;
}
```

### Timer Components

**File:** `src/components/testing/quiz-v2/TimerDisplay.tsx`

- Level 0: No timer rendered
- Level 1: Small count-up timer in top bar, neutral color
- Level 2: Countdown timer, turns Amber at 25% remaining, Warm Red at 10%
- Level 3: Prominent countdown, same color behavior as Storm Mode

**Per-question pacing indicator:**

```typescript
// Median time for this difficulty band (from aggregate user_interactions data)
const medianTime = await getMedianTimeForDifficulty(question.difficulty_rating);

// Soft warning: show nudge at 2× median
if (pressureLevel >= 2 && timeSpentMs > medianTime * 2) {
  showPacingNudge("Consider moving on and returning later.");
}

// Hard skip: auto-advance at 3× median
if (pressureLevel === 3 && timeSpentMs > medianTime * 3) {
  autoAdvance(); // Records as unanswered
}
```

---

## Exam-Day Simulation Protocol

An enhanced version of the existing Full Exam Simulation with ritual elements.

### Pre-Simulation Checklist

**File:** `src/components/testing/setup/SimulationChecklist.tsx`

Before starting, show a checklist the student must acknowledge:

- [ ] I have at least 4 uninterrupted hours
- [ ] I'm in a quiet space with no distractions
- [ ] I've eaten and I'm hydrated
- [ ] My device is charged or plugged in
- [ ] I understand this cannot be paused

Optional: "Schedule for later" — pick a date/time. System sends a push notification at the scheduled time.

### During Simulation

- Full ALE question distribution (per PRC area weighting: 30/30/40)
- No pause. Tab-switch detection with timer continuing.
- Ambient timer (large, centered top bar)
- Section breaks mirroring ALE format if applicable
- No feedback whatsoever during session

### Post-Simulation Debrief (24 hours later)

**File:** `src/components/testing/results/SimulationDebrief.tsx`

After the 24-hour delay, show a comprehensive coaching debrief:

1. **Score + Pass/Fail Prediction:** "Your score: 72/100. Based on historical ALE passing thresholds, this projects to: Likely Pass."
2. **Point Loss Analysis:** Table showing points lost per taxonomy node, sorted by magnitude
3. **Stamina Curve:** Accuracy plotted over question number. Coaching annotation: "Your accuracy dropped from 82% to 61% after question 120. Fatigue hit at the 3-hour mark."
4. **Time Allocation:** Bar chart showing time spent per section vs. optimal allocation
5. **Prediction Comparison:** If IMPL_01 prediction was captured: "You predicted 78%. You scored 72%. Your calibration is improving."
6. **Action Plan:** Top 3 topics to address before the next simulation, auto-generated

### Simulation Tracking

```sql
-- Add to user_global_stats or a new table
ALTER TABLE user_global_stats ADD COLUMN simulation_count INTEGER DEFAULT 0;
ALTER TABLE user_global_stats ADD COLUMN last_simulation_score NUMERIC(5,2);
ALTER TABLE user_global_stats ADD COLUMN best_simulation_score NUMERIC(5,2);
```

Track trajectory across simulations in the Analytics Dashboard.

---

## Campfire Design

- Pressure levels presented as a horizontal stepper, not a scary ladder
- Language: "Build up your exam readiness" not "Increase difficulty"
- Checklist: warm, supportive tone. Not clinical or military.
- Debrief: coaching, not judgment. "Here's what to work on" not "Here's where you failed."

