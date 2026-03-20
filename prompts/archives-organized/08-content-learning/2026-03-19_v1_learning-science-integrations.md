# SlateCamp — Learning Science Integrations Implementation
## 9 Research-Backed Techniques. Phased by Schema Effort. Grounded in What Already Exists.

---

## HOW TO USE THIS PROMPT

Give this prompt AND `slatecamp-product-architecture.md` AND `DATABASE_SCHEMA.sql` to Claude Code together. The schema file shows what ALREADY EXISTS (a lot). This prompt builds what's MISSING.

**Token strategy:** This prompt has 3 sprints. Sprint 1 requires ZERO new tables and minimal schema changes. Sprint 2 requires 1 new column + frontend components. Sprint 3 requires 2 new tables. Complete Sprint 1 fully before moving to Sprint 2.

---

## ROLE

You are a Senior Next.js Engineer who also understands educational psychology. Every feature you build has a research citation behind it. You implement learning science, not gamification. You follow SlateCamp's hard constraints: Server Components for data, Server Actions for writes, no `useEffect` for fetching, no `any` types, no client-side Supabase writes, no bouncy animations.

---

## WHAT ALREADY EXISTS (Do NOT Rebuild)

The schema audit reveals these columns are ALREADY in the database:

| Feature | Column | Table | Status |
|---|---|---|---|
| Metacognitive Calibration | `pre_session_confidence_ratings` JSONB | `quiz_sessions` | ✅ Exists — needs FRONTEND |
| Error Taxonomy | `error_type` TEXT | `user_interactions` | ✅ Exists — needs FRONTEND |
| Sleep-Aware Scheduling | `preferred_time` TEXT | `trail_steps` | ✅ Exists — needs LOGIC |
| Endurance Analysis | `question_order` INTEGER | `user_interactions` | ✅ Exists |
| Proof Simulation | `is_proof_simulation` BOOLEAN | `quiz_sessions` | ✅ Exists |
| Assessment Quiz | `is_assessment` BOOLEAN | `questions` | ✅ Exists |

**This means Sprint 1 is pure frontend + logic. No migrations needed.**

---

## TOOLS

- **Supabase MCP** — Verify column existence before every change. Query for sample data.
- **File System** — Read all quiz, wiki, and trail components before modifying.
- **grep** — Find exact injection points for each feature.

---

## SPRINT 1: Zero Schema Changes — Frontend + Logic Only

These 4 features use columns that ALREADY EXIST. Build the frontend and wiring.

---

### FEATURE 1: Metacognitive Calibration Training

**Research:** Dunning-Kruger correction. Students predict confidence per subject → see calibration chart after session. d=0.30–0.50 for reducing overconfidence.

**Column:** `quiz_sessions.pre_session_confidence_ratings` JSONB — already exists.

**What to build:**

#### 1a. Pre-Session Confidence Screen

Before a Camp Mode or Storm Mode session begins (after the student clicks "Start" but before question 1 appears), show a quick confidence rating screen.

```
Rate your confidence for this session's subjects:

Building Technology        ○ Low  ○ Medium  ○ High
Structural Design          ○ Low  ○ Medium  ○ High
Professional Practice      ○ Low  ○ Medium  ○ High

[Skip] [Continue →]
```

**Implementation:**
```bash
# Find where quiz sessions are created and the first question is shown
grep -rn "startSession\|createSession\|question.*index.*0\|currentQuestion" src/ --include="*.tsx" | head -15
```

Insert the confidence screen as an intermediate step between "Start Quiz" and "Question 1". The screen:
- Shows ONLY the subjects covered in this session (from `quiz_sessions.subject_ids` or the config)
- 3-point scale: 1=Low, 2=Medium, 3=High
- "Skip" button bypasses (writes empty `{}` to the column)
- "Continue" writes the ratings to `quiz_sessions.pre_session_confidence_ratings`:
  ```json
  {"Building Technology": 3, "Structural Design": 2, "Professional Practice": 1}
  ```
- Takes under 15 seconds. Must NOT feel like a barrier.

**Design:**
- Background: `#F5F7FA` (Cool Surface — same as quiz)
- All Inter font. No Syne.
- Subject names left-aligned. Radio buttons right-aligned. Clean grid.
- DM Mono eyebrow: "CONFIDENCE CHECK"
- Body text: "How confident are you in these subjects right now?"

#### 1b. Post-Session Calibration Display

In the session debrief/results screen, ADD a calibration section:

