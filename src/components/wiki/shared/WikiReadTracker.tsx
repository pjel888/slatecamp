'use client'

import { useEffect, useRef } from 'react'
import { recordArticleRead, updateReadProgress } from '@/lib/actions/wiki-reads'

interface WikiReadTrackerProps {
  articleId: string
  scrollContainerId: string
  trailStepId?: string
}

/**
 * Tracks article read progress — scroll depth (read_pct) and time spent.
 * Records a read on mount, updates progress on visibility change / unmount.
 * Renders nothing — pure side-effect component.
 */
export const WikiReadTracker = ({
  articleId,
  scrollContainerId,
  trailStepId,
}: WikiReadTrackerProps) => {
  const readIdRef = useRef<string | null>(null)
  const startTimeRef = useRef(Date.now())
  const maxScrollPctRef = useRef(0)

  useEffect(() => {
    // Record the read on mount
    recordArticleRead({ articleId, trailStepId }).then(({ readId }) => {
      readIdRef.current = readId
    })

    const container = document.getElementById(scrollContainerId)

    let rafId: number | null = null
    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (!container) return
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight - container.clientHeight
        if (scrollHeight <= 0) return
        const pct = (scrollTop / scrollHeight) * 100
        if (pct > maxScrollPctRef.current) {
          maxScrollPctRef.current = pct
        }
      })
    }

    const flushProgress = () => {
      if (!readIdRef.current) return
      updateReadProgress({
        readId: readIdRef.current,
        readPct: maxScrollPctRef.current,
        timeSpentMs: Date.now() - startTimeRef.current,
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress()
      }
    }

    container?.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      container?.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      flushProgress()
    }
  }, [articleId, scrollContainerId, trailStepId])

  return null
}
