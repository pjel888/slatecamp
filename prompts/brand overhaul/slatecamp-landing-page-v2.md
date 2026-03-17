# SlateCamp Landing Page — v2 Strategy + Implementation Prompt
## Grounded in the Actual Codebase · Fear-Informed Conversion System

> **This document supersedes the original `slatecamp-landing-page-implementation.md`.**
> Unlike that document — which described a hypothetical implementation — this one is grounded in the **actual component code** reviewed from the live codebase. Every fix, every copy change, and every new section is keyed to a real file.
>
> Files reviewed: `page.tsx`, `HeroSection.tsx`, `BentoFeatureGrid.tsx`, `MarketingNav.tsx`, `MarketingFooter.tsx`, `FinalCtaSection.tsx`, `TestimonialShowcase.tsx`, `PhilosophySection.tsx`, `HowItWorksSection.tsx`, `LogoMarquee.tsx`, `SocialProofBar.tsx`

---

## PART 1: AUDIT OF THE CURRENT LANDING PAGE

### The actual page structure (from `page.tsx`)

```
MarketingNav
HeroSection
SocialProofBar
LogoMarquee
BentoFeatureGrid
HowItWorksSection
PhilosophySection
TestimonialShowcase
FinalCtaSection
MarketingFooter
```

### What the page currently does well

**The ConversionHookCard (HeroSection.tsx) already contains the best fear hook on the page — and it's hidden.**
The center floating card has a hover interaction: at rest it shows `"Are you sure you'll pass?"` with a 42% readiness score and the line "Most reviewees sit here right before they realise where the gaps are." On hover it flips to `"This is what's possible"` with 98%. This is the strongest conversion mechanic on the entire page. It lives inside a card that most visitors will interact with — but nothing in the surrounding copy primes it or echoes it. The page earns the insight then abandons it immediately.

**The ExamsSupportedCard (HeroSection.tsx) is doing great positioning work.**
Showing Architecture (ALE) as Live with a green badge, then listing Interior Design, Civil Engineering, Nursing, CPA, and LET as upcoming — this isn't just a feature list. It's a signal that SlateCamp is building toward being THE Philippine licensure exam platform, not just an ALE reviewer. This card is currently styled as background decoration. It deserves more prominence in the narrative.

**The bento grid layout (BentoFeatureGrid.tsx) is visually distinctive.**
Most Philippine edtech platforms use generic card grids or list layouts. The asymmetric bento with spanning cards, a quote card, and a full-width engine showcase stands out. The visual execution is correct. The copy inside it needs work.

**"Used by 500+ Architecture Students" (SocialProofBar.tsx) is credible if real.**
If this number is real, it's one of the most conversion-valuable sentences on the page. If it isn't, it's a liability. This document assumes it reflects actual user count. Do not inflate it.

**"Engineered by Topnotchers · SME-Verified Content"** — these two proof points are strong differentiators that don't appear anywhere else on the page. They're buried in the SocialProofBar and never expanded on.

---

### CRITICAL ISSUES — Fix Before Shipping

These are not copy opinions. These are factual errors and conversion killers.

---

#### 🚨 ISSUE 1: The 84% Stat Is Factually Wrong — `BentoFeatureGrid.tsx`

**Current copy:**
```
"84% of architecture examinees don't pass — but data-driven study
can increase pass rates by 30%."
```

**This is factually incorrect and will destroy credibility.**

Real PRC data:
- January 2026 ALE: 82.09% passed → 17.91% failed
- June 2025 ALE: 65.16% passed → 34.84% failed
- January 2025 ALE: 58.69% passed → 41.31% failed
- June 2024 ALE: 62.14% passed → 37.86% failed

An "84% fail rate" would mean only 16% of examinees pass — which is completely false. Any architecture student, faculty member, or licensed architect who reads this will immediately know it's wrong and lose trust in everything else on the page.

The "data-driven study can increase pass rates by 30%" claim is also unsourced and must be removed unless SlateCamp has internal data to support it.

**Replace with:**

