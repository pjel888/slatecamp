'use client'

import { useState } from 'react'
import { MessageSquare, StickyNote, Search, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Omnibar } from './Omnibar'
import { QuickNotePopup } from '../notes/QuickNotePopup'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'

const QUICK_ACTIONS = [
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    ariaLabel: 'Search articles',
  },
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
const DEFAULT_RIGHT = 620
const DEFAULT_BOTTOM = 32

export function QuickActionsBar() {
  const [omnibarOpen, setOmnibarOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const { style: floatStyle, onPointerDown: onDrag } =
    useDraggableFloatingPosition('quick-actions-bar', DEFAULT_RIGHT, DEFAULT_BOTTOM)

  const handleAction = (id: string) => {
    if (id === 'search') setOmnibarOpen(true)
    if (id === 'quick-note') setNotesOpen(true)
  }

  return (
    <>
      <aside
        className='z-50 flex items-center'
        style={floatStyle}
        aria-label='Quick actions'
      >
        <div
          className={cn(
            'flex items-center gap-0 rounded-sm border border-border/60 pl-0.5 pr-1 py-1',
            'bg-background/20 shadow-[0_0px_8px_rgba(0,0,0,0.12)] backdrop-blur-[10px]',
          )}
        >
          <div
            role='button'
            tabIndex={0}
            onPointerDown={onDrag}
            className='flex h-[52px] w-8 shrink-0 cursor-grab active:cursor-grabbing items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors touch-none'
            aria-label='Drag to move'
          >
            <GripVertical className='h-4 w-4' strokeWidth={2} />
          </div>
          <div className='flex items-center gap-1.5'>
            {QUICK_ACTIONS.map(({ id, label, icon: Icon, ariaLabel }) => (
              <button
                key={id}
                type='button'
                onClick={() => handleAction(id)}
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
        </div>
      </aside>

      <Omnibar open={omnibarOpen} setOpen={setOmnibarOpen} />
      <QuickNotePopup open={notesOpen} onOpenChange={setNotesOpen} />
    </>
  )
}
