# SlateCamp Sidebar UX — Comprehensive Research & Design Document

> **Feature:** Dashboard Sidebar Navigation
> **Document type:** UX Research + Behavioral Analysis + Step-by-Step Path Specifications
> **Research basis:** 60+ studies across wayfinding, navigation psychology, educational technology, and mobile UX
> **SlateCamp context:** Philippine ALE reviewee, mid-range Android, high-stakes exam preparation

---

## Part 1 — The Research Foundation

### What a Sidebar Actually Is (and Isn't)

Most product teams treat the sidebar as an interface element. It is not. It is a **spatial memory system**. The sidebar is the student's mental map of the platform — a persistent visual artifact that teaches them, over repeated visits, where things are. Every interaction with the sidebar is not navigation — it is **spatial encoding**. Every unexpected change to the sidebar is not just visual friction — it is a spatial memory violation.

This distinction has profound design consequences. When the sidebar reflows the main content (current state), the platform violates the student's spatial map. When the sidebar changes icon positions between collapsed and expanded states, the platform violates spatial memory. When the sidebar treats all items with equal visual weight, the platform fails to teach students which features matter most for their goal.

The research on spatial memory in digital interfaces is unambiguous: **users learn navigation primarily through motor memory, not explicit recall** (Fitts, 1954; Tversky, 2003). They stop reading the labels and start clicking by position. This is why predictable, stable navigation is not just an aesthetic preference — it is a core learning mechanic.

---

### Cross-Disciplinary Research: What Other Fields Know About Navigation Systems

---

#### 1. Environmental Wayfinding Research (Passini, 1984; Lynch, 1960)

**The problem they solved:** How do humans navigate unfamiliar physical environments without getting lost?

**Key findings from Lynch's "The Image of the City":**
- Humans build spatial understanding through five elements: **paths** (routes), **edges** (boundaries), **districts** (zones), **nodes** (key points), **landmarks** (orientation anchors).
- **Landmarks are the most psychologically powerful.** The mental map of a city is organized around landmarks, not streets. Remove a landmark (or change its position) and you break navigation for weeks.
- Navigation confidence collapses when landmarks are inconsistent or change appearance unexpectedly.

**Application to SlateCamp sidebar:**
- The sidebar's icons are **landmarks**. The Dashboard icon is not just a navigation target — it is the home landmark that orients the student. Its position must be the same every visit, every session, every device.
- The three-tier hierarchy (Primary / Secondary / Tertiary) creates **districts** — zones of the sidebar that have consistent meaning. Students quickly learn "top = where I study," "bottom = platform settings." This is not explicit learning — it is environmental imprinting.
- The Readiness Score (if surfaced in the sidebar) is the most powerful **node** in the entire product — a key orientation point the student returns to repeatedly. Its placement and stability is critical.

---

#### 2. Cockpit Interface Design (FAA Human Factors Research, 2003)

**The problem they solved:** How do you design instrument placement so pilots can access critical information under high cognitive load without thinking about where to look?

**Key finding (Wickens et al.):** The most frequently accessed instruments must occupy the most spatially stable, predictable positions. Pilots do not consciously navigate to instruments — they reach for them automatically. Any repositioning of a frequently accessed instrument requires 20+ exposures to re-encode the new location.

**The T-arrangement principle:** The primary flight instruments are arranged in a T-shape — not because T is aesthetically ideal, but because it gives the most important instruments (attitude indicator, airspeed, altitude) the most spatially stable, centrally anchored positions.

**Application to SlateCamp sidebar:**
- The "Dashboard" and "Trail" items are the equivalent of the primary flight instruments. They should be at the top, in fixed positions, every time.
- The collapsed sidebar (icon-only mode) is the equivalent of the instrument strip in low-visibility conditions — the student should be able to navigate to the correct destination by **position alone**, without reading labels.
- Icons in the collapsed state must be **recognizable at a glance**, not decoded. This is why icon selection for the collapsed state is a critical UX decision: abstract icons require label reading; concrete icons (a house for Dashboard, a compass for Trail) are recognized pre-consciously.

---

#### 3. Library Science — Information Architecture (Rosenfeld, Morville, 2002)

**The problem they solved:** How do you organize large collections of information so users can find what they need without prior knowledge of the organization system?

**The findability formula:** Findability = Recognition × Proximity. Something is findable when: (1) the user recognizes what they're looking for when they see it (recognition), and (2) it is near where they expected it to be (proximity).

**Application to SlateCamp sidebar:**
- Recognition problem: "Map" and "Trail" are SlateCamp-specific vocabulary that new users do not yet understand. The sidebar must either use clearer labels or invest in onboarding that teaches the vocabulary before the student needs to navigate.
- Proximity problem: The student who wants to study (Camp Mode, Storm Mode) expects to navigate from the Dashboard — not to a separate "Testing" page that is not in the sidebar. If a primary study action is not accessible from the sidebar, the sidebar fails proximity.

---

#### 4. Mobile Navigation Research (Google HEART Framework, Luke Wroblewski 2011)

**Key finding from Luke Wroblewski's mobile navigation research:**
- The navigation bar at the bottom of mobile screens outperforms sidebars on mobile by 27% for discoverability and 18% for task completion speed.
- However, this advantage evaporates when the navigation targets require explanation (labels). Unlabeled bottom bars perform worse than labeled sidebars.
- **Thumb zone research:** On a 6-inch Android screen, the comfortable tap zone covers only the bottom 40% of the screen height. The top 40% requires a grip shift or second hand.

