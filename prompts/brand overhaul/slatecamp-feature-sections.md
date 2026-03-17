# SlateCamp Feature Sections — Implementation Spec
## Four new sections: Questions, 3D Lab, Analytics, Wiki

> Add these four sections to `page.tsx` between `BentoFeatureGrid` and `HowItWorksSection`.
> Each section is a standalone component file in `src/components/marketing/`.
> All sections follow the Camp design system: Syne font, Camp Colors, noise on colored cards, light surfaces for data/UI mockups, zero single-side borders.

---

## PAGE ORDER (updated `page.tsx`)

```tsx
<HeroSection />
<SocialProofBar />
<LogoMarquee />
<BentoFeatureGrid />

{/* ── NEW FEATURE SECTIONS ── */}
<QuestionsSection />    // Light bg — splits left copy / right quiz mockup
<ThreeDLabSection />    // Dark bg (#111) — splits left copy / right 3D viewer mockup
<AnalyticsSection />    // Light bg — splits left copy / right score mockup
<WikiSection />         // Light bg — splits right copy / left wiki mockup (flipped)

<HowItWorksSection />
<ComparisonSection />
<TestimonialShowcase />
<FinalCtaSection />
```

---

## SHARED LAYOUT PATTERN

All four sections use the same responsive split layout. Left/right alternates for visual rhythm (Questions = text left, 3D Lab = text left reversed, Analytics = text left, Wiki = text right).

```tsx
// FeatureSectionLayout.tsx (shared wrapper)
export const FeatureSectionLayout = ({
  children,
  flip = false,
  dark = false,
}: {
  children: React.ReactNode
  flip?: boolean
  dark?: boolean
}) => (
  <section
    className={`border-t px-6 py-24 ${
      dark
        ? 'bg-[#111111] border-white/10'
        : 'border-[#E8E4DC] bg-[#F2F0EB]'
    }`}
  >
    <div
      className={`mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 md:grid-cols-2 ${
        flip ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''
      }`}
    >
      {children}
    </div>
  </section>
)
```

### Shared FeatureCheckItem

```tsx
// Reusable bullet point used across all four sections
const FeatureCheckItem = ({
  title,
  description,
  accentColor = '#1B3FC4',
  textDark = false,
}: {
  title: string
  description: string
  accentColor?: string
  textDark?: boolean
}) => (
  <div className='flex items-start gap-3'>
    <div
      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold'
      style={{ background: accentColor, color: accentColor === '#F5A623' ? '#111' : '#fff' }}
    >
      ✓
    </div>
    <div>
      <div className={`text-[13px] font-bold ${textDark ? 'text-white' : 'text-[#111]'}`}>
        {title}
      </div>
      <div className={`mt-1 text-[12px] leading-relaxed ${textDark ? 'text-white/50' : 'text-[#6B6B6B]'}`}>
        {description}
      </div>
    </div>
  </div>
)
```

### Section Eyebrow

```tsx
const SectionEyebrow = ({ label, dark = false }: { label: string; dark?: boolean }) => (
  <div className='mb-5 flex items-center gap-2'>
    <Starburst className='h-3.5 w-3.5 text-[#F5A623]' />
    <span
      className={`font-mono text-[10px] tracking-[.2em] uppercase ${
        dark ? 'text-white/40' : 'text-zinc-500'
      }`}
    >
      {label}
    </span>
  </div>
)
```

---

## SECTION 1: `QuestionsSection.tsx`

**Background:** `bg-[#F2F0EB]` (page bg, no fill change needed)
**Layout:** text LEFT, mockup RIGHT

### Copy

