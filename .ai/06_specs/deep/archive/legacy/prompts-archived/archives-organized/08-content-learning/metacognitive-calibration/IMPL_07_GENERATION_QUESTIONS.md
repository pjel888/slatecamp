# IMPL_07: Generation Effect Questions

**Priority:** P2
**Effort:** ~1 week
**Research basis:** Generation effect d = 0.40+. Producing answers creates stronger memory traces than recognizing them.

---

## New Question Type: Free Response

Add to the existing MCQ-only question bank a "generation" question type where the student must produce the answer rather than select from options.

### Schema Changes

```sql
-- Add question_type to questions table
ALTER TABLE questions ADD COLUMN question_type TEXT NOT NULL DEFAULT 'mcq'
  CHECK (question_type IN ('mcq', 'numeric', 'short_text', 'formula'));

-- For numeric/formula types, store the accepted answer and tolerance
ALTER TABLE questions ADD COLUMN correct_value NUMERIC;
ALTER TABLE questions ADD COLUMN value_tolerance NUMERIC DEFAULT 0;
-- For short_text, store acceptable answer variants
ALTER TABLE questions ADD COLUMN accepted_answers TEXT[]; -- e.g., {'1100mm', '1.1m', '1100'}
```

### Question Types

| Type | Input | Scoring | Example |
|---|---|---|---|
| `mcq` | Select from 4 options | Exact match | "Which code governs accessible ramps?" |
| `numeric` | Number input | Within tolerance | "What is the minimum stairway width for public buildings in mm?" → 1100 ± 0 |
| `short_text` | Text input | Fuzzy match against accepted_answers | "Name the law governing architecture practice in PH" → RA 9266 |
| `formula` | Formula input | Computed match | "Calculate TGFA for a 500sqm lot with 60% BIR" → 300 ± 5 |

### Answer Matching Logic

**File:** `src/lib/quiz/answer-matching.ts`

```typescript
export function matchGenerationAnswer(
  questionType: string,
  userAnswer: string,
  question: Question
): { isCorrect: boolean; closeness: number } {
  switch (questionType) {
    case 'numeric': {
      const parsed = parseFloat(userAnswer.replace(/[^0-9.-]/g, ''));
      if (isNaN(parsed)) return { isCorrect: false, closeness: 0 };
      const diff = Math.abs(parsed - question.correct_value);
      const isCorrect = diff <= question.value_tolerance;
      const closeness = Math.max(0, 1 - diff / Math.max(question.correct_value, 1));
      return { isCorrect, closeness };
    }
    case 'short_text': {
      const normalized = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
      const match = question.accepted_answers.some(a =>
        a.toLowerCase() === normalized ||
        levenshteinDistance(a.toLowerCase(), normalized) <= 2
      );
      return { isCorrect: match, closeness: match ? 1 : 0 };
    }
    case 'formula': {
      const result = evaluateFormula(userAnswer);
      if (result === null) return { isCorrect: false, closeness: 0 };
      const diff = Math.abs(result - question.correct_value);
      return { isCorrect: diff <= question.value_tolerance, closeness: Math.max(0, 1 - diff / question.correct_value) };
    }
    default:
      return { isCorrect: false, closeness: 0 };
  }
}
```

### UI Component

**File:** `src/components/testing/quiz-v2/GenerationInput.tsx`

- `numeric`: Number input with unit label (mm, sqm, etc.) from question metadata
- `short_text`: Text input with character limit
- `formula`: Text input with basic math rendering preview
- All types: "Submit" button, same 0.4s deliberate pause as MCQ

### Feedback Enhancement for Wrong Generation Answers

When the student generates a wrong answer, show:
1. Their answer vs. the correct answer side-by-side
2. If numeric and close: "You were close — off by [X]. The correct value is [Y] because [rationale]."
3. If far off: Standard rationale block

### EMA Weight

Generation questions receive 1.2× EMA weight (correct answers are worth more because production is harder than recognition). This is configurable.

### Content Authoring

In the CMS, add fields for generation questions. Start with 10% of the question bank — focus on:
- Code values (numeric): minimum dimensions, distances, counts
- Law references (short_text): RA numbers, PD numbers
- Computation problems (formula): TGFA, FAR, occupant load

Gradually increase the proportion as content team builds more.

---

## Integration

- Generation answers recorded in `user_interactions` with `question_type` field
- Displayed in ReviewCard with the student's typed answer shown alongside the correct answer
- Works in all modes except Chill (Chill stays MCQ-only for low friction)
