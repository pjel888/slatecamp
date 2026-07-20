/// <reference types="bun-types" />
import { describe, expect, mock, test, beforeEach } from 'bun:test'

// ---------------------------------------------------------------------------
// After Plan 013, the orchestrator delegates to a SINGLE call:
// `applyInteraction`, the canonical mastery-row writer. We mock it here to
// assert: (a) it is invoked exactly once with the merged params, (b) defaults
// are applied correctly for omitted optional fields, (c) rejections from
// applyInteraction propagate (the fire-and-forget swallowing now lives
// INSIDE applyInteraction, not in the orchestrator).
// ---------------------------------------------------------------------------

const applyInteractionMock = mock(() => Promise.resolve())

mock.module('@/lib/mastery/apply-interaction', () => ({
  applyInteraction: applyInteractionMock,
}))

const { runPostInteractionHooks } = await import('./post-interaction-hooks')

const baseParams = {
  userId: 'user-1',
  topicId: 'topic-1',
  questionId: 'q-1',
  isCorrect: true,
  timeSpentMs: 5000,
  avgTimeMs: 10000,
  difficulty: 0.5,
  isInterleaved: false,
  sessionMode: 'chill',
  emaWeightMultiplier: 1.0,
  isSuspectedLuckyGuess: false,
}

describe('runPostInteractionHooks — orchestration (Plan 013)', () => {
  beforeEach(() => {
    applyInteractionMock.mockReset()
    applyInteractionMock.mockImplementation(() => Promise.resolve())
  })

  test('delegates to applyInteraction exactly once (no N-way fan-out)', async () => {
    await runPostInteractionHooks(baseParams)
    expect(applyInteractionMock).toHaveBeenCalledTimes(1)
    expect(applyInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        topicId: 'topic-1',
        questionId: 'q-1',
        isCorrect: true,
        timeSpentMs: 5000,
        avgTimeMs: 10000,
        difficulty: 0.5,
        isInterleaved: false,
        sessionMode: 'chill',
        emaWeightMultiplier: 1.0,
        isSuspectedLuckyGuess: false,
      }),
    )
  })

  test('passes defaults for omitted optional fields (difficulty=0.5, isInterleaved=false, sessionMode="", emaWeightMultiplier=1.0, isSuspectedLuckyGuess=false)', async () => {
    const minimal = {
      userId: 'user-1',
      topicId: 'topic-1',
      questionId: 'q-1',
      isCorrect: true,
      timeSpentMs: 5000,
      avgTimeMs: 10000,
    }
    await runPostInteractionHooks(minimal)
    expect(applyInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        difficulty: 0.5,
        isInterleaved: false,
        sessionMode: '',
        emaWeightMultiplier: 1.0,
        isSuspectedLuckyGuess: false,
      }),
    )
  })

  test('propagates applyInteraction rejection (swallowing is now internal to applyInteraction)', async () => {
    applyInteractionMock.mockImplementation(() =>
      Promise.reject(new Error('applyInteraction failed')),
    )
    await expect(runPostInteractionHooks(baseParams)).rejects.toThrow('applyInteraction failed')
  })

  test('forwards emaWeightMultiplier and isSuspectedLuckyGuess through', async () => {
    await runPostInteractionHooks({
      ...baseParams,
      emaWeightMultiplier: 1.2,
      isSuspectedLuckyGuess: true,
    })
    expect(applyInteractionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        emaWeightMultiplier: 1.2,
        isSuspectedLuckyGuess: true,
      }),
    )
  })
})

