# Project Cerebro — Product Requirements Document v3.0

**Updated:** 2026-03-08 · **Target:** Architecture students, graduates & board exam takers (Philippines-first)
**Purpose:** This document is the single source of truth for Cerebro. It is engineered for AI-assisted development with Cursor IDE and Claude Code. Paste relevant sections into `.cursorrules`, `CLAUDE.md`, or reference directly.

---

## 1. Product Identity

**Cerebro** is the second brain for board exam takers. It is the app students open when they want to study, review, and prepare — from college all the way through licensure.

**Positioning:** Not just a quiz app. Cerebro is a study homebase that happens to have the best quiz engine in the market. The value is in the data it collects, the intelligence it surfaces, and the habit it builds.

**Tagline:** *Your second brain for board exams.*

**Phase 1 Market:** Architecture students and graduates preparing for the Architecture Licensure Exam (ALE) in the Philippines.

**Designed for expansion:** The data model supports any profession with a college → graduate → board exam pipeline (medicine, engineering, law, pharmacy, etc.). The Exam Profile switcher is a day-one feature, even if only architecture content exists at launch.

---

## 2. Target Users

### Primary: Architecture Board Exam Pipeline (Philippines)

| Segment | Who | How They Use Cerebro |
|---|---|---|
| **College Students** (Years 3-5) | Architecture students who want to start reviewing early | Review Mode for daily study. Browse 3D library. Build subject familiarity. |
| **Fresh Graduates** | Preparing for ALE within 6-12 months of graduation | Sessions Mode with analytics. SRS for retention. AI insights for study planning. |
| **Repeat Takers** | Failed ALE once or more, highly motivated | Intensive Sessions. AI-powered weak area identification. Predictive scoring. |
| **Working Professionals** | Employed but unlicensed, studying on commute | Mobile Review Mode (doomscroll). Short focused sessions. |

### Future: Multi-Profession Expansion

The Exam Profile switcher allows a user to add any supported board exam. The same user could be reviewing for ALE and also browsing engineering content. The database, UI, and analytics are all scoped per Exam Profile.

Planned professions: Medicine (PLE), Civil Engineering, Mechanical Engineering, Chemical Engineering, Electrical Engineering, Pharmacy, Law (Bar Exam), Nursing, Accountancy (CPA).

---

## 3. The Three Modes of Learning

Cerebro has **three distinct modes**. Each serves a different cognitive purpose and collects data differently.

### Mode 1: Review Mode — "The Doomscroll"

**Purpose:** Low-pressure study. Browse questions, learn from explanations, build familiarity. No scores, no timers, no pressure.

**Metaphor:** Instagram for studying. The user opens the app, swipes through questions, and absorbs knowledge passively-actively.

**UX:**
- Infinite scroll of questions (one at a time, full-screen)
- User taps an answer choice
- Regardless of right or wrong, a rich information panel expands:
  - The correct answer highlighted
  - A detailed explanation
  - Reference material (text, images, links)
  - Fun facts or mnemonics
  - Related topics
  - "See this in 3D" link (if applicable)
- Swipe up or tap "Next" for the next question
- No progress bar, no score counter, no timer
- Filtered by subject or topic (user can lock to "Building Technology" or browse "All Subjects")

**Data Collection:**
- **Minimal tracking** — we log which questions were seen and whether the user's initial tap was correct/incorrect, but this data is NOT surfaced to the user as analytics
- This data is used internally for SRS seeding (if the user later upgrades to Pro) and for our internal content analytics (which questions get the most engagement)
- The user NEVER sees analytics from Review Mode — this is intentional to keep it stress-free

**Available to:** All tiers (Free, Pro, Max)

**Schema impact:**
```
review_mode_interactions (lightweight table)
- user_id
- exam_profile_id  
- question_id
- initial_tap_correct (boolean)
- viewed_at (timestamp)
- time_on_question_ms (how long before they swiped away)
```

