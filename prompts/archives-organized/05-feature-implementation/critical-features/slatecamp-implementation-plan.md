# SlateCamp — Claude Code Implementation Plan
**Source:** Feature Research Report (March 2026) cross-document analysis  
**Stack:** Next.js 15 App Router · Supabase · Tailwind CSS · shadcn/ui · Zustand · React Three Fiber  
**Instruction style:** Each task is self-contained. Read the task fully before writing code. Never skip acceptance criteria.

---

## HOW TO USE THIS DOCUMENT

Work top to bottom. Each sprint must be complete before starting the next. Tasks within a sprint can be parallelized. Every task has:
- **Files to create or modify** (exact paths)
- **Schema changes** (run in Supabase SQL editor)
- **Implementation spec** (what to build)
- **Acceptance criteria** (how to verify it works)
- **Dependencies** (what must exist first)

---

## SPRINT 0 — PRE-LAUNCH BLOCKERS
### Must ship before any public user touches the product. No exceptions.

> **6 tasks.** Readiness Score weighting → Heatmap fix → Subject Floor Alert → Retaker Onboarding → Cram Card → Results Day.

---

### TASK 0.1 — Readiness Score: PRC Area Weighting
**Priority:** BLOCKING — every score is mathematically wrong until this ships  
**Estimated complexity:** Medium  

**Context:** Area C (ALE-DSGN) = 40% of the exam. Currently the Readiness Score treats a Design node the same as a History node. This is wrong. The PRC area weights are stored in `taxonomy_tree.prc_area` and `taxonomy_tree.area_weight_pct`.

**Files to modify:**
```
lib/readiness-score.ts           (core calculation function)
app/dashboard/_components/ReadinessScoreCard.tsx
```

**Schema — no changes needed.** `prc_area` and `area_weight_pct` already exist on `taxonomy_tree` after migration 027.

**Implementation spec:**
```typescript
// lib/readiness-score.ts
// Current: flat EMA across all nodes
// New: weighted EMA using PRC area weights

const PRC_AREA_WEIGHTS = {
  'A': 0.30,  // History + Theory + Planning + Practice
  'B': 0.30,  // Structural + Materials + Utilities  
  'C': 0.40,  // Architectural Design — 40% of exam
}

// Subject weight within its area (from taxonomy_tree.subject_weight_within_area_pct)
// Final weight for a node = prc_area_weight × subject_weight_within_area × node_mastery_weight

// New calculation:
// 1. Get all active leaf nodes for user (WHERE is_cross_ref_only = false AND deprecated_at IS NULL)
// 2. For each node, get its subject's prc_area and subject_weight_within_area_pct
// 3. Apply: node_contribution = mastery_ema × (area_weight × subject_weight_within_area / 100)
// 4. Sum all node_contributions and normalize to 0–100

// Also compute per-subject sub-scores for the floor alert system (Task 0.5)
export function computeReadinessScore(userNodeMastery: NodeMastery[]): ReadinessResult {
  return {
    overallScore: number,        // 0-100, PRC-weighted
    subScores: SubjectScore[],   // per subject, for floor alert
    dayOneScore: number,         // Areas A subjects only
    dayTwoScore: number,         // Areas B+C subjects only  
    belowFloorSubjects: string[] // subjects below 50% threshold
  }
}
```

**Acceptance criteria:**
- [ ] A user with 100% mastery on only ALE-DSGN nodes gets a Readiness Score of ~40 (not 100)
- [ ] A user with 70% mastery on all Area A nodes and 0% on Area C gets a score of ~21 (not 35)
- [ ] `ReadinessScoreCard` shows the score updating correctly after a quiz session
- [ ] No TypeScript errors. No console errors.

---

### TASK 0.2 — Heatmap: Exclude ALE-LAWS and Deprecated Nodes
**Priority:** BLOCKING — must deploy before Taxonomy v5.0 import Step 2  
**Estimated complexity:** Small  

**Context:** When ALE-LAWS nodes are seeded, they will appear in the student heatmap without this fix. `is_cross_ref_only = true` nodes must be excluded. Deprecated nodes (`deprecated_at IS NOT NULL`) must also be excluded.

**Files to modify:**
```
lib/taxonomy.ts                  (or wherever heatmap data is fetched)
app/dashboard/_components/TaxonomyHeatmap.tsx
```

**Schema — no changes needed.** Columns already exist.

**Implementation spec:**
```typescript
// In your heatmap data fetch query, add these WHERE conditions:
// BEFORE (wrong):
// SELECT * FROM taxonomy_tree WHERE discipline_id = $1 AND is_leaf = true

// AFTER (correct):
const heatmapQuery = supabase
  .from('taxonomy_tree')
  .select(`
    node_id, name, ale_id, bloom_level, difficulty,
    exam_frequency, node_type, three_d_lab_linked,
    mastery_criteria, prc_area, subject_weight_within_area_pct
  `)
  .eq('discipline_id', disciplineId)
  .eq('is_leaf', true)
  .eq('is_cross_ref_only', false)  // ← ADD THIS
  .is('deprecated_at', null)       // ← ADD THIS
```

**Acceptance criteria:**
- [ ] ALE-LAWS leaf nodes do NOT appear in the student heatmap after v5.0 import
- [ ] Nodes with `deprecated_at` set do NOT appear in the heatmap
- [ ] All other nodes render correctly
- [ ] Heatmap renders without errors on mobile and desktop

---

### TASK 0.3 — Subject Floor Alert System
**Priority:** CRITICAL — prevents the most common surprise ALE failure  
**Estimated complexity:** Medium  

**Context:** The ALE requires minimum 50% per subject. A student at 74% overall with 47% in Structural Design fails. The platform must alert this. Data comes from TASK 0.1's `subScores` output and `disciplines.subject_floor_pct` (= 50).

**Files to create:**
```
app/dashboard/_components/SubjectFloorAlert.tsx   (new component)
```

**Files to modify:**
```
app/dashboard/page.tsx           (add SubjectFloorAlert above the heatmap)
```

