'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getPageTitle } from '@/lib/routes'

export const DashboardHeader = () => {
  const pathname = usePathname()

  const title = useMemo(() => {
    const safePath = pathname ?? '/dashboard'
    return getPageTitle(safePath)
  }, [pathname])

  return (
    <header
      className={cn(
        'border-b border-slatecamp-border ',
        'h-16',
        'flex flex-row',
      )}
    >
      <div className='w-full flex max-w-[1200px] items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <p className='pl-2 text-xl font-semibold tracking-tight text-slatecamp-ink-subtle'>
            {title}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* header actions / profile slot */}
        </div>
      </div>
    </header>
  )
}