```tsx
<span className='text-[72px] font-extrabold leading-none tracking-tighter text-zinc-900'>
  1 in 3
</span>
<p className='mt-3 max-w-[220px] text-[13px] leading-relaxed text-zinc-600'>
  ALE examinees don&apos;t pass in a given sitting.
  Most didn&apos;t know they were at risk until exam day.
</p>
<span className='mt-2 block text-[10px] text-zinc-400'>
  Source: PRC official results, 2024–2025
</span>
```

This is honest, real, still commercially compelling, and cannot be challenged by anyone who knows the exam.

---

#### 🚨 ISSUE 2: The LogoMarquee Is Potentially Misleading — `LogoMarquee.tsx`

**Current state:**
The marquee scrolls brand names — BOYSEN, Holcim, NELTEX, AIDEA, WTA Design Studio, WILCON DEPOT, DAVIES, HardieFlex, PALAFOX, UST, National University, MAPÚA, UP Diliman — under the `aria-label` "Trusted by leading architecture brands."

**The problem:**
If none of these organizations have a formal relationship with SlateCamp, this is false advertising. A faculty member at UST or UP who sees their institution in a "trusted by" marquee and has never heard of SlateCamp is a credibility threat.

**Fix — choose one based on reality:**

**Option A** (if real students from these schools are users):
Change the `aria-label` from "Trusted by leading architecture brands" to "Students from these institutions are in the camp." This is factually defensible — students from these schools may be users even without institutional endorsement.

**Option B** (if these are aspirational/placeholder):
Replace the marquee with a simple text proof statement and remove the component from `page.tsx` until institutional relationships are confirmed:
```
"Architecture students from UST, DLSU, UPD, Mapúa, NU, and more are
already in the camp."
```

**Option C** (minimum safe version):
Keep the marquee but change it to display only architecture firms and schools where you can confirm at least one user, and change the label to "Students and professionals from:"

---

#### ⚠️ ISSUE 3: PhilosophySection Breaks Conversion Flow — `PhilosophySection.tsx`

**Current state:**
A full `py-24` section in the middle of the page featuring the Dieter Rams quote "Less, but better." and copy about SlateCamp's design philosophy. It sits between `HowItWorksSection` and `TestimonialShowcase`.

**The problem:**
A student who has scrolled from Features → How It Works is at peak intent. They're one step from the testimonials and two steps from the final CTA. A philosophy section at this point kills conversion momentum. "Less, but better" is a beautiful brand statement — it belongs in the footer, the About page, or an onboarding screen, not between how-it-works and social proof on a sales page.

**Fix:**
Remove `<PhilosophySection />` from `page.tsx`. The component can stay in the codebase for use on `/about`. The footer already says "Less, but better." — that's exactly the right placement.

---

#### ⚠️ ISSUE 4: FinalCtaSection Has No Urgency — `FinalCtaSection.tsx`

**Current copy:**
```
Headline: "Ready to pass your board exam?"
Sub:      "One platform. Everything verified. No doubt."
```

"Ready to pass your board exam?" implies they're already ready — no urgency, no reason to act now versus tomorrow. "One platform. Everything verified. No doubt." is fine brand copy but has zero conversion heat.

**Replace with:**
```tsx
// Headline
"The exam doesn&apos;t wait for you to feel ready."

// Sub (non-logged-in)
"SlateCamp shows you exactly where you stand, what to fix, and
when you&apos;re genuinely ready. Start free — no card needed."

// Sub (logged-in)
"Your Readiness Score is waiting. Keep building toward it."
```

---

#### ⚠️ ISSUE 5: Testimonials Reference "Cerebro" — `TestimonialShowcase.tsx`

**Current first testimonial:**
```
"Cerebro's 3D Library completely changed how I understand Building Tech."
```

"Cerebro" is an internal name that appears nowhere else on the public-facing page. The public-facing name is "3D Lab" (as used in `BentoFeatureGrid.tsx`).

**Fix:**
```tsx
// Before
'Cerebro\u2019s 3D Library completely changed how I understand Building Tech.'

// After
'SlateCamp\u2019s 3D Lab completely changed how I understand Building Tech.'
```