**Implementation spec:**
```typescript
// SubjectFloorAlert.tsx
// Props: subScores (from ReadinessResult), floorPct (from disciplines.subject_floor_pct = 50)

// Logic:
// 1. Find all subjects where subScore.accuracy < floorPct
// 2. If any found, render a non-dismissible alert banner
// 3. Alert CANNOT be closed without clicking "Study [Subject] Now" CTA
// 4. CTA routes to /trails?subject=[ale_id] (filtered trail recommendations)

// UI spec:
// - Signal Red background (#E63329)
// - White text
// - Icon: ⚠️ 
// - Headline: "Warning: [Subject Name] is at [X]%"
// - Body: "The ALE requires at least 50% in every subject to pass — regardless of your overall score. This subject will determine your result."
// - CTA button: "Study [Subject Name] Now →"
// - If multiple subjects below floor: show each as a separate alert row
// - Position: ABOVE the Readiness Score card, ABOVE the heatmap

// DO NOT make this dismissible. The only way out is clicking the CTA.
```

**Acceptance criteria:**
- [ ] Alert appears when any subject sub-score < 50%
- [ ] Alert does not appear when all subjects ≥ 50%
- [ ] Alert is not dismissible — the X button does not exist
- [ ] CTA navigates to correct filtered trail page
- [ ] Multiple subjects below floor show multiple alert rows
- [ ] Alert is visible on mobile without scrolling

---

### TASK 0.4 — Retaker Onboarding Flow
**Priority:** CRITICAL — highest-willingness-to-pay segment, zero current support  
**Estimated complexity:** Medium-High  

**Context:** Filipino architecture exam culture has deep shame (hiya) around failure. Retakers will not self-identify publicly. The word "retake" and "failure" must NEVER appear in user-facing copy. Use "returning reviewer" instead.

**Files to create:**
```
app/onboarding/retaker/page.tsx                    (new route)
app/onboarding/retaker/_components/RetakerFlow.tsx (step component)
```

**Files to modify:**
```
app/onboarding/page.tsx          (add branching question: first-taker or returning reviewer)
lib/onboarding.ts                (add retaker profile type)
```

**Schema changes:**
```sql
-- Add to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS previous_exam_subjects_struggled JSONB DEFAULT '[]'::jsonb;
  -- Array of ale_ids for subjects user identifies as their weakest
```

**Implementation spec:**
```typescript
// Step 1 of onboarding: "Is this your first time reviewing for the ALE?"
// Option A: "Yes, first time" → existing first-taker flow
// Option B: "I've reviewed before" → retaker flow (NEVER say "I failed before")

// Retaker flow steps:
// Step 1: "Welcome back. More data, better strategy."
//   - Copy: "Every review cycle teaches you something. Let's build on what you know."
//   - No shame. No "what went wrong?" questions.

// Step 2: "Which subjects felt hardest?" (multi-select from 8 ALE subjects)
//   - Use these as the heatmap seed: mark selected subjects as Red nodes
//   - This replaces the full diagnostic for returning reviewers who have a sense of their gaps

// Step 3: "When is your target exam?" (date picker)
//   - Use to set exam_date in profiles

// Step 4: Route to Proof Simulation FIRST (not Day 30 — Day 1 for retakers)
//   - Copy: "You know the ALE. Let's see exactly where you stand today."
//   - This is the retaker's real diagnostic — a full mock exam, not a 35-item assessment

// What NOT to build:
// - No "what happened last time?" field
// - No reference to previous scores unless user explicitly imports them
// - No "try again" language
```

**Acceptance criteria:**
- [ ] The word "retake," "failed," "failure," or "retry" does not appear anywhere in the retaker flow
- [ ] Returning reviewer is routed to Proof Simulation on Day 1, not the basic assessment
- [ ] Subject selection correctly seeds the heatmap with Red nodes for selected subjects
- [ ] `profiles.reviewer_type` is set to `'returning_reviewer'` on completion
- [ ] Flow completes in ≤ 4 steps

---

### TASK 0.5 — Personal Cram Card Generator
**Priority:** CRITICAL — documented real reviewer behavior, high word-of-mouth  
**Estimated complexity:** Medium  

**Context:** Every serious ALE reviewer manually compiles the 15–25 numerical values they keep getting wrong. SlateCamp has the wrong-answer data in `user_interactions`. This feature builds it automatically after 20+ sessions.

**Files to create:**
```
app/dashboard/cram-card/page.tsx                   (cram card page)
app/api/cram-card/generate/route.ts                (generation endpoint)
lib/cram-card.ts                                   (generation logic)
```

**Implementation spec:**
```typescript
// lib/cram-card.ts

// Query: for a user with ≥20 quiz sessions,
// find the subtopics where:
//   a) they have answered ≥3 questions
//   b) their accuracy is lowest
//   c) exam_frequency = 'high' (prioritize high-frequency misses)
//   d) node_type IN ('code_provision', 'formula') — numerical values only

// SQL for cram card candidates:
/*
SELECT 
  tt.ale_id,
  tt.name as subtopic_name,
  tt.exam_frequency,
  tt.wiki_items,
  COUNT(ui.interaction_id) as total_attempts,
  SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100) as accuracy_pct
FROM user_interactions ui
JOIN questions q ON q.question_id = ui.question_id
JOIN taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE ui.user_id = $userId
  AND tt.node_type IN ('code_provision', 'formula')
  AND tt.exam_frequency = 'high'
  AND tt.is_cross_ref_only = false
GROUP BY tt.node_id, tt.ale_id, tt.name, tt.exam_frequency, tt.wiki_items
HAVING COUNT(ui.interaction_id) >= 3
ORDER BY accuracy_pct ASC
LIMIT 20
*/

// For each cram card entry, extract from wiki_items:
// - items where type = 'formula' or type = 'code_provision' (the actual numbers)
// - items where type = 'exam_tip' (the memory hook)

// Output format: 20 entries, each with:
// { ale_id, subtopic_name, the_value, code_reference, remember_because }

// PDF generation: use @react-pdf/renderer
// One A4 page, 2 columns, 10 entries per column
// Printable — no dark backgrounds, no colored boxes
// Header: "Your Personal Cram Card — [Date]"
// Footer: "SlateCamp · Know you'll win."
```

**Acceptance criteria:**
- [ ] Cram Card only appears after user has ≥20 quiz sessions
- [ ] Card shows only code_provision and formula node types (numerical values)
- [ ] High-frequency nodes appear before medium/low frequency
- [ ] PDF is generated as a valid, printable A4 document
- [ ] Card updates weekly (regenerated if user visits after 7 days since last generation)
- [ ] If user has < 20 sessions, show "Complete 20 study sessions to unlock your personal cram card"

