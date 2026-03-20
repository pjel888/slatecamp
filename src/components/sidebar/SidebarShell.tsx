'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useActiveSession } from '@/lib/context/active-session-context'
import { SidebarRail } from './SidebarRail'
import { SidebarOverlay } from './SidebarOverlay'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ROUTES } from '@/lib/constants/routes'
import type { UserTier } from '@/types/app'

// ---------------------------------------------------------------------------
// SidebarShell
// ---------------------------------------------------------------------------
// Client wrapper composing SidebarRail + SidebarOverlay + leave-session dialog.
// Renders as a React fragment (<>...</>) so the SidebarRail participates
// directly in the parent flex layout without nesting.
// ---------------------------------------------------------------------------

interface SidebarShellProps {
  isAdmin?: boolean
  isDevMode?: boolean
  userDisplay?: { name: string; avatarUrl: string | null }
  tier?: UserTier
}

export const SidebarShell = ({
  isAdmin,
  isDevMode,
  userDisplay,
  tier = 'free',
}: SidebarShellProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { activeSession: mode } = useActiveSession()
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveTarget, setLeaveTarget] = useState<string>(ROUTES.DASHBOARD)

  // -- Leave-session guard (preserves old Sidebar.tsx behavior) --------------
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (mode && href !== pathname) {
      e.preventDefault()
      setLeaveTarget(href)
      setLeaveDialogOpen(true)
    }
  }

  const handleConfirmLeave = () => {
    setLeaveDialogOpen(false)
    router.push(
      mode === 'review' ? `${ROUTES.REVIEW}?tab=review&exited=1` : leaveTarget,
    )
  }

  return (
    <>
      {/* Rail -- flex child in document flow (always 72px) */}
      <SidebarRail
        isAdmin={isAdmin}
        onBeforeNavigate={handleNavClick}
        userDisplay={userDisplay}
        tier={tier}
        isDevMode={isDevMode}
      />

      {/* Overlay -- position:fixed, outside flex flow */}
      <SidebarOverlay
        isAdmin={isAdmin}
        onBeforeNavigate={handleNavClick}
        userDisplay={userDisplay}
        tier={tier}
        isDevMode={isDevMode}
      />

      {/* Leave Session Dialog (preserved from old Sidebar.tsx lines 424-455) */}
      {mode && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-[380px] bg-white border-border"
          >
            <DialogTitle className="text-[#1A2332]">
              Are you sure you want to exit?
            </DialogTitle>
            <DialogDescription className="text-[#4A5568]">
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className="mt-4 gap-2 border-t border-border bg-[#F8F7F5] p-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setLeaveDialogOpen(false)}
                className="flex-1 sm:flex-initial border-border text-[#1A2332] hover:bg-white"
              >
                No, stay
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLeave}
                className="flex-1 sm:flex-initial bg-[#D64545] hover:bg-[#D64545]/90 text-white"
              >
                Yes, exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
