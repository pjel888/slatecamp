'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { DottedGridOverlay } from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

interface DashboardContentFrameProps {
  children: React.ReactNode
  userId: string
  isAdmin: boolean
}

export function DashboardContentFrame({
  children,
  userId,
  isAdmin,
}: DashboardContentFrameProps) {
  const pathname = usePathname() ?? ''
  const isQuizSessionPath = pathname.startsWith(
    `${ROUTES.dashboard.quiz}/session/`,
  )
  const isDashboardRoot = pathname === ROUTES.dashboard.root

  return (
    <div className='relative flex min-h-0 flex-1 flex-col'>
      {isDashboardRoot && (
        <>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dock-Lake-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-70'
          />
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-page-bg/20 via-page-bg/10 to-page-bg/70'
          />
          <DottedGridOverlay />
        </>
      )}
      <div className='relative z-10 flex min-h-0 flex-1 flex-col'>
        <Navbar isAdmin={isAdmin} />
        {!isQuizSessionPath && (
          <div>
            <DashboardHeader userId={userId} />
          </div>
        )}
        <main
          className={cn(
            'min-h-0 min-w-0 flex-1',
            isQuizSessionPath
              ? 'overflow-hidden bg-surface-focused'
              : isDashboardRoot
                ? 'overflow-y-auto bg-transparent'
                : 'overflow-y-auto bg-page-bg',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
