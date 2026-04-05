# API Reference

**Analysis Date:** 2026-04-06

## Overview

API reference documentation at `/developer/api-reference/`. Documents all API endpoints with request/response schemas and authentication requirements.

**Source:** `src/app/developer/api-reference/`

## API Categories

### Server Actions (Primary)

All mutations via Server Actions in `src/lib/actions/`:
- 116 server action files
- All marked with `"use server"` directive
- Called from client components

**Pattern:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const myAction = async (input: MyInput): Promise<MyOutput> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Mutate...
  return result
}
```

### API Routes

REST-style endpoints in `src/app/api/`:
- `/api/auth/*` — Authentication callbacks
- `/api/ai/*` — AI tutor endpoints (embed, generate-questions, study-agent, tutor)
- `/api/cron/*` — Scheduled job endpoints
- `/api/payments/*` — Stripe/PayRex webhooks
- `/api/admin/*` — Admin-only endpoints

### Authentication

| Endpoint Type | Auth Method |
|--------------|-------------|
| Server Actions | `getUser()` from `@/lib/supabase/server` |
| API Routes | Bearer token in `Authorization` header |
| Cron Jobs | `Authorization: Bearer ${CRON_SECRET}` |

### Request Validation

All API routes use Zod schemas from `src/lib/validations/`:
```typescript
import { z } from 'zod'
const MySchema = z.object({ field: z.string() })
```

**Source:** `src/lib/validations/`

### Error Handling

Structured error responses:
```typescript
Response.json({ error: 'Descriptive message', code: 'VALIDATION_ERROR' }, { status: 400 })
```

Never expose raw database errors to clients.

---

*API reference: 2026-04-06*