---

### Mode 2: Sessions Mode — "The Focused Review"

**Purpose:** Structured, tracked, analytics-driven test-taking. This is where the user gets serious.

**Two sub-types:**

#### 2a. Pre-Built Subject Sessions
- Created and curated by the Cerebro platform
- One session per subject (e.g., "Building Technology Session", "Building Utilities Session")
- User selects a subject → chooses how many random questions (10 / 25 / 50 / 100)
- Questions are randomized from that subject's pool
- Full analytics tracked

#### 2b. Custom Compiled Sessions
- User builds their own session from multiple subjects
- Example: 20 from History of Architecture + 10 from Theory + 40 from Structural Engineering = 70 total questions
- User controls the count per subject
- (Pro/Max) User can even hand-pick specific questions to include
- Can be saved as a reusable template
- Full analytics tracked

**UX:**
- Clean, focused quiz interface (this is THE most important screen)
- Single question centered on screen, max-width 720px
- Answer choices as full-width touch targets
- After answering: correct/incorrect feedback + explanation panel
- Progress bar at top
- Optional timer
- Session summary at the end with per-subject breakdown

**Data Collection (RICH):**
- Every answer logged to `session_questions` with:
  - Which answer was selected
  - Whether it was correct
  - Response time in milliseconds
  - Question position in session (for fatigue analysis)
  - Timestamps (presented_at, answered_at)
  - Bookmark flag
- Session-level aggregates computed at completion
- Per-subject breakdowns stored in session record
- **Question-level lifetime stats** — across ALL sessions, we track how many times each question has been answered correctly/incorrectly by this user. This is critical for the "Review Buddy" analytics.

**Available to:**
- Free: Pre-built subject sessions only, basic summary (score + correct/incorrect count)
- Pro: Custom compiled sessions + detailed analytics + per-question history + SRS integration
- Max: Everything above + AI-generated insights + individual question picking + predictive scoring

---

### Mode 3: Visual Learning / 3D Library — "The Explorer"

**Purpose:** Spatial and visual learning. Browse 3D models, interact with architectural elements, learn through exploration, and optionally take quizzes linked to what you're viewing.

**UX:**
- Browse 3D models organized by subject and topic
- Each model has interactive callout points (labels in 3D space)
- Tap a callout → info panel with term, definition, reference image
- Models support: orbit/rotate, zoom, layer toggle, explode view, cross-section
- "Quiz Me" button on callouts → starts a mini-quiz filtered to that element
- "Start Full Quiz" → quiz session with all questions linked to this model

**Examples for Architecture:**
- History: Greek/Roman temples with labeled orders, parts
- Building Tech: Wall sections, foundation details, roof assemblies
- Utilities: Plumbing riser diagrams, HVAC ductwork, electrical panels
- Structural: Truss types, beam connections, reinforcement details
- Design: Floor area ratio visualizations, building height requirements, setback models

**Data Collection:**
- Which models were viewed, for how long
- Which callouts were tapped
- 3D quiz results feed into the same analytics pipeline as Sessions Mode

**Available to:** Pro and Max tiers

---

## 4. User Tiers & Pricing

