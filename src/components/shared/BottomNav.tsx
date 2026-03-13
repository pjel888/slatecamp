'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TransitionLink } from '@/components/shared/TransitionLink'
import {
  LayoutDashboard,
  Globe,
  Brain,
  FileText,
  BarChart3,
} from 'lucide-react'
import { useActiveSession } from '@/lib/context/active-session-context'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ComponentType, SVGProps } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

// Core navigation items for the floating bar (curated for quick access)
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/wiki', label: 'Wiki', icon: Globe },
  { href: '/dashboard/testing', label: 'Testing', icon: Brain },
  { href: '/dashboard/notes', label: 'Notes', icon: FileText },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeSession: mode } = useActiveSession()
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveTarget, setLeaveTarget] = useState<string>('/dashboard')

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (mode && href !== pathname) {
      e.preventDefault()
      setLeaveTarget(href)
      setLeaveDialogOpen(true)
    }
  }

  function handleConfirmLeave() {
    setLeaveDialogOpen(false)
    router.push(
      mode === 'review' ? '/dashboard/testing?tab=review&exited=1' : leaveTarget,
    )
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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <TransitionLink
              key={href}
              href={href}
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
              onBeforeNavigate={(e) => handleNavClick(e, href)}
              aria-label={label}
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
            </TransitionLink>
          )
        })}
      </nav>

      {/* Leave Session Dialog */}
      {mode && (
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className='sm:max-w-[380px] bg-slatecamp-paper border-slatecamp-border'
          >
            <DialogTitle className='text-slatecamp-ink-main'>
              Are you sure you want to exit?
            </DialogTitle>
            <DialogDescription className='text-slatecamp-ink-muted'>
              Your progress in this {mode === 'review' ? 'review' : 'quiz'} will
              not be saved. You can come back anytime.
            </DialogDescription>
            <DialogFooter className='mt-4 gap-2 border-t border-slatecamp-border bg-slatecamp-paper-cool p-4 sm:flex-row'>
              <Button
                variant='outline'
                onClick={() => setLeaveDialogOpen(false)}
                className='flex-1 sm:flex-initial border-slatecamp-border text-slatecamp-ink-main hover:bg-slatecamp-paper'
              >
                No, stay
              </Button>
              <Button
                variant='destructive'
                onClick={handleConfirmLeave}
                className='flex-1 sm:flex-initial bg-slatecamp-crimson-bright-red hover:bg-slatecamp-crimson-deep-red text-white'
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
