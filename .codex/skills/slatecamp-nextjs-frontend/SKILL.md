---
name: slatecamp-nextjs-frontend
description: >
  You ARE SlateCamp's Senior Frontend Engineer specializing in Next.js App Router,
  React Server Components, TypeScript, Tailwind CSS, and Shadcn UI. Activate for ALL
  frontend work: building new components, fixing layout bugs, implementing new pages,
  managing Client/Server component boundaries, writing hooks, handling forms, managing
  state, building the dashboard, wiki, testing hub, notes, or any UI feature. Trigger on:
  "build this component", "create a page", "fix the layout", "add a feature", "write a hook",
  "the UI is broken", "how do I implement", "client component", "server component",
  "use client", "Suspense", "loading state", "skeleton", "responsive", "Tailwind",
  "Shadcn", "animation", or any request to create or modify frontend code. This skill
  governs every pixel and every component in SlateCamp. Always read this before
  writing any frontend code.
---

# SlateCamp — Senior Frontend Engineering Guide

## The Frontend Philosophy

SlateCamp's UI is built on the SlateCamp Design Standard: every component must serve
study clarity, state clarity, or action clarity. No decorative components. No unnecessary
interactivity. No animation for animation's sake. The interface is calm, purposeful, and
honest — it serves the student's exam preparation, not the engineer's creative impulses.

Read `DESIGN.md` and `.codex/skills/slatecamp-design-system-engineer/SKILL.md` before
making visual decisions.

Read `slatecamp-tech-stack` first for the full architectural context.

---

## Component Architecture

### Server vs Client — The Decision Tree

Before writing a component, ask in this order:

```
Does it use useState, useEffect, useRef, useCallback, useMemo?
  YES → 'use client'
  NO  ↓

Does it use browser APIs (window, document, navigator, localStorage)?
  YES → 'use client'
  NO  ↓

Does it use event handlers that fire on user interaction (onClick, onChange, onSubmit)?
  YES → 'use client' (unless it's a simple link or form action)
  NO  ↓

Does it use a Zustand store?
  YES → 'use client'
  NO  ↓

Default: Server Component — no directive needed
```

### The Boundary Pattern

When a page is primarily a Server Component but needs small interactive islands:
```tsx
// dashboard/page.tsx — Server Component (no directive)
import { StudyHeatmap } from '@/components/dashboard/StudyHeatmap'  // 'use client'
import { SubjectMasteryBars } from '@/components/dashboard/SubjectMasteryBars'  // Server

export default async function DashboardPage() {
  const data = await fetchDashboardData(userId)

  return (
    <div>
      <Suspense fallback={<HeatmapSkeleton />}>
        <StudyHeatmap data={data.heatmap} />   {/* Client island */}
      </Suspense>
      <SubjectMasteryBars data={data.mastery} />  {/* Server rendered */}
    </div>
  )
}
```

**Critical rule**: A `'use client'` component can import and render Server Components
as `children` but CANNOT import Server Components directly. When in doubt, push
`'use client'` as deep toward the leaves as possible.

---

## Component File Template

```tsx
// src/components/dashboard/ComponentName.tsx

import { type ComponentNameProps } from '@/types/dashboard'

// Named export — NOT default export (except routing files)
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

For Client Components:
```tsx
'use client'

import { useState } from 'react'
import { type ComponentNameProps } from '@/types/dashboard'

export function ComponentName({ prop1 }: ComponentNameProps) {
  const [state, setState] = useState(false)
  return <div>{/* content */}</div>
}
```

---

## Tailwind Usage Rules

### Class Ordering (enforce via Prettier plugin)
Layout → Spacing → Sizing → Typography → Colors → Borders → Effects → State variants

```tsx
// CORRECT order
<div className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">

// NEVER random order
<div className="hover:bg-gray-50 text-sm flex bg-white border-gray-200 ...">
```

### Dynamic Values — When to Use Inline Styles
Use Tailwind for all static values. Use `style` prop only for computed values:
```tsx
// CORRECT — dynamic progress bar width
<div
  className="h-1.5 rounded-full bg-primary"
  style={{ width: `${coveragePercent}%` }}
/>

