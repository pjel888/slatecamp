'use client'

import { useMemo } from 'react'
import GradientImage from './GradientImage'

interface DashboardHeroProps {
  userName?: string
  readinessMomentum?: 'building' | 'steady' | 'strong'
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Good evening'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const MOMENTUM_TEXT: Record<'building' | 'steady' | 'strong', string> = {
  building: "Every session builds toward your goal. Ready to add one more?",
  steady: "Steady, consistent progress. You're heading in the right direction.",
  strong: "Great momentum. Each session is compounding into real readiness.",
}

export const DashboardHero = ({
  userName = 'there',
  readinessMomentum = 'building',
}: DashboardHeroProps) => {
  const greeting = useMemo(() => getGreeting(), [])
  const momentumText = MOMENTUM_TEXT[readinessMomentum]

  return (
    <div className='w-full rounded-sm relative h-[180px] shrink-0 mb-2 bg-zinc-950 border border-zinc-800 overflow-hidden'>
      {/* Animated Gradient Background */}
      <div className='absolute inset-0 z-0'>
        <GradientImage />
        <div className='absolute inset-0 bg-linear-to-t from-zinc-950/70 via-zinc-950/10 to-transparent' />
      </div>

      {/* Content */}
      <div className='absolute bottom-0 left-0 right-0 z-20 p-5 pb-6'>
        <p className='text-zinc-400 text-xs font-medium mb-1 tracking-wide'>
          {greeting}
        </p>
        <h1 className='text-white text-xl font-semibold tracking-tight leading-snug'>
          {userName.charAt(0).toUpperCase() + userName.slice(1)}.
        </h1>
        <p className='text-zinc-300/70 text-sm mt-1 leading-snug max-w-lg'>
          {momentumText}
        </p>
      </div>
    </div>
  )
}
