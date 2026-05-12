# SlateCamp — UX Research & Design: Four Core Features
**Research depth:** Comprehensive · March 2026
**Features:** PRC Area-Weighted Score · Heatmap Filtering · Subject Floor Alert · Personal Cram Card Generator

---

## Preamble: Why These Four Features Form a Coherent System

These four features are not independent improvements — they are a single diagnostic system that tells the student exactly where they stand and what will happen if they don't act. Before writing a single component spec, it's critical to see how they connect:

```
Task 1: Readiness Score becomes TRUTHFUL (PRC-weighted)
    ↓ feeds accurate data to
Task 2: Heatmap becomes CLEAN (no phantom ALE-LAWS nodes)
    ↓ feeds accurate sub-scores to
Task 3: Subject Floor Alert tells the student when they're at EXAM FAILURE RISK despite a good overall score
    ↓ the student wants to know SPECIFICALLY WHAT TO MEMORIZE
Task 4: Cram Card shows the exact numerical values the student keeps missing
```

Without Task 1, the Readiness Score lies. A student with 100% Area C mastery would show 100% when the real answer is ~40%. Every emotional response a student has to their score — motivation, fear, reassurance — is based on false data.

Without Task 2, the heatmap shows nodes that have zero exam weight. A student could "master" ALE-LAWS nodes and feel productive while making no progress toward passing.

Without Tasks 1 and 2 fixed, Task 3 (Subject Floor Alert) would fire based on wrong numbers and wrong nodes.

Without accurate sub-scores from Task 1, Task 4's generation query would work but the Cram Card wouldn't know whether to surface Building Laws or Structural more urgently.

**Ship in order. The sequence is the system.**

---

## TASK 1 — Readiness Score: PRC Area Weighting

### The UX Research Foundation

#### What the student believes the Readiness Score means

From our ALE candidate research and the Filipino Architect Encyclopedia: students treat the Readiness Score as a direct proxy for exam readiness. When a student sees 74%, they interpret it as "I am 74% likely to pass." This belief is deeply held, emotionally significant, and guides their study decisions. They show their score to batchmates. They use it to decide whether to book an exam slot.

This means **an inaccurate score has consequences that extend far beyond the product**. A student who believes they're at 74% overall readiness but is actually at 52% ALE-weighted readiness will under-prepare for Area C — and potentially fail the exam feeling betrayed by the tool they trusted.

The PRC area weighting fix is not a backend math patch. It is a **trust repair** on the product's most emotionally significant feature.

#### Why the current unweighted calculation is specifically dangerous for Area C

Area C (ALE-DSGN, Architectural Design) is 40% of the ALE and is the subject where most first-time failures occur. Under the current unweighted calculation:

- If a student has 170 nodes total, Area C nodes represent roughly 20–25 of them (~12–15% by count)
- But they carry 40% of exam weight
- A student who has never touched Area C but has mastered all other nodes gets a misleading score of ~85–90%
- Under the PRC weighting, that same mastery profile correctly produces ~51–60%

That ~30-point gap is the gap between "I'm almost ready to book my exam" and "I need 3 more months." **The current formula is costing students exam slots.**

#### The emotional experience of score correction

When the PRC-weighted score ships, every existing user will see their score change. For students who have been studying diligently, their score may drop significantly. This is a **psychologically sensitive moment** that requires specific UX handling.

Research from behavioral finance (Kahneman, 2011) establishes that losses feel approximately twice as painful as equivalent gains feel good. A student whose score drops from 68% to 54% because of the weighting fix will feel devastated — even though nothing about their actual readiness changed.

The score correction must be **framed as increased accuracy, not decrease in performance**.

### Component Specifications

#### ReadinessScoreCard — State Changes

**State A: Pre-weighting-fix (current)**
The score renders as a single number with color coding. No sub-score breakdown. No ALE area context.

**State B: Post-weighting-fix (target)**

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR READINESS SCORE         DM Mono 9px eyebrow               │
│                                                                 │
│           67%                 Syne 800, 72px, signal-amber      │
│                                                                 │
│  "Solid progress. Building Laws is still your gap."            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  BY EXAM AREA                 DM Mono eyebrow                  │
│                                                                 │
│  Area A (30%)  ████████████░░  78%  ↑ History, Theory, Practice│
│  Area B (30%)  █████████░░░░░  63%  ↑ Structural, Materials    │
│  Area C (40%)  █████░░░░░░░░░  41%  ↓ Design — your focus     │
│                                                                 │
│  Day 1 readiness: 71%   Day 2 readiness: 54%                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- Area C gets its own visual weight — the (40%) annotation next to "Area C" is critical. Students must understand WHY their score is lower than they expect.
- Day 1 / Day 2 readiness split is a new data point derived from `dayOneScore` and `dayTwoScore` from the computation. This directly maps to the ALE's two-day structure and gives the student actionable scheduling intelligence.
- The bar chart uses the heatmap's color system: `#1B7A3C` (≥75%), `#E8853A` (50–74%), `#E63329` / neutral (< 50%). **Do not use red for Area C score — use a neutral muted color with a downward indicator**. Red is reserved for the Subject Floor Alert (Task 3). Here, a low score is not an emergency — it's an insight.