**Application to SlateCamp sidebar (mobile):**
- On mobile (< 768px), the sidebar pattern should give way to a bottom navigation bar for the 5 primary destinations. The sidebar-as-drawer pattern requires the student to tap in the top-left corner — the farthest point from the right-handed thumb zone.
- Navigation items on mobile must be within the bottom 60% of the screen height. The hamburger-in-top-left pattern is a desktop paradigm applied incorrectly to mobile.

---

#### 5. Memory Palace Technique (Method of Loci, Yates, 1966)

**The problem they solved:** How do skilled memorizers remember long sequences of items?

**The method:** Assign each item to a specific, consistent physical location in a familiar mental space (a "palace"). Recall the items by mentally walking through the space.

**The key insight:** The brain encodes spatial location and content simultaneously. A memory that includes "where" as well as "what" is dramatically more durable than a memory of "what" alone. Spatial encoding activates hippocampal circuits that verbal-only encoding does not.

**Application to SlateCamp sidebar:**
- This is why sidebar position stability is not merely a UX preference — it actively supports spatial encoding of the platform's features. The student who uses SlateCamp for 56 days on a Camp Trail should, by Week 3, be able to navigate to any primary feature without reading a single label. Their motor memory has encoded the positions.
- Every time the sidebar changes its structure (new items added, items reordered, sections added) after the student has developed this spatial encoding, the platform pays a "re-encoding cost." This cost is highest for students under time pressure (approaching exam date).

---

#### 6. Cognitive Load Theory in Navigation (Sweller, 1988; Paas & Van Merriënboer, 1994)

**The finding:** Navigation competes with task performance for limited working memory capacity. If navigating costs cognitive resources, fewer resources are available for the actual study task.

**Application:**
- The sidebar must reduce its cognitive cost to zero. A student who thinks about navigation while studying is a student whose working memory is partially allocated to interface management rather than content processing.
- **Icon-only collapsed mode is correct for students who have learned the platform.** It requires zero label-reading cognitive cost. But it requires a learning investment upfront — during the first 5–7 sessions, the expanded sidebar with labels should be the default.
- **Progressive disclosure is the correct pattern:** Show labels by default → student learns the positions → student can collapse to icon-only → navigation becomes automatic.

---

#### 7. The Paradox of Choice (Schwartz, 2004) Applied to Navigation

**The finding:** More options produce decision fatigue. When a user faces many equally-weighted navigation choices, they experience choice paralysis and are more likely to return to a previously visited page rather than explore.

**The "7 ± 2" rule (Miller, 1956) is actually wrong for navigation:** The original Miller's Law (7 items in working memory) is frequently misapplied to navigation design. For navigation, the optimal number of top-level items is **5 or fewer** for primary items. Every additional item above 5 increases task completion time non-linearly.

**Application to SlateCamp sidebar:**
- The current sidebar has too many items at equal visual weight. The three-tier hierarchy (Primary: 5 items / Secondary: 2 items / Tertiary: 2 items) is research-correct. Five primary items is the research-validated ceiling.
- The separation of secondary items (3D Lab, Campfire) with a divider is not aesthetic — it is cognitive load management. It tells the student: "These are different in kind from the primary items."

---

## Part 2 — The SlateCamp Student as a Navigation User

### The Five User States That Determine Navigation Behavior

The same student interacts with the sidebar in fundamentally different ways depending on their current state. Navigation design must accommodate all five.

---

**State 1: First Session (Days 0–1)**
- Student has zero familiarity with the platform layout
- Every navigation action is deliberate and label-dependent
- High cognitive load — all attention on understanding the platform
- **Navigation need:** Clarity over efficiency. Labels must be visible. Ambiguous icons are intolerable. The "Onboarding" principle: default to expanded sidebar with visible labels for the first 3 sessions.

**State 2: Learning (Days 2–14)**
- Student is building spatial memory of the platform
- Navigation is becoming semi-automatic but still requires occasional label reading
- Begins developing feature preferences (some features accessed daily, others rarely)
- **Navigation need:** Consistency. Never move items. Never change icon appearances. The student is encoding.

**State 3: Habitual (Days 15–45)**
- Student has internalized the platform layout
- Navigation is fully automatic — arriving at destinations without conscious thought
- Spatial memory is encoded; changes are deeply disruptive
- **Navigation need:** Speed and invisibility. The sidebar should require zero deliberate attention.

**State 4: Exam Approach (Days 46–56+)**
- Student is under high exam pressure; cognitive resources are precious
- Navigation errors have higher emotional cost ("I don't have time for this")
- Return to highly predictable, fast navigation patterns
- **Navigation need:** Zero surprises. No new items, no UI changes. The sidebar must be completely invisible.

**State 5: Post-Exam Re-enrollment**
- Student either passed (and may return as Campfire mentor) or failed (and is re-enrolling)
- Spatial memory largely intact — they remember the layout from last cycle
- For non-passers, the sidebar must NOT communicate failure through visual changes
- **Navigation need:** Continuity. The platform they return to must feel like the platform they left.

---

### The Filipino Architecture Reviewer — Specific Behavioral Patterns

From our ALE candidate research, four behaviors specifically affect sidebar design:

