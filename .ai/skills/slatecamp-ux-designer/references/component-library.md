# SlateCamp Component Library

## Design Tokens Reference

### Colors (CSS Variables)
```css
:root {
  /* Brand */
  --color-slate-blue: #1E3A5F;
  --color-slate-blue-light: #2C5282;
  --color-slate-blue-dark: #1A3050;

  /* Mastery / Heatmap */
  --color-zone-red: #E74C3C;
  --color-zone-amber: #F5A623;
  --color-zone-green: #2ECC71;
  --color-zone-strong: #1E3A5F;
  --color-zone-grey: #BDC3C7;   /* unexplored */

  /* Semantic */
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-error: #E74C3C;
  --color-info: #2980B9;

  /* Neutrals */
  --color-bg: #F8F9FA;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #1A1A2E;
  --color-text-secondary: #4A5568;
  --color-text-muted: #718096;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0F1729;
    --color-surface: #1A2744;
    --color-border: #2D3748;
    --color-text-primary: #F7FAFC;
    --color-text-secondary: #CBD5E0;
    --color-text-muted: #718096;
  }
}
```

---

## Component Specifications

### ReadinessScoreBadge

**Purpose:** Displays the current Readiness Score with zone color. Used on Dashboard, Score Reveal, and Profile.

**Props:**
```typescript
interface ReadinessScoreBadgeProps {
  score: number;                    // 0–100
  showTrend?: boolean;              // Show ▲/▼ delta vs last snapshot
  trendValue?: number;              // +/- delta points
  size: 'large' | 'medium' | 'small';  // large: 80px | medium: 48px | small: 32px
  showLabel?: boolean;              // Show zone label (e.g., "Green Zone")
}
```

**Zone derivation:**
```typescript
function getZone(score: number) {
  if (score < 50) return { label: 'Red Zone', color: 'var(--color-zone-red)' };
  if (score < 70) return { label: 'Amber Zone', color: 'var(--color-zone-amber)' };
  if (score < 85) return { label: 'Green Zone', color: 'var(--color-zone-green)' };
  return { label: 'Strong Zone', color: 'var(--color-zone-strong)' };
}
```

**States:**
- Default: Score number, zone color, optional label
- Loading: Skeleton circle
- Error: "—" with grey color, tooltip "Score unavailable"
- First-time (no sessions): "Complete orientation to get your score"

**Accessibility:**
```html
<div
  role="meter"
  aria-valuenow={score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`Readiness Score: ${score} out of 100. ${zone.label}.`}
>
```

---

### HeatmapNode

**Purpose:** Individual topic node in the Taxonomy Heatmap. Displays mastery state via color + shape.

**Props:**
```typescript
interface HeatmapNodeProps {
  topicId: string;
  topicName: string;
  masteryWeight: number | null;    // null = unexplored (grey)
  totalAttempts: number;
  onTap: (topicId: string) => void;
}
```

**Derived state:**
```typescript
function getNodeState(masteryWeight: number | null, attempts: number) {
  if (masteryWeight === null || attempts < 5) return 'unexplored';
  if (masteryWeight < 0.4) return 'red';
  if (masteryWeight < 0.75) return 'amber';
  return 'green';
}

const nodeVisuals = {
  unexplored: { color: 'var(--color-zone-grey)', border: '2px dashed', label: 'Not yet explored' },
  red: { color: 'var(--color-zone-red)', border: 'none', pulse: true, label: 'Needs work' },
  amber: { color: 'var(--color-zone-amber)', border: 'none', label: 'Developing' },
  green: { color: 'var(--color-zone-green)', border: 'none', label: 'Strong' },
};
```

**Accessibility:**
```html
<button
  aria-label={`${topicName}: ${nodeVisuals[state].label}. Tap to study this topic.`}
  style="min-width: 44px; min-height: 44px;"
>
```

**Animation:**
- Red nodes only: `animation: pulse 2s ease-in-out infinite;` — 8% scale pulse, subtle
- Do NOT animate green or amber nodes — visual noise

---

### CampTrailDayCard

**Purpose:** Represents a single day on the Camp Trail. Shows status and primary action.

**Props:**
```typescript
interface CampTrailDayCardProps {
  dayNumber: number;
  title: string;
  estimatedMinutes: number;
  sessionCount: number;
  questionCount: number;
  topics: string[];
  status: 'completed' | 'current' | 'upcoming' | 'missed';
  onStart: () => void;
  onPreview: () => void;
}
```

