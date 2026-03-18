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

function getContextualCopy(momentum: 'building' | 'steady' | 'strong'): string {
  const hour = new Date().getHours()
  if (hour < 5) {
    return momentum === 'strong'
      ? 'Late session? Even one question moves the needle.'
      : 'Burning the midnight oil. Keep it short — quality over quantity.'
  }
  if (hour < 12) {
    return momentum === 'strong'
      ? "Morning sessions build real momentum. You're on a streak."
      : momentum === 'steady'
      ? 'Good time for a focused session. What should we tackle?'
      : "A morning session hits different. Let's get started."
  }
  if (hour < 17) {
    return momentum === 'strong'
      ? 'Afternoon check-in. Keep compounding that readiness.'
      : momentum === 'steady'
      ? "Solid afternoon for a session. You've been consistent."
      : 'Good time to cover some ground. Pick a subject and go.'
  }
  // evening
  return momentum === 'strong'
    ? "Evening sessions compound. You're building something real."
    : momentum === 'steady'
    ? 'Evening study sticks. Even 10 questions count today.'
    : 'Evening session? Keep it focused. One subject, 10 questions.'
}

export const DashboardHero = ({
  userName = 'there',
  readinessMomentum = 'building',
}: DashboardHeroProps) => {
  const greeting = useMemo(() => getGreeting(), [])
  const momentumText = useMemo(() => getContextualCopy(readinessMomentum), [readinessMomentum])

  return (
    <div className='w-full rounded-sm relative h-[120px] shrink-0 mb-2 bg-[#1B3FC4] overflow-hidden'>
      {/* Animated Gradient Background */}
      {/* <div className='absolute inset-0 z-0'>
        <GradientImage />
        <div className='absolute inset-0 bg-linear-to-t from-zinc-950/70 via-zinc-950/10 to-transparent' />
      </div> */}

      {/* Content */}
      <div className='absolute bottom-0 left-0 right-0 z-20 p-3'>
        <p className='font-dm-mono text-white/60 text-[11px] font-medium mb-1 uppercase tracking-[0.2em]'>
          {greeting}
        </p>
        <h1 className='font-display text-white text-2xl font-extrabold tracking-tight leading-snug'>
          {userName.charAt(0).toUpperCase() + userName.slice(1)}.
        </h1>
        <p className='text-white/70 text-sm mt-1 leading-snug max-w-lg line-clamp-1'>
          {momentumText}
        </p>
      </div>

      {/* Geometric brand decoration */}
      <svg
        className="absolute right-4 top-0 h-full w-1/3 opacity-[0.06] pointer-events-none select-none"
        viewBox="0 0 200 180"
        aria-hidden="true"
        focusable="false"
      >
        {/* Tall building */}
        <rect x="130" y="15" width="35" height="165" fill="white" />
        {/* Windows on tall building */}
        <rect x="138" y="25" width="8" height="8" fill="#1B3FC4" />
        <rect x="150" y="25" width="8" height="8" fill="#1B3FC4" />
        <rect x="138" y="42" width="8" height="8" fill="#1B3FC4" />
        <rect x="150" y="42" width="8" height="8" fill="#1B3FC4" />
        <rect x="138" y="59" width="8" height="8" fill="#1B3FC4" />
        <rect x="150" y="59" width="8" height="8" fill="#1B3FC4" />
        {/* Mid building */}
        <rect x="80" y="55" width="42" height="125" fill="white" />
        {/* Windows on mid building */}
        <rect x="88" y="65" width="7" height="7" fill="#1B3FC4" />
        <rect x="100" y="65" width="7" height="7" fill="#1B3FC4" />
        <rect x="112" y="65" width="7" height="7" fill="#1B3FC4" />
        {/* Short building */}
        <rect x="170" y="90" width="28" height="90" fill="white" />
        {/* Column/pillar accent */}
        <rect x="40" y="100" width="10" height="80" fill="white" />
        <rect x="56" y="100" width="10" height="80" fill="white" />
        <rect x="72" y="100" width="5" height="80" fill="white" />
        {/* Ground line */}
        <rect x="0" y="178" width="200" height="2" fill="white" />
      </svg>
    </div>
  )
}
