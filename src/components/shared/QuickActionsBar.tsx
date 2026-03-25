'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChatCircle,
  NotePencil,
  MagnifyingGlass,
  DotsSixVertical,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Omnibar } from './Omnibar'
import { QuickCaptureDrawer } from '../notes/QuickCaptureDrawer'
import { useNoteContext } from '@/lib/context/note-context'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import { toast } from '@/lib/hooks/use-toast'

const QUICK_ACTIONS = [
  {
    id: 'search',
    label: 'Search',
    icon: MagnifyingGlass,
    ariaLabel: 'Search articles',
    shortcut: 'K',
  },
  {
    id: 'ai-chat',
    label: 'AI Tutor',
    icon: ChatCircle,
    ariaLabel: 'Open AI tutor',
    shortcut: undefined,
  },
  {
    id: 'quick-note',
    label: 'Quick Note',
    icon: NotePencil,
    ariaLabel: 'Quick note',
    shortcut: 'N',
  },
] as const

const DEFAULT_RIGHT = 'center'
const DEFAULT_BOTTOM = 32

export function QuickActionsBar() {
  const [omnibarOpen, setOmnibarOpen] = useState(false)
  const { openDrawer } = useNoteContext()
  const { style: floatStyle, onPointerDown: onDrag, resetPosition } =
    useDraggableFloatingPosition('quick-actions-bar', DEFAULT_RIGHT, DEFAULT_BOTTOM)

  const handleAction = useCallback(
    (id: string) => {
      if (id === 'search') setOmnibarOpen(true)
      if (id === 'quick-note') openDrawer()
      if (id === 'ai-chat') {
        toast({
          title: 'AI Chat coming soon',
          description: 'The AI tutor will be available here in a future update.',
        })
      }
    },
    [openDrawer],
  )

  // Keyboard shortcut: Ctrl/Cmd + Shift + N for quick note
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        handleAction('quick-note')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleAction])

  return (
    <>
      <aside
        className="z-50 flex items-center"
        style={floatStyle}
        aria-label="Quick actions"
      >
        <div
          className={cn(
            'flex items-center gap-0 rounded-sm border border-border/50 pl-0.5 pr-1 py-1',
            'bg-background/80 shadow-md backdrop-blur-md',
            'transition-shadow duration-150 ease-out hover:shadow-lg',
          )}
        >
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {QUICK_ACTIONS.map(({ id, label, icon: Icon, ariaLabel }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleAction(id)}
                    aria-label={ariaLabel}
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-sm',
                      'text-muted-foreground transition-colors duration-150 ease-out',
                      'hover:bg-slate-blue-50 hover:text-primary',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    )}
                  >
                    <SCIcon icon={Icon} size="md" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className='bg-foreground text-white font-medium text-xs'>
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Drag handle + reset */}
          <div className="ml-0.5 flex flex-col border-l border-border/40">
            <div
              role="button"
              tabIndex={0}
              onPointerDown={onDrag}
              className={cn(
                'flex h-[22px] w-7 shrink-0 cursor-grab items-center justify-center',
                'text-muted-foreground/60 transition-colors duration-150 hover:text-muted-foreground',
                'active:cursor-grabbing touch-none',
              )}
              aria-label="Drag to reposition"
            >
              <SCIcon icon={DotsSixVertical} size="xs" />
            </div>
            <button
              type="button"
              onClick={resetPosition}
              className={cn(
                'flex h-[22px] w-7 shrink-0 items-center justify-center',
                'text-muted-foreground/60 transition-colors duration-150 hover:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              )}
              aria-label="Reset position"
              title="Reset position"
            >
              <SCIcon icon={ArrowCounterClockwise} size="xs" />
            </button>
          </div>
        </div>
      </aside>

      {/* Portaled dialogs */}
      <Omnibar open={omnibarOpen} setOpen={setOmnibarOpen} />
      <QuickCaptureDrawer />
    </>
  )
}
