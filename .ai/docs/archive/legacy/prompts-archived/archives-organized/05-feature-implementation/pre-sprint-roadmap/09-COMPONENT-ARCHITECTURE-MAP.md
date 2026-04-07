# SlateCamp — Component Architecture Map
## Current Component Tree & Conventions for New Files
### 2026-03-26

---

## Purpose

The Product Roadmap plans 88 new files across 8 phases. A developer building these files needs to know: what shared components already exist for reuse, what the directory structure convention is for feature-specific components, and where each new file belongs. This document provides that map.

---

## How to Regenerate

```bash
# Full component tree (2 levels deep)
find src/components -maxdepth 2 -type f | sort

# Full app route tree
find src/app -name "page.tsx" -o -name "layout.tsx" -o -name "loading.tsx" -o -name "error.tsx" | sort

# Count components by directory
find src/components -name "*.tsx" | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

---

## Directory Structure Convention

```
src/
├── app/                            # Next.js App Router routes
│   ├── (marketing)/                # Route group: public marketing pages
│   │   ├── page.tsx                # Landing page
│   │   ├── about/page.tsx          # About page (Phase 1)
│   │   ├── contact/page.tsx        # Contact page (Phase 1)
│   │   └── layout.tsx              # Marketing layout (no sidebar)
│   │
│   ├── dashboard/                  # Route group: authenticated app
│   │   ├── page.tsx                # Main dashboard
│   │   ├── layout.tsx              # Dashboard layout (with sidebar)
│   │   ├── testing/                # Testing hub
│   │   │   ├── page.tsx            # Testing hub index
│   │   │   ├── session/page.tsx    # Active quiz session
│   │   │   ├── explore/page.tsx    # Question browser (Phase 2)
│   │   │   └── simulation/
│   │   │       └── compare/page.tsx # Simulation comparison (Phase 2)
│   │   ├── wiki/                   # Wiki system
│   │   │   ├── page.tsx            # Wiki index
│   │   │   ├── [slug]/page.tsx     # Individual article
│   │   │   └── search/page.tsx     # Wiki search (Phase 2)
│   │   ├── analytics/page.tsx      # Analytics dashboard
│   │   ├── notes/page.tsx          # Notes system
│   │   ├── trail/page.tsx          # Camp Trail
│   │   ├── 3d-lab/page.tsx         # 3D Lab
│   │   ├── campfire/               # Campfire community (Phase 5)
│   │   │   ├── page.tsx            # Feed
│   │   │   └── [threadId]/page.tsx # Thread detail
│   │   ├── schedule/page.tsx       # Study calendar (Phase 2)
│   │   ├── referral/page.tsx       # Referral program (Phase 4)
│   │   └── settings/
│   │       ├── page.tsx            # Settings index
│   │       ├── profile/page.tsx    # Profile editing (Phase 1)
│   │       └── billing/page.tsx    # Billing (deferred)
│   │
│   ├── institution/                # Institutional portal (Phase 8)
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── students/page.tsx       # Student roster
│   │   ├── performance/page.tsx    # Aggregate analytics
│   │   └── settings/page.tsx       # Institution settings
│   │
│   ├── onboarding/                 # Onboarding flow
│   │   └── page.tsx                # Multi-step onboarding (includes retaker branch)
│   │
│   ├── api/                        # API routes
│   │   ├── webhooks/
│   │   │   ├── lemonsqueezy/route.ts     # LemonSqueezy webhook handler
│   │   │   └── payrex/route.ts     # PayRex webhook handler
│   │   └── debug-taxonomy/route.ts # 🔴 DELETE THIS (unauthenticated data exposure)
│   │
│   ├── login/page.tsx              # Auth: login
│   ├── signup/page.tsx             # Auth: signup
│   └── layout.tsx                  # Root layout
│
├── components/                     # All React components
│   ├── ui/                         # Shadcn UI primitives (DO NOT MODIFY)
│   │   ├── button.tsx
│   │   ├── card.tsx                # ⚠️ Only 37 usages vs 465 ad-hoc card divs
│   │   ├── tooltip.tsx
│   │   ├── skeleton.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   └── ...                     # Other Shadcn components
│   │
│   ├── shared/                     # Shared components used across features
│   │   ├── question-card.tsx       # ⚠️ Has 3 unsanitized dangerouslySetInnerHTML (XSS)
│   │   ├── sidebar.tsx             # Dashboard sidebar navigation
│   │   ├── header.tsx              # Page header
│   │   └── ...
│   │
│   ├── dashboard/                  # Dashboard-specific components
│   │   ├── ReadinessScoreCard.tsx   # Main readiness score display
│   │   ├── StudyHeatmap.tsx        # Activity heatmap ('use client')
│   │   ├── SubjectMasteryBars.tsx  # Subject mastery breakdown
│   │   ├── SubjectFloorAlert.tsx   # 🔮 PLANNED (Feature 5)
│   │   ├── StreakCounter.tsx       # 🔮 PLANNED (Phase 3)
│   │   ├── HeatmapDelta.tsx       # 🔮 PLANNED (Phase 3)
│   │   ├── ExamCountdown.tsx      # 🔮 PLANNED (Phase 5)
│   │   ├── skeletons/
│   │   │   ├── StudyHeatmapSkeleton.tsx
│   │   │   └── ...
│   │   └── settings/
│   │       ├── ProfileEditor.tsx   # 🔮 PLANNED (Phase 1)
│   │       └── NotificationSettings.tsx # 🔮 PLANNED (Phase 3)
│   │
│   ├── testing/                    # Testing hub components
│   │   ├── SessionRunner.tsx       # Active quiz session engine
│   │   ├── ModeSelector.tsx        # Testing mode selection
│   │   ├── SubjectPicker.tsx       # Subject/topic selection
│   │   ├── QuestionBrowser.tsx     # 🔮 PLANNED (Phase 2)
│   │   ├── SimulationCompare.tsx   # 🔮 PLANNED (Phase 2)
│   │   └── ...
│   │
│   ├── wiki/                       # Wiki components
│   │   ├── ArticleContent.tsx      # Wiki article renderer
│   │   ├── ElaborativeInterrogation.tsx # ✅ Correctly sanitizes HTML
│   │   ├── WikiSearchPage.tsx      # 🔮 PLANNED (Phase 2)
│   │   └── ...
│   │
│   ├── analytics/                  # Analytics dashboard components
│   │   ├── [8 visualization components]
│   │   └── ...
│   │
│   ├── trail/                      # Camp Trail components
│   │   └── ...
│   │
│   ├── 3d-lab/                     # 3D Lab components
│   │   └── ...
│   │
│   ├── onboarding/                 # Onboarding flow components
│   │   ├── OnboardingWizard.tsx    # Multi-step wizard
│   │   ├── RetakerBranch.tsx       # 🔮 PLANNED (Feature 2)
│   │   └── ...
│   │
│   ├── campfire/                   # 🔮 PLANNED (Phase 5)
│   │   ├── CampfireFeed.tsx
│   │   ├── ThreadCard.tsx
│   │   ├── ThreadDetail.tsx
│   │   ├── ReplyEditor.tsx
│   │   ├── PasserBadge.tsx
│   │   └── HallOfPassers.tsx
│   │
│   ├── referral/                   # 🔮 PLANNED (Phase 4)
│   │   ├── ReferralCodeCard.tsx
│   │   └── ...
│   │
│   ├── institution/                # 🔮 PLANNED (Phase 8)
│   │   ├── InstitutionDashboard.tsx
│   │   ├── StudentRoster.tsx
│   │   └── ...
│   │
│   ├── sharing/                    # 🔮 PLANNED (Phase 4)
│   │   ├── ShareableScoreCard.tsx
│   │   └── ...
│   │
│   ├── area-c/                     # 🔮 PLANNED (Feature 3)
│   │   ├── DevControlsCalculator.tsx
│   │   ├── DesignProblemLibrary.tsx
│   │   └── ComplianceChecklist.tsx
│   │
│   ├── cram-card/                  # 🔮 PLANNED (Feature 4)
│   │   ├── CramCardGenerator.tsx
│   │   └── CramCardPDF.tsx
│   │
│   └── marketing/                  # Marketing page components
│       ├── HeroSection.tsx
│       ├── FeatureSectionLayout.tsx
│       └── ...
│
├── lib/                            # Business logic, utilities, server code
│   ├── actions/                    # Server Actions (see Document 02)
│   ├── queries/                    # Query functions (see Document 02)
│   ├── srs/                        # SRS + IRT engine
│   ├── supabase/                   # Supabase client setup
│   ├── config/
│   │   └── flags.ts                # Feature flags (see Document 05)
│   ├── brand/
│   │   └── BrandProvider.tsx       # 🔮 PLANNED (Phase 8) — white-label theming
│   └── utils.ts                    # Shared utilities
│
├── stores/                         # Zustand stores
│   ├── useSessionStore.ts          # Quiz session state
│   └── ...
│
├── types/                          # TypeScript types
│   ├── database.ts                 # Auto-generated from Supabase (DO NOT EDIT MANUALLY)
│   ├── dashboard.ts                # Dashboard component props
│   ├── testing.ts                  # Testing hub types
│   └── common.ts                   # Shared types (QueryResult, etc.)
│
└── styles/
    └── globals.css                 # Global styles + CSS custom properties (design tokens)
