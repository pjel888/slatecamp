# IMPL_12: Storage Strength vs. Retrieval Strength Model

**Priority:** P3
**Effort:** ~1 week
**Research basis:** Bjork's New Theory of Disuse (1992, 2006). Storage strength (how deeply encoded) and retrieval strength (how easily accessed) are independent dimensions.

---

## Why Two Strengths?

A topic can have **high storage / low retrieval** — deeply learned months ago but not recently accessed. It needs one quick review to restore. A topic with **low storage / low retrieval** needs full re-learning. Treating both the same wastes student time.

### Definitions

- **Storage Strength (SS):** How well-connected the knowledge is in long-term memory. Built through varied practice, elaboration, and interleaving. Increases monotonically — it never decreases.
- **Retrieval Strength (RS):** How easily the knowledge can be accessed right now. Decays with time since last review. Restored by successful retrieval.

### Calculation

```typescript
// Storage Strength: accumulates with each practice event
// More practice events + varied contexts = higher SS
function updateStorageStrength(current: number, practiceEvent: PracticeEvent): number {
  const contextBonus = practiceEvent.isInterleaved ? 0.1 : 0;
  const difficultyBonus = practiceEvent.difficulty * 0.05;
  const increment = 0.05 + contextBonus + difficultyBonus;
  return Math.min(current + increment, 1.0); // Caps at 1.0
}

// Retrieval Strength: decays with time, rate modulated by storage strength
// Higher storage → slower retrieval decay (Bjork's key insight)
function currentRetrievalStrength(
  lastRS: number,
  storageSt: number,
  daysSinceReview: number
): number {
  const decayRate = 0.1 / Math.max(storageSt, 0.1); // Higher SS = slower decay
  return lastRS * Math.exp(-decayRate * daysSinceReview);
}
```

### Schema

```sql
ALTER TABLE user_node_mastery ADD COLUMN storage_strength NUMERIC(4,3) DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN retrieval_strength NUMERIC(4,3) DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN practice_count INTEGER DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN practice_contexts INTEGER DEFAULT 0; -- unique modes/sessions
```

---

## Session Routing

Based on the two strengths, route students to the right activity:

| Storage | Retrieval | State | Action |
|---|---|---|---|
| High | High | Mastered | No action needed. Monitor for decay. |
| High | Low | Rusty | Quick refresh quiz (5 questions). One session restores RS. |
| Low | Low | Unknown | Full learning cycle: Wiki → Camp quiz → SR cycle. |
| Low | High | Cramming artifact | Recent study but no depth. Schedule spaced re-test. |

### Implementation in Focus Review / Daily Dose

```typescript
function recommendActivity(ss: number, rs: number, topicId: string) {
  if (ss >= 0.7 && rs >= 0.7) return null; // Good
  if (ss >= 0.7 && rs < 0.5) return { type: 'quick_refresh', questions: 5 };
  if (ss < 0.4) return { type: 'full_learning', steps: ['wiki', 'camp_quiz', 'sr_cycle'] };
  if (ss < 0.4 && rs >= 0.5) return { type: 'deepen', steps: ['interleaved_quiz', 'elaboration'] };
  return { type: 'camp_quiz', questions: 10 };
}
```

---

## Taxonomy Heatmap Enhancement

Current heatmap shows mastery as a single color. Add a secondary indicator:

- **Outer ring / cell color:** Retrieval Strength (the current accessible knowledge)
- **Inner dot / opacity:** Storage Strength (how durable the knowledge is)

A node that is bright green with a faded inner dot = good retrieval now but low storage (will decay fast). A node that is amber with a solid inner dot = temporarily low retrieval but strong storage (needs a quick refresh, not re-learning).

---

## Campfire Design

- Don't expose "Storage Strength" and "Retrieval Strength" labels directly to students
- Instead: "Knowledge Depth" (SS) and "Current Access" (RS) or simply show the routing recommendation: "Quick refresh" vs. "Deep review needed"
- In the heatmap, the visual encoding communicates the distinction without requiring students to understand the theory