| | **Free** | **Pro** (₱499/mo) | **Max** (₱999/mo) |
|---|---|---|---|
| **Review Mode** | ✓ (all subjects) | ✓ | ✓ |
| **Subject Sessions** | ✓ (50 Qs/day limit) | ✓ (unlimited) | ✓ (unlimited) |
| **Custom Compiled Sessions** | — | ✓ | ✓ |
| **Hand-pick Questions** | — | — | ✓ |
| **Session Templates** | — | ✓ (save & reuse) | ✓ |
| **Session Retakes** | — | ✓ | ✓ |
| **Per-Question History** | — | ✓ ("Seen 5x, correct 3x") | ✓ |
| **Analytics Dashboard** | Basic (score only) | Detailed charts + reports | Full + AI insights |
| **AI Study Recommendations** | — | — | ✓ ("Add 1hr/day to Structures") |
| **Study Time Tracking** | — | ✓ | ✓ |
| **SRS (Spaced Repetition)** | — | ✓ | ✓ |
| **3D Library** | Preview (3 models) | ✓ (full library) | ✓ |
| **3D Quizzes** | — | ✓ | ✓ |
| **AI Socratic Tutor** | — | — | ✓ |
| **Predictive Score Model** | — | — | ✓ |
| **PDF Ingestion** | — | ✓ (10 docs/mo) | ✓ (unlimited) |
| **Marketplace** | Browse | Buy + Sell | Buy + Sell |
| **Exam Profile Switcher** | ✓ (2 profiles) | ✓ (5 profiles) | ✓ (unlimited) |

---

## 5. Exam Profile System

### Concept

An **Exam Profile** is the user's board exam identity. It scopes everything: which subjects appear, which questions are available, which analytics are shown, and which SRS queue is active.

A user can have multiple Exam Profiles. An architecture graduate who's also studying for a real estate broker exam has two profiles. Switching is instant.

### UX

- **Profile switcher** in the top-left header (dropdown, like Slack workspace switcher)
- Each profile shows: exam name, target date, days remaining
- "Add Exam Profile" at the bottom
- Switching reloads the entire dashboard context

### At Launch

Only Architecture Licensure Exam (ALE - Philippines) has content. But the switcher UI exists, and users can create profiles for other exams (with a "Coming Soon — content arriving Q3 2026" label). This builds the waitlist and signals the platform's ambition.

---

## 6. Question Schema — Rich Content Model

Every question is more than a prompt and four choices. It's a learning unit.

```
QUESTION OBJECT
├── prompt (text, supports markdown + LaTeX)
├── prompt_image_url (hero image for the question)
├── choices[] (array of 4 options)
│   ├── id ("a", "b", "c", "d")
│   ├── text (the choice text)
│   ├── image_url (optional — for visual choices)
│   └── is_correct (boolean)
├── correct_answer ("a")
├── explanation (rich text — WHY this is the answer)
├── explanation_image_url (diagram, photo, etc.)
├── references[] (array of reference objects)
│   ├── title ("National Building Code Section 701")
│   ├── url (optional link)
│   ├── page (optional page number)
│   └── type ("book", "code", "standard", "article", "video")
├── fun_facts[] (array of strings — interesting tidbits)
├── mnemonics (memory aid text, optional)
├── related_topic_ids[] (links to related topics for exploration)
├── difficulty (easy / medium / hard / expert)
├── tags[] (freeform tags for filtering)
├── has_3d_component (boolean)
├── three_d_model_id (link to 3D model if applicable)
├── model_callout_id (specific callout point on the model)
├── question_type (mcq for now — schema supports future types)
│   future: true_false, identification, matching, sequencing, essay
├── image_urls[] (additional reference images)
└── metadata
    ├── subject_id
    ├── topic_id  
    ├── creator_id
    ├── is_official (platform-curated vs user-generated)
    ├── global_times_answered
    ├── global_times_correct
    └── global_accuracy_percentage
```

### Why This Matters

When a user answers a question (in Review Mode OR Sessions Mode), the post-answer view shows:
1. ✓ or ✗ with correct answer highlighted
2. **Explanation** — the "why"
3. **Reference image** — a visual aid
4. **References** — where to study more (book name, section number, link)
5. **Fun fact** — makes it memorable
6. **Related topics** — "Want to learn more? Check out: Concrete Mix Design, Rebar Specifications"
7. **3D link** — "See this in 3D" → opens the model viewer

This richness is what makes Cerebro a **learning platform**, not just a quiz app.

---

## 7. Analytics — The "Review Buddy"

### What We Track (for Pro/Max users)

