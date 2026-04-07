# MASTER UX/UI IMPLEMENTATION PLAN
## SlateCamp — 2026-03-25

---

## 1. EXECUTIVE SUMMARY

SlateCamp has built a pedagogically deep exam preparation engine in 18 days — IRT-based adaptive mastery, anti-inflation readiness scoring, 7 testing modes, and a 3D spatial learning lab. The core learning algorithms are sound. The problem is that the interface wrapping this engine actively works against the student's psychology and the business's revenue.

**What's broken and what it costs us:**

The audit reveals three categories of UX failure that directly suppress funnel conversion:

First, the design system is massively bypassed. 2,576 hardcoded hex colors, 465 ad-hoc card divs ignoring the shared Card component, and a dual token system with conflicting values mean that every screen looks slightly different. For an anxious student scanning for trustworthiness signals, visual inconsistency reads as "unfinished product." This erodes the trust required for a ₱299/month commitment.

Second, critical revenue and learning paths are broken or blocked. Payment buttons on the upgrade page have no onClick handlers — revenue is literally zero. The SRS engine is disconnected from the primary testing flow, silently disabling the core learning loop. The score-reveal page has 6 sequential awaits adding ~300ms of perceived latency to the highest-stakes emotional moment in the product.

Third, accessibility violations block the median user. The viewport blocks pinch-to-zoom (WCAG 2.1 AA failure). Button touch targets fall below 44px. Five of the most-used colors fail contrast ratios on white backgrounds. On a 6-inch Realme with 4G connectivity, these aren't edge cases — they're the primary experience.

**What the fix delivers:**

This plan proposes 14 UX interventions across 7 priority components, targeting four funnel gates: Diagnostic → Complete (currently unknown, target ≥85%), Score reveal → Session 2 (target ≥55%), Free → Pro 30-day (target ≥8%), and D1→D7 retention (target ≥40%). The interventions are ordered by ROI (funnel impact × implementation ease), specified to engineering-grade detail (TypeScript interfaces, Tailwind classes, accessibility requirements), and validated by a telemetry strategy with 16 analytics events and 5 A/B tests.

Estimated total engineering effort: 6–8 weeks for a solo developer, or 3–4 weeks with a second frontend engineer. The first 2 weeks of work (Tier 1 refactors) are projected to unblock 100% of revenue and fix the 5 highest-impact UX violations.

---

## 2. BEHAVIORAL DESIGN PRINCIPLES

These are the psychological rules governing every SlateCamp screen. Each principle has a research basis, a design rule, and a violation test.

### Principle 1: The Score Is a Compass, Not a Verdict

**Psychological basis:** Dweck's Growth Mindset (2006) — framing ability as malleable increases persistence after failure. Kruger-Dunning (1999) — students are poor judges of their own readiness; the score must replace their unreliable self-assessment with objective data, but data framed as a verdict triggers avoidance rather than action.

**Design rule:** The Readiness Score is always displayed with a directional next action. Never show a score in isolation. Every score state (Strong/Green/Amber/Red) has a companion sentence: what this means and what to do next. Scores below 40% use neutral tones (gray/charcoal text) with the label "Needs review" — never red, never "failing," never "danger zone."

**Violation test:** If a student sees their score and feels despair instead of direction, the screen has failed. Test by asking: "After seeing this screen, does the student know their next action within 5 seconds?"

### Principle 2: One Screen, One Job

**Psychological basis:** Hick's Law — decision time increases logarithmically with the number of equal-weight choices. Miller's "7±2" working memory limit. Sweller's extraneous cognitive load — every UI element that doesn't serve the screen's primary purpose consumes working memory that the anxious student needs for decision-making.

**Design rule:** Every screen has exactly one primary action, visually dominant (Camp Orange `#E8853A` or Cobalt Blue `#1B3FC4`), in the bottom 40% thumb zone. Secondary actions use ghost/text styling. No screen presents more than 3 interactive choices above the fold. If a screen needs more, it requires information architecture restructuring — not more buttons.

**Violation test:** Cover the screen with your hand, then reveal it. Can you identify the primary action within 2 seconds? If not, the visual hierarchy is broken.

### Principle 3: Calm Urgency, Not Panic

**Psychological basis:** Yerkes-Dodson Law — performance peaks at moderate arousal and degrades at high arousal. Anxiety consumes working memory (Beilock & Carr, 2005). Filipino students operate under *hiya* (shame culture) — failure signals are amplified socially, making UI-induced anxiety disproportionately damaging.

**Design rule:** Signal Red `#E63329` is reserved for functional errors only (form validation, system alerts). It is never used for low scores, missed deadlines, or underperformance. Urgency is communicated through structure (exam countdown with actionable framing), not color or animation. No pulsing, no countdown timers divorced from study actions, no "danger zone" language.

**Violation test:** Would a student with a 35% Readiness Score feel motivated or ashamed after viewing this screen? If ashamed, redesign.

### Principle 4: Progress Is Visible and Earned

**Psychological basis:** Deci & Ryan's Self-Determination Theory — competence signals (seeing yourself improve) drive intrinsic motivation. The competence signal must be *earned* (based on demonstrated retrieval) or it destroys trust — and trust is SlateCamp's core product.

