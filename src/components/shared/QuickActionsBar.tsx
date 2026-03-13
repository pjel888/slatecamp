'use client'

import { MessageSquare, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  {
    id: 'ai-chat',
    label: 'AI chat',
    icon: MessageSquare,
    ariaLabel: 'Open AI chat',
  },
  {
    id: 'quick-note',
    label: 'Quick note',
    icon: StickyNote,
    ariaLabel: 'Quick note',
  },
] as const

/**
 * Small floating bar for quick actions (AI chat, quick notes, etc.).
 * Icons only by default; each item expands on hover to show the label.
 */
export function QuickActionsBar() {
  return (
    <aside
      className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 sm:bottom-8'
      aria-label='Quick actions'
    >
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-sm border border-border/60 px-1 py-1',
          'bg-background/20 shadow-[0_0px_8px_rgba(0,0,0,0.12)] backdrop-blur-[10px]',
        )}
      >
        {QUICK_ACTIONS.map(({ id, label, icon: Icon, ariaLabel }) => (
          <button
            key={id}
            type='button'
            aria-label={ariaLabel}
            title={label}
            className={cn(
              'group flex h-[52px] w-[52px] shrink-0 items-center gap-2 overflow-hidden rounded-sm',
              'text-muted-foreground transition-[width] duration-400 hover:bg-muted hover:text-foreground',
              'hover:w-[135px]',
              'ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
            )}
          >
            <span className='flex shrink-0 items-center pl-4'>
              <Icon className='h-5 w-5' strokeWidth={1.5} />
            </span>
            <span className='whitespace-nowrap pr-4 text-[13px] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              {label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