```

---

## Reusable Components Reference

### Shadcn UI Components (`src/components/ui/`)

These are pre-built, pre-styled. Use them instead of building custom equivalents.

| Component | Import | When to Use |
|---|---|---|
| `Button` | `@/components/ui/button` | All clickable actions |
| `Card` / `CardHeader` / `CardContent` | `@/components/ui/card` | **Use for ALL cards** — 92% of cards currently bypass this |
| `Tooltip` / `TooltipProvider` | `@/components/ui/tooltip` | Non-obvious metrics, icon buttons |
| `Skeleton` | `@/components/ui/skeleton` | Loading states |
| `Badge` | `@/components/ui/badge` | Status indicators, labels |
| `Alert` | `@/components/ui/alert` | Non-critical notifications. **Not for Subject Floor Alert** (custom component needed) |
| `Dialog` | `@/components/ui/dialog` | Modal confirmations |
| `Input` | `@/components/ui/input` | Form text inputs |
| `Select` | `@/components/ui/select` | Dropdowns |
| `Tabs` | `@/components/ui/tabs` | Tabbed interfaces |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Context menus, action menus |

### Shared Components (`src/components/shared/`)

| Component | Purpose | Import |
|---|---|---|
| `question-card.tsx` | Renders a quiz question with options | `@/components/shared/question-card` |
| `sidebar.tsx` | Dashboard sidebar navigation | `@/components/shared/sidebar` |

---

## Component Creation Conventions

### Naming
- **PascalCase** for component files: `SubjectFloorAlert.tsx`
- **Named exports** for all components (not default exports — except routing files)
- **Prop interfaces** in the same file or in `src/types/[feature].ts`

### File Placement Decision Tree

```
Is it a Shadcn UI primitive?
  YES → src/components/ui/ (installed via npx shadcn-ui add)
  NO  ↓