```
Eyebrow: "Question Bank"

Headline:
"2,400+ questions built for
the ALE. Every single one."

Sub:
"Not recycled PDFs. Not scraped notes. Every question is written
to the ALE syllabus, verified by licensed architects, and tagged
to its exact PD 1096 provision."

Feature chips (pill-cobalt):
"Image + diagram questions"
"Code-cited explanations"
"All 7 ALE subjects"
"Difficulty calibrated by IRT"

Check items:
① "Wrong answers teach more than right ones"
   "Every incorrect answer unlocks a full explanation citing the
   exact code provision. You learn the why, not just the what."
   accentColor: #1B3FC4

② "Three study modes"
   "Review for low-pressure recall. Camp Mode for tracked sessions.
   Storm Mode for full exam simulation with a timer."
   accentColor: #1B3FC4

③ "Spaced repetition built in"
   "Questions you've mastered fade back. Questions you keep missing
   resurface until they stick. The SM-2 algorithm handles the schedule."
   accentColor: #F5A623
```

### Right: Quiz Mockup

The mockup is a rendered UI component (not an image), showing:

```tsx
// QuestionsSection.tsx — right panel
const QuizMockupFull = () => (
  <div className='overflow-hidden rounded-[10px] border border-[#E8E4DC] bg-white'>

    {/* Header — Cobalt with noise */}
    <div className='relative overflow-hidden bg-[#1B3FC4] px-4 py-3 noise-heavy'>
      <div className='relative z-10 flex items-center justify-between'>
        <div>
          <div className='font-mono text-[9px] tracking-[.18em] uppercase text-white/50'>
            Building Technology · Q14
          </div>
          <div className='mt-0.5 text-[13px] font-bold text-white'>
            Storm Mode — 18:42 remaining
          </div>
        </div>
        <div className='rounded-full bg-white/15 px-3 py-1 font-mono text-[9px] text-white/70'>
          40 questions
        </div>
      </div>
    </div>

    {/* Question body */}
    <div className='p-4'>
      <p className='mb-3 text-[13px] font-semibold leading-snug text-[#111]'>
        Under PD 1096, what is the minimum ceiling height for habitable rooms
        on the ground floor of a residential building?
      </p>

      {/* Answer options */}
      {[
        { label: '2.00 meters', state: 'neutral' },
        { label: '2.70 meters', state: 'correct' },
        { label: '2.40 meters', state: 'selected' },
        { label: '3.00 meters', state: 'neutral' },
      ].map((opt) => (
        <div
          key={opt.label}
          className={`mb-1.5 flex items-center gap-2.5 rounded-[6px] border-[1.5px] px-3 py-2 text-[12px] ${
            opt.state === 'correct'
              ? 'border-[#1B7A3C] bg-[#f0fdf4] text-[#1B7A3C]'
              : opt.state === 'selected'
              ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
              : 'border-[#E8E4DC] text-[#555]'
          }`}
        >
          <div className={`h-3 w-3 shrink-0 rounded-full border-[1.5px] border-current ${
            opt.state !== 'neutral' ? 'bg-current' : ''
          }`} />
          {opt.label}
          {opt.state === 'correct' && ' ✓'}
        </div>
      ))}

      {/* Explanation card */}
      <div className='mt-3 rounded-[8px] bg-[#F2F0EB] p-3'>
        <div className='mb-1.5 font-mono text-[8px] tracking-[.15em] uppercase text-[#1B3FC4]'>
          Explanation
        </div>
        <p className='text-[11px] leading-relaxed text-[#555]'>
          Section 808 of PD 1096 specifies that habitable rooms must have a minimum
          ceiling height of 2.70m on the ground floor, and 2.40m on floors above.
          This is a commonly tested provision.
        </p>
        <span className='mt-2 inline-block rounded-[4px] bg-[#1B3FC4] px-2 py-0.5 font-mono text-[9px] text-white'>
          PD 1096 § 808
        </span>
      </div>
    </div>

  </div>
)
```

---

## SECTION 2: `ThreeDLabSection.tsx`

**Background:** `bg-[#111111]` — the only section with a dark background on the landing page. Creates a strong visual break. Noise standard (`.noise`).
**Layout:** text LEFT, mockup RIGHT (flip=false, but text is reversed visually — use `flip={true}` so mockup appears left)

### Copy