---

### TASK 0.6 — Results Day Activation Flow
**Priority:** CRITICAL — highest single-day engagement moment of the year  
**Estimated complexity:** Medium-High  

**Context:** PRC results day is when every SlateCamp user is on the platform simultaneously. The product must have a distinct flow for passers AND non-passers that fires on or near the result announcement date.

**Files to create:**
```
app/results/page.tsx                               (results day landing page)
app/results/_components/PasserFlow.tsx
app/results/_components/NonPasserFlow.tsx
```

**Files to modify:**
```
app/dashboard/page.tsx           (add results day banner when exam_date was ≤14 days ago)
lib/notifications.ts             (add results day email sequences)
```

**Schema changes:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ale_result TEXT DEFAULT NULL
    CHECK (ale_result IN ('passed', 'failed', 'pending', NULL));

ALTER TABLE public.profiles  
  ADD COLUMN IF NOT EXISTS oath_taking_date DATE DEFAULT NULL;
```

**Implementation spec:**
```typescript
// Dashboard banner: if exam_date was 3–14 days ago AND ale_result IS NULL:
// Show: "PRC results are expected. Have you checked online.prc.gov.ph?"
// Two CTAs: "I Passed! 🎉" | "I'll be back next cycle"

// PASSER FLOW (ale_result = 'passed'):
// 1. Set: profiles.ale_result = 'passed', profiles.subscription_tier = 'alumni'
// 2. Show celebration (NOT confetti — use a clean congratulations card with cobalt background)
// 3. Copy: "Architect [Name]. You did it."
// 4. Unlock Hall of Passers profile in Campfire
// 5. Generate shareable "SlateCamp ALE Passer" image (use Canvas API or Vercel OG)
//    - Image: dark background, "Arch. [Name]" in Syne bold, "January 2026 ALE Passer", SlateCamp logo
//    - Social share buttons: LinkedIn, Facebook, Twitter/X
// 6. Campfire invitation CTA: "Your story is someone's map →"
// 7. Account transition to Professional Mode (see Task 2.6)

// NON-PASSER FLOW (ale_result = 'failed' — NEVER show this label to user):
// Internal: profiles.ale_result = 'failed'
// User-facing: NO shame language. No "you failed."
// Show: "Your heatmap from this cycle is saved."
// Body: "The June 2026 exam window opens registration on [calculated date]. 
//        Your Camp Trail picks up exactly where you left off — with everything 
//        you learned this cycle already accounted for."
// DO NOT ask "what happened?" or "where do you think you went wrong?"
// Show the heatmap snapshot from before their exam date — let the data speak.
// CTA: "Start Planning for June →"
```

**Acceptance criteria:**
- [ ] Dashboard banner appears only when exam_date was 3–14 days ago
- [ ] Passer flow generates a shareable social image
- [ ] Non-passer flow contains zero shame language (run text through a list of forbidden words: fail, failed, failure, wrong, mistake, retry)
- [ ] Both flows update `profiles.ale_result` correctly
- [ ] Social share image downloads correctly on mobile

---

## SPRINT 1 — FEATURE IMPROVEMENTS
### Upgrade existing features using taxonomy v5.0 data now available.

---

### TASK 1.1 — Camp Trail: Bloom's Level Sequencing
**Priority:** High  
**Estimated complexity:** Medium  

**Files to modify:**
```
lib/trail-sequencing.ts          (or trail recommendation logic)
app/trails/_components/TrailStepCard.tsx
```

**Implementation spec:**
```typescript
// When generating or ordering trail steps for a subject,
// sequence subtopics by bloom_level in this order:
// 1. 'remember'    (foundational recall — go here first)
// 2. 'understand'  (concept comprehension)
// 3. 'apply'       (use in scenarios)
// 4. 'analyze'     (multi-step reasoning — go here last)

// Within each bloom level, order by difficulty ASC (easier first)

// For is_computation_heavy = true nodes:
// Add a time buffer indicator to the TrailStepCard
// UI: small "⏱ Computation session" badge
// This tells the student: "Set aside 25 minutes for this — not 15"

// SQL for sequenced trail steps:
/*
SELECT * FROM taxonomy_tree
WHERE parent_id = $topicId
  AND is_leaf = true
  AND deprecated_at IS NULL
ORDER BY 
  CASE bloom_level 
    WHEN 'remember' THEN 1 
    WHEN 'understand' THEN 2 
    WHEN 'apply' THEN 3 
    WHEN 'analyze' THEN 4 
  END,
  difficulty ASC
*/
```

**Acceptance criteria:**
- [ ] Trail steps within a topic are ordered: remember → understand → apply → analyze
- [ ] Within the same bloom level, easier difficulty comes first
- [ ] `is_computation_heavy` nodes show the "Computation session" badge
- [ ] No trail reordering breaks existing enrolled trail users

---

### TASK 1.2 — Blindspot Protocol: Frequency + Type Weighting
**Priority:** High  
**Estimated complexity:** Small  

**Files to modify:**
```
lib/blindspot-protocol.ts        (nightly scan logic)
supabase/functions/blindspot-nightly/index.ts
```

**Implementation spec:**
```typescript
// Current: picks 3 weakest nodes by mastery_weight regardless of node type or frequency
// New: priority score = (1 - mastery_ema) × frequency_weight × type_weight

const FREQUENCY_WEIGHTS = {
  'high': 3.0,
  'medium': 1.5,
  'low': 0.5
}

const TYPE_WEIGHTS = {
  'code_provision': 2.0,  // legal code provisions are highest priority
  'formula': 1.8,         // formulas/calculations second
  'concept': 1.0,         // concepts standard
  'person': 0.7,          // historical persons lower priority
  'building': 0.7,        // buildings lower priority
  'case_study': 0.8
}

// Final priority score:
// priority = (1 - mastery_ema) × FREQUENCY_WEIGHTS[exam_frequency] × TYPE_WEIGHTS[node_type]

