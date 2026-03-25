/** @deprecated Use quiz-v2/QuizShell instead (save state is managed internally by QuizShell in v2). This file will be removed in the next major version. */
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, WifiHigh, WifiSlash, CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface SaveIndicatorProps {
  status: SaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      setVisible(false)
      return
    }
    setVisible(true)
    if (status === 'saved') {
      const t = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(t)
    }
  }, [status])

  if (!visible) return null

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-opacity duration-300',
        status === 'saving' && 'text-zinc-400',
        status === 'saved' && 'text-emerald',
        status === 'error' && 'text-destructive',
        status === 'offline' && 'text-warning',
      )}
      aria-live="polite"
      aria-label={
        status === 'saving' ? 'Saving...' :
        status === 'saved' ? 'Saved' :
        status === 'error' ? 'Could not save — will retry' :
        'Offline — will sync when reconnected'
      }
    >
      {status === 'saving' && <SCIcon icon={CircleNotch} size="xs" className="animate-spin" />}
      {status === 'saved' && <SCIcon icon={CheckCircle} size="xs" />}
      {status === 'error' && <SCIcon icon={WifiSlash} size="xs" />}
      {status === 'offline' && <SCIcon icon={WifiSlash} size="xs" />}
      <span>
        {status === 'saving' && 'Saving'}
        {status === 'saved' && 'Saved'}
        {status === 'error' && 'Retrying save'}
        {status === 'offline' && 'Offline'}
      </span>
    </div>
  )
}
