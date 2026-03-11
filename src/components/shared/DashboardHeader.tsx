'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ClipboardList,
  X,
} from 'lucide-react'
import { useBreadcrumb } from '@/lib/context/breadcrumb-context'
import { useActiveSession } from '@/lib/context/active-session-context'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/** Path segment to display label; last segment is current page. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  quiz: 'Quiz',
  analytics: 'Analytics',
  library: 'Library',
  '3d-lab': '3D Lab',
  settings: 'Settings',
  sessions: 'Sessions',
  review: 'Review',
  new: 'New',
  summary: 'Summary',
  billing: 'Billing',
  developer: 'Dev Settings',
  marketplace: 'Marketplace',
}

function getBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  // Skip "dashboard" so breadcrumbs show pages as standalone (e.g. "Analytics" not "Dashboard > Analytics")
  const start = segments[0] === 'dashboard' ? 1 : 0
  if (start >= segments.length) return []
  const crumbs: { href: string; label: string }[] = []
  const uuidLike = /^[0-9a-f-]{20,}$/i
  let href = start === 1 ? '/dashboard' : ''
  for (let i = start; i < segments.length; i++) {
    href += (href ? '/' : '') + segments[i]
    let label = SEGMENT_LABELS[segments[i]]
    if (label == null)
      label = uuidLike.test(segments[i]) ? 'Session' : segments[i]
    crumbs.push({ href, label })
  }
  return crumbs
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { breadcrumbs: customCrumbs } = useBreadcrumb() ?? {}
  const { activeSession: mode } = useActiveSession()
  const inQuizMode = mode !== null
  const crumbs = inQuizMode ? null : (customCrumbs ?? getBreadcrumbs(pathname))
  const showBack = !inQuizMode && crumbs && crumbs.length > 1
  const [exitDialogOpen, setExitDialogOpen] = useState(false)

  function handleConfirmExit() {
    setExitDialogOpen(false)
    if (mode === 'review') {
      router.push(ROUTES.REVIEW_EXITED)
    } else {
      router.push(ROUTES.DASHBOARD)
    }
  }

  return (
    <>
      <header className='sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-background/95 px-4 backdrop-blur-sm'>
        {showBack && (
          <button
            type='button'
            onClick={() => router.back()}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
            aria-label='Go back'
          >
            <ChevronLeft className='h-5 w-5' strokeWidth={1.5} />
          </button>
        )}
        {mode && (
          <div className='flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1'>
            {mode === 'review' ? (
              <BookOpen
                className='h-3.5 w-3.5 text-muted-foreground'
                strokeWidth={1.5}
              />
            ) : (
              <ClipboardList
                className='h-3.5 w-3.5 text-muted-foreground'
                strokeWidth={1.5}
              />
            )}
            <span className='text-xs font-medium text-foreground'>
              {mode === 'review' ? 'Review mode' : 'Quiz mode'}
            </span>
          </div>
        )}
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label='Breadcrumb'
            className='flex min-w-0 flex-1 items-center gap-1 text-sm'
          >
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1
              return (
                <span key={crumb.href} className='flex items-center gap-1'>
                  {i > 0 && (
                    <ChevronRight
                      className='h-4 w-4 shrink-0 text-muted-foreground/60'
                      strokeWidth={1.5}
                    />
                  )}
                  {isLast ? (
                    <span className='truncate font-medium text-foreground'>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className='truncate text-muted-foreground transition-colors hover:text-foreground'
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              )
            })}
          </nav>
        )}
        {mode && (
          <>
            <div className='min-w-0 flex-1' aria-hidden='true' />
            <button
              type='button'
              onClick={() => setExitDialogOpen(true)}
              className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger text-white transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2'
              aria-label={mode === 'review' ? 'Exit Review' : 'Exit Quiz'}
              title={mode === 'review' ? 'Exit Review' : 'Exit Quiz'}
            >
              <X className='h-4 w-4' strokeWidth={2.5} />
            </button>
          </>
        )}
      </header>

      {mode && (
        <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
          <DialogContent showCloseButton={false} className='sm:max-w-[380px]'>
            <DialogTitle>Are you sure you want to exit?</DialogTitle>
            <DialogDescription>
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className='mt-4 gap-2 border-t border-border bg-muted/30 p-4 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setExitDialogOpen(false)}
                className='flex-1 sm:flex-initial'
              >
                No, stay
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmExit}
                className='flex-1 sm:flex-initial'
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
