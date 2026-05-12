# SlateCamp Design System Implementation — Dashboard & All App Pages
## Bring the Landing Page's Visual DNA Into the Product

---

## ROLE

You are a Design Systems Engineer and Next.js Architect. You implement design tokens systematically across a codebase — not by redesigning pages, but by upgrading their visual language to match an established design direction. You also think like an educational psychologist: the dashboard and testing interfaces are HIGH COGNITIVE LOAD environments where the design must CREATE CALM, not compete for attention. The landing page can be expressive and editorial. The app must be functional and serene — using the SAME tokens at lower intensity.

---

## THE CORE INSIGHT

The SlateCamp landing page at `localhost:3000` already embodies the definitive design direction:
- **Cobalt Blue `#1B3FC4`** as the primary action color
- **Syne** (800 weight) for expressive headings
- **DM Mono** (uppercase, wide tracking) for category labels and eyebrows
- **Inter** for all functional text
- **Instrument Serif** (italic) for rare editorial moments
- **Signal Gold `#F5A623`**, **Signal Red `#E63329`**, **Signal Green `#1B7A3C`** as semantic accents
- **Cream `#F2F0EB`** and **Warm White `#F8F7F5`** as surface colors

But the dashboard pages (currently audited live at localhost:3000/dashboard) use **Inter for everything** — no Syne headings, no DM Mono labels, no editorial personality. The pages function correctly but look generic. The gap: the landing page says "premium, editorial, designed" while the app says "standard SaaS dashboard."

**The task: bring the landing page's typographic personality and color system into every dashboard page — but at REDUCED INTENSITY appropriate for a study tool.**

---

## THE INTENSITY SCALE — LANDING PAGE vs APP

This is the most critical concept. The landing page is MARKETING (sell). The app is a TOOL (use). Same tokens, different volume.

