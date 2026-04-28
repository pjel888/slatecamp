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

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()

  if (!user) throw new Error('Not authenticated')

  // Rate limiting
  const rateLimitKey = `generate-test-sessions:${user.id}`
  const rateLimit = checkRateLimit(rateLimitKey)
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`)
  }

  // Input validation
  const validatedCount = Math.max(1, Math.min(100, Math.floor(count)))

  // Get user's active exam profile
  const { data: profile } = await supabase
    .from('exam_profiles')
    .select('id, board_exam_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!profile) {
    return { message: 'No active exam profile found. Complete onboarding first.' }
  }

  // Get some subjects for the exam
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('board_exam_id', profile.board_exam_id)
    .limit(3)

  if (!subjects?.length) {
    return { message: 'No subjects found for your exam profile.' }
  }

  const sessionTypes = ['subject_quick', 'custom_compiled', 'topic_drill'] as const
  let created = 0

  for (let i = 0; i < validatedCount; i++) {
    const sessionType = sessionTypes[i % sessionTypes.length]
    const subject = subjects[i % subjects.length]

    const { error } = await supabase.from('review_sessions').insert({
      user_id: user.id,
      exam_profile_id: profile.id,
      session_type: sessionType,
      source_subject_id: subject.id,
      config: {
        subjects: [{ subject_id: subject.id, question_count: 10 }],
        shuffle_questions: true,
        show_immediate_feedback: true,
      },
      name: `Test Session ${i + 1} - ${subject.name}`,
      total_questions: 10,
      questions_answered: Math.floor(Math.random() * 10),
      questions_correct: Math.floor(Math.random() * 8),
      questions_incorrect: Math.floor(Math.random() * 3),
      questions_skipped: 0,
      total_time_ms: Math.floor(Math.random() * 300000) + 60000,
      status: i % 3 === 0 ? 'completed' : 'in_progress',
      subject_scores: [],
      started_at: new Date().toISOString(),
    })

    if (!error) created++
  }

  await logServerEvent({
    severity: 'info',
    family: 'developer',
    eventName: 'test_sessions_generated',
    message: `Generated ${created}/${validatedCount} test sessions`,
    context: {
      routeOrAction: 'generateTestSessions',
      userId: user.id,
      metadata: { count: validatedCount, created },
    },
  })

  return { message: `Generated ${created}/${validatedCount} test sessions.` }
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
  const rateLimit = checkRateLimit(rateLimitKey)
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
