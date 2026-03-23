'use client'

import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ToolPageLayoutProps {
  toolName: string
  form: React.ReactNode
  canvas: React.ReactNode
}

export const ToolPageLayout = ({ toolName, form, canvas }: ToolPageLayoutProps) => {
  return (
    <div className='mx-auto max-w-[1200px] w-full'>
      {/* Breadcrumb */}
      <nav
        className='flex items-center gap-1.5 text-[13px] text-muted-foreground mb-6'
        aria-label='Breadcrumb'
      >
        <Link
          href='/tools'
          className='hover:text-foreground transition-colors duration-150'
        >
          Tools
        </Link>
        <CaretRight size={12} weight='bold' className='text-muted-foreground/60' />
        <span className='text-foreground font-medium'>{toolName}</span>
      </nav>

      {/* Split layout */}
      <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 items-start'>
        {/* Left panel — form inputs */}
        <div
          className={cn(
            'w-full lg:w-[40%] overflow-y-auto',
          )}
        >
          {form}
        </div>

        {/* Right panel — 3D canvas (sticky on desktop) */}
        <div className='w-full lg:w-[60%] lg:sticky lg:top-24'>
          {canvas}
        </div>
      </div>
    </div>
  )
}
