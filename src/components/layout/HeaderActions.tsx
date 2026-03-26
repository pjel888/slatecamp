'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlass, NotePencil } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Omnibar } from '@/components/shared/Omnibar'
import { QuickCaptureDrawer } from '@/components/notes/QuickCaptureDrawer'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useNoteContext } from '@/lib/context/note-context'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const iconButtonClass = cn(
  'flex items-center justify-center w-9 h-9 rounded-sm',
  'text-muted-foreground hover:bg-muted hover:text-foreground',
  'transition-colors duration-150',
)

interface HeaderActionsProps {
  userId?: string
}

export const HeaderActions = ({ userId }: HeaderActionsProps) => {
  const [omnibarOpen, setOmnibarOpen] = useState(false)
  const { openDrawer } = useNoteContext()

  // Keyboard shortcut: Ctrl/Cmd + Shift + N for quick note
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        openDrawer()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [openDrawer])

  return (
    <>
      <div className="flex items-center gap-1">
        {/* Search trigger — Omnibar handles its own Ctrl+K */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setOmnibarOpen(true)}
              className={iconButtonClass}
              aria-label="Search (Ctrl+K)"
            >
              <SCIcon icon={MagnifyingGlass} size="md" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-foreground text-white font-medium text-xs">
            Search
          </TooltipContent>
        </Tooltip>

        {/* Quick note trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => openDrawer()}
              className={iconButtonClass}
              aria-label="Quick note (Ctrl+Shift+N)"
            >
              <SCIcon icon={NotePencil} size="md" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-foreground text-white font-medium text-xs">
            Quick Note
          </TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <NotificationBell userId={userId} />
      </div>

      {/* Portaled overlays */}
      <Omnibar open={omnibarOpen} setOpen={setOmnibarOpen} />
      <QuickCaptureDrawer />
    </>
  )
}
