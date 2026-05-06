'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/lib/routes'
import { getCategoryHero } from '@/lib/category-hero-config'
import { HeaderActions } from '@/components/layout/HeaderActions'

interface DashboardHeaderProps {
  userId?: string
}

export const DashboardHeader = ({ userId }: DashboardHeaderProps) => {
  const pathname = usePathname()
  const safePath = pathname ?? '/dashboard'

  const title = useMemo(() => {
    const hero = getCategoryHero(safePath)
    return hero?.subtitle ?? getPageTitle(safePath)
  }, [safePath])

  return (
    <header className='flex items-center justify-between h-16 px-4'>
      <h1 className='font-display text-xl font-bold text-foreground'>
        {title}
      </h1>
      <HeaderActions userId={userId} />
    </header>
  )
}
