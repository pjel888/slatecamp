# IMPL_10: Feed-Forward Recommendation Engine

**Priority:** P0  
**Effort:** ~2 days  
**Research basis:** Hattie & Timperley (2007) — feed-forward ("what to do next") is as important as feedback ("what just happened"). Students who know their next action outperform those who only know their last result.

---

## Post-Session Recommendations

After every session, don't just show results — show the 3 highest-impact next actions.

### Recommendation Algorithm

**File:** `src/lib/actions/quiz-v2/generate-recommendations.ts`

Inputs:
1. Session results (missed topics, accuracy by node)
2. Current `user_node_mastery` state (which nodes are Red/Amber)
3. SRS due items (overdue spaced repetition cards)
4. Wiki reading history (unread articles for weak topics)
5. Days until exam (from `user_global_stats.target_exam_date`)

```typescript
interface Recommendation {
  type: 'quiz' | 'wiki' | 'review' | 'lab' | 'rest';
  priority: number; // 0-100
  title: string;
  description: string;
  action: {
    type: 'start_session' | 'open_wiki' | 'open_srs' | 'open_lab';
    params: Record<string, any>; // Pre-configured params for one-tap launch
  };
}

export async function generateRecommendations(
  userId: string,
  sessionId: string,
  limit = 3
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // 1. Weakest topic from this session → targeted Camp session
  const sessionResults = await getSessionResults(sessionId);
  const weakestTopic = sessionResults.byTopic
    .filter(t => t.accuracy < 0.5)
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  if (weakestTopic) {
    recommendations.push({
      type: 'quiz',
      priority: 90,
      title: `Fix: ${weakestTopic.topicName}`,
      description: `You got ${Math.round(weakestTopic.accuracy * 100)}% — a targeted session will help.`,
      action: {
        type: 'start_session',
        params: {
          mode: 'camp',
          topicIds: [weakestTopic.topicId],
          questionCount: 10,
        },
      },
    });
  }

  // 2. Unread Wiki article for a missed topic
  const unreadArticle = await getUnreadWikiForTopic(userId, weakestTopic?.topicId);
  if (unreadArticle) {
    recommendations.push({
      type: 'wiki',
      priority: 80,
      title: `Read: ${unreadArticle.title}`,
      description: 'Build your understanding before re-testing.',
      action: {
        type: 'open_wiki',
        params: { articleId: unreadArticle.id },
      },
    });
  }

  // 3. Overdue SRS cards
  const overdueCount = await getOverdueSRSCount(userId);
  if (overdueCount > 0) {
    recommendations.push({
      type: 'review',
      priority: 75,
      title: `Review ${overdueCount} overdue cards`,
      description: 'These topics are decaying — a quick review will restore them.',
      action: {
        type: 'open_srs',
        params: {},
      },
    });
  }

  // 4. If student has been studying >90 min today, suggest rest
  const todayStudyMinutes = await getTodayStudyTime(userId);
  if (todayStudyMinutes > 90) {
    recommendations.push({
      type: 'rest',
      priority: 60,
      title: 'Take a break',
      description: `You've studied ${todayStudyMinutes} min today. Rest improves retention.`,
      action: { type: 'start_session', params: {} }, // No-op, just closes
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, limit);
}
```

### UI Component

**File:** `src/components/testing/results/FeedForwardCards.tsx`

Renders after score display in `ResultsDashboard`. Three cards in a row (or stacked on mobile):

```
┌─── Fix: Structural Design ────┐  ┌─── Read: Steel Connections ──┐  ┌─── Review 8 overdue cards ──┐
│ You got 33% — a targeted      │  │ Build understanding before   │  │ These topics are decaying.   │
│ session will help.             │  │ re-testing.                  │  │ A quick review restores them.│
│                                │  │                              │  │                              │
│ [Start 10-Question Session →]  │  │ [Open Article →]             │  │ [Start Review →]             │
└────────────────────────────────┘  └──────────────────────────────┘  └──────────────────────────────┘
```

Each card's CTA is one tap — pre-configured with all parameters. Zero decision-making required.

### Integration

- Call `generateRecommendations()` from `end-session.ts`
- Store in `quiz_sessions.recommendations` JSONB for historical display
- Also used by IMPL_13 (Adaptive Daily Dose) as input signals

---

## Campfire Design

- Cards: `rounded-md shadow-none`, standard card styling
- Quiz recommendation: Camp Cobalt left border
- Wiki recommendation: neutral left border
- SRS recommendation: Amber left border
- Rest recommendation: Emerald left border
- No exclamation marks. No urgency language. Just clear actions.