If any testimonials are placeholder text, add a code comment:
```tsx
// PLACEHOLDER — replace with real testimonial before launch
```

---

#### ⚠️ ISSUE 6: Nav CTA Has Unnecessary Friction — `MarketingNav.tsx`

**Current:** `"Get Started"`

**Replace with:** `"Join Free →"`

The trust copy ("Free forever to start · No credit card required") is already in `HeroSection.tsx`'s stats bar and handles the reassurance. The nav CTA should be fast and frictionless, not procedural.

---

#### ⚠️ ISSUE 7: SEO Metadata Makes Outcome Promises — `page.tsx`

**Current:**
```ts
title: `${siteConfig.name} — AI-Adaptive Architecture Board Exam Prep`
openGraph.title: `${siteConfig.name} — Pass the Architecture Board Exam`
twitter.title: `${siteConfig.name} — AI-Adaptive Architecture Board Exam Prep`
```

"Pass the Architecture Board Exam" implies a guarantee. "AI-Adaptive" is generic SaaS language that doesn't differentiate.

**Replace with:**
```ts
title: `${siteConfig.name} — Know Your ALE Readiness Before Exam Day`
openGraph.title: `${siteConfig.name} — The ALE Readiness Intelligence Platform`
twitter.title: `${siteConfig.name} — Stop Studying Blind. Know Your Score.`
description: 'The only ALE prep platform with a real-time Readiness Score. 
Know exactly where you stand, what to fix, and when you\'re 
genuinely ready — before exam day.'
```

---

## PART 2: THE COMMERCIAL STRATEGY

### The Product Category We're Creating

Do not position SlateCamp as a "reviewer app" or "study platform." Both categories are crowded and commoditized. Create a new category:

> **ALE Readiness Intelligence** — the only Philippine licensure exam platform that tells you, with real data, whether you're actually going to pass.

This framing does several things:
- It makes the Readiness Score (already prominent in the ConversionHookCard and Analytics bento card) the hero of the product, not the quiz feature
- It positions all alternatives — review centers, YouTube, Facebook groups, photocopied handouts — as blind study methods with no feedback loop
- It makes ₱299/month feel like buying certainty, not buying content

### The Fear Insight — Use It, Don't Abuse It

The ConversionHookCard already executes fear marketing correctly at the micro level. The rest of the page needs to support it at the macro level.

The fear is not failure. The fear is **uncertainty.** Students who scroll this page have been studying. Their fear isn't "I might fail" — it's "I don't know whether I'm going to fail." That distinction matters. SlateCamp doesn't scare them about failure. SlateCamp resolves the uncertainty.

**The three levels of fear:**

| Level | Type | Application |
|---|---|---|
| Level 1 | "You will fail." | ❌ Never. Doomsday. Destroys trust. |
| Level 2 | "Do you actually know if you'll pass?" | ✅ SlateCamp's lane. Use everywhere. |
| Level 3 | "Top students already have this." | ⚠️ Use sparingly — social proof and closing CTA only. |

**The fear-resolution flywheel — apply to every section:**
```
FEAR:       State the uncertainty honestly using real data.
BRIDGE:     Connect it to what happens on exam day.
RESOLUTION: SlateCamp resolves it specifically.

Example:
FEAR:       "1 in 3 ALE examinees don't pass in a given sitting."
BRIDGE:     "Most of them thought they were ready."
RESOLUTION: "SlateCamp shows you in real time whether you are."
```

Never leave fear hanging. The student should finish every section feeling more empowered than when they started.

### The "Secret Weapon" Frame

The ConversionHookCard's hover state is already doing this — the UX instinct is right. The surrounding copy needs to match it.

Students should leave this page thinking:
> *"This is what serious ALE candidates use. This is the edge most students don't know about yet."*

Language that achieves this:
- "The platform serious ALE candidates use."
- "Not a reviewer. A readiness system."
- "Stop guessing. Start measuring."
- "The exam won't tell you if you're ready until it's too late."
- "Every top scorer has one thing most students don't: a real signal."