**Design rule:** The Readiness Score and Heatmap are always accessible within one tap from any core screen. Score deltas ("+4 from last week") use Signal Gold `#F5A623`. Heatmap node color transitions (Red → Amber → Green) happen quietly — no confetti, no celebration animation, just a factual color change. The student sees the map change and knows it's real.

**Violation test:** Can the student tell — within 10 seconds of opening the app — whether they are better than yesterday? If not, the progress signal is broken.

### Principle 5: Shame-Proof by Default

**Psychological basis:** Filipino *hiya* culture amplifies failure signals. Retakers carry emotional scarring from prior ALE failure. Avoidance of aversive topics (Bjork, 1994) means that the topics a student most needs to study are the topics they most avoid. The UI must surface gaps without triggering the emotional avoidance response.

**Design rule:** No screen uses language like "failed," "weak," "bad," or "behind." Red heatmap nodes are labeled "Needs review," not "Failed." Score zones below 40% use neutral gray, never red. The Blindspot Protocol surfaces neglected nodes with actionable framing: "These topics haven't been reviewed recently" — not "You're weak in these areas." Retakers see a "before vs. after" delta that emphasizes movement, not absolute position.

**Violation test:** Read every label and heading on the screen aloud. Would a retaker who failed the ALE last year feel safe using this screen? If any word triggers shame, replace it.

### Principle 6: The Rams Standard — Earn Every Pixel

**Psychological basis:** Cognitive Load Theory (Sweller, 1988) — extraneous load from unnecessary UI elements consumes the same cognitive resources the student needs for learning. "Good design is as little design as possible" (Dieter Rams).

**Design rule:** Every element must pass the removal test: if deleting it doesn't break communication or function, delete it. No decorative animations, no badges, no gamification debris, no hover micro-animations on static cards. Skeleton loading states replace blank screens and spinners. Empty states always include an honest observation and a next action CTA.

**Violation test:** For every element on screen, ask: "Does this help the student pass the ALE?" If the honest answer is "not directly," it shouldn't be there.

---

## 3. THE REFACTOR HIT LIST

Ordered by ROI (funnel impact × implementation ease). Each item references specific audit findings.

### 3.1 — Wire Payment Buttons (Revenue Unblock)

**Current state:** The upgrade page at `/dashboard/upgrade` has feature comparison and pricing UI, but GCash and Card buttons have no onClick handlers (Audit §6, §12: "Payment buttons non-functional"). Revenue is literally ₱0.

**Target state:** Both payment buttons call the existing checkout route at `src/app/api/payments/checkout/route.ts`. GCash button uses PayRex flow, Card button uses LemonSqueezy flow. Loading state on button press. Error state with retry. Success redirects to `/dashboard/welcome-pro`.

**Components affected:** `<PaywallSheet />` (new), existing upgrade page buttons.

**Persona served:** All — but primarily Persona 4 (Working Professional Returner, highest conversion probability).

**Metric moved:** Free → Pro conversion (target ≥8%). Currently 0%.

**Engineering effort:** S (2–4 hours). Infrastructure is 90% complete.

**Dependencies:** None. LemonSqueezy + PayRex webhook handlers already work.

---

### 3.2 — Score Reveal Emotional Redesign

**Current state:** `src/app/dashboard/score-reveal/page.tsx` has 6 sequential awaits adding ~300ms latency (Audit §5, Appendix E). The highest-stakes emotional moment in the product — where the Anxious First-Taker decides whether to trust SlateCamp or leave forever — is delayed by a waterfall and lacks zone-specific emotional framing.

**Target state:**

The score-reveal page is restructured into three layers:

**Layer 1 — Immediate (0ms):** Skeleton state with the score ring animating from 0. The student knows something is loading, but the visual momentum keeps them engaged.

**Layer 2 — Score render (<500ms):** Parallel data fetch via `Promise.all()`. The Readiness Score ring animates to the final value. Zone-colored ring (Green `#1B7A3C` for ≥70%, neutral charcoal for 40–69%, neutral charcoal for <40% — never red). Zone label appears below the score.

**Layer 3 — Context + CTA (immediately after score):** Zone-specific copy:
- **Strong Zone (≥85%):** "Strong foundation. Your Trail will sharpen the edges."
- **Green Zone (70–84%):** "Solid ground. Your Trail targets the [X] topics that will push you higher."
- **Amber Zone (40–69%):** "You know more than you think. Your Trail builds on what's already working."
- **Needs Review (<40%):** "Every camper starts somewhere. Your Trail focuses on the topics with the most room to grow." (Never red. Never "failing." Never "danger zone.")

Primary CTA: "See Your Trail" (Camp Orange, full-width, bottom 40% thumb zone).
Secondary: "View Full Map" (text link).

Free users: Paywall appears AFTER the score, not before. The score is never gated.

**Components affected:** `<ReadinessScoreRing />` (new), `<ScoreRevealPage />` (refactored), `<ZoneContextCard />` (new).

**Persona served:** Persona 1 (Anxious First-Taker) — this is their make-or-break moment. Persona 2 (Retaker) — the score must feel honest, not like a trick.