// Also: if three_d_lab_linked = true AND node is Red:
// Add a blindspot recommendation type: '3d_lab' instead of 'quiz'
// This routes the student to the 3D Lab module instead of more quiz questions
// The dashboard shows: "Your weakest node on [Topic] has a 3D Lab module.
//                       See it spatially before answering more questions."
```

**Acceptance criteria:**
- [ ] A high-frequency code_provision Red node ranks above a low-frequency concept Red node even if mastery EMA is similar
- [ ] Three_d_lab_linked Red nodes show "Study in 3D Lab first" recommendation
- [ ] Blindspot queue still generates exactly 3 nodes per run
- [ ] Existing blindspot_queues table structure is not broken

---

### TASK 1.3 — Wiki Renderer: Typed wiki_items Display
**Priority:** High  
**Estimated complexity:** Medium  

**Files to modify:**
```
app/wiki/[slug]/page.tsx
app/wiki/_components/WikiContent.tsx   (or equivalent wiki renderer)
app/wiki/_components/WikiItemRenderer.tsx  (new component)
```

**Implementation spec:**
```typescript
// wiki_items is a JSONB array where each item has:
// { text: string, type: string, source_ref?: string }

// Render each type distinctly:
const WIKI_ITEM_RENDERERS = {
  'heading':        // <h2> with Syne font, cobalt color, border-bottom
  'fact':           // standard <p> with bullet indicator
  'definition':     // term in bold + em-dash + definition text
  'formula':        // <code> block, monospace (IBM Plex Mono), cream background
  'code_provision': // card with left border (cobalt), source ref badge if present
  'detail':         // indented <p>, slightly smaller text, ink-60 color
  'exam_tip':       // pull quote style — gold left border, "EXAM TIP" label in DM Mono
  'cross_ref':      // small chip with link icon, routes to related wiki article
  'warning':        // red callout box — "⚠️ WARNING:" in red, critical information
}

// The 'warning' type is the most important.
// Example: "Seismic Zone is Zone 2 (NSCP 2015) — NOT Zone 4. Many reviewers still teach Zone 4. This is WRONG."
// This must be impossible to miss — Signal Red background, white text.

// After rendering wiki_items, check if three_d_lab_linked = true on this node:
// If yes: show "See this in the 3D Lab →" CTA before the article content
```

**Acceptance criteria:**
- [ ] 'warning' type items render with Signal Red background — visually unmissable
- [ ] 'exam_tip' items render with gold left border and "EXAM TIP" DM Mono label
- [ ] 'formula' items render in monospace in a code block
- [ ] 'definition' items render in "**Term** — definition" format
- [ ] 'cross_ref' items render as clickable chips routing to related articles
- [ ] 3D Lab CTA appears at top of article when three_d_lab_linked = true

---

### TASK 1.4 — Re-engagement Email: Show the Specific Position
**Priority:** High  
**Estimated complexity:** Small  

**Files to modify:**
```
lib/email-templates.ts           (re-engagement template)
supabase/functions/reengagement/index.ts
```

**Implementation spec:**
```typescript
// Trigger: user has been inactive for 30+ days (no user_interactions in 30 days)
// Current email: generic "Come back to SlateCamp"
// New email: specific position data

// Data to pull for the email:
// 1. Latest readiness_score from readiness_score_snapshots
// 2. Current camp trail and day number from trail_enrollments
// 3. Count of Red nodes from user_node_mastery WHERE mastery_state = 'red'
// 4. Top 3 Red nodes by exam_frequency (the blindspot queue)

// Email subject: "You left at [score]%. Day [X] of Camp Trail is waiting."
// Email body:
// "When you left [X days ago]:
//  • Readiness Score: [score]%
//  • Camp Trail: Day [day] of [trail_name]
//  • [N] Red nodes in [subject_name]
//
//  The heatmap held your position. Pick up exactly here.
//  [Your 3 most urgent nodes: node_name (high frequency)]"
//
// CTA: "Resume Day [X] →" (deep link to specific trail step)

// DO NOT say:
// - "We miss you!"
// - "Don't forget about us"
// - "You haven't studied in X days" (shame language)
```

**Acceptance criteria:**
- [ ] Email includes the user's actual last Readiness Score
- [ ] Email includes the specific Camp Trail day number
- [ ] Email includes 3 specific Red nodes by name
- [ ] CTA deep-links to the exact trail step (not just /dashboard)
- [ ] Email sends only to users inactive for exactly 30 days (not on day 31, 32, etc. — send once)

---

### TASK 1.5 — Onboarding: Review Center Coexistence Question
**Priority:** High  
**Estimated complexity:** Small  

**Files to modify:**
```
app/onboarding/page.tsx          (or onboarding step component)
lib/onboarding.ts
```

**Schema changes:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS enrolled_review_center TEXT DEFAULT NULL;
  -- Values: 'jpt', 'atlas_cdc', 'other', 'none'
```

**Implementation spec:**
```typescript
// Add as Step 2 of onboarding (after "When is your exam?"):
// Question: "Are you enrolled in a review center?"
// Options: "JPT Review Center" | "ATLAS-CDC" | "Another center" | "Self-directed only"

// If user selects any review center:
// Show a one-screen positioning statement:
// Title: "SlateCamp works alongside [Review Center]."
// Body: "Your heatmap will tell you which sessions to prioritize.
//        If your [JPT/ATLAS-CDC] schedule covers History this week 
//        but your heatmap shows Structural as your biggest gap — 
//        SlateCamp will tell you. You'll never waste a study session."
// CTA: "Got it. Let's see my gaps →"

// On the Dashboard, show a "Review Center Sync" card:
// "Based on your heatmap, this week's priority subject is: [Subject Name]
//  Check if this matches your [JPT/ATLAS-CDC] schedule for maximum efficiency."
// (This is display-only — no actual API integration with review centers)
```

**Acceptance criteria:**
- [ ] Question appears in onboarding flow
- [ ] Selected review center saved to `profiles.enrolled_review_center`
- [ ] Coexistence positioning screen shows when a review center is selected
- [ ] Dashboard "Review Center Sync" card shows correct priority subject based on heatmap gaps
- [ ] Card is hidden if `enrolled_review_center = 'none'` or NULL

---

### TASK 1.6 — Endurance Cycle: Reframe as Area C Preparation
**Priority:** High  
**Estimated complexity:** Small (copy + UI changes, no schema)  

**Files to modify:**
```
app/dashboard/_components/EnduranceCycleCard.tsx
app/trails/_components/EnduranceSessionCard.tsx
lib/endurance.ts                 (or wherever Endurance Cycle is managed)
```

