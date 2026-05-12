# IMPL_06: Interleaved Topic Mixing & Hybrid Scheduling

**Priority:** P1
**Effort:** ~2 days
**Research basis:** Interleaving effect size d = 0.43 (Brunmair & Richter, 2019). Hybrid block-then-interleave outperforms pure interleaving for novices (Hwang, 2025).

---

## The Problem

Architecture students frequently confuse similar code provisions (PD 1096 Rule 7 vs. Rule 8, different BP 344 sections). Blocked practice (all questions on one topic) doesn't train the discrimination skill needed to tell similar concepts apart. Interleaving forces the brain to identify *which* rule applies, not just recall facts about a single rule.

---

## Implementation

### 1. Interleave Toggle in Camp Mode

**File:** Modify `src/components/testing/setup/SetupFlow.tsx`

Add a toggle in Step 3 (Difficulty Filter area):

```typescript
// New toggle in SetupFlow configuration
{
  label: 'Mix related topics',
  description: 'Adds 30% related questions from nearby taxonomy nodes',
  key: 'interleave',
  default: false,
  modes: ['camp', 'custom'], // Only for these modes
}
```

**Stored in `QuizSessionConfig` JSONB:**
```typescript
interface QuizSessionConfig {
  // ... existing fields
  interleave: boolean;
  interleave_ratio: number; // 0.3 default
}
```

### 2. Question Selection with Interleaving

**File:** Modify `src/lib/actions/quiz-v2/start-session.ts`

When interleave is enabled:

```typescript
async function selectQuestionsWithInterleaving(
  selectedTopicIds: string[],
  totalCount: number,
  interleaveRatio: number = 0.3,
  userId: string
) {
  const primaryCount = Math.ceil(totalCount * (1 - interleaveRatio));
  const interleaveCount = totalCount - primaryCount;

  // 1. Select primary questions from chosen topics (existing IRT logic)
  const primaryQuestions = await selectQuestionsByIRT(selectedTopicIds, primaryCount, userId);

  // 2. Find related topics (siblings in taxonomy_tree)
  const { data: relatedTopics } = await supabase
    .from('taxonomy_tree')
    .select('id')
    .in('parent_id', (
      await supabase
        .from('taxonomy_tree')
        .select('parent_id')
        .in('id', selectedTopicIds)
    ).data?.map(t => t.parent_id) ?? [])
    .not('id', 'in', `(${selectedTopicIds.join(',')})`)
    .limit(20);

  const relatedTopicIds = relatedTopics?.map(t => t.id) ?? [];

  // 3. Select interleaved questions from related topics
  const interleaveQuestions = relatedTopicIds.length > 0
    ? await selectQuestionsByIRT(relatedTopicIds, interleaveCount, userId)
    : [];

  // 4. Shuffle all questions together (true interleaving, not appending)
  return shuffleArray([...primaryQuestions, ...interleaveQuestions]);
}
```

### 3. Hybrid Block-Then-Interleave Scheduling

For the Adaptive Daily Dose (IMPL_13) and Camp Trails:

```typescript
function shouldInterleave(userId: string, topicId: string): boolean {
  // Check user's mastery on this topic
  const mastery = await getUserNodeMastery(userId, topicId);

  // Below 60% mastery: blocked practice (topic-focused)
  // Above 60% mastery: interleaved practice (mixed with related topics)
  return mastery !== null && mastery.current_mastery_weight >= 0.60;
}
```

This is the key insight from Hwang (2025): novices need blocked practice to build initial declarative knowledge. Once they have a foundation (≥60% mastery), interleaving improves discrimination and long-term retention.

### 4. Interleave Indicator in Session

During an interleaved session, subtly tag interleaved questions:

```
[Structural Design > Steel Connections]  ← primary topic
[Structural Design > Concrete Design]   ← interleaved (small "related topic" tag)
[Structural Design > Steel Connections]  ← primary topic
```

Don't explain the pedagogy in-session — just let the mixing happen. The post-session results can note: "This session included related topics to strengthen your ability to tell similar concepts apart."

---

## Edge Cases

- **Only 1 topic selected with no siblings in taxonomy:** Fall back to non-interleaved mode. Don't force it.
- **Not enough questions in related topics:** Fill remaining slots with primary topic questions.
- **Student turns off interleaving:** Respect the preference. Some advanced students know what they want.
