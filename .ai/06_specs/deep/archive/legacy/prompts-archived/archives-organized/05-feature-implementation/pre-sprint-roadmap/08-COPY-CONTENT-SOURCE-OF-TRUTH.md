# SlateCamp — Copy & Content Source-of-Truth
## All UI Copy, Forbidden Words, and Content Constraints
### 2026-03-26

---

## Purpose

Multiple documents contain highly specific UI copy — the Subject Floor Alert template, the retaker onboarding screens, the Campfire channel naming constraints, the forbidden words list, and the Cram Card format spec. During implementation, a developer needs to find the exact copy for a specific screen without searching across documents. This is that single reference.

**Rule:** When this document conflicts with a skill file or strategy document, this document wins for copy decisions. Strategy documents define *what* to build; this document defines *what the words say*.

---

## Universal Constraints

### Forbidden Words — Global (Apply Everywhere)

These words must NEVER appear anywhere in SlateCamp's student-facing UI:

| Category | Forbidden | Why |
|---|---|---|
| Failure language | fail, failed, failure | Hiya culture — ALE failure is deeply personal |
| Retry language | retry, retake, retaker | Same — never label a student by their failure |
| Dismissive encouragement | try again, don't give up, better luck this time | Patronizing in the PH exam context |
| Blame language | what went wrong | Assigns fault to the student |

**Enforcement:** Before shipping any feature with user-facing copy, run:
```bash
grep -rni "fail\|retry\|retake\|retaker\|try again\|went wrong\|better luck\|don't give up" \
  src/components/ src/app/ --include="*.tsx" --include="*.ts"
```
**Zero results required.**

### Forbidden Words — Retaker-Specific Contexts

In addition to the global list, these are forbidden in any context where `reviewer_type = 'returning_reviewer'`:

- "first attempt" (implies counting failures)
- "this time" (implies comparison to a previous failure)
- "again" (in the context of exam preparation)
- "second chance" (implies the first was wasted)
- "make up for" (implies a debt)

### Brand Voice Quick Reference

| Trait | Do | Don't |
|---|---|---|
| Tone | Coach-like, direct, factual | Cheerleader, patronizing, motivational-poster |
| Scores | "Your Readiness Score is 51%" | "Great progress!" (when 51% is not great) |
| Urgency | "Structural Design is at 41% — this subject determines your result" | "WARNING: You might fail!" |
| Celebration | "You passed." (matter-of-fact) | "OMG CONGRATULATIONS!!!! 🎉🎉🎉" |
| Failure context | "You've reviewed before. More data, better strategy." | "Don't worry about last time!" |

---

## Feature 1: Campfire Community

### 1a — Passer Story Template

**Auto-populated fields (not editable by user):**
- Starting Readiness Score (from `readiness_score_snapshots`)
- Final Readiness Score (from `readiness_score_snapshots`)

**User-completed fields:**
- Trail used and total duration
- "Three things that helped most" — multi-select from predefined list plus free text option
- "One thing you would do differently" — open text, optional

**Predefined "what helped most" options:**
```
- Camp Trail daily structure
- Blindspot Protocol
- Storm Mode timed sessions
- Wiki deep dives
- Practice Simulations
- Building Laws focus
- Structural Design focus
- Professional Practice focus
- History of Architecture focus
- Study pod accountability
- Personal cram card
- 3D Lab visualizations
- [Other — free text]
```

---

### 1b — Private Retaker Support Channel

**Channel name options (use one):**
- "Returning Reviewers" ✅
- "Second Attempt" ✅
- ~~"Retakers"~~ ❌ FORBIDDEN
- ~~"Failed Attempts"~~ ❌ FORBIDDEN

**UI rules:**
- No public-facing indicator that a user is in this channel
- No comparison of individual scores within the channel
- Membership assigned automatically at account creation for returning reviewers
- Anonymous usernames only — no real names required
- The words "failed," "failure," and "retaker" never appear in any UI element

---

### 1c — School Cohort Heatmaps