**Implementation spec:**
```
ALL COPY CHANGES — no logic changes needed:

Replace:
  "Endurance Cycle" → "Area C Endurance Training"
  "Build your study stamina" → "Day 2 of the ALE is 3+ hours. This builds your window."
  "Your endurance window: [X] minutes" → "Area C Window: [X] minutes (target: 180+)"

Dashboard card new copy:
  Title: "Area C Endurance Training"
  Body: "Area C is 40% of the ALE — and it's 3+ hours under pressure.
         Your current reliable performance window is [X] minutes.
         Today's session targets [X + 10] minutes."
  Progress: show as "X min / 180 min target"

Session complete screen new copy:
  "Window extended to [X] minutes. ALE Day 2 requires 180+.
   You're [Y]% of the way there."

Context tooltip (add to the (?) icon):
  "The ALE's Area C (Architectural Design) lasts 3+ hours.
   Most first-time failures happen because students run out of time — not knowledge.
   This mechanic builds the cognitive stamina that Area C demands."
```

**Acceptance criteria:**
- [ ] No instance of "Endurance Cycle" remains in user-facing UI (only in code/internal references)
- [ ] All copy references "Area C" explicitly
- [ ] Target shows 180 minutes clearly
- [ ] No functional/logic changes — only copy and framing

---

## SPRINT 2 — NEW HIGH-IMPACT FEATURES

---

### TASK 2.1 — Area C Preparation: Development Controls Calculator
**Priority:** Critical — 40% of ALE is unaddressed  
**Estimated complexity:** High  

**Files to create:**
```
app/area-c/page.tsx                                (Area C hub)
app/area-c/calculator/page.tsx                     (calculator tool)
app/area-c/_components/DevControlsCalculator.tsx
lib/area-c-calculations.ts                         (calculation functions)
```

**Implementation spec:**
```typescript
// DevControlsCalculator.tsx
// Input fields:
interface SiteInputs {
  lotArea: number         // in square meters
  lotCoverage: number     // percentage from local zoning (default 70%)
  floorAreaRatio: number  // FAR from local zoning (default varies)
  buildingHeight: number  // in meters
  occupancyType: string   // from PD 1096 occupancy groups
  buildingType: string    // residential | commercial | institutional | industrial
  numberOfFloors: number
  isAccessible: boolean   // BP 344 applies
  parkingRequired: boolean
}

// Calculated outputs (all from PD 1096 and BP 344):
interface CalculatedOutputs {
  pso: number             // Percentage Site Occupancy = AMBF / Lot Area × 100
  ambf: number            // Allowable Maximum Building Footprint = Lot Area × (Lot Coverage%)
  tgfa: number            // Total Gross Floor Area = AMBF × FAR
  occupantLoad: number    // from PD 1096 Table (by occupancy type and area)
  requiredParking: number // from PD 1096 parking table
  accessibleParking: number // from BP 344 (1 per 50 standard slots, minimum 1)
  travelDistance: number  // max allowed from RA 9514 by occupancy
  exitWidthRequired: number // from RA 9514 occupant load × 6.1mm factor
  setbacks: SetbackResult // front/rear/side from PD 1096 by zone
}

// Real-time calculation: values update as user types
// Non-compliant values turn Signal Red with code citation
// All outputs show the code section that governs them

// Reference tables to hard-code (from PD 1096 + RA 9514):
// - Occupancy load factors by use type
// - Parking requirements by occupancy and floor area
// - Travel distance limits by occupancy
// - Setback requirements by lot area
```

**Acceptance criteria:**
- [ ] Calculator produces correct AMBF for a 500sqm lot at 60% coverage (AMBF = 300sqm)
- [ ] Calculator produces correct occupant load for a 300sqm commercial space (at 9.3sqm/person = ~32 persons)
- [ ] All code citations are accurate and cite specific PD 1096 sections
- [ ] Non-compliant values show Signal Red with specific code citation
- [ ] Calculator is usable on mobile (all inputs accessible without horizontal scroll)

---

### TASK 2.2 — Area C Preparation: Design Problem Library
**Priority:** Critical  
**Estimated complexity:** Medium  

**Files to create:**
```
app/area-c/design-problems/page.tsx
app/area-c/design-problems/[problemId]/page.tsx
app/area-c/_components/DesignProblemCard.tsx
app/area-c/_components/BPComplianceChecklist.tsx
```

**Schema changes:**
```sql
CREATE TABLE IF NOT EXISTS public.design_problems (
  problem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  building_type TEXT NOT NULL,  -- 'residential', 'commercial', 'institutional', 'mixed_use'
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 4),
  time_limit_minutes INTEGER DEFAULT 180,
  brief TEXT NOT NULL,          -- the design problem brief (2–3 paragraphs)
  program JSONB NOT NULL,       -- required spaces and areas
  site_data JSONB NOT NULL,     -- lot area, shape, orientation, constraints
  code_references TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.design_problem_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id),
  problem_id UUID REFERENCES public.design_problems(problem_id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  time_elapsed_seconds INTEGER,
  self_assessment_score INTEGER CHECK (self_assessment_score BETWEEN 1 AND 5),
  checklist_completion JSONB DEFAULT '{}'::jsonb
);
```

**Implementation spec:**
```typescript
// Design Problem page structure:
// 1. Timer (counts up, 3-hour goal) — starts when user clicks "Begin"
// 2. Problem Brief (read-only)
// 3. Site Data with development controls pre-calculated (or user calculates with the calculator)
// 4. BP 344 Compliance Checklist (checkbox list, appears after 90 minutes)
//    Checklist items:
//    □ Accessible path from parking to entrance identified
//    □ Ramp provided at all level changes (slope ≤ 1:12)
//    □ Accessible toilet included (1.7m × 1.8m minimum clear floor area)
//    □ Grab bars positioned correctly
//    □ Accessible parking slots provided (1 per 50 standard)
//    □ Accessible parking closest to accessible entrance
//    □ Elevator provided if multi-floor (if applicable)
//    □ Accessible signage included
// 5. After completion: self-assessment (1–5 scale: "How complete was your solution?")

// Problem set to build (in order of complexity):
// Level 1: Single-family residence on 300sqm lot — 1 hr
// Level 2: 3-storey commercial building — 2 hr
// Level 3: Small school with 6 classrooms — 2.5 hr
// Level 4: 5-storey office building in an urban lot — 3 hr
// Level 5: Mixed-use residential + retail — 3 hr (closest to ALE)
```

