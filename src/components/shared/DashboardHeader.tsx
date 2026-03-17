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
    <header className='flex items-center border-b border-border bg-white px-6 py-3'>
      <h1 className='text-xl font-semibold text-gray-900 tracking-tight'>
        {title}
      </h1>
    </header>
  )
}