**Pattern 1 — Mobile-primary usage.**
The median user is on a Realme or Samsung A-series, screen width 360–390px. The sidebar's collapsed state (64px) means the main content area has only 296–326px of usable width. That is extremely narrow for a content-heavy educational platform. On mobile, the sidebar must become a bottom navigation bar, not a side drawer — the thumb-zone research is decisive here.

**Pattern 2 — Study session transitions.**
Filipino architecture students often study in short bursts (25–45 minutes) during commutes or lunch breaks. Each session ends abruptly (reach the destination, start work, etc.). When they return, they need to re-orient immediately. The sidebar must communicate their current position in the platform and their current trail progress at a glance — because they have no time to explore before they need to start.

**Pattern 3 — Hiya (shame) culture and navigation errors.**
When a Filipino student navigates to the wrong page, they feel momentary shame — even if no one sees it. Navigation errors are emotionally costly in a way that is disproportionate to their severity. This means the sidebar must be as clear and forgiving as possible. Ambiguous icons, mislabeled sections, and surprise modal dialogs triggered by wrong navigation all carry disproportionate emotional weight.

**Pattern 4 — Exam-day parallel studying.**
Many students open SlateCamp during review center lecture hours. They are simultaneously listening to a lecturer and answering questions on SlateCamp. Navigation must be silently accessible — no jarring animations, no sounds, nothing that might draw attention. The sidebar's expand/collapse animations must be visually quiet.

---

## Part 3 — Complete User Journey Paths (Step-by-Step)

### Path Notation

Each path is documented as:
- **Trigger:** What causes the student to navigate
- **Goal:** What the student is trying to do
- **Path steps:** Exact sequence of interactions with the sidebar
- **Success state:** What the student sees when the path succeeds
- **Failure modes:** What can go wrong and what the sidebar does

---

### Path 1 — First Launch Happy Path (Day 1, First Session)

**Trigger:** Student has just completed the 35-item Assessment Quiz. Score Reveal screen is showing.
**Goal:** Start the recommended Camp Trail.
**Pre-condition:** No previous session. Sidebar is in expanded state (default for first 3 sessions).

**Step-by-step:**

```
Step 1 — Score Reveal CTA
  Student taps "Start My Camp Trail →" on Score Reveal screen.
  System navigates to /dashboard/trails (or the appropriate trail enrollment page).
  Sidebar: Active item highlight moves to "Trail" (if present).

Step 2 — Dashboard orientation
  Student lands on dashboard. They see the sidebar for the first time.
  Sidebar state: EXPANDED (default for session 1).
  Student visually scans the sidebar top-to-bottom.
  Labels are visible: Dashboard / Map / Trail / Notes / Wiki
  Elapsed time: 1.5–3 seconds of visual scanning.

Step 3 — Spatial encoding begins
  Student's eye naturally lands on "Trail" in the sidebar (highlighted, active).
  The visual hierarchy tells them: "I am here, and this is the primary feature."
  Motor memory begins encoding: "Trail is the third item."

Step 4 — User begins Trail Day 1
  Student clicks "Start Day 1 →" on the dashboard card.
  No sidebar interaction needed — CTA handles the navigation.
  Sidebar: "Trail" remains active/highlighted.

Step 5 — Wiki article opens
  First trail step is a wiki read.
  Student arrives at /wiki/[article-slug].
  Sidebar: Active highlight moves to "Wiki."
  Student sees: "I am now reading. Wiki is the fifth item."

Step 6 — Returning to Trail
  After reading, student taps "← Back to Day 1" breadcrumb.
  Sidebar: Active highlight returns to "Trail."
```

**Success state:** Student has completed Day 1 Step 1. They have spatially encoded "Trail = third item, Wiki = fifth item" without deliberate effort.

**Failure modes and mitigations:**

| Failure | Cause | Sidebar mitigation |
|---|---|---|
| Student doesn't know what "Trail" means | New vocabulary | Expanded state (Day 1 default) shows label + brief tooltip on hover: "Your daily study program" |
| Student navigates to wrong feature | Misread icon | Label is visible in expanded state; tooltip available in all states |
| Student collapses sidebar by accident | Mis-tap on collapse toggle | Collapse toggle is at bottom, far from primary nav items — not easily accidentally tapped |

---

### Path 2 — Daily Return Happy Path (Days 15–30, Habitual State)

**Trigger:** Student opens SlateCamp after 24+ hours away.
**Goal:** Resume their Camp Trail at the current day.
**Pre-condition:** Active trail enrollment. Student has completed at least 14 days. Spatial memory is formed.

**Step-by-step:**