#### The Score Migration Banner

When the PRC-weighted formula first ships and existing scores change, show this banner once per user — and only once:

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR SCORE IS NOW MORE ACCURATE                               │
│                                                                 │
│  We've updated how your Readiness Score is calculated to       │
│  match the ALE's actual exam weighting — Area C counts for     │
│  40% of your score, Area A and B for 30% each.                │
│                                                                 │
│  Your score changed from 74% → 58%.                           │
│                                                                 │
│  Your preparation is the same. The number is more honest.      │
│  Area C (Architectural Design) is now your clearest focus.     │
│                                                                 │
│  [Got it — show me what to study]           [Dismiss]         │
└─────────────────────────────────────────────────────────────────┘
```

Background: `bg-[#EEF2FC]` (cobalt-light). Border: `border-[#1B3FC4]`. No red anywhere. The framing is "accuracy" not "bad news."

Dismiss stores to `user_global_stats.score_weighting_explained_at`. Never show again.

### Complete User Paths

#### Path A — Happy Path: Student Opens Dashboard After Score Update

```
Step 1: Student opens /dashboard
Step 2: If migration banner has not been seen:
        → Migration banner renders above ReadinessScoreCard
        → Banner shows old vs new score with explanation
Step 3: Student reads banner, clicks "Got it — show me what to study"
Step 4: System marks `score_weighting_explained_at = now()`
Step 5: Navigation goes to /dashboard/testing with Area C pre-selected
        in Subject Mode (the lowest sub-score)
Step 6: Banner never appears again
```

#### Path B — Happy Path: Returning Student, Already Explained, Dashboard Load

```
Step 1: Student opens /dashboard
Step 2: ReadinessScoreCard loads with PRC-weighted score
Step 3: Sub-score breakdown shows by Area A/B/C
Step 4: Student sees Day 1 (71%) and Day 2 (54%) split
Step 5: Student uses this to decide whether to focus their session
        on Area C today
```

#### Path C — New Student, No History

```
Step 1: Student completes assessment quiz
Step 2: Score Reveal shows PRC-weighted score for the first time
Step 3: Sub-scores are populated from the assessment results
Step 4: No migration banner (they never had an old score)
Step 5: Recommendation uses area-weighted scores to identify focus
```

#### Path D — Failure: Computation Returns Invalid Data

```
Trigger: computeReadinessScore() throws or returns NaN
Step 1: ReadinessScoreCard catches error via error boundary
Step 2: Shows skeleton → error state: "Score is being calculated.
        Check back in a few minutes."
Step 3: Does NOT show "Error" or "0%"
Step 4: Retries on next dashboard load
Step 5: Error logged silently — student never sees a stack trace
```

#### Path E — Edge Case: User With No Area C Data

```
Condition: user_node_mastery has entries for Areas A and B but zero
           ALE-DSGN nodes (never done a design/planning quiz)
Step 1: computeReadinessScore() returns Area C subScore = 0.0
        (not null, not excluded — zero contribution)
Step 2: Overall score correctly reflects the penalty for untouched Area C
Step 3: ReadinessScoreCard shows Area C bar at 0% with label:
        "Not started"
Step 4: Day 2 readiness shows the 0% contribution
Step 5: Camp Trail recommendation for Design surfaces prominently
```

---

## TASK 2 — Heatmap: Exclude ALE-LAWS and Deprecated Nodes

### The UX Research Foundation

#### Why ALE-LAWS nodes in the heatmap is a material UX problem

ALE-LAWS nodes have `is_cross_ref_only = true`. They are not exam subjects — they are cross-references that map to other subject areas. A student who answers a Building Laws question is actually practicing PD 1096, RA 9514, or BP 344 — which are correctly tagged under ALE-DSGN, ALE-STRC, etc.

If ALE-LAWS nodes appear in the heatmap, the student experiences:

1. **Confusion about what to study.** "ALE-LAWS-003 is Red. Should I study Building Laws as a subject? Where do I find that in the Camp Trail?" The answer is: you don't, because it's not a separate subject — it's a cross-reference.

2. **False red nodes that can't be fixed.** A student who encounters an ALE-LAWS node in their heatmap and tries to address it will keep seeing it Red because no quiz session directly targets ALE-LAWS nodes as a subject. The node stays Red indefinitely, creating confusion and anxiety.

3. **Inflated "gaps" count.** The Subject Floor Alert (Task 3) would fire incorrectly for "Building Laws" as a subject, when Building Laws content is actually covered across Design and other areas.

#### Why deprecated nodes must be excluded

Deprecated nodes (`deprecated_at IS NOT NULL`) represent content that has been retired — either because it was covered by a code update (BP 344 2024 IRR superseding older provisions), because the taxonomy was restructured, or because the exam no longer tests this area.

A student seeing a deprecated node on their heatmap experiences:
1. Studying content that will not appear on the exam
2. Spending time on topics that have no exam weight
3. Potentially learning outdated code provisions that are now incorrect

This is not just UX friction — it is a **content accuracy and exam performance issue**. A student who memorizes a deprecated BP 344 provision may choose the wrong answer on the actual ALE.

#### The consistency requirement — not just the heatmap

The filter `is_cross_ref_only = false` AND `deprecated_at IS NULL` must be applied **everywhere the taxonomy is queried for student-facing purposes**. This includes:

- Heatmap rendering
- Subject selectors in quiz configuration (Custom Session, Subject Mode)
- Camp Trail step target node lists
- Blindspot Protocol node scanning
- Sub-score computation (Task 1)
- Cram Card generation query (Task 4)

A node that doesn't appear in the heatmap must also not appear in quiz sessions. Otherwise a student can answer questions on a cross-reference node but never see it reflected anywhere. The consistency is the fix — not just the heatmap filter.

### Component Specifications

#### TaxonomyHeatmap — Filtered State

The heatmap itself doesn't need visual changes — the fix is entirely at the query layer. However, the UX impact is felt through:

**Before fix:** Heatmap shows N nodes including cross-reference and deprecated nodes. Some nodes permanently stay Red because they can't be directly targeted.

**After fix:** Heatmap shows only the 172 canonical leaf nodes (or whatever the correct count is post-v5.0 import). Every node in the heatmap can be targeted by quiz sessions. Every Red node represents a genuine, addressable gap.

**Node count display:**
```
YOUR KNOWLEDGE MAP
172 topics · 43 mastered · 68 developing · 61 not started
```

This count must only reflect non-cross-reference, non-deprecated leaf nodes. If the count changes after the v5.0 import removes ALE-LAWS nodes, the number updates automatically — no copy change needed because it's dynamic.

#### Subject selector in quiz configuration

The subject dropdown in Custom Session and Subject Mode must also exclude ALE-LAWS:

```
SELECT SUBJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● All subjects (mixed)
─ Area A ────────────────────
○ History of Architecture
○ Theory of Architecture
○ Theory & Principles of Planning
○ Professional Practice
─ Area B ────────────────────
○ Structural Design
○ Building Materials & Methods
○ Building Utilities
─ Area C ────────────────────
○ Architectural Design & Site Planning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

ALE-LAWS never appears as a selectable subject because it has no independent exam weight and no dedicated questions of its own. This prevents the confusion of a student selecting "Building Laws" from the dropdown and getting an empty quiz.

### Complete User Paths

#### Path A — Happy Path: Student Views Heatmap After Filter Applied

```
Step 1: Student navigates to /dashboard or the heatmap section
Step 2: Query runs with is_cross_ref_only = false AND deprecated_at IS NULL
Step 3: Heatmap renders with only canonical ALE leaf nodes
Step 4: No ALE-LAWS nodes appear
Step 5: Every Red node student sees can be addressed via Camp Mode or
        Subject Mode targeting that node
Step 6: Student has no confusion about phantom nodes
```

#### Path B — Post-v5.0 Import: Node Count Changes

```
Step 1: v5.0 taxonomy import runs in admin
Step 2: Some previously visible nodes are now marked deprecated_at
Step 3: Next time student loads heatmap, deprecated nodes disappear
Step 4: Node count in "172 topics" display updates dynamically
Step 5: If a deprecated node was in the student's mastery history:
        - user_node_mastery rows still exist (don't delete data)
        - The node simply doesn't appear in the visual heatmap
        - Sub-scores correctly exclude it from computation
```

#### Path C — Failure: Query Missing Filter in One Location

```
This is the main failure mode to prevent.
A student opens Custom Session and sees "ALE-LAWS" in the subject selector
→ selects it → quiz starts → 0 questions returned → blank quiz session
→ student confusion, support contact

Prevention: Grep the codebase for every .eq('is_leaf', true) occurrence
            and verify each has both filter conditions added.
            Add a comment above each: // FILTER: is_cross_ref_only=false, deprecated_at=null required
```

---

## TASK 3 — Subject Floor Alert

### The UX Research Foundation

#### The exam rule most students don't fully understand

The ALE has a minimum subject score requirement: a candidate must score at least 50% in every subject to pass, regardless of their weighted overall average. A student at 74% overall with 47% in Structural Design **fails**.

From our research: this rule is known but not emotionally salient. Students focus on their overall Readiness Score. They think "I need to reach 70%" and work toward that number. They don't think "I need to ensure every subject is above 50%." This is a documented cognitive bias — **scope insensitivity** — where the overall number obscures individual components.

The Subject Floor Alert is not a feature. It is a **safety intervention**. It exists because SlateCamp's product — if it only shows the overall score — can be partly responsible for a student failing due to a subject floor violation they didn't know they were approaching.

#### Why the alert must be non-dismissible

This is the most important UX decision in Task 3, and it will face pushback from a student perspective. Students find non-dismissible alerts annoying. But consider the stakes:

- A student who dismisses a subject floor alert may not return to that subject
- The exam is once or twice a year
- Failing due to a subject floor while having an overall 70%+ score is a deeply painful outcome
- SlateCamp's core promise is "know you'll win" — which means surfacing information the student needs to win, even when they don't want to hear it

The research basis: Thaler & Sunstein (2008) on choice architecture establishes that **defaults matter enormously for high-stakes decisions**. Making the alert dismissible sets the default to "ignore it." Making it non-dismissible sets the default to "acknowledge it." Given the stakes of the ALE, the non-dismissible default is correct.

The **only acceptable dismissal** is the score rising above the floor threshold. The alert earns its own removal by the student studying the flagged subject.

#### The "calm urgency" constraint

Signal Red background on the alert is correct — but the copy must avoid panic language. The student who reads this alert may be in a high-anxiety state already. The copy must be:
- Factual (not emotional): "Building Laws is at 43%"
- Specific (not vague): "The ALE requires at least 50% in every subject"
- Actionable (not catastrophizing): "Study Building Laws Now →"
- Never: "You're FAILING Building Laws!" / "CRITICAL WARNING" / "You might not pass!"

From our gamification research: **calm urgency** is the correct emotional register for admin-level information in an exam prep context. The student needs to act, not panic.

### Component Specifications

#### SubjectFloorAlert — Full Anatomy

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠  EXAM RISK: SUBJECT FLOOR                                   │
│     DM Mono 9px uppercase, white on Signal Red background      │
│                                                                 │
│  Building Laws is at 43%.                                      │
│  The ALE requires at least 50% in every subject to pass —     │
│  regardless of your overall score.                             │
│                                                                 │
│  [Study Building Laws Now →]              ← cobalt blue button │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**When multiple subjects are below floor (stacked):**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠  EXAM RISK: SUBJECT FLOOR                                   │
│                                                                 │
│  Building Laws is at 43%.                                      │
│  The ALE requires at least 50% in every subject.               │
│  [Study Building Laws →]                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Structural Design is at 38%.                                  │
│  The ALE requires at least 50% in every subject.               │
│  [Study Structural Design →]                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each subject below floor gets its own row within the single alert card. They are separated by a divider line, not by separate cards. One card, multiple rows. This prevents the dashboard from looking like a panic wall.

**Design token spec:**
- Background: `#E63329` (Signal Red) — the single correct use of Signal Red in a non-form context
- All text: `white` — `#FFFFFF`
- Eyebrow: `DM Mono 9px uppercase`
- Body: `Inter 14px, line-height 1.6`
- CTA button: `bg-[#1B3FC4] text-white hover:bg-[#163399]` — Cobalt Blue on red background creates sufficient contrast and signals "action available"
- Border: none (the red background is sufficient boundary)
- Position: absolutely first element in dashboard content area, above everything including the Readiness Score card
- No close / dismiss / minimize button anywhere

**The CTA routing:**
`/dashboard/testing?subject=[ale_id]` with the specific subject pre-populated in Subject Mode. When the student clicks "Study Building Laws →", they arrive directly in a pre-filtered quiz session — zero setup, immediate focus.

#### ReadinessScoreCard — Sub-Score Breakdown (Secondary Reinforcement)

Below the main score number, a compact per-subject breakdown serves as a persistent sub-threshold reminder even when the threshold issue is not yet triggered:

```
SUBJECT BREAKDOWN                 DM Mono eyebrow
History of Architecture   ████████████░░   79%   ●
Theory of Architecture    ██████████░░░░   68%   ●
Theory & Principles       █████████░░░░░   62%   ●
Professional Practice     ████████████░░   78%   ●
─────────────────────────────────────────────────
Structural Design         ███████████░░░   74%   ●
Building Materials        ████████░░░░░░   56%   ●
Building Utilities        █████░░░░░░░░░   41%   ▲
─────────────────────────────────────────────────
Architectural Design      ██████░░░░░░░░   44%   ▲

▲ = below 50% subject floor  ● = above floor
```

The `▲` triangle symbol (without text label) next to below-floor subjects creates a secondary signal that doesn't require reading the full alert. It maps to the same "attention" semantics as the alert above without repeating the full emergency framing.

**Floor threshold line:**
A subtle vertical dashed line at the 50% mark on all bars, labeled with a tiny "ALE minimum" annotation. This makes the floor spatially visible without repeated copy.

### Complete User Paths

#### Path A — Happy Path: Student Has One Subject Below Floor

```
Step 1: Student opens /dashboard
Step 2: Server fetches readiness_score_snapshots.sub_scores (most recent row)
        AND disciplines.subject_floor_pct (should return 50)
Step 3: System compares each sub_score to floor_pct
Step 4: Building Laws at 43% < 50% threshold
Step 5: SubjectFloorAlert renders above ReadinessScoreCard
        with one row: "Building Laws is at 43%"
Step 6: Student taps [Study Building Laws Now →]
Step 7: Navigation → /dashboard/testing?subject=ALE-LAWS
        (Note: ALE-LAWS is the subject identifier, but the actual
         quiz targets the underlying content nodes — PD 1096, BP 344, etc.)
Step 8: Camp Mode / Subject Mode launches pre-filtered to Building Laws
Step 9: Student completes session
Step 10: New sub_scores written to readiness_score_snapshots
Step 11: If Building Laws is now ≥ 50%: alert disappears on next dashboard load
Step 12: If still < 50%: alert persists
```

#### Path B — Happy Path: Student Brings All Subjects Above Floor

```
Step 1: Student has been studying flagged subjects for 2 weeks
Step 2: Latest sub_scores: all 8 subjects ≥ 50%
Step 3: Dashboard loads
Step 4: SubjectFloorAlert is NOT rendered (condition not met)
Step 5: Readiness Score card shows without alert
Step 6: Sub-score breakdown shows all green dots (≥50%)
Step 7: Student experiences relief — the reward of having fixed the gap
```

#### Path C — Multiple Subjects Below Floor

```
Step 1: New student, recently onboarded, assessment reveals 3 weak subjects
Step 2: Building Laws 43%, Structural 38%, Utilities 49%
Step 3: SubjectFloorAlert renders with 3 stacked rows
Step 4: Each row has its own CTA
Step 5: Student taps [Study Structural Design →] (chooses to tackle worst one first)
Step 6: Session completes, Structural improves to 55% (above floor)
Step 7: Next dashboard load: Structural row disappears, Building Laws + Utilities remain
Step 8: Student experiences visible progress — the alert is getting shorter
```

#### Path D — Edge Case: sub_scores Data Not Yet Available

```
Condition: Most recent readiness_score_snapshots.sub_scores is '{}' (empty)
           (This is the pre-fix state — Task 3A hasn't shipped yet, OR
            user has never completed a session since fix shipped)
Step 1: SubjectFloorAlert queries sub_scores, finds empty JSONB
Step 2: Alert does NOT render (cannot fire false positives with empty data)
Step 3: ReadinessScoreCard shows without sub-score breakdown
Step 4: Sub-score section shows: "Complete a study session to see
        your subject-level breakdown"
Step 5: Once sub_scores are populated (after first post-fix session):
        normal alert evaluation resumes
```

#### Path E — Edge Case: Floor Threshold Changes in Database

```
Condition: disciplines.subject_floor_pct is updated from 50 to 55
Step 1: At next dashboard load, floor comparison uses new threshold (55)
Step 2: Students who were previously "safe" at 52% are now flagged
Step 3: SubjectFloorAlert appears for them
Step 4: They see: "History of Architecture is at 52%.
        The ALE requires at least 55% in every subject."
Step 5: Copy is dynamic — always reads from database — no copy changes needed
```

#### Path F — Failure: sub_scores JSONB Missing Keys

```
Condition: sub_scores contains some but not all 8 subject keys
           e.g., { "ALE-HIST": 0.72, "ALE-STRC": 0.49 } — 6 keys missing
Step 1: For missing subject keys, treat as 0.0 (unknown = potentially below floor)
Step 2: Alert fires for missing subjects: "ALE-THEO score is not yet available.
        Complete a session with Theory of Architecture questions."
Step 3: CTA routes to Subject Mode for the missing subject
Step 4: This prevents the dangerous state of a student thinking they're safe
        because a subject simply wasn't computed yet
```

---

## TASK 4 — Personal Cram Card Generator

### The UX Research Foundation

#### The behavior this feature is replacing

From the Filipino Architect Encyclopedia and our ALE candidate research: **every serious ALE reviewer manually compiles a personal cram card** in the final weeks before the exam. This is documented, consistent behavior across review candidates.

The manual process:
1. Student reviews past mock exam results
2. Identifies numerical values they've consistently gotten wrong
3. Writes them on index cards or a notebook page: "BP 344 corridor width: 1.2m minimum", "Fire Code travel distance (sprinklered): 45m", etc.
4. Reviews this list daily in the final week before the exam

This behavior is not optional or unusual — it is standard ALE preparation practice. The encyclopedia specifically mentions "the 20 numerical values every ALE candidate must know cold" as a defined category.

SlateCamp has **all the data to automate this**. The `user_interactions` table contains every question a student has ever answered, with correctness, time spent, and topic mapping. The `taxonomy_tree.wiki_items` JSONB contains the formula, code provision, and memory hook for each node.

Automating this replaces a manual, error-prone process with a precise, personalized, automatically-updated artifact.

#### Why this is the highest word-of-mouth feature

From our marketing research: **physical, printable artifacts with personal data** have dramatically higher sharing rates than digital-only content. A student who prints their Cram Card and shows it to a batchmate ("Look at my 20 weakest spots") is immediately explaining SlateCamp's value proposition in concrete terms. The batchmate asks "How did it make this?" — that's the acquisition conversation.

The Cram Card serves three business functions simultaneously:
1. **Retention:** The student who has a personalized Cram Card tied to their specific wrong answers is much more likely to return to SlateCamp to see if it updates
2. **Acquisition:** Shared Cram Cards are word-of-mouth proof of the platform's intelligence
3. **Exam performance:** Students who review their most-missed numerical values outperform those who do generic review (retrieval practice effect, Roediger & Karpicke, 2006)

#### The generation threshold: why 20 sessions?

The implementation plan specifies 20 total sessions. The UX research basis:
- Below 5 sessions: insufficient data to distinguish patterns from noise
- 5–10 sessions: enough to identify a few consistent wrong topics, but the card would be too sparse to be useful
- 10–20 sessions: approaching useful data density, but high-frequency nodes may not have been encountered across enough question types
- 20+ sessions: sufficient breadth across the question bank that the card genuinely reflects the student's personal gap profile, not just which questions they happened to encounter

The 20-session gate also creates a **motivation mechanic** without gamification. "Complete 20 study sessions to unlock your Cram Card" gives early-stage students a meaningful near-term goal tied to a genuinely useful feature — not a badge or trophy.

The gate display must be **clear about what counts** as a session, to avoid confusion:
- Any completed quiz session counts (Camp Mode, Storm Mode, Subject Mode, Custom Session)
- The 35-item assessment quiz counts as sessions toward the threshold
- Camp Trail quiz steps count

### Component Specifications

#### /dashboard/cram-card Page Layout

**Pre-gate state (< 20 sessions):**

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR CRAM CARD               DM Mono 9px eyebrow              │
│                                                                 │
│  The values you need to know cold.                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [Icon: document with chart]                                    │
│                                                                 │
│  Complete 20 study sessions to unlock your Cram Card.         │
│  Your card will show the numerical values you keep             │
│  getting wrong — personalized to your gaps.                    │
│                                                                 │
│  You've completed 12 of 20 sessions.                          │
│  ████████████░░░░░░░░  12/20                                   │
│                                                                 │
│  [Start a session to get closer →]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Note: The progress bar is **not gamification** — it is informational. The student needs to know how close they are to unlock. The CTA routes to `/dashboard/testing` to start a session. Do not show a blurred/locked preview — this creates false desire for content that doesn't exist yet. Just the message and the progress.

**Post-gate state — Card Generated:**

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR CRAM CARD               DM Mono 9px eyebrow              │
│  Week of March 24, 2026       Inter 13px muted                 │
│  Updates weekly               [Download PDF]                    │
│                                                                 │
│  20 values you keep missing · High-frequency ALE topics        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [CramCard grid — 2 columns, 10 rows each side]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### CramCardEntry Component — Single Row

Each of the 20 entries has the same anatomy:

```
┌─────────────────────────────────────────────────────────────────┐
│  01  ALE-STRC-001-02                    DM Mono 9px, cobalt    │
│      Stair Riser Heights                Inter 500, 14px         │
│                                                                 │
│      180mm minimum, 200mm maximum       Inter 700, 14px, cobalt │
│                                                                 │
│      PD 1096, Rule VII, Section 1202    DM Mono 11px, muted    │
│                                                                 │
│      "ALE often tests this as 'which stairway is non-compliant' │
│       — any riser outside 180–200mm fails."  Inter italic 12px │
│                                                                 │
│  ✗  You've answered this correctly 1 of 4 times  (25%)        │
│     DM Mono 10px, muted — accuracy indicator                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Entry anatomy:**
1. **ALE node ID** — DM Mono, cobalt — for cross-reference to the heatmap
2. **Subtopic name** — the human-readable topic title
3. **The value** — visually dominant, cobalt, Inter 700 — this is the memorization target
4. **Code reference** — DM Mono, muted — the citation for verification
5. **Memory hook** — italic, from `wiki_items.exam_tip` — the "why it matters" context
6. **Your accuracy** — honest data about how often the student gets this right — shows progress across regenerations

**The accuracy display:**
Showing accuracy on the Cram Card creates a secondary motivation loop. When the student regenerates the card next week after studying, they can see: "Last week: 25% correct. This week: 75% correct." This is mastery evidence, not gamification. It is a true measurement of learning.

If accuracy improves to > 70% on a card entry, that entry **drops off the next card** and is replaced by the next-most-problematic topic. The card self-curates as the student improves. This is the feature's most powerful behavioral property: studying the card makes the card shorter.

#### PDF Layout Spec

The PDF must be printable anywhere, without a printer's color capabilities being required. Black on white only.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Your Study Card                SlateCamp                      │
│  Week of March 24, 2026        ─────────────────              │
│  Juan dela Cruz                                                 │
│                                                                 │
│  ──────────────────────┬────────────────────────────────────   │
│  01 STAIR RISER HEIGHT │  11 FIRE CODE TRAVEL DISTANCE        │
│  180mm min, 200mm max  │  Unsprinklered: 30m                  │
│  PD 1096 § VII-1202    │  Sprinklered: 45m                   │
│  ──────────────────────┤  RA 9514 § 6.3                       │
│  02 ...                │  ─────────────────────────────────    │
│  ...                   │  12 ...                               │
│                         │                                      │
│  ... (10 entries/col)  │  ... (10 entries/col)               │
│  ──────────────────────┴────────────────────────────────────   │
│                                                                 │
│  Generated from your wrong-answer patterns in SlateCamp.       │
│  This card updates weekly. Regenerate at slatecamp.ph/cram     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**PDF specifications:**
- Paper: A4 portrait
- Font: System monospace for numbers, system sans for labels — no Google Fonts dependency in PDF
- Margins: 20mm all sides
- Two columns, 10 entries each
- No background colors, no borders requiring color printing
- Page footer: "Generated [date] · SlateCamp · slatecamp.ph" — passive acquisition in the footer
- The URL in the footer is the word-of-mouth trigger: a batchmate who sees a printed card knows exactly where to get theirs

### Complete User Paths

#### Path A — Happy Path: First Time Generation (Post 20 Sessions)

```
Step 1: Student navigates to /dashboard/cram-card
Step 2: Server checks user_global_stats.total_sessions_ever
Step 3: Value is 23 (≥ 20) — gate passes
Step 4: Check cram_card_data: null (never generated)
Step 5: Trigger generation: run the SQL query against user_interactions
        filtered by application_context IN ('recall', 'calculation')
        AND exam_frequency IN ('high', 'medium')
        AND attempts ≥ 3
        ORDER BY (1 - accuracy) × frequency_weight DESC
        LIMIT 20
Step 6: For each result, extract from wiki_items JSONB:
        - type:'formula' or type:'code_provision' → the_value
        - type:'exam_tip' → memory_hook
        - source_ref from type:'code_provision' → code_reference
Step 7: Write result to user_global_stats.cram_card_data (JSONB)
Step 8: Write timestamp to cram_card_last_generated
Step 9: Page renders with the 20 entries
Step 10: "Download PDF" button available
```

#### Path B — Happy Path: Returning After 7+ Days (Regeneration)

```
Step 1: Student navigates to /dashboard/cram-card
Step 2: cram_card_data is not null, cram_card_last_generated was 10 days ago
Step 3: Condition met: last_generated < now() - 7 days
Step 4: Page IMMEDIATELY renders the CACHED version (no loading delay)
Step 5: In the background, recomputation runs asynchronously
Step 6: When recomputation completes, update cram_card_data and last_generated
Step 7: A "Card updated" toast appears: "Your Cram Card was updated
        with this week's results. 3 topics improved — 2 new ones added."
Step 8: Page revalidates / re-renders with new data
```

#### Path C — Happy Path: Student Downloads PDF

```
Step 1: Student clicks [Download PDF]
Step 2: Server action reads current cram_card_data from user_global_stats
Step 3: @react-pdf/renderer generates the A4 document with current data
Step 4: PDF file downloads to student's device as:
        "slatecamp-cram-card-2026-03-24.pdf"
Step 5: Student prints it
Step 6: Student reviews it the morning of the exam
Step 7: [optional] Student shares it to Campfire or WhatsApp groups
        → word-of-mouth acquisition
```

#### Path D — Edge Case: Student Has < 3 Attempts on Most Topics

```
Condition: Student has completed 20 sessions but only has 1–2 attempts
           on most individual nodes (sessions were very diverse)
Step 1: HAVING COUNT(interaction_id) >= 3 filters out most nodes
Step 2: Query returns fewer than 20 rows — perhaps only 8
Step 3: Page renders with 8 entries and a note:
        "Your Cram Card will grow as you practice more.
         Currently showing 8 values with 3+ attempts.
         The full card unlocks at 20 attempts per topic."
Step 4: NOT an error state — partial cards are legitimate
Step 5: "Download PDF" still available for the partial card
```

#### Path E — Edge Case: No `wiki_items` Data on a Node

```
Condition: A node appears in the query results but wiki_items JSONB
           lacks type:'formula' or type:'code_provision'
Step 1: For this entry, the_value falls back to the node's
        most commonly missed question text
Step 2: code_reference falls back to node's ale_id
Step 3: memory_hook is omitted for this entry (blank, not "null")
Step 4: Entry still appears — with available data
Step 5: Partial entry is better than a missing entry
```

#### Path F — Edge Case: Student Hasn't Done Numerical Question Types

```
Condition: Student has 20+ sessions but all in ALE-HIST (recall only,
           no calculation questions) — application_context filter
           for 'recall' and 'calculation' would return recall only
Step 1: Query runs, returns recall-type results (facts, code provisions)
Step 2: Card shows code provisions and rule numbers, not calculations
Step 3: This is correct behavior — the card reflects what they actually
        missed, even if it's not numerical calculations
Step 4: The Cram Card is not exclusively "numerical" — it's
        "the specific values you need to know cold" which includes
        code provisions, rule numbers, and professional practice numbers
```

#### Path G — Failure: Generation Query Fails

```
Step 1: Generation query throws (connection timeout, RLS issue)
Step 2: Page shows existing cached card if available
Step 3: If no cached card: shows the gate-like empty state:
        "Your Cram Card is being prepared. Check back in a few minutes."
Step 4: No stack trace. No "Error generating card."
Step 5: Retry available via page refresh
Step 6: Error logged server-side for debugging
```

---

## Cross-Feature UX Patterns

### The Dashboard Information Hierarchy Post-Implementation

With all four features shipped, the dashboard presents information in a strict priority order that reflects actual exam risk:

```
1. SubjectFloorAlert (if any subject < 50%) ← HIGHEST PRIORITY
   "Exam risk: you will fail even with a high overall score"

2. ReadinessScoreCard with PRC weighting ← CURRENT STATE
   "Here is your accurate overall readiness"

3. Sub-score breakdown by Area A/B/C ← CONTEXT
   "Here is how each area contributes"

4. Today's Camp Trail card ← NEXT ACTION
   "Here is what to do today"

5. Cram Card teaser (if unlocked) ← SUPPORTING RESOURCE
   "Here are the values to memorize"
```

This order follows the **clinical briefing model**: critical abnormals first, then current state, then trend, then recommended action, then supporting resources.

### Design System Compliance Across All Four Features

| Element | Token | Application |
|---|---|---|
| Subject Floor Alert background | `#E63329` Signal Red | ONLY use of Signal Red for non-form context |
| Readiness score number (high) | `#1B7A3C` Signal Green | ≥ 70% |
| Readiness score number (mid) | `#E8853A` Camp Orange | 50–69% |
| Readiness score number (low) | `#E63329` Signal Red | < 50% |
| Sub-score bars above floor | `#1B7A3C` Signal Green | ≥ 50% sub-score |
| Sub-score bars at floor | `#E8853A` Camp Orange | 40–49% sub-score |
| Sub-score bars below floor | `#E8853A` Camp Orange + `▲` | < 40% |
| Cram Card value text | `#1B3FC4` Cobalt Blue | The memorization target |
| Cram Card citation | `text-muted-foreground` | Secondary reference |
| Progress bar (gate) | `#1B3FC4` Cobalt Blue | 12/20 progress |
| All stat numbers | `font-mono tabular-nums` DM Mono | Every number in every feature |
| All eyebrow labels | `font-mono text-[9px] uppercase tracking-widest` | Every section header |

### Non-Negotiable Rules Across All Four Features

1. **No red for low scores except Subject Floor Alert.** A sub-score below 50% in the score breakdown uses Camp Orange + the `▲` symbol. Only the actual floor alert card uses Signal Red.

2. **No dismissible Subject Floor Alert.** The only way the alert disappears is the score rising. No X button.

3. **No Cram Card blurred preview.** Before the gate is met, show the honest gate message. Not a locked preview. Blurred previews of non-existent content create false expectation.

4. **No "Error" copy anywhere.** Loading states become "Calculating..." Empty states become "Complete X sessions to see Y." Failures become "Check back in a few minutes."

5. **The score migration banner appears once.** Stored in `user_global_stats.score_weighting_explained_at`. Once dismissed, never shown again.

6. **All filters are applied consistently.** Every student-facing taxonomy query requires both `is_cross_ref_only = false` AND `deprecated_at IS NULL`. No exceptions.

---

*SlateCamp · Four Core Features UX Research & Design*
*March 2026 · Research basis: Filipino Architect Encyclopedia · ALE Candidate Journey Research · SlateCamp Design System v6.0 · Behavioral finance research (Kahneman, 2011) · Retrieval practice research (Roediger & Karpicke, 2006) · Choice architecture (Thaler & Sunstein, 2008)*

