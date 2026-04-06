import { wikiTeachBackEvaluationFixture } from '@/storybook/fixtures/wiki'

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

export const getTeachBackCriteria = async (
  topicId: string,
): Promise<TeachBackCriteria | null> => ({
  criteria_id: 'storybook-criteria',
  topic_id: topicId,
  required_concepts: ['occupant load', 'travel distance', 'fire separation'],
  required_exceptions: ['sprinkler exception'],
  common_misconceptions: ['treating occupancy as a fixed label'],
  code_citations: ['NBCP Rule 10'],
})

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
}> => ({
  submission: {
    submission_id: 'storybook-submission',
    user_id: 'storybook-user',
    topic_id: params.topicId,
    entry_point: params.entryPoint,
    prompt_text: params.promptText,
    student_response: params.studentResponse,
    evaluation_result: wikiTeachBackEvaluationFixture,
    gaps_identified: wikiTeachBackEvaluationFixture.gaps,
    revised_response: null,
    submitted_at: '2026-04-06T10:00:00.000Z',
    revised_at: null,
  },
  evaluation: wikiTeachBackEvaluationFixture,
})

export const submitRevision = async (
  _submissionId: string,
  _revisedResponse: string,
) => ({ success: true })
