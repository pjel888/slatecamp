# SlateCamp "Campfire" Rebrand + Commercial Viability Overhaul
## Single Execution Document — Brand, Testing UX, Premium Features

---

## ROLE

You are simultaneously:

1. **Principal Frontend Architect (React/Next.js)** — Production-grade, type-safe code. App Router patterns. Server vs. Client Components chosen correctly. Surgical edits, never unnecessary rewrites. Tailwind + shadcn/ui idiomatically.

2. **Design Systems Engineer** — A rebrand is a cascading token update, not "change some colors." Define tokens first, update components that consume them, verify every page. Zero tolerance for inconsistency.

3. **EdTech Product Strategist** — Educational quality alone doesn't make a product commercially viable. Duolingo converts 3% of free users into $300M+ revenue — not because content is best, but because the EXPERIENCE is polished, addictive, and makes the paid tier feel inevitable. Every feature passes two tests: "Does this help the student pass?" AND "Does this make them feel like they're using something worth paying for?"

4. **Sound UX Engineer** — Web Audio API synthesized tones. Asymmetric feedback: sound on correct, silence on incorrect. Zero bundle impact. No audio files.

5. **Educational Psychologist & Behavioral Analyst** — Cognitive Load Theory (Sweller), Flow State (Csikszentmihalyi), Test Anxiety Mitigation (Zeidner), Desirable Difficulties (Bjork), Ostrich Effect (Karlsson), BJ Fogg B=MAP, Self-Determination Theory (Deci & Ryan). Every design decision mapped to research.

---

## THE BRAND EVOLUTION (Read This First — It Governs Everything)

### Archetype Shift
**Old:** "Strict-but-caring mentor" — authority through vocal strictness, warmth secondary.
**New:** "Confident companion" — authority through demonstrated COMPETENCE (data, score, verified content), warmth is the primary register. Like a senior student who already passed the exam and genuinely wants you to pass too.

### "Camp" Reframe
**Not** boot camp. **IS** summer camp / base camp — a communal, growth-oriented space you CHOOSE to go because you want to get better. Supportive, not punitive. Intensive but not intimidating.

### Voice Ratio
**Old:** 30% warm / 70% authoritative → **New:** 65% warm / 35% authoritative

### The "Campfire" Color Palette

Research basis: Cool colors (blue) improve cognitive performance on high-load tasks — Columbia University found blue environments reduce stress and sharpen focus. Pepperdine (2024) confirmed warm colors hinder performance on difficult cognitive tasks. BUT warm colors drive emotional engagement (University of Texas: orange enhances comfort, decreases anxiety). Solution: cool base for working surfaces + warm accents for emotional moments.

```
PRIMARY COLORS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slate Blue      #3B6B9C   Primary actions, navigation, links, buttons
Camp Orange     #E8853A   Progress, celebration, warm CTAs (sparingly)
Emerald         #2D9F6F   Success, mastery, correct answers

SEMANTIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Warm Red        #D64545   Errors, critical gaps (ALWAYS with constructive context)
Amber           #D4951A   Warnings, developing states
Info Blue       #3B82C8   Informational callouts

SURFACES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Surface Light   #F8F7F5   Page background (warm white, NOT cold #F5F5F7)
Surface Card    #FFFFFF   Cards, elevated surfaces
Surface Focused #F5F7FA   Testing interface ONLY (cool blue-white for focus)

INK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ink Primary     #1A2332   Main text (dark blue-black, NOT pure black)
Ink Secondary   #4A5568   Supporting text
Ink Tertiary    #8896A7   Muted text, metadata

BORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Border Default  #D4DAE3   Borders, dividers
Border Warm     rgba(232,133,58,0.15)  Active/highlighted cards
```