Language that does not:
- "Guaranteed to pass." — false promise, legal liability
- "You will fail without this." — doomsday, destroys brand
- "Better than review centers." — direct attack, weakens premium positioning

---

## PART 3: THE REVISED EMOTIONAL ARC

**Current arc (what the page actually does now):**
```
Hero            → Urgency + product preview     [GOOD]
SocialProofBar  → Credibility                   [WEAK — 1 line]
LogoMarquee     → Credibility                   [RISKY — possibly misleading]
BentoGrid       → Features + fear anchor        [GOOD STRUCTURE, WRONG STAT]
HowItWorks      → Clarity                       [FINE but generic]
PhilosophySection → Brand statement             [BREAKS CONVERSION FLOW]
Testimonials    → Trust                         [PLACEHOLDER QUALITY]
FinalCTA        → Action                        [WEAK COPY]
```

**Target arc (what it should do):**
```
Hero            → URGENCY + RECOGNITION
                  "The exam is coming. This is for me. This asks if I'm ready."
SocialProofBar  → CREDIBILITY PRIMER
                  "Real students. Real numbers."
LogoMarquee     → SOCIAL PROOF SIGNAL (once legitimized)
                  "Students at my school use this."
BentoGrid       → DESIRE + FEAR ANCHOR
                  "I want these features. And 1 in 3 fail without them."
HowItWorks      → CLARITY + CONFIDENCE
                  "I understand how it works."
[NEW] Comparison → RATIONALITY
                  "This is smarter than the ₱25,000 alternative."
Testimonials    → TRUST
                  "People like me used it and passed."
FinalCTA        → URGENCY + ACTION
                  "The exam doesn't wait. I'm starting now."
```

---

## PART 4: FILE-BY-FILE CHANGE SPECIFICATIONS

### `page.tsx` — Section Order and Metadata

**Remove `<PhilosophySection />`**. Add `<ComparisonSection />` after `<HowItWorksSection />`.

```tsx
// Updated render order
<HeroSection ctaHref={ctaHref} ctaLabel={ctaLabel} isLoggedIn={isLoggedIn} />
<SocialProofBar />
<LogoMarquee />           {/* Only if legitimized — see Issue 2 */}
<BentoFeatureGrid />
<HowItWorksSection />
<ComparisonSection />     {/* NEW — see Part 5 */}
<TestimonialShowcase />
<FinalCtaSection ctaHref={ctaHref} ctaLabel={ctaLabel} isLoggedIn={isLoggedIn} />
```

Update metadata titles per Issue 7 above.

---

### `MarketingNav.tsx` — CTA

```tsx
// Before
'Get Started'

// After
'Join Free →'
```

---

### `HeroSection.tsx` — ConversionHookCard Reinforcement

The hover mechanic is correct. Two targeted copy changes to the resting state:

**Change the resting sub-heading:**
```tsx
// Before
"A quick look at how your recent practice sessions are 
performing by subject."

// After
"Most students walk into the ALE not knowing where their gaps 
are. This is where you find out."
```

**Change the readiness label in resting state:**
```tsx
// Before
label='At risk'

// After
label='At risk — typical starting score'
```

This reframes the 42% as a common starting point rather than a personal failure state, which is both more accurate and less discouraging to new visitors.

**Stats bar — update when real data is available:**
```tsx
// Current
const STATS = [
  '2,400+ verified questions',
  'Built for ALE & ARE',
  'Spaced repetition engine',
  'Real-time analytics',
] as const

// Replace when you have real user outcome data
const STATS = [
  '500+ students in the camp',
  '2,400+ verified ALE questions',
  'Real-time Readiness Score',
  'Free to start — no card needed',
] as const
```

---

### `BentoFeatureGrid.tsx` — Fix the Stat + One Headline

