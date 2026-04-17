# Coding Standards

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `CLAUDE.md`, `AGENTS.md`

---

## Absolute Rules (Never Violate)

### Code Style

- **Arrow functions only** — never use `function` declarations
  ```typescript
  // ✅ CORRECT
  const handleClick = () => { /* ... */ }
  
  // ❌ WRONG
  function handleClick() { /* ... */ }
  ```

### Server Components

- **Server Components by default** — add `'use client'` only when interactivity is needed
- Target: <40% client component ratio across the codebase
- Never fetch data in client components with `useEffect` — use Server Components instead

### Design Tokens

- **Use design tokens from `globals.css`** — never hardcode hex colors
  ```tsx
  // ✅ CORRECT
  <div className="bg-primary text-foreground" />
  
  // ❌ WRONG
  <div style={{ backgroundColor: '#1B3FC4' }} />
  ```

### Supabase Queries

- **Explicit column selects** — never `select('*')`
  ```typescript
  // ✅ CORRECT
  supabase.from('users').select('id, email, full_name')
  
  // ❌ WRONG
  supabase.from('users').select('*')
  ```

### Server Actions

- **All server action files must include `"use server"`** directive at the top
- **Wrap in try/catch** — never let raw Supabase errors propagate to client

---

## TypeScript

| Setting | Current Value | Recommendation |
|---------|--------------|----------------|
| `strict` | `false` | Consider enabling |
| `noImplicitAny` | `false` | Consider enabling |
| `strictNullChecks` | `false` | Consider enabling |

**Note:** TypeScript is currently not in strict mode. New code should aim for strict compliance.

- **No `any` types** — use `unknown` with type narrowing instead

---

## Data Fetching

- **Use `Promise.all()` for independent queries** — never sequential `await` in page.tsx files
  ```typescript
  // ✅ CORRECT — parallel
  const [user, sessions, mastery] = await Promise.all([
    getUser(userId),
    getUserSessions(userId),
    getUserMastery(userId),
  ])
  
  // ❌ WRONG — sequential
  const user = await getUser(userId)
  const sessions = await getUserSessions(userId)
  const mastery = await getUserMastery(userId)
  ```

- **Use Suspense boundaries** for independent data sections
- **Loading skeletons** via `loading.tsx` — 87/105 pages have loading states

---

## Import Organization

1. React / Next.js built-ins
2. Third-party libraries
3. `@/` path alias imports (project code)
4. Relative imports
5. Type imports (`import type { ... }`)

---

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Server Components | `page.tsx`, `layout.tsx` | `src/app/dashboard/page.tsx` |
| Client Components | `*.client.tsx` or inline `'use client'` | `Answer.client.tsx` |
| Server Actions | `*.ts` (not .tsx) | `src/lib/actions/quiz.ts` |
| Query Modules | `*.ts` | `src/lib/queries/users.ts` |
| Zustand Stores | `*.ts` | `src/stores/useLabStore.ts` |
| Utilities | `*.ts` | `src/lib/utils/format.ts` |
| Types | `*.ts` | `src/types/app.ts` |

---

## Server Actions

```typescript
"use server"

import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  mode: z.enum(['camp', 'storm', 'chill']),
  questionCount: z.number().min(1).max(100),
})

export const createSession = async (input: z.infer<typeof CreateSessionSchema>) => {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')
    
    const validated = CreateSessionSchema.parse(input)
    
    // ... mutation logic
    
    revalidatePath('/dashboard/testing')
    return { success: true, data: session }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' }
    }
    console.error('createSession error:', error)
    return { success: false, error: 'Something went wrong' }
  }
}
```

---

## Component Patterns

### Card Pattern

```tsx
// ✅ CORRECT — use shadcn/ui Card
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

// ❌ WRONG — ad-hoc card div
<div className="rounded-md border bg-background shadow-sm p-6">
```

### Button Pattern

```tsx
// ✅ CORRECT
import { Button } from '@/components/ui/button'
<Button>Submit</Button>

// ❌ WRONG
<button className="rounded-sm bg-primary px-4 py-2">Submit</button>
```

---

## HTML Sanitization

Always sanitize before `dangerouslySetInnerHTML`:

```tsx
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userContent)
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

---

## Package Manager

**Bun only.** Never npm, yarn, or pnpm.

```bash
bun install      # Install
bun add <pkg>    # Add dependency
bun remove <pkg>  # Remove dependency
bun run <script>  # Run script
bun test         # Run tests
```

---

## Prohibited

- ❌ `function` declarations
- ❌ `select('*')` in Supabase
- ❌ Hardcoded hex values (use design tokens)
- ❌ Unwrapped server actions
- ❌ Sequential `await` in page.tsx
- ❌ `npm`/`yarn`/`pnpm` commands
- ❌ Generic gamification (confetti, badges, virtual currency, empty streaks)
- ❌ `any` types without comment explaining why
- ❌ Unsanitized `dangerouslySetInnerHTML`
- ❌ `useEffect` for data fetching in new code

---

*Source: `CLAUDE.md`, `AGENTS.md`*
