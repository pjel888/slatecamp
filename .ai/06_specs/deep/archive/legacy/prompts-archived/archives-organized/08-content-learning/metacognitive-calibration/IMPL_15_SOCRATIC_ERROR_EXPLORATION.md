# IMPL_15: Socratic Error Exploration & AI Content Intelligence

**Priority:** P2
**Effort:** ~1 week
**Research basis:** Socratic questioning produces deeper understanding than direct instruction. Generation of explanations activates elaborative retrieval (Carpenter, 2011).

---

## Socratic Error Exploration

### Trigger

After a wrong answer in Camp Mode, alongside the rationale, add an "Explore This" button. This launches a short AI conversation specifically about the student's error.

### AI Behavior Rules

1. **Never reveal the answer.** The rationale already showed it. The AI's job is to help the student understand *why*.
2. **Ask guiding questions.** "What do you think the code is trying to prevent with this requirement?" "How would you distinguish between Rule 7 and Rule 8?"
3. **Maximum 5 turns.** Keep it short. This is a micro-intervention, not a tutoring session.
4. **Cite sources.** Every AI response must reference the relevant Wiki article via `[Source: article_id]` parsed into a clickable badge.
5. **Fall back gracefully.** If the Double-Pass auditor rejects a response: "I'm not confident in my answer on this one. Let me point you to the Wiki article instead."

### Implementation

**File:** `src/components/testing/quiz-v2/SocraticExplorer.tsx`

```typescript
// Slide-over panel that opens from the FeedbackPanel
// Uses the existing AI tutor route: src/app/api/ai/tutor/route.ts

const systemPrompt = `You are a Socratic tutor for architecture licensure exam preparation.
The student just answered a question wrong. Here is the context:
- Question: ${question.text}
- Their answer: ${selectedOption.text}
- Correct answer: ${correctOption.text}
- Topic: ${topicName}

Your job: help them understand WHY their reasoning was wrong through questions, not explanations.
Rules:
- Ask ONE question per turn
- Never state the answer directly (they already saw it)
- Reference specific code sections or principles
- Maximum 5 exchanges
- End with: "Now that you've thought it through, try a similar question to test your understanding."
- Append [Source: {article_id}] for any factual claim`;
```

### Integration with Double-Pass Pipeline

Uses the same `src/app/api/ai/tutor/route.ts` endpoint with the Socratic system prompt. The Double-Pass auditor (when implemented per IP_EXECUTION_PLAN) verifies all factual claims before delivery.

---

## AI-Generated Mnemonics

### Trigger

For questions tagged as `recall` difficulty (Bloom's Level 1) where the student has failed 2+ times on the same code value or list.

### Implementation

**File:** `src/lib/actions/ai/generate-mnemonic.ts`

```typescript
const mnemonicPrompt = `Generate a memorable mnemonic for a Filipino architecture student to remember:
"${factToRemember}"

Requirements:
- Use Filipino cultural references, food, places, or humor when possible
- Keep it under 20 words
- Make it phonetically sticky
- Include the key number/value in the mnemonic

Example: "1,100mm minimum stairway width" → "Sa Eleven Hundred, lahat ng tao, maluwag na madaanan!"`;
```

Display in the FeedbackPanel as an expandable "Memory Trick" section. Student can save it to their Notes with one tap.

---

## Concept Confusion Content Generation

When `confusion_pairs` (IMPL_09) are detected:

1. Auto-generate a disambiguation prompt for the AI:
```
"Create a comparison table between [Topic A] and [Topic B] for ALE exam preparation.
Include: key differences, when each applies, common exam traps, and a decision rule for choosing between them."
```

2. Route to SME review queue for validation
3. Once approved, publish as a Wiki disambiguation article
4. Auto-link from the FeedbackPanel when concept_confusion errors are classified

---

## Edge Cases

- **AI timeout:** Show "Taking too long — here's the Wiki article instead" with Teleport Link
- **Student abuses the chat:** 5-turn hard limit. After 5 turns: "Let's move on. Try a similar question to test your understanding." with auto-generated follow-up quiz.
- **No RAG context available:** "I don't have enough verified information on this specific topic. Here's the best Wiki resource." (Zero-hallucination fallback per IP plan)