**Acceptance criteria:**
- [ ] Timer starts on "Begin" click and cannot be paused
- [ ] BP 344 checklist appears at the 90-minute mark (automated)
- [ ] Self-assessment score saves to `design_problem_sessions`
- [ ] User can see their previous session times per problem
- [ ] Problems are ordered Level 1–5 (not all unlocked at once — gate L3+ behind completing L1 and L2)

---

### TASK 2.3 — Comprehensive Exam Bridge Onboarding
**Priority:** High  
**Estimated complexity:** Small-Medium  

**Files to create:**
```
app/onboarding/comp-exam/page.tsx
app/onboarding/comp-exam/_components/CompExamImport.tsx
```

**Implementation spec:**
```typescript
// A separate onboarding entry point specifically for 5th-year students
// Triggered by landing page CTA: "Got your comp exam results? Start here."

// Step 1: "Your school just told you a number. Let's make it useful."
// Step 2: Subject score entry (7 fields — one per ALE subject)
//   Show subjects with their area labels:
//   Area A: History of Architecture [___]%
//   Area A: Theory of Architecture [___]%
//   Area A: Theory and Principles of Planning [___]%
//   Area A: Architectural Practice and Jurisprudence [___]%
//   Area B: Structural Design [___]%
//   Area B: Building Materials and Construction [___]%
//   Area B: Building Utilities (MEPF) [___]%
//   (Area C / Architectural Design is typically scored differently — mark as optional)

// Step 3: Map scores to heatmap seed:
//   Score < 50%: mark ALL leaf nodes for that subject as 'red'
//   Score 50-69%: mark as 'amber' 
//   Score ≥ 70%: mark as 'green'
//   (This is a rough seed — the diagnostic quiz will refine it)

// Step 4: Show the heatmap immediately after seeding
//   Copy: "This is your heatmap. It shows what your comp exam already found.
//          The diagnostic quiz will make it more precise.
//          Or start studying right now — the heatmap is already your map."

// Store in profiles:
//   comp_exam_scores: JSONB { ALE_HIST: 72, ALE_THEO: 58, ... }
//   comp_exam_date: DATE
```

**Schema changes:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS comp_exam_scores JSONB DEFAULT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS comp_exam_date DATE DEFAULT NULL;
```

**Acceptance criteria:**
- [ ] Comp exam scores save correctly to `profiles.comp_exam_scores`
- [ ] User_node_mastery is seeded correctly: scores < 50% → red nodes for that subject
- [ ] Heatmap shows pre-seeded state immediately after submission
- [ ] User can still take the full 35-item diagnostic to refine the seed
- [ ] This flow is accessible without a Pro subscription (it's an acquisition flow)

---

### TASK 2.4 — 21 Critical ALE Numbers Flash Module
**Priority:** High  
**Estimated complexity:** Medium  

**Files to create:**
```
app/flash/page.tsx                                 (flash module hub)
app/flash/[topic]/page.tsx                         (topic-specific flash)
app/flash/_components/FlashCard.tsx
lib/flash-cards.ts                                 (card data)
```

**Implementation spec:**
```typescript
// Flash module: a dedicated flashcard UI separate from Camp Mode quizzing
// Designed for the "20 minutes before bed" or "morning of exam" use case

// Card structure:
interface FlashCard {
  front: string        // "Minimum riser height for residential stairs (PD 1096)"
  back: string         // "180mm minimum, 200mm maximum"
  code_ref: string     // "PD 1096 Rule VII, Section 1202"
  category: string     // 'stairways' | 'fire_code' | 'bp344' | 'professional_practice'
}

// The 21 critical categories to hardcode:
const FLASH_CATEGORIES = {
  'bp344_clearances': [
    { front: "Accessible toilet minimum clear floor area", back: "1.7m × 1.8m (minimum)", code_ref: "BP 344 IRR 2024, Sec. 4.1" },
    { front: "Accessible parking slot minimum width", back: "3.7m wide", code_ref: "BP 344 IRR 2024" },
    { front: "Ramp maximum slope ratio", back: "1:12 (8.33%)", code_ref: "BP 344 IRR 2024, Sec. 3.1" },
    { front: "Minimum door clear opening width (accessible)", back: "900mm (0.90m)", code_ref: "BP 344 IRR 2024" },
    // ... more BP 344 values
  ],
  'fire_code_distances': [
    { front: "Max travel distance (unsprinklered assembly)", back: "46 meters", code_ref: "RA 9514 IRR" },
    { front: "Max travel distance (sprinklered)", back: "61 meters", code_ref: "RA 9514 IRR" },
    // ... more fire code values
  ],
  'pd1096_stairways': [
    { front: "Minimum riser height (residential)", back: "180mm", code_ref: "PD 1096 Sec. 1202" },
    { front: "Maximum riser height (residential)", back: "200mm", code_ref: "PD 1096 Sec. 1202" },
    { front: "Minimum tread depth", back: "250mm", code_ref: "PD 1096 Sec. 1202" },
    // ... more stairway values
  ],
  'professional_practice': [
    { front: "CPD units required per renewal cycle", back: "45 units per 3-year compliance period", code_ref: "RA 10912 + PRBoA Resolution" },
    { front: "DAE minimum years required", back: "2 years (1 year if with MArch)", code_ref: "RA 9266 Sec. 13" },
    { front: "SPP 202 Phase 3 fee percentage", back: "40% of total fee (Contract Documents)", code_ref: "UAP SPP Doc 202" },
    // ... more practice values  
  ]
}

// UI: swipe left (wrong) / swipe right (correct) on mobile
// Desktop: keyboard shortcuts (← wrong, → correct)
// After completing a category: show accuracy for that session
// Auto-surface in Camp Mode: when user answers a numerical question wrong,
//   show "Practice this in Flash Mode" quick action
```

**Acceptance criteria:**
- [ ] Flash cards render correctly on mobile with swipe gestures
- [ ] Keyboard navigation works on desktop
- [ ] Wrong-answer trigger in Camp Mode surfaces Flash Mode CTA
- [ ] User accuracy per category is tracked and displayed
- [ ] All code references are accurate (have SME verify before shipping)

---

### TASK 2.5 — Bloom Cognitive Level Tracker in Dashboard
**Priority:** Medium  
**Estimated complexity:** Medium  

**Files to create:**
```
app/dashboard/_components/BloomCognitiveTracker.tsx
```

**Files to modify:**
```
app/dashboard/page.tsx           (add BloomCognitiveTracker below Readiness Score)
```

**Schema changes:**
```sql
-- This is a computed view, no new tables needed
-- Query: join user_interactions with taxonomy_tree on bloom_level
-- Filter by subject, group by bloom_level, compute accuracy