**Metric moved:** Score reveal → Session 2 (target ≥55%). Diagnostic → Complete (target ≥85% — if the score feels honest, word-of-mouth improves diagnostic completion for future users).

**Engineering effort:** M (4–6 hours). Waterfall fix is mechanical (`Promise.all`). Zone framing is copy + conditional rendering. Score ring is a new component.

**Dependencies:** `<ReadinessScoreRing />` component must be built first.

---

### 3.3 — Design Token Migration (Visual Trust)

**Current state:** 2,576 hardcoded hex colors bypass the design system (Audit §9). The top 10 hex values account for 81% of violations. Dual token systems in `globals.css` — shadcn semantic tokens AND "Camp Standard" tokens with conflicting values for red, green, and amber. 465 ad-hoc card divs ignore the shared Card component (92% bypass rate).

**Target state:** Unified token system. Deprecate Camp Standard tokens. Migrate the top 10 hex values to semantic classes (covers 2,080 of 2,576 instances). ESLint hex-color rule enforced to prevent regression. All new components use `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary` — never raw hex.

**Migration map (top 10, covering 81%):**

| Hardcoded Hex | Count | Replacement Token |
|---|---|---|
| `#1B3FC4` | 406 | `text-primary` / `bg-primary` |
| `#D4DAE3` | 343 | `border-border` |
| `#8896A7` | 315 | `text-muted-foreground` |
| `#4A5568` | 223 | `text-text-secondary` |
| `#1A2332` | 221 | `text-foreground` |
| `#EEF2FC` | 141 | `bg-primary-50` |
| `#D64545` | 113 | `text-destructive` |
| `#D4951A` | 110 | `text-warning` |
| `#1535A8` | 106 | `text-primary-700` |
| `#2D9F6F` | 102 | `text-success` |

**Persona served:** All. Visual consistency is a trust signal. Persona 4 (Working Professional) especially — they're comparing SlateCamp to polished competitors.

**Metric moved:** Free → Pro conversion (trust signal), D7→D30 retention (consistency reduces "this feels broken" churn).

**Engineering effort:** L (8–12 hours for top 10 values). Mechanical but high-volume find-and-replace with manual verification.

**Dependencies:** Resolve dual token system first (2 hours). Then migrate hex values.

---

### 3.4 — Accessibility Critical Fixes

**Current state:** (Audit §9)
- `maximumScale: 1` in viewport blocks pinch-to-zoom (WCAG 2.1 AA failure)
- Button touch targets below 44px for all sizes except `xl`
- 5 colors fail AA contrast on white (`#8896A7`, `#2D9F6F`, `#D4951A`, `#E8853A`, `#D64545`)
- Only 8 `alt` attributes in the entire codebase
- Heatmap nodes have no aria-labels

**Target state:**
- Remove `maximumScale: 1` from `src/app/layout.tsx:51` (1 minute)
- Add `@media (pointer: coarse)` override in `src/components/ui/button.tsx` to enforce 44px minimum on touch devices (1 hour)
- Darken failing colors: Ink Tertiary to `#6B7A8D`, Emerald to `#157A3C`, Amber to `#B8790F`, Camp Orange to `#C96E2A`, Warm Red to `#B83A3A` (2 hours)
- Add `alt` text to all `<Image>` and `<img>` tags, starting with dashboard and wiki (4 hours)
- Add `aria-label` to all heatmap nodes: `"{topic_name}: {mastery_state}"` (1 hour)

**Persona served:** All — but especially Persona 4 (Working Professional on mid-range Android) and any user with visual impairment.

**Metric moved:** All funnel gates. Accessibility failures create invisible drop-off — users leave without reporting why.

**Engineering effort:** S–M (4–8 hours total across sub-tasks).

**Dependencies:** Color contrast fixes must happen before or alongside the token migration (3.3).

---

### 3.5 — Dashboard One-Action Redesign

**Current state:** The dashboard at `src/app/dashboard/page.tsx` has 29 changes in the churn hotspot analysis (Audit §3, Rank 3) — the layout is still unstable. The sidebar has 34 changes (Rank 1). Based on the feature roster, the dashboard presents: wiki browser, testing hub (7 modes), analytics (8 visualizations), notes, 3D lab, camp trails, assessment, settings, and upgrade — all accessible from a single surface. This is a Hick's Law violation: the student opens the app and faces 9+ equal-weight navigation options with no clear "what do I do now?"

**Target state:**

The dashboard collapses to the One Action Principle. Above the fold, exactly three elements:

1. **Readiness Score Widget** (full-width card, top of page). Score number in GeistSans 700 at Display size, zone-colored. Delta from last week in Signal Gold. Zone label below.

2. **Today's Action Card** (Camp Orange left-border accent). "Day [N] is ready." Topic name + estimated time. Primary CTA: "Start Day [N]." This is the ONE action the student should take. If no Camp Trail is enrolled, this becomes: "Start your first session" pointing to the diagnostic.

3. **Quick Stats Row** (horizontal chips). Days to exam, sessions completed, green topics. DM Mono, muted, informational only — not interactive.

Below the fold: Heatmap thumbnail (tap to expand), recent session summary, Campfire nudge (if relevant). Secondary navigation via bottom tab bar (4 items max: Home, Map, Trail, Profile).

