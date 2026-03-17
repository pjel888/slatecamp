'use client'

import { useEffect, useState } from 'react'
import { Check, Wifi, WifiOff, Loader2 } from 'lucide-react'
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
        'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-opacity duration-300',
        status === 'saving' && 'text-zinc-400',
        status === 'saved' && 'text-green-600',
        status === 'error' && 'text-red-500',
        status === 'offline' && 'text-amber-600',
      )}
      aria-live="polite"
      aria-label={
        status === 'saving' ? 'Saving...' :
        status === 'saved' ? 'Saved' :
        status === 'error' ? 'Save failed' :
        'Offline — will sync when reconnected'
      }
    >
      {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'saved' && <Check className="h-3 w-3" />}
      {status === 'error' && <WifiOff className="h-3 w-3" />}
      {status === 'offline' && <WifiOff className="h-3 w-3" />}
      <span>
        {status === 'saving' && 'Saving'}
        {status === 'saved' && 'Saved'}
        {status === 'error' && 'Save failed'}
        {status === 'offline' && 'Offline'}
      </span>
    </div>
  )
}
