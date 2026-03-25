'use client'

import { useState } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PreviewAreaProps {
  children: React.ReactNode
  className?: string
}

export const PreviewArea = ({ children, className }: PreviewAreaProps) => {
  const [isDark, setIsDark] = useState(false)

  return (
    <div
      className={cn(
        'relative border border-border rounded-md min-h-[180px] flex items-center justify-content-center p-8',
        isDark
          ? 'bg-[#1a1a2e] [background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)]'
          : 'bg-card [background-image:radial-gradient(circle,#e0ded8_1px,transparent_1px)]',
        '[background-size:20px_20px]',
        className,
      )}
    >
      {/* Theme toggle */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-sm border transition-colors duration-150 cursor-pointer',
            isDark
              ? 'bg-white/10 border-white/20 text-white/60 hover:text-white hover:bg-white/15'
              : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
          aria-label={isDark ? 'Switch to light preview' : 'Switch to dark preview'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" weight="fill" /> : <Moon className="w-3.5 h-3.5" weight="fill" />}
        </button>
      </div>

      {/* Preview content */}
      <div className={cn('flex items-center justify-center w-full', isDark && '[&_*]:text-zinc-100')}>
        {children}
      </div>
    </div>
  )
}