```
Your Calibration
──────────────────────────────────
Building Technology    Predicted: High    Actual: 45%    ⚠ Overconfident
Structural Design      Predicted: Medium  Actual: 78%    ✓ Well calibrated
Professional Practice  Predicted: Low     Actual: 32%    ✓ Accurately predicted
```

**Implementation:**
```bash
# Find the debrief/results screen
grep -rn "debrief\|results\|SessionResult\|QuizResult\|score.*summary" src/ --include="*.tsx" -l
```

Read `pre_session_confidence_ratings` from the session. Compare to actual per-subject accuracy (computed from `user_interactions` for this session). Display the calibration table.

Calibration logic:
```typescript
type CalibrationState = 'overconfident' | 'underconfident' | 'well_calibrated'

function getCalibration(predicted: number, actualPct: number): CalibrationState {
  // predicted: 1=Low, 2=Medium, 3=High
  // Map to expected ranges: Low=0-40%, Medium=40-70%, High=70-100%
  if (predicted === 3 && actualPct < 60) return 'overconfident'
  if (predicted === 1 && actualPct > 60) return 'underconfident'
  return 'well_calibrated'
}
```

Color coding: overconfident = `#E8853A` (Camp Orange), underconfident = `#1B3FC4` (Cobalt — it's a positive surprise), well calibrated = `#1B7A3C` (Signal Green).

**Voice:** No praise, no alarm. Just the data. "You predicted High on Building Technology but scored 45%. The gap between prediction and performance is where hidden risk lives."

---

### FEATURE 2: Error Taxonomy

**Research:** Wrong answers fall into 5 predictable categories requiring different interventions. Aggregated error patterns surface systemic issues.

**Column:** `user_interactions.error_type` TEXT — already exists.

**What to build:**

#### 2a. Post-Wrong-Answer Prompt (Camp Mode Only)

After a wrong answer in Camp Mode (AFTER the rationale is shown), display an OPTIONAL one-tap follow-up:

```
What happened there?

[Knowledge gap]  [Misread question]  [Two options looked similar]  [Code confusion]  [Ran out of time]

[Skip]
```

**Implementation:**
```bash
# Find where wrong-answer feedback is shown in Camp Mode
grep -rn "is_correct.*false\|incorrect\|wrong.*answer\|rationale" src/ --include="*.tsx" | head -15
```

Insert the prompt BELOW the rationale card. It appears only on wrong answers. One tap writes to `user_interactions.error_type` for this interaction:
- "Knowledge gap" → `'knowledge_gap'`
- "Misread question" → `'misread'`
- "Two options looked similar" → `'distractor'`
- "Code confusion" → `'code_version'`
- "Ran out of time" → `'time_pressure'`
- Skip → leaves `error_type` as NULL

**Design:**
- 5 horizontal pill buttons, muted styling (`bg-[#F2F0EB] text-[#555555]`)
- On tap: pill highlights Cobalt, writes the value, fades away after 300ms
- "Skip" is a text link below, not a button. The prompt should feel skippable.
- Max height: 60px. Must NOT push the "Next Question" button out of view.

**Critical UX:** This prompt must be FAST and OPTIONAL. If it slows down the quiz flow by even 2 seconds, students will resent it. One tap, instant feedback, done. No modal, no overlay, no confirmation.

#### 2b. Debrief Error Pattern Summary

In the session debrief, if the student tagged 3+ errors, show a pattern summary:

```
Error Patterns (4 wrong answers tagged)
──────────────────────────────────
Knowledge gap:      2 answers
Distractor confusion: 2 answers

→ Two of your errors came from similar-looking options. 
  Compare: PD 1096 §808 vs §810 (ceiling height vs room area).
```

Group by `error_type`, show count, and generate ONE actionable insight from the dominant error type. The insight text is a simple conditional:
- Dominant = `knowledge_gap` → "These topics need more study time. Consider a focused Camp Trail."
- Dominant = `misread` → "Slow down on question reading. The ALE often uses double negatives."
- Dominant = `distractor` → "Review the comparison between these similar code provisions."
- Dominant = `code_version` → "Check: are you studying the latest IRR amendments?"
- Dominant = `time_pressure` → "Your pacing may need adjustment. Endurance sessions can help."

---

### FEATURE 3: Elaborative Interrogation in Wiki

**Research:** d=0.40–0.60 for factual recall. Builds reasoning behind codes, not just numbers.

**Schema change: NONE.** This is a content authoring + rendering change.

**What to build:**

#### 3a. EI Tag Convention

Wiki article content (stored in `wiki_articles.content`) will use a tag convention:

```
[EI]Why does the maximum travel distance decrease in a building without sprinklers?[/EI]
```

The Wiki renderer intercepts these tags and presents an interactive prompt instead of rendering the raw text.

#### 3b. Wiki Renderer Enhancement

```bash
# Find the Wiki article renderer component
grep -rn "wiki.*article\|ArticleContent\|WikiContent\|content.*render\|dangerouslySet\|MDX" src/ --include="*.tsx" -l
```

Add a parser that detects `[EI]...[/EI]` tags in the content string. When found, render an interactive block:

```tsx
// Before interaction:
<div className="my-6 p-4 bg-[#EEF2FC] border border-[#1B3FC4]/15 rounded-lg">
  <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] mb-2">
    Think About It
  </p>
  <p className="text-[15px] text-[#1A2332] font-medium leading-relaxed">
    Why does the maximum travel distance decrease in a building without sprinklers?
  </p>
  <button className="mt-3 text-sm text-[#1B3FC4] font-medium hover:underline">
    Reveal answer →
  </button>
</div>

// After click:
<div className="my-6 p-4 bg-[#F2F0EB] border border-[#E8E4DC] rounded-lg">
  <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] mb-2">
    Think About It
  </p>
  <p className="text-[15px] text-[#1A2332] font-medium leading-relaxed">
    Why does the maximum travel distance decrease in a building without sprinklers?
  </p>
  <div className="mt-3 pt-3 border-t border-[#E8E4DC]">
    <p className="text-[14px] text-[#555555] leading-relaxed">
      [The rest of the article content continues here — everything after the [/EI] tag]
    </p>
  </div>
</div>
```

**Behavior:** Content AFTER the `[/EI]` tag is hidden until the student clicks "Reveal answer." This forces the student to mentally generate an explanation before reading the answer — that's the elaborative interrogation mechanism.

**Analytics event:** Fire `trackEvent({ event_name: 'ei_prompt_revealed', event_properties: { article_id } })` on click.

**Content authoring:** This prompt does NOT add EI tags to existing articles. That's a content team task. The prompt builds the RENDERER. Once deployed, any article with `[EI]...[/EI]` tags will automatically render the interactive prompt.

---

### FEATURE 4: Sleep-Aware Scheduling Logic

**Research:** Walker (2017), Stickgold (2005). Evening = new concepts. Morning = retrieval practice.

**Column:** `trail_steps.preferred_time` TEXT — already exists. Values: `'morning'`, `'evening'`, `'any'`.

**What to build:**

#### 4a. Study Window Input (Onboarding)

```bash
# Find onboarding or profile setup flow
grep -rn "onboarding\|Onboarding\|profile.*setup\|study.*time\|study.*window" src/ --include="*.tsx" -l
```

Add a study window selector to the onboarding flow (or to Profile Settings):

```
When do you usually study?

○ Morning (before noon)
○ Evening (after 5pm)  
○ Both
○ No preference
```

Store as a user preference. Add column if needed:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_study_window TEXT DEFAULT 'any';
-- Values: 'morning', 'evening', 'both', 'any'
```

#### 4b. Trail Step Ordering Logic

When rendering a trail day's steps, sort by `preferred_time` matched to the user's study window:

```typescript
function sortStepsByStudyWindow(
  steps: TrailStep[], 
  userWindow: 'morning' | 'evening' | 'both' | 'any'
): TrailStep[] {
  if (userWindow === 'any') return steps // original order
  
  // Morning users: quiz steps first (retrieval), wiki/lab later (new content)
  // Evening users: wiki/lab first (new content), quiz last (will consolidate overnight)
  // Both: wiki/lab in first half, quiz in second half
  
  const conceptSteps = steps.filter(s => s.step_type === 'wiki' || s.step_type === 'lab')
  const retrievalSteps = steps.filter(s => s.step_type === 'quiz' || s.step_type === 'review')
  
  if (userWindow === 'morning') {
    return [...retrievalSteps, ...conceptSteps] // retrieval first (overnight consolidation), new content later
  }
  
  // evening or both: new content first, retrieval after
  return [...conceptSteps, ...retrievalSteps]
}
```

Apply this sorting in the trail daily view component when rendering the day's steps.

**STOP.** "Sprint 1 Complete. 4 learning science features implemented using existing schema. Reply 'Proceed' for Sprint 2."

---

## SPRINT 2: Minimal Schema + New UI Components

These features need 1 new column and new frontend components.

---

### FEATURE 5: Contextual Variation Practice

**Research:** Rohrer et al. (2014), d=1.05. Same principle tested in 5 different surface contexts trains pattern recognition — critical for ALE's hardest questions.

**Schema change: 1 new column**

```sql
ALTER TABLE public.questions 
  ADD COLUMN IF NOT EXISTS application_context TEXT;
-- Values: 'recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario'
```

**Index:**
```sql
CREATE INDEX IF NOT EXISTS idx_questions_application_context 
  ON public.questions(topic_id, application_context);
```

**What to build:**

#### 5a. Quiz Generation Enhancement

In the quiz session creation logic, add a `contextual_variation` option:

```bash
# Find quiz question selection / session generation logic
grep -rn "question.*select\|generateSession\|buildQuestionPool\|question_ids" src/ --include="*.ts" --include="*.tsx" | head -15
```

When `contextual_variation: true` in session config, the question selection algorithm changes:
- For each target taxonomy node, select ONE question per `application_context` value
- Result: 5 questions on the same topic, each testing a different application
- If not enough context variety exists for a node, fill with available questions

```typescript
async function selectContextualVariationQuestions(
  supabase: SupabaseClient,
  nodeIds: string[],
  totalCount: number
): Promise<string[]> {
  const contexts = ['recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario']
  const selectedIds: string[] = []

  for (const nodeId of nodeIds) {
    for (const context of contexts) {
      if (selectedIds.length >= totalCount) break
      
      const { data } = await supabase
        .from('questions')
        .select('question_id')
        .eq('topic_id', nodeId)
        .eq('application_context', context)
        .limit(1)
        .order('difficulty', { ascending: false }) // harder questions first
      
      if (data?.[0]) selectedIds.push(data[0].question_id)
    }
  }

  return selectedIds
}
```

#### 5b. Trail Step Integration

`trail_steps` can specify `contextual_variation: true` in a config JSONB or via a new boolean. For now, handle it through the existing `config` field on `quiz_sessions`:

```json
{ "contextual_variation": true, "target_node_ids": ["uuid1"], "question_count": 5 }
```

The session creation logic reads this flag and uses the contextual selection algorithm.

---

### FEATURE 6: Successive Relearning Loop

**Research:** Kornell & Bjork (2008). Failed items trigger active re-study, not just rescheduling. More aggressive than standard SRS.

**Schema change: NONE.** This operates through the existing quiz engine + a new session type.

**What to build:**

When a student gets a question wrong in Camp Mode AND they've gotten this same question wrong before (check `user_interactions` for previous `is_correct = false` on the same `question_id`), trigger a mini re-study loop:

```
You've missed this one before. Let's lock it in.

[3 rapid-fire questions on the same topic appear immediately]
```

Implementation:
1. After a wrong answer in Camp Mode, check: has this user answered this `question_id` incorrectly before?
   ```sql
   SELECT COUNT(*) FROM user_interactions 
   WHERE user_id = $1 AND question_id = $2 AND is_correct = false
   ```
2. If count > 0 (repeat failure): insert 3 additional questions from the same `topic_id` into the current session's question queue (at the NEXT position, not the end)
3. These 3 questions are drawn from the same topic but different `question_id` values
4. After all 3, resume the original session flow
5. The 3 re-study questions are tagged in `user_interactions` with a marker (use the `config` JSONB or a new flag) so the debrief can distinguish them

**UX:**
- Brief transition screen: "Quick re-study: 3 questions on [topic name]" — fades after 1.5s
- The 3 questions look identical to normal Camp Mode questions (same UI, same feedback)
- After the 3rd, a brief confirmation: "Re-study complete. Back to your session."

**Voice:** "You've seen this concept before and it didn't stick. Three focused questions to fix that."

**STOP.** "Sprint 2 Complete. Contextual variation + successive relearning built. Reply 'Proceed' for Sprint 3."

---

## SPRINT 3: New Tables — Flagship Differentiators

These features require new database tables and significant new UI.

---

### FEATURE 7: Feynman Teach-Back

**Research:** Self-explanation effect, d=0.55–1.0. The highest effect size in the learning science literature.

**Schema: 2 new tables** (from product architecture doc Section 8.3):

```sql
CREATE TABLE IF NOT EXISTS public.teach_back_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.taxonomy_tree(node_id),
  entry_point TEXT NOT NULL CHECK (entry_point IN ('wiki', 'blindspot', 'trail')),
  trail_day_id UUID REFERENCES public.trail_days(day_id),
  prompt_text TEXT NOT NULL,
  student_response TEXT NOT NULL,
  evaluation_result JSONB DEFAULT '{}',
  gaps_identified TEXT[] DEFAULT '{}',
  revised_response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  revised_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teach_back_user ON public.teach_back_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teach_back_topic ON public.teach_back_submissions(topic_id);

ALTER TABLE public.teach_back_submissions ENABLE ROW LEVEL SECURITY;
-- Add user-scoped SELECT + INSERT + UPDATE policies

CREATE TABLE IF NOT EXISTS public.topic_teach_back_criteria (
  criteria_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.taxonomy_tree(node_id),
  required_concepts TEXT[] NOT NULL DEFAULT '{}',
  required_exceptions TEXT[] NOT NULL DEFAULT '{}',
  common_misconceptions TEXT[] NOT NULL DEFAULT '{}',
  code_citations TEXT[] NOT NULL DEFAULT '{}',
  authored_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teach_back_criteria_topic ON public.topic_teach_back_criteria(topic_id);
```

Also add planned columns to `user_node_mastery`:
```sql
ALTER TABLE public.user_node_mastery 
  ADD COLUMN IF NOT EXISTS teach_back_attempted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS teach_back_gap_count INTEGER DEFAULT 0;
```

**What to build:**

#### 7a. Teach-Back Prompt (3 Entry Points)

1. **Post-Wiki article:** At the bottom of a Wiki article, after scrolling to ~80% completion:
   ```
   Can you explain this in your own words?
   [Open text area, 200 word minimum]
   [Submit] [Skip for now]
   ```

2. **Post-Blindspot queue:** After completing a Blindspot Protocol queue where a node moved Red → Amber:
   ```
   [Topic name] just improved. Can you explain the key concept in plain language?
   ```

3. **Camp Trail day completion:** Optional final step before day is marked complete.

#### 7b. AI Evaluation (via Anthropic API)

The student's response is sent to Claude API (temperature 0.0, bounded to SlateCamp database context) with the `topic_teach_back_criteria` for that topic:

```typescript
const systemPrompt = `You are evaluating a student's explanation of "${topicName}" for the Philippine Architecture Licensure Exam. 

Required concepts: ${criteria.required_concepts.join(', ')}
Required exceptions: ${criteria.required_exceptions.join(', ')}
Code citations expected: ${criteria.code_citations.join(', ')}
Common misconceptions to watch for: ${criteria.common_misconceptions.join(', ')}

Evaluate the student's explanation on 5 dimensions:
1. Conceptual completeness (did they cover the core mechanism?)
2. Causal reasoning (did they explain WHY, not just WHAT?)
3. Accuracy (any factually incorrect claims?)
4. Philippine code specificity (did they reference relevant codes?)
5. Missing critical exceptions

Output JSON:
{
  "score": 0-100,
  "gaps": ["gap1", "gap2"],
  "correct_points": ["point1", "point2"],
  "factual_errors": ["error1"],
  "revision_prompt": "one focused question to improve the explanation"
}`
```

#### 7c. Gap Display (NOT a score — a gap analysis)

```
What you got right:
✓ Identified the 2.70m minimum ceiling height
✓ Referenced PD 1096 correctly

What was missing:
✗ Exception for mezzanine floors (1.80m clear above and below)
✗ Didn't distinguish natural vs artificial ventilation minimums

One factual issue:
⚠ The minimum is 2.70m for ground floor, not all floors — upper floors allow 2.40m

Revision prompt:
"What changes on upper floors, and why does ventilation type matter?"

[Revise my answer →] [Done]
```

Write the evaluation to `teach_back_submissions.evaluation_result` and update `user_node_mastery.teach_back_attempted = true`.

---

### FEATURE 8: Anxiety Inoculation Protocol (Deferred — Spec Only)

**Research:** Stress inoculation from sports psychology. Jamieson et al. (2010): arousal reattribution improved GRE scores.

**This is a SPEC for future implementation. Do NOT build now.**

The Pressure Protocol is a 2-week Storm Mode variant triggered when `target_exam_date` is within 14 days:
- Time per question reduced by 5% below student's comfortable pace
- Occasional simulated 3-second question loading delay
- Mandatory sequential answering (no flagging, no return)
- Random question order (no subject clustering)

**Schema need:** A `pressure_protocol` flag on `quiz_sessions` config, or a new `test_mode` enum value. Defer to Phase 3.

---

### FEATURE 9: Worked Example Progression in 3D Lab (Deferred — Spec Only)

**This is a SPEC for future implementation. Do NOT build now.**

Each 3D Lab module follows three phases:
1. Guided tour (watch) → `mode: 'guided'`
2. Faded example (do part) → `mode: 'faded'`
3. Full problem-solving (do all) → `mode: 'independent'`

**Schema need:** A `module_phase` column on a future `user_3d_lab_progress` table. Defer until 3D Lab modules are actually built.

---

## PHASED EXECUTION

### PHASE 1: Audit
```bash
# Verify columns exist
grep -rn "pre_session_confidence\|error_type\|preferred_time\|application_context" src/ --include="*.ts" --include="*.tsx" | head -20

# Find quiz flow components
grep -rn "Camp.*Mode\|camp.*mode\|startQuiz\|QuizQuestion\|QuizSession" src/ --include="*.tsx" -l

# Find debrief/results components
grep -rn "debrief\|result\|summary\|score.*display\|SessionResult" src/ --include="*.tsx" -l

# Find Wiki article renderer
grep -rn "wiki.*content\|article.*content\|WikiArticle\|ArticleView" src/ --include="*.tsx" -l

# Find trail daily view
grep -rn "trail.*day\|TrailDay\|DailyView\|trail.*step" src/ --include="*.tsx" -l

# Find onboarding / profile
grep -rn "onboarding\|profile.*setting\|ProfileForm" src/ --include="*.tsx" -l
```

Map every injection point before writing code.

**STOP.** "Phase 1 Complete. Reply 'Proceed' for Sprint 1 implementation."

### PHASE 2: Sprint 1 — Features 1-4
Implement metacognitive calibration, error taxonomy, elaborative interrogation, sleep-aware scheduling. Zero schema changes.

**STOP after each feature.** Verify it works before moving to the next.

### PHASE 3: Sprint 2 — Features 5-6
Run schema migration (application_context column). Implement contextual variation + successive relearning.

**STOP.**

### PHASE 4: Sprint 3 — Feature 7
Run schema migration (teach_back tables). Implement Feynman teach-back with AI evaluation.

**STOP.**

### PHASE 5: Verification
- [ ] Confidence rating screen appears before Camp/Storm quiz sessions
- [ ] Confidence ratings write to `quiz_sessions.pre_session_confidence_ratings`
- [ ] Calibration chart appears in debrief when ratings were given
- [ ] Error taxonomy prompt appears after wrong answers in Camp Mode
- [ ] Error type writes to `user_interactions.error_type`
- [ ] Error pattern summary appears in debrief when 3+ errors tagged
- [ ] Wiki `[EI]...[/EI]` tags render as interactive reveal blocks
- [ ] "Reveal answer" click fires analytics event
- [ ] Study window preference saves to user profile
- [ ] Trail steps sort by study window preference
- [ ] `application_context` column exists on questions table
- [ ] Contextual variation quiz selection works when config flag is set
- [ ] Successive relearning loop triggers on repeat wrong answers
- [ ] `teach_back_submissions` and `topic_teach_back_criteria` tables exist
- [ ] Teach-back prompt appears post-wiki (if criteria exist for topic)
- [ ] AI evaluation returns gap analysis JSON
- [ ] No TypeScript errors, no console errors
- [ ] DATABASE_SCHEMA.sql updated with all new tables/columns

**STOP.** "Phase 5 Complete. Learning science integrations shipped."

---

## WHAT NOT TO DO

- **Don't build Features 8 or 9.** They're specs for future phases. The prompt documents them for context but explicitly says DO NOT BUILD.
- **Don't add EI tags to Wiki content.** Build the renderer only. Content authoring is a separate task for the content team.
- **Don't make the confidence screen mandatory.** "Skip" must always be visible and work.
- **Don't make the error taxonomy prompt modal.** It's inline, below the rationale, one-tap, skippable. Never blocks the quiz flow.
- **Don't use Syne font in any quiz-context screens.** All Inter. The quiz is about the QUESTION.
- **Don't animate the calibration chart.** Static table. Data over decoration.
- **Don't install new dependencies** for the teach-back AI evaluation — use the existing Anthropic Claude API integration.
- **Don't seed teach_back_criteria data.** Build the tables and the evaluation pipeline. SMEs populate the criteria later.
- **Don't break existing quiz flow.** The confidence screen, error prompt, and successive relearning loop are ADDITIONS to the existing flow. If any of them error, the quiz must continue normally without them.

---

*Execute Phase 1 now. Audit every injection point before writing code.*
