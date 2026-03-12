import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { isDemoMode } from '@/lib/demo/config'
import { createMockSupabaseClient } from '@/lib/demo/mock-supabase'

export async function createClient() {
  if (isDemoMode()) {
    await cookies()
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >
  }

  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll called from Server Component — safe to ignore
          }
        },
      },
    },
  )
}

export async function hasAuthCookie() {
  const cookieStore = await cookies()
  const all = cookieStore.getAll()

  return all.some((cookie) => {
    const name = cookie.name.toLowerCase()
    return name.startsWith('sb-') || name.startsWith('supabase-')
  })
}

export const getUserIfPresent = cache(async () => {
  const hasCookie = await hasAuthCookie()

  if (!hasCookie) {
    return {
      data: { user: null },
      error: null,
    } as Awaited<ReturnType<ReturnType<typeof createServerClient>['auth']['getUser']>>
  }

  const supabase = await createClient()
  return supabase.auth.getUser()
})

export const getUser = cache(async () => {
  return getUserIfPresent()
})