**Components affected:** `<ReadinessScoreWidget />` (refactored), `<TodayActionCard />` (new), `<QuickStatsRow />` (new), `<Sidebar />` (restructured to bottom tab bar on mobile).

**Persona served:** Persona 1 (Anxious First-Taker — needs orientation), Persona 4 (Working Professional — needs to start studying in <10 seconds).

**Metric moved:** D1→D7 retention (target ≥40%). If the student opens the app and immediately knows what to do, they do it. If they face 9 choices, they close the app.

**Engineering effort:** L (8–12 hours). Requires dashboard page refactor + new components + sidebar restructuring.

**Dependencies:** `<ReadinessScoreRing />` from 3.2. Token migration (3.3) should precede this to avoid re-work.

---

### 3.6 — Waterfall Page Performance Fixes

**Current state:** 22 pages with sequential awaits (Audit §5, Appendix E). The worst offenders — onboarding (10 awaits, ~500ms), testing hub (8 awaits, ~400ms), debrief (7 awaits, ~350ms), session page (6 awaits, ~300ms), score-reveal (6 awaits, ~300ms) — are all in the critical student flow. On a 4G connection, these cumulative delays make the app feel sluggish on the median user's device.

**Target state:** All independent queries wrapped in `Promise.all()`. The analytics page (Audit §7) is the gold standard — 8 independent Suspense boundaries with async server components. Apply this pattern to all 22 waterfall pages.

Priority order (by funnel impact):
1. `score-reveal/page.tsx` (6 awaits → parallel) — Activation gate
2. `testing/page.tsx` (8 awaits → parallel) — Session start gate
3. `testing/session/[sessionId]/page.tsx` (6 awaits → parallel) — Active session
4. `testing/session/[sessionId]/debrief/page.tsx` (7 awaits → parallel) — Post-session
5. `(auth)/onboarding/page.tsx` (10 awaits → parallel) — Onboarding gate

**Persona served:** All — but especially Persona 4 (time-scarce, 30–60 min/day — every wasted second is magnified).

**Metric moved:** Diagnostic → Complete (faster onboarding), Score reveal → Session 2 (faster score rendering), D1→D7 retention (snappier overall experience).

**Engineering effort:** S (3–4 hours). Mechanical transformation — wrap independent queries in `Promise.all`, add Suspense boundaries.

**Dependencies:** None. Can be done immediately.

---

### 3.7 — Paywall Timing & Framing Redesign

**Current state:** The upgrade page exists at `/dashboard/upgrade` but buttons are non-functional (addressed in 3.1). More critically, the paywall's *timing* and *framing* need UX redesign. The freemium gate blurs the score widget after the first view — but the value proposition of "Live score vs. one-time score" needs to be viscerally demonstrated, not just described.

**Target state:**

The paywall follows the Score → Value → Comparison → Social Proof → CTA flow:

1. **Trigger:** After the student's second session, when they tap the Readiness Score widget and see it blurred, a bottom sheet (`<PaywallSheet />`) slides up.

2. **Headline:** "Know you'll win." (brand tagline, Syne 800)

3. **Context line:** "Free users see their score once. Pro users see it change — every session." (Inter 400, muted)

4. **Visual comparison:** Side-by-side Free vs. Pro table. Not a feature list — a *value* comparison. Free: "Score once." Pro: "Live score after every session." Free: "3 Trail days." Pro: "Full Camp Trail." Free: "—" Pro: "Blindspot Protocol."

5. **Social proof:** A real ALE-specific testimonial. "I went from 48% to 81% in 8 weeks. Pro was worth it. — Maria S., UST" (never generic EdTech copy)

6. **Pricing:** ₱299/month or ₱1,499/year (save 58%). Annual shown first (price anchoring). Toggle between monthly and yearly.

7. **Trust signals:** "🔒 Secure payment · GCash, card, or bank transfer · Cancel anytime"

8. **CTA:** "Enroll in Camp — ₱299/mo" (Camp Orange, full-width, bottom thumb zone)

