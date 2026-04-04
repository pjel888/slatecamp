import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { isDemoMode } from '@/lib/demo/config'
import { createMockSupabaseClient } from '@/lib/demo/mock-supabase'

export const createStaticClient = cache(async () => {
  if (isDemoMode()) {
    return createMockSupabaseClient() as any
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
})

export const createClient = cache(async () => {
  if (isDemoMode()) {
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
})

export async function hasAuthCookie() {
  const cookieStore = await cookies()
  const all = cookieStore.getAll()

  return all.some((cookie) => {
    const name = cookie.name.toLowerCase()
    // Look specifically for the auth token, ignoring meta cookies like code-verifier
    return (
      (name.startsWith('sb-') && name.includes('-auth-token')) ||
      name.startsWith('supabase-auth-token')
    )
  })
}

export const getUserIfPresent = cache(async () => {
  if (isDemoMode()) {
    const { DEMO_USER } = await import('@/lib/demo/config')
    return {
      data: { user: DEMO_USER as any },
      error: null,
    }
  }

  // Strategy A: Local ID Impersonation (Development Only)
  // If DEV_FORCE_USER_ID is set in .env.local, we trust it if no session exists.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_FORCE_USER_ID) {
    const hasCookie = await hasAuthCookie()
    if (!hasCookie) {
      // Return a minimal user object with the forced ID
      // Most components only need user.id
      return {
        data: { 
          user: { 
            id: process.env.DEV_FORCE_USER_ID,
            aud: 'authenticated',
            app_metadata: {},
            user_metadata: {}
          } as any 
        },
        error: null,
      }
    }
  }

  const hasCookie = await hasAuthCookie()

  if (!hasCookie) {
    return {
      data: { user: null },
      error: null,
    } as Awaited<ReturnType<ReturnType<typeof createServerClient>['auth']['getUser']>>
  }

  const supabase = await createClient()
  const result = await supabase.auth.getUser()
  if (result.data.user) return result

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return { data: { user: session.user }, error: null }
  }

  return result
})

export const getUser = cache(async () => {
  return getUserIfPresent()
})