Is it used across multiple features (dashboard, testing, wiki, etc.)?
  YES → src/components/shared/
  NO  ↓

Which feature does it belong to?
  Dashboard → src/components/dashboard/
  Testing   → src/components/testing/
  Wiki      → src/components/wiki/
  Campfire  → src/components/campfire/
  [feature] → src/components/[feature]/
```

### Skeleton File Placement

Every data-driven component needs a skeleton. Place skeletons in a `skeletons/` subdirectory:

```
src/components/dashboard/
├── SubjectFloorAlert.tsx
├── ReadinessScoreCard.tsx
└── skeletons/
    ├── SubjectFloorAlertSkeleton.tsx
    └── ReadinessScoreCardSkeleton.tsx
```

### Client vs Server Decision

```
Default: Server Component (no directive)
Add 'use client' ONLY if the component uses:
  - useState, useEffect, useRef, useCallback, useMemo
  - Browser APIs (window, document, navigator)
  - Event handlers (onClick, onChange, onSubmit)
  - Zustand store
  - Third-party client-only libraries (recharts, three.js, etc.)
```

**Push `'use client'` as deep as possible.** A page.tsx should almost never be `'use client'` — extract the interactive part into a child component.

---

## Page File Convention

Every `page.tsx` follows this structure:

```tsx
// src/app/dashboard/[feature]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { FeatureComponent } from '@/components/[feature]/FeatureComponent'
import { FeatureSkeleton } from '@/components/[feature]/skeletons/FeatureSkeleton'

