'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType, SVGProps } from 'react'

interface PlaceholderItem {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

// Placeholder items for future features (AI chat, etc.)
const PLACEHOLDER_ITEMS: PlaceholderItem[] = [
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'assistant', label: 'Assistant', icon: Sparkles },
  { id: 'quick-actions', label: 'Quick', icon: Zap },
  { id: 'reference', label: 'Reference', icon: BookOpen },
  { id: 'help', label: 'Help', icon: HelpCircle },
]

export function BottomNav() {
  const [activeId, setActiveId] = useState<string | null>(null)

  function handleItemClick(id: string) {
    // Placeholder: will be implemented later
    setActiveId(id === activeId ? null : id)
  }

  return (
    <>
      {/* Floating Navigation Bar */}
      <nav
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-40',
          'flex items-center justify-center gap-1.5',
          'px-3 py-2.5',
          'bg-slatecamp-paper-snow/90 dark:bg-slatecamp-ink-slate-black/90',
          'backdrop-blur-xl backdrop-saturate-150',
          'border border-slatecamp-border/50 dark:border-slatecamp-border/30',
          'rounded-2xl',
          'shadow-[0_1px_3px_rgba(26,26,26,0.06),0_8px_24px_rgba(0,0,0,0.08)]',
          'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]',
          'transition-all duration-150 ease',
          // Responsive: hide on large screens where sidebar is visible
          'lg:hidden',
        )}
        style={{
          // Position with safe-area inset for mobile devices (iOS home indicator, etc.)
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          // Ensure it doesn't overflow on small screens and is properly centered
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        {PLACEHOLDER_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id

          return (
            <button
              key={id}
              onClick={() => handleItemClick(id)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[52px] h-12 rounded-xl',
                'transition-all duration-150 ease',
                'outline-none focus-visible:ring-2 focus-visible:ring-slatecamp-amber/50 focus-visible:ring-offset-2',
                'group',
                // Active state
                isActive
                  ? 'bg-slatecamp-ink-main dark:bg-slatecamp-ink-main text-slatecamp-paper-snow'
                  : 'text-slatecamp-ink-muted dark:text-slatecamp-ink-subtle',
                // Hover state (only when not active)
                !isActive &&
                  'hover:bg-slatecamp-paper-cool dark:hover:bg-slatecamp-ink-mauve-charcoal/30 hover:text-slatecamp-ink-main dark:hover:text-slatecamp-paper-snow',
              )}
              aria-label={label}
              type='button'
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className='absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slatecamp-amber' />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  'h-[20px] w-[20px] transition-all duration-150',
                  isActive && 'scale-105',
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />

              {/* Label (hidden on very small screens, shown on larger mobile) */}
              <span
                className={cn(
                  'text-[10px] font-medium mt-0.5 leading-tight',
                  'hidden sm:block',
                  'transition-opacity duration-150',
                  isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100',
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