CREATE OR REPLACE VIEW public.user_bloom_breakdown AS
SELECT
  ui.user_id,
  tt.subject_area,
  tt.bloom_level,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100) as accuracy_pct
FROM user_interactions ui
JOIN questions q ON q.question_id = ui.question_id
JOIN taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.bloom_level IS NOT NULL
  AND tt.is_cross_ref_only = false
GROUP BY ui.user_id, tt.subject_area, tt.bloom_level;
```

**Implementation spec:**
```typescript
// Component: BloomCognitiveTracker
// Shows a 2x4 grid (8 subjects × 4 bloom levels)
// Or a tabbed view: select subject → see 4 bloom level bars

// Per subject, per bloom level: show accuracy as a colored bar
// Colors: ≥70% = green, 50-70% = amber, <50% = red

// Diagnostic copy below the chart (auto-generated):
// If remember ≥ 70% but apply < 50%:
//   "You know the code but struggle to apply it in scenarios.
//    The ALE's hardest [Subject] questions require evaluating
//    configurations — not just recalling rules.
//    Your next Camp Trail sessions focus on apply-level questions."

// If analyze < 50% across all subjects:
//   "Multi-step reasoning is your biggest gap. This is what
//    distinguishes passers from retakers on the ALE's hardest items.
//    Your Blindspot Protocol now prioritizes 'analyze' level questions."
```

**Acceptance criteria:**
- [ ] Bloom breakdown shows correctly for all 8 ALE subjects
- [ ] Colors match the thresholds (≥70% green, 50-70% amber, <50% red)
- [ ] Diagnostic copy appears and is contextually accurate
- [ ] Component only shows after user has ≥10 quiz sessions (no data before that)
- [ ] Component renders without error on mobile

---

### TASK 2.6 — Post-ALE Account Transition to Professional Mode
**Priority:** High  
**Estimated complexity:** Small-Medium  

**Files to create:**
```
app/professional/page.tsx        (Professional Mode hub)
app/professional/_components/ProfessionalModeCard.tsx
```

**Files to modify:**
```
app/dashboard/page.tsx           (detect exam_date passed → show transition prompt)
lib/user-mode.ts                 (new file: 'review_mode' | 'professional_mode')
```

**Schema changes:**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'review_mode'
    CHECK (account_mode IN ('review_mode', 'professional_mode', 'student_mode', 'dae_mode'));
```

**Implementation spec:**
```typescript
// Trigger: user's exam_date has passed (by ≥3 days) AND ale_result is set
// If ale_result = 'passed': show transition prompt automatically
// If ale_result = 'failed'/'pending': show as optional opt-in after 30 days

// Transition prompt:
// "Your exam has passed. How would you like to use SlateCamp?"
// Option A: "I'm reviewing for the next cycle" → stays in review_mode, updates exam_date
// Option B: "I passed — take me to Professional Mode" → account_mode = 'professional_mode'

// Professional Mode UI differences:
// HIDE: Readiness Score card, Camp Trail card, Endurance Cycle, Proof Simulation
// SHOW: Professional Reference Hub with:
//   - Full Wiki access (now framed as "Professional Reference" not "Study Notes")
//   - Code Update Alerts (NEW — see Task below)
//   - Building Permit Process guides (Phase 2 content)
//   - CPD Tracker (Phase 2)
//   - Campfire community access

// Professional Mode nav label: "Professional Reference" (not "Dashboard")
// Copy: "The building codes you passed with are the building codes you'll practice with."
```

**Acceptance criteria:**
- [ ] Transition prompt fires 3 days after exam_date for passers
- [ ] `profiles.account_mode` updates correctly
- [ ] Professional Mode hides all exam-specific UI (Readiness Score, Camp Trail, etc.)
- [ ] Full Wiki is accessible in Professional Mode
- [ ] User can switch back to Review Mode (in settings) if they want to retake

---

### TASK 2.7 — Oath-Taking Moment Email
**Priority:** High  
**Estimated complexity:** Small  

**Files to modify:**
```
lib/email-templates.ts           (add oath_taking_email template)
supabase/functions/oath-taking-email/index.ts  (new function)
```

**Implementation spec:**
```typescript
// Trigger:
// 1. User's ale_result = 'passed'
// 2. PRC publishes oath-taking schedule (typically 4–6 weeks after results)
// 3. Send email 1 day before the scheduled oath-taking date in the user's region

// How to get oath-taking dates:
// - PRC announces these on their website
// - Store in a simple admin-managed table: oath_taking_schedules { date, region, venue }
// - Match to user's region from their profile

// Email subject: "Tomorrow: your oath."
// Email body:
// "Tomorrow you take the Panunumpa ng Propesyonal.
//
//  You will swear to uphold professional standards, serve the public interest,
//  and practice architecture with integrity. Your family will be there.
//
//  Someone tonight is at 38% wondering if they'll make it.
//  Your story is their map.
//
//  When you get back: share your journey in Campfire.
//  How you started. What worked. What you'd do differently.
//  Your experience is someone else's preparation.
//
//  Congratulations, Architect [Name].
//  Your SlateCamp account is now your professional reference library."
//
// CTA: "Share My Story in Campfire →"

// Second email (day after oath-taking):
// "You are now Architect [Name], RLA.
//  The Campfire is waiting for your story."
```