export default async function FeaturePage() {
  // 1. Auth guard
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Data fetching (parallel)
  const [data1, data2] = await Promise.all([
    fetchData1(user.id),
    fetchData2(user.id),
  ])

  // 3. Component assembly with Suspense
  return (
    <div>
      <Suspense fallback={<FeatureSkeleton />}>
        <FeatureComponent data={data1} />
      </Suspense>
    </div>
  )
}
```

**Rules for page.tsx:**
- No inline component definitions (extract to `src/components/`)
- No `'use client'` directive (push to child components)
- No direct Supabase calls (use query functions from `src/lib/queries/`)
- Auth guard is always the first operation

---

## New Files Summary (From Product Roadmap)

| Phase | New Files | Key New Components |
|---|---|---|
| 1 | ~8 | `ProfileEditor.tsx`, `about/page.tsx`, `contact/page.tsx`, `contact.ts`, `profile.ts` |
| 2 | ~12 | `WikiSearchPage.tsx`, `QuestionBrowser.tsx`, `StudyCalendar.tsx`, `SimulationCompare.tsx` |
| 3 | ~15 | `StreakCounter.tsx`, `HeatmapDelta.tsx`, `NotificationSettings.tsx`, `manifest.json`, `sw.js` |
| 4 | ~10 | `ShareableScoreCard.tsx`, `ReferralCodeCard.tsx`, `ActivationFunnel.tsx` |
| 5 | ~20 | `CampfireFeed.tsx`, `ThreadCard.tsx`, `ThreadDetail.tsx`, `ReplyEditor.tsx`, `PasserBadge.tsx`, `HallOfPassers.tsx`, `ExamCountdown.tsx` |
| 6 | ~0 | Modifications only (design token migration, icon consolidation) |
| 7 | ~8 | `NPSSurvey.tsx`, `OutcomeCorrelation.tsx`, `GrowthMetrics.tsx` |
| 8 | ~15 | `BrandProvider.tsx`, `InstitutionDashboard.tsx`, `StudentRoster.tsx`, `3DLabStandalone.tsx` |
| **Total** | **~88** | |

---

## Icon Library Usage

**Current state:** Lucide in 189 files, Phosphor in 135 files, with no domain boundary. ~60KB waste.

**Target state (Phase 6):** Consolidate to ONE library.

**Until consolidation:** Use Lucide for new components. Do not add new Phosphor imports.

```tsx
// ✅ Use Lucide for new code
import { Flame, Target, BookOpen } from 'lucide-react'

// ❌ Do not add new Phosphor imports
import { Fire } from '@phosphor-icons/react'  // DO NOT USE IN NEW CODE
```

---

## Design Token Usage

**Current state:** 2,576 hardcoded hex values bypass the token system.

**Until migration (Phase 6):** Use CSS custom properties for new components.

```tsx
// ✅ Use tokens
<div className="bg-primary text-primary-foreground">
<div className="text-muted-foreground">
<div style={{ color: 'var(--signal-red)' }}>

// ❌ Do not add new hardcoded hex values
<div className="bg-[#1B3FC4]">  // Add to config instead
<div className="text-[#E63329]"> // Use signal-red token
```

---

*Document version: 2026-03-26 · Pre-implementation baseline*
*Regenerate the file tree after significant structural changes.*