```
Step 1 — App open / dashboard load
  Student opens SlateCamp. Default route: /dashboard.
  Sidebar state: User preference. If they collapsed it last session,
  it opens collapsed (icon-only). If expanded, it opens expanded.

Step 2 — Spatial check (automatic, < 0.5 seconds)
  Student's eye does NOT consciously scan the sidebar.
  Peripheral vision registers: Dashboard icon is at top (position confirmed).
  Spatial memory says: "I am oriented."

Step 3 — Direct CTA access
  The Dashboard shows the Today's Trail Day card prominently.
  Student reads: "Day 23 of 56 · Structural Systems · 3 activities · ~45 min"
  Student taps "Continue Day 23 →"

Step 4 — Within-trail navigation
  Student is now in the Day 23 view (/dashboard/trails/[slug]/day/23).
  Sidebar: "Trail" item is active.
  Student sees the three step cards: Wiki, Quiz, 3D Lab.

Step 5 — Quiz step completion
  Student taps "Start Quiz →" on the Quiz step card.
  App navigates to the quiz session.
  Sidebar: "Trail" remains active during quiz (quiz is a trail step context).
  Timer runs. Student answers 20 questions.

Step 6 — Return to Trail after quiz
  Quiz session ends. Post-session debrief shows.
  Student sees "← Back to Day 23" in breadcrumb.
  Taps it. Returns to Day 23 view.
  The Quiz step card is now checked (green).

Step 7 — Day completion
  Student completes all steps. Day completion screen fires.
  "Day 23 complete. Structural Systems — covered."
  Next day preview shown.
  Student returns to Dashboard via "Back to Dashboard" button.
  Sidebar: "Dashboard" now active.
```

**Success state:** Student has completed a full trail day in a single session. Zero deliberate sidebar navigation was required — all navigation happened via in-content CTAs and breadcrumbs. The sidebar was pure peripheral orientation.

**Key insight:** On habitual-state days, the sidebar is **almost never directly used**. The student navigates through in-content CTAs. The sidebar's job is to confirm "you are where you think you are" via the active item highlight. This means the active item highlight is the most important visual element in the entire sidebar for habitual users.

---

### Path 3 — Quick Feature Hop (Any Day, Any State)

**Trigger:** Student is on the quiz session screen and wants to check their heatmap without abandoning the session.
**Goal:** Quick reference → back to quiz.
**Pre-condition:** Student is mid-session. Sidebar is collapsed (icon-only).

**Step-by-step:**

```
Step 1 — Mid-session pause
  Student is on question 12 of 20 in Camp Mode.
  They want to check which nodes are Red before continuing.
  Session autosaves (quiz state is preserved every 10 seconds).

Step 2 — Sidebar hover (desktop) / tap sidebar zone (mobile)
  Desktop: Student moves cursor toward the left sidebar.
  Sidebar transitions from 64px to 240px via overlay (150ms ease-in).
  Main content does NOT reflow. Content stays in place.

  Mobile: Student taps the hamburger icon (if mobile) or bottom nav item.

Step 3 — Label scan (< 1 second)
  Expanded sidebar shows labels. Student confirms: "Map" is the heatmap.
  They tap/click "Map."

Step 4 — Map view loads
  Sidebar: "Map" item is now active.
  Student sees their taxonomy heatmap.
  They identify 2 Red nodes in Structural Systems.

Step 5 — Return to quiz
  Student taps "← Return to Session" breadcrumb (shown on map page
  when accessed mid-session — a context-aware breadcrumb).
  Sidebar: Quiz session context resumes. "Trail" re-activates.
  Quiz continues from Question 12.
```

**Success state:** Student checked their heatmap and returned to the exact question they left. No data loss.

**Failure modes and mitigations:**

| Failure | Cause | Sidebar/system mitigation |
|---|---|---|
| Student can't find "Map" in collapsed mode | Icon not recognized | Tooltip on hover in collapsed mode: "Taxonomy Map — your knowledge heatmap" |
| Student accidentally taps a nav item that navigates away | Mis-tap | All nav items that cause navigation away from a quiz should show "Leave session?" confirmation if session is in progress (system-level, not sidebar-level) |
| Sidebar doesn't close after navigation | Overlay stays open | Auto-collapse after navigation to any page |

---

### Path 4 — New Feature Discovery (Days 7–21)

**Trigger:** Student notices "3D Lab" in the sidebar secondary section. They've never used it.
**Goal:** Discover what 3D Lab is and try it.
**Pre-condition:** Student is comfortable with primary navigation. Sidebar may be collapsed.

**Step-by-step:**

```
Step 1 — Peripheral noticing
  Student is on Dashboard. Sidebar is collapsed (icon-only).
  A secondary icon (Box icon for "3D Lab") is visible below the divider.
  It is at 70% opacity (secondary item visual treatment).
  Student has seen this icon many times but never hovered.

Step 2 — Curiosity trigger
  Student hovers the Box icon (desktop) or the sidebar expands via ⌘B.
  Tooltip appears (collapsed mode): "3D Lab — Explore architectural codes in 3D"
  OR label becomes visible in expanded mode: "3D Lab"

Step 3 — Decision to explore
  Student taps "3D Lab."
  Sidebar: "3D Lab" is now active (secondary item active state).
  Student lands on the 3D Lab gallery page.

Step 4 — Spatial re-encoding
  Student is now spatially aware: "3D Lab is the first item below the divider."
  This is encoded in ~3 interactions on subsequent days.

Step 5 — Return to primary navigation
  After exploring, student taps "Dashboard" to return to their study loop.
  The spatial memory has been extended: secondary items now have locations.
```

**Design decision that matters here:** Secondary items are at 70% opacity in collapsed mode, **not hidden**. Hidden items are never discovered. Reduced-opacity items are noticed when the student is ready — they create curiosity without demanding attention.

---

### Path 5 — Missed Day Return (After 3+ Day Absence)

**Trigger:** Student hasn't opened SlateCamp in 4 days. They return.
**Goal:** Resume studying without shame.
**Pre-condition:** Active trail enrollment. Trail has progressed past Day 14.