```
Eyebrow: "3D Lab"  (text-white/40)

Headline (text-white):
"The only 3D building code viewer
in any Philippine review platform."

Sub (text-white/55):
"Memorizing setbacks and clearances from text alone is how students
fail. Seeing them — dragging them, rotating them — is how they pass.
The 3D Lab makes PD 1096 spatial, not abstract."

Feature chips (white border, amber accent):
"WebGL-powered"      (white/muted pill)
"Parametric controls" (amber pill)
"PD 1096 provisions" (white/muted pill)
"NBCP setbacks"      (white/muted pill)

Check items (textDark=true, accentColor=#F5A623):
① "Drag FAR — model updates in real time"
   "Adjust Floor Area Ratio, lot coverage, or building height with
   a slider and watch the structure respond in real time."

② "Linked directly to quiz questions"
   "Get a setback question wrong? Open the 3D Lab straight from
   the explanation card and see the exact provision in 3D."
```

### Right: 3D Viewer Mockup

```tsx
// The 3D mockup is a green card (Camp Green + noise-heavy) with an SVG building diagram
const ThreeDMockup = () => (
  <div className='relative overflow-hidden rounded-[10px] bg-[#1B7A3C] noise-heavy'>
    <div className='relative z-10'>

      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <span className='inline-block rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[9px] text-white/70'>
            3D Lab · NBCP Setbacks
          </span>
          <div className='mt-1 text-[13px] font-bold text-white'>Residential — Corner Lot</div>
        </div>
        <span className='rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[9px] text-white/70'>
          PD 1096 § 706
        </span>
      </div>

      {/* SVG Viewport */}
      <div className='flex h-[160px] items-center justify-center px-4'>
        {/* Inline SVG — isometric building footprint with setback callouts */}
        {/* See the widget preview above for the exact SVG */}
        <svg viewBox="0 0 320 150" className="w-full max-w-[320px]">
          {/* lot, setback lines, building footprint, 3D lines — see widget */}
        </svg>
      </div>

      {/* FAR Slider */}
      <div className='flex items-center gap-3 border-t border-white/10 px-4 py-3'>
        <span className='font-mono text-[9px] text-white/50'>FAR</span>
        <div className='relative flex-1'>
          <input
            type='range' min='1' max='5' step='0.1' defaultValue='3'
            className='w-full accent-[#F5A623]'
          />
        </div>
        <span className='font-mono text-[9px] font-medium text-[#F5A623]'>3.0</span>
      </div>

    </div>
  </div>
)
```

---

## SECTION 3: `AnalyticsSection.tsx`

**Background:** `bg-[#F2F0EB]`
**Layout:** text LEFT, mockup RIGHT

### Copy

```
Eyebrow: "Analytics"

Headline:
"Stop guessing. Your Readiness Score
tells you exactly where you stand."

Sub:
"Not a grade. A GPS. Live, subject-by-subject mastery data
updated after every session — so you always know which
topic needs work next."

Feature chips (pill-cobalt + pill-amber):
"Live Readiness Score"
"Subject heatmap"
"Session history"
"Stamina tracking"    (amber)
"Pacing calendar"

Score legend card (below chips — cream card, no border-left):
┌─────────────────────────────────────────────┐
│ What the score actually means                │
│ ▬ 85–100%  Exam ready. Focus on weak spots. │
│ ▬ 60–84%   Getting there. Targeted review.  │
│ ▬ Below 60% At risk. Build the foundation.  │
└─────────────────────────────────────────────┘
Note: the color bars use full inline divs in camp colors — NOT a left-border card pattern
```

### Right: Analytics Mockup

