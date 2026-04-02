<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# inference

## Purpose

The `inference` directory implements rule-based behavioral confidence classification (Patent Claims 1g, 11) as a Phase 4a implementation. Classifies decision confidence (high/moderate/low/guessing) from behavioral feature vectors extracted from gesture signals. Provides hesitancy index, cognitive load proxy, and anomalous behavior detection for adaptive feedback and integrity monitoring.

## Key Files

| File | Description |
|------|-------------|
| `classifyConfidence.ts` | Main export: `classifyBehavioralState()` computes confidence, hesitancy, cognitive load, anomaly flags from gesture features |
| `server-only-guard.ts` | Server-only assertion: prevents accidental client-side import of sensitive classification logic |
| `TRADE_SECRET.md` | (Confidential) Patent claim summary and ML model roadmap |

## For AI Agents

### Working In This Directory

**Confidence Classification (Patent Claim 11):**
- Discrete levels: `high`, `moderate`, `low`, `guessing`.
- Derived from behavioral feature vector: {velocityProfile, pathDeviation, reversalCount, temporalMetric, micropatterns, jerkMetric, ...}.
- Guessing detected: submission <250ms OR velocity >0.08 (very fast, reflexive).
- High confidence: smooth motion, low path deviation, ≤1 reversal, no pauses, low jerk.
- Low confidence: high deviation, many reversals (>5), multiple pauses (>3), or >3s submission time.
- Moderate: default fallback for mid-range signals.

**Hesitancy Index (0–1 continuous):**
- Combines reversal count (30% weight), pause count (25%), temporal duration (25%), path deviation (20%).
- High hesitancy = uncertain answer (may indicate fragile knowledge or blindspot).
- Low hesitancy = confident answer (may indicate mastery or overconfidence).

**Cognitive Load Proxy (0–1 continuous):**
- Combines jerk metric (25%), velocity variance (25%), item difficulty (30%), answer change count (20%).
- Proxy for working memory demand during decision-making.
- Used to adapt question difficulty or suggest breaks.

**Anomalous Behavior Likelihood (0–1 continuous):**
- Flags: extremely fast (<100ms), zero path deviation (robotic), velocity bursts (>3), missing pressure data, inhuman consistency.
- Scores 0.1–0.4 per flag, capped at 1.0.
- High likelihood (>0.7) triggers admin review flag.

**Phase 4a vs. Phase 4b:**
- Phase 4a (current): Rule-based thresholds derived from internal testing.
- Phase 4b (future): ML model trained on labeled data (self-reported confidence, answer correctness, admin flags).
- This module ships now to collect training data.

### Common Patterns

**Classifying Behavioral State:**
```typescript
import { classifyBehavioralState } from '@/lib/inference'

const features = {
  velocityProfile: { mean: 0.02, stdDev: 0.005, isDeliberate: true },
  pathDeviation: 0.08,
  reversalCount: 2,
  temporalMetric: 1500, // ms
  micropatterns: { pauseCount: 1, burstCount: 0 },
  jerkMetric: 0.0005,
  assessmentContext: { itemDifficulty: 0.6, answerChangeCount: 0 },
  pressureProfile: { available: true, peakForce: 50 },
  interactionPathMetric: 120,
}

const state = classifyBehavioralState(features)
// state.decisionConfidence: 'high' | 'moderate' | 'low' | 'guessing'
// state.hesitancyIndex: 0.15
// state.cognitiveLoadProxy: 0.42
// state.anomalousBehaviorLikelihood: 0.05
```

## Dependencies

### Internal

- **Types:** `BehavioralFeatureVector`, `CognitiveStateIndicators`, `ConfidenceClassification` from `@/types/patent`.
- **Server-only guard:** `server-only` package.

### External

- **Zero external npm dependencies.** Pure TypeScript rule engine.
- **Target runtime:** Node.js (Server Actions only).

---

**Last Updated:** 2026-04-02

**For patent details and ML roadmap, see `.claude/docs/patents/inference.md` in the repository root. This is confidential IP.**
