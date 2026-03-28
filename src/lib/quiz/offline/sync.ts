// ─── Offline Sync Manager (Doc 6 §8.2) ──────────────────────────────────────
// Handles online/offline detection and answer queue flushing

import {
  getPendingAnswers,
  removePendingAnswer,
  incrementRetryCount,
  getPendingCount,
} from './db'

const MAX_RETRIES = 5

/** Attempt to flush all pending answers to the server */
export const flushPendingAnswers = async (
  submitFn: (input: { sessionId: string; questionId: string; selectedOptionId: string; timeSpentMs: number; confidenceLevel?: 1 | 2 | 3 }) => Promise<unknown>,
): Promise<{ synced: number; failed: number }> => {
  const pending = await getPendingAnswers()
  let synced = 0
  let failed = 0

  for (const entry of pending) {
    if (entry.retryCount >= MAX_RETRIES) {
      // Give up after MAX_RETRIES — remove to prevent infinite loop
      await removePendingAnswer(entry.input.sessionId, entry.input.questionId)
      failed++
      continue
    }

    try {
      await submitFn(entry.input as any)
      await removePendingAnswer(entry.input.sessionId, entry.input.questionId)
      synced++
    } catch {
      await incrementRetryCount(entry.input.sessionId, entry.input.questionId)
      failed++
    }
  }

  return { synced, failed }
}

/** Check if there are pending answers to sync */
export const hasPendingAnswers = async (): Promise<boolean> => {
  const count = await getPendingCount()
  return count > 0
}

/** Create a connectivity listener that auto-flushes on reconnect */
export const createConnectivityListener = (
  submitFn: Parameters<typeof flushPendingAnswers>[0],
  onSyncComplete?: (result: { synced: number; failed: number }) => void,
) => {
  const handleOnline = async () => {
    const hasPending = await hasPendingAnswers()
    if (hasPending) {
      const result = await flushPendingAnswers(submitFn)
      onSyncComplete?.(result)
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
    }
  }
}