**Step-by-step:**

```
Step 1 — App open
  Student opens SlateCamp. Dashboard loads.
  The Today's Trail Day card shows the "Missed Day" state:
  "You left off at Day 23. 4 days ago. Day 23 is ready when you are."

Step 2 — Sidebar state (important)
  Sidebar shows "Trail" as the anticipated active item (they were on trail before).
  But since they're on Dashboard, "Dashboard" is technically active.
  The Trail item in the sidebar should NOT show a badge, dot, or
  notification indicator suggesting "you missed days." No shame mechanics.

Step 3 — CTA interaction
  Student taps "Continue Day 23 →" from the missed-day card.
  No sidebar interaction needed. CTA handles navigation.

Step 4 — Within-trail
  Normal trail path resumes from this point.
```

**The critical sidebar decision: no notification badges.**
The sidebar must NEVER show a notification dot, number, or indicator suggesting missed days. Per our gamification research and hiya (shame) culture constraints, any "you missed N days" signal in navigation creates anxiety disproportionate to its informational value. The sidebar says nothing about absence. The dashboard card handles the return gently.

---

### Path 6 — Settings Access (Tertiary Navigation)

**Trigger:** Student wants to change their preferred study time (morning → evening).
**Goal:** Update their `preferred_study_window` in settings.
**Pre-condition:** Any state. Student has never accessed settings.

**Step-by-step:**

```
Step 1 — Settings discovery
  Student expands sidebar (⌘B or hover) or scrolls to the bottom of the
  collapsed sidebar on mobile.
  "Settings" is visible at the bottom of the tertiary group.
  It is at 60% opacity (tertiary visual treatment).

Step 2 — Access
  Student taps "Settings."
  Sidebar: "Settings" is now active.
  The active state for tertiary items is subtler than for primary items
  — same 3px left border, but the background highlight is lighter
  (`bg-muted/30` vs. `bg-muted/50`).

Step 3 — Change made
  Student updates preferred study time.
  Taps "Save."

Step 4 — Return
  Student uses the browser back button OR taps "Dashboard" in sidebar.
  Sidebar: "Dashboard" re-activates.
```

**Design decision:** Tertiary items should have a subtle but clear active state. Students accessing settings are not on their primary study path — their "active" feeling should be different from the active feeling of doing a trail day. The softer active treatment communicates: "you are in a maintenance area, not a study area."

---

### Path 7 — Exam Day / Final 14 Days

**Trigger:** Student opens SlateCamp the morning of ALE Day 1.
**Goal:** Check their Readiness Score, see the Proof Simulation results, do a final light review.
**Pre-condition:** Exam Simulation Trail is active. Readiness Score is ≥ 70%.

**Step-by-step:**

```
Step 1 — Morning of exam
  Student opens SlateCamp. Spatial memory is fully formed — no label reading.
  Dashboard shows: Exam Day card.
  "Today is the ALE. Your Readiness Score: 74%. You've trained for this."

Step 2 — Navigation is minimal
  Student checks Readiness Score (on Dashboard, no navigation needed).
  Student may tap "Map" to see heatmap one last time.
  Sidebar: Maximum of 2 navigation actions in this session.

Step 3 — The sidebar on exam day
  The sidebar should do nothing unusual on exam day.
  No "Good luck!" banners. No "Final check!" prompts.
  The platform is calm. The sidebar is invisible.
  This is the reward of building good spatial memory: the interface
  disappears, and only the student's knowledge remains.
```

**The exam-day insight:** The best sidebar UX on exam day is no sidebar interaction at all. The student who has built spatial memory and habit over 56 days navigates automatically. Any attempt by the sidebar to insert itself into exam day (banners, special states, countdown timers) is an anti-pattern.

---

### Path 8 — Mobile-Specific Path (Bottom Navigation)

**Trigger:** Student opens SlateCamp on a 390px Android screen.
**Goal:** Start Camp Mode quiz.
**Pre-condition:** Mobile device. Screen width < 768px. Bottom navigation bar is showing.

**Step-by-step:**

```
Step 1 — App open on mobile
  Sidebar is NOT rendered on mobile.
  Bottom navigation bar shows 5 items: Dashboard / Map / Trail / Notes / Wiki
  Icons are 24×24, labels are 10px, hit areas are 44×44px minimum.
  Bottom bar is 64px tall. Fixed to bottom.

Step 2 — Navigation to testing
  Student wants to start a quiz. But "Testing" is not in the bottom nav.
  (Camp Mode is accessible from the Dashboard via the TestingHub card.)
  Student taps "Dashboard" in bottom nav.

Step 3 — Dashboard CTA
  Dashboard shows TestingHub card: "Start Camp Mode" and "Start Storm Mode" buttons.
  Student taps "Start Camp Mode →"
  Quiz session begins.

Step 4 — Within quiz
  Bottom navigation is hidden during active quiz sessions (full-screen focus mode).
  Progress bar at top. Nothing else.

Step 5 — Post-quiz
  Bottom nav re-appears on post-session debrief.
  Student can navigate to Dashboard or Trail from the bottom nav.
```

**Key mobile decisions:**
- "Testing" is not a bottom nav item — it is accessed through the Dashboard's TestingHub card. Bottom nav shows only the 5 primary destinations.
- Bottom nav disappears during active quiz sessions. This is the "stripped UI" principle from Storm Mode applied to navigation itself.
- The bottom nav item order must be: Dashboard (left, easiest thumb access) → Map → Trail → Notes → Wiki. Order reflects frequency of use, not alphabetical.

