// ─── Offline Quiz Database (Doc 6 §8) ───────────────────────────────────────
// IndexedDB schema for offline answer queuing and session caching

import { openDB, type DBSchema } from 'idb'
import type { SubmitAnswerInput, QuizAnswerState, QuestionForClient } from '@/types/quiz-config'

interface QuizOfflineDB extends DBSchema {
  'pending-answers': {
    key: string // `${sessionId}:${questionId}`
    value: {
      input: SubmitAnswerInput
      timestamp: number
      retryCount: number
    }
  }
  'cached-sessions': {
    key: string // sessionId
    value: {
      sessionId: string
      config: Record<string, unknown>
      questions: QuestionForClient[]
      answers: Record<string, QuizAnswerState>
      currentIndex: number
      timerElapsedMs: number
      updatedAt: number
    }
  }
}

const DB_NAME = 'slatecamp-quiz'
const DB_VERSION = 1

/** Get (or create) the offline database */
export const getDB = () =>
  openDB<QuizOfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending-answers')) {
        db.createObjectStore('pending-answers')
      }
      if (!db.objectStoreNames.contains('cached-sessions')) {
        db.createObjectStore('cached-sessions')
      }
    },
  })

// ─── Pending Answers ─────────────────────────────────────────────────────────

/** Queue an answer submission for when connectivity returns */
export const queuePendingAnswer = async (input: SubmitAnswerInput) => {
  const db = await getDB()
  const key = `${input.sessionId}:${input.questionId}`
  await db.put('pending-answers', {
    input,
    timestamp: Date.now(),
    retryCount: 0,
  }, key)
}

/** Get all pending answers */
export const getPendingAnswers = async () => {
  const db = await getDB()
  return db.getAll('pending-answers')
}

/** Remove a pending answer after successful sync */
export const removePendingAnswer = async (sessionId: string, questionId: string) => {
  const db = await getDB()
  await db.delete('pending-answers', `${sessionId}:${questionId}`)
}

/** Increment retry count for a pending answer */
export const incrementRetryCount = async (sessionId: string, questionId: string) => {
  const db = await getDB()
  const key = `${sessionId}:${questionId}`
  const existing = await db.get('pending-answers', key)
  if (existing) {
    await db.put('pending-answers', {
      ...existing,
      retryCount: existing.retryCount + 1,
    }, key)
  }
}

/** Get count of pending answers */
export const getPendingCount = async () => {
  const db = await getDB()
  return db.count('pending-answers')
}

// ─── Session Cache ──────────────────────────────────────────────────────────

/** Cache the current session state for recovery */
export const cacheSession = async (
  sessionId: string,
  data: Omit<QuizOfflineDB['cached-sessions']['value'], 'sessionId' | 'updatedAt'>,
) => {
  const db = await getDB()
  await db.put('cached-sessions', {
    ...data,
    sessionId,
    updatedAt: Date.now(),
  }, sessionId)
}

/** Get a cached session */
export const getCachedSession = async (sessionId: string) => {
  const db = await getDB()
  return db.get('cached-sessions', sessionId)
}

/** Remove a cached session (after successful completion) */
export const removeCachedSession = async (sessionId: string) => {
  const db = await getDB()
  await db.delete('cached-sessions', sessionId)
}

/** Clear all cached sessions older than 24 hours */
export const clearStaleSessions = async () => {
  const db = await getDB()
  const all = await db.getAll('cached-sessions')
  const staleThreshold = Date.now() - 24 * 60 * 60 * 1000

  for (const session of all) {
    if (session.updatedAt < staleThreshold) {
      await db.delete('cached-sessions', session.sessionId)
    }
  }
}