**Per User:**
- Total study time on platform (cumulative, per day, per week)
- Session count, frequency, average duration
- Streak data (current, longest, calendar heatmap)

**Per Question (lifetime, across all sessions):**
- Times this question was presented to this user
- Times answered correctly
- Times answered incorrectly
- Accuracy percentage
- Average response time
- Trend: improving, declining, or stable
- Last attempt date and result

**Per Subject:**
- Mastery percentage (calculated from recent 50 responses in that subject)
- Total questions attempted
- Accuracy over time (trend line)
- Average response time
- Weakest topics within the subject

**Per Session:**
- Score (overall and per-subject)
- Time taken (total and per-question average)
- Response time distribution (where did you slow down?)
- Comparison with previous attempts (retake delta)
- Difficulty distribution (how did you do on easy vs hard?)

### AI-Powered Insights (Max tier)

The analytics don't just report — they **prescribe:**

```
AI INSIGHT EXAMPLES:

"Your Building Technology accuracy dropped 8% this week. 
You're averaging 42 seconds per question (vs 18 seconds in 
your strong subjects). Cerebro recommends: add 45 minutes of 
focused Building Technology review per day this week."

"You've studied 14 hours this week (up from 9 last week). 
At this pace, your predicted ALE score is 78%. To reach 85%, 
focus on Structural Engineering — it's your lowest domain at 61%."

"You've seen Question #2847 four times and gotten it wrong 
every time. The topic is 'Moment of Inertia.' Here are 3 related 
questions that test the same concept from different angles."
```

### Study Time Tracking

We track how long the user spends on the platform:
- Time in Review Mode (passive study time)
- Time in Sessions Mode (active study time)
- Time in 3D Library (visual learning time)
- Idle detection: if the user hasn't interacted for 2 minutes, stop the clock
- Daily/weekly/monthly summaries
- Target setting: "I want to study 2 hours per day" → progress bar on dashboard

---

## 8. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database/Auth** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Vector Store** | Supabase pgvector |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **3D Engine** | React Three Fiber + @react-three/drei |
| **AI** | OpenAI API (abstracted, swappable to Anthropic) |
| **Payments** | Stripe |
| **Deployment** | Vercel |
| **Analytics** | PostHog |
| **Email** | Resend |

### Architecture Rules (ENFORCE IN EVERY AI SESSION)

1. **Server Components by default.** Only add `'use client'` when you need useState, useEffect, event handlers, or browser APIs.
2. **Server Actions for all mutations.** Never expose Supabase writes client-side.
3. **`@supabase/ssr` for auth.** NEVER use localStorage for auth state.
4. **No `useEffect` for data fetching.** Use RSC async functions.
5. **RLS on every table.** No exceptions. Policies defined before features.
6. **TypeScript strict mode.** No `any` types. Use Supabase-generated types.
7. **Mobile-first.** Touch targets min 44px. Bottom nav on mobile.
8. **Optimistic UI for quiz interactions.** Sub-100ms perceived latency.

---

## 9. Design System — "Rams Standard"

Inspired by Dieter Rams and Braun: "Less, but better." The UI disappears so the content breathes.

### Colors

```css
:root {
  /* Achromatic Foundation */
  --snow:       #F5F3F0;     /* Primary background */
  --bone:       #E8E4DF;     /* Card surfaces, secondary bg */
  --ash:        #D0CBC4;     /* Borders, dividers */
  --slate:      #9C9C9C;     /* Muted text, placeholders */
  --graphite:   #5F503E;     /* Secondary text */
  --charcoal:   #372E3D;     /* Primary text, headings */
  --ink:        #1A1A1A;     /* Maximum contrast (sparingly) */

  /* Functional Accents */
  --amber:      #ED8008;     /* Primary CTA, progress, active states */
  --green:      #4A7C59;     /* Correct, success */
  --red:        #BF1B1B;     /* Incorrect, error */
  --blue:       #6B8FA3;     /* Info, links, secondary actions */
  --gold:       #BF7C2A;     /* Achievements, streaks */

  /* Surfaces */
  --card-bg:     #FFFFFF;
  --card-border: #E8E4DF;
  --card-shadow: 0 1px 3px rgba(26,26,26,0.06);
}
```

