import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { isDemoMode } from '@/lib/demo/config'
import { createMockSupabaseClient } from '@/lib/demo/mock-supabase'

export const createStaticClient = cache(async () => {
  if (isDemoMode()) {
    return createMockSupabaseClient() as any
  }

  const isDevBypass = process.env.NODE_ENV === 'development' && !!process.env.DEV_FORCE_USER_ID
  const key = isDevBypass ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
  )
})

export const createServiceClient = cache(async () => {
  if (isDemoMode()) {
    return createMockSupabaseClient() as any
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
})

export const createClient = cache(async () => {
  if (isDemoMode()) {
    return createMockSupabaseClient() as unknown as ReturnType<
      typeof createServerClient
    >
  }

  const cookieStore = await cookies()
  const isDevBypass = process.env.NODE_ENV === 'development' && !!process.env.DEV_FORCE_USER_ID
  const key = isDevBypass 
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
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
  if (process.env.NODE_ENV === 'development' && process.env.DEV_FORCE_USER_ID) {
    const rawId = process.env.DEV_FORCE_USER_ID.trim()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)
    
    if (isUuid) {
      const headersList = await headers()
      const host = headersList.get('host') || ''
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

      if (isLocal) {
        // Fetch the real user using the service role key so that metadata (avatar, name) is present
        const adminClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data: adminData } = await adminClient.auth.admin.getUserById(rawId)
        
        const userObj = adminData?.user || {
          id: rawId,
          aud: 'authenticated',
          app_metadata: {},
          user_metadata: {}
        }

        return {
          data: { user: userObj as any },
          error: null,
        }
      }
    } else {
      console.warn(`DEV_FORCE_USER_ID is set but is not a valid UUID: "${process.env.DEV_FORCE_USER_ID}"`)
    }
  }

  const supabase = await createClient()
  return await supabase.auth.getUser()
})

export const getUser = cache(async () => {
  return getUserIfPresent()
})