**Priority 1 — the stat card (CRITICAL):**
```tsx
// Before
<span className='text-[72px] font-extrabold leading-none tracking-tighter text-zinc-900'>
  84%
</span>
<p className='mt-3 max-w-[220px] text-[13px] leading-relaxed text-zinc-600'>
  of architecture examinees don&apos;t pass — but data-driven study
  can increase pass rates by 30%.
</p>

// After
<span className='text-[72px] font-extrabold leading-none tracking-tighter text-zinc-900'>
  1 in 3
</span>
<p className='mt-3 max-w-[220px] text-[13px] leading-relaxed text-zinc-600'>
  ALE examinees don&apos;t pass in a given sitting. Most didn&apos;t
  know they were at risk until exam day.
</p>
<span className='mt-2 block text-[10px] text-zinc-400'>
  Source: PRC official results, 2024–2025
</span>
```

**Priority 2 — Review Mode headline:**
```tsx
// Before
"Doomscroll Your Way to Mastery"

// After
"Active Recall, Zero Pressure"
```

The "Doomscroll" framing is clever but works against brand trust for a high-stakes exam platform. The serif subheading already says exactly what this mode is. The headline should reinforce it, not undercut it.

---

### `TestimonialShowcase.tsx` — Fix Cerebro Reference + Arc

**Fix the Cerebro reference immediately:**
```tsx
// Before
'Cerebro\u2019s 3D Library completely changed how I understand Building Tech.'

// After
'SlateCamp\u2019s 3D Lab completely changed how I understand Building Tech.'
```

**Testimonial arc to build toward (when real testimonials are available):**

The current three testimonials cover the 3D Lab, the Readiness Score, and Spaced Repetition — a feature-focused set. The target arc for maximum conversion is:

1. **The first-time passer** — stopped buying physical review materials after week one on SlateCamp
2. **The visual learner** — the 3D Lab made building codes click in a way no textbook had
3. **The retaker** — failed the first time because "I didn't know I wasn't ready," came back, watched the Readiness Score climb from 41% to 88%, and passed the second time