### Design Rules for AI Code Generation

- **Buttons:** Solid fill for primary (amber bg). Ghost for secondary. No gradients.
- **Cards:** White bg, 1px border, subtle shadow. `border-radius: 8px`.
- **Transitions:** All interactive elements: `transition: all 150ms ease`.
- **Motion:** Mechanical and precise, like a Braun dial. No bouncy spring animations.
- **Icons:** Lucide only. Stroke 1.5px. 20px default.
- **Loading:** Skeleton screens, never spinners.
- **Quiz UI:** Single column, `max-width: 720px`, centered. Full-screen immersive on mobile.
- **Empty states:** One line of muted text + CTA button. No illustrations.

---

## 10. Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Next.js 15 + Supabase SSR Auth + Tailwind + shadcn/ui
- Database schema deployed with RLS
- Auth flow (register, login, magic link)
- Onboarding (select board exam, target date, create Exam Profile)
- Dashboard layout with profile switcher
- Subject cards grid (architecture subjects seeded)

### Phase 2: Review Mode (Week 3)
- Infinite question scroll with rich post-answer content
- Subject/topic filtering
- Lightweight interaction tracking
- Mobile-optimized doomscroll UX

### Phase 3: Sessions Mode (Weeks 4-5)
- Pre-built subject sessions with question count selection
- Custom compiled session builder
- Quiz engine with optimistic UI
- Session summary with per-subject breakdown
- Session history and retake functionality
- Per-question lifetime stats tracking

### Phase 4: Analytics (Week 6)
- Dashboard widgets (streak, mastery radar, recent sessions)
- Analytics page (performance over time, subject breakdown, response time analysis)
- Study time tracking
- Question-level analytics (times seen, accuracy, trend)
- Weekly email reports

### Phase 5: 3D Library (Weeks 7-8)
- React Three Fiber model viewer
- 3D model browser by subject
- Interactive callout points
- 3D → Quiz integration
- Layer toggle, explode view

### Phase 6: AI Layer (Weeks 9-10)
- SRS (SM-2 algorithm)
- PDF ingestion pipeline (upload, parse, chunk, embed)
- Socratic AI Tutor (RAG-powered)
- AI study recommendations
- Predictive score modeling (IRT)

### Phase 7: Marketplace & Monetization (Weeks 11-12)
- Stripe subscriptions (Pro/Max)
- Marketplace (buy/sell question banks)
- Session templates sharing
- Polish, accessibility audit, PWA

---

## 11. ALE Subject Seed Data

```
Architecture Licensure Exam (ALE) — Philippines
├── History of Architecture
│   ├── Ancient Architecture (Egyptian, Mesopotamian)
│   ├── Classical Architecture (Greek, Roman)
│   ├── Medieval Architecture (Romanesque, Gothic)
│   ├── Renaissance & Baroque
│   ├── Modern Architecture (Art Nouveau, Bauhaus, International Style)
│   ├── Contemporary Architecture
│   └── Philippine Architecture
├── Theory of Architecture
├── Architectural Design
├── Building Technology
│   ├── Concrete Technology
│   ├── Steel & Metals
│   ├── Wood & Timber
│   ├── Masonry
│   ├── Finishes & Coatings
│   └── Construction Methods
├── Structural Engineering
├── Building Utilities
│   ├── Plumbing & Sanitary
│   ├── Electrical Systems
│   ├── HVAC
│   ├── Fire Protection
│   └── Acoustics
├── Professional Practice
├── Architectural Laws (BP 344, PD 1096, RA 9266, NBC)
├── Site Planning
└── Tropical Design
```
