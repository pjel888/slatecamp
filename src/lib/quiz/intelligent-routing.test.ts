import { describe, expect, test } from 'bun:test'

import { deriveQuestionStatesFromInteractions } from './intelligent-routing'

describe('intelligent routing history fallback', () => {
  test('derives latest question states from canonical interactions', () => {
    const states = deriveQuestionStatesFromInteractions([
      {
        question_id: 'question-1',
        is_correct: false,
        interaction_timestamp: '2026-04-01T00:00:00.000Z',
      },
      {
        question_id: 'question-1',
        is_correct: true,
        interaction_timestamp: '2026-04-02T00:00:00.000Z',
      },
      {
        question_id: 'question-2',
        is_correct: false,
        interaction_timestamp: '2026-04-03T00:00:00.000Z',
      },
    ])

    expect(states).toEqual([
      {
        question_id: 'question-1',
        last_is_correct: true,
        last_seen_at: '2026-04-02T00:00:00.000Z',
      },
      {
        question_id: 'question-2',
        last_is_correct: false,
        last_seen_at: '2026-04-03T00:00:00.000Z',
      },
    ])
  })

  test('ignores incomplete interaction rows', () => {
    const states = deriveQuestionStatesFromInteractions([
      {
        question_id: null,
        is_correct: true,
        interaction_timestamp: '2026-04-01T00:00:00.000Z',
      },
      {
        question_id: 'question-1',
        is_correct: null,
        interaction_timestamp: '2026-04-02T00:00:00.000Z',
      },
    ])

    expect(states).toEqual([])
  })
})
