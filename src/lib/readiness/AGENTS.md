<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# readiness

Readiness score calculation using Item Response Theory (IRT) 2-parameter logistic model, score velocity, and churn risk.

## Purpose

Computes three pedagogical metrics: Readiness Score (IRT-based mastery), Score Velocity (7-day pts/day trend), and Churn Risk (engagement/exam urgency triple-condition). Used in dashboard, pacing gauge, and churn alerts.

## Key Files

| File | Description |
|------|-------------|
| `velocity.ts` | `computeScoreVelocity(snapshots)` — returns `{ velocity, state }`. States: accelerating (>0.8 pts/day), steady (0.2–0.8), plateaued (−0.2–0.2), declining (<−0.2). Based on 7-day delta. |
| `churn.ts` | `computeChurnRisk(params)` — triple-condition model: velocity negative 10+ days, last session >5 days ago, exam >45 days away. Returns `{ risk: 0|0.33|0.67|1.0, isHighRisk }`. |

## For AI Agents

### Working In This Directory

- Pure calculation functions (no DB queries, no side effects).
- `velocity.ts`: Sorts snapshots descending (newest first), finds 7-day baseline or uses oldest.
- `churn.ts`: Counts risk factors (0–3), normalizes to 0–1 risk score. High risk = all 3 conditions met.
- IRT 2-parameter model: Handled elsewhere (not in readiness/); Readiness Score uses theta + discrimination + difficulty.

### Adding New Metric

1. Create function `compute{Metric}(params)` returning typed result.
2. Pure functions only (no DB access).
3. Accept snapshot data or state params; return `{ value, status|state|risk }`.
4. Add JSDoc explaining formula/thresholds (e.g., "velocity > 0.8 = accelerating").

### Common Patterns

- **Velocity calculation**: `(latest.score − baseline.score) / daysDelta` in points/day.
- **State mapping**: Map velocity ranges to enum states (4 levels typical).
- **Churn risk factors**: Count conditions met, divide by 3 for 0–1 score.
- **Date math**: Use `getTime()` / (1000 * 60 * 60 * 24) for days delta.

## Dependencies

### Internal

- None (pure math functions).

### External

- None.

<!-- MANUAL: -->
