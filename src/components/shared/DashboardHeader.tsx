'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/lib/routes'
import { HeaderActions } from '@/components/layout/HeaderActions'

interface DashboardHeaderProps {
  userId?: string
}

export const DashboardHeader = ({ userId }: DashboardHeaderProps) => {
  const pathname = usePathname()

  const title = useMemo(() => {
    const safePath = pathname ?? '/dashboard'
    return getPageTitle(safePath)
  }, [pathname])

  return (
    <header className='flex items-center justify-between border-b border-border bg-card h-16 px-4'>
      <h1 className='font-display text-xl font-bold text-foreground'>
        {title}
      </h1>
      <HeaderActions userId={userId} />
    </header>
  )
}