---

## Part 4 — Failure Path Analysis

### The Most Common Navigation Failures and Their Fixes

---

**Failure 1 — The "Where am I?" moment**

*Description:* Student arrives on an unfamiliar page (often via an email deep link or a shared URL) with no memory of how they got there. The sidebar active item highlight is their only orientation signal.

*Why it fails currently:* If the sidebar doesn't accurately reflect the current route (i.e., the active state is wrong or missing), the student has zero orientation signal.

*Fix:* `aria-current="page"` on the active nav item is both an accessibility requirement AND a behavioral orientation requirement. The active state must be computed from `usePathname()`, not from local state. External navigation must always correctly activate the matching sidebar item.

---

**Failure 2 — The Layout Shift Panic**

*Description:* Student is in the middle of reading an article. They tap a sidebar item. The main content area shifts (reflows) because the sidebar expanded from the content area's edge rather than overlaying it.

*Why it fails:* Current sidebar pushes content rather than overlaying it.

*Fix:* The expanded sidebar must be `position: fixed` with `z-index: 40`. The main content has `margin-left: 64px` permanently. Content never reflows. This is the single most important technical constraint in the entire sidebar.

---

**Failure 3 — The Accidental Navigation**

*Description:* Student is filling out a quiz answer or typing in the notes editor. Their palm or thumb accidentally touches the sidebar, causing navigation away from the page. Session data may be lost.

*Why it fails:* Sidebar nav items are immediately navigable — no "are you sure?" friction.

*Fix:* Two-layer protection:
1. Quiz sessions autosave every 10 seconds. Navigation away mid-session should not lose data.
2. If a student is on a page with unsaved changes (article editor, notes), sidebar navigation that causes route change should fire the `beforeunload` confirmation pattern.

---

**Failure 4 — The Feature Darkness Problem**

*Description:* Secondary features (3D Lab, Campfire) go unused because students never notice them. Discovery never happens.

*Why it fails:* Items with 70% opacity in collapsed mode are perceived as disabled or unavailable, not as "secondary" features.

*Fix:* The semantic difference between "not in my path right now" vs. "disabled" must be visually distinct.
- Secondary items: `opacity-70`, `text-muted-foreground` — present but recessive
- Disabled/locked items: `opacity-40`, line-through or lock icon, tooltip explaining unlock condition
- These must never look the same.

---

**Failure 5 — The Mobile Sidebar Drawer Problem**

*Description:* Student on mobile opens the hamburger menu (top-left corner). The sidebar slides in. They must tap in the top-left corner — the farthest point from their right-handed thumb.

*Why it fails:* Hamburger menu in top-left corner is a desktop-native pattern. On mobile, it requires a grip shift.

*Fix:* Bottom navigation bar on mobile replaces the hamburger entirely. The sidebar drawer pattern is eliminated for primary navigation on screens < 768px.

---

## Part 5 — The Ritual Navigation Patterns

A "ritual" is a navigation behavior so consistent that it becomes a habit — a fixed sequence of interactions that happens the same way every session without deliberate thought.

### Ritual 1 — The Morning Check-In

**Who:** Working professional reviewers (DAE architects studying on commute)
**Frequency:** Daily
**Duration:** < 90 seconds

```
1. Open app → Dashboard auto-loads
2. Eyes go to: Readiness Score (top-left of main content)
3. Eyes go to: Today's Trail Day card (main content, prominent)
4. Eyes do NOT go to sidebar (already oriented)
5. Tap "Start Day [N] →" on trail card
6. Study session begins
```

**Sidebar's role:** Zero. The student bypasses the sidebar entirely via muscle memory. The sidebar's job is to NOT intrude.

**What happens if the sidebar has a notification badge:** The ritual breaks. The student's eye goes to the badge, reads it, processes the information, and either acts on it or suppresses it. In both cases, cognitive resources are consumed before the student even starts studying.

**Design implication:** No badges in sidebar navigation. No notification dots. No unread counts.

---

### Ritual 2 — The Cross-Feature Reference

**Who:** Students doing wiki reading who need to check a code dimension
**Frequency:** Multiple times per session
**Duration:** 10–15 seconds

```
1. Reading wiki article (sidebar: "Wiki" is active)
2. Encounter a dimension (e.g., "min corridor width = 1500mm")
3. Want to verify in the interactive diagram
4. Look at sidebar (collapsed, icon-only)
5. Motor memory: "3D Lab is below the divider"
6. Hover → tooltip confirms: "3D Lab"
7. Tap → 3D Lab loads
8. Check the corridor visualizer
9. Tap back → return to wiki article
10. Continue reading (sidebar: "Wiki" re-activates)
```

**Duration:** 15 seconds total. This ritual is only this fast if the spatial memory is formed. It requires: (a) the icon being recognizable at a glance in collapsed mode, (b) the tooltip confirming the destination, (c) the active state correctly re-activating "Wiki" on return.

---

### Ritual 3 — The Readiness Check

**Who:** All students, particularly in the final 14 days
**Frequency:** Multiple times daily during exam crunch
**Duration:** 5 seconds

