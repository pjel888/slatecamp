'use client'

import { usePathname } from 'next/navigation'
import { ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { DevToolbar } from './dev-toolbar'

export function DemoShell() {
  const pathname = usePathname()

  if (pathname.startsWith('/dashboard')) return null

  return (
    <>
      {/* Floating demo-mode pill */}
      <div className='fixed top-4 left-1/2 z-9999 -translate-x-1/2'>
        <a
          href='/dashboard'
          className='flex items-center gap-2.5 rounded-full border border-border/60 bg-background/80 px-4 py-2 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl'
        >
          <span className='flex h-5 items-center rounded-full bg-purple-100 px-2 text-[11px] font-semibold uppercase tracking-wider text-purple-600'>
            Dev Mode
          </span>
          <span className='text-xs font-medium text-foreground'>
            Go to Dashboard
          </span>
          <SCIcon icon={ArrowRight} size="xs" className='text-muted-foreground' />
        </a>
      </div>

      <DevToolbar
        connectionState='local'
        currentTier='institutional'
        effectiveTier='institutional'
        flags={{
          simulatedTier: null,
          bypass3dGate: true,
          bypassAiGate: true,
          bypassSrsGate: true,
        }}
      />
    </>
  )
}