### Color Application Rules
1. **Two backgrounds only:** Surface Light (#F8F7F5) for pages, Surface Card (#FFFFFF) for cards. Surface Focused (#F5F7FA) for testing only.
2. **Orange is the reward.** Camp Orange appears sparingly — progress moments, high scores, active CTAs. If orange is everywhere, nothing feels special.
3. **Blue does the work.** Slate Blue for buttons, links, active states, navigation.
4. **Green is earned.** Emerald only appears on genuinely correct answers, mastered nodes, high scores. Never decorative.
5. **Red is never alone.** Always paired with constructive context. Never punitive.

### Typography
Font: **Inter** (unchanged — excellent). Scale:

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | 32px | 700 | Hero headings, landing |
| Title | 24px | 700 | Page titles |
| Heading | 18px | 600 | Card titles, section headers |
| Subheading | 16px | 600 | Labels, group headers |
| Body | 15px | 400 | Reading text, descriptions |
| Body Small | 14px | 400 | Secondary text |
| Caption | 12px | 500 | Metadata, timestamps |
| Overline | 11px | 600 | Category labels (uppercase, tracked) |

**MINIMUM 11px.** Nothing below 11px anywhere. The old 9px/10px monospace labels are gone.
**Monospace ONLY for:** code snippets, data values, Readiness Score number. NOT for labels, categories, or metadata.

### Spacing, Shadows, Radii, Transitions
- **Spacing:** 4px base, 8px primary grid. More generous than old system.
- **Shadow at rest:** `shadow-none`. Hover: `shadow-sm`. Dropdowns: `shadow-md`. Modals: `shadow-lg`. No shadow-xl+.
- **Radius:** `rounded-md` (8px) cards, `rounded-sm` (6px) buttons/inputs. FORBIDDEN: rounded-xl, rounded-2xl+.
- **Transitions:** Max 300ms. Default 150ms ease-out. NO bounce, spring, overshoot, or >300ms.

### Engagement Mechanics Policy (Updated)
An engagement mechanic is permitted if it passes ALL THREE:
1. **Outcome-tied:** Directly improves likelihood of passing the exam
2. **Factual:** Based on real data, no artificial scarcity or manufactured urgency
3. **Warm-framed:** Acknowledgment of real progress, not reward for compliance

**PASSES:** Study consistency tracking, correct-answer audio, Readiness Score deltas, taxonomy node color changes, session summary with recommendation.
**FAILS:** Confetti, badges, virtual currency, social leaderboards, streak-as-punishment, countdown timers on study prompts.

### Voice Guide

| Context | Example |
|---|---|
| First login | "Welcome to SlateCamp. Let's take a quick diagnostic to see where you're starting — then we'll build your study plan from there." |
| Low score (< 40%) | "38% — and that's totally normal at this stage. Your plan this week: three focused sessions on [subjects]. That's where the fastest gains are." |
| Correct answer | Audio tone + "Correct. The minimum riser height is 200mm per PD 1096 IRR Rule VIII §804. You've got this one locked." |
| Wrong answer | SILENCE + "Not quite — the answer is B (200mm). Here's why this trips people up: [explanation]. You'll see this again so it sticks." |
| High score (≥ 85%) | "91%. You've put in the work, and the data shows it. You're ready." |
| Returning after break | "Welcome back. Let's see where things stand with a quick warm-up." |
| Consistency milestone | "12 days of consistent study. That compounds." |

**Words we use:** journey, progress, growth, foundation, study session, area to revisit, starting point, consistent study, the data shows
**Words we NEVER use:** dominate, conquer, drill, grind, gap, weakness, deficiency, behind, overdue, streak (as pressure), Protocol (in student UI)

**Student-facing renames:**
- Blindspot Protocol → "Focus Review"
- Endurance Cycle → "Extended Practice"
- Proof Simulation → "Full Exam Simulation"

---

## THE COMMERCIAL VIABILITY FRAMEWORK

### Why This Matters
The testing feature works educationally but FEELS like a free tool. No sensory richness, no premium polish. The target: feels like a $30/month product. Students SHOW it to study groups, those groups sign up.

### SlateCamp's Unique Premium Differentiators (No Competitor Has These)
1. **Image/diagram questions** — architecture is VISUAL. Text-only questions are absurd.
2. **Inline 3D model viewer during quizzes** — see the structure being asked about without leaving the quiz.
3. **Asymmetric audio feedback** — behavioral psychology-grounded sound design.
4. **Code-cited explanations** — exact PD 1096 section reference on every answer.
5. **Pacing Quadrant analytics** — no other ALE reviewer has this.

### Freemium Gate Structure

| Feature | Free Tier | Premium Tier | Conversion Trigger |
|---|---|---|---|
| Basic quizzing | ✅ (limited attempts) | ✅ Unlimited | Habit → limit feels restrictive |
| Image/diagram questions | ❌ Text only | ✅ Rich media | "I NEED visual context for architecture" |
| Audio feedback | ✅ (retention mechanic) | ✅ | Not gated — keeps all users engaged |
| 3D model viewer | ❌ | ✅ Inline 3D | THE killer differentiator |
| Detailed explanations | ❌ (Correct/Incorrect only) | ✅ Full + code citation | "I NEED to know WHY" |
| Session summary | ❌ (score only) | ✅ Full breakdown + recommendation | "I NEED to know what to do next" |
| Progress analytics | Basic | ✅ Pacing Quadrant, Stamina Curve | "I NEED to know HOW I'm studying" |
| AI tutor (Bounded RAG) | ❌ | ✅ Socratic questioning | "Walk me through this wrong answer" |

---

## THE 7 PREMIUM ENHANCEMENTS TO BUILD

### 1. Image & Diagram Support in Questions
- Add `image_url` column to questions table (if missing)
- Render in left column of split-screen layout (question stem area)
- Lightbox on click for detailed viewing
- Lazy-loaded, compressed, skeleton while loading
- Handle questions with and without images gracefully
- **Premium gate:** Free = text only. Premium = image-enhanced.

### 2. Inline 3D Model Viewer
- Questions can have optional `model_id` linking to 3D Lab module
- "View in 3D →" button below question image
- Compact viewer modal (NOT full 3D Lab) with OrbitControls
- Key annotations visible, "Return to Question" closes viewer
- Track: time in viewer, which models viewed (analytics)
- **Premium gate:** Free = static image or "Upgrade to view in 3D." Premium = interactive 3D.

### 3. Asymmetric Audio Feedback System
Implementation (Web Audio API, zero bundle cost):
```typescript
// lib/audio/feedbackSounds.ts
let audioContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioContext;
}

export function playCorrectSound(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playCompletionSound(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = getContext();
  [523.25, 659.25].forEach((freq, i) => { // C5 → E5 two-note
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
    osc.start(ctx.currentTime + i * 0.15);
    osc.stop(ctx.currentTime + i * 0.15 + 0.3);
  });
}
// NO playIncorrectSound — silence IS the feedback
```
- Default ON for practice mode, OFF for timed/exam mode (exam simulation = silent like real ALE)
- Global toggle in settings. Respects system mute.
- **Not gated** — available to all tiers (retention mechanic).

### 4. Micro-Interactions (CSS-Only, No Framer Motion)

| Interaction | Implementation |
|---|---|
| Select option | `transition-all duration-150 ease-out` + `scale-[1.01]` + bg fill slides in |
| Correct reveal | `ring-2 ring-emerald-200` + `shadow-[0_0_12px_rgba(45,159,111,0.15)]` pulse (400ms, 1 cycle) |
| Incorrect reveal | `border-warm-red-300 opacity-80` + simultaneously highlight correct |
| Next question | Left col: opacity 100ms out/in. Right col options: stagger entrance 50ms each |
| Flag toggle | Rotate 15° and back (200ms), color gray → amber |
| Progress bar | `transition-all duration-200 ease-out` on width |
| Submit quiz | 800ms "Calculating results..." with thin progress animation → staggered reveal |

ALL ≤300ms. ALL ease-out enter, ease-in exit. `prefers-reduced-motion` respected — disable all if set.

### 5. Rich Explanation Cards
- Each question has `explanation` + `code_citation` fields
- After answering (practice mode), card slides in below options
- Contains: correct answer, WHY, code citation, Wiki link, 3D model link
- Style: `bg-slate-blue-50 border border-slate-blue-100 rounded-md p-4`
- **Premium gate:** Free = "Correct"/"Incorrect" only. Premium = full explanation.

### 6. Session Summary Card
Post-quiz:
- Score with context ("72% — 4 points above your average")
- Subject breakdown (mini bar segments with Campfire colors)
- Time analysis ("Average 1.2 min/question — on pace for the ALE")
- Weakest area + specific recommendation
- "Start Focused Review →" CTA for weak areas
- Staggered reveal animation
- **Premium gate:** Free = score only. Premium = full breakdown.

### 7. Study Consistency Tracking
- Track consecutive study days as factual metric
- Display subtly: "12 days of consistent study" (growth framing)
- Missed days: "You studied 12 of the last 14 days" (not punitive)
- Feeds into Readiness Score confidence
- **Premium gate:** Basic display free. Premium: streak protection, history, custom goals.

---

## UX RESEARCH MANDATES (From Academic Literature)

These are non-negotiable design constraints from peer-reviewed research:

### Cognitive Load (Sweller, 1988)
- Extraneous load from UI must be near-zero. Remove ALL decorative elements from active test screen.
- Consistent, predictable layouts. ELIMINATE layout shifts between questions.
- EEG data: complex UIs elevate frontal theta power (working memory strain). Simple UIs don't.

### Interface-Induced Stress (Empirical)
- ~30% of students report interface design negatively impacts performance.
- Digital minimalism: strip non-essential elements to cultivate visual calm.
- Strategic whitespace improves readability and reduces oppressive information overload.

### Typography for Neurodivergence
- Sans-serif (Inter ✅). Left-aligned ONLY (never justified — creates "rivers of white").
- Dark charcoal on off-white (NOT pure black on pure white — causes visual stress for Irlen Syndrome/neurodivergent users). Our #1A2332 on #F8F7F5 is research-optimal.
- Generous line-height. Minimum 11px.

### Color Contrast
- WCAG AA minimum, AAA preferred.
- Pure black (#000) on pure white (#FFF) causes visual stress. Softer hues preferred.
- Our palette (#1A2332 on #F8F7F5) passes AAA and avoids glare.

### Touch Targets
- Minimum 24×24 CSS pixels (WCAG 2.2 Criterion 2.5.8). Options in quiz must be large, easy-to-tap.
- 44px minimum for primary interactive elements (Apple HIG).

### Auto-Save (Mandatory)
- Save answers to Supabase on every selection (debounced 500ms) + localStorage as fallback.
- Visible but subtle "Saved ✓" indicator that fades in/out.
- On page load, check for existing session → resume seamlessly.
- Network loss: "Keep working — your answers are saved locally." (calm, not alarming)

### Keyboard Navigation
- Logical tab order matching visual layout.
- No keyboard traps in modals or interactive tools.
- Skip-to-content link as first focusable element.
- Focus indicators visible (WCAG 2.2 Criterion 2.4.11).

---

## TOKEN CONSERVATION RULES

1. **No preambles.** Don't explain what you're about to do. "Auditing tokens..." then results.
2. **Surgical edits.** Find-and-replace, not full file rewrites.
3. **Batch reads.** Read 5-10 files rapidly, then analyze. No paragraphs between each read.
4. **No prompt repetition.** Execute directly.
5. **One-shot writes.** Get components right first time.
6. **Tables for analysis.** Prose only for voice/tone decisions.
7. **Verify after each phase.** Grep to confirm no old tokens remain.

---

## PHASED EXECUTION PLAN

---

### PHASE 1: Full Codebase + Schema Audit

**Objective:** Map EVERYTHING before touching anything.

**1.1 — Design Token Audit**
Read: `tailwind.config.ts`, `globals.css`, theme files, shadcn config, `CLAUDE.md`/`.cursorrules`
Extract ALL current: colors, fonts, shadows, radii, spacing, transitions.
Output a CURRENT → NEW token map table.

**1.2 — Component Inventory**
Read ALL: button variants, card components, forms, nav/sidebar, dashboard, testing/quiz, analytics, modals, toasts, Readiness Score display.

**1.3 — UI String Audit**
Grep for banned words: "dominate", "conquer", "camp now", "drill", "grind", "gap", "weakness", "deficiency", "behind", "overdue", "streak" (as pressure), "Protocol" (in UI), "Blindspot", "Endurance Cycle", "Proof Simulation".

**1.4 — Database Schema Check (Supabase MCP)**
Verify: `questions` table columns (`image_url`?, `explanation`?, `code_citation`?, `model_id`?), user settings table, streak tracking, what needs migration.

**1.5 — Output: Scope Document**
```
## REBRAND SCOPE
| Category | Items | Edits | Risk |
|----------|-------|-------|------|
| Color tokens | ... | ... | Low |
| Typography | ... | ... | Low |
| Components | ... | ... | Medium |
| UI strings | ... | ... | Medium |
| Audio system | NEW | 1 file + wiring | Medium |
| Image support | Schema + components | 3+ files | High |
| CLAUDE.md | 1 file | 1 edit | Low |
```

**STOP.** "Phase 1 Complete. [X] files need changes. Reply 'Proceed'."

---

### PHASE 2: Token Foundation

**Objective:** Update ALL design tokens in ONE pass. After this, the app renders in Campfire.

**2.1 — tailwind.config.ts** — Replace entire color system with Campfire palette (use exact hex values from the Color Palette section above). Include tint shades (50, 100) for each primary color.

**2.2 — globals.css** — Replace CSS variables. Ensure warm white (#F8F7F5) as body background.

**2.3 — Typography** — Replace all `text-[9px]`, `text-[10px]` with `text-[11px]+`. Remove `font-mono` from labels/categories.

**2.4 — Shadows & Radii** — Default `shadow-none` at rest. Remove `rounded-xl`+. Apply `rounded-md` (8px) cards, `rounded-sm` (6px) buttons.

**2.5 — Transitions** — All ≤300ms. Remove bounce/spring. Default `duration-150 ease-out`.

**2.6 — Verify** — Grep for ALL old hex values. List stragglers and fix.

**STOP.** "Phase 2 Complete. Token foundation updated. Reply 'Proceed'."

---

### PHASE 3: Component Personality Update

**Objective:** Every component matches Campfire personality.

**3.1 — Buttons**
- Primary: `bg-[#3B6B9C] hover:brightness-90 text-white rounded-sm`
- Secondary: `bg-transparent border border-[#D4DAE3] text-[#1A2332] hover:bg-[#F8F7F5] rounded-sm`
- Warm CTA (celebration/progress ONLY): `bg-[#E8853A] hover:brightness-90 text-white rounded-sm`
- Danger: `bg-transparent border border-[#D64545] text-[#D64545] rounded-sm`

**3.2 — Cards** — `bg-white border border-[#D4DAE3] rounded-md shadow-none hover:shadow-sm hover:border-[#3B6B9C]/30 transition-all duration-150`

**3.3 — Readiness Score** — 48px font-extrabold, dynamic color (emerald ≥70%, orange 40-69%, red <40%), subtle radial gradient tint at 5% opacity.

**3.4 — Navigation** — Active: `text-[#3B6B9C] bg-[#3B6B9C]/8`. Hover: same at 50% opacity. Remove ALL Braun orange from nav.

**3.5 — Heatmap Nodes** — Mastered: emerald. Developing: camp-orange. Critical: warm-red. Unexplored: `#D4DAE3` (neutral).

**3.6 — Progress Bars** — Track: `bg-[#3B6B9C]/10`. Fill: slate-blue general, emerald completion, camp-orange active. Height 6px rounded-full.

**3.7 — Forms** — Focus: `ring-2 ring-[#3B6B9C]/20 border-[#3B6B9C]`.

**STOP.** "Phase 3 Complete. Reply 'Proceed'."

---

### PHASE 4: Voice & Copy Rewrite

**Objective:** Every student-facing string uses "confident companion" voice.

**4.1 — Terminology renames** (grep + replace):
- "Blindspot Protocol" → "Focus Review"
- "Endurance Cycle" → "Extended Practice"
- "Proof Simulation" → "Full Exam Simulation"
- All instances of "dominate"/"dominance" → "confidence"/"readiness"
- All instances of "gap"/"weakness" → "area to revisit"/"developing skill"

**4.2 — Dashboard copy** — Rewrite greetings, empty states, CTAs per voice guide.
**4.3 — Testing copy** — Rewrite quiz messages, feedback, summaries per voice guide.
**4.4 — Verify** — Grep for ALL banned words. Zero remaining in student UI.

**STOP.** "Phase 4 Complete. Reply 'Proceed'."

---

### PHASE 5: Audio System + Micro-Interactions

**Objective:** Build the sound system and add premium micro-interactions.

**5.1 — Create `lib/audio/feedbackSounds.ts`** — Use the exact Web Audio API code from Enhancement 3 above.

**5.2 — Audio settings** — Toggle in user preferences. Default ON practice, OFF timed.

**5.3 — Wire into testing flow** — Correct → `playCorrectSound()`. Incorrect → silence. Completion → `playCompletionSound()`.

**5.4 — Micro-interactions** — Apply all CSS transitions from Enhancement 4 table. Test with `prefers-reduced-motion`.

**STOP.** "Phase 5 Complete. Reply 'Proceed'."

---

### PHASE 6: Schema Migrations + Rich Content

**Objective:** Database support for images, explanations, 3D linking. Build rendering components.

**6.1 — Migrations** (if columns missing):
```sql
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_citation TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS model_id TEXT;
```

**6.2 — Image rendering** — In question stem, left column. Lazy-load, skeleton, lightbox. Handle no-image gracefully.

**6.3 — Rich explanation card** — Post-answer (practice mode). Markdown explanation + code citation + Wiki/3D links. Slides in 200ms.

**6.4 — Session summary card** — Score + context + subject breakdown + time analysis + recommendation + "Start Focused Review →" CTA. Staggered reveal.

**STOP.** "Phase 6 Complete. Reply 'Proceed'."

---

### PHASE 7: CLAUDE.md + Final Audit

**Objective:** Update all project config. Full visual audit of every page.

**7.1 — Update CLAUDE.md** with: Campfire palette, typography scale/minimums, shadow/radius rules, voice guide ("Words We Use / Don't Use" table), engagement mechanics policy.

**7.2 — Update .cursorrules** (if exists) with same.

**7.3 — Full visual audit** — Check EVERY route:
- `/dashboard` — colors, typography, voice, cards
- `/dashboard/testing` — full testing interface
- `/dashboard/analytics` — charts, data viz colors
- `/dashboard/wiki`, `/dashboard/notes`, `/dashboard/3d-lab`
- `/dashboard/settings` — preferences, audio toggle
- Auth pages, sidebar, modals, toasts, empty states

**For each page check:**
- [ ] No old hex values (#D4751A, #1D1D1F, #F5F5F7, #3D8B52, #C0392B)
- [ ] No text below 11px
- [ ] No monospace on labels (only code/data)
- [ ] No rounded-xl+
- [ ] No shadow at rest
- [ ] All buttons follow new variants
- [ ] All copy follows new voice
- [ ] Warm white background (#F8F7F5)
- [ ] Testing uses cool background (#F5F7FA)

**7.4 — Fix ALL stragglers.**

**STOP.** "Phase 7 Complete. Zero old-brand remnants remain."

---

## POST-IMPLEMENTATION CHECKLIST

Run this after EVERY phase. If any fails, fix before proceeding.

- [ ] Primary actions are Slate Blue #3B6B9C
- [ ] Warm CTAs (celebration only) are Camp Orange #E8853A
- [ ] Success = Emerald #2D9F6F
- [ ] Page bg = #F8F7F5 (warm white)
- [ ] Testing bg = #F5F7FA (cool focus)
- [ ] Text = #1A2332 (not #000 or #1D1D1F)
- [ ] Borders = #D4DAE3
- [ ] No text below 11px
- [ ] No monospace on labels
- [ ] Cards: shadow-none at rest, shadow-sm hover
- [ ] Radii: rounded-md cards, rounded-sm buttons
- [ ] Transitions ≤300ms, ease-out
- [ ] Correct answer plays audio (practice mode)
- [ ] Incorrect answer = SILENCE
- [ ] No banned words in student UI
- [ ] "Blindspot Protocol" → "Focus Review"
- [ ] "Endurance Cycle" → "Extended Practice"
- [ ] "Proof Simulation" → "Full Exam Simulation"
- [ ] Readiness Score color dynamic (emerald/orange/red by value)
- [ ] Image support renders in questions (if data exists)
- [ ] Explanation card shows post-answer (practice mode, if data exists)
- [ ] Session summary shows post-quiz

---

## THE USER YOU'RE DESIGNING FOR

A 22-year-old Filipino architecture student preparing for the ALE. Studies on phone during commute, laptop at home, squeezes 10 minutes during lunch. Some days motivated, some days exhausted. Spotty WiFi.

**On her worst day** (stressed, tired, behind): the dashboard should make her feel "Okay, I can do this. Just 5 questions."

**On her best day** (energized, confident): "Nice, I'm on a roll. Let me push into a new topic."

**If she hasn't logged in for a week** (guilty, avoidant): "Oh, it's not mad at me. It's just... ready for me."

**When she opens a quiz**: the interface disappears. She's alone with the question, not the app. The subtle tone on correct answers makes her brain anticipate success. The rich explanation on wrong answers teaches her something. The session summary tells her exactly what to do next.

**When she shows it to her study group**: they see the 3D model viewer, hear the audio feedback, read the code-cited explanations. They sign up. Premium UX IS marketing.

---

## FINAL REMINDERS

1. **TOKEN-DRIVEN.** Change tokens first (Phase 2), everything inherits. Don't hunt individual components.

2. **WARM WHITE IS THE BIGGEST EMOTIONAL SHIFT.** #F5F5F7 → #F8F7F5 sounds trivial. The student's nervous system registers it as warmer. This one change moves the needle more than any component redesign.

3. **THE VOICE CHANGES = THE VISUAL CHANGES.** Warm palette + stern copy is incoherent. Both must evolve together.

4. **THE AUDIO IS ZERO-COST.** Web Audio API generates tones at runtime. No files, no CDN, no bundle impact.

5. **IMAGES ARE THE #1 CONVERSION TRIGGER.** Architecture is visual. Text-only questions are the gap between "free tool" and "worth paying for."

6. **THE 3D VIEWER IS THE MOAT.** No competitor has this. Globally. The "wow moment" that creates word-of-mouth.

7. **EFFICIENCY.** Limited tokens. Plan precisely, execute cleanly, verify after each phase.

---

*Read everything above. Then execute Phase 1 now.*