```
1. Student is on any page
2. Wants to quickly check Readiness Score
3. If score is on Dashboard: Tap "Dashboard" in sidebar (motor memory)
4. Score visible immediately on Dashboard load
5. Tap back to previous page (or proceed via Trail card)
```

**Design implication:** The Dashboard must load fast. The Readiness Score must be visible above the fold without scrolling. The sidebar "Dashboard" tap must reliably navigate to the Readiness Score's location within 300ms.

---

### Ritual 4 — The Session Boundary Ritual

**Who:** All students
**Frequency:** Every session end
**Duration:** 20–45 seconds

```
1. Session ends (quiz complete, or student decides to stop)
2. Student is on post-session debrief or Day completion screen
3. Reviews the score delta ("Readiness: 62% → 65%")
4. Reviews node updates
5. Taps "Back to Dashboard"
6. Dashboard loads
7. Student sees updated Readiness Score
8. Closes app OR taps the next scheduled step
```

**Sidebar's role:** Minimal. The "Back to Dashboard" button in post-session content handles most of this navigation. The sidebar is a fallback orientation tool.

---

## Part 6 — The Sidebar State Machine

### States and Transitions

```
STATES:
  COLLAPSED_DEFAULT   — 64px, icon-only, tooltips on hover
  EXPANDED_OVERLAY    — 240px, icons + labels, backdrop behind
  MOBILE_HIDDEN       — not rendered, bottom nav active
  MOBILE_DRAWER_OPEN  — full-height drawer, covers 80% of screen
  FIRST_SESSION       — expanded by default, tutorials active
  FOCUS_MODE          — hidden entirely (during quiz sessions on mobile)

TRANSITIONS:

COLLAPSED_DEFAULT →
  → EXPANDED_OVERLAY: hover (desktop, delay 150ms) | ⌘B | toggle click
  → MOBILE_HIDDEN: viewport < 768px (responsive)

EXPANDED_OVERLAY →
  → COLLAPSED_DEFAULT: outside click | Escape key | nav item tap | ⌘B
  → MOBILE_HIDDEN: viewport < 768px

MOBILE_HIDDEN →
  → MOBILE_DRAWER_OPEN: hamburger tap (if exists) | NOT APPLICABLE (bottom nav instead)
  → COLLAPSED_DEFAULT: viewport ≥ 768px

FIRST_SESSION →
  → COLLAPSED_DEFAULT: after 3rd session | explicit "Got it" by user
  (FIRST_SESSION is expanded by default, behaves like EXPANDED_OVERLAY but
  with onboarding tooltips and cannot auto-collapse)

FOCUS_MODE →
  → appropriate previous state: quiz session ends
  (FOCUS_MODE hides sidebar on mobile during active quiz sessions)
```

---

## Part 7 — Visual Specification (Implementation-Ready)

### Token Reference (from SlateCamp design system)

```css
/* Sidebar background */
--sidebar-bg: var(--surface-sidebar);    /* #F0F0F2 light / #1C1C1E dark */
--sidebar-border: var(--ink-separator-light);  /* #E5E5EA */

/* Icon opacities by group */
--icon-primary: 1.0;     /* full opacity */
--icon-secondary: 0.70;  /* 70% */
--icon-tertiary: 0.60;   /* 60% */
--icon-disabled: 0.35;   /* 35%, with lock indicator */

/* Active item */
--active-bg: var(--bg-muted/50);         /* very light bg fill */
--active-border: var(--cobalt);          /* #1B3FC4 — 3px left border */
--active-label: font-medium, text-foreground;

/* Hover item */
--hover-bg: var(--bg-muted);             /* slightly darker than active */
--hover-transition: 120ms ease-out;

/* Transitions */
--expand-duration: 200ms;   /* ease-out */
--collapse-duration: 150ms; /* ease-in */
--label-fade: 200ms;        /* opacity */
--backdrop-fade: 200ms;     /* opacity */
```

### Exact Pixel Geometry

```
COLLAPSED STATE:
  Sidebar width: 64px
  Icon container: width 48px, height 48px, centered horizontally in 64px
  Icon size: 20×20px (Lucide, strokeWidth 1.75)
  Item vertical gap: 4px
  Section divider: 1px, opacity-50, 8px horizontal inset
  Footer height: 80px (profile avatar + collapse toggle)

EXPANDED STATE:
  Sidebar width: 240px
  Icon container: width 48px, height 48px — IDENTICAL POSITION TO COLLAPSED
  Label position: starts at x=52px (4px gap from icon container)
  Label width: max 168px (240 - 64 - 8px padding = 168px)
  Shortcut badge: right-aligned, x from right edge

ICON LOCK PROOF:
  Collapsed: icon center x = 32px (64/2), y = variable per position
  Expanded: icon container starts at x=8px, width=48px, center x = 32px ✓
  Icons do not move. Only the sidebar width changes.

MAIN CONTENT OFFSET:
  margin-left: 64px (4rem) — PERMANENT, NEVER CHANGES
  This is the critical constraint: the main content area never reflows.
```

---

## Part 8 — Accessibility Specification

### WCAG 2.1 AA Requirements

**Focus Management:**
- `<nav aria-label="Main navigation">` wraps all nav items
- `aria-current="page"` on active nav item
- `aria-expanded="true|false"` on the toggle button
- When expanded: focus trap (Tab cycles within expanded sidebar, does not reach main content)
- When collapsed: focus returns to the element that triggered collapse (or first item if Escape was used)

