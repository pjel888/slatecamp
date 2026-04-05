# API Reference

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-04-06  
**Source-of-Truth:** `src/lib/actions/`, `src/lib/queries/`, `src/app/api/`

---

## Server Actions (`src/lib/actions/`)

**116 server action files.** All server actions:
- Include `"use server"` directive at top
- Are wrapped in try/catch
- Return typed responses `{ success: boolean, data?: T, error?: string }`
- Validate input with Zod schemas from `src/lib/validations/`

### Quiz & Testing Actions

| File | Purpose |
|------|---------|
| `testing.ts` | Session creation, interaction saving, 7 modes |
| `quiz.ts` | Legacy quiz flow with SRS integration |
| `quiz-v2/*.ts` | Modern quiz mode implementations |

### Content Actions

| File | Purpose |
|------|---------|
| `articles.ts` | Wiki article CRUD |
| `questions.ts` | Question CRUD + import |
| `taxonomy.ts` | Taxonomy node management |

### Admin Actions

| File | Purpose |
|------|---------|
| `admin/users.ts` | User management |
| `admin/content.ts` | Content management |
| `admin/publish.ts` | Publishing pipeline |

### Payment Actions

| File | Purpose |
|------|---------|
| `payments.ts` | Payment processing |
| `subscriptions.ts` | Subscription management |

### Analytics Actions

| File | Purpose |
|------|---------|
| `analytics.ts` | Analytics data mutations |
| `mastery.ts` | Mastery tracking updates |

---

## Query Modules (`src/lib/queries/`)

Query modules are read-oriented async functions for server components. Use these over inline Supabase queries in pages.

### Pattern

```typescript
// src/lib/queries/quiz-sessions.ts
export const getUserQuizSessions = async (userId: string) => {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id, mode, started_at, completed_at, score')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### Key Query Modules

| File | Purpose |
|------|---------|
| `users.ts` | User data |
| `quiz-sessions.ts` | Session queries |
| `mastery.ts` | Mastery data |
| `readiness.ts` | Readiness score queries |
| `articles.ts` | Wiki article queries |
| `questions.ts` | Question bank queries |
| `analytics.ts` | Analytics data |

---

## API Routes (`src/app/api/`)

### Authentication Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/callback` | GET | OAuth/SAML callback handler |

### Cron Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/cron/blindspot-scan` | POST | `Authorization: Bearer ${CRON_SECRET}` | Refresh blindspot queue |
| `/api/cron/compute-signals` | POST | `Authorization: Bearer ${CRON_SECRET}` | Recalculate signals |

### Payment Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/webhooks/payrex` | POST | Payrex webhook handler |

### Admin Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/admin/*` | Various | Admin role | Admin API operations |

### AI Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/embed` | POST | Embed article content |
| `/api/ai/generate-questions` | POST | AI question generation |
| `/api/ai/study-agent` | POST | AI study agent |
| `/api/ai/tutor` | POST | AI contextual tutor |

---

## API Response Format

### Success Response

```typescript
Response.json({ success: true, data: {...} }, { status: 200 })
Response.json({ success: true, data: [...] }, { status: 200 })
```

### Error Response

```typescript
Response.json({ success: false, error: 'Descriptive message' }, { status: 400 })
Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
Response.json({ success: false, error: 'Not found' }, { status: 404 })
Response.json({ success: false, error: 'Internal error' }, { status: 500 })
```

---

## Authorization Patterns

### Server Actions

```typescript
"use server"

import { getCurrentUser } from '@/lib/auth'

export const myAction = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')
  
  // Check role if needed
  if (user.role !== 'admin') throw new Error('Forbidden')
  
  // Proceed with action
}
```

### API Routes

```typescript
export async function POST(req: Request) {
  // Cron jobs
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Admin routes
  const session = await getSession()
  if (!session?.user || session.user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
}
```

---

## Rate Limiting

Rate limiting implemented in `src/lib/rate-limit.ts`. Apply to public API endpoints to prevent abuse.

---

## Related Documents

- `02-architecture/001-system-architecture.md` — Overall architecture
- `02-architecture/002-portal-breakdown.md` — Portal structure
- `04-development/004-coding-standards.md` — Server action patterns