| Property | Landing Page (Marketing) | App / Dashboard (Tool) |
|---|---|---|
| Syne headings | 34-90px, 800 weight, tight tracking | 18-24px, 800 weight, used on PAGE-LEVEL titles only |
| DM Mono labels | 9-11px, common, very editorial | 11px minimum, used on SECTION eyebrows and metadata only |
| Stat numbers (Syne) | 56-72px, dramatic | 32-48px, confident but not shouting |
| Gold sections (#F5A623) | Full background, signature moment | NEVER as section bg in the app. Gold only as small accents (tags, highlights, progress indicators) |
| Dark sections (#111111) | Full background, cinematic | NEVER in the app. Dark mode is a separate concern. |
| Animations | 400ms scroll reveals, dramatic | 150-200ms micro-transitions only, subtle |
| Noise/grain texture | On hero compositions | NEVER in the app. Clean surfaces for readability. |
| Background rhythm | white → cream → dark → gold | white → cream → white → cream (gentle alternation only) |

### The Cognitive Load Rule
**Every visual flourish in the app must pass this test: "Does this help the student FOCUS, or does it DISTRACT?"**

- Syne on a page heading → FOCUS (clear hierarchy, "I know where I am")
- Syne on every card title → DISTRACT (too much personality, exhausting to scan)
- DM Mono on a section eyebrow → FOCUS (clear category signal)
- DM Mono on body text → DISTRACT (hard to read, slows comprehension)
- Cobalt active states → FOCUS (clear interactive feedback)
- Gold accent on a tag → FOCUS (draws eye to important status)
- Gold section background → DISTRACT (too much visual energy in a study context)

---

## WHAT TO CHANGE (Surgical, Not Redesign)

### The 8 Changes Across All Dashboard Pages

These changes apply to EVERY page under `/dashboard/*`: dashboard home, wiki, testing, notes, 3d-lab, analytics, settings.

---

### CHANGE 1: Page Titles → Syne

Every page has a top-level heading (H1) rendered in Inter. Change to Syne 800 weight.

**Current (audited):**
```
Dashboard page:  H1 "Dashboard" — Inter, 20px, weight 600
Wiki page:       H1 "Wiki" / "Knowledge Wiki" — Inter, 20px, weight 600-700
Testing page:    H1 "Testing" — Inter, 20px, weight 600
Notes page:      H1 "Notes" — Inter, 20px, weight 600
Analytics page:  H1 "Analytics" — Inter (assumed)
Settings page:   H1 "Settings" — Inter (assumed)
```

**After:**
```
All page H1s: Syne, 22-24px, weight 800, tracking -0.02em, color #1A2332
```

**How to implement:** Find the shared page header component (likely in a layout file or shared `PageHeader` component). Change the font-family to Syne. If there's no shared component, grep for the heading pattern in each page.tsx and update.

```tsx
// Target class change:
// FROM: text-xl font-semibold   (Inter inherits)
// TO:   text-2xl font-extrabold font-[family-name:var(--font-syne)] tracking-tight
```

**Cognitive load justification:** Page titles are landmarks. Syne at 22-24px says "this is where you are" without being overwhelming. It creates the same editorial feel as the landing page at 30% of the intensity.

---

### CHANGE 2: Zone/Section Headings → Syne

On the Testing page, zone headings ("Zone 01: Foundations", "Zone 02: Deliberate Practice", "Zone 03: Exam Readiness") and on the Dashboard, section groupings ("Recent Activity", "Study Activity") should use Syne.

**After:**
```
Section H2s: Syne, 16-18px, weight 800, color #1A2332
```

**But NOT card titles inside sections.** Card titles (like "Camp Mode", "Storm Mode", "Chill Mode") stay Inter 14-15px semibold. The hierarchy is:

```
Page title (Syne 22px 800) → Section heading (Syne 16-18px 800) → Card title (Inter 15px 600) → Card body (Inter 14px 400)
```

---

### CHANGE 3: Section Eyebrows → DM Mono Uppercase

Add DM Mono eyebrow labels above section headings throughout the app. This is the editorial signal that makes the landing page feel designed.

**Where to add:**
```
Dashboard:
  "Suggested" above the resume card
  "Recent" above Recent Activity
  "Consistency" above Study Activity heatmap

Testing:
  "Zone 01 · Foundations" (already exists as text — restyle to DM Mono)
  "Zone 02 · Deliberate Practice"
  "Zone 03 · Exam Readiness"

Wiki:
  Subject category labels above article groups

Analytics:
  "Readiness" above the score
  "Subjects" above the heatmap
  "History" above session history

Notes:
  "Folders" label (already exists — ensure DM Mono)
  "By Source" label (already exists — ensure DM Mono)
```

**Style:**
```css
/* Eyebrow label */
.eyebrow {
  font-family: var(--font-mono); /* DM Mono */
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #6B6B6B; /* Ink Light */
}
```

**Cognitive load justification:** DM Mono uppercase at 11px is a WAYFINDING system. It tells the student's peripheral vision "this is a new section" without demanding conscious attention. It's organizational, not decorative.

---

### CHANGE 4: Readiness Score → Syne + Dynamic Color

The Readiness Score number (wherever it appears — dashboard, analytics, session summary) should use Syne at large size with dynamic color.

**After:**
```
Score number: Syne, 48px, weight 800, tracking -0.02em
Color:
  ≥ 70%: Signal Green #1B7A3C
  40-69%: Camp Orange #E8853A
  < 40%: Signal Red #E63329
Context line: Inter, 14px, weight 400, color #555555
```

---

### CHANGE 5: Stat Numbers → Syne Throughout

Any prominent statistic (questions answered, topics mastered, days active, session scores) uses Syne for the NUMBER, Inter for the label.

**Pattern:**
```tsx
<div>
  <span className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-[#1A2332]">
    847
  </span>
  <span className="text-sm text-[#6B6B6B]">
    questions answered
  </span>
</div>
```

---

### CHANGE 6: Testing Mode Cards → Consistent Card System

The testing page mode cards (Camp Mode, Storm Mode, etc.) currently use inconsistent styling. Standardize:

**Card pattern:**
```css
/* Mode card */
background: white;
border: 1px solid #E8E4DC;
border-radius: 8px;          /* not 12px, not 6px — 8px is the app card standard */
padding: 20px;
box-shadow: none;             /* no shadow at rest */
transition: box-shadow 150ms ease-out, border-color 150ms ease-out;

/* Card hover */
box-shadow: 0 1px 3px rgba(0,0,0,0.06);
border-color: rgba(27, 63, 196, 0.2);  /* Cobalt at 20% */
```

**Card title:** Inter, 15px, weight 600, color #1A2332
**Card body:** Inter, 14px, weight 400, color #555555, line-height 1.6
**Card CTA button:** Cobalt Blue bg, white text, 6px radius, Inter 13-14px weight 500

---

### CHANGE 7: Button Radius Normalization

Audited: Testing page buttons currently use `border-radius: 8px`. Design system spec says buttons = 6px (`rounded-md`), cards = 8px (`rounded-lg`).

**Find all button components and ensure:**
```css
/* Primary button */
border-radius: 6px;  /* NOT 8px — buttons are tighter than cards */
```

Grep for button components in shadcn config or shared Button component and update the default radius.

---

### CHANGE 8: Quiz Interface — Educational Calm

When a student starts a quiz and enters the active quizzing view, the interface must REDUCE visual noise, not increase it.

**Quiz-active-state rules:**
- Background: `#F5F7FA` (cool surface — research shows cool tones improve focus on cognitive tasks)
- NO Syne headings inside the quiz. All text is Inter. The quiz is about the QUESTION, not the branding.
- NO DM Mono eyebrows inside the quiz. Clean, functional.
- Progress bar: thin (4-6px), Cobalt Blue fill, cream track, smooth width transition
- Timer (if shown): Inter, 14px, weight 500, color #555555. NOT Syne. NOT red. Never anxiety-inducing.
- Option buttons: white bg, 1px border #E8E4DC, 8px radius, min-height 48px (touch target). Selected: Cobalt Light bg (#EEF2FC), Cobalt border. NO shadow on options.
- Question text: Inter, 16px, weight 400, color #1A2332, line-height 1.7, max-width 640px
- Navigation buttons: "Previous" (ghost, border), "Next" (Cobalt filled). Always in the same position.

**Cognitive load justification:** The quiz is the highest-stakes moment in the app. EVERY design element competes with the student's working memory. The quiz interface should be the PLAINEST, CLEANEST, most INVISIBLE screen in the entire product. The landing page can shout. The quiz must whisper.

---

## TOKEN REFERENCE (Keep This Open While Working)

```
PRIMARY
  Cobalt:        #1B3FC4   (buttons, links, active states)
  Cobalt Light:  #EEF2FC   (active backgrounds, hover tints)
  Cobalt Dark:   #1535A8   (button hover)

ACCENT
  Signal Gold:   #F5A623   (warm highlights — tags, small accents ONLY in app)
  Signal Red:    #E63329   (low readiness, errors, incorrect — always + context)
  Signal Green:  #1B7A3C   (mastered, correct, passing)
  Camp Orange:   #E8853A   (developing, mid-readiness, progress)

NEUTRAL
  Cream:         #F2F0EB   (alt section bg, sidebar, warm surfaces)
  Cream Warm:    #F8F7F5   (page body bg)
  White:         #FFFFFF   (cards, modals, inputs)
  Border:        #E8E4DC   (card borders, dividers — warm, not cold gray)

INK
  Ink:           #1A2332   (primary text, headings)
  Ink Mid:       #555555   (secondary text, descriptions)
  Ink Light:     #6B6B6B   (tertiary, eyebrow labels)
  Ink Muted:     #888888   (timestamps, metadata, placeholders)

FONTS
  Syne 800:      Page titles, section headings, stat numbers
  Inter 400-600: Body text, card titles, buttons, inputs, navigation
  DM Mono 500:   Eyebrow labels, metadata tags (11px, uppercase, tracked)
```

---

## PHASED EXECUTION

### PHASE 1: Audit Current State
Read every dashboard page file. Map:
- All heading elements and their current font/size/weight
- All section labels and their styling
- All button radius values
- All stat number displays
- The shared layout, header, and sidebar components

Output a table: `| Page | Element | Current Style | Target Style |`

**STOP.** "Phase 1 Complete."

### PHASE 2: Typography Upgrade
Apply changes 1-5:
- Page H1s → Syne
- Section H2s → Syne
- Add DM Mono eyebrows where missing
- Readiness Score → Syne + dynamic color
- Stat numbers → Syne

**STOP.** "Phase 2 Complete."

### PHASE 3: Component Polish
Apply changes 6-7:
- Standardize card styles
- Normalize button radii (6px buttons, 8px cards)
- Ensure all borders use #E8E4DC
- Ensure consistent hover states (Cobalt tint)

**STOP.** "Phase 3 Complete."

### PHASE 4: Quiz Interface
Apply change 8:
- Cool background #F5F7FA
- ALL Inter inside quiz (no Syne, no DM Mono)
- Clean option buttons with Cobalt selected state
- Proper touch targets (48px min)
- Smooth, subtle transitions only

**STOP.** "Phase 4 Complete."

### PHASE 5: Cross-Page Audit
Visit every page and verify:
- [ ] Page title uses Syne
- [ ] Section headings use Syne
- [ ] Eyebrow labels use DM Mono uppercase
- [ ] Stat numbers use Syne
- [ ] All buttons are 6px radius
- [ ] All cards are 8px radius
- [ ] All borders are #E8E4DC
- [ ] Active nav uses Cobalt Light bg + Cobalt text
- [ ] Page background is #F8F7F5
- [ ] Quiz interface is the calmest screen (all Inter, cool bg, no editorial flourishes)
- [ ] No font below 11px (except DM Mono 9px ONLY in the floating feature ticker if it exists in the app)
- [ ] No gold section backgrounds in the app
- [ ] No dark section backgrounds in the app (unless dark mode)

**STOP.** "Phase 5 Complete. Design system implemented across all pages."

---

## THE HIERARCHY OF CALM

From MOST expressive to LEAST expressive:

```
LANDING PAGE    ████████████████  Full editorial: Syne 90px, gold sections,
                                  dark sections, scroll animations, grain texture

DASHBOARD HOME  ████████████░░░░  Syne page title + section heads, DM Mono labels,
                                  stat numbers in Syne, warm alternating surfaces

WIKI / NOTES    ██████████░░░░░░  Syne page title, DM Mono category labels,
                                  content in Inter, clean reading surfaces

TESTING MENU    ████████████░░░░  Syne page title + zone headings,
                                  mode cards in Inter, clear CTA hierarchy

ANALYTICS       ████████████░░░░  Syne score + stat numbers, DM Mono labels,
                                  charts are clean Inter + system colors

ACTIVE QUIZ     ██████░░░░░░░░░░  ALL INTER. Cool bg. Maximum calm.
                                  The interface disappears. Only the question exists.

SETTINGS        ████░░░░░░░░░░░░  Plain Inter everything. Syne page title only.
                                  This is a utility page, not a brand page.
```

The student's experience should feel like: walking into a beautifully designed study space (dashboard), settling into their workspace (wiki/testing menu), then entering deep focus (active quiz) where all visual personality recedes and only the content remains.

---

## FINAL REMINDERS

1. **SYNE IS FOR LANDMARKS, NOT EVERYTHING.** Page titles and section headings only. If you put Syne on card titles, body text, or buttons, you've broken the hierarchy.

2. **DM MONO IS FOR CATEGORIES, NOT PROSE.** 11px uppercase with tracking. If you put DM Mono on descriptions or body text, you've made it unreadable.

3. **THE QUIZ MUST BE THE CALMEST SCREEN.** No editorial typography. No warm accents. Cool background. All Inter. The interface must be invisible so the student's entire working memory is available for the question.

4. **NO GOLD OR DARK SECTION BACKGROUNDS IN THE APP.** Those are landing page signatures. In the app, use cream (#F2F0EB) for alternating sections and white for cards. The app is a library, not a magazine.

5. **SURGICAL EDITS.** You're changing font families, sizes, and weights on specific elements. You're NOT redesigning layouts, NOT moving components, NOT changing functionality. Text content stays. Layouts stay. Data flow stays. Only the visual tokens change.

---

*Execute Phase 1 now. Audit every dashboard page.*