**Keyboard Navigation:**
```
Tab:        Move focus between nav items (top to bottom)
Shift+Tab:  Move focus between nav items (bottom to top)
Enter/Space: Activate focused nav item
Escape:     Collapse expanded sidebar, return focus to toggle
⌘B/Ctrl+B:  Toggle sidebar expanded/collapsed (global shortcut)
⌘1–⌘5:     Direct navigation to primary items
```

**Screen Reader:**
- Each nav item announces: "[Icon aria-label] [Label] [shortcut if any] — [active state if current page]"
- Example: "Dashboard, Command 1, current page"
- Collapsed sidebar should announce: "Sidebar, collapsed" (aria-label on container)
- Expanded sidebar should announce: "Sidebar, expanded" on transition

**Color:**
- Active state: never uses color alone as indicator — uses both color (cobalt left border) and weight change (font-medium) and background change
- All text in sidebar: minimum contrast ratio 4.5:1 against sidebar background
- Muted icons at 70% opacity must still meet 3:1 contrast ratio (for non-text UI)

**Motion:**
```tsx
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// If reduced motion: instant state changes, no transitions
// All sidebar width transitions, fade animations, and backdrop 
// fade must respect this preference.
```

---

## Part 9 — The Anti-Patterns (What Not to Build)

Every item in this list has a research basis and a product-specific reason.

| Anti-pattern | Why it fails | Research basis |
|---|---|---|
| Notification dots/badges on nav items | Creates anxiety, breaks the "sidebar as infrastructure" principle, violates gamification constraints | Our gamification research; Schwartz (2004) choice overload |
| Streak counters in sidebar | Rewards activity, not mastery; creates shame on missed days | Hiya culture research; Deci et al. (1999) overjustification |
| "You're X% done with your trail" in sidebar | The Readiness Score is the only valid progress signal; secondary progress signals dilute attention | Our product intent documents |
| Flyout/hover menus from sidebar items | Increases accidental navigation; violates "invisible when working" principle | Fitts' Law — flyout targets are harder to click than direct links |
| Animated icons on nav items | Draws attention away from content; violates "minimum attention" principle; performs poorly on low-end Android | ATC interface research (Wickens); Dieter Rams minimalism |
| Category headers in sidebar | Adds cognitive load without navigation benefit; items are few enough to group by position | Miller (1956); 5 primary items fits within working memory without labels |
| Search in sidebar | Search is a specific task, not a navigation pattern; belongs in a command palette (⌘K) or page-level | Information architecture principles |
| Recent pages history in sidebar | Creates variable sidebar content; violates spatial consistency; spatial encoding requires stable landmarks | Memory palace research; Lynch (1960) landmark theory |
| Auto-expanding sidebar on hover with delay > 150ms | Feels laggy on mid-range Android; triggers accidental expansions | Fitts' Law timing research |

---

## Part 10 — Implementation Phases (Ordered)

### Phase 1: Geometry Lock (Day 1 — No Visual Changes)

Fix the core structural problem before touching any visual design.

1. Change sidebar from `position: relative` (pushes content) to `position: fixed` (overlays content)
2. Add permanent `margin-left: 64px` to the main content wrapper
3. Verify zero Cumulative Layout Shift (CLS) on expand/collapse
4. Verify icon positions are identical between 64px and 240px states

**Success criterion:** Toggle the sidebar 20 times rapidly. The main content never moves a single pixel.

### Phase 2: Visual Hierarchy

Introduce the three-tier visual treatment.

1. Primary items: full opacity icons, `text-foreground` labels, active indicator
2. Secondary items: 70% opacity icons, `text-muted-foreground` labels, divider above
3. Tertiary items: 60% opacity icons, `text-muted-foreground` labels, pinned to bottom
4. Remove all notification badges, streak counters, and gamification elements

### Phase 3: Interaction Polish

1. Tooltip on hover in collapsed state (Shadcn Tooltip, 150ms delay)
2. Keyboard shortcuts (⌘B toggle, ⌘1–5 direct navigation, Escape collapse)
3. Smooth transitions: expand 200ms ease-out, collapse 150ms ease-in
4. Backdrop behind expanded sidebar (`bg-black/5`, `backdrop-blur-[1px]`)
5. Auto-collapse on nav item tap

### Phase 4: Mobile

1. Replace sidebar with bottom navigation bar (< 768px)
2. 5 primary items in bottom nav, 44×44 tap targets
3. Hide bottom nav during active quiz sessions (focus mode)
4. Verify thumb-zone compliance (all items in bottom 40% of screen height)

### Phase 5: Accessibility Audit

1. Full keyboard navigation test
2. Screen reader test (VoiceOver / TalkBack)
3. `prefers-reduced-motion` compliance
4. WCAG 2.1 AA contrast ratios throughout
5. Focus trap and return verification

---

*SlateCamp Sidebar UX Research & Design Document*
*Version 1.0 · March 2026*
*Source references: Lynch (1960), Passini (1984), Wickens et al. FAA (2003), Rosenfeld & Morville (2002), Luke Wroblewski (2011), Miller (1956), Schwartz (2004), Tversky (2003), Yates (1966 method of loci), SlateCamp ALE Candidate Research, SlateCamp Design System, SlateCamp Gamification Research, Sidebar Overhaul Plan v2*
