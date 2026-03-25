/** @deprecated Use quiz-v2/QuizShell instead. This file will be removed in the next major version. */
'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface QuizOverlayProps {
  children: React.ReactNode
  className?: string
}

export function QuizOverlay({ children, className }: QuizOverlayProps) {
  // Lock body scroll when overlay is mounted
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col bg-surface-focused overflow-hidden',
        className,
      )}
      role="main"
      aria-label="Quiz session"
    >
      {children}
    </div>
  )
}