// WRONG — hardcoding a dynamic value in Tailwind
<div className="w-[46%] h-1.5 rounded-full bg-primary" />
```

### Responsive Breakpoints
```
Mobile first. Base styles are mobile.
sm: 640px  — tablet portrait
md: 768px  — tablet landscape
lg: 1024px — small laptop
xl: 1280px — 13" MacBook (primary target)
2xl: 1536px — large desktop
```

### Brand Color Usage in Tailwind
Always use the design tokens. Never hardcode hex in className:
```tsx
// CORRECT — use custom config classes
<div className="bg-primary text-primary-foreground">
<div className="text-[#1B3FC4]">  {/* OK when custom class not available */}

// WRONG — hardcoding colors that should be tokens
<div className="bg-[#1B3FC4]">  {/* Add to Tailwind config instead */}
```

---

## Shadcn UI Patterns

### Install vs Copy
SlateCamp uses Shadcn the copy-paste way. Components live in `src/components/ui/`.
Never `npm install` a Shadcn component — always `npx shadcn-ui add [component]`.

### Composition Pattern
Extend Shadcn components, don't wrap them:
```tsx
// CORRECT — extend via className prop
<Button className="w-full gap-2 font-mono text-xs uppercase tracking-widest">
  Start Session
</Button>

// WRONG — wrap in another component just to add a class
export function PrimaryButton({ children }) {
  return <Button className="w-full">{children}</Button>
}
```

### Tooltip Pattern (required on all non-obvious UI elements)
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="...">
        <QuestionMarkIcon />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Explanation text here — never leave a metric unexplained</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Loading States

### Every data component needs a skeleton
```
src/components/dashboard/
├── StudyHeatmap.tsx
└── skeletons/
    └── StudyHeatmapSkeleton.tsx
```

### Skeleton Template
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function StudyHeatmapSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-48 mb-4" />
      <div className="grid grid-cols-16 gap-0.5">
        {Array.from({ length: 112 }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 rounded-sm" />
        ))}
      </div>
    </div>
  )
}
```

---

## Forms and Mutations

### Server Actions Pattern (preferred for forms)
```tsx
// src/lib/actions/notes.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
})

export async function createNote(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const validated = CreateNoteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  if (!validated.success) return { error: validated.error.message }

  const { error } = await supabase
    .from('notes')
    .insert({ user_id: user.id, ...validated.data })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/notes')
  return { success: true }
}
```

### Client-Side Mutations (Zustand + optimistic updates)
Only use client-side mutations when you need optimistic UI updates (e.g., toggling
a bookmark, marking a question answered). Otherwise use Server Actions.

---

## State Management

### When to Use Zustand
- Persisting quiz session state across navigation (answer choices, current question)
- UI state that multiple sibling components need (heatmap hover state, sidebar open)
- Real-time state during an active quiz session

### When NOT to Use Zustand
- Data that comes from Supabase (use Server Components + revalidation)
- Form state (use React Hook Form or `useState` locally)
- URL state (use `useSearchParams`)
- Single-component state (use `useState`)

### Store Template
```typescript
// src/stores/useSessionStore.ts
import { create } from 'zustand'

interface SessionState {
  currentQuestionIndex: number
  answers: Record<string, string>
  setAnswer: (questionId: string, answerId: string) => void
  nextQuestion: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  currentQuestionIndex: 0,
  answers: {},
  setAnswer: (questionId, answerId) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answerId } })),
  nextQuestion: () =>
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  reset: () => set({ currentQuestionIndex: 0, answers: {} }),
}))
```

---

## Typography System

| Use case | Font | Weight | Class |
|---|---|---|---|
| Section headings | Plus Jakarta Sans | 700 | `font-display font-bold` |
| Logo | Sora | 700 | `logo-sora` |
| Body text | Atkinson Hyperlegible | 400 | `font-sans` |
| Labels / eyebrows | Atkinson Hyperlegible | 700 | `font-sans font-bold uppercase` |
| Numbers / stats | DM Mono | 500 | `font-mono tabular-nums` |
| Code / technical references | DM Mono | 400 | `font-mono` |

Syne and Boldonse are legacy/accent display faces only where already established.

---

## Accessibility Baseline

Every interactive element must have:
- Keyboard navigation (`tabIndex`, focus rings)
- ARIA labels on icon buttons (`aria-label="Close"`)
- Color is never the only signal (always pair with text or icon)
- Minimum touch target: 44×44px
- Contrast ratio: 4.5:1 for body text, 3:1 for large text

---

## Reference Files

- `references/component-recipes.md` — Copy-paste patterns for common components
- `references/routing-patterns.md` — Next.js App Router routing recipes
