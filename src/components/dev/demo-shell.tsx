'use client'

import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
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
          <span className='flex h-5 items-center rounded-full bg-purple-100 px-2 text-[10px] font-semibold uppercase tracking-wider text-purple-600'>
            Dev Mode
          </span>
          <span className='text-xs font-medium text-foreground'>
            Go to Dashboard
          </span>
          <ArrowRight className='h-3 w-3 text-muted-foreground' />
        </a>
      </div>

      <DevToolbar
        connectionState='local'
        currentTier='max'
        effectiveTier='max'
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
