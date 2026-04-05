'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { revalidateDashboardCacheTags } from './cache-tags'

export interface TeachBackCriteria {
  criteria_id: string
  topic_id: string
  required_concepts: string[]
  required_exceptions: string[]
  common_misconceptions: string[]
  code_citations: string[]
}

export interface TeachBackEvaluation {
  score: number
  gaps: string[]
  correct_points: string[]
  factual_errors: string[]
  revision_prompt: string
}

export interface TeachBackSubmission {
  submission_id: string
  user_id: string
  topic_id: string
  entry_point: 'wiki' | 'blindspot' | 'trail'
  prompt_text: string
  student_response: string
  evaluation_result: TeachBackEvaluation | Record<string, never>
  gaps_identified: string[]
  revised_response: string | null
  submitted_at: string
  revised_at: string | null
}

/**
 * Get teach-back criteria for a topic (if SMEs have authored them).
 */
export const getTeachBackCriteria = async (
  topicId: string,
): Promise<TeachBackCriteria | null> => {
  const supabase = await createClient()

  const { data } = await supabase
    .from('topic_teach_back_criteria')
    .select('criteria_id, topic_id, required_concepts, required_exceptions, common_misconceptions, code_citations')
    .eq('topic_id', topicId)
    .limit(1)
    .maybeSingle()

  return data as TeachBackCriteria | null
}

/**
 * Submit a teach-back response for AI evaluation.
 */
export const submitTeachBack = async (params: {
  topicId: string
  topicName: string
  entryPoint: 'wiki' | 'blindspot' | 'trail'
  promptText: string
  studentResponse: string
  trailDayId?: string
}): Promise<{
  submission: TeachBackSubmission
  evaluation: TeachBackEvaluation
}> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Get criteria for this topic
  const criteria = await getTeachBackCriteria(params.topicId)

  // Evaluate via Claude API
  const evaluation = await evaluateTeachBack({
    topicName: params.topicName,
    studentResponse: params.studentResponse,
    criteria,
  })

  // Save submission
  const { data: submission, error } = await supabase
    .from('teach_back_submissions')
    .insert({
      user_id: user.id,
      topic_id: params.topicId,
      entry_point: params.entryPoint,
      trail_day_id: params.trailDayId || null,
      prompt_text: params.promptText,
      student_response: params.studentResponse,
      evaluation_result: evaluation,
      gaps_identified: evaluation.gaps,
    })
    .select()
    .single()

  if (error) throw error

  // Update mastery tracking
  await supabase
    .from('user_node_mastery')
    .update({
      teach_back_attempted: true,
      teach_back_gap_count: evaluation.gaps.length,
    })
    .eq('user_id', user.id)
    .eq('topic_id', params.topicId)

  revalidateDashboardCacheTags(user.id)

  return {
    submission: submission as TeachBackSubmission,
    evaluation,
  }
}

/**
 * Submit a revised teach-back response.
 */
export const submitRevision = async (
  submissionId: string,
  revisedResponse: string,
): Promise<{ success: boolean }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('teach_back_submissions')
    .update({
      revised_response: revisedResponse,
      revised_at: new Date().toISOString(),
    })
    .eq('submission_id', submissionId)
    .eq('user_id', user.id)

  if (error) throw error

  revalidateDashboardCacheTags(user.id)

  return { success: true }
}

/**
 * AI evaluation of teach-back response using Claude API.
 * Temperature 0.0 — no creativity, pure assessment.
 */
const evaluateTeachBack = async (params: {
  topicName: string
  studentResponse: string
  criteria: TeachBackCriteria | null
}): Promise<TeachBackEvaluation> => {
  const { topicName, studentResponse, criteria } = params

  const systemPrompt = `You are evaluating a student's explanation of "${topicName}" for a professional licensure exam.

${criteria ? `Required concepts: ${criteria.required_concepts.join(', ')}
Required exceptions: ${criteria.required_exceptions.join(', ')}
Code citations expected: ${criteria.code_citations.join(', ')}
Common misconceptions to watch for: ${criteria.common_misconceptions.join(', ')}` : `Evaluate based on general knowledge of "${topicName}" for professional exam preparation.`}

Evaluate the student's explanation on 5 dimensions:
1. Conceptual completeness (did they cover the core mechanism?)
2. Causal reasoning (did they explain WHY, not just WHAT?)
3. Accuracy (any factually incorrect claims?)
4. Code specificity (did they reference relevant codes or standards?)
5. Missing critical exceptions

Output JSON only, no markdown:
{
  "score": 0-100,
  "gaps": ["gap1", "gap2"],
  "correct_points": ["point1", "point2"],
  "factual_errors": ["error1"],
  "revision_prompt": "one focused question to improve the explanation"
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0.0,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Student's explanation:\n\n${studentResponse}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[teach-back] API error:', response.status)
      return fallbackEvaluation()
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallbackEvaluation()

    const parsed = JSON.parse(jsonMatch[0])
    return {
      score: parsed.score ?? 50,
      gaps: parsed.gaps ?? [],
      correct_points: parsed.correct_points ?? [],
      factual_errors: parsed.factual_errors ?? [],
      revision_prompt: parsed.revision_prompt ?? 'Can you elaborate further?',
    }
  } catch (error) {
    console.error('[teach-back] Evaluation failed:', error)
    return fallbackEvaluation()
  }
}

const fallbackEvaluation = (): TeachBackEvaluation => ({
  score: 0,
  gaps: ['Evaluation unavailable — please try again later.'],
  correct_points: [],
  factual_errors: [],
  revision_prompt: 'Try explaining the concept again in your own words.',
})
