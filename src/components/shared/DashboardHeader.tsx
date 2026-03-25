'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { getPageTitle } from '@/lib/routes'

export const DashboardHeader = () => {
  const pathname = usePathname()

  const title = useMemo(() => {
    const safePath = pathname ?? '/dashboard'
    return getPageTitle(safePath)
  }, [pathname])

  return (
    <header className='flex items-center border-b border-border bg-white h-16'>
      <h1 className='font-display text-2xl font-extrabold text-[text-primary] tracking-tight px-2'>
        {title}
      </h1>
    </header>
  )
}