**Schema changes:**
```sql
CREATE TABLE IF NOT EXISTS public.oath_taking_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oath_date DATE NOT NULL,
  region TEXT NOT NULL,
  venue TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Acceptance criteria:**
- [ ] Email sends 1 day before user's oath-taking date
- [ ] Email does not send if `ale_result != 'passed'`
- [ ] Email contains the user's first name personalized correctly
- [ ] CTA links to Campfire passer story submission flow
- [ ] Follow-up email sends the day after oath-taking

---

## SPRINT 3 — PHASE 2 STRATEGIC FEATURES
### Build after Sprint 2 is validated and the Phase 1 gate is met (100 paying users).

---

### TASK 3.1 — DAE Maintenance Mode
**Dependencies:** profiles.reviewer_type column, DAE-tagged questions in question bank  
**Estimated complexity:** High  

**Files to create:**
```
app/dae-mode/page.tsx
app/dae-mode/_components/WorkContextSelector.tsx
app/dae-mode/_components/DAEQuizSession.tsx
```

**Schema changes:**
```sql
-- Tag questions with practice context
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS practice_context TEXT[]  DEFAULT '{}'::text[];
  -- Values: 'building_permit', 'construction_supervision', 'design_development', 
  --         'pre_design', 'government_practice', 'contract_administration'
```

**Core spec summary:**
```
Weekly prompt: "What are you working on this week?"
→ Select 1–3 contexts from: Building Permit / Construction Supervision / Design Development / Pre-Design / Government Work
→ Surface 10 questions tagged to those contexts' relevant codes
→ Questions are exam-format multiple choice (bridges the practice-to-exam gap)
→ Free tier: 5 questions/day. Pro: full DAE Mode
```

---

### TASK 3.2 — Code Update Alert System
**Dependencies:** taxonomy_sources table, SME team workflow  
**Estimated complexity:** Medium  

**Files to create:**
```
app/code-updates/page.tsx        (code update feed)
lib/code-update-alerts.ts
supabase/functions/code-update-check/index.ts
```

**Core spec summary:**
```sql
-- New table:
CREATE TABLE public.code_updates (
  update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ale_id TEXT REFERENCES taxonomy_tree(ale_id),  -- affected node
  summary TEXT NOT NULL,      -- what changed
  previous_value TEXT,        -- old value
  new_value TEXT,             -- new value
  effective_date DATE,
  is_ale_testable BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now()
);

-- Alert: when a code_update is published for a node in the user's heatmap,
-- push notification + email with:
-- "BP 344 was revised in 2024. Here are the 8 changes that are now ALE-testable."
-- Link to updated wiki article and flag affected questions for review
```

---

### TASK 3.3 — Studio Mode for BSA Students
**Dependencies:** Student pricing tier, student account flow  
**Estimated complexity:** Medium  

**Core spec summary:**
```
Route: /studio (separate entry point, no exam urgency framing)
UI: Hide Readiness Score, Camp Trail, Endurance Cycle
Show: Wiki (framed as "Code Reference"), 3D Lab, Notes
Landing page CTA: "Working on a studio project? Start here."
Pricing: profiles.subscription_tier = 'student' → ₱1,999/semester via GCash
All interactions still feed mastery engine silently (invisible compounding)
```

---

### TASK 3.4 — Study Pod Accountability Loop
**Dependencies:** User authentication, Campfire community infrastructure  
**Estimated complexity:** High  

**Schema changes:**
```sql
CREATE TABLE public.study_pods (
  pod_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_name TEXT,
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pod_members (
  pod_id UUID REFERENCES study_pods(pod_id),
  user_id UUID REFERENCES profiles(user_id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (pod_id, user_id)
);
```

**Core spec summary:**
```
Max 6 members per pod
Pod view: shared score delta (not individual scores — privacy maintained)
Milestone: all members ≥70% → unlock Proof Simulation 1 week early
Pod invite: share unique invite link
Pod creation: available to Pro subscribers only
```

---

## GLOBAL RULES FOR CLAUDE CODE

1. **Never use the words "fail", "failed", "failure", "retry", "retake" in any user-facing string.** These are forbidden in UI copy. Use "gap", "opportunity", "returning reviewer" instead.

2. **Never build confetti, badges, virtual currency, or global leaderboards.** These are permanently prohibited. If you think a feature needs gamification, use mastery state changes (Grey → Red → Amber → Green) as the reward signal.

3. **The Readiness Score must always be honest.** Never round up. Never inflate. Never show a score that hasn't been earned by actual quiz performance.

4. **All code citations must be accurate.** Before hardcoding any code value (stairway dimension, fire code distance, BP 344 clearance), cross-reference against the taxonomy v5.0 wiki_items in the database. Use the database as the source of truth.

5. **Mobile-first, always.** Primary user is on a Realme/Samsung A-series 6" screen on 4G. Test every UI on 375px width before considering it done.

6. **Privacy by default.** No user's individual score or performance data should be visible to other users without explicit opt-in. Pod score views show deltas, not absolute scores. School heatmaps are aggregate-only.

7. **The governing question for every feature:** "Does this make a student more likely to win their board exam?" If the answer isn't clearly yes, don't build it.

---

## SCHEMA MIGRATION SUMMARY

Migrations needed (in order):

```sql
-- Migration 028 (already planned): session_questions junction table
-- Migration 029 (already planned): user_attribution decomposition
-- Migration 030 (new): profiles column additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker',
  ADD COLUMN IF NOT EXISTS enrolled_review_center TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ale_result TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS oath_taking_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'review_mode',
  ADD COLUMN IF NOT EXISTS previous_exam_subjects_struggled JSONB DEFAULT '[]';

-- Migration 031 (new): design problems tables
-- Migration 032 (new): study pods tables
-- Migration 033 (new): oath_taking_schedules
-- Migration 034 (new): code_updates table
-- Migration 035 (new): design_problem_sessions
-- Migration 036 (new): questions.practice_context column
```

---

## ENVIRONMENT VARIABLES NEEDED

No new environment variables required for Sprint 0 or Sprint 1.  
Sprint 2 additions when email is set up:
```
RESEND_API_KEY=           # or existing email provider
CRON_SECRET=              # for securing cron endpoints
```

---

## FILE COUNT SUMMARY

| Sprint | New Files | Modified Files |
|--------|-----------|----------------|
| Sprint 0 | 12 | 8 |
| Sprint 1 | 3 | 10 |
| Sprint 2 | 14 | 6 |
| Sprint 3 | 8 | 4 |
| **Total** | **37** | **28** |

---

*SlateCamp Implementation Plan — March 2026 — For Claude Code*  
*Source: Feature Research Report (cross-document analysis of 4 SlateCamp documents)*  
*Stack: Next.js 15 App Router · Supabase · Tailwind CSS · shadcn/ui · Zustand*
