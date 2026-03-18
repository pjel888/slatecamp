'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { updateQuizSession } from '@/lib/actions/quiz'

// ─── LS helpers ──────────────────────────────────────────────────────────────

const LS_KEY = (sessionId: string) => `slatecamp_quiz_${sessionId}`

export function persistToLS(
  sessionId: string,
  state: {
    answers: Record<string, string>
    flags: string[]
    strikes: Record<string, string[]>
    currentIndex: number
  },
) {
  try {
    localStorage.setItem(
      LS_KEY(sessionId),
      JSON.stringify({ ...state, ts: Date.now() }),
    )
  } catch {
    /* quota exceeded — silently skip */
  }
}

export function clearLS(sessionId: string) {
  try {
    localStorage.removeItem(LS_KEY(sessionId))
  } catch {
    /* ignore */
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface UseQuizPersistenceOptions {
  sessionId: string
  getState: () => {
    answers: Record<string, string>
    flags: string[]
    strikes: Record<string, string[]>
    currentIndex: number
  }
}

export function useQuizPersistence({ sessionId, getState }: UseQuizPersistenceOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isOnline, setIsOnline] = useState(true)
  const pendingInteractions = useRef<(() => Promise<void>)[]>([])

  // ── Online/offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true)
      // Flush pending interactions on reconnect
      flushPending()
    }
    const onOffline = () => {
      setIsOnline(false)
      setSaveStatus('offline')
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── beforeunload: sync LS write ───────────────────────────────────────────
  useEffect(() => {
    const onUnload = () => {
      persistToLS(sessionId, getState())
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [sessionId, getState])

  // ── 10-second auto-save (CLAUDE.md mandate) ───────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const state = getState()
      // Always persist to LS synchronously
      persistToLS(sessionId, state)

      // Debounce DB write
      if (isOnline) {
        try {
          await updateQuizSession(sessionId, {
            current_question_index: state.currentIndex,
          })
        } catch {
          /* will retry next interval */
        }
      }
    }, 10_000)
    return () => clearInterval(interval)
  }, [sessionId, getState, isOnline])

  // ── Flush pending interactions ─────────────────────────────────────────────
  const flushPending = useCallback(async () => {
    while (pendingInteractions.current.length > 0) {
      const fn = pendingInteractions.current.shift()
      if (fn) {
        try {
          await fn()
        } catch {
          // Re-queue on failure
          if (fn) pendingInteractions.current.unshift(fn)
          break
        }
      }
    }
  }, [])

  const queueInteraction = useCallback((fn: () => Promise<void>) => {
    if (isOnline) {
      fn().catch(() => {
        pendingInteractions.current.push(fn)
      })
    } else {
      pendingInteractions.current.push(fn)
    }
  }, [isOnline])

  // ── Manual save trigger ────────────────────────────────────────────────────
  const saveNow = useCallback(() => {
    persistToLS(sessionId, getState())
  }, [sessionId, getState])

  return {
    saveStatus,
    setSaveStatus,
    isOnline,
    saveNow,
    queueInteraction,
    flushPending,
  }
}