9. **Exit:** "Not yet — continue free" (tertiary text link, always visible — never hidden or buried. SlateCamp's brand is honesty.)

**Components affected:** `<PaywallSheet />` (new), `<PricingToggle />` (new), `<SocialProofQuote />` (new).

**Persona served:** Persona 4 (highest conversion probability — willing to pay, needs value clarity). Persona 2 (Retaker — needs trust that Pro delivers what Free doesn't).

**Metric moved:** Free → Pro 30-day conversion (target ≥8%).

**Engineering effort:** M (6–8 hours). New components + bottom sheet interaction + payment integration from 3.1.

**Dependencies:** Payment buttons must be wired first (3.1).

---

## 4. COMPONENT SYSTEM SPEC

### 4.1 — `<ReadinessScoreRing />`

The single most important visual element in the product.

```typescript
// src/components/score/ReadinessScoreRing.tsx
'use client'

interface ReadinessScoreRingProps {
  score: number           // 0–100
  previousScore?: number  // for delta calculation
  zone: 'strong' | 'green' | 'amber' | 'needs-review'
  size?: 'sm' | 'md' | 'lg'   // sm: 80px, md: 160px, lg: 240px
  showDelta?: boolean
  animate?: boolean       // animate from 0 on mount
}

// States:
// Default: Ring with score number, zone-colored stroke, optional delta
// Loading: Skeleton ring (pulsing circle outline)
// Empty: N/A — score always has a value after diagnostic
// Error: Fallback text "Score unavailable — try refreshing"

// 'use client': YES — uses useEffect for ring animation, 
// useRef for SVG circumference calculation

// Accessibility:
// - aria-label: "Readiness Score: {score} percent. {zone_label}."
// - role="img" on the SVG
// - Score number is not aria-hidden (screen readers read it)

// Design system compliance:
// - Score number: font-hero font-bold text-4xl (GeistSans 700)
// - Zone label: font-mono text-xs uppercase tracking-widest
// - Ring stroke colors:
//   strong/green: text-[#1B7A3C] (Signal Green)
//   amber: text-foreground (neutral — NOT amber/gold)
//   needs-review: text-muted-foreground (gray — NEVER red)
// - Delta: text-[#F5A623] (Signal Gold) for positive, 
//          text-muted-foreground for negative/zero
// - Ring animation: CSS transition-all duration-1000 ease-out
//   on strokeDashoffset
```

### 4.2 — `<HeatmapNode />` + `<HeatmapGrid />`

```typescript
// src/components/heatmap/HeatmapNode.tsx
'use client'

type MasteryState = 'mastered' | 'developing' | 'learning' | 'unexplored'

interface HeatmapNodeProps {
  topicId: string
  topicName: string
  state: MasteryState
  masteryWeight?: number  // 0–100
  lastAttempted?: string  // ISO date
  onClick?: (topicId: string) => void
}

// Color + Shape mapping (accessibility: never color alone):
// mastered:    fill Signal Green #1B7A3C, solid circle
// developing:  fill neutral #6B7A8D, solid circle
// learning:    fill neutral #9CA3AF, dashed border circle
// unexplored:  fill transparent, dashed border, muted

// Accessibility:
// - aria-label: "{topicName}: {stateLabel}" 
//   e.g., "Foundation Design: Needs review"
// - role="button" when onClick is provided
// - Keyboard: Enter/Space triggers onClick
// - Focus ring: 2px Cobalt Blue outline

// States:
// Default: Colored circle with topic name on hover/tap
// Loading: Skeleton circle (pulse)
// Tap expanded: Bottom sheet with topic detail + "Start Session" CTA


// src/components/heatmap/HeatmapGrid.tsx
// Server Component (no 'use client') — data fetching wrapper

interface HeatmapGridProps {
  disciplines: Array<{
    id: string
    name: string
    topics: Array<HeatmapNodeProps>
  }>
}

// Layout: Accordion by discipline on mobile, grid on desktop
// Loading: Skeleton grid (stagger-reveal pattern)
// Empty: "Take your first session to start filling in your map."
//        CTA: "Start Diagnostic"
```

### 4.3 — `<StatCard />`

Universal metric display following the eyebrow/title/value/delta pattern from the design system.

```typescript
// src/components/shared/StatCard.tsx
// Server Component — no interactivity needed

interface StatCardProps {
  eyebrow: string          // DM Mono uppercase label
  title: string            // Inter medium card title
  value: string | number   // DM Mono tabular-nums display value
  delta?: {
    value: number
    period: string         // "from last week", "from last session"
  }
  subtitle?: string        // Inter regular, muted
  tooltip?: string         // Explanation on hover/focus
  href?: string            // Optional link wrapping the card
}

// Design tokens:
// Eyebrow: font-mono text-[9px] font-medium uppercase tracking-widest 
//          text-muted-foreground
// Title: font-sans font-medium text-sm text-foreground
// Value: font-mono font-medium tabular-nums text-2xl
// Delta positive: text-[#F5A623] (Signal Gold)
// Delta negative: text-muted-foreground (NEVER red)
// Card: bg-card border border-border rounded-xl p-4

// States:
// Default: Full data display
// Loading: Skeleton (3 lines: eyebrow width, value width, subtitle width)
// Empty: Dash "—" for value, subtitle "Complete a session to see data"
// Error: "Unable to load" with muted styling
```

### 4.4 — `<TrailDayCard />`

```typescript
// src/components/trail/TrailDayCard.tsx
'use client'

interface TrailDayCardProps {
  dayNumber: number
  topicName: string
  estimatedMinutes: number
  status: 'available' | 'completed' | 'locked' | 'current'
  score?: number           // if completed
  onStart?: () => void
}

// 'use client': YES — onClick handler for session start

// Design:
// Current day: Camp Orange left-border accent card (border-l-[#E8853A])
// Completed: Subtle Signal Green left-border, score shown
// Available: Default card, no accent
// Locked: Muted card, lock icon, "Complete Day {N-1} first"

// Accessibility:
// - aria-label: "Camp Trail Day {dayNumber}: {topicName}. 
//   {estimatedMinutes} minutes. Status: {status}."
// - Locked state: aria-disabled="true"
```

### 4.5 — `<SessionResultsPanel />`

```typescript
// src/components/session/SessionResultsPanel.tsx
'use client'

interface SessionResultsProps {
  sessionScore: number     // percentage correct
  questionsTotal: number
  questionsCorrect: number
  timeElapsed: number      // seconds
  previousScore?: number   // for delta
  topicBreakdown: Array<{
    topicName: string
    correct: number
    total: number
  }>
  nextAction: {
    label: string          // "Continue Trail" | "Review Mistakes" | "View Map"
    href: string
  }
}

// Score display follows zone color logic:
// ≥70%: Signal Green text
// 40–69%: Neutral foreground text
// <40%: Neutral muted text (NEVER red)

// Layout:
// Score number (Display size) → Delta → Topic breakdown → Primary CTA
// Primary CTA always in bottom 40% thumb zone

// States:
// Default: Full results display
// Loading: Skeleton with score ring placeholder
// Error: "Results couldn't load. Your session was saved — 
//         check your analytics."
```

### 4.6 — `<PaywallSheet />`

```typescript
// src/components/paywall/PaywallSheet.tsx
'use client'

interface PaywallSheetProps {
  currentScore?: number
  triggerContext: 'score_tap' | 'trail_limit' | 'feature_gate' | 'manual'
  onUpgrade: (plan: 'monthly' | 'annual') => Promise<void>
  onDismiss: () => void
}

// 'use client': YES — sheet interaction, plan toggle, payment trigger

// Layout: Bottom sheet (slides up from bottom, not modal)
// Always includes visible "Not yet — continue free" tertiary link
// GCash appears in trust signals line
// Annual price shown first (price anchoring)

// Accessibility:
// - role="dialog", aria-modal="true"
// - Focus trap within sheet
// - Escape key dismisses
// - "Not yet" link has aria-label="Dismiss upgrade and continue free"
```

### 4.7 — `<EmptyState />`

```typescript
// src/components/shared/EmptyState.tsx
// Server Component

interface EmptyStateProps {
  message: string    // Honest observation + direction
  ctaLabel: string   // Action text
  ctaHref: string    // Where the CTA goes
  icon?: React.ReactNode  // Simple geometric, not illustrative
}

// Copy pattern: "[Honest observation]. [What to do next]."
// Examples:
// "No sessions yet this week. Start your first quiz to see activity here."
// "No notes saved. Highlight text in the Wiki to create a note."
// NEVER: "No data found." / "Empty" / "Nothing here yet!"

// Design:
// Centered, py-8, max-w-[200px] for message text
// Icon: 8×8 rounded-lg bg-muted placeholder
// Message: font-sans text-sm text-muted-foreground leading-relaxed
// CTA: font-sans text-xs text-primary hover:underline
```

### 4.8 — Component File Structure

```
src/components/
├── score/
│   ├── ReadinessScoreRing.tsx
│   ├── ReadinessScoreWidget.tsx      (dashboard card wrapping the ring)
│   ├── ZoneContextCard.tsx           (zone-specific copy below score)
│   └── skeletons/
│       └── ScoreRingSkeleton.tsx
├── heatmap/
│   ├── HeatmapNode.tsx
│   ├── HeatmapGrid.tsx
│   ├── HeatmapDisciplineAccordion.tsx
│   ├── HeatmapTopicSheet.tsx         (bottom sheet on node tap)
│   └── skeletons/
│       └── HeatmapGridSkeleton.tsx
├── trail/
│   ├── TrailDayCard.tsx
│   ├── TrailProgressBar.tsx
│   └── skeletons/
│       └── TrailDayCardSkeleton.tsx
├── session/
│   ├── SessionResultsPanel.tsx
│   └── skeletons/
│       └── SessionResultsSkeleton.tsx
├── paywall/
│   ├── PaywallSheet.tsx
│   ├── PricingToggle.tsx
│   ├── FeatureComparisonTable.tsx
│   └── SocialProofQuote.tsx
├── shared/
│   ├── StatCard.tsx
│   ├── EmptyState.tsx
│   ├── QuickStatsRow.tsx
│   └── TodayActionCard.tsx
└── ui/                               (Shadcn primitives — unchanged)
    ├── button.tsx                     (add 44px touch target override)
    ├── card.tsx
    ├── skeleton.tsx
    ├── tooltip.tsx
    └── ...
```

---

## 5. TELEMETRY IMPLEMENTATION GUIDE

### 5A — Event Taxonomy

| Event Name | Trigger | Properties | Funnel Gate |
|---|---|---|---|
| `diagnostic_started` | User begins diagnostic assessment | `persona_type`, `referral_source`, `device_type` | Activation |
| `diagnostic_completed` | User submits final diagnostic answer | `questions_answered`, `time_elapsed_s`, `completion_rate` | Activation |
| `diagnostic_abandoned` | User leaves diagnostic before completion | `questions_answered`, `last_question_index`, `time_elapsed_s` | Activation |
| `score_reveal_viewed` | Score reveal page mounts with data | `score`, `zone`, `is_first_view`, `time_to_render_ms` | Activation |
| `score_reveal_cta_clicked` | User taps "See Your Trail" or "View Full Map" | `cta_type`, `score`, `zone` | Activation → Retention |
| `session_started` | Quiz session begins | `mode`, `topic_id`, `day_number`, `source_screen` | Retention |
| `session_completed` | Quiz session submitted | `mode`, `score`, `questions_total`, `time_elapsed_s`, `topic_id` | Retention |
| `session_abandoned` | User exits mid-session | `mode`, `last_question_index`, `time_elapsed_s`, `questions_total` | Retention |
| `heatmap_viewed` | Heatmap page mounts | `total_nodes`, `mastered_count`, `learning_count`, `unexplored_count` | Retention |
| `heatmap_node_tapped` | User taps a heatmap node | `topic_id`, `mastery_state`, `resulted_in_session` | Retention |
| `paywall_shown` | PaywallSheet mounts | `trigger_context`, `score_at_time`, `sessions_completed`, `days_since_signup` | Revenue |
| `paywall_decision` | User taps Upgrade or Dismiss | `action: 'upgrade_monthly' \| 'upgrade_annual' \| 'dismiss'`, `time_on_paywall_ms`, `score_at_time` | Revenue |
| `payment_completed` | Webhook confirms payment | `plan`, `amount`, `method: 'gcash' \| 'card'`, `days_since_signup` | Revenue |
| `trail_day_started` | User starts a Camp Trail day | `day_number`, `topic_name`, `is_on_schedule` | Retention |
| `trail_day_completed` | User finishes a Camp Trail day | `day_number`, `score`, `time_elapsed_s` | Retention |
| `app_opened` | Dashboard page mounts (daily first visit) | `days_since_last_visit`, `current_score`, `days_to_exam` | Retention |

### 5B — UX KPIs Dashboard

| KPI | Definition | Target | Red Flag |
|---|---|---|---|
| Time-to-Value | Signup → score reveal (median) | <12 min | >20 min |
| Diagnostic Completion Rate | Started diagnostic / completed diagnostic | ≥85% | <70% |
| Score Reveal → Session 2 | Users who complete a second session within 48h of score reveal | ≥55% | <35% |
| Heatmap Engagement Depth | Median nodes tapped per heatmap visit | ≥3 | <1 |
| Trail Day Completion Rate | Trail days started / trail days completed | ≥80% | <60% |
| Session Abandonment Rate | Sessions abandoned / sessions started (by question index) | <15% | >25% |
| Paywall Conversion Rate | Paywall shown / payment completed (by persona segment) | ≥8% | <4% |
| D1 Retention | Users returning day after signup | ≥50% | <30% |
| D7 Retention | Users returning 7 days after signup | ≥40% | <25% |
| D30 Retention | Users returning 30 days after signup | ≥25% | <15% |

### 5C — A/B Test Roadmap

**Test 1: Score Reveal Zone Framing**

- **Hypothesis:** Zone-specific contextual copy below the Readiness Score increases Score Reveal → Session 2 conversion by ≥10% compared to a generic "View your results" CTA.
- **Control:** Current score reveal with generic CTA.
- **Variant:** Zone-specific copy (Strong/Green/Amber/Needs Review framing as specified in §3.2) with "See Your Trail" CTA.
- **Primary metric:** Score Reveal → Session 2 (48h window).
- **MDE:** 10% relative lift (55% → 60.5%).
- **Sample size:** ~800 per arm (1,600 total) at 80% power, α=0.05.
- **Duration:** 4–6 weeks at current signup rate.

**Test 2: Paywall Trigger Timing**

- **Hypothesis:** Showing the paywall after the 2nd session (when the student taps the blurred score) converts better than showing it immediately after score reveal.
- **Control:** Paywall shown immediately after first score reveal.
- **Variant:** Paywall shown on 2nd score tap (after completing at least one additional session).
- **Primary metric:** Free → Pro 30-day conversion.
- **MDE:** 25% relative lift (8% → 10%).
- **Sample size:** ~2,000 per arm.
- **Duration:** 8–10 weeks.

**Test 3: Dashboard One-Action vs. Multi-Action**

- **Hypothesis:** A dashboard with a single "Today's Action" card above the fold increases D7 retention by ≥15% compared to the current multi-option dashboard.
- **Control:** Current dashboard with all features visible.
- **Variant:** One-Action dashboard (Score Widget → Today's Action → Quick Stats, all else below fold).
- **Primary metric:** D1→D7 retention.
- **MDE:** 15% relative lift (40% → 46%).
- **Sample size:** ~600 per arm.
- **Duration:** 4–6 weeks.

**Test 4: Heatmap Progressive Disclosure for Low Scores**

- **Hypothesis:** For students with >60% red/unexplored nodes, showing only the top 3 "Start Here" topics (instead of the full map) increases heatmap → session start conversion by ≥20%.
- **Control:** Full heatmap grid for all users.
- **Variant:** For users with >60% red/unexplored, show "Your 3 Priority Topics" card above the full map.
- **Primary metric:** Heatmap → session start conversion.
- **MDE:** 20% relative lift.
- **Sample size:** ~500 per arm (segment: users with >60% red/unexplored).
- **Duration:** 6–8 weeks.

**Test 5: Annual Price Anchoring**

- **Hypothesis:** Showing the annual price first (₱1,499/year, save 58%) with monthly as secondary increases average revenue per converting user by ≥15%.
- **Control:** Monthly price shown first.
- **Variant:** Annual price shown first with savings callout, monthly as toggle option.
- **Primary metric:** Revenue per converting user.
- **Secondary metric:** Overall conversion rate (ensure it doesn't drop).
- **MDE:** 15% lift in ARPU.
- **Sample size:** ~400 converting users.
- **Duration:** 10–12 weeks.

---

## 6. A/B TEST PLAYBOOK

### Implementation Architecture

All A/B tests use a lightweight feature flag system stored in Supabase:

```typescript
// src/lib/experiments.ts
interface Experiment {
  id: string
  name: string
  variants: string[]
  allocation: Record<string, number>  // variant → percentage
  active: boolean
}

// Variant assignment: hash(userId + experimentId) % 100
// Deterministic — same user always sees same variant
// Stored in user_experiments table for analytics joins
```

### Test Execution Protocol

1. **Pre-launch (1 day):** Create experiment row in Supabase. Add feature flag check in relevant component. Deploy variant code behind flag (off by default). QA both variants on staging.

2. **Launch:** Flip flag to active. Verify events are firing in analytics.

3. **Monitoring (weekly):** Check for sample ratio mismatch (SRM). Monitor guardrail metrics (session completion rate must not drop >5% in any variant). Check for novelty effects after week 1.

4. **Decision (at target sample size):** If primary metric shows statistically significant lift at p<0.05: ship variant, remove flag. If no significant difference: ship whichever is simpler (less code debt). If significant negative: kill variant, document learning.

---

## 7. APPENDIX: PHILIPPINE CONTEXT NOTES

### Device Constraints

The median SlateCamp user is on a mid-range Android device:
- **Models:** Realme C-series, Samsung Galaxy A series, Xiaomi Redmi
- **Display:** 6–6.5 inches, 720p or 1080p
- **RAM:** 3–4 GB
- **Storage:** 64–128 GB
- **Connection:** 4G LTE (median download: 15–25 Mbps, but highly variable in provinces; indoor/campus WiFi often slower than LTE)

**Design implications:**
- Skeleton loading on all data-fetching screens (never blank white screens)
- Images: lazy-load, WebP format, max 200KB per image
- Primary CTAs in bottom 40% of screen (thumb zone for right-handed, 6" screen)
- Touch targets: minimum 44×44px, enforced via `@media (pointer: coarse)`
- `font-display: swap` on all custom fonts to prevent FOIT
- The ~200KB shader gradient (`@shadergradient/react`) must be removed — it loads a full Three.js shader pipeline for a decorative effect on a single component

### Connectivity Assumptions

- **Do not assume stable WiFi.** Many students study on mobile data, often in transit (jeepney, MRT, bus).
- **Session persistence is critical.** The existing localStorage + server auto-save with reconnection queue is well-designed (Audit §10). Maintain this pattern in all new interactive components.
- **Progressive rendering:** Discipline-level heatmap data should render first (fast), topic nodes second (can be progressive). Never block the full UI on a complete data load.
- **Offline consideration:** At minimum, last-viewed Trail day and Heatmap should be cached. PWA manifest is a Tier 3 priority (Audit §13) but should be designed-for now.

### Cultural Design Considerations

**Hiya (Shame Culture)**
Filipino students experience heightened shame around academic failure. This is not abstract — retakers often hide their retaker status from batchmates. Design implications:
- No public leaderboards. Ever. (Forbidden Patterns list)
- Score sharing is opt-in and controlled — the student chooses what to share
- Retaker-sensitive language: "Topics to revisit" not "Failed topics"
- The Blindspot Protocol surfaces neglected nodes with factual, neutral framing
- Study Pod activity shows blurred score ranges ("in the 60s"), never exact scores

**Social Proof Weight**
Filipino students weight peer endorsement extremely heavily. A batchmate's testimonial outperforms any platform statistic. Design implications:
- Paywall social proof must be ALE-specific, from real passers, with school names
- Campfire (community) features should surface passer stories prominently
- "3 campers from your school are studying today" > "10,000 students use SlateCamp"
- The Passer Effect (post-exam celebration + shareable "SlateCamp Certified ALE Passer" image) is a growth mechanism, not a decoration

**GCash Payment Patterns**
GCash is the #1 mobile payment method in the Philippines. Many students don't have credit cards. Design implications:
- GCash must appear as a primary payment option, not buried under "Other methods"
- Trust signals on the paywall must mention GCash by name
- Payment flow should support GCash's redirect-based checkout without confusion
- Price points should be GCash-friendly (round numbers in PHP)

**Study Time Patterns**
Filipino architecture students commonly study late at night (9 PM – 1 AM), after daytime classes or work. Design implications:
- Dark mode is not optional — design all core screens in both modes
- Evening notification timing for study reminders (not morning)
- Session length options should include 25–30 minute "short session" for late-night studying
- Eye strain consideration: avoid bright backgrounds and high-contrast flashes during score reveals

---

*Plan generated 2026-03-25. All findings reference the GLOBAL-CODEBASE-AUDIT-REPORT.md dated 2026-03-25. File paths are relative to the SlateCamp project root. Every recommendation is grounded in SlateCamp's design system constraints, the four research-validated personas, and measurable funnel metrics.*