```tsx
const AnalyticsMockup = () => (
  <div className='rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7] p-5'>

    {/* Overall score + ring */}
    <div className='mb-4 flex items-center gap-4'>
      <ReadinessRingSvg value={75} size='h-20 w-20' />
      <div>
        <div className='text-[18px] font-extrabold text-[#111]'>Getting there</div>
        <div className='mt-1 text-[11px] leading-relaxed text-[#6B6B6B]'>
          2 subjects need targeted review before you're exam-ready.
        </div>
        <div className='mt-2 font-mono text-[9px] text-[#888]'>↑ +8 pts this week</div>
      </div>
    </div>

    {/* Stat mini-grid */}
    <div className='mb-4 grid grid-cols-2 gap-2'>
      {[
        { label: 'Questions', value: '847', sub: 'answered total' },
        { label: 'Streak', value: '12', sub: 'days active', accent: '#F5A623' },
      ].map((stat) => (
        <div key={stat.label} className='rounded-[8px] bg-[#F2F0EB] p-3'>
          <div className='font-mono text-[8px] uppercase tracking-[.12em] text-[#888]'>{stat.label}</div>
          <div className='mt-1 text-[20px] font-extrabold' style={{ color: stat.accent || '#111' }}>
            {stat.value}
          </div>
          <div className='text-[10px] text-[#888]'>{stat.sub}</div>
        </div>
      ))}
    </div>

    {/* Subject bars */}
    <div className='font-mono text-[8px] uppercase tracking-[.15em] text-[#888] mb-2.5'>By Subject</div>
    {[
      { name: 'Structural Design',    pct: 85, color: '#1B3FC4' },
      { name: 'Building Technology',  pct: 62, color: '#F5A623' },
      { name: 'Architectural Theory', pct: 41, color: '#E63329' },
      { name: 'History of Arch.',     pct: 73, color: '#F5A623' },
      { name: 'Utilities (MEPFS)',    pct: 88, color: '#1B3FC4' },
    ].map((s) => (
      <div key={s.name} className='mb-2'>
        <div className='mb-1 flex justify-between font-mono text-[9px]'>
          <span className='text-[#888]'>{s.name}</span>
          <span style={{ color: s.color }}>{s.pct}%</span>
        </div>
        <div className='h-[5px] overflow-hidden rounded-full bg-[#E8E4DC]'>
          <div className='h-full rounded-full' style={{ width: `${s.pct}%`, background: s.color }} />
        </div>
      </div>
    ))}

  </div>
)
```

---

## SECTION 4: `WikiSection.tsx`

**Background:** `bg-[#F2F0EB]`
**Layout:** text RIGHT, mockup LEFT (`flip={true}`)

### Copy

```
Eyebrow: "Wiki"

Headline:
"Every code provision, every principle.
Organized like an encyclopedia.
Cited like a reference."

Sub:
"No more hunting through PDFs. The SlateCamp Wiki maps every ALE
topic to its source — PD 1096, RA 9266, NBCP, and more — with
your personal notes workspace alongside."

Feature chips (pill-green):
"All ALE subjects covered"
"Linked to questions"
"Personal notes workspace"
"PD 1096 · RA 9266 · NBCP"

Check items (accentColor=#1B7A3C):
① "Linked directly to quiz questions"
   "Tap any code citation in an explanation and jump straight to
   the full provision in the Wiki. Context and reference in one motion."

② "Your notes, your workspace"
   "Add personal notes to any topic. Highlight what matters to you.
   Annotations stay private and sync across devices."
```

### Left: Wiki Mockup