The retaker story is the most commercially powerful testimonial SlateCamp can have. It speaks to first-time takers through fear (the risk of not knowing) and to retakers through redemption (it's possible to recover). It's also the most believable — the specificity of "41% to 88%" signals real product usage.

For placeholders, add a comment so future contributors know what's needed:
```tsx
// PLACEHOLDER — replace before launch
// Target archetype: retaker who used Readiness Score to study toward a specific number
```

---

### `PhilosophySection.tsx` — Remove from Landing Page

In `page.tsx`, remove:
```tsx
<PhilosophySection />
```

Keep the component file. Use it on `/about`. The footer already carries the "Less, but better." tagline at exactly the right weight.

---

### `FinalCtaSection.tsx` — New Copy

```tsx
// Headline — before
"Ready to pass your board exam?"

// Headline — after
"The exam doesn&apos;t wait for you to feel ready."


// Sub (non-logged-in) — before
"One platform. Everything verified. No doubt."

// Sub (non-logged-in) — after
"SlateCamp shows you exactly where you stand, what to fix, and when
you&apos;re genuinely ready. Start free \u2014 no card needed."


// Sub (logged-in) — before
"Head to your dashboard to continue studying."

// Sub (logged-in) — after
"Your Readiness Score is waiting. Keep building toward it."
```

---

### `SocialProofBar.tsx` — Two Word Changes

```tsx
// Before
'SME-Verified Content'

// After
'Content Verified by Licensed Architects'
```

"SME" (Subject Matter Expert) is industry jargon. "Verified by Licensed Architects" maps directly to what the ALE student cares about — the content is authoritative because licensed professionals reviewed it.

```tsx
// Before
'Used by 500+ Architecture Students'

// After
'500+ Architecture Students in the Camp'
```

Small framing shift: "in the camp" reinforces the brand identity rather than using generic SaaS phrasing.

---

## PART 5: THE NEW SECTION — `ComparisonSection.tsx`

This section does not currently exist in the codebase. It is the most commercially important addition in this document.

### Why This Section Exists

SlateCamp's primary competitor is not another app. It's the ₱15,000–₱30,000 review center that 80% of architecture students assume is mandatory. Until a visitor understands that SlateCamp offers something review centers fundamentally cannot — a real-time readiness signal — they will default to the familiar option.

This section does not attack review centers. It presents two approaches and identifies the one dimension where SlateCamp wins outright.

### Copy

```
Section eyebrow (monospace, uppercase, amber):
"Two ways to prepare"

Headline:
"The old way. The better way."

Sub-headline:
"Traditional review centers work. But there's one thing they
can't tell you that SlateCamp can: exactly where your gaps
are, right now, before exam day."
```

**Comparison table:**

| | Traditional Review Center | SlateCamp |
|---|---|---|
| Cost | ₱15,000 – ₱30,000 | Free forever · Premium from ₱299/month |
| Schedule | Fixed classroom hours | Study on your schedule, on any device |
| Performance feedback | General scores on mock exams | Live Readiness Score by subject, updated after every session |
| Content | Textbooks, lectures, handouts | Verified questions, 3D Lab, code-cited explanations |
| Personalization | Same syllabus for every student | Adapts to your specific weak areas using spaced repetition |
| Availability | Metro Manila-heavy | Anywhere. Including your commute. |
| Readiness signal | "Keep studying." | "You're at 74%. Here's exactly what to fix." |

**Disclaimer below the table:**
```
"SlateCamp isn't against review centers — many students use both.
But if you want to know whether you're ready before exam day,
SlateCamp is the only way to find out."
```

This disclaimer is not optional. It shows confidence without arrogance, and it prevents the section from reading as an attack.

### Component structure

```tsx
// src/components/marketing/ComparisonSection.tsx
// Add to page.tsx after <HowItWorksSection />

import { Starburst } from '@/components/marketing/LandingPrimitives'

const COMPARISON_ROWS = [
  {
    dimension: 'Cost',
    traditional: '₱15,000 – ₱30,000',
    slatecamp: 'Free forever · Premium from ₱299/month',
  },
  {
    dimension: 'Schedule',
    traditional: 'Fixed classroom hours',
    slatecamp: 'Study on your schedule, on any device',
  },
  {
    dimension: 'Performance feedback',
    traditional: 'General scores on mock exams',
    slatecamp: 'Live Readiness Score by subject, updated every session',
  },
  {
    dimension: 'Content',
    traditional: 'Textbooks, lectures, handouts',
    slatecamp: 'Verified questions, 3D Lab, code-cited explanations',
  },
  {
    dimension: 'Personalization',
    traditional: 'Same syllabus for every student',
    slatecamp: 'Adapts to your specific weak areas',
  },
  {
    dimension: 'Availability',
    traditional: 'Metro Manila-heavy',
    slatecamp: 'Anywhere. Including your commute.',
  },
  {
    dimension: 'Readiness signal',
    traditional: '"Keep studying."',
    slatecamp: '"You\'re at 74%. Here\'s exactly what to fix."',
    highlight: true,
  },
] as const

export const ComparisonSection = () => (
  <section
    aria-labelledby='comparison-heading'
    className='border-t border-zinc-200 px-6 py-24'
  >
    <div className='mx-auto max-w-[1200px]'>
      <div className='flex items-center gap-3'>
        <Starburst className='h-4 w-4 text-amber-600' />
        <span className='font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-500'>
          Two ways to prepare
        </span>
      </div>

      <h2
        id='comparison-heading'
        className='mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight text-zinc-900'
      >
        The old way. The better way.
      </h2>

      <p className='mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-600'>
        Traditional review centers work. But there&apos;s one thing they can&apos;t
        tell you that SlateCamp can: exactly where your gaps are, right now,
        before exam day.
      </p>

      {/* Table — desktop */}
      <div className='mt-10 hidden overflow-hidden rounded-md border border-zinc-200 md:block'>
        {/* Header row */}
        <div className='grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50'>
          <div className='px-5 py-3 text-[12px] font-semibold text-zinc-500' />
          <div className='border-l border-zinc-200 px-5 py-3 text-[12px] font-semibold text-zinc-500'>
            Traditional Review Center
          </div>
          <div className='border-l border-zinc-200 bg-[#F0F5FA] px-5 py-3 text-[12px] font-semibold text-primary'>
            SlateCamp
          </div>
        </div>
        {/* Data rows */}
        {COMPARISON_ROWS.map((row) => (
          <div
            key={row.dimension}
            className={`grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-200 last:border-0 ${
              row.highlight ? 'bg-zinc-50' : ''
            }`}
          >
            <div className='px-5 py-3.5 text-[13px] font-medium text-zinc-900'>
              {row.dimension}
            </div>
            <div className='border-l border-zinc-200 px-5 py-3.5 text-[13px] text-zinc-500'>
              {row.traditional}
            </div>
            <div
              className={`border-l border-zinc-200 px-5 py-3.5 text-[13px] ${
                row.highlight ? 'font-medium text-primary' : 'text-zinc-700'
              }`}
            >
              {row.slatecamp}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked cards */}
      <div className='mt-6 space-y-3 md:hidden'>
        {COMPARISON_ROWS.map((row) => (
          <div key={row.dimension} className='rounded-md border border-zinc-200 p-4'>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-zinc-400'>
              {row.dimension}
            </p>
            <div className='mt-2 flex gap-4'>
              <div className='flex-1'>
                <p className='text-[10px] font-medium text-zinc-400'>Traditional</p>
                <p className='mt-0.5 text-[12px] text-zinc-600'>{row.traditional}</p>
              </div>
              <div className='flex-1'>
                <p className='text-[10px] font-medium text-primary'>SlateCamp</p>
                <p className={`mt-0.5 text-[12px] ${row.highlight ? 'font-medium text-primary' : 'text-zinc-800'}`}>
                  {row.slatecamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className='mt-6 text-[13px] text-zinc-400'>
        SlateCamp isn&apos;t against review centers — many students use both. But if
        you want to know whether you&apos;re ready before exam day, SlateCamp is the
        only way to find out.
      </p>
    </div>
  </section>
)
```

---

## PART 6: COPY VOICE & TONE RULES

**Rule 1: Never promise passing.**
```
✓ "Know your score before the exam does."
✗ "Know you'll pass."
✗ "Ready to pass your board exam?" — implies they already are
```

**Rule 2: Fear is a signal, not a weapon.**
```
✓ "In recent ALE sittings, 1 in 3 examinees don't pass."
✗ "Don't be one of the 1 in 3 who fails."
```

**Rule 3: Never attack review centers.**
```
✓ "Review centers can't tell you your Readiness Score. SlateCamp can."
✗ "Why waste ₱25,000 on a review center?"
```

**Rule 4: Speak like the smartest person in the study group.**
```
✓ "Wrong answers teach you more than right answers. Here's the system."
✗ "Unlock your learning potential with AI-powered adaptive solutions."
```

**Rule 5: Every stat is real or it's removed.**
```
✓ "500+ architecture students are in the camp." (if true)
✓ "1 in 3 ALE examinees don't pass." (PRC-sourced)
✗ "84% of architecture examinees don't pass." (false — fix immediately)
✗ "Data-driven study increases pass rates by 30%." (unsourced — remove)
```

---

## PART 7: HEADLINE SPLIT TEST MATRIX

The `HeroHeadline` component source was not included in the reviewed files. Audit `HeroHeadline.tsx` and compare against this matrix.

| Headline | Tone | Ship? |
|---|---|---|
| "Stop studying blind." | Bold, Level 2 fear | ✅ Test first |
| "Do you know if you'll pass?" | Direct question | ✅ Test second |
| "Most students guess. You don't have to." | Contrast | ✅ Test third |
| "The exam doesn't warn you. SlateCamp does." | Benefit-contrast | ✅ Test fourth |
| "The only ALE platform with a real Readiness Score." | Positioning, no fear | ✅ Fallback |
| "Know you'll pass." | Implied outcome | ❌ Retire immediately |
| "AI-Adaptive Architecture Board Exam Prep" | Generic SaaS | ❌ Retire immediately |
| "Pass the Architecture Board Exam" | Outcome promise | ❌ Retire immediately |

The last two appear in the current `page.tsx` metadata. Update them as specified in Issue 7 above.

---

## PART 8: FULL DIFF TABLE

| File | Current State | Change | Priority |
|---|---|---|---|
| `BentoFeatureGrid.tsx` | **84% stat — factually wrong** | **Replace with "1 in 3" + PRC source** | 🚨 Do today |
| `TestimonialShowcase.tsx` | References "Cerebro's 3D Library" | Fix to "SlateCamp's 3D Lab" | 🚨 Do today |
| `FinalCtaSection.tsx` | "Ready to pass your board exam?" | Replace with urgency copy | ⚠️ This week |
| `page.tsx` | Has `<PhilosophySection />` mid-page | Remove from render, keep in codebase | ⚠️ This week |
| `page.tsx` | Metadata titles promise passing | Update all three metadata fields | ⚠️ This week |
| `MarketingNav.tsx` | CTA: "Get Started" | Change to "Join Free →" | ⚠️ This week |
| `LogoMarquee.tsx` | "Trusted by leading architecture brands" with unverified orgs | Legitimize or replace — see Issue 2 | ⚠️ Needs decision |
| `SocialProofBar.tsx` | "SME-Verified Content" | Change to "Content Verified by Licensed Architects" | 📋 Next sprint |
| `BentoFeatureGrid.tsx` | "Doomscroll Your Way to Mastery" | Change to "Active Recall, Zero Pressure" | 📋 Next sprint |
| `HeroSection.tsx` | ConversionHookCard resting sub-text is generic | Update to fear-resolution framing | 📋 Next sprint |
| `TestimonialShowcase.tsx` | Placeholder testimonials | Build toward 3-archetype set with real users | 📋 When available |
| `ComparisonSection.tsx` | Does not exist | Create and add to `page.tsx` | 📋 Next sprint |
| `HeroSection.tsx` | STATS array shows feature stats | Replace with social proof stats when available | 📋 When data exists |

---

## PART 9: THE THREE TESTS

**Test 1: The Credibility Test**
Show the page to a licensed architect (not a student). Ask them to read the stats section. If they accept every number as plausible, the data is calibrated. If they challenge any number, that number needs to be fixed or removed. The 84% stat would fail this test immediately; "1 in 3" passes it.

**Test 2: The Student Test**
Show the full page to a current fourth-year architecture student preparing for the next ALE. Ask: Does anything feel like it's overpromising? Does it make you want to sign up? Does the ConversionHookCard hover state feel like a genuine "aha" or a gimmick?

**Test 3: The Forward Test**
Would a student who found this page screenshot the ConversionHookCard and send it to their study group? That card — at rest showing 42%, on hover showing 98% — is designed to do exactly that. If the surrounding copy supports and echoes that mechanic, the answer is yes.

---

## PART 10: WHAT STAYS UNCHANGED

The following are correct as-is and should not be touched:

- The ConversionHookCard hover mechanic ("Are you sure you'll pass?" → "This is what's possible")
- Overall bento grid visual structure and layout
- ExamsSupportedCard showing the expansion roadmap (ALE live, others upcoming)
- MockQuestionCard showing a real ALE question format
- "Free forever to start · No credit card required" trust line in HeroSection
- Three-step HowItWorksSection structure and copy
- Analytics bento card (ReadinessRing + MasteryBars)
- AI-Adaptive Engine full-width bento card
- 3D Lab, Sessions Mode, and Bounded Intelligence cards
- "IRT-Calibrated · EMA-Weighted" pills in the Analytics card
- FloatingTestimonialMarquee (if populated with real testimonials)
- "Engineered by Topnotchers" in SocialProofBar
- The overall page layout, route structure, and Next.js Suspense fallback pattern
- Instrument Serif typography for pull quotes
- `bg-zinc-100` page background
- `bg-gray-600` bento card backgrounds
- The 🇵🇭 flag in the nav — it immediately communicates Philippine context to every visitor

---

*Feed this document to Claude Code when implementing changes.*
*Start with the 84% stat fix — it is the only factually incorrect claim currently visible in production.*
*Work through the diff table in priority order.*
*The Campfire design system document is no longer the primary reference — this codebase-grounded document supersedes it for implementation decisions.*
