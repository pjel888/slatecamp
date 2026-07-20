'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { assertDeveloperAccess } from '@/lib/developer/access'
import { checkRateLimit } from '@/lib/rate-limit'
import { logServerEvent } from '@/lib/logging/server'

/**
 * Generate mock quiz sessions for the current user.
 */
export async function generateTestSessions(count: number) {
  await assertDeveloperAccess()
  const {
    data: { user },
  } = await getUser()

  if (!user) throw new Error('Not authenticated')

  // Rate limiting
  const rateLimitKey = `generate-test-sessions:${user.id}`
  const rateLimit = await checkRateLimit(rateLimitKey)
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`)
  }

  // Input validation
  const validatedCount = Math.max(1, Math.min(100, Math.floor(count)))

  await logServerEvent({
    severity: 'info',
    family: 'developer',
    eventName: 'test_sessions_generation_disabled',
    message: 'Developer test session generation is disabled until it is rebuilt for the current quiz schema.',
    context: {
      routeOrAction: 'generateTestSessions',
      userId: user.id,
      metadata: { requestedCount: validatedCount },
    },
  })

  return {
    message:
      'Test session generation is disabled until the developer tool is rebuilt for the current quiz_sessions/taxonomy schema.',
  }
}

/**
 * Generate a test organization with the current user as owner.
 */
export async function generateTestOrg() {
  await assertDeveloperAccess()

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) throw new Error('Not authenticated')

  // Rate limiting
  const rateLimitKey = `generate-test-org:${user.id}`
  const rateLimit = await checkRateLimit(rateLimitKey)
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`)
  }

  const slug = `test-org-${Date.now()}`

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Test University',
      slug,
      type: 'educational',
      max_seats: 50,
    })
    .select()
    .single()

  if (orgError) {
    return { message: `Failed to create org: ${orgError.message}` }
  }

  const { error: memberError } = await supabase.from('organization_members').insert({
    org_id: org.org_id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    return { message: `Org created but failed to add member: ${memberError.message}` }
  }

  await logServerEvent({
    severity: 'info',
    family: 'developer',
    eventName: 'test_org_generated',
    message: `Created test organization ${slug}`,
    context: {
      routeOrAction: 'generateTestOrg',
      userId: user.id,
      metadata: { orgId: org.org_id, slug },
    },
  })

  return { message: `Created organization "${org.name}" (${slug}) with you as owner.` }
}
