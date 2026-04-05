'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlass, NotePencil } from '@phosphor-icons/react/dist/ssr'
import { Omnibar } from '@/components/shared/Omnibar'
import { QuickCaptureDrawer } from '@/components/notes/QuickCaptureDrawer'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useNoteContext } from '@/lib/context/note-context'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

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
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setOmnibarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Search (Ctrl+K)"
            >
              <MagnifyingGlass aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Search
          </TooltipContent>
        </Tooltip>

        {/* Quick note trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => openDrawer()}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Quick note (Ctrl+Shift+N)"
            >
              <NotePencil aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
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
