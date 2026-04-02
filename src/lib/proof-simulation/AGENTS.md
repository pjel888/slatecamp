<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# proof-simulation

## Purpose

The `proof-simulation` directory implements the competence gate for Full Exam Simulation mode: verification that a student has reached sufficient mastery and endurance before accessing a high-stakes, timed full-length exam simulation. Checks taxonomy coverage (70% of nodes at Amber or above) and stamina (80% of exam duration endurance window).

## Key Files

| File | Description |
|------|-------------|
| `gate.ts` | Server Action: `checkProofSimulationGate()` verifies mastery and endurance prerequisites → `ProofSimulationGateResult` |

## For AI Agents

### Working In This Directory

**Gate Verification (Server Action):**

**Competence Gate Rules:**
1. **Taxonomy Coverage:** ≥70% of leaf taxonomy nodes at Amber or above (mastery ≥ 0.4).
   - Count nodes with `current_mastery_weight ≥ 0.4`.
   - Count total leaf nodes (non-deprecated, non-cross-ref, with ALE mapping).
   - Required: ceil(total × 0.70).
   - Pass if: covered ≥ required.

2. **Endurance Window:** ≥80% of exam duration (target items).
   - Fetch `endurance_window_items` and `endurance_target_items` from `user_computed_signals`.
   - Default target: 150 items (typical 3-hour exam).
   - Required: ceil(target × 0.80) = ceil(150 × 0.80) = 120 items.
   - Pass if: window ≥ required.

**Result Structure:**
```typescript
{
  allowed: boolean,                    // true if both checks pass
  nodesCovered: number,                // current coverage
  nodesRequired: number,               // threshold (70% of total)
  enduranceWindow: number,             // current window in items
  enduranceRequired: number,           // threshold (80% of target)
  reasons: string[],                   // human-readable failure reasons
}
```

**Failure Messages:**
- If coverage fails: "X of Y topics at developing level or above (need 70%)".
- If endurance fails: "Endurance window: X of Y items (need 80% of exam length)".
- Both failing: both reasons listed.

**Gate Behavior:**
- If `allowed=false`, redirect student to "Ready for Exam Sim?" dashboard with reasons.
- Suggest: "Master Y more topics" or "Build endurance with 20 more items".
- Re-check gate before each simulation attempt.

### Common Patterns

**Checking Simulation Gate (Server Action):**
```typescript
'use server'

import { checkProofSimulationGate } from '@/lib/proof-simulation'

export const canStartProofSimulation = async (userId: string) => {
  const result = await checkProofSimulationGate(userId)
  
  if (!result.allowed) {
    return {
      allowed: false,
      message: `Not ready yet. ${result.reasons.join(' ')}`,
      progress: {
        topics: `${result.nodesCovered}/${result.nodesRequired}`,
        endurance: `${result.enduranceWindow}/${result.enduranceRequired}`,
      }
    }
  }
  
  return { allowed: true, message: 'Ready for exam simulation!' }
}
```

**In Proof Simulation Page:**
```typescript
// In layout or page component:
const gateResult = await canStartProofSimulation(userId)

if (!gateResult.allowed) {
  return (
    <ReadynessCard>
      <p>{gateResult.message}</p>
      <ProgressBar label="Topics" value={gateResult.progress.topics} />
      <ProgressBar label="Endurance" value={gateResult.progress.endurance} />
    </ReadynessCard>
  )
}

// User is allowed; show simulation interface
return <ProofSimulation />
```

## Dependencies

### Internal

- **Supabase:** Queries `user_node_mastery`, `taxonomy_tree`, `user_computed_signals`.
- **Server context:** Must run in Server Action.
- **Types:** `ProofSimulationGateResult` from `@/types/proof-simulation` or inline.

### External

- **No external npm dependencies** (pure SQL and logic).

---

**Last Updated:** 2026-04-02

**For exam simulation design, consult `.claude/docs/proof-simulation-prd.md` in the repository root.**