**Visual variants by status:**
```
completed  → Green left border, ✓ icon, grey text (de-emphasized)
current    → Slate Blue left border, bold title, full-size card, primary CTA visible
upcoming   → No border, muted text, reduced opacity (0.6)
missed     → Amber left border, "Missed" label, "Pick up here" CTA
```

**Size:**
- Current day card: full-width, padding 20px, shadow elevated
- Non-current days: compact (48px height in list mode)

---

### QuizAnswerOption

**Purpose:** Selectable answer choice in Camp Mode and Storm Mode quiz.

**Props:**
```typescript
interface QuizAnswerOptionProps {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  state: 'unselected' | 'selected' | 'correct' | 'incorrect' | 'revealed-correct';
  onSelect: () => void;
  disabled: boolean;
}
```

**Visual states:**
```
unselected      → White bg, grey border, full text
selected        → Slate Blue bg (light tint), Slate Blue border
correct         → Green bg (light tint), Green border, ✓ icon
incorrect       → Red bg (light tint), Red border, ✗ icon
revealed-correct → Green bg after wrong answer revealed
```

**Interaction rules:**
- Tap = select. No confirmation needed.
- After confirm: all options become `disabled`. Correct/incorrect revealed simultaneously.
- Long text: options wrap to multiple lines. Never truncate answer text.
- Min height: 48px (scales with content)

**Accessibility:**
```html
<button
  role="radio"
  aria-checked={state === 'selected'}
  aria-label={`Option ${label}: ${text}`}
>
```

---

### PaywallModal

**Purpose:** Free-to-Pro conversion screen. Shown after score reveal or feature gate.

**Trigger rules (non-negotiable):**
1. ALWAYS shown after score reveal for free users — never before
2. Shown when free user tries to access a Pro feature
3. Never shown more than once per 24-hour session (frequency cap)

**States:**
```
Monthly view   → ₱299/month pricing
Annual view    → ₱1,499/year (₱125/month, Save 58%)
Processing     → Skeleton loader, disabled CTA
Success        → Green confirmation, auto-dismiss after 3s
Error          → Error message, retry CTA
```

**Mandatory elements (never remove):**
- "Not yet — continue free" tertiary text link, always visible
- GCash in payment method list
- One social proof quote, ALE-specific, with real exam result

---

### EmptyState

**Purpose:** Shown when a screen has no data. Must always contain a clear next action.

**Props:**
```typescript
interface EmptyStateProps {
  context: 'heatmap-new' | 'trail-not-enrolled' | 'campfire-empty' | 'sessions-none';
  onAction: () => void;
}
```

**Context-specific copy + action:**
```
heatmap-new:
  Icon: Map outline
  Title: "Your map is blank — for now."
  Body: "Take the orientation quiz to see where you stand across all 20 disciplines."
  CTA: "Take Orientation Quiz"

trail-not-enrolled:
  Icon: Trail path
  Title: "Your trail hasn't started yet."
  Body: "The Camp Trail builds a day-by-day plan around your exam date and weak spots."
  CTA: "Set Up My Trail"

campfire-empty:
  Icon: Campfire
  Title: "The Campfire is quiet."
  Body: "Passers and reviewees share their journeys here. Check back as the community grows."
  CTA: "Back to Trail"

sessions-none:
  Icon: Play circle
  Title: "No sessions yet."
  Body: "Your first session builds the foundation for everything that follows."
  CTA: "Start First Session"
```

**Design rules:**
- Empty state illustration: simple, single-color SVG icon — NOT a complex hero illustration
- Copy: honest and warm, not corporate ("No data available" is banned)
- CTA: always one, always the clearest next action in the product

---

## Animation Standards

**What gets animated (and why):**
```
Readiness Score counter    → Counts up from 0 to score on reveal (700ms, ease-out)
Heatmap node color change  → Fade between states over 500ms
Trail day completion        → Checkmark draw animation (400ms)
Session completion screen  → Accuracy bar fills in (600ms, ease-in-out)
Score change notification   → Subtle pop (scale 1.0 → 1.04 → 1.0, 300ms)
```

**What NEVER gets animated:**
- Answer selection (must feel instant)
- Navigation transitions (system-default only, no custom nav animations)
- Notifications (fade in only, no bounce)
- Anything during a quiz session (zero distraction during work)

**Performance rule:** All animations must use CSS transforms and opacity only. Never animate width, height, top, left, or margin (causes layout thrashing on mid-range Android).

```css
/* Correct */
transform: scale(1.04);
opacity: 0;

/* Never */
width: 0 → width: 200px;
margin-top: -20px → margin-top: 0;
```