**Display format:**
```
[School Name] · [Exam Cycle] Cohort
Strongest: [Subject Name] (avg [X]%)
Weakest: [Subject Name] (avg [X]%)
[N] enrolled students
```

**Privacy gate:** Cohorts with fewer than 5 students do not appear. No individual performance visible.

---

### 1d — Study Pod

**What pod members see about each other:**
- Score delta: "+4 points this week" or "−2 points this week"
- Trend direction: up, down, or flat

**What pod members NEVER see:**
- Absolute Readiness Score
- Which subject is lowest
- Individual question performance

**Pod milestone copy:**
```
🎯 Pod Milestone: When all members reach ≥70% Readiness Score,
your pod unlocks Proof Simulation one week early.
```

---

### 1f — Topnotcher Effect Cascade

**Social image template:**
```
Background: Dark (#0F1F5C)
Text: White
Font: Syne Bold

"Arch. [Full Name]"
"January 2026 ALE Topnotcher"
"PRC Board Rank #[N]"

Logo: SlateCamp logo bottom-right
```

---

## Feature 2: Retaker Onboarding

### Branching Question
```
"Is this your first time preparing for the ALE?"
  ○ "Yes, first time"         → existing onboarding
  ○ "I've reviewed before"    → retaker branch
```

### Retaker Branch — Screen by Screen

**Screen 1: Welcome**
```
Headline: "Welcome back. More data, better strategy."
```
No mention of the previous attempt. No condolences. No motivational platitude.

**Screen 2: Previous Gaps (Optional)**
```
"Which subjects felt hardest last time?"

[Multi-select from 8 ALE subjects]

[Skip] button visible — no penalty for skipping
```

Selecting subjects → seeds `user_node_mastery` with Red state for all leaf nodes in those subjects.

**Screen 3: Target Exam Date**
```
Identical to existing onboarding step. No changes.
```

**Screen 4: Proof Simulation Prompt**
```
"You've sat the ALE before. Let's see exactly where you stand today
— under exam conditions. A full simulation, your score delivered 24 hours later."

[Start Proof Simulation]    [Skip for now]
```

First-time users: gate locked until ≥70% Amber.
Returning reviewers: gate bypassed. Offered Day 1.

---

## Feature 3: Area C Preparation Tooling

### 3a — Development Controls Calculator

**No copy-heavy UI — this is a calculator.** Key labels:

| Output | Label | Code Citation |
|---|---|---|
| AMBF | Allowable Maximum Building Footprint | PD 1096 |
| PSO | Percentage Site Occupancy | PD 1096 |
| TGFA | Total Gross Floor Area | PD 1096 |
| Occupant Load | Occupant Load | PD 1096 |
| Required Parking | Required Parking Slots | PD 1096 |
| Accessible Parking | Required Accessible Parking | BP 344: 1 per 50, min 1 |
| Travel Distance | Maximum Travel Distance | RA 9514 |
| Exit Width | Required Exit Width | RA 9514: 6.1mm/person min |
| Setbacks | Required Setbacks | PD 1096 by zone |

