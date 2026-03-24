<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# supabase

## Purpose

Supabase client factory and utilities. Handles creation of authenticated browser/server clients, admin (service-role) clients, middleware clients, and error formatting. Abstracts away environment variable loading and client configuration.

## Key Files

| File | Description |
|------|-------------|
| **client.ts** | Browser client factory (`createClient()`); handles demo mode mock |
| **server.ts** | Server client factory (`createClient()`, `getUser()`, `hasAuthCookie()`); uses cookies for auth |
| **admin.ts** | Admin client factory (`createAdminClient()`); uses service role key, no refresh |
| **middleware.ts** | Middleware client for auth state refresh in `middleware.ts` |
| **bootstrap.ts** | Initial client setup, environment validation |
| **format-error.ts** | Supabase error formatter; converts DB errors to readable messages |

## For AI Agents

### Working In This Directory

1. **Client creation is lazy** — clients are created on-demand, not globally.
2. **Browser vs Server** — use `client.ts` in React components, `server.ts` in Server Actions.
3. **Admin client** — only use in admin actions; has full database access.
4. **Demo mode** — all clients return mock clients if `isDemoMode()` is true.
5. **No auth cookie management** — cookies are handled by Next.js + Supabase SSR adapter.
6. **Error formatting** — use `formatSupabaseError()` to convert database errors to user-facing messages.

### Common Patterns

**In a Server Action:**
```typescript
'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export async function fetchUserData() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()

  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('user_id', user.id)

  return { data, error }
}
```

**In a Client Component:**
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('table_name')
      .on('*', payload => console.log(payload))
      .subscribe()
  }, [supabase])
}
```

**Admin mutation:**
```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function deleteRecord(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id)

  return { error }
}
```

**Error formatting:**
```typescript
import { formatSupabaseError } from '@/lib/supabase/format-error'

const { error } = await supabase.from('table').insert([data])
if (error) {
  const message = formatSupabaseError(error)
  // message is now user-friendly ("Email already exists" instead of "duplicate key value")
}
```

## Dependencies

### Internal

- `@/lib/demo/config` — isDemoMode check
- `@/lib/demo/mock-supabase` — createMockSupabaseClient

### External

- `@supabase/ssr` — createBrowserClient, createServerClient
- `@supabase/supabase-js` — createClient (admin)
- `next/headers` — cookies
- `react` — cache, useCallback