```tsx
const WikiMockup = () => (
  <div className='overflow-hidden rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7]'>

    {/* Header */}
    <div className='flex items-center gap-2.5 border-b border-[#E8E4DC] px-4 py-3'>
      <div className='h-2 w-2 rounded-full bg-[#1B7A3C]' />
      <span className='text-[13px] font-bold text-[#111]'>
        Building Technology — Firewall Requirements
      </span>
    </div>

    {/* Table of contents */}
    <div className='border-b border-[#E8E4DC] bg-[#F2F0EB] px-4 py-3'>
      <div className='mb-1.5 font-mono text-[8px] uppercase tracking-[.15em] text-[#888]'>On this page</div>
      {['Definition & Purpose', 'Height Requirements', 'Construction Standards', 'Common Exam Questions'].map((item) => (
        <div
          key={item}
          className='mb-1 border-l-2 border-[#1B7A3C] pl-2 text-[11px] text-[#1B7A3C]'
        >
          {item}
        </div>
        // NOTE: this border-l-2 is on a table-of-contents TOC item INSIDE a wiki card body.
        // This is an INTERNAL navigation indicator — not a card-level design pattern.
        // The rule "no single-sided colored borders" applies to CARD-level layout borders,
        // not to inline anchor indicators within a content body.
      ))}
    </div>

    {/* Article body */}
    <div className='px-4 py-4'>
      <h3 className='mb-2 text-[14px] font-bold text-[#111]'>Height Requirements</h3>
      <p className='mb-3 text-[11px] leading-relaxed text-[#6B6B6B]'>
        A firewall must extend at least 0.50m above the highest point of the roof it protects.
        For buildings with combustible roofs, the firewall must project at least 0.60m above
        the roofline on both sides.
      </p>
      <div className='mb-3 rounded-[6px] bg-[#111] px-3 py-2 font-mono text-[10px] text-[#4ade80]'>
        PD 1096 § 1207 — Firewall Construction
      </div>
      <div className='flex flex-wrap gap-1.5'>
        <span className='pill pill-green text-[8px]'>PD 1096</span>
        <span className='pill pill-cobalt text-[8px]'>Building Technology</span>
        <span className='text-[11px] text-[#1B3FC4] underline'>12 related questions →</span>
      </div>
    </div>

  </div>
)
```

---

## ADDING TO `page.tsx`

```tsx
// New imports
import { QuestionsSection }  from '@/components/marketing/QuestionsSection'
import { ThreeDLabSection }  from '@/components/marketing/ThreeDLabSection'
import { AnalyticsSection }  from '@/components/marketing/AnalyticsSection'
import { WikiSection }       from '@/components/marketing/WikiSection'

// In both LandingPageContent and LandingPageFallback, replace:
<BentoFeatureGrid />
<HowItWorksSection />

// With:
<BentoFeatureGrid />
<QuestionsSection />
<ThreeDLabSection />
<AnalyticsSection />
<WikiSection />
<HowItWorksSection />
```

---

## SEO: UPDATE KEYWORDS IN `page.tsx` metadata

Add these to the `keywords` array:

```ts
keywords: [
  'architecture board exam prep',
  'ALE exam prep',
  'ARE exam prep',
  'architecture exam reviewer Philippines',
  'ALE readiness score',
  'architecture quiz app Philippines',
  'ALE 3D building code viewer',
  'PD 1096 reviewer',
  'architecture wiki Philippines',
  'spaced repetition architecture exam',
  'SlateCamp',
]
```

Update description:

```ts
description:
  'The only ALE prep platform with a Readiness Score, 3D building code viewer, 2,400+ verified questions, and a complete PD 1096 wiki — built for the Philippine Architecture Licensure Exam.',
```

---

## DESIGN NOTES FOR IMPLEMENTATION

**Section background rhythm (revised with feature sections added):**
```
Hero            bg-[#F2F0EB]
SocialProofBar  bg-[#FFFDF7]
LogoMarquee     border-only, transparent
BentoGrid       bg-[#F2F0EB]
Questions       bg-[#F2F0EB]   ← light
3D Lab          bg-[#111111]   ← DARK — the one break
Analytics       bg-[#F2F0EB]   ← light
Wiki            bg-[#F2F0EB]   ← light
HowItWorks      bg-[#F2F0EB]
Comparison      bg-[#F2F0EB]
Testimonials    bg-[#F2F0EB]
FinalCTA        bg-[#111111]   ← DARK — closes the page
Footer          bg-[#111111]
```

The 3D Lab section is the only dark section in the middle of the page — intentional. It creates a dramatic visual break and makes the "only 3D viewer" feature feel like a different world. The page goes light → dark → light → dark — two punches of black that bracket the entire feature tour.

**Mockup cards:** All mockups are rendered React components, not screenshots or images. Keeps the page lightweight and crisp at all resolutions.

**Mobile:** All split layouts stack vertically. Mockup goes below copy on mobile. `grid-cols-1 md:grid-cols-2`.