**Non-compliant value treatment:**
- Background: Signal Red (#E63329)
- Tooltip: "Exceeds [specific code provision]"

### 3b — Design Problem Library

**Timer behavior:** Counts UP (not down). Counting down creates anxiety; counting up shows progress.

**BP 344 Compliance Checklist (surfaces at 90-minute mark):**
```
☐ Accessible path from parking to main entrance — continuous and unobstructed
☐ Ramp at all level changes — slope ≤ 1:12, max 9m per run, landing top and bottom
☐ Accessible toilet — minimum 1.7m × 1.8m clear floor area
☐ Grab bars — positioned per BP 344 2024 Revised IRR
☐ Accessible parking — positioned closest to accessible entrance
☐ Accessible parking count — 1 per 50 standard slots, minimum 1
☐ Elevator — provided if multi-floor and occupancy triggers requirement
☐ Accessible signage — Braille and raised characters at 1.52–1.65m AFF
☐ No pinch points — minimum 1.2m clear width on all accessible paths
```

### 3c — Area C Endurance Connection

**Rename:** "Extended Practice" → "Area C Endurance Training"

**Dashboard copy:**
```
"Day 2 of the ALE requires sustained focus for 3+ hours.
Your current Area C Window: [X] minutes.
Today's session extends it to [X + 10%] minutes."
```

**Progress display:**
```
"You're at [X]% of your Area C endurance target."
```

**Tooltip on (?) icon:**
```
"The ALE's Architectural Design component lasts 3+ hours.
Most first-time failures on Area C happen because students run out of time,
not knowledge. This mechanic builds the cognitive stamina that Day 2 demands."
```

---

## Feature 4: Personal Cram Card

### Card Header
```
Your Personal Cram Card · Week of [date]
```

### Card Footer
```
SlateCamp — Know you'll win.
```

### Card Entry Format (per item)
```
[Value]                    [Provision]
180mm min, 200mm max       PD 1096, Rule VII, §1202 — Stair Riser Heights

[Hook text from wiki exam_tip]
"The ALE often tests this as 'which of these stairways is non-compliant'
— any riser outside 180–200mm fails."
```

### Pre-Threshold Message
```
Complete 20 study sessions to unlock your personalized Cram Card
```

### Print Spec
- A4 portrait
- Two columns, 10 entries per column
- No color — black-and-white printable
- Generation date visible (not a generic template)

---

## Feature 5: Subject Floor Alert

### Alert Banner Copy (per flagged subject)
```
⚠️ [Subject Name] is at [X%]

The ALE requires at least 50% in every subject to pass
— regardless of your overall score. This subject will determine your result.

Study [Subject Name] Now →
```

### Alert Visual Spec
- Background: Signal Red (#E63329)
- Text: White
- Icon: ⚠️
- **No dismiss button**
- **No X icon**
- Position: ABOVE the Readiness Score card. First visible element on Dashboard.
- Multiple subjects below floor: each gets its own alert row, stacked vertically

### Readiness Score Card — Subject Breakdown Table

| Subject | Score | State |
|---|---|---|
| History of Architecture | 72% | Green |
| Theory of Architecture | 65% | Amber (no color signal) |
| Structural Design | **49%** | **Signal Red** |

State color logic:
- ≥70% → Signal Green (#1B7A3C)
- 40–69% → Neutral (no color, just number)
- <50% (below floor) → Signal Red (#E63329)

---

## Marketing Pages

### About Page
- Philip's story (licensed architect, ALE journey, why SlateCamp exists)
- The camp metaphor explained
- The pedagogical approach (IRT, mastery-based, anti-inflation scoring)
- Team section (solo founder for now)
- Mission statement

### Contact Page
- Contact form: name, email, subject, message
- Support email displayed
- FAQ accordion (top 5 questions — to be written)

---

## General Dashboard Copy Patterns

### Empty States
```
Pattern: [What this would show] + [What to do to make it appear]

Example (Heatmap): "No study activity yet. Complete your first session to see your activity here."
Example (Notes): "No notes yet. Save notes from wiki articles or create your own."
Example (Analytics): "Not enough data yet. Complete a few sessions to see your trends."
```

### Error States
```
Pattern: [What went wrong, simply] + [What to try]

Example: "Couldn't load your data. Try refreshing the page."
Never: "Error 500: Internal Server Error" (never expose technical errors)
```

### Loading States
```
Use skeleton components. No spinner text. No "Loading..." text.
The skeleton shape should match the content shape.
```

---

## Copy Review Protocol

Before shipping any new user-facing copy:

1. **Forbidden words check** — grep for all forbidden terms (see enforcement command above)
2. **Brand voice check** — is it coach-like, not cheerleader? Factual, not motivational-poster?
3. **Cultural sensitivity check** — does any copy reference failure, comparison to peers, or shame?
4. **Specificity check** — does the copy include specific numbers/provisions, or is it vague?
5. **Action check** — does every alert/notification include a concrete action the student can take?

---

*Document version: 2026-03-26*
*Update when new features add user-facing copy.*

